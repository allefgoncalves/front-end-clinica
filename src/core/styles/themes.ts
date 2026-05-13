// src/core/styles/themes.ts
// ⚠️ CORES AGORA SÃO DEFINIDAS APENAS EM variables.css
// Este arquivo é mantido para compatibilidade futura mas NÃO é usado atualmente

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  colors: {
    background: '#7d9d7d',
    sidebar: '#f0eae2',
    sidebarBorder: '#e0d6cc',
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    navHover: '#e8e0d8',
    navActive: '#d1c4b8',
    accent: '#7d9d7d',
    accentSoft: '#9fb89f',
    logout: '#d1948c',
    success: '#6b8c6b',
    warning: '#e6b87e',
    danger: '#d1948c',
    info: '#89a9c4',
  }
};

export const darkTheme = {
  colors: {
    background: "#1a1e24",
    sidebar: "#24292f",
    sidebarBorder: "#2d333a",
    textPrimary: "#e6edf3",
    textSecondary: "#a0a8b3",
    navHover: "#2d333a",
    navActive: "#373e47",
    accent: "#8bab8b",
    accentSoft: "#6b8a6b",
    logout: "#d1948c", 
    success: '#6b8c6b',
    warning: '#e6b87e',
    danger: '#d1948c',
    info: '#89a9c4',
  }
};