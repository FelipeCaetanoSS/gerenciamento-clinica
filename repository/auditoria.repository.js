const usuarioAuditoriaSelect = {
  id: true,
  nome: true,
  role: true,
};

const includeAlteradoPor = {
  alteradoPor: {
    select: usuarioAuditoriaSelect,
  },
};

function dadosAuditoria(usuarioId) {
  const id = Number(usuarioId);
  if (!id) return {};

  return {
    alteradoPorId: id,
    alteradoEm: new Date(),
  };
}

function dadosAuditoriaRelacao(usuarioId) {
  const id = Number(usuarioId);
  if (!id) return {};

  return {
    alteradoPor: {
      connect: { id },
    },
    alteradoEm: new Date(),
  };
}

function dadosDesativacao(usuarioId) {
  return {
    ativo: false,
    ...dadosAuditoria(usuarioId),
  };
}

function dadosDesativacaoRelacao(usuarioId) {
  return {
    ...dadosAuditoriaRelacao(usuarioId),
    usuario: {
      update: {
        ativo: false,
      },
    },
  };
}

function mapUltimaAlteracao(registro) {
  if (!registro?.alteradoPor) return null;

  return {
    usuarioId: registro.alteradoPor.id,
    nome: registro.alteradoPor.nome,
    role: registro.alteradoPor.role,
    em: registro.alteradoEm?.toISOString?.() || registro.alteradoEm || null,
  };
}

function withUltimaAlteracao(registro) {
  if (!registro || typeof registro !== "object") return registro;

  const { alteradoPor, alteradoPorId, alteradoEm, ...restante } = registro;

  return {
    ...restante,
    alteradoPorId,
    alteradoEm,
    ultimaAlteracao: mapUltimaAlteracao(registro),
  };
}

module.exports = {
  dadosAuditoria,
  dadosAuditoriaRelacao,
  dadosDesativacao,
  dadosDesativacaoRelacao,
  includeAlteradoPor,
  usuarioAuditoriaSelect,
  withUltimaAlteracao,
};
