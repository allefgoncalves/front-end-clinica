<script>
  import { onMount } from 'svelte';
  import { downloadCsv } from '$lib/export.js';
  import { getSales } from '$lib/sales.js';

  let sales = [];
  let loading = true;
  let exporting = false;
  let error = '';
  let exportMessage = '';

  async function load() {
    loading = true;
    error = '';
    try {
      sales = await getSales();
    } catch (exception) {
      error = exception.message || 'Não foi possível carregar as vendas.';
    } finally {
      loading = false;
    }
  }

  function exportSales() {
    exporting = true;
    exportMessage = '';
    downloadCsv('vendas.csv', sales.map((sale) => ({
      id: sale.id,
      cliente: sale.client_name,
      total: sale.total,
      status: sale.status,
      pagamento: sale.payment_status,
      criado_em: sale.created_at
    })));
    exporting = false;
    exportMessage = 'Dados exportados.';
    setTimeout(() => { exportMessage = ''; }, 3000);
  }

  onMount(load);
</script>

<svelte:head><title>Vendas | Prover</title></svelte:head>

<section class="page-stack">
  <div class="page-actions"><div><p class="muted">Resultados comerciais</p><h2>Vendas</h2></div><div class="action-with-feedback"><button class="secondary-button compact" on:click={exportSales} disabled={exporting || loading || sales.length === 0}>{exporting ? 'Exportando...' : 'Exportar dados'} ↓</button>{#if exportMessage}<small class="export-success">{exportMessage}</small>{/if}</div></div>
  {#if error}<div class="notice error-notice">{error}</div>{:else if loading}<div class="panel empty-state">Carregando vendas...</div>{:else if sales.length === 0}<div class="panel empty-state">Nenhuma venda encontrada.</div>{:else}<div class="panel table-wrap"><table><thead><tr><th>Cliente</th><th>Total</th><th>Status</th><th>Pagamento</th><th>Data</th></tr></thead><tbody>{#each sales as sale}<tr><td><strong>{sale.client_name}</strong></td><td>R$ {Number(sale.total || 0).toFixed(2).replace('.', ',')}</td><td><span class="status-pill">{sale.status}</span></td><td>{sale.payment_status}</td><td>{new Date(sale.created_at).toLocaleDateString('pt-BR')}</td></tr>{/each}</tbody></table></div>{/if}
</section>
