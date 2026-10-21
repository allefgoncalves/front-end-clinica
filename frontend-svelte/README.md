# Frontend Svelte

Nova versão do painel administrativo, preparada para deploy estático no GitHub Pages.

## Desenvolvimento

```bash
npm install
npm run dev
```

O proxy local encaminha `/api` para `http://127.0.0.1:8001`.

## API fake

Por padrão, o projeto usa uma API fake baseada em `src/lib/mock-data.json`. Ela funciona no navegador, não precisa de servidor e persiste alterações no `localStorage`.

Credenciais de teste:

```text
E-mail: admin@prover.com
Senha: 123456
```

Há dois clientes seedados: Mariana Costa e Rafael Lima. Para usar o backend real, configure `VITE_MOCK_API=false` e `VITE_API_URL`.

## Build

```bash
BASE_PATH=/nome-do-repositorio npm run build
```

O resultado fica em `build/`. Em produção, configure a variável `VITE_API_URL` nas variables do repositório GitHub com a URL pública da API.

## Estado da migração

- Login com JWT: implementado.
- Layout responsivo: implementado.
- Dashboard inicial: implementado.
- Consulta de serviços: implementada.
- Agendamentos e vendas: páginas-base preparadas.
- Produtos, carrinhos, promoções e metas: próximos módulos.
