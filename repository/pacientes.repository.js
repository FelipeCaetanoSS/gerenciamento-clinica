const prisma = require("../lib/client");
const notificacoesModel = require("./notificacoes.repository");
const { dataOuNull, texto, textoOuNull } = require("../lib/normalizacao");
const { onzeDigitosNumericos } = require("../lib/validacao");
const { hashSenha, senhaTemporaria } = require("../lib/senha");
const { dadosAuditoria, dadosAuditoriaRelacao, dadosDesativacaoRelacao, includeAlteradoPor, withUltimaAlteracao } = require("./auditoria.repository");

const includeUsuario = {
  usuario: true,
  convenio: true,
  endereco: true,
  exame: true,
  ...includeAlteradoPor,
};

const includeProntuarioDetalhado = {
  medico: {
    include: {
      usuario: true,
    },
  },
  receita: true,
  exames: {
    include: includeAlteradoPor,
  },
  ...includeAlteradoPor,
};

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
    ultimaAlteracao: withUltimaAlteracao(exame)?.ultimaAlteracao || null,
  };
}

function prontuarioTemPrescricao(prontuario = {}) {
  const prescricao = camposPrescricaoProntuario(prontuario);

  return Boolean(
    prescricao.medicamento ||
    prescricao.dosagem ||
    prescricao.dias ||
    prescricao.observacaoReceita
  );
}

function camposPrescricaoProntuario(prontuario = {}) {
  return {
    medicamento: textoOuVazio(prontuario.medicamento || prontuario.receita?.medicamento),
    dosagem: textoOuVazio(prontuario.dosagem || prontuario.receita?.dosagem),
    dias: textoOuVazio(prontuario.dias || prontuario.receita?.dias),
    observacaoReceita: textoOuVazio(prontuario.observacaoReceita || prontuario.receita?.observacao),
  };
}

function montarTextoPrescricao(prontuario = {}) {
  const prescricao = camposPrescricaoProntuario(prontuario);

  return [
    prescricao.medicamento ? `Medicamento: ${prescricao.medicamento}` : "",
    prescricao.dosagem ? `Dosagem: ${prescricao.dosagem}` : "",
    prescricao.dias ? `Duracao: ${prescricao.dias}` : "",
    prescricao.observacaoReceita ? `Observacoes: ${prescricao.observacaoReceita}` : "",
  ].filter(Boolean).join("\n");
}

function mapProntuarioDetalhado(registro, pacienteId) {
  const registroComAuditoria = withUltimaAlteracao(registro);
  const { receita, receitaId, ...registroPublico } = registroComAuditoria;
  const prescricao = camposPrescricaoProntuario(registro);

  return {
    ...registroPublico,
    id: registro.id,
    medicoId: registro.medicoId,
    data: registro.data?.toISOString().slice(0, 10) || "",
    observacao: registro.observacao || "",
    medicamento: prescricao.medicamento,
    dosagem: prescricao.dosagem,
    dias: prescricao.dias,
    observacaoReceita: prescricao.observacaoReceita,
    prescription: montarTextoPrescricao(registro),
    prescricaoBaixadaPeloPaciente: Boolean(registro.prescricaoBaixadaPeloPaciente),
    prescricaoDownloadPacienteEm: registro.prescricaoDownloadPacienteEm?.toISOString() || null,
    exames: (registro.exames || []).map((e) => mapExameProntuario(e, pacienteId, registro.id)),
  };
}

const listarTodos = async (filtros = {}) => {
  const { busca, sexo, usuarioId, medicoUsuarioId } = filtros;

  const pacientes = await prisma.paciente.findMany({
    where: {
      ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
      ...(medicoUsuarioId ? {
        agendamento: {
          some: {
            medico: {
              usuarioId: Number(medicoUsuarioId),
            },
          },
        },
      } : {}),
      usuario: {
        ...(sexo ? { sexo } : {}),
        ...(busca ? { nome: { contains: busca } } : {}),
      },
    },
    include: includeUsuario,
    orderBy: { id: "desc" },
  });

  return pacientes.map(withUltimaAlteracao);
};

const buscarPorId = async (id) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: includeUsuario,
  });

  return withUltimaAlteracao(paciente);
};

const buscarPorCPF = async (cpf) => {
  const cpfNormalizado = onzeDigitosNumericos(cpf, "CPF");

  const usuario = await prisma.usuario.findUnique({
    where: { cpf: cpfNormalizado },
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
    include: includeProntuarioDetalhado,
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });

  return registros.map((r) => mapProntuarioDetalhado(r, id));
};

function dataProntuario(value) {
  if (!value) return new Date();

  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? new Date() : data;
}

function textoOuVazio(value) {
  return texto(value);
}

async function criarNotificacaoSegura(dados) {
  try {
    await notificacoesModel.criarNotificacao(dados);
  } catch (err) {
    console.error("Nao foi possivel criar notificacao:", err.message);
  }
}

const criarProntuario = async (pacienteId, dados = {}, usuarioAlteracaoId) => {
  const id = Number(pacienteId);
  const medicoId = Number(dados.medicoId);

  if (!id) return null;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { id: true, usuarioId: true, usuario: { select: { nome: true } } },
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
    const prontuario = await tx.prontuario.create({
      data: {
        pacienteId: id,
        medicoId,
        data: dataProntuario(dados.data),
        observacao: textoOuVazio(dados.observacao) || "Consulta registrada",
        medicamento: textoOuVazio(dados.medicamento),
        dosagem: textoOuVazio(dados.dosagem),
        dias: textoOuVazio(dados.dias),
        observacaoReceita: textoOuVazio(dados.observacaoReceita),
        ...dadosAuditoria(usuarioAlteracaoId),
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
          ...dadosAuditoria(usuarioAlteracaoId),
        })),
      });
    }

    return tx.prontuario.findUnique({
      where: { id: prontuario.id },
      include: includeProntuarioDetalhado,
    });
  });

  const resultado = mapProntuarioDetalhado(registro, id);

  if (dados.notificar !== false) {
    await criarNotificacaoSegura({
      titulo: "Prontuario registrado",
      mensagem: `Novo registro adicionado ao prontuario de ${paciente.usuario?.nome || "paciente"}.`,
      usuarioId: paciente.usuarioId,
      tipo: "prontuario",
      categoria: "medical_record",
    });
  }

  return resultado;
};

const criar = async (dados, usuarioAlteracaoId = dados.usuarioAlteracaoId) => {
  const endereco = normalizarEndereco(dados.endereco);
  const convenios = normalizarConvenios(dados.convenio);
  const usuarioData = {
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha || (await hashSenha(dados.senhaPlana)),
    senhaTemporaria: senhaTemporaria(dados),
    idade: Number(dados.idade) || 0,
    sexo: dados.sexo || "Nao informado",
    rg: dados.rg,
    cpf: onzeDigitosNumericos(dados.cpf, "CPF"),
    telefone: onzeDigitosNumericos(dados.telefone, "Telefone"),
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
      ...dadosAuditoriaRelacao(usuarioAlteracaoId),
    },
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

const atualizar = async (id, dados, usuarioAlteracaoId) => {
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
      ...dadosAuditoriaRelacao(usuarioAlteracaoId),
      ...(paciente.usuarioId
        ? {
            usuario: {
              update: {
                ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
                ...(dados.email !== undefined ? { email: dados.email } : {}),
                ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
                ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
                ...(dados.rg !== undefined ? { rg: dados.rg } : {}),
                ...(dados.cpf !== undefined ? { cpf: onzeDigitosNumericos(dados.cpf, "CPF") } : {}),
                ...(dados.telefone !== undefined ? { telefone: onzeDigitosNumericos(dados.telefone, "Telefone") } : {}),
              },
            },
          }
        : {}),
    },
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

const remover = async (id, usuarioAlteracaoId) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!paciente || !paciente.usuarioId) return null;

  return prisma.paciente.update({
    where: { id },
    data: dadosDesativacaoRelacao(usuarioAlteracaoId),
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

const adicionarExame = async (pacienteId, prontuarioId, dados, usuarioAlteracaoId) => {
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
    select: { id: true, medicoId: true },
  });

  if (!prontuario) return null;

  const exame = await prisma.exame.create({
    data: {
      nome: textoOuVazio(dados.nome) || "Exame",
      observacao: textoOuVazio(dados.observacao),
      pacienteId: id,
      medicoId: prontuario.medicoId || 1,
      prontuarioId: prontuarioNum,
      ...dadosAuditoria(usuarioAlteracaoId),
    },
  });

  const prontuarioAtualizado = await prisma.prontuario.findUnique({
    where: { id: prontuarioNum },
    include: includeProntuarioDetalhado,
  });

  return {
    prontuario: mapProntuarioDetalhado(prontuarioAtualizado, id),
  };
};

const baixarReceitaProntuario = async (pacienteId, prontuarioId, usuarioAlteracaoId) => {
  const id = Number(pacienteId);
  const prontuarioNum = Number(prontuarioId);

  if (!id || !prontuarioNum) return null;

  const prontuario = await prisma.prontuario.findUnique({
    where: { id: prontuarioNum },
    include: {
      receita: true,
    },
  });

  if (!prontuario || prontuario.pacienteId !== id) return null;

  if (!prontuarioTemPrescricao(prontuario)) {
    const erro = new Error("Prontuario nao possui receita para download");
    erro.status = 409;
    throw erro;
  }

  const baixadoEm = new Date();
  const prontuarioAtualizado = await prisma.prontuario.update({
    where: { id: prontuarioNum },
    data: {
      prescricaoBaixadaPeloPaciente: true,
      prescricaoDownloadPacienteEm: baixadoEm,
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    include: includeProntuarioDetalhado,
  });

  const prontuarioMapeado = mapProntuarioDetalhado(prontuarioAtualizado, id);

  return {
    prontuario: prontuarioMapeado,
    prescricaoBaixadaPeloPaciente: true,
    prescricaoDownloadPacienteEm: prontuarioMapeado.prescricaoDownloadPacienteEm,
  };
};

const adicionarAnexoExame = async (pacienteId, prontuarioId, exameId, imagemUrl, usuarioAlteracaoId) => {
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
      ...dadosAuditoria(usuarioAlteracaoId),
    },
  });

  if (exame.prontuarioId) {
    const prontuario = await prisma.prontuario.findUnique({
      where: { id: exame.prontuarioId },
      include: includeProntuarioDetalhado,
    });

    return {
      prontuario: mapProntuarioDetalhado(prontuario, id),
    };
  }

  return withUltimaAlteracao(exameAtualizado);
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
  baixarReceitaProntuario,
  adicionarAnexoExame,
  buscarAnexoExame,
};
