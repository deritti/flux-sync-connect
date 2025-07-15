import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiConfiguration {
  service_name: string;
  base_url: string;
  auth_token?: string;
  app_token?: string;
  user_token?: string;
  enabled: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log('Iniciando sincronização automática de ativos...');

    // Buscar configurações das APIs
    const { data: configs, error: configError } = await supabaseClient
      .from('api_configurations')
      .select('*')
      .in('service_name', ['zcolab', 'glpi'])
      .eq('enabled', true);

    if (configError) {
      throw new Error(`Erro ao buscar configurações: ${configError.message}`);
    }

    const zcolabConfig = configs?.find(c => c.service_name === 'zcolab') as ApiConfiguration;
    const glpiConfig = configs?.find(c => c.service_name === 'glpi') as ApiConfiguration;

    if (!zcolabConfig || !glpiConfig) {
      throw new Error('Configurações do Zcolab ou GLPI não encontradas ou não habilitadas');
    }

    // Log inicial
    await supabaseClient
      .from('sync_logs')
      .insert({
        sync_type: 'asset',
        operation: 'sync',
        status: 'success',
        message: 'Iniciando sincronização automática de ativos GLPI → Zcolab'
      });

    // Inicializar sessão no GLPI
    console.log('Iniciando sessão no GLPI...');
    const glpiSessionResponse = await fetch(`${glpiConfig.base_url}/initSession`, {
      method: 'GET',
      headers: {
        'App-Token': glpiConfig.app_token || '',
        'Authorization': `user_token ${glpiConfig.user_token || ''}`,
        'Content-Type': 'application/json'
      }
    });

    if (!glpiSessionResponse.ok) {
      throw new Error(`Erro ao inicializar sessão GLPI: ${glpiSessionResponse.status}`);
    }

    const sessionData = await glpiSessionResponse.json();
    const sessionToken = sessionData.session_token;

    // Buscar ativos (computadores) do GLPI
    console.log('Buscando ativos do GLPI...');
    const assetsResponse = await fetch(`${glpiConfig.base_url}/Computer?range=0-50`, {
      method: 'GET',
      headers: {
        'App-Token': glpiConfig.app_token || '',
        'Session-Token': sessionToken,
        'Content-Type': 'application/json'
      }
    });

    if (!assetsResponse.ok) {
      throw new Error(`Erro ao buscar ativos do GLPI: ${assetsResponse.status}`);
    }

    const assets = await assetsResponse.json();
    console.log('Ativos encontrados:', assets.length);

    let successCount = 0;
    let errorCount = 0;

    // Processar cada ativo em background
    EdgeRuntime.waitUntil(
      (async () => {
        for (const asset of assets) {
          try {
            // Preparar dados do ativo para o Zcolab
            const assetData = {
              name: asset.name || `Ativo-${asset.id}`,
              serial: asset.serial || '',
              model: asset.computermodels_id || '',
              manufacturer: asset.manufacturers_id || '',
              status: asset.states_id || 1,
              location: asset.locations_id || '',
              user: asset.users_id || '',
              entity: asset.entities_id || '',
              comment: asset.comment || '',
              glpi_id: asset.id
            };

            console.log('Sincronizando ativo para Zcolab:', assetData);

            // Criar/atualizar ativo no Zcolab
            const zcolabResponse = await fetch(`${zcolabConfig.base_url}/assets`, {
              method: 'POST',
              headers: {
                'authtoken': zcolabConfig.auth_token || '',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(assetData)
            });

            if (zcolabResponse.ok) {
              const result = await zcolabResponse.json();
              successCount++;
              
              await supabaseClient
                .from('sync_logs')
                .insert({
                  sync_type: 'asset',
                  operation: 'create',
                  status: 'success',
                  message: `Ativo "${asset.name}" sincronizado automaticamente`,
                  details: `ID GLPI: ${asset.id} | ID Zcolab: ${result.id || 'N/A'}`,
                  source_id: asset.id?.toString(),
                  target_id: result.id?.toString()
                });
            } else {
              throw new Error(`HTTP ${zcolabResponse.status}: ${await zcolabResponse.text()}`);
            }
            
          } catch (error) {
            errorCount++;
            await supabaseClient
              .from('sync_logs')
              .insert({
                sync_type: 'asset',
                operation: 'create',
                status: 'error',
                message: `Erro na sincronização automática do ativo "${asset.name}"`,
                details: error instanceof Error ? error.message : 'Erro desconhecido',
                source_id: asset.id?.toString()
              });
          }
        }

        // Finalizar sessão GLPI
        await fetch(`${glpiConfig.base_url}/killSession`, {
          method: 'GET',
          headers: {
            'App-Token': glpiConfig.app_token || '',
            'Session-Token': sessionToken,
            'Content-Type': 'application/json'
          }
        });

        // Log final
        await supabaseClient
          .from('sync_logs')
          .insert({
            sync_type: 'asset',
            operation: 'sync',
            status: 'success',
            message: `Sincronização automática de ativos concluída: ${successCount} sucessos, ${errorCount} erros`
          });
      })()
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sincronização de ativos iniciada em background',
        assets_found: assets.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na sincronização de ativos:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})