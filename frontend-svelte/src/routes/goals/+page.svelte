<script>
  import { onMount } from 'svelte';
  import { createGoal, deleteGoal, getCurrentGoals, getGoals, getGoalsHistory, updateGoal } from '$lib/goals.js';

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const emptyForm = () => ({ title: '', description: '', type: 'revenue', target: '', unit: 'R$', year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  let goals = [];
  let currentGoals = [];
  let history = [];
  let loading = true;
  let saving = false;
  let error = '';
  let activeTab = 'current';
  let filters = { year: '', month: '', status: '' };
  let showModal = false;
  let editingGoal = null;
  let form = emptyForm();

  async function loadGoals() {
    loading = true;
    error = '';
    try {
      [goals, currentGoals, history] = await Promise.all([getGoals(filters), getCurrentGoals(), getGoalsHistory().then((data) => data?.history || [])]);
    } catch (exception) { error = exception.message || 'Não foi possível carregar as metas.'; }
    finally { loading = false; }
  }

  function openCreate() { editingGoal = null; form = emptyForm(); showModal = true; }

  function openEdit(goal) {
    editingGoal = goal;
    form = { title: goal.title || '', description: goal.description || '', type: goal.type || 'revenue', target: goal.target ?? '', unit: goal.unit || (goal.type === 'revenue' ? 'R$' : 'unidades'), year: goal.year || new Date().getFullYear(), month: goal.month || new Date().getMonth() + 1 };
    showModal = true;
  }

  function closeModal() { if (!saving) showModal = false; }

  async function save() {
    if (!form.title.trim() || form.target === '' || Number(form.target) <= 0) { error = 'Preencha título e um valor de meta maior que zero.'; return; }
    saving = true;
    error = '';
    const payload = { ...form, title: form.title.trim(), description: form.description.trim() || null, target: Number(form.target), year: Number(form.year), month: Number(form.month), unit: form.type === 'revenue' ? (form.unit || 'R$') : (form.unit || 'unidades') };
    try {
      if (editingGoal) await updateGoal(editingGoal.id, payload);
      else await createGoal(payload);
      showModal = false;
      await loadGoals();
    } catch (exception) { error = exception.message || 'Não foi possível salvar a meta.'; }
    finally { saving = false; }
  }

  async function remove(goal) {
    if (!confirm(`Excluir a meta "${goal.title}"?`)) return;
    try { await deleteGoal(goal.id); await loadGoals(); }
    catch (exception) { error = exception.message || 'Não foi possível excluir a meta.'; }
  }

  function progress(goal) { return Math.min(100, Math.max(0, Number(goal.progress ?? (goal.current / goal.target) * 100) || 0)); }
  function formatValue(goal, value) { return goal.type === 'revenue' || goal.unit === 'R$' ? `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}` : `${Number(value || 0).toLocaleString('pt-BR')} ${goal.unit || 'unidades'}`; }
  function statusLabel(status) { return { active: 'Ativa', completed: 'Concluída', cancelled: 'Cancelada' }[status] || status; }
  function handleKeydown(event) { if (event.key === 'Escape') closeModal(); }

  $: if (filters.year || filters.month || filters.status) loadGoals();

  onMount(() => {
    loadGoals();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head><title>Metas | Prover</title></svelte:head>

<section class="page-stack">
  <div class="page-actions"><div><p class="muted">Acompanhe seus objetivos</p><h2>Metas</h2></div><button class="primary-button compact" on:click={openCreate}>+ Nova meta</button></div>
  <div class="goal-tabs"><button class:active={activeTab === 'current'} on:click={() => activeTab = 'current'}>Mês atual</button><button class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>Histórico</button><button class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>Todas as metas</button></div>
  {#if error}<div class="notice error-notice">{error}</div>{/if}
  {#if loading}<div class="panel empty-state">Carregando metas...</div>
  {:else if activeTab === 'current'}<div class="goal-grid">{#each currentGoals as goal}<article class="goal-card"><div class="goal-card-top"><div><p class="eyebrow">{months[(goal.month || new Date().getMonth() + 1) - 1]} {goal.year || new Date().getFullYear()}</p><h3>{goal.title}</h3></div><button class="table-action" on:click={() => openEdit(goal)}>Editar</button></div><p class="muted goal-description">{goal.description || 'Meta operacional da clínica'}</p><div class="progress-track"><span style={`width: ${progress(goal)}%`}></span></div><div class="goal-values"><strong>{progress(goal).toFixed(0)}%</strong><span>{formatValue(goal, goal.current)} de {formatValue(goal, goal.target)}</span></div></article>{:else}<div class="panel empty-state">Nenhuma meta ativa para o mês atual.</div>{/each}</div>
  {:else if activeTab === 'history'}<div class="panel table-wrap"><table><thead><tr><th>Período</th><th>Receita atingida</th><th>Meta de receita</th><th>Progresso</th></tr></thead><tbody>{#each history as item}<tr><td>{item.month}/{item.year}</td><td>R$ {Number(item.revenue_achieved || 0).toFixed(2).replace('.', ',')}</td><td>R$ {Number(item.revenue_target || 0).toFixed(2).replace('.', ',')}</td><td>{Number(item.revenue_progress || 0).toFixed(0)}%</td></tr>{:else}<tr><td colspan="4" class="empty-cell">Nenhum histórico encontrado.</td></tr>{/each}</tbody></table></div>
  {:else}<div class="goal-filters"><select bind:value={filters.year}><option value="">Todos os anos</option>{#each [2025, 2026, 2027] as year}<option value={year}>{year}</option>{/each}</select><select bind:value={filters.month}><option value="">Todos os meses</option>{#each months as month, index}<option value={index + 1}>{month}</option>{/each}</select><select bind:value={filters.status}><option value="">Todos os status</option><option value="active">Ativas</option><option value="completed">Concluídas</option><option value="cancelled">Canceladas</option></select></div><div class="panel table-wrap"><table><thead><tr><th>Meta</th><th>Período</th><th>Progresso</th><th>Status</th><th>Ações</th></tr></thead><tbody>{#each goals as goal}<tr><td><strong>{goal.title}</strong><small class="table-subtitle">{goal.description || ''}</small></td><td>{goal.month}/{goal.year}</td><td>{progress(goal).toFixed(0)}% · {formatValue(goal, goal.current)} / {formatValue(goal, goal.target)}</td><td><span class:inactive={goal.status !== 'active'} class="status-pill">{statusLabel(goal.status)}</span></td><td><div class="row-actions"><button class="table-action" on:click={() => openEdit(goal)}>Editar</button><button class="table-action danger-action" on:click={() => remove(goal)}>Excluir</button></div></td></tr>{:else}<tr><td colspan="5" class="empty-cell">Nenhuma meta encontrada.</td></tr>{/each}</tbody></table></div>{/if}
</section>

{#if showModal}<div class="modal-overlay" role="presentation" on:click={(event) => event.target === event.currentTarget && closeModal()}><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" tabindex="-1"><div class="modal-header"><div><p class="eyebrow">OBJETIVOS</p><h2 id="goal-modal-title">{editingGoal ? 'Editar meta' : 'Nova meta'}</h2></div><button class="modal-close" aria-label="Fechar" on:click={closeModal}>×</button></div><form class="modal-form" on:submit|preventDefault={save}><label>Título *<input bind:value={form.title} required placeholder="Ex: Receita de outubro" /></label><label>Descrição<textarea bind:value={form.description} rows="2" placeholder="Descrição opcional"></textarea></label><div class="form-grid-two"><label>Tipo<select bind:value={form.type}><option value="revenue">Receita</option><option value="quantity">Quantidade</option><option value="custom">Personalizada</option></select></label><label>Unidade<input bind:value={form.unit} placeholder={form.type === 'revenue' ? 'R$' : 'unidades'} /></label></div><label>Valor da meta *<input type="number" min="0.01" step="0.01" bind:value={form.target} required /></label><div class="form-grid-two"><label>Ano<select bind:value={form.year}>{#each [2025, 2026, 2027] as year}<option value={year}>{year}</option>{/each}</select></label><label>Mês<select bind:value={form.month}>{#each months as month, index}<option value={index + 1}>{month}</option>{/each}</select></label></div><div class="modal-actions"><button type="button" class="secondary-button" on:click={closeModal} disabled={saving}>Cancelar</button><button type="submit" class="primary-button" disabled={saving}>{saving ? 'Salvando...' : editingGoal ? 'Salvar alterações' : 'Criar meta'}</button></div></form></div></div>{/if}
