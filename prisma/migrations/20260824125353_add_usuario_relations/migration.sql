-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "crm" INTEGER NOT NULL,
    "especialidade" TEXT,
    "usuarioId" INTEGER,
    CONSTRAINT "Medico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Medico" ("crm", "id") SELECT "crm", "id" FROM "Medico";
DROP TABLE "Medico";
ALTER TABLE "new_Medico" RENAME TO "Medico";
CREATE UNIQUE INDEX "Medico_usuarioId_key" ON "Medico"("usuarioId");
CREATE TABLE "new_Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localnasc" TEXT,
    "estadoCivil" TEXT,
    "tipoSanguineo" TEXT,
    "peso" INTEGER,
    "altura" REAL,
    "alergia" TEXT,
    "medicamento" TEXT,
    "observacao" TEXT,
    "usuarioId" INTEGER,
    CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Paciente" ("alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo") SELECT "alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
