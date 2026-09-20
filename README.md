# Sistema de Gerenciamento de Clínica Médica

API REST para gerenciamento de uma clínica médica, construída com Node.js, Express e Prisma. O projeto concentra fluxos essenciais de uma operação clínica, incluindo usuários com perfis de acesso, médicos, pacientes, agendamentos, prontuários, exames, notificações e controle de permissões.

A proposta do sistema é demonstrar uma base backend organizada para um domínio real, com autenticação JWT, autorização por papéis, persistência relacional, tratamento centralizado de erros, upload de arquivos e testes automatizados para rotas principais.

## Visão técnica

- **Backend:** Node.js, Express 5 e arquitetura por rotas, controllers, middlewares e repositórios.
- **Banco de dados:** Prisma ORM com SQLite no ambiente atual.
- **Segurança:** autenticação com JWT, hash de senhas com Argon2, Helmet e controle de acesso por perfil.
- **Arquivos:** upload de anexos com Multer.
- **Qualidade:** testes com Jest e Supertest.
- **Documentação:** endpoints detalhados em `API.md`.

## 🚀 Principais Funcionalidades

### 👥 Usuários e Perfis
- **Cadastro de usuários** com diferentes perfis:
  - `ADMIN`: acesso total ao sistema
  - `MEDICO`: acesso ao próprio cadastro, agendamentos e pacientes vinculados
  - `RECEPCIONISTA`: cadastro de pacientes, agendamentos, recebimentos, controle de estoque
  - `PACIENTE`: acesso ao próprio cadastro, agendamentos, prontuário e download de prescrições
- **Autenticação** com JWT
- **Tokens de refresh** para manter sessões ativas
- **Controle de acesso** baseado em perfis e propriedade de dados

### 📋 Agendamentos
- **Cadastro** de agendamentos com médico, paciente, data e hora
- **Edição** e **cancelamento** de agendamentos
- **Lista de agendamentos** com filtros por médico, paciente, data e status
- **Notificações** automáticas sobre novos agendamentos e cancelamentos
- **Integração** com calendário Google (opcional)

### 👨‍⚕️ Médicos
- **Cadastro de médicos** com informações completas (CRM, especialidade, etc.)
- **Dias de atendimento** configuráveis
- **Horários de atendimento** por dia
- **Visualização** de agendamentos por médico
- **Exibição** de médicos nas rotas públicas de agendamento

### 👥 Pacientes
- **Cadastro de pacientes** com informações completas (CPF, convênio, etc.)
- **Histórico completo** de atendimentos
- **Busca rápida** por CPF
- **Visualização** de agendamentos e prontuário por paciente

### 📝 Prontuário Médico
- **Histórico completo** de atendimentos do paciente
- **Registros de evolução** médica
- **Prescrições** com medicamentos, dosagens e orientações
- **Histórico de exames** realizados
- **Download de prescrições** pelo paciente
- **Marcação de download** de prescrições

### 💊 Exames
- **Cadastro de exames** com descrição e preço
- **Vínculo de exames** com prontuários
- **Upload de anexos** de exames (imagens, PDFs)
- **Download de anexos** de exames

### 📦 Estoque de Insumos
- **Controle de estoque** de materiais e insumos
- **Controle de entrada** (recebimento)
- **Controle de saída** (uso em procedimentos)
- **Alertas** quando estoque baixo

### 💰 Controle Financeiro
- **Controle de recebimentos** de atendimentos
- **Registro de pagamentos** por convênio ou particular
- **Histórico financeiro** por paciente

### 🔔 Notificações
- **Notificações automáticas** sobre novos agendamentos
- **Notificações de cancelamento**
- **Notificações de prontuário** registrado

## 📋 Requisitos

- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **SQLite** 3.3.0 ou superior

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/FelipeCaetanoSS/gerenciamento-clinica.git
cd gerenciamento-clinica
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
JWT_EXPIRES_IN=1h
UPLOAD_DIR=/data/uploads
```

### 4. Configure o banco de dados

Crie as tabelas e carregue os dados iniciais:

```bash
npx prisma db seed
```

### 5. Execute o servidor
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## 🔐 Autenticação e Perfis

### Rotas Públicas
Algumas rotas estão disponíveis sem autenticação:
- `/medicos` - Listagem de médicos
- `/agendamentos/disponivel` - Verificar disponibilidade de horários
- `/agendamentos/disponivel/medico/:medicoId` - Disponibilidade por médico

### Rotas Protegidas
Todas as outras rotas exigem token JWT no header `Authorization: Bearer <token>`.

### Perfis de Acesso
- `ADMIN`: acesso total
- `MEDICO`: acesso ao próprio cadastro, agendamentos e pacientes vinculados
- `RECEPCIONISTA`: cadastro de pacientes, agendamentos, recebimentos, estoque
- `PACIENTE`: acesso ao próprio cadastro, agendamentos, prontuário e download de prescrições

## 📂 Estrutura do Projeto

```
gerenciamento-clinica/
├── src/
│   ├── config/         # Configurações (database, jwt, variables, etc.)
│   ├── controllers/    # Handlers das rotas
│   ├── middlewares/    # Middlewares (autenticação, permissões, CORS, etc.)
│   ├── models/         # Modelos Mongoose
│   ├── routes/         # Definição das rotas
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Utilitários (geração de senhas, validações, etc.)
│   ├── app.js          # Configuração do Express
│   └── server.js       # Ponto de entrada do servidor
├── tests/              # Testes (se houver)
├── .env                # Variáveis de ambiente
├── package.json        # Dependências e scripts
└── README.md           # Documentação
```

## 💻 Scripts Disponíveis

```bash
# Executar em desenvolvimento com watch
npm run dev

# Iniciar servidor em produção
npm run start

# Executar testes (se houver)
npm run test
```

## 📝 Endpoints Principais

### Autenticação
```
POST /auth/login - Efetua login e retorna token
POST /auth/refresh - Gera novo token JWT
GET /auth/me - Dados do usuário autenticado
```

### Usuários
```
GET /usuarios/:id - Busca usuário por ID
POST /usuarios - Cria usuário (ADMIN)
PUT /usuarios/:id - Atualiza usuário (ADMIN)
PATCH /usuarios/:id - Atualiza usuário (ADMIN ou próprio usuário para senha)
DELETE /usuarios/:id - Desativa usuário (ADMIN)
```

### Médicos
```
GET /medicos - Lista médicos (público)
GET /medicos/:id - Busca médico por ID
POST /medicos - Cria médico (ADMIN)
PUT /medicos/:id - Atualiza médico (ADMIN)
DELETE /medicos/:id - Remove médico (ADMIN)
```

### Pacientes
```
GET /pacientes - Lista pacientes (com filtro por convênio)
GET /pacientes/cpf/:cpf - Busca paciente por CPF
GET /pacientes/:id - Busca paciente por ID
POST /pacientes - Cria paciente
PUT /pacientes/:id - Atualiza paciente
DELETE /pacientes/:id - Remove paciente
```

### Agendamentos
```
GET /agendamentos - Lista agendamentos
GET /agendamentos/disponivel - Verifica disponibilidade (público)
GET /agendamentos/disponivel/medico/:medicoId - Disponibilidade por médico (público)
GET /agendamentos/:id - Busca agendamento
POST /agendamentos - Cria agendamento
PUT /agendamentos/:id - Atualiza agendamento
PATCH /agendamentos/:id - Cancela/finaliza agendamento
```

### Prontuários
```
GET /pacientes/:id/prontuario - Lista prontuário
POST /pacientes/:id/
