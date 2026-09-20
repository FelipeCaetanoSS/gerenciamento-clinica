# Documentacao da API

API para gerenciamento de clinica medica.

- Base local: `http://localhost:3000`
- Formato de dados: JSON, exceto upload de anexos
- Autenticacao: `Authorization: Bearer <token>`
- Erro padrao: `{ "erro": "mensagem" }`
- Roles: `ADMIN`, `RECEPCIONISTA`, `MEDICO`, `PACIENTE`

## Autenticacao e permissoes

As rotas `/`, `/saude` e `/auth/*` sao publicas. As demais exigem token JWT.

Rotas de `/usuarios` exigem perfil `ADMIN`, exceto `PATCH /usuarios/:id` quando usado pelo proprio usuario autenticado para alterar senha.

Status comuns:

| Status | Significado |
| --- | --- |
| `200` | Operacao concluida |
| `201` | Recurso criado |
| `204` | Recurso removido sem corpo na resposta |
| `400` | Dados invalidos ou obrigatorios ausentes |
| `401` | Token ausente, expirado ou credenciais invalidas |
| `403` | Token invalido ou perfil sem permissao |
| `404` | Recurso nao encontrado |
| `409` | Conflito de horario |
| `500` | Erro interno |

## Rotas publicas

### `GET /`

Retorna informacoes basicas da API.

Perfis autorizados: publico.

Resposta `200`:

```json
{
  "projeto": "Sistema de Gestao",
  "descricao": "API para gerenciar Clinica medica",
  "status": "online"
}
```

### `GET /saude`

Retorna status de saude do servidor.

Perfis autorizados: publico.

Resposta `200`:

```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-09-13T22:00:00.000Z"
}
```

### `POST /auth/registrar`

Cadastra publicamente um paciente. Cadastro publico aceita apenas `role: "PACIENTE"`.

Perfis autorizados: publico.

Body:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senhaPlana": "123456",
  "idade": 32,
  "sexo": "F",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "rg": "123456789",
  "role": "PACIENTE",
  "localnasc": "Sao Paulo",
  "estadoCivil": "Solteira",
  "tipoSanguineo": "O+",
  "peso": 70.5,
  "altura": 1.7,
  "alergia": "Dipirona",
  "medicamento": "Nenhum",
  "observacao": "Observacao geral"
}
```

Campos obrigatorios: `nome`, `email`, `senhaPlana`, `idade`, `sexo`, `telefone`, `cpf`, `rg`, `role`.

Resposta:

- `201`: paciente criado
- `400`: campos obrigatorios ausentes
- `403`: role diferente de `PACIENTE`

### `POST /auth/login`

Autentica usuario e retorna JWT.

Perfis autorizados: publico.

Body:

```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```

Resposta `200`:

```json
{
  "token": "jwt",
  "usuario": {
    "id": 1,
    "nome": "Usuario",
    "email": "usuario@email.com",
    "role": "ADMIN",
    "senhaTemporaria": false
  }
}
```

Erros:

- `401`: credenciais invalidas
- `403`: usuario inativo

## Usuarios

Todas as rotas de usuarios exigem token. Acoes administrativas exigem perfil `ADMIN`. A rota `PATCH /usuarios/:id` tambem permite que o proprio usuario autenticado altere sua senha.

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/usuarios` | Lista usuarios |
| `GET` | `/usuarios/:id` | Busca usuario por ID |
| `POST` | `/usuarios` | Cria usuario administrativo |
| `PUT` | `/usuarios/:id` | Atualiza usuario |
| `PATCH` | `/usuarios/:id` | Atualiza usuario parcialmente ou altera senha propria |
| `DELETE` | `/usuarios/:id` | Desativa usuario |

### `GET /usuarios`

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `busca` | string | Filtra por nome contendo o texto |
| `sexo` | string | Filtra por sexo |
| `role` | string | Aceita `ADMIN` ou `RECEPCIONISTA` |

Resposta `200`: lista de usuarios sem campo `senha`.

### `GET /usuarios/:id`

Parametros:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `id` | number | ID do usuario |

Resposta:

- `200`: usuario sem campo `senha`
- `400`: usuario invalido
- `404`: usuario nao encontrado

### `POST /usuarios`

Cria usuarios com role `ADMIN` ou `RECEPCIONISTA`.

Body:

```json
{
  "nome": "Recepcao",
  "email": "recepcao@email.com",
  "senhaPlana": "123456",
  "idade": 28,
  "sexo": "F",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "rg": "123456789",
  "role": "RECEPCIONISTA",
  "ativo": true
}
```

Campos obrigatorios: `nome`, `email`, `senhaPlana`, `idade`, `sexo`, `telefone`, `cpf`, `rg`, `role`.

Resposta:

- `201`: usuario criado sem campo `senha`
- `400`: campos obrigatorios ausentes ou role invalido

### `PUT /usuarios/:id` e `PATCH /usuarios/:id`

Atualiza os campos enviados. Para alterar dados cadastrais, exige perfil `ADMIN`.

Body aceito: `nome`, `email`, `idade`, `sexo`, `telefone`, `cpf`, `rg`, `role`, `ativo`.

Observacao: `role`, quando enviado, deve ser `ADMIN` ou `RECEPCIONISTA`.

`PATCH /usuarios/:id` tambem aceita troca de senha pelo proprio usuario autenticado:

```json
{
  "senhaAtual": "123456",
  "novaSenha": "nova-senha"
}
```

Regras da troca de senha:

- somente o proprio usuario pode alterar sua senha
- `senhaAtual` e `novaSenha` sao obrigatorias
- `novaSenha` deve ter pelo menos 6 caracteres
- `novaSenha` deve ser diferente da senha padrao

Resposta:

- `200`: usuario atualizado sem campo `senha`
- `400`: usuario invalido, role invalido ou dados de senha invalidos
- `403`: usuario nao admin tentando alterar dados cadastrais ou usuario tentando alterar senha de outro usuario
- `404`: usuario nao encontrado

### `DELETE /usuarios/:id`

Desativa o usuario, definindo `ativo: false`.

Observacao: nao e permitido desativar o proprio usuario autenticado.

Resposta:

- `200`: usuario desativado
- `400`: usuario invalido ou tentativa de desativar o proprio usuario
- `404`: usuario nao encontrado

## Pacientes

Todas as rotas exigem token. Algumas rotas restringem `PACIENTE` ao proprio cadastro e `MEDICO` a pacientes vinculados por agendamento ou prontuario.

| Metodo | Rota | Perfis | Descricao |
| --- | --- | --- | --- |
| `GET` | `/pacientes` | `ADMIN`, `RECEPCIONISTA`, `MEDICO`, `PACIENTE` | Lista pacientes |
| `GET` | `/pacientes/cpf/:cpf` | `ADMIN`, `RECEPCIONISTA` | Busca paciente por CPF |
| `GET` | `/pacientes/:id` | `ADMIN`, `RECEPCIONISTA`, `PACIENTE` | Busca paciente por ID |
| `POST` | `/pacientes` | `ADMIN`, `RECEPCIONISTA` | Cria paciente |
| `POST` | `/pacientes/criar` | `ADMIN`, `RECEPCIONISTA` | Alias de compatibilidade para criacao |
| `PUT` | `/pacientes/:id` | `ADMIN`, `RECEPCIONISTA` | Atualiza paciente |
| `PATCH` | `/pacientes/:id` | `ADMIN`, `RECEPCIONISTA` | Atualiza paciente parcialmente |
| `DELETE` | `/pacientes/:id` | `ADMIN` | Desativa paciente |

### `GET /pacientes`

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `busca` | string | Filtra por nome do usuario vinculado |
| `sexo` | string | Filtra por sexo do usuario vinculado |

Resposta `200`: lista de pacientes com `usuario`, `convenio`, `endereco` e `exame`.

Restricoes:

- `PACIENTE`: lista apenas o paciente vinculado ao usuario autenticado.
- `MEDICO`: lista apenas pacientes vinculados ao medico autenticado.

### `GET /pacientes/cpf/:cpf`

Parametros:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `cpf` | string | CPF com ou sem pontuacao |

Resposta:

- `200`: usuario com dados do paciente
- `400`: CPF invalido
- `404`: paciente nao encontrado

### `GET /pacientes/:id`

Parametros:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `id` | number | ID do paciente |

Restricao: quando o perfil for `PACIENTE`, o paciente so pode acessar o proprio cadastro vinculado ao token.

Resposta:

- `200`: paciente encontrado
- `403`: paciente tentando acessar outro cadastro
- `404`: paciente nao encontrado

### `POST /pacientes` e `POST /pacientes/criar`

Cria paciente e usuario vinculado com role `PACIENTE`.

Body:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senhaPlana": "123456",
  "idade": 32,
  "sexo": "F",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "rg": "123456789",
  "localnasc": "Sao Paulo",
  "dataNasc": "1994-01-15",
  "estadoCivil": "Solteira",
  "tipoSanguineo": "O+",
  "peso": 70.5,
  "altura": 1.7,
  "alergia": "Dipirona",
  "medicamento": "Nenhum",
  "observacao": "Observacao geral",
  "deficiencia": "Nenhuma",
  "doencas": ["Hipertensao"],
  "endereco": {
    "rua": "Rua A",
    "cidade": "Sao Paulo",
    "bairro": "Centro",
    "numero": 100
  },
  "convenio": [
    {
      "nome": "Convenio X",
      "numCarteirinha": "123",
      "validade": "2027-12-31"
    }
  ]
}
```

Campos obrigatorios no controller: `nome`, `cpf`, `telefone`. Na pratica, envie tambem os dados de usuario para evitar registros incompletos.

Resposta:

- `201`: paciente criado
- `400`: campos obrigatorios ausentes

### `PUT /pacientes/:id` e `PATCH /pacientes/:id`

Atualiza os campos enviados.

Body aceito: os mesmos campos da criacao. `endereco` e `convenio` tambem podem ser atualizados.

Resposta:

- `200`: paciente atualizado
- `404`: paciente nao encontrado

### `DELETE /pacientes/:id`

Desativa o usuario vinculado ao paciente, definindo `usuario.ativo: false`.

Resposta:

- `200`: paciente desativado
- `404`: paciente nao encontrado

## Prontuario e exames de pacientes

Todas as rotas exigem token.

| Metodo | Rota | Perfis | Descricao |
| --- | --- | --- | --- |
| `GET` | `/pacientes/:id/prontuario` | `ADMIN`, `RECEPCIONISTA`, `MEDICO`, `PACIENTE` | Lista prontuario |
| `POST` | `/pacientes/:id/prontuario` | `ADMIN`, `RECEPCIONISTA` | Cria registro de prontuario |
| `POST` | `/pacientes/:id/prontuario/:prontuarioId/exames` | `ADMIN`, `RECEPCIONISTA` | Adiciona exame |
| `POST` | `/pacientes/:id/prontuario/:prontuarioId/receita/download` | `ADMIN`, `RECEPCIONISTA`, `MEDICO`, `PACIENTE` | Marca receita como baixada |
| `POST` | `/pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo` | `ADMIN`, `RECEPCIONISTA`, `PACIENTE` | Envia anexo do exame |
| `GET` | `/pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo/abrir` | `ADMIN`, `RECEPCIONISTA`, `PACIENTE` | Abre anexo |

### `GET /pacientes/:id/prontuario`

Restricoes:

- `PACIENTE`: so acessa o proprio prontuario.
- `MEDICO`: so acessa prontuario de paciente vinculado por agendamento ou prontuario.

Resposta `200`: lista de registros com exames.

Cada registro retorna a prescricao em campos textuais (`medicamento`, `dosagem`, `dias`, `observacaoReceita`) e tambem em `prescription` ja formatado para exibicao. A relacao interna `receita` nao faz parte do contrato publico da resposta.

### `POST /pacientes/:id/prontuario`

Body:

```json
{
  "medicoId": 1,
  "data": "2026-09-13",
  "observacao": "Consulta registrada",
  "medicamento": "Medicamento A",
  "dosagem": "1 comprimido",
  "dias": "7 dias",
  "observacaoReceita": "Tomar apos refeicao",
  "exames": [
    {
      "nome": "Hemograma",
      "observacao": "Jejum"
    }
  ]
}
```

Campos obrigatorios: `medicoId`.

Resposta:

- `201`: prontuario criado
- `400`: paciente invalido ou `medicoId` ausente
- `404`: paciente ou medico nao encontrado

### `POST /pacientes/:id/prontuario/:prontuarioId/exames`

Body:

```json
{
  "nome": "Raio X",
  "observacao": "Torax"
}
```

Resposta:

- `201`: exame adicionado
- `400`: paciente ou prontuario invalido
- `404`: paciente ou prontuario nao encontrado

### `POST /pacientes/:id/prontuario/:prontuarioId/receita/download`

Marca a prescricao do prontuario como baixada pelo paciente e registra a data do download.

Restricoes:

- `PACIENTE`: so acessa a propria prescricao.
- `MEDICO`: so acessa prescricao de paciente vinculado por agendamento ou prontuario.

Resposta:

- `200`: objeto com `prontuario`, `prescricaoBaixadaPeloPaciente` e `prescricaoDownloadPacienteEm`
- `400`: paciente ou prontuario invalido
- `404`: paciente ou prontuario nao encontrado
- `409`: prontuario nao possui receita para download

### `POST /pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo`

Envia ou registra anexo de exame.

Content-Type recomendado: `multipart/form-data`.

Campos:

| Campo | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| `anexo` | file | sim | Arquivo do exame |
| `imagem` | string | alternativa | Caminho/URL caso nao envie arquivo |
| `imageUrl` | string | alternativa | Caminho/URL caso nao envie arquivo |

Limite: `5MB`.

Resposta:

- `200`: anexo vinculado
- `400`: parametros invalidos ou arquivo ausente
- `404`: exame nao encontrado

### `GET /pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo/abrir`

Abre o arquivo anexado com `sendFile`.

Restricao: quando o perfil for `PACIENTE`, so acessa anexos do proprio prontuario.

Resposta:

- `200`: arquivo
- `400`: parametros invalidos
- `404`: anexo nao encontrado

## Medicos

Todas as rotas exigem token.

| Metodo | Rota | Perfis | Descricao |
| --- | --- | --- | --- |
| `GET` | `/medicos` | `ADMIN`, `RECEPCIONISTA`, `MEDICO` | Lista medicos |
| `GET` | `/medicos/:id` | `ADMIN`, `RECEPCIONISTA`, `MEDICO` | Busca medico por ID |
| `POST` | `/medicos` | `ADMIN` | Cria medico |
| `POST` | `/medicos/novo` | `ADMIN` | Alias de compatibilidade para criacao |
| `PUT` | `/medicos/:id` | `ADMIN` | Atualiza medico |
| `PATCH` | `/medicos/:id` | `ADMIN` | Atualiza medico parcialmente |
| `DELETE` | `/medicos/:id` | `ADMIN` | Desativa medico |

### `GET /medicos`

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `busca` | string | Filtra por nome do usuario vinculado |

Restricao: quando o perfil for `MEDICO`, a listagem e limitada ao medico vinculado ao token.

Resposta `200`: lista de medicos com usuario, contagem de agendamentos e agenda calculada.

### `GET /medicos/:id`

Restricao: quando o perfil for `MEDICO`, so acessa o proprio cadastro.

Resposta:

- `200`: medico encontrado
- `400`: medico invalido
- `403`: medico tentando acessar outro cadastro
- `404`: medico nao encontrado

### `POST /medicos` e `POST /medicos/novo`

Cria medico e usuario vinculado com role `MEDICO`.

Body:

```json
{
  "nome": "Dr. Joao",
  "email": "joao@email.com",
  "senhaPlana": "123456",
  "idade": 40,
  "sexo": "M",
  "telefone": "11999999999",
  "cpf": "12345678900",
  "rg": "123456789",
  "crm": "12345",
  "crmUf": "SP",
  "especialidade": "Cardiologia",
  "diasAtendimento": ["segunda", "quarta", "sexta"],
  "horarioInicio": "08:00",
  "horarioFim": "17:00",
  "duracaoConsulta": "30 min",
  "duracaoConsultaMinutos": 30,
  "maxConsultasDia": 16
}
```

Campos obrigatorios no controller: `nome`, `crm`, `rg`, `cpf`, `telefone`, `email`.

Observacao: `diasAtendimento` deve conter pelo menos um dia de atendimento.

Resposta:

- `201`: medico criado
- `400`: campos obrigatorios ausentes

### `PUT /medicos/:id` e `PATCH /medicos/:id`

Atualiza dados do medico, usuario vinculado e agenda.

Body aceito: campos da criacao.

Resposta:

- `200`: medico atualizado
- `404`: medico nao encontrado

### `DELETE /medicos/:id`

Desativa o usuario vinculado ao medico, definindo `usuario.ativo: false`.

Resposta:

- `200`: medico desativado
- `404`: medico nao encontrado

## Agendamentos

Todas as rotas exigem token.

| Metodo | Rota | Perfis | Descricao |
| --- | --- | --- | --- |
| `GET` | `/agendamentos` | `ADMIN`, `RECEPCIONISTA`, `MEDICO`, `PACIENTE` | Lista agendamentos |
| `GET` | `/agendamentos/:id` | `ADMIN`, `RECEPCIONISTA`, `MEDICO` | Busca agendamento por ID |
| `POST` | `/agendamentos` | `ADMIN`, `RECEPCIONISTA` | Cria agendamento |
| `POST` | `/agendamentos/novo` | `ADMIN`, `RECEPCIONISTA` | Alias de compatibilidade para criacao |
| `POST` | `/agendamentos/:id/finalizar` | `ADMIN`, `RECEPCIONISTA` | Finaliza consulta e cria prontuario |
| `PUT` | `/agendamentos/:id` | `ADMIN`, `RECEPCIONISTA` | Atualiza agendamento |
| `PATCH` | `/agendamentos/:id` | `ADMIN`, `RECEPCIONISTA` | Atualiza agendamento parcialmente |
| `DELETE` | `/agendamentos/:id` | `ADMIN`, `RECEPCIONISTA` | Remove agendamento |

### `GET /agendamentos`

Query params:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `dia` | string | Filtra por dia no formato `YYYY-MM-DD` |
| `medicoId` | number | Filtra por medico |

Restricoes:

- `MEDICO`: ignora `medicoId` enviado e lista apenas agendamentos do medico vinculado ao token.
- `PACIENTE`: lista apenas agendamentos do paciente vinculado ao token.

Resposta `200`: lista de agendamentos com paciente e medico.

### `GET /agendamentos/:id`

Restricao: quando o perfil for `MEDICO`, so acessa agendamentos vinculados ao proprio medico.

Resposta:

- `200`: agendamento encontrado
- `400`: agendamento invalido
- `403`: medico tentando acessar agendamento de outro medico
- `404`: agendamento nao encontrado

### `POST /agendamentos` e `POST /agendamentos/novo`

Cria agendamento. `/agendamentos/novo` existe apenas para compatibilidade.

Body:

```json
{
  "pacienteId": 1,
  "medicoId": 1,
  "dia": "2026-09-13",
  "horario": "14:30"
}
```

Campos obrigatorios: `pacienteId`, `medicoId`, `dia`, `horario`.

Resposta:

- `201`: agendamento criado
- `400`: campos obrigatorios ausentes
- `409`: horario indisponivel para medico ou paciente

### `PUT /agendamentos/:id` e `PATCH /agendamentos/:id`

Atualiza campos enviados.

Body aceito:

```json
{
  "pacienteId": 1,
  "medicoId": 1,
  "dia": "2026-09-13",
  "horario": "15:00",
  "status": "cancelado"
}
```

Observacoes:

- Para alterar data/hora, envie `dia` e `horario` juntos.
- Status cancelado aceita variacoes como `cancelado`, `cancelada`, `cancelled`, `canceled`.
- Ao cancelar, o sistema tenta criar uma notificacao.

Resposta:

- `200`: agendamento atualizado
- `404`: agendamento nao encontrado
- `409`: horario indisponivel para medico ou paciente

### `POST /agendamentos/:id/finalizar`

Finaliza agendamento, altera status para `concluido` e cria prontuario.

Body:

```json
{
  "data": "2026-09-13",
  "observacao": "Consulta finalizada",
  "medicamento": "Medicamento A",
  "dosagem": "1 comprimido",
  "dias": "7 dias",
  "observacaoReceita": "Tomar apos refeicao",
  "exames": [
    {
      "nome": "Hemograma",
      "observacao": "Solicitado"
    }
  ]
}
```

Resposta:

- `200`: objeto com `agendamento` e `prontuario`
- `400`: agendamento invalido, cancelado ou ja finalizado
- `404`: agendamento nao encontrado

### `DELETE /agendamentos/:id`

Remove o agendamento do banco.

Resposta:

- `204`: removido sem corpo
- `404`: agendamento nao encontrado

## Notificacoes

Todas as rotas exigem token. Pacientes listam apenas notificacoes vinculadas ao proprio usuario.

| Metodo | Rota | Perfis | Descricao |
| --- | --- | --- | --- |
| `GET` | `/notificacoes` | Qualquer usuario autenticado | Lista notificacoes |
| `POST` | `/notificacoes` | Qualquer usuario autenticado | Cria notificacao |
| `POST` | `/notificacoes/nova` | Qualquer usuario autenticado | Alias de compatibilidade para criacao |
| `PATCH` | `/notificacoes/visualizar-todas` | Qualquer usuario autenticado | Marca todas como lidas |
| `PATCH` | `/notificacoes/:id` | Qualquer usuario autenticado | Marca uma notificacao como lida |
| `DELETE` | `/notificacoes/:id` | Qualquer usuario autenticado | Remove notificacao |

### `GET /notificacoes`

Resposta `200`: lista de notificacoes em formato compatibilidade, com campos como `titulo`, `title`, `mensagem`, `description`, `lida`, `read`, `createdAt`.

### `POST /notificacoes` e `POST /notificacoes/nova`

Cria notificacao. Quando houver usuario autenticado, o controller usa `req.usuario.id` como `usuarioId`. `/notificacoes/nova` existe apenas para compatibilidade.

Body:

```json
{
  "titulo": "Aviso",
  "mensagem": "Mensagem da notificacao",
  "tipo": "info",
  "categoria": "sistema",
  "lida": false
}
```

Aliases aceitos: `title` para `titulo`, `message` para `mensagem`, `type` para `tipo`, `category` para `categoria`.

Resposta:

- `201`: notificacao criada

### `PATCH /notificacoes/visualizar-todas`

Marca todas as notificacoes como lidas.

Resposta:

- `200`: lista atualizada de notificacoes

### `PATCH /notificacoes/:id`

Marca uma notificacao como lida.

Parametros:

| Parametro | Tipo | Descricao |
| --- | --- | --- |
| `id` | number | ID da notificacao |

Resposta:

- `200`: notificacao marcada como lida
- `404`: notificacao nao encontrada

### `DELETE /notificacoes/:id`

Remove notificacao.

Resposta:

- `204`: removida sem corpo
- `404`: notificacao nao encontrada

## Observacoes importantes

- Use `Authorization: Bearer <token>` em todas as rotas protegidas.
- `DELETE /usuarios/:id` desativa usuario; nao remove fisicamente.
- `DELETE /pacientes/:id` e `DELETE /medicos/:id` desativam o usuario vinculado.
- `DELETE /agendamentos/:id` e `DELETE /notificacoes/:id` removem fisicamente o registro.
- `POST /pacientes/criar` e alias de compatibilidade de `POST /pacientes`.
- `POST /agendamentos/novo` e alias de compatibilidade de `POST /agendamentos`.
- `POST /medicos/novo` e alias de compatibilidade de `POST /medicos`.
- `POST /notificacoes/nova` e alias de compatibilidade de `POST /notificacoes`.
- Upload de anexo de exame usa `multipart/form-data` com campo `anexo`.
- Upload de anexo de exame aceita arquivos de ate `5MB`.
- O sistema pode criar notificacoes automaticamente ao criar/cancelar/finalizar agendamentos e ao registrar prontuario.
- O middleware de acesso proprio restringe `PACIENTE` ao proprio cadastro, prontuario, anexos e agendamentos.
- O middleware de acesso proprio restringe `MEDICO` ao proprio cadastro, aos proprios agendamentos e a pacientes/prontuarios vinculados por agendamento ou prontuario.
