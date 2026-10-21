<script>
  import { onMount } from 'svelte';
  import { getServices } from '$lib/services.js';

  let services = [];
  let loading = true;
  let error = '';
  let search = '';

  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getServices({ search });
      services = result.items;
    } catch (exception) {
      error = exception.message || 'Não foi possível carregar os serviços.';
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<svelte:head><title>Serviços | Prover</title></svelte:head>

<section class="page-stack"><div class="page-actions"><div><p class="muted">Catálogo da clínica</p><h2>Serviços</h2></div><button class="primary-button compact">+ Novo serviço</button></div><div class="toolbar"><input aria-label="Buscar serviço" bind:value={search} on:keydown={(event) => event.key === 'Enter' && load()} placeholder="Buscar por nome..." /><button class="secondary-button compact" on:click={load}>Buscar</button></div>{#if error}<div class="notice error-notice">{error}</div>{:else if loading}<div class="panel empty-state">Carregando serviços...</div>{:else if services.length === 0}<div class="panel empty-state">Nenhum serviço encontrado.</div>{:else}<div class="panel table-wrap"><table><thead><tr><th>Nome</th><th>Categoria</th><th>Duração</th><th>Preço</th><th>Status</th></tr></thead><tbody>{#each services as service}<tr><td><strong>{service.name}</strong></td><td>{service.category || 'Sem categoria'}</td><td>{service.duration_minutes || service.duration || '-'} min</td><td>{service.price != null ? `R$ ${Number(service.price).toFixed(2).replace('.', ',')}` : '-'}</td><td><span class:inactive={!service.active} class="status-pill">{service.active === false ? 'Inativo' : 'Ativo'}</span></td></tr>{/each}</tbody></table></div>{/if}</section>
