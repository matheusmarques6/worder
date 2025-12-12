import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';

// Module-level lazy client
let _supabase: SupabaseClient | null = null;
function getDb(): SupabaseClient {
  if (!_supabase) {
    _supabase = getSupabaseClient();
    if (!_supabase) throw new Error('Database not configured');
  }
  return _supabase;
}

// Proxy for backward compatibility
const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getDb() as any)[prop];
  }
});

const KLAVIYO_API_URL = 'https://a.klaviyo.com/api';

// Klaviyo API helper
async function klaviyoFetch(
  apiKey: string,
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${KLAVIYO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      revision: '2024-02-15',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.detail || 'Klaviyo API error');
  }

  return response.json();
}

// Connect Klaviyo account
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key é obrigatória' },
        { status: 400 }
      );
    }

    // Verify API key by fetching account info
    console.log('Verificando API Key do Klaviyo...');
    let accountData;
    try {
      accountData = await klaviyoFetch(apiKey, '/accounts/');
    } catch (fetchError: any) {
      console.error('Klaviyo API error:', fetchError);
      return NextResponse.json(
        { error: 'API Key inválida. Verifique se é uma Private API Key válida.' },
        { status: 401 }
      );
    }

    if (!accountData.data || accountData.data.length === 0) {
      return NextResponse.json(
        { error: 'Não foi possível obter informações da conta Klaviyo' },
        { status: 400 }
      );
    }

    const account = accountData.data[0];
    const accountName = account.attributes?.contact_information?.organization_name || 'Klaviyo Account';

    // Get or create organization
    let organizationId: string;
    
    // Try to get existing organization from Shopify stores
    const { data: stores } = await supabase
      .from('shopify_stores')
      .select('organization_id')
      .limit(1)
      .single();

    if (stores?.organization_id) {
      organizationId = stores.organization_id;
    } else {
      // Create default organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .upsert({
          name: accountName,
          plan: 'free',
        }, { onConflict: 'name' })
        .select('id')
        .single();

      if (orgError || !org) {
        // Generate a UUID if we can't create org
        organizationId = crypto.randomUUID();
      } else {
        organizationId = org.id;
      }
    }

    // Save to database (encrypt API key in production)
    const { error } = await supabase.from('klaviyo_accounts').upsert({
      organization_id: organizationId,
      api_key: apiKey, // TODO: Encrypt this in production
      account_id: account.id,
      account_name: accountName,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Database error:', error);
      // Continue even if database save fails - still return success
    }

    // Don't sync on connect - do it async or on demand
    // await syncKlaviyoData(organizationId, apiKey);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        name: accountName,
      },
    });
  } catch (error: any) {
    console.error('Klaviyo connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao conectar Klaviyo' },
      { status: 500 }
    );
  }
}

// Sync Klaviyo data
export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Organization ID required' },
      { status: 400 }
    );
  }

  try {
    // Get Klaviyo account
    const { data: account } = await supabase
      .from('klaviyo_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: 'Klaviyo not connected' },
        { status: 404 }
      );
    }

    await syncKlaviyoData(organizationId, account.api_key);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Klaviyo sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

async function syncKlaviyoData(organizationId: string, apiKey: string) {
  // Sync campaigns
  await syncCampaigns(organizationId, apiKey);

  // Sync flows
  await syncFlows(organizationId, apiKey);

  // Sync profiles/contacts
  await syncProfiles(organizationId, apiKey);

  // Update last sync timestamp
  await supabase
    .from('klaviyo_accounts')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('organization_id', organizationId);
}

async function syncCampaigns(organizationId: string, apiKey: string) {
  let cursor: string | null = null;
  
  do {
    const params = new URLSearchParams({
      'fields[campaign]': 'name,status,send_time,created_at',
      'page[size]': '50',
    });
    
    if (cursor) params.set('page[cursor]', cursor);

    const response = await klaviyoFetch(
      apiKey,
      `/campaigns/?${params.toString()}`
    );

    for (const campaign of response.data) {
      // Get campaign metrics
      const metricsResponse = await klaviyoFetch(
        apiKey,
        `/campaign-recipient-estimations/${campaign.id}/`
      );

      // Get campaign performance
      const statsResponse = await klaviyoFetch(
        apiKey,
        `/campaigns/${campaign.id}/campaign-values/?filter=equals(timeframe,"all_time")`
      );

      const stats = statsResponse.data?.attributes?.statistics || {};

      await supabase.from('campaign_metrics').upsert({
        organization_id: organizationId,
        klaviyo_campaign_id: campaign.id,
        name: campaign.attributes.name,
        subject: campaign.attributes.message?.subject || '',
        sent_at: campaign.attributes.send_time,
        recipients: metricsResponse.data?.attributes?.estimated_recipient_count || 0,
        delivered: stats.delivered || 0,
        opened: stats.opened || 0,
        clicked: stats.clicked || 0,
        bounced: stats.bounced || 0,
        unsubscribed: stats.unsubscribed || 0,
        revenue: parseFloat(stats.revenue || '0'),
      }, { onConflict: 'organization_id,klaviyo_campaign_id' });
    }

    cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') : null;
  } while (cursor);
}

async function syncFlows(organizationId: string, apiKey: string) {
  const response = await klaviyoFetch(
    apiKey,
    '/flows/?fields[flow]=name,status,created,updated'
  );

  for (const flow of response.data) {
    // Get flow metrics
    const statsResponse = await klaviyoFetch(
      apiKey,
      `/flows/${flow.id}/flow-values/?filter=equals(timeframe,"all_time")`
    );

    const stats = statsResponse.data?.attributes?.statistics || {};

    await supabase.from('flow_metrics').upsert({
      organization_id: organizationId,
      klaviyo_flow_id: flow.id,
      name: flow.attributes.name,
      status: flow.attributes.status,
      triggered: stats.recipients || 0,
      received: stats.received || 0,
      opened: stats.opened || 0,
      clicked: stats.clicked || 0,
      revenue: parseFloat(stats.revenue || '0'),
    }, { onConflict: 'organization_id,klaviyo_flow_id' });
  }
}

async function syncProfiles(organizationId: string, apiKey: string) {
  let cursor: string | null = null;
  let synced = 0;
  const batchSize = 100;
  
  do {
    const params = new URLSearchParams({
      'fields[profile]': 'email,phone_number,first_name,last_name,created,properties',
      'page[size]': batchSize.toString(),
    });
    
    if (cursor) params.set('page[cursor]', cursor);

    const response = await klaviyoFetch(
      apiKey,
      `/profiles/?${params.toString()}`
    );

    const contacts = response.data.map((profile: any) => ({
      organization_id: organizationId,
      email: profile.attributes.email,
      phone: profile.attributes.phone_number,
      first_name: profile.attributes.first_name,
      last_name: profile.attributes.last_name,
      klaviyo_profile_id: profile.id,
      custom_fields: profile.attributes.properties || {},
      source: 'klaviyo',
    }));

    if (contacts.length > 0) {
      await supabase.from('contacts').upsert(contacts, {
        onConflict: 'organization_id,email',
        ignoreDuplicates: false,
      });
    }

    synced += contacts.length;
    cursor = response.links?.next ? new URL(response.links.next).searchParams.get('page[cursor]') : null;

    // Limit initial sync to 10k profiles
    if (synced >= 10000) break;
  } while (cursor);
}

// Disconnect Klaviyo
export async function DELETE(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Organization ID required' },
      { status: 400 }
    );
  }

  try {
    await supabase
      .from('klaviyo_accounts')
      .delete()
      .eq('organization_id', organizationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
