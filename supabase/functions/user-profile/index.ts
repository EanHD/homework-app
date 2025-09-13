import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
}

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileRequest {
  display_name?: string;
}

// JWT verification helper
async function verifyJWTAndGetUser(authHeader: string | null, supabase: any) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'No valid authorization header provided', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('JWT verification failed:', error);
      return { error: 'Invalid or expired token', status: 401 };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Exception during JWT verification:', error);
    return { error: 'Token verification failed', status: 401 };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization');
    
    // Verify JWT and get user
    const authResult = await verifyJWTAndGetUser(authHeader, supabase);
    if (authResult.error) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const user = authResult.user;

    if (req.method === 'GET') {
      // Get user profile
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Database error fetching user profile:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch user profile' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Format response according to contract
        const userProfile: UserProfile = {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };

        return new Response(
          JSON.stringify(userProfile),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } catch (error) {
        console.error('Exception fetching user profile:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (req.method === 'PUT') {
      // Update user profile
      try {
        const body = await req.json() as UpdateProfileRequest;
        
        // Validate request body
        if (typeof body !== 'object' || body === null) {
          return new Response(
            JSON.stringify({ error: 'Invalid request body' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Check for valid update fields
        const allowedFields = ['display_name'];
        const updateFields: any = {};
        let hasValidField = false;

        for (const field of allowedFields) {
          if (field in body) {
            updateFields[field] = (body as any)[field];
            hasValidField = true;
          }
        }

        if (!hasValidField) {
          return new Response(
            JSON.stringify({ error: 'No valid fields to update' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Add updated_at timestamp
        updateFields.updated_at = new Date().toISOString();

        const { data: updatedProfile, error } = await supabase
          .from('users')
          .update(updateFields)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Database error updating user profile:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update user profile' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Format response according to contract
        const userProfile: UserProfile = {
          id: updatedProfile.id,
          email: updatedProfile.email,
          display_name: updatedProfile.display_name,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at
        };

        return new Response(
          JSON.stringify(userProfile),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } catch (error) {
        console.error('Exception updating user profile:', error);
        
        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError) {
          return new Response(
            JSON.stringify({ error: 'Malformed JSON in request body' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in user-profile function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  GET request:
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/user-profile' \
    --header 'Authorization: Bearer [YOUR_JWT_TOKEN]' \
    --header 'Content-Type: application/json'

  PUT request:
  curl -i --location --request PUT 'http://127.0.0.1:54321/functions/v1/user-profile' \
    --header 'Authorization: Bearer [YOUR_JWT_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{"display_name": "Updated Name"}'

*/