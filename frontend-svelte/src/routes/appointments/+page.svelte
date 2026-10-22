<script>
  import { onMount } from 'svelte';
  import { cancelAppointment, createAppointment, getActiveServices, getAppointments, getClients, updateAppointment } from '$lib/appointments.js';

  const emptyForm = () => ({ client_id: '', service_id: '', scheduled_date: '', notes: '', status: 'pending' });
  let appointments = [];
  let clients = [];
  let services = [];
  let loading = true;
  let saving = false;
  let error = '';
  let search = '';
  let statusFilter = '';
  let showModal = false;
  let editingAppointment = null;
  let form = emptyForm();

  async function load() {
    loading = true;
    error = '';
    try { appointments = await getAppointments({ search, status: statusFilter }); }
    catch (exception) { error = exception.message || 'Não foi possível carregar os agendamentos.'; }
    finally { loading = false; }
  }

  async function loadOptions() {
    try {
      [clients, services] = await Promise.all([getClients(), getActiveServices()]);
    } catch (exception) {
      error = exception.message || 'Não foi possível carregar clientes e serviços.';
    }
  }

  function defaultDate() {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return date.toISOString().slice(0, 16);
  }

  function openCreate() {
    editingAppointment = null;
    form = { ...emptyForm(), scheduled_date: defaultDate(), client_id: clients[0]?.id || '', service_id: services[0]?.id || '' };
    showModal = true;
  }

  function openEdit(appointment) {
    editingAppointment = appointment;
    form = { client_id: appointment.client_id || '', service_id: appointment.service_id || '', scheduled_date: appointment.scheduled_date?.slice(0, 16) || '', notes: appointment.notes || '', status: appointment.status || 'pending' };
    showModal = true;
  }

  function closeModal() {
    if (!saving) showModal = false;
  }

  async function save() {
    const client = clients.find((item) => item.id === form.client_id);
    const service = services.find((item) => item.id === form.service_id);
    if (!client || !service || !form.scheduled_date) {
      error = 'Selecione cliente, serviço, data e horário.';
      return;
    }
    saving = true;
    error = '';
    const payload = { ...form, client_name: client.name, service_name: service.name, notes: form.notes.trim() || null };
    try {
      if (editingAppointment) {
        const updated = await updateAppointment(editingAppointment.id, payload);
        appointments = appointments.map((item) => item.id === updated.id ? updated : item);
      } else {
        const created = await createAppointment(payload);
        appointments = [created, ...appointments];
      }
      showModal = false;
    } catch (exception) {
      error = exception.message || 'Não foi possível salvar o agendamento.';
    } finally { saving = false; }
  }

  async function cancel(appointment) {
    if (!confirm(`Cancelar o agendamento de ${appointment.client_name}?`)) return;
    try {
      const result = await cancelAppointment(appointment.id);
      appointments = appointments.map((item) => item.id === appointment.id ? { ...item, status: result.status || 'cancelled' } : item);
    } catch (exception) { error = exception.message || 'Não foi possível cancelar o agendamento.'; }
  }

  function statusLabel(status) {
    return { pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Concluído' }[status] || status;
  }

  function handleKeydown(event) { if (event.key === 'Escape') closeModal(); }

  onMount(() => {
    load();
    loadOptions();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head><title>Agendamentos | Prover</title></svelte:head>

<section class="page-stack">
  <div class="page-actions"><div><p class="muted">Agenda da clínica</p><h2>Agendamentos</h2></div><button class="primary-button compact" on:click={openCreate}>+ Novo agendamento</button></div>
  <div class="toolbar"><input aria-label="Buscar agendamento" bind:value={search} on:keydown={(event) => event.key === 'Enter' && load()} placeholder="Buscar cliente ou serviço..." /><select aria-label="Filtrar status" bind:value={statusFilter} on:change={load}><option value="">Todos os status</option><option value="pending">Pendentes</option><option value="confirmed">Confirmados</option><option value="cancelled">Cancelados</option></select><button class="secondary-button compact" on:click={load}>Buscar</button></div>
  {#if error}<div class="notice error-notice">{error}</div>{/if}
  {#if loading}<div class="panel empty-state">Carregando agendamentos...</div>{:else if appointments.length === 0}<div class="panel empty-state">Nenhum agendamento encontrado.</div>{:else}<div class="panel table-wrap"><table><thead><tr><th>Cliente</th><th>Serviço</th><th>Data e hora</th><th>Status</th><th>Ações</th></tr></thead><tbody>{#each appointments as appointment}<tr><td><strong>{appointment.client_name}</strong></td><td>{appointment.service_name}</td><td>{new Date(appointment.scheduled_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td><td><span class:inactive={appointment.status === 'cancelled'} class="status-pill">{statusLabel(appointment.status)}</span></td><td><div class="row-actions"><button class="table-action" on:click={() => openEdit(appointment)} disabled={appointment.status === 'cancelled'}>Editar</button>{#if appointment.status !== 'cancelled'}<button class="table-action danger-action" on:click={() => cancel(appointment)}>Cancelar</button>{/if}</div></td></tr>{/each}</tbody></table></div>{/if}
</section>

{#if showModal}<div class="modal-overlay" role="presentation" on:click={(event) => event.target === event.currentTarget && closeModal()}><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title" tabindex="-1"><div class="modal-header"><div><p class="eyebrow">AGENDA</p><h2 id="appointment-modal-title">{editingAppointment ? 'Editar agendamento' : 'Novo agendamento'}</h2></div><button class="modal-close" aria-label="Fechar" on:click={closeModal}>×</button></div><form class="modal-form" on:submit|preventDefault={save}><label>Cliente *<select bind:value={form.client_id} required><option value="">Selecione o cliente</option>{#each clients as client}<option value={client.id}>{client.name}</option>{/each}</select></label><label>Serviço *<select bind:value={form.service_id} required><option value="">Selecione o serviço</option>{#each services as service}<option value={service.id}>{service.name} · {service.duration_minutes} min · R$ {Number(service.price).toFixed(2).replace('.', ',')}</option>{/each}</select></label><label>Data e hora *<input type="datetime-local" bind:value={form.scheduled_date} required /></label><label>Status<select bind:value={form.status}><option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label><label>Observações<textarea bind:value={form.notes} rows="3" placeholder="Observações opcionais"></textarea></label><div class="modal-actions"><button type="button" class="secondary-button" on:click={closeModal} disabled={saving}>Cancelar</button><button type="submit" class="primary-button" disabled={saving}>{saving ? 'Salvando...' : editingAppointment ? 'Salvar alterações' : 'Criar agendamento'}</button></div></form></div></div>{/if}
