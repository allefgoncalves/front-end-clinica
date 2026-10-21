<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { user, logout, isAuthenticated } from '$lib/auth.js';
  import { onMount } from 'svelte';
  import '../styles/global.css';

  let checkingSession = true;
  let sessionAllowed = false;
  const links = [
    { href: `${base}/`, label: 'Dashboard', icon: '▦' },
    { href: `${base}/services`, label: 'Serviços', icon: '✦' },
    { href: `${base}/products`, label: 'Produtos', icon: '□' },
    { href: `${base}/appointments`, label: 'Agendamentos', icon: '◷' },
    { href: `${base}/sales`, label: 'Vendas', icon: '↗' }
  ];

  onMount(() => {
    const isLoginPage = $page.url.pathname.endsWith('/login');

    if (isLoginPage) {
      checkingSession = false;
      return;
    }

    if (!isAuthenticated()) {
      goto(`${base}/login`, { replaceState: true });
      return;
    }

    sessionAllowed = true;
    checkingSession = false;
  });

  function signOut() {
    logout();
    goto(`${base}/login`);
  }
</script>

{#if checkingSession}
  <div class="boot">Carregando...</div>
{:else if $page.url.pathname.endsWith('/login')}
  <slot />
{:else if sessionAllowed}
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href={`${base}/`}>
        <span class="brand-mark">P</span>
        <span>Prover <small>ADMIN</small></span>
      </a>
      <nav aria-label="Navegação principal">
        {#each links as link}
          <a class:active={$page.url.pathname === link.href} href={link.href}>
            <span>{link.icon}</span>{link.label}
          </a>
        {/each}
      </nav>
      <div class="sidebar-footer">
        <span class="status-dot"></span> Sistema online
      </div>
    </aside>
    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">PAINEL ADMINISTRATIVO</p>
          <h1>{$page.url.pathname === `${base}/` ? 'Visão geral' : links.find((item) => item.href === $page.url.pathname)?.label || 'Painel'}</h1>
        </div>
        <div class="account">
          <div class="avatar">{$user?.name?.charAt(0) || 'A'}</div>
          <div class="account-copy">
            <strong>{$user?.name || 'Administrador'}</strong>
            <span>{$user?.email || 'Sessão ativa'}</span>
          </div>
          <button class="icon-button" title="Sair" aria-label="Sair" on:click={signOut}>↪</button>
        </div>
      </header>
      <slot />
    </main>
  </div>
{:else}
  <div class="boot">Redirecionando para o login...</div>
{/if}
