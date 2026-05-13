# 💻 Sistema Desktop - Painel Administrativo

## Visão Geral
Sistema web para administradores gerenciarem toda a operação da clínica: serviços, produtos, agendamentos, carrinhos e promoções.

## Tecnologias
- React 18
- TypeScript
- Vite (build tool)
- React Router DOM
- Zustand (state management)
- Axios (HTTP client)
- Lucide React (ícones)
- Recharts (gráficos)

## Estrutura
```
sistema-desktop/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Services.tsx
│   │   ├── Products.tsx
│   │   ├── Appointments.tsx
│   │   ├── Carts.tsx
│   │   └── Promotions.tsx
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
└── package.json
```

## Instalação

```bash
cd sistema-desktop
yarn install
yarn dev
```
Acesse: http://localhost:5173

# Procedimentos para rodar a aplicação

## Procedimento Local (recomendado para desenvolvimento)
### Backend
  1. Configure o `.env` do backend:
  ```python
    CORS_ORIGINS = [
        "http://localhost:5173"
    ]
  ```
  2. Inicie o backend:

  ```bash
    uvicorn server:app --host 127.0.0.1 --port 8001 --reload
  ```
  3. Verifique se está rodando: http://localhost:8001/docs

### Frontend
  1. Configure o .env do frontend:

  ```bash
    VITE_API_URL=http://localhost:8001/api
  ```
  2. Inicie o frontend:

  ```bash
    npm run dev
  ```

  3. Acesse: http://localhost:5173

## Procedimento com Cloudflared (acesso externo)
### Backend (1º)
  1. Inicie o backend:
   
  ```bash
    uvicorn server:app --host 127.0.0.1 --port 8001 --reload
  ```
  2. Exponha o backend com cloudflared:

  ```bash
    cloudflared tunnel --url http://localhost:8001
  ```
  3. Copie a URL gerada (ex: https://xxx.trycloudflare.com)

  4. Configure o .env do frontend:
  ```bash
    VITE_API_URL=https://xxx.trycloudflare.com/api
  ```
### Frontend (2º)
  1. Inicie o frontend:
  
  ```bash
    npm run dev
  ```
  2. Exponha o frontend com cloudflared:

  ```bash
    cloudflared tunnel --url http://localhost:5173
  ```
  3. Copie a URL gerada (ex: https://yyy.trycloudflare.com)
  
  4. Configure o .env do backend com a URL do frontend para CORS:

  ```python
    CORS_ORIGINS = [
        "http://localhost:5173",
        "https://yyy.trycloudflare.com"
    ]
  ```
  5. Reinicie o backend

  6. Acesse o frontend pela URL do cloudflared: https://yyy.trycloudflare.com

### Observações importantes
  * No procedimento local, não é necessário cloudflared

  * No procedimento com cloudflared, as URLs mudam a cada execução

  * Sempre reinicie o backend após alterar o .env

  * O backend deve estar rodando antes do frontend em ambos os procedimentos

# Funcionalidades

### 1. Dashboard
- Estatísticas gerais
- Total de serviços
- Total de produtos
- Número de agendamentos
- Carrinhos ativos

### 2. Gerenciamento de Serviços
- Listar todos os serviços
- Criar novo serviço
- Editar serviço existente
- Desativar/ativar serviço
- Upload de imagem (base64)
- Categorização

### 3. Gerenciamento de Produtos
- CRUD completo de produtos
- Controle de estoque
- Categorias
- Imagens

### 4. Gerenciamento de Agendamentos
- Visualizar todos os agendamentos
- Filtrar por status
- Filtrar por data
- Ver detalhes do cliente
- Ver serviços agendados
- Cancelar agendamentos

### 5. Visualização de Carrinhos
- Ver carrinhos de todos os clientes
- Identificar clientes com items no carrinho
- **Enviar Combos Personalizados**:
  - Selecionar items
  - Aplicar desconto variável
  - Enviar para carrinho do cliente
- Análise de interesses (próxima funcionalidade)

### 6. Gestão de Promoções
- Criar promoções
- Definir descontos percentuais
- Criar combos
- Definir validade
- Ativar/desativar promoções

## Navegação

Menu lateral com:
- Dashboard
- Serviços
- Produtos
- Agendamentos
- Carrinhos
- Promoções

## Autenticação

Login com email/senha dos administradores. Token armazenado em localStorage.

## API Configuration

```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'https://booking-therapy-hub.preview.emergentagent.com/api',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Páginas Principais

### Login (`/login`)
- Formulário simples
- Validação de credenciais
- Redirecionamento automático

### Dashboard (`/`)
- Cards com estatísticas
- Layout em grid responsivo

### Serviços (`/services`)
- Tabela com lista de serviços
- Botões de ação (editar, deletar)
- Modal para criar/editar
- Upload de imagem

### Carrinhos (`/carts`)
- Lista de carrinhos com items
- Nome do cliente
- Items no carrinho
- Total
- Botão "Enviar Combo"
- **Funcionalidade Especial**: 
  - Criar combo personalizado
  - Aplicar desconto
  - Enviar direto para carrinho do cliente

## Design System

### Cores
```css
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--border: #334155;
--primary: #8b5cf6;
--text: #f1f5f9;
--text-muted: #94a3b8;
```

### Layout
- Sidebar fixa (250px)
- Conteúdo responsivo
- Cards com border-radius 16px
- Espaçamento consistente

## Build para Produção

```bash
yarn build
```

Arquivos gerados em `dist/`

## Deploy

### Opção 1: Static Hosting
```bash
yarn build
# Upload da pasta dist/ para:
# - Vercel
# - Netlify
# - GitHub Pages
```

### Opção 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
RUN yarn global add serve
CMD ["serve", "-s", "dist", "-l", "5173"]
```

## Variáveis de Ambiente

Criar `.env`:
```
VITE_API_URL=https://sua-api.com/api
```

Usar no código:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## Recursos Avançados (Próximos)

1. **Analytics**:
   - Gráficos de agendamentos por dia/mês
   - Serviços mais populares
   - Receita mensal

2. **Relatórios**:
   - Exportar CSV/PDF
   - Relatório de vendas
   - Relatório de agendamentos

3. **Notificações**:
   - Toast notifications
   - Alertas em tempo real
   - Som para novos agendamentos

4. **Chat**:
   - Comunicação com clientes
   - Sistema de mensagens

5. **Configurações**:
   - Horário de funcionamento
   - Feriados
   - Múltiplos massagistas

## Troubleshooting

### Erro de CORS
- Verificar configuração do backend
- Verificar se API aceita origin do frontend

### Build Error
```bash
rm -rf node_modules dist
yarn install
yarn build
```

### Port já em uso
```bash
# Alterar porta no vite.config.ts
server: {
  port: 5174
}
```

## Usuário Admin Padrão

Para criar um admin no MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@clinica.com" },
  { $set: { role: "admin" } }
);
```

## Interface Simplificada

Este sistema foi desenvolvido com foco em **simplicidade e usabilidade** para atendentes que não são programadores. 

- Interface intuitiva
- Botões grandes e claros
- Feedback visual
- Confirmações antes de ações destrutivas
