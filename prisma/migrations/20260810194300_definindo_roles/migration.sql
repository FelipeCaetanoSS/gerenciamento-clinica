-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paciente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localnasc" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "tipoSanguineo" TEXT NOT NULL,
    "peso" INTEGER NOT NULL,
    "altura" REAL NOT NULL,
    "alergia" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "observacao" TEXT
);
INSERT INTO "new_Paciente" ("alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo") SELECT "alergia", "altura", "estadoCivil", "id", "localnasc", "medicamento", "observacao", "peso", "tipoSanguineo" FROM "Paciente";
DROP TABLE "Paciente";
ALTER TABLE "new_Paciente" RENAME TO "Paciente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
