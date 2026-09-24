require("dotenv").config();
process.env.TZ = "America/Sao_Paulo";
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { hashSenha } = require("../lib/senha");
const { adicionarDiasClinica, montarDataHoraClinica } = require("../lib/timezone");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function dataRelativa(dias, hora = "09:00") {
  return montarDataHoraClinica(adicionarDiasClinica(new Date(), dias), hora);
}

async function limparBanco() {
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
}

async function criarUsuario(dados, senhaPadrao) {
  const { senhaPlana, ...dadosUsuario } = dados;

  return prisma.usuario.create({
    data: {
      ...dadosUsuario,
      senha: senhaPadrao,
      senhaTemporaria: true,
      ativo: true,
    },
  });
}

async function main() {
  await limparBanco();

  const senhaPadrao = await hashSenha("123456");

  console.log("Criando usuarios...");

  const admin = await criarUsuario(
    {
      nome: "Felipe",
      email: "felipe@gmail.com",
      senhaPlana: "123456",
      idade: 21,
      sexo: "Masculino",
      cpf: "12111222333",
      rg: "15252523",
      telefone: "43998459912",
      role: "ADMIN",
    }, senhaPadrao
  );

  const recepcionista = await criarUsuario(
    {
      nome: "Larissa Mendes",
      email: "larissa@gmail.com",
      idade: 29,
      sexo: "Feminino",
      cpf: "51231249876",
      rg: "SP5129876",
      telefone: "11976234511",
      role: "RECEPCIONISTA",
    },
    senhaPadrao
  );

  const medicoUsuario1 = await criarUsuario(
    {
      nome: "Rafael Azevedo",
      email: "rafael@gmail.com",
      idade: 44,
      sexo: "Masculino",
      cpf: "62345198437",
      rg: "SP6231987",
      telefone: "11983561211",
      role: "MEDICO",
    },
    senhaPadrao
  );

  const medicoUsuario2 = await criarUsuario(
    {
      nome: "Camila Duarte",
      email: "camila@gmail.com",
      idade: 39,
      sexo: "Feminino",
      cpf: "73456219778",
      rg: "RJ7342198",
      telefone: "21991134578",
      role: "MEDICO",
    },
    senhaPadrao
  );

  const pacienteUsuario1 = await criarUsuario(
    {
      nome: "Marcos Vinicius Rocha",
      email: "marcos@gmail.com",
      idade: 42,
      sexo: "Masculino",
      cpf: "11111111111",
      rg: "SP8453219",
      telefone: "11911784523",
      role: "PACIENTE",
    },
    senhaPadrao
  );

  const pacienteUsuario2 = await criarUsuario(
    {
      nome: "Helena Barbosa",
      email: "helena@gmail.com",
      idade: 31,
      sexo: "Feminino",
      cpf: "95678435321",
      rg: "MG9564321",
      telefone: "31982145672",
      role: "PACIENTE",
    },
    senhaPadrao
  );

  const pacienteUsuario3 = await criarUsuario(
    {
      nome: "Antonio Ferreira Lima",
      email: "antonio@gmail.com",
      idade: 58,
      sexo: "Masculino",
      cpf: "16789534432",
      rg: "PR1675432",
      telefone: "41934876234",
      role: "PACIENTE",
    },
    senhaPadrao
  );

  console.log("Criando medicos...");

  const medico1 = await prisma.medico.create({
    data: {
      crm: 48216,
      crmUf: "SP",
      especialidade: "Clinica medica",
      diasAtendimento: "Segunda,Terca,Quinta",
      horarioInicio: "08:00",
      horarioFim: "17:00",
      duracaoConsulta: "30 min",
      duracaoConsultaMinutos: 30,
      maxConsultasDia: 14,
      usuarioId: medicoUsuario1.id,
    },
  });

  const medico2 = await prisma.medico.create({
    data: {
      crm: 59327,
      crmUf: "SP",
      especialidade: "Cardiologia",
      diasAtendimento: "Segunda,Quarta,Sexta",
      horarioInicio: "09:00",
      horarioFim: "18:00",
      duracaoConsulta: "40 min",
      duracaoConsultaMinutos: 40,
      maxConsultasDia: 10,
      usuarioId: medicoUsuario2.id,
    },
  });

  console.log("Criando pacientes...");

  const paciente1 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("1984-05-14"),
      localnasc: "Sao Paulo",
      estadoCivil: "Casado",
      tipoSanguineo: "O+",
      peso: 84.2,
      altura: 1.78,
      alergia: "Dipirona",
      medicamento: "Omeprazol 20mg quando necessario",
      observacao: "Relata rotina de trabalho intensa e sono irregular.",
      deficiencia: "Nenhuma",
      doencas: JSON.stringify(["Gastrite"]),
      usuarioId: pacienteUsuario1.id,
      endereco: {
        create: {
          rua: "Rua Padre Carvalho",
          cidade: "Sao Paulo",
          bairro: "Pinheiros",
          numero: 248,
        },
      },
      convenio: {
        create: {
          nome: "Unimed",
          numCarteirinha: "UNI-482193",
          validade: new Date("2027-12-31"),
        },
      },
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("1995-09-03"),
      localnasc: "Belo Horizonte",
      estadoCivil: "Solteira",
      tipoSanguineo: "A+",
      peso: 61.4,
      altura: 1.64,
      alergia: "",
      medicamento: "",
      observacao: "",
      deficiencia: "Nenhuma",
      doencas: JSON.stringify(["Rinite alergica"]),
      usuarioId: pacienteUsuario2.id,
      endereco: {
        create: {
          rua: "Avenida Afonso Pena",
          cidade: "Belo Horizonte",
          bairro: "Funcionarios",
          numero: 1120,
        },
      },
      convenio: {
        create: {
          nome: "Bradesco Saude",
          numCarteirinha: "BRA-735912",
          validade: new Date("2027-08-30"),
        },
      },
    },
  });

  const paciente3 = await prisma.paciente.create({
    data: {
      DataNasc: new Date("1968-01-22"),
      localnasc: "Curitiba",
      estadoCivil: "Casado",
      tipoSanguineo: "B+",
      peso: 88.7,
      altura: 1.72,
      alergia: "Nenhuma conhecida",
      medicamento: "Losartana 50mg, Metformina 850mg",
      observacao: "Acompanhamento regular para pressao arterial e glicemia.",
      deficiencia: "Nenhuma",
      doencas: JSON.stringify(["Hipertensao", "Diabetes tipo 2"]),
      usuarioId: pacienteUsuario3.id,
      endereco: {
        create: {
          rua: "Rua Visconde de Nacar",
          cidade: "Curitiba",
          bairro: "Centro",
          numero: 687,
        },
      },
      convenio: {
        create: {
          nome: "SulAmerica Saude",
          numCarteirinha: "SUL-219684",
          validade: new Date("2027-10-15"),
        },
      },
    },
  });

  console.log("Criando consultas, receitas e prontuarios...");

  await prisma.consulta.create({
    data: {
      data: dataRelativa(-10, "10:00"),
      status: "concluida",
      motivo: "Dor abdominal recorrente e azia apos refeicoes.",
      pacienteId: paciente1.id,
      medicoId: medico1.id,
    },
  });

  await prisma.consulta.create({
    data: {
      data: dataRelativa(-4, "14:00"),
      status: "concluida",
      motivo: "Avaliacao cardiologica de rotina.",
      pacienteId: paciente3.id,
      medicoId: medico2.id,
    },
  });

  const receita1 = await prisma.receita.create({
    data: {
      medicoId: medico1.id,
      pacienteId: paciente1.id,
      medicamento: "Omeprazol",
      dosagem: "20mg",
      dias: "14 dias",
      observacao: "Tomar 1 capsula pela manha, em jejum.",
    },
  });

  const receita2 = await prisma.receita.create({
    data: {
      medicoId: medico2.id,
      pacienteId: paciente3.id,
      medicamento: "Losartana",
      dosagem: "50mg",
      dias: "Uso continuo",
      observacao: "Manter 1 comprimido ao dia e acompanhar pressao arterial.",
    },
  });

  const prontuario1 = await prisma.prontuario.create({
    data: {
      data: dataRelativa(-10, "10:30"),
      observacao: "Quadro compativel com gastrite leve. Orientado ajuste alimentar e retorno se houver piora.",
      medicoId: medico1.id,
      pacienteId: paciente1.id,
      receitaId: receita1.id,
      medicamento: "Omeprazol",
      dosagem: "20mg",
      dias: "14 dias",
      observacaoReceita: "Evitar cafe, alcool e alimentos muito condimentados durante o tratamento.",
    },
  });

  const prontuario2 = await prisma.prontuario.create({
    data: {
      data: dataRelativa(-4, "14:40"),
      observacao: "Pressao controlada no consultorio. Solicitado acompanhamento laboratorial.",
      medicoId: medico2.id,
      pacienteId: paciente3.id,
      receitaId: receita2.id,
      medicamento: "Losartana",
      dosagem: "50mg",
      dias: "Uso continuo",
      observacaoReceita: "Registrar medidas de pressao pela manha por 7 dias.",
    },
  });

  await prisma.exame.create({
    data: {
      nome: "Hemograma completo",
      observacao: "Exame solicitado para investigacao inicial e acompanhamento clinico.",
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      prontuarioId: prontuario1.id,
    },
  });

  await prisma.exame.create({
    data: {
      nome: "Glicemia de jejum",
      observacao: "Controle metabolico em paciente com diabetes tipo 2.",
      pacienteId: paciente3.id,
      medicoId: medico2.id,
      prontuarioId: prontuario2.id,
    },
  });

  await prisma.exame.create({
    data: {
      nome: "Eletrocardiograma",
      observacao: "Avaliacao cardiologica de rotina.",
      pacienteId: paciente3.id,
      medicoId: medico2.id,
      prontuarioId: prontuario2.id,
    },
  });

  console.log("Criando agendamentos...");

  await prisma.agendamento.createMany({
    data: [
      {
        pacienteId: paciente1.id,
        medicoId: medico1.id,
        data: dataRelativa(-10, "10:00"),
        status: "concluido",
      },
      {
        pacienteId: paciente3.id,
        medicoId: medico2.id,
        data: dataRelativa(-4, "14:00"),
        status: "concluido",
      },
      {
        pacienteId: paciente2.id,
        medicoId: medico1.id,
        data: dataRelativa(1, "09:30"),
        status: "confirmado",
      },
      {
        pacienteId: paciente1.id,
        medicoId: medico2.id,
        data: dataRelativa(3, "15:20"),
        status: "agendado",
      },
      {
        pacienteId: paciente3.id,
        medicoId: medico1.id,
        data: dataRelativa(7, "08:40"),
        status: "agendado",
      },
    ],
  });

  console.log("Criando notificacoes...");

  await prisma.notificacao.createMany({
    data: [
      {
        titulo: "Consulta confirmada",
        mensagem: "Sua consulta com Rafael Azevedo esta confirmada para amanha as 09:30.",
        tipo: "appointment",
        categoria: "appointment",
        data: new Date(),
        usuarioId: pacienteUsuario2.id,
      },
      {
        titulo: "Prontuario atualizado",
        mensagem: "O atendimento de Marcos Vinicius Rocha foi registrado no prontuario.",
        tipo: "prontuario",
        categoria: "medical_record",
        data: new Date(),
        usuarioId: admin.id,
      },
      {
        titulo: "Exame solicitado",
        mensagem: "Camila Duarte solicitou novos exames para Antonio Ferreira Lima.",
        tipo: "exam",
        categoria: "exam",
        data: new Date(),
        usuarioId: pacienteUsuario3.id,
      },
      {
        titulo: "Agenda do dia",
        mensagem: "Ha consultas confirmadas para revisar na recepcao.",
        tipo: "appointment",
        categoria: "appointment",
        data: new Date(),
        usuarioId: recepcionista.id,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
