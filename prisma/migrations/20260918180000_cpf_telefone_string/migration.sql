-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "senhaTemporaria" BOOLEAN NOT NULL DEFAULT false,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "sexo" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL,
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Usuario_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "crm" INTEGER NOT NULL,
    "crmUf" TEXT,
    "especialidade" TEXT,
    "diasAtendimento" TEXT,
    "horarioInicio" TEXT,
    "horarioFim" TEXT,
    "duracaoConsulta" TEXT,
    "duracaoConsultaMinutos" INTEGER,
    "maxConsultasDia" INTEGER,
    "usuarioId" INTEGER,
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Medico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Medico_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localnasc" TEXT,
    "DataNasc" DATETIME,
    "estadoCivil" TEXT,
    "tipoSanguineo" TEXT,
    "peso" REAL,
    "altura" REAL,
    "alergia" TEXT,
    "medicamento" TEXT,
    "observacao" TEXT,
    "deficiencia" TEXT,
    "doencas" TEXT,
    "usuarioId" INTEGER,
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paciente_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consulta_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicoId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "dias" TEXT NOT NULL,
    "observacao" TEXT NOT NULL,
    CONSTRAINT "Receita_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT,
    "categoria" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data" DATETIME NOT NULL,
    "usuarioId" INTEGER,
    CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Convenio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "numCarteirinha" TEXT NOT NULL,
    "validade" DATETIME NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    CONSTRAINT "Convenio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "imagem" TEXT,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "prontuarioId" INTEGER,
    "anexoImagem" TEXT,
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Exame_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exame_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exame_prontuarioId_fkey" FOREIGN KEY ("prontuarioId") REFERENCES "Prontuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exame_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "observacao" TEXT NOT NULL,
    "medicamento" TEXT,
    "dosagem" TEXT,
    "dias" TEXT,
    "observacaoReceita" TEXT,
    "prescricaoBaixadaPeloPaciente" BOOLEAN NOT NULL DEFAULT false,
    "prescricaoDownloadPacienteEm" DATETIME,
    "medicoId" INTEGER,
    "receitaId" INTEGER,
    "pacienteId" INTEGER NOT NULL,
    "alteradoPorId" INTEGER,
    "alteradoEm" DATETIME,
    CONSTRAINT "Prontuario_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rua" TEXT,
    "cidade" TEXT,
    "bairro" TEXT,
    "numero" INTEGER,
    "pacienteId" INTEGER,
    CONSTRAINT "Endereco_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rg_key" ON "Usuario"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Medico_usuarioId_key" ON "Medico"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_pacienteId_key" ON "Endereco"("pacienteId");
