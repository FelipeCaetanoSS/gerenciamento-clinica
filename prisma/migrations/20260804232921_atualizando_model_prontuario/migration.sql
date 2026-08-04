/*
  Warnings:

  - Added the required column `data` to the `Prontuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observacao` to the `Prontuario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prontuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "observacao" TEXT NOT NULL,
    "receitaId" INTEGER NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    CONSTRAINT "Prontuario_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prontuario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prontuario" ("id", "pacienteId", "receitaId") SELECT "id", "pacienteId", "receitaId" FROM "Prontuario";
DROP TABLE "Prontuario";
ALTER TABLE "new_Prontuario" RENAME TO "Prontuario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
