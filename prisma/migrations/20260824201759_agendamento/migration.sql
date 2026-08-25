-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Agendamento" ("data", "id", "medicoId", "pacienteId") SELECT "data", "id", "medicoId", "pacienteId" FROM "Agendamento";
DROP TABLE "Agendamento";
ALTER TABLE "new_Agendamento" RENAME TO "Agendamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
