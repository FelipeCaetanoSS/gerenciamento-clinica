/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recepcionista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `ativo` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `idade` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Medico` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `idade` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `Paciente` table. All the data in the column will be lost.
  - Added the required column `bairro` to the `Endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `Endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rua` to the `Endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoId` to the `Exame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteId` to the `Exame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteId` to the `Prontuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receitaId` to the `Prontuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteId` to the `Receita` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Admin_cpf_key";

-- DropIndex
DROP INDEX "Admin_rg_key";

-- DropIndex
DROP INDEX "Recepcionista_cpf_key";

-- DropIndex
DROP INDEX "Recepcionista_rg_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Admin";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Recepcionista";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "sexo" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "cpf" INTEGER NOT NULL,
    "telefone" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Endereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rua" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "numero" INTEGER NOT NULL
);
INSERT INTO "new_Endereco" ("id") SELECT "id" FROM "Endereco";
DROP TABLE "Endereco";
ALTER TABLE "new_Endereco" RENAME TO "Endereco";
CREATE TABLE "new_Exame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "observacao" TEXT NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    CONSTRAINT "Exame_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exame_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Exame" ("data", "id", "observacao") SELECT "data", "id", "observacao" FROM "Exame";
DROP TABLE "Exame";
ALTER TABLE "new_Exame" RENAME TO "Exame";
CREATE TABLE "new_Medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "crm" INTEGER NOT NULL
);
INSERT INTO "new_Medico" ("crm", "id") SELECT "crm", "id" FROM "Medico";
DROP TABLE "Medico";
ALTER TABLE "new_Medico" RENAME TO "Medico";
CREATE TABLE "new_Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localnasc" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "tipoSanguineo" TEXT NOT NULL,
    "peso" INTEGER NOT NULL,
    "altura" REAL NOT NULL,
    "alergia" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "observacao" TEXT NOT NULL
);
INSERT INTO "new_Paciente" ("alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo") SELECT "alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
CREATE TABLE "new_Prontuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receitaId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    CONSTRAINT "Prontuario_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prontuario" ("id") SELECT "id" FROM "Prontuario";
DROP TABLE "Prontuario";
ALTER TABLE "new_Prontuario" RENAME TO "Prontuario";
CREATE TABLE "new_Receita" (
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
INSERT INTO "new_Receita" ("dias", "dosagem", "id", "medicamento", "medicoId", "observacao") SELECT "dias", "dosagem", "id", "medicamento", "medicoId", "observacao" FROM "Receita";
DROP TABLE "Receita";
ALTER TABLE "new_Receita" RENAME TO "Receita";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rg_key" ON "Usuario"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
