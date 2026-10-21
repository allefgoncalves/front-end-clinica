<script>
  import { onMount } from 'svelte';
  import { createProduct, deleteProduct, getProductCategories, getProducts, updateProduct } from '$lib/products.js';

  const emptyForm = () => ({ name: '', description: '', price: '', stock: '', category: '', batch: '', expiration_date: '', active: true });
  let products = [];
  let categories = [];
  let loading = true;
  let saving = false;
  let error = '';
  let search = '';
  let categoryFilter = '';
  let stockFilter = false;
  let showModal = false;
  let editingProduct = null;
  let form = emptyForm();

  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getProducts({ search, category: categoryFilter, lowStock: stockFilter });
      products = result.items;
    } catch (exception) {
      error = exception.message || 'Não foi possível carregar os produtos.';
    } finally {
      loading = false;
    }
  }

  async function loadCategories() {
    try { categories = await getProductCategories(); } catch { categories = []; }
  }

  function openCreate() {
    editingProduct = null;
    form = emptyForm();
    showModal = true;
  }

  function openEdit(product) {
    editingProduct = product;
    form = { name: product.name || '', description: product.description || '', price: product.price ?? '', stock: product.stock ?? '', category: product.category || '', batch: product.batch || '', expiration_date: product.expiration_date || '', active: product.active !== false };
    showModal = true;
  }

  function closeModal() {
    if (!saving) showModal = false;
  }

  async function save() {
    if (!form.name.trim() || form.price === '' || form.stock === '') {
      error = 'Preencha nome, preço e estoque.';
      return;
    }
    saving = true;
    error = '';
    const payload = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock), description: form.description.trim() || null, category: form.category || null, batch: form.batch.trim() || null, expiration_date: form.expiration_date || null };
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        products = products.map((product) => product.id === updated.id ? updated : product);
      } else {
        const created = await createProduct(payload);
        products = [created, ...products];
      }
      showModal = false;
      await loadCategories();
    } catch (exception) {
      error = exception.message || 'Não foi possível salvar o produto.';
    } finally {
      saving = false;
    }
  }

  async function remove(product) {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      products = products.filter((item) => item.id !== product.id);
    } catch (exception) {
      error = exception.message || 'Não foi possível excluir o produto.';
    }
  }

  async function toggleStatus(product) {
    try {
      const updated = await updateProduct(product.id, { active: !product.active });
      products = products.map((item) => item.id === updated.id ? updated : item);
    } catch (exception) {
      error = exception.message || 'Não foi possível alterar o status.';
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') closeModal();
  }

  onMount(() => {
    load();
    loadCategories();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head><title>Produtos | Prover</title></svelte:head>

<section class="page-stack">
  <div class="page-actions"><div><p class="muted">Catálogo e estoque</p><h2>Produtos</h2></div><button class="primary-button compact" on:click={openCreate}>+ Novo produto</button></div>
  <div class="toolbar product-toolbar"><input aria-label="Buscar produto" bind:value={search} on:keydown={(event) => event.key === 'Enter' && load()} placeholder="Buscar por nome..." /><select aria-label="Filtrar categoria" bind:value={categoryFilter} on:change={load}><option value="">Todas as categorias</option>{#each categories as category}<option value={category}>{category}</option>{/each}</select><label class="check-filter"><input type="checkbox" bind:checked={stockFilter} on:change={load} /> Estoque baixo</label><button class="secondary-button compact" on:click={load}>Buscar</button></div>
  {#if error}<div class="notice error-notice">{error}</div>{/if}
  {#if loading}<div class="panel empty-state">Carregando produtos...</div>
  {:else if products.length === 0}<div class="panel empty-state">Nenhum produto encontrado.</div>
  {:else}<div class="panel table-wrap"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead><tbody>{#each products as product}<tr><td><strong>{product.name}</strong>{#if product.description}<small class="table-subtitle">{product.description}</small>{/if}</td><td>{product.category || 'Sem categoria'}</td><td>R$ {Number(product.price || 0).toFixed(2).replace('.', ',')}</td><td><span class:stock-low={product.stock <= 8} class="stock-value">{product.stock}</span></td><td><button class:inactive={!product.active} class="status-pill status-button" on:click={() => toggleStatus(product)}>{product.active === false ? 'Inativo' : 'Ativo'}</button></td><td><div class="row-actions"><button class="table-action" on:click={() => openEdit(product)}>Editar</button><button class="table-action danger-action" on:click={() => remove(product)}>Excluir</button></div></td></tr>{/each}</tbody></table></div>{/if}
</section>

{#if showModal}<div class="modal-overlay" role="presentation" on:click={(event) => event.target === event.currentTarget && closeModal()}><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" tabindex="-1"><div class="modal-header"><div><p class="eyebrow">CATÁLOGO</p><h2 id="product-modal-title">{editingProduct ? 'Editar produto' : 'Novo produto'}</h2></div><button class="modal-close" aria-label="Fechar" on:click={closeModal}>×</button></div><form class="modal-form" on:submit|preventDefault={save}><label>Nome *<input bind:value={form.name} required placeholder="Nome do produto" /></label><label>Descrição<textarea bind:value={form.description} rows="2" placeholder="Descrição opcional"></textarea></label><div class="form-grid-two"><label>Preço (R$) *<input type="number" min="0" step="0.01" bind:value={form.price} required /></label><label>Estoque *<input type="number" min="0" step="1" bind:value={form.stock} required /></label></div><div class="form-grid-two"><label>Categoria<select bind:value={form.category}><option value="">Selecione</option>{#each categories as category}<option value={category}>{category}</option>{/each}<option value="Nova categoria">Nova categoria</option></select></label><label>Lote<input bind:value={form.batch} placeholder="Número do lote" /></label></div><div class="form-grid-two"><label>Data de validade<input type="date" bind:value={form.expiration_date} /></label><label class="checkbox-field"><input type="checkbox" bind:checked={form.active} /> Produto ativo</label></div><div class="modal-actions"><button type="button" class="secondary-button" on:click={closeModal} disabled={saving}>Cancelar</button><button type="submit" class="primary-button" disabled={saving}>{saving ? 'Salvando...' : editingProduct ? 'Salvar alterações' : 'Criar produto'}</button></div></form></div></div>{/if}
