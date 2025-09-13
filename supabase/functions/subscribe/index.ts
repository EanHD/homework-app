/**
 * Supabase Edge Function: subscribe (Supabase CLI deploy path)
 * Handles both authenticated and anonymous push subscriptions
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsify, preflight } from "../_shared/cors.ts";

type SubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type RequestPayload = {
  subscription: SubscriptionPayload;
  user_id?: string; // Only present when user is authenticated
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

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return corsify(req, new Response('Method Not Allowed', { status: 405 }));
  }

  const PROJECT_URL = Deno.env.get('PROJECT_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
  if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
    return corsify(req, new Response('Missing Supabase env', { status: 500 }));
  }
  const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

  try {
    if (req.method === 'DELETE') {
      const { userId, error: authError } = await verifyAuthAndExtractUserId(req);
      
      const body = (await req.json()) as { endpoint?: string };
      if (!body.endpoint) {
        return corsify(req, new Response(JSON.stringify({ success: false, error: 'Missing endpoint' }), { status: 400 }));
      }

      // For DELETE, if user is authenticated, verify they own the subscription
      if (userId) {
        await supabase.from('push_subscriptions').delete().match({ 
          endpoint: body.endpoint, 
          user_id: userId 
        });
      } else {
        // Anonymous delete - only allow if no user_id is set
        await supabase.from('push_subscriptions').delete().match({ 
          endpoint: body.endpoint, 
          user_id: null 
        });
      }
      
      console.log('[subscribe][DELETE]', { 
        user: userId || 'anonymous', 
        endpoint: body.endpoint.slice(0, 24) + '...' 
      });
      
      return corsify(req, new Response(JSON.stringify({ success: true, message: 'Subscription deleted' }), { status: 200 }));
    }

    // Handle POST request
    const { userId, error: authError } = await verifyAuthAndExtractUserId(req);
    
    let body: RequestPayload;
    try {
      body = (await req.json()) as RequestPayload;
    } catch (e) {
      console.log('[subscribe] JSON parse error', String(e));
      return corsify(req, new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { status: 400 }));
    }

    // Validate request structure
    if (!body?.subscription?.endpoint || !body.subscription?.keys?.p256dh || !body.subscription?.keys?.auth) {
      console.log('[subscribe] Invalid subscription payload', { body });
      return corsify(req, new Response(JSON.stringify({ success: false, error: 'Invalid subscription payload' }), { status: 400 }));
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

    const row = {
      user_id: userId, // Use the verified user ID from JWT, or null for anonymous
      endpoint: body.subscription.endpoint,
      p256dh: body.subscription.keys.p256dh,
      auth: body.subscription.keys.auth,
    };

    // Delete existing subscription for this user/endpoint combination
    if (userId) {
      await supabase.from('push_subscriptions').delete().eq('user_id', userId);
    } else {
      // For anonymous, delete by endpoint only
      await supabase.from('push_subscriptions').delete().eq('endpoint', body.subscription.endpoint);
    }

    const { error } = await supabase.from('push_subscriptions').insert(row);
    if (error) {
      console.log('[subscribe] insert error', { message: error.message });
      return corsify(req, new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 }));
    }

    console.log('[subscribe][POST] saved', {
      user: userId || 'anonymous',
      endpoint: body.subscription.endpoint.slice(0, 32) + '...',
      origin: req.headers.get('origin') || '',
    });

    return corsify(req, new Response(JSON.stringify({ 
      success: true, 
      message: 'Subscription saved',
      subscription_id: body.subscription.endpoint 
    }), { status: 200 }));

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.log('[subscribe] unhandled error', msg);
    return corsify(req, new Response(JSON.stringify({ success: false, error: msg }), { status: 500 }));
  }
});
