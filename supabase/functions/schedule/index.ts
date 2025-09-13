/**
 * Supabase Edge Function: schedule (Supabase CLI deploy path)
 * Handles authenticated and anonymous notification scheduling
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";

type SchedulePayload = {
  assignment_id: string;
  title: string;
  body: string;
  send_at: string; // ISO timestamp
  user_id?: string; // Only present when user is authenticated
  cancel?: boolean; // Optional cancel flag
  url?: string; // Optional URL (not persisted)
};

async function verifyAuthAndExtractUserId(req: Request): Promise<{ userId: string | null; error?: string }> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null }; // Anonymous request is allowed
  }

  const token = authHeader.substring(7);
  
  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
    return { userId: null, error: 'Missing Supabase config' };
  }

  try {
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { userId: null, error: 'Invalid or expired token' };
    }

    return { userId: user.id };
  } catch (e) {
    return { userId: null, error: 'Token verification failed' };
  }
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return corsify(req, pf);

  if (req.method !== 'POST') {
    return corsify(req, new Response('Method Not Allowed', { status: 405 }));
  }

  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
    return corsify(req, new Response('Missing Supabase env', { status: 500 }));
  }
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    const { userId, error: authError } = await verifyAuthAndExtractUserId(req);
    
    let body: SchedulePayload;
    try {
      body = (await req.json()) as SchedulePayload;
    } catch (e) {
      console.log('[schedule] JSON parse error', String(e));
      return corsify(req, new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { status: 400 }));
    }

    // Validate required fields (unless canceling)
    if (!body.cancel && (!body.assignment_id || !body.title || !body.body || !body.send_at)) {
      console.log('[schedule] Missing required fields', { body });
      return corsify(req, new Response(JSON.stringify({ success: false, error: 'Missing required fields: assignment_id, title, body, send_at' }), { status: 400 }));
    }

    if (body.cancel && !body.assignment_id) {
      return corsify(req, new Response(JSON.stringify({ success: false, error: 'assignment_id required for cancellation' }), { status: 400 }));
    }

    // If user_id is provided in payload, verify it matches the authenticated user
    if (body.user_id) {
      if (!userId) {
        return corsify(req, new Response(JSON.stringify({ success: false, error: 'Authentication required when user_id provided' }), { status: 401 }));
      }
      if (body.user_id !== userId) {
        return corsify(req, new Response(JSON.stringify({ success: false, error: 'user_id does not match authenticated user' }), { status: 403 }));
      }
    }

    // Validate send_at timestamp
    if (!body.cancel && body.send_at) {
      const sendAtDate = new Date(body.send_at);
      if (isNaN(sendAtDate.getTime())) {
        return corsify(req, new Response(JSON.stringify({ success: false, error: 'Invalid send_at timestamp' }), { status: 400 }));
      }
    }

    // Handle cancellation
    if (body.cancel) {
      const { error, count } = await supabase
        .from('scheduled_notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('assignment_id', body.assignment_id)
        .eq('user_id', userId) // Use verified user ID or null for anonymous
        .is('sent_at', null)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('[schedule] cancel error', { message: error.message });
        return corsify(req, new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 }));
      }

      console.log(`[schedule] canceled ${count ?? 0} notifications for assignment ${body.assignment_id}, user: ${userId || 'anonymous'}`);
      return corsify(req, new Response(JSON.stringify({ 
        success: true, 
        message: 'Notification canceled',
        count: count ?? 0 
      }), { status: 200 }));
    }

    // Handle scheduling
    const row = {
      user_id: userId, // Use verified user ID from JWT, or null for anonymous
      assignment_id: body.assignment_id,
      title: body.title,
      body: body.body,
      send_at: body.send_at,
      sent_at: null,
    };

    const { error, data } = await supabase
      .from('scheduled_notifications')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      const msg = String(error.message || '').toLowerCase();
      const isDuplicate = msg.includes('duplicate') || msg.includes('unique');
      
      if (isDuplicate) {
        // Update existing notification instead
        const { error: updateError } = await supabase
          .from('scheduled_notifications')
          .update({
            title: body.title,
            body: body.body,
            send_at: body.send_at,
            sent_at: null, // Reset sent_at in case it was previously sent
          })
          .eq('assignment_id', body.assignment_id)
          .eq('user_id', userId);

        if (updateError) {
          console.log('[schedule] update error', { message: updateError.message });
          return corsify(req, new Response(JSON.stringify({ success: false, error: updateError.message }), { status: 500 }));
        }

        console.log(`[schedule] updated existing notification for assignment ${body.assignment_id}, user: ${userId || 'anonymous'}`);
        return corsify(req, new Response(JSON.stringify({ 
          success: true, 
          message: 'Notification updated',
          scheduled_for: body.send_at 
        }), { status: 200 }));
      }

      console.log('[schedule] insert error', { message: error.message });
      return corsify(req, new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 }));
    }

    console.log(`[schedule] scheduled notification ${data.id} for assignment ${body.assignment_id}, user: ${userId || 'anonymous'}, send_at: ${body.send_at}`);
    return corsify(req, new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification scheduled',
      notification_id: data.id,
      scheduled_for: body.send_at 
    }), { status: 200 }));

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.log('[schedule] unhandled error', msg);
    return corsify(req, new Response(JSON.stringify({ success: false, error: msg }), { status: 500 }));
  }
});
