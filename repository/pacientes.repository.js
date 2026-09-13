const argon2 = require("argon2");
const prisma = require("../lib/client");
const notificacoesModel = require("./notificacoes.repository");

const includeUsuario = {
  usuario: true,
  convenio: true,
  endereco: true,
  exame: true,
};

function onlyDigits(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

function dataOuNull(value) {
  if (value === undefined || value === null || value === "") return null;

  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? null : data;
}

function textoOuNull(value) {
  return value === undefined || value === null || value === "" ? null : String(value);
}

function normalizarEndereco(endereco) {
  if (!endereco || typeof endereco !== "object") return null;

  const rua = textoOuNull(endereco.rua);
  const cidade = textoOuNull(endereco.cidade);
  const bairro = textoOuNull(endereco.bairro);
  const numero = endereco.numero === undefined || endereco.numero === null || endereco.numero === ""
    ? null
    : Number(endereco.numero);

  if (!rua && !cidade && !bairro && numero === null) return null;

  return {
    rua,
    cidade,
    bairro,
    numero: Number.isNaN(numero) ? null : numero,
  };
}

function normalizarConvenios(convenio) {
  const convenios = Array.isArray(convenio) ? convenio : convenio ? [convenio] : [];

  return convenios
    .map(item => ({
      nome: textoOuNull(item?.nome),
      numCarteirinha: textoOuNull(item?.numCarteirinha),
      validade: dataOuNull(item?.validade),
    }))
    .filter(item => item.nome);
}

function mapProntuario(registro) {
  const receita = registro.receita;
  const medico = receita?.medico;
  const doctor = medico?.usuario?.nome || "Medico";

  const prescription = receita
    ? [
        receita.medicamento ? `Medicamento: ${receita.medicamento}` : "",
        receita.dosagem ? `Dosagem: ${receita.dosagem}` : "",
        receita.dias ? `Duracao: ${receita.dias}` : "",
      ].filter(Boolean).join("\n")
    : "";

  return {
    id: registro.id,
    date: registro.data?.toISOString().slice(0, 10) || "",
    doctor,
    specialty: medico?.especialidade || "",
    complaints: registro.observacao || receita?.observacao || "Consulta registrada",
    diagnosis: registro.observacao || "",
    prescription,
    notes: receita?.observacao || "",
  };
}

function abrirUrlExame(pacienteId, prontuarioId, exameId) {
  return `/pacientes/${pacienteId}/prontuario/${prontuarioId}/exames/${exameId}/anexo/abrir`;
}

function mapExameProntuario(exame, pacienteId, prontuarioId) {
  const temAnexo = Boolean(exame.imagem || exame.anexoImagem);

  return {
    id: exame.id,
    nome: exame.nome || "Exame",
    observacao: exame.observacao || "",
    temAnexo,
    abrirUrl: temAnexo ? abrirUrlExame(pacienteId, prontuarioId, exame.id) : null,
  };
}

async function hashSenha(senha) {
  return argon2.hash(senha || "123456", {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

const listarTodos = (filtros = {}) => {
  const { busca, sexo, usuarioId } = filtros;

  return prisma.paciente.findMany({
    where: {
      ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
      usuario: {
        ...(sexo ? { sexo } : {}),
        ...(busca ? { nome: { contains: busca } } : {}),
      },
    },
    include: includeUsuario,
    orderBy: { id: "desc" },
  });
};

const buscarPorId = (id) => {
  return prisma.paciente.findUnique({
    where: { id },
    include: includeUsuario,
  });
};

const buscarPorCPF = async (cpf) => {
  const cpfNumerico = onlyDigits(cpf);
  if (!cpfNumerico) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { cpf: cpfNumerico },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      rg: true,
      telefone: true,
      ativo: true,
      role: true,
      sexo: true,
      paciente: {
        select: {
          id: true,
          localnasc: true,
          DataNasc: true,
          estadoCivil: true,
          tipoSanguineo: true,
          peso: true,
          altura: true,
          alergia: true,
          medicamento: true,
          observacao: true,
          endereco: {
            select: {
              rua: true,
              cidade: true,
              bairro: true,
              numero: true,
            },
          },
          convenio: {
            select: {
              id: true,
              nome: true,
              numCarteirinha: true,
              validade: true,
            },
          },
        },
      },
    },
  });

  return usuario;
};

const listarProntuario = async (pacienteId) => {
  const id = Number(pacienteId);
  if (!id) return [];

  const registros = await prisma.prontuario.findMany({
    where: { pacienteId: id },
    include: {
      medico: {
        include: {
          usuario: true,
        },
      },
      receita: true,
      exames: true,
    },
    orderBy: { data: "desc" },
  });

  return registros.map((r) => ({
    id: r.id,
    medicoId: r.medicoId,
    data: r.data?.toISOString().slice(0, 10) || "",
    observacao: r.observacao || "",
    medicamento: r.medicamento || r.receita?.medicamento || "",
    dosagem: r.dosagem || r.receita?.dosagem || "",
    dias: r.dias || r.receita?.dias || "",
    observacaoReceita: r.observacaoReceita || r.receita?.observacao || "",
    exames: (r.exames || []).map((e) => mapExameProntuario(e, id, r.id)),
  }));
};

function dataProntuario(value) {
  if (!value) return new Date();

  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? new Date() : data;
}

function textoOuVazio(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

async function criarNotificacaoSegura(dados) {
  try {
    await notificacoesModel.criarNotificacao(dados);
  } catch (err) {
    console.error("Nao foi possivel criar notificacao:", err.message);
  }
}

const criarProntuario = async (pacienteId, dados = {}) => {
  const id = Number(pacienteId);
  const medicoId = Number(dados.medicoId);

  if (!id) return null;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { id: true, usuario: { select: { nome: true } } },
  });

  if (!paciente) return null;
  if (!medicoId) {
    const erro = new Error("medicoId e obrigatorio");
    erro.status = 400;
    throw erro;
  }

  const medico = await prisma.medico.findUnique({
    where: { id: medicoId },
    select: { id: true },
  });

  if (!medico) {
    const erro = new Error("Medico nao encontrado");
    erro.status = 404;
    throw erro;
  }

  const examesData = Array.isArray(dados.exames) ? dados.exames : [];

  const registro = await prisma.$transaction(async (tx) => {
    const receita = await tx.receita.create({
      data: {
        pacienteId: id,
        medicoId,
        medicamento: textoOuVazio(dados.medicamento),
        dosagem: textoOuVazio(dados.dosagem),
        dias: textoOuVazio(dados.dias),
        observacao: textoOuVazio(dados.observacaoReceita),
      },
    });

    const prontuario = await tx.prontuario.create({
      data: {
        pacienteId: id,
        medicoId,
        receitaId: receita.id,
        data: dataProntuario(dados.data),
        observacao: textoOuVazio(dados.observacao) || "Consulta registrada",
        medicamento: textoOuVazio(dados.medicamento),
        dosagem: textoOuVazio(dados.dosagem),
        dias: textoOuVazio(dados.dias),
        observacaoReceita: textoOuVazio(dados.observacaoReceita),
      },
    });

    if (examesData.length > 0) {
      await tx.exame.createMany({
        data: examesData.map((e) => ({
          nome: textoOuVazio(e.nome) || "Exame",
          observacao: textoOuVazio(e.observacao),
          pacienteId: id,
          medicoId,
          prontuarioId: prontuario.id,
        })),
      });
    }

    return tx.prontuario.findUnique({
      where: { id: prontuario.id },
      include: {
  exames: true,
      },
    });
  });

  const resultado = {
    id: registro.id,
    medicoId: registro.medicoId,
    data: registro.data?.toISOString().slice(0, 10) || "",
    observacao: registro.observacao || "",
    medicamento: registro.medicamento || "",
    dosagem: registro.dosagem || "",
    dias: registro.dias || "",
    observacaoReceita: registro.observacaoReceita || "",
    exames: (registro.exames || []).map((e) => ({
      id: e.id,
      nome: e.nome || "Exame",
      observacao: e.observacao || "",
    })),
  };

  if (dados.notificar !== false) {
    await criarNotificacaoSegura({
      titulo: "Prontuario registrado",
      mensagem: `Novo registro adicionado ao prontuario de ${paciente.usuario?.nome || "paciente"}.`,
      usuarioId: id,
    });
  }

  return resultado;
};

const criar = async (dados) => {
  const endereco = normalizarEndereco(dados.endereco);
  const convenios = normalizarConvenios(dados.convenio);
  const usuarioData = {
    nome: dados.nome,
    email: dados.email,
    senha: (await hashSenha(dados.senhaPlana)),
    idade: Number(dados.idade) || 0,
    sexo: dados.sexo || "Nao informado",
    rg: dados.rg || `RG-${Date.now()}`,
    cpf: onlyDigits(dados.cpf),
    telefone: onlyDigits(dados.telefone),
    role: "PACIENTE",
  };

  return prisma.paciente.create({
    data: {
      localnasc: dados.localnasc || null,
      DataNasc: dataOuNull(dados.dataNasc ?? dados.DataNasc),
      estadoCivil: dados.estadoCivil || null,
      tipoSanguineo: dados.tipoSanguineo || null,
      peso: dados.peso === undefined || dados.peso === "" ? null : Number(dados.peso),
      altura: dados.altura === undefined || dados.altura === "" ? null : Number(dados.altura),
      alergia: dados.alergia || null,
      medicamento: dados.medicamento || null,
      observacao: dados.observacao || null,
      deficiencia: dados.deficiencia || null,
      doencas: dados.doencas ? (Array.isArray(dados.doencas) ? JSON.stringify(dados.doencas) : dados.doencas) : null,
      usuario: {
        create: usuarioData,
      },
      ...(endereco ? { endereco: { create: endereco } } : {}),
      ...(convenios.length > 0 ? { convenio: { create: convenios } } : {}),
    },
    include: includeUsuario,
  });
};

const atualizar = async (id, dados) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!paciente) return null;

  const endereco = dados.endereco !== undefined ? normalizarEndereco(dados.endereco) : undefined;
  const convenios = dados.convenio !== undefined ? normalizarConvenios(dados.convenio) : undefined;
  const convenioAtualizado = convenios !== undefined
    ? {
        convenio: {
          deleteMany: {},
          ...(convenios.length > 0 ? { create: convenios } : {}),
        },
      }
    : {};

  return prisma.paciente.update({
    where: { id },
    data: {
      ...(dados.localnasc !== undefined ? { localnasc: dados.localnasc } : {}),
      ...(dados.dataNasc !== undefined || dados.DataNasc !== undefined
        ? { DataNasc: dataOuNull(dados.dataNasc ?? dados.DataNasc) }
        : {}),
      ...(dados.estadoCivil !== undefined ? { estadoCivil: dados.estadoCivil } : {}),
      ...(dados.tipoSanguineo !== undefined ? { tipoSanguineo: dados.tipoSanguineo } : {}),
      ...(dados.peso !== undefined ? { peso: Number(dados.peso) || null } : {}),
      ...(dados.altura !== undefined ? { altura: Number(dados.altura) || null } : {}),
      ...(dados.alergia !== undefined ? { alergia: dados.alergia } : {}),
      ...(dados.medicamento !== undefined ? { medicamento: dados.medicamento } : {}),
      ...(dados.observacao !== undefined ? { observacao: dados.observacao } : {}),
      ...(dados.deficiencia !== undefined ? { deficiencia: dados.deficiencia } : {}),
      ...(dados.doencas !== undefined
        ? { doencas: dados.doencas ? (Array.isArray(dados.doencas) ? JSON.stringify(dados.doencas) : dados.doencas) : null }
        : {}),
      ...(endereco !== undefined
        ? {
            endereco: {
              upsert: {
                create: endereco || {},
                update: endereco || {},
              },
            },
          }
        : {}),
      ...convenioAtualizado,
      ...(paciente.usuarioId
        ? {
            usuario: {
              update: {
                ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
                ...(dados.email !== undefined ? { email: dados.email } : {}),
                ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
                ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
                ...(dados.rg !== undefined ? { rg: dados.rg } : {}),
                ...(dados.cpf !== undefined ? { cpf: onlyDigits(dados.cpf) } : {}),
                ...(dados.telefone !== undefined ? { telefone: onlyDigits(dados.telefone) } : {}),
              },
            },
          }
        : {}),
    },
    include: includeUsuario,
  });
};

const remover = async (id) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!paciente || !paciente.usuarioId) return null;

  return prisma.paciente.update({
    where: { id },
    data: {
      usuario: {
        update: {
          ativo: false,
        },
      },
    },
    include: includeUsuario,
  });
};

const adicionarExame = async (pacienteId, prontuarioId, dados) => {
  const id = Number(pacienteId);
  const prontuarioNum = Number(prontuarioId);

  if (!id || !prontuarioNum) return null;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!paciente) return null;

  const prontuario = await prisma.prontuario.findUnique({
    where: { id: prontuarioNum },
    select: { id: true },
  });

  if (!prontuario) return null;

  const exame = await prisma.exame.create({
    data: {
      nome: textoOuVazio(dados.nome) || "Exame",
      observacao: textoOuVazio(dados.observacao),
      pacienteId: id,
      medicoId: prontuario.medicoId || 1,
      prontuarioId: prontuarioNum,
    },
  });

  const prontuarioAtualizado = await prisma.prontuario.findUnique({
    where: { id: prontuarioNum },
    include: { exames: true },
  });

  return {
    prontuario: {
      id: prontuarioAtualizado.id,
      exames: (prontuarioAtualizado.exames || []).map((e) => mapExameProntuario(e, id, prontuarioNum)),
    },
  };
};

const adicionarAnexoExame = async (pacienteId, prontuarioId, exameId, imagemUrl) => {
  const id = Number(pacienteId);
  const prontuarioNum = Number(prontuarioId);
  const exameNum = Number(exameId);

  if (!id || !prontuarioNum || !exameNum) return null;

  const exame = await prisma.exame.findUnique({
    where: { id: exameNum },
    select: { id: true, pacienteId: true, prontuarioId: true },
  });

  if (!exame) return null;
  if (exame.pacienteId !== id || exame.prontuarioId !== prontuarioNum) return null;

  const exameAtualizado = await prisma.exame.update({
    where: { id: exameNum },
    data: {
      imagem: imagemUrl,
      anexoImagem: imagemUrl,
    },
  });

  if (exame.prontuarioId) {
    const prontuario = await prisma.prontuario.findUnique({
      where: { id: exame.prontuarioId },
      include: { exames: true },
    });

    return {
      prontuario: {
        id: prontuario.id,
        exames: (prontuario.exames || []).map((e) => ({
          ...mapExameProntuario(e, id, prontuario.id),
        })),
      },
    };
  }

  return exameAtualizado;
};

const buscarAnexoExame = async (pacienteId, prontuarioId, exameId) => {
  const id = Number(pacienteId);
  const prontuarioNum = Number(prontuarioId);
  const exameNum = Number(exameId);

  if (!id || !prontuarioNum || !exameNum) return null;

  const exame = await prisma.exame.findUnique({
    where: { id: exameNum },
    select: {
      id: true,
      nome: true,
      imagem: true,
      anexoImagem: true,
      pacienteId: true,
      prontuarioId: true,
    },
  });

  if (!exame) return null;
  if (exame.pacienteId !== id || exame.prontuarioId !== prontuarioNum) return null;

  const caminho = exame.imagem || exame.anexoImagem;
  if (!caminho) return null;

  return {
    id: exame.id,
    nome: exame.nome || `exame-${exame.id}`,
    caminho,
  };
};

module.exports = {
  listarTodos,
  buscarPorId,
  buscarPorCPF,
  listarProntuario,
  criarProntuario,
  criar,
  atualizar,
  remover,
  adicionarExame,
  adicionarAnexoExame,
  buscarAnexoExame,
};
