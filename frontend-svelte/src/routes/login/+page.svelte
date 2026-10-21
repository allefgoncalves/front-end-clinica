<script>
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { login } from '$lib/auth.js';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function submit() {
    loading = true;
    error = '';
    try {
      await login(email, password);
      goto(`${base}/`);
    } catch (exception) {
      error = exception.message || 'Não foi possível entrar.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Entrar | Prover</title></svelte:head>

<main class="login-page">
  <section class="login-visual">
    <div class="visual-copy">
      <span class="brand-mark large">P</span>
      <p class="eyebrow">GESTÃO INTELIGENTE</p>
      <h1>Cuide da operação.<br /><em>O resto flui.</em></h1>
      <p>Um espaço único para acompanhar sua clínica, sua equipe e seus resultados.</p>
    </div>
  </section>
  <section class="login-panel">
    <div class="login-card">
      <p class="eyebrow">BEM-VINDO DE VOLTA</p>
      <h2>Entrar no painel</h2>
      <p class="muted">Use suas credenciais administrativas para continuar.</p>
      <form on:submit|preventDefault={submit}>
        <label for="email">E-mail</label>
        <input id="email" type="email" bind:value={email} placeholder="voce@clinica.com" required />
        <label for="password">Senha</label>
        <input id="password" type="password" bind:value={password} placeholder="••••••••" required />
        {#if error}<p class="form-error">{error}</p>{/if}
        <button class="primary-button" disabled={loading}>{loading ? 'Entrando...' : 'Acessar painel'} <span>→</span></button>
      </form>
    </div>
  </section>
</main>
