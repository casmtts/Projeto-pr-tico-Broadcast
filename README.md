# SAAS Broadcast

Sistema SaaS de broadcast (disparo de mensagens) desenvolvido com React, TypeScript, Firebase e Material UI. O projeto permite que clientes gerenciem conexões, contatos e realizem disparos de mensagens de forma agendada.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Licença](https://img.shields.io/badge/licença-MIT-blue)
![PRs](https://img.shields.io/badge/PRs-bem%20vindos-brightgreen)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Testes](#-testes)
- [Convenções de Código](#-convenções-de-código)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

Broadcast é uma plataforma SaaS multi-tenant onde cada cliente autenticado possui seu próprio ambiente isolado. O sistema permite:

- Criar e gerenciar **conexões** (grupos de disparo)
- Adicionar e organizar **contatos** por conexão
- Criar **mensagens** e agendar disparos para contatos específicos
- Monitorar status das mensagens (rascunho, agendada, enviada, falha)

### Regras de Negócio Principais

- Sistema **multi-tenant**: cada cliente acessa apenas seus dados
- Conexões podem referenciar contatos de outras conexões
- Ao excluir uma conexão, **apenas as mensagens** são removidas (contatos permanecem)
- Mensagens agendadas são automaticamente processadas por Cloud Functions
- Tempo real em todas as listagens via Firestore

---

## ✨ Funcionalidades

### 🔐 Autenticação
- [x] Login/Registro com Email e Senha
- [x] Login social com Google
- [x] Verificação de email obrigatória
- [x] Proteção de rotas (usuário não autenticado)

### 🔗 Conexões
- [x] CRUD completo de conexões
- [x] Listagem em tempo real
- [x] Soft delete (arquivar/reativar)
- [x] Associação de contatos à conexão

### 👥 Contatos
- [x] CRUD completo de contatos
- [x] Listagem em tempo real
- [x] Dados: nome, telefone, email, observações
- [x] Validação de telefone e email

### 💬 Mensagens
- [x] Criação de mensagens para múltiplos contatos
- [x] Agendamento de disparos
- [x] Filtros por status e conexão
- [x] Status: rascunho, agendada, enviada, falha
- [x] Processamento automático via Cloud Functions
- [x] Tempo real na listagem

### 🎨 Interface
- [x] Design responsivo
- [x] Tema Material UI personalizado
- [x] Feedback visual (loading, erros, confirmações)
- [x] Estados vazios e de erro tratados

---

## 🚀 Tecnologias Utilizadas

### Frontend (Pasta `/web`)
| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| React | 18.3+ | Biblioteca UI |
| TypeScript | 5.5+ | Tipagem estática |
| Vite | 5.3+ | Bundler e dev server |
| Material UI | 5.16+ | Componentes React |
| Tailwind CSS | 3.x | Estilização utilitária |
| React Router | 6.24+ | Roteamento SPA |
| Firebase | 10.12+ | SDK cliente |
| Zod | 3.23+ | Validação de esquemas |
| date-fns | 3.6+ | Manipulação de datas |

### Backend (Pasta `/functions`)
| Tecnologia | Descrição |
|-----------|-----------|
| Firebase Functions | Cloud Functions (Node.js) |
| Firebase Admin SDK | Acesso privilegiado ao Firestore |
| TypeScript | Tipagem estática |

### Infraestrutura
| Serviço | Uso |
|---------|-----|
| Firebase Auth | Autenticação de usuários |
| Cloud Firestore | Banco de dados NoSQL tempo real |
| Cloud Functions | Cron jobs e triggers |
| Firebase Hosting | Hospedagem |

---

## Variáveis de ambiente (frontend)

Crie `web/.env` ou `web/.env.local` com os valores do console Firebase (Project settings):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
