import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialize Supabase client
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (url && key && !url.includes('placeholder')) {
      supabase = createClient(url, key);
    }
  }
  return supabase;
}

// Login
export async function POST(request: NextRequest) {
  const client = getSupabase();
  if (!client) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up Supabase environment variables.' },
      { status: 503 }
    );
  }

  const { action, ...data } = await request.json();

  try {
    switch (action) {
      case 'login':
        return await handleLogin(client, data);
      case 'signup':
        return await handleSignup(client, data);
      case 'logout':
        return await handleLogout(client, data);
      case 'reset-password':
        return await handleResetPassword(client, data);
      case 'update-password':
        return await handleUpdatePassword(client, data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

async function handleLogin(supabase: SupabaseClient, { email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Get user profile and organization
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('id', data.user.id)
    .single();

  const response = NextResponse.json({
    user: data.user,
    profile,
    session: data.session,
  });

  // Set auth cookie
  response.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  response.cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return response;
}

async function handleSignup(
  supabase: SupabaseClient,
  {
    email,
    password,
    firstName,
    lastName,
    companyName,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  }
) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: companyName || `${firstName}'s Organization`,
      slug: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
      owner_id: authData.user.id,
    })
    .select()
    .single();

  if (orgError) {
    console.error('Org creation error:', orgError);
    // Don't fail signup, just log error
  }

  // Create user profile
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    organization_id: org?.id,
    role: 'admin',
  });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  return NextResponse.json({
    user: authData.user,
    session: authData.session,
    message: 'Account created successfully. Please check your email to verify your account.',
  });
}

async function handleLogout(supabase: SupabaseClient, { accessToken }: { accessToken: string }) {
  await supabase.auth.admin.signOut(accessToken);

  const response = NextResponse.json({ success: true });

  // Clear cookies
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');

  return response;
}

async function handleResetPassword(supabase: SupabaseClient, { email }: { email: string }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: 'Password reset email sent. Please check your inbox.',
  });
}

async function handleUpdatePassword(
  supabase: SupabaseClient,
  {
    accessToken,
    newPassword,
  }: {
    accessToken: string;
    newPassword: string;
  }
) {
  const { error } = await supabase.auth.admin.updateUserById(accessToken, {
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Password updated successfully' });
}

// GET - Get current user
export async function GET(request: NextRequest) {
  const client = getSupabase();
  if (!client) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: { user }, error } = await client.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Get profile and organization
  const { data: profile } = await client
    .from('users')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user, profile });
}
