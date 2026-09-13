require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const argon2 = require("argon2");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hashSenha(senha) {
  return argon2.hash(senha, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

async function main() {
  console.log("Limpando banco...");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");
  await prisma.exame.deleteMany();
  await prisma.prontuario.deleteMany();
  await prisma.receita.deleteMany();
  await prisma.convenio.deleteMany();
  await prisma.endereco.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.consulta.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  const senhaPadrao = await hashSenha("123456");

  console.log("Criando usuarios...");

  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin Sistema",
      email: "admin@clinica.com",
      senha: senhaPadrao,
      idade: 35,
      sexo: "Masculino",
      cpf: 12345678901,
      rg: "1234567",
      telefone: 11999990001,
      role: "ADMIN",
    },
  });

  const recepcionista = await prisma.usuario.create({
    data: {
      nome: "Maria Recepcionista",
      email: "recepcionista@clinica.com",
      senha: senhaPadrao,
      idade: 28,
      sexo: "Feminino",
      cpf: 22345678901,
      rg: "2234567",
      telefone: 11999990002,
      role: "RECEPCIONISTA",
    },
  });

  const medicoUsuario1 = await prisma.usuario.create({
    data: {
      nome: "Dr. Carlos Silva",
      email: "carlos@medico.com",
      senha: senhaPadrao,
      idade: 45,
      sexo: "Masculino",
      cpf: 32345678901,
      rg: "3234567",
      telefone: 11999990003,
      role: "MEDICO",
    },
  });

  const medicoUsuario2 = await prisma.usuario.create({
    data: {
      nome: "Dra. Ana Santos",
      email: "ana@medico.com",
      senha: senhaPadrao,
      idade: 38,
      sexo: "Feminino",
      cpf: 42345678901,
      rg: "4234567",
      telefone: 11999990004,
      role: "MEDICO",
    },
  });

  const pacienteUsuario1 = await prisma.usuario.create({
    data: {
      nome: "Joao Paciente",
      email: "joao@email.com",
      senha: senhaPadrao,
      idade: 30,
      sexo: "Masculino",
      cpf: 52345678901,
      rg: "5234567",
      telefone: 11999990005,
      role: "PACIENTE",
    },
  });

  const pacienteUsuario2 = await prisma.usuario.create({
    data: {
      nome: "Maria Paciente",
      email: "maria@email.com",
      senha: senhaPadrao,
      idade: 25,
      sexo: "Feminino",
      cpf: 62345678901,
      rg: "6234567",
      telefone: 11999990006,
      role: "PACIENTE",
    },
  });

  const pacienteUsuario3 = await prisma.usuario.create({
    data: {
      nome: "Pedro Oliveira",
      email: "pedro@email.com",
      senha: senhaPadrao,
      idade: 55,
      sexo: "Masculino",
      cpf: 72345678901,
      rg: "7234567",
      telefone: 11999990007,
      role: "PACIENTE",
    },
  });

  console.log("Criando medicos...");

  const medico1 = await prisma.medico.create({
    data: {
      crm: 12345,
      crmUf: "SP",
      especialidade: "Clinico Geral",
      diasAtendimento: "Segunda,Terca,Quinta",
      horarioInicio: "08:00",
      horarioFim: "17:00",
      duracaoConsulta: "30 min",
      duracaoConsultaMinutos: 30,
      maxConsultasDia: 16,
      usuarioId: medicoUsuario1.id,
    },
  });

  const medico2 = await prisma.medico.create({
    data: {
      crm: 67890,
      crmUf: "SP",
      especialidade: "Pediatra",
      diasAtendimento: "Segunda,Quarta,Sexta",
      horarioInicio: "09:00",
      horarioFim: "18:00",
      duracaoConsulta: "30 min",
      duracaoConsultaMinutos: 30,
      maxConsultasDia: 16,
      usuarioId: medicoUsuario2.id,
    },
  });

  console.log("Criando pacientes...");

  const paciente1 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("1996-03-15"),
      localnasc: "Sao Paulo",
      estadoCivil: "Solteiro",
      tipoSanguineo: "O+",
      peso: 75.5,
      altura: 1.75,
      usuarioId: pacienteUsuario1.id,
      endereco: {
        create: {
          rua: "Rua das Flores",
          cidade: "Sao Paulo",
          bairro: "Centro",
          numero: 123,
        },
      },
      convenio: {
        create: {
          nome: "Unimed",
          numCarteirinha: "UNI-123456",
          validade: new Date("2027-12-31"),
        },
      },
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("2001-07-22"),
      localnasc: "Guarulhos",
      estadoCivil: "Solteira",
      tipoSanguineo: "A+",
      peso: 58.0,
      altura: 1.62,
      alergia: "Amoxicilina",
      usuarioId: pacienteUsuario2.id,
      endereco: {
        create: {
          rua: "Av. Paulista",
          cidade: "Sao Paulo",
          bairro: "Bela Vista",
          numero: 456,
        },
      },
      convenio: {
        create: {
          nome: "Bradesco Saude",
          numCarteirinha: "BRA-789012",
          validade: new Date("2027-06-30"),
        },
      },
    },
  });

  const paciente3 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("1971-11-10"),
      localnasc: "Santos",
      estadoCivil: "Casado",
      tipoSanguineo: "B+",
      peso: 90.0,
      altura: 1.80,
      medicamento: "Losartana 50mg",
      doencas: JSON.stringify(["Hipertensao", "Diabetes Tipo 2"]),
      usuarioId: pacienteUsuario3.id,
      endereco: {
        create: {
          rua: "Rua da Praia",
          cidade: "Santos",
          bairro: "Boa Viagem",
          numero: 789,
        },
      },
      convenio: {
        create: {
          nome: "Sulamerica",
          numCarteirinha: "SUL-345678",
          validade: new Date("2027-09-30"),
        },
      },
    },
  });

  console.log("Criando agendamentos...");

  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const proximaSemana = new Date(hoje);
  proximaSemana.setDate(proximaSemana.getDate() + 7);

  await prisma.agendamento.create({
    data: {
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      data: new Date(`${amanha.toISOString().slice(0, 10)}T08:00:00`),
      status: "agendado",
    },
  });

  await prisma.agendamento.create({
    data: {
      pacienteId: paciente2.id,
      medicoId: medico2.id,
      data: new Date(`${amanha.toISOString().slice(0, 10)}T09:00:00`),
      status: "confirmado",
    },
  });

  await prisma.agendamento.create({
    data: {
      pacienteId: paciente3.id,
      medicoId: medico1.id,
      data: new Date(`${proximaSemana.toISOString().slice(0, 10)}T10:00:00`),
      status: "agendado",
    },
  });

  await prisma.agendamento.create({
    data: {
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      data: new Date(`${hoje.toISOString().slice(0, 10)}T08:00:00`),
      status: "concluido",
    },
  });

  console.log("Criando prontuario e receita...");

  const receita = await prisma.receita.create({
    data: {
      medicoId: medico1.id,
      pacienteId: paciente1.id,
      medicamento: "Paracetamol",
      dosagem: "500mg",
      dias: "7 dias",
      observacao: "Tomar 1 comprimido a cada 8 horas",
    },
  });

  const prontuario = await prisma.prontuario.create({
    data: {
      data: new Date(),
      observacao: "Paciente apresenta febre e tosse. Iniciar tratamento.",
      medicoId: medico1.id,
      receitaId: receita.id,
      pacienteId: paciente1.id,
      medicamento: "Paracetamol",
      dosagem: "500mg",
      dias: "7 dias",
      observacaoReceita: "Tomar 1 comprimido a cada 8 horas",
    },
  });

  await prisma.exame.create({
    data: {
      nome: "Hemograma Completo",
      observacao: "Solicitado para verificar infeccao",
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      prontuarioId: prontuario.id,
    },
  });

  await prisma.exame.create({
    data: {
      nome: "Raio-X do Torax",
      observacao: "Verificar condicoes pulmonares",
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      prontuarioId: prontuario.id,
    },
  });

  console.log("Criando notificacoes...");

  await prisma.notificacao.create({
    data: {
      titulo: "Novo agendamento",
      mensagem: "Joao Paciente foi agendado com Dr. Carlos Silva.",
      tipo: "appointment",
      categoria: "appointment",
      data: new Date(),
      usuarioId: pacienteUsuario1.id,
    },
  });

  await prisma.notificacao.create({
    data: {
      titulo: "Consulta finalizada",
      mensagem: "Joao Paciente teve prontuario registrado por Dr. Carlos Silva.",
      tipo: "reminder",
      categoria: "reminder",
      data: new Date(),
    },
  });

  await prisma.notificacao.create({
    data: {
      titulo: "Lembrete de consulta",
      mensagem: "Voce tem uma consulta amanha as 09:00 com Dra. Ana Santos.",
      tipo: "reminder",
      categoria: "reminder",
      data: new Date(),
      usuarioId: pacienteUsuario2.id,
    },
  });

  console.log("\n=== SEED CONCLUIDO ===\n");
  console.log("CREDENCIAIS DE LOGIN (senha: 123456):");
  console.log("  Admin:         admin@clinica.com");
  console.log("  Recepcionista: recepcionista@clinica.com");
  console.log("  Medico 1:      carlos@medico.com");
  console.log("  Medico 2:      ana@medico.com");
  console.log("  Paciente 1:    joao@email.com");
  console.log("  Paciente 2:    maria@email.com");
  console.log("  Paciente 3:    pedro@email.com");
  console.log("\nDADOS CRIADOS:");
  console.log("  3 medicos, 3 pacientes, 1 admin, 1 recepcionista");
  console.log("  4 agendamentos (1 concluido)");
  console.log("  1 prontuario com 2 exames");
  console.log("  3 notificacoes");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
