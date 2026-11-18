/**
 * Gestão Detalhada de Permissões e Recursos por Menu
 */

export const MENU_SECTIONS = [
  {
    key: "dashboard",
    title: "Dashboard",
    descricao: "Painel inicial, visão geral e indicadores da igreja",
    iconName: "LayoutDashboard",
    path: "/admin",
    recursos: [
      { key: "dashboard.indicadores", label: "Indicadores Gerais", descricao: "Total de membros, congregações, projetos e dízimos" },
      { key: "dashboard.graficos", label: "Gráficos Financeiros", descricao: "Balanço comparativo de receitas e despesas" },
      { key: "dashboard.eventos", label: "Alertas & Eventos", descricao: "Próximas reuniões do conselho e escalas de cultos" }
    ]
  },
  {
    key: "estatisticas",
    title: "Estatísticas",
    descricao: "Relatórios de cultos, conversões, batismos e casamentos",
    iconName: "BarChart3",
    path: "/admin/estatisticas",
    recursos: [
      { key: "estatisticas.visualizar", label: "Visualizar Relatórios", descricao: "Consultar histórico anual e gráficos de crescimento" },
      { key: "estatisticas.gerenciar", label: "Lançar / Editar Métricas", descricao: "Inserir e atualizar dados de novos convertidos e batismos" },
      { key: "estatisticas.exportar", label: "Exportar Relatórios", descricao: "Impressão e exportação de relatórios estatísticos" }
    ]
  },
  {
    key: "membros",
    title: "Recursos Humanos - Membros",
    descricao: "Cadastro geral e controle de membros da igreja",
    iconName: "Users",
    path: "/admin/membros",
    recursos: [
      { key: "membros.visualizar", label: "Visualizar Lista de Membros", descricao: "Pesquisar e consultar fichas detalhadas de membros" },
      { key: "membros.cadastrar", label: "Cadastrar Novo Membro", descricao: "Adicionar novos membros com dados pessoais e batismo" },
      { key: "membros.editar", label: "Editar Dados de Membros", descricao: "Alterar status, endereço, contatos e departamentos" },
      { key: "membros.excluir", label: "Excluir Membro", descricao: "Remover registros de membros da congregação" },
      { key: "membros.documentos", label: "Gestão de Documentos (PDF)", descricao: "Anexar e visualizar certificados e documentos de membros" }
    ]
  },
  {
    key: "departamentos",
    title: "Recursos Humanos - Departamentos",
    descricao: "Ministérios, sociedades internas e membros vinculados",
    iconName: "Layers",
    path: "/admin/departamentos",
    recursos: [
      { key: "departamentos.visualizar", label: "Visualizar Departamentos", descricao: "Listar ministérios, responsáveis e contagens" },
      { key: "departamentos.ver_membros", label: "Visualizar Membros do Departamento", descricao: "Abrir modal com membros de cada ministério" },
      { key: "departamentos.vincular_membros", label: "Vincular / Desvincular Membros", descricao: "Adicionar ou retirar membros dos departamentos" },
      { key: "departamentos.gerenciar", label: "Criar e Editar Departamentos", descricao: "Cadastrar novos departamentos e alterar líderes" },
      { key: "departamentos.excluir", label: "Excluir Departamento", descricao: "Remover departamentos do sistema" }
    ]
  },
  {
    key: "conselho",
    title: "Direção - Conselho de Presbitério",
    descricao: "Membros do conselho presbiteral e liderança institucional",
    iconName: "Crown",
    path: "/admin/conselho",
    recursos: [
      { key: "conselho.visualizar", label: "Visualizar Integrantes do Conselho", descricao: "Consultar presidentes, secretários e presbíteros" },
      { key: "conselho.gerenciar", label: "Cadastrar / Editar Líderes", descricao: "Nomear e atualizar funções no conselho" },
      { key: "conselho.excluir", label: "Excluir Integrantes", descricao: "Remover integrantes do Conselho" },
      { key: "conselho.direcao_restrita", label: "Direção Restrita", descricao: "Atos e consultas de pastores titulares" }
    ]
  },
  {
    key: "secretaria",
    title: "Direção - Secretaria",
    descricao: "Reuniões oficiais, pautas, atas e escalas de culto",
    iconName: "UserCog",
    path: "/admin/secretaria",
    recursos: [
      { key: "secretaria.reunioes", label: "Reuniões & Pautas", descricao: "Agendar reuniões e redigir pautas de deliberação" },
      { key: "secretaria.escalas", label: "Escalas de Culto", descricao: "Escalar equipes de louvor, recepção e evangelismo" },
      { key: "secretaria.atas_documentos", label: "Atas & Documentos", descricao: "Gestão de atas aprovadas e estatutos da igreja" }
    ]
  },
  {
    key: "entradas",
    title: "Finanças - Entradas",
    descricao: "Dízimos, ofertas e receitas financeiras da igreja",
    iconName: "Banknote",
    path: "/admin/entradas",
    recursos: [
      { key: "entradas.visualizar", label: "Visualizar Entradas", descricao: "Consultar relatórios de dízimos e ofertas" },
      { key: "entradas.dizimos", label: "Lançar Dízimos", descricao: "Registrar dízimos vinculados aos membros da igreja" },
      { key: "entradas.ofertas", label: "Lançar Ofertas", descricao: "Registrar ofertas de cultos e doações especiais" },
      { key: "entradas.editar", label: "Editar Lançamentos", descricao: "Corrigir dados dos lançamentos existentes" },
      { key: "entradas.cancelar", label: "Cancelar / Excluir Entradas", descricao: "Estornar ou excluir lançamentos de entrada" }
    ]
  },
  {
    key: "encargos",
    title: "Finanças - Encargos",
    descricao: "Despesas, contas a pagar e custos operacionais",
    iconName: "Banknote",
    path: "/admin/encargos",
    recursos: [
      { key: "encargos.visualizar", label: "Visualizar Encargos", descricao: "Consultar despesas de água, luz, aluguéis e obras" },
      { key: "encargos.cadastrar", label: "Cadastrar Nova Despesa", descricao: "Lançar novas contas a pagar no sistema" },
      { key: "encargos.editar", label: "Editar Dados de Despesa", descricao: "Alterar descrição, valor, data e categoria das despesas" },
      { key: "encargos.status", label: "Atualizar Status de Pagamento", descricao: "Marcar contas como pagas, pendentes ou canceladas" },
      { key: "encargos.excluir", label: "Excluir Encargos", descricao: "Remover contas cadastradas" }
    ]
  },
  {
    key: "projetos",
    title: "Finanças - Projetos",
    descricao: "Projetos de evangelismo, obras sociais e captação de recursos",
    iconName: "Pickaxe",
    path: "/admin/projetos",
    recursos: [
      { key: "projetos.visualizar", label: "Visualizar Projetos", descricao: "Acompanhar metas e projetos em andamento" },
      { key: "projetos.gerenciar", label: "Cadastrar e Editar Projetos", descricao: "Criar novos projetos e alterar orçamentos" },
      { key: "projetos.arrecadacao", label: "Atualizar Valores Arrecadados", descricao: "Lançar valores captados para o projeto" },
      { key: "projetos.excluir", label: "Excluir Projetos", descricao: "Remover registros de projetos" }
    ]
  },
  {
    key: "patrimonio",
    title: "Patrimônio - Bens & Equipamentos",
    descricao: "Inventário de imóveis, veículos, som e equipamentos",
    iconName: "Building2",
    path: "/admin/patrimonio",
    recursos: [
      { key: "patrimonio.visualizar", label: "Visualizar Inventário", descricao: "Consultar lista de bens ativos e estados de conservação" },
      { key: "patrimonio.gerenciar", label: "Cadastrar e Editar Bens", descricao: "Registrar novos itens, valores e vida útil" },
      { key: "patrimonio.excluir", label: "Excluir do Patrimônio", descricao: "Dar baixa ou excluir itens do inventário" }
    ]
  },
  {
    key: "igrejas",
    title: "Patrimônio - Igrejas Filiadas",
    descricao: "Congregações locais, filiais e campos missionários",
    iconName: "Map",
    path: "/admin/igrejas",
    recursos: [
      { key: "igrejas.visualizar", label: "Visualizar Igrejas e Congregações", descricao: "Consultar congregações ativas e endereços" },
      { key: "igrejas.gerenciar", label: "Cadastrar e Editar Congregações", descricao: "Inserir novas congregações e endereços" },
      { key: "igrejas.pastores", label: "Atribuir Pastores Responsáveis", descricao: "Designar pastores para as congregações" },
      { key: "igrejas.excluir", label: "Excluir Congregações", descricao: "Remover congregações cadastradas" }
    ]
  },
  {
    key: "configuracoes",
    title: "Configurações do Sistema",
    descricao: "Administração global, fotos do carrossel, usuários e sistema",
    iconName: "Settings",
    path: "/admin/configuracoes",
    recursos: [
      { key: "configuracoes.sistema", label: "Geral do Sistema", descricao: "Nome da igreja, idioma padrão e dados institucionais" },
      { key: "configuracoes.carrossel", label: "Gestão do Carrossel de Fotos", descricao: "Adicionar, editar e ordenar fotos do carrossel no site" },
      { key: "configuracoes.videos", label: "Gestão de Vídeos do Site", descricao: "Adicionar, editar e publicar vídeos no site" },
      { key: "configuracoes.usuarios", label: "Usuários e Privilégios Detalhados", descricao: "Cadastrar usuários e configurar privilégios granulares" },
      { key: "configuracoes.cultos", label: "Programação de Cultos", descricao: "Cadastrar e alterar dias e horários dos cultos" },
      { key: "configuracoes.projetos", label: "Configuração de Projetos", descricao: "Gerenciar projetos institucionais" },
      { key: "configuracoes.noticias", label: "Notícias & Avisos do Site", descricao: "Publicar novidades e comunicados institucionais" },
      { key: "configuracoes.politica", label: "Política de Bom Uso", descricao: "Editar o termo que aparece no login" },
      { key: "configuracoes.backup", label: "Backup e Restauração", descricao: "Exportar e restaurar os dados do sistema" },
      { key: "configuracoes.logs", label: "Logs do Sistema", descricao: "Consultar o histórico de atividades administrativas" }
    ]
  }
];

// Lista linear simples para compatibilidade
export const MENU_RESOURCES = MENU_SECTIONS.map(s => ({
  key: s.key,
  label: s.title,
  descricao: s.descricao,
  path: s.path,
  categoria: s.title
}));

// Todos os códigos de sub-recursos + menus
export const ALL_SUB_PERMISSION_KEYS = MENU_SECTIONS.flatMap(s => [
  s.key,
  ...s.recursos.map(r => r.key)
]);

export const ALL_PERMISSION_KEYS = ALL_SUB_PERMISSION_KEYS;

export const ROLE_PRESETS = {
  admin: {
    label: "Administrador Geral",
    descricao: "Acesso total a todos os menus e recursos detalhados",
    permissions: ALL_PERMISSION_KEYS
  },
  pastor: {
    label: "Pastor / Direção",
    descricao: "Acesso amplo a membros, liderança, cultos, conselho e projetos",
    permissions: [
      "dashboard", "dashboard.indicadores", "dashboard.graficos", "dashboard.eventos",
      "estatisticas", "estatisticas.visualizar", "estatisticas.gerenciar", "estatisticas.exportar",
      "membros", "membros.visualizar", "membros.cadastrar", "membros.editar", "membros.documentos",
      "departamentos", "departamentos.visualizar", "departamentos.ver_membros", "departamentos.vincular_membros", "departamentos.gerenciar",
      "conselho", "conselho.visualizar", "conselho.gerenciar", "conselho.direcao_restrita",
      "secretaria", "secretaria.reunioes", "secretaria.escalas", "secretaria.atas_documentos",
      "projetos", "projetos.visualizar", "projetos.gerenciar", "projetos.arrecadacao",
      "igrejas", "igrejas.visualizar", "igrejas.gerenciar", "igrejas.pastores"
    ]
  },
  secretaria: {
    label: "Secretaria Geral",
    descricao: "Acesso operacional a membros, departamentos, reuniões e atas",
    permissions: [
      "dashboard", "dashboard.indicadores", "dashboard.eventos",
      "membros", "membros.visualizar", "membros.cadastrar", "membros.editar", "membros.documentos",
      "departamentos", "departamentos.visualizar", "departamentos.ver_membros", "departamentos.vincular_membros",
      "conselho", "conselho.visualizar",
      "secretaria", "secretaria.reunioes", "secretaria.escalas", "secretaria.atas_documentos"
    ]
  },
  tesouraria: {
    label: "Tesouraria / Finanças",
    descricao: "Acesso a relatórios financeiros, dízimos, ofertas, despesas, projetos e patrimônio",
    permissions: [
      "dashboard", "dashboard.indicadores", "dashboard.graficos",
      "estatisticas", "estatisticas.visualizar", "estatisticas.exportar",
      "entradas", "entradas.visualizar", "entradas.dizimos", "entradas.ofertas", "entradas.editar",
      "encargos", "encargos.visualizar", "encargos.cadastrar", "encargos.editar", "encargos.status",
      "projetos", "projetos.visualizar", "projetos.gerenciar", "projetos.arrecadacao",
      "patrimonio", "patrimonio.visualizar", "patrimonio.gerenciar",
      "igrejas", "igrejas.visualizar"
    ]
  },
  lider: {
    label: "Líder de Departamento",
    descricao: "Acesso ao painel inicial, seus departamentos e visualização de membros",
    permissions: [
      "dashboard", "dashboard.indicadores",
      "membros", "membros.visualizar",
      "departamentos", "departamentos.visualizar", "departamentos.ver_membros"
    ]
  },
  personalizado: {
    label: "Personalizado",
    descricao: "Permissões configuradas minuciosamente recurso por recurso",
    permissions: ["dashboard", "dashboard.indicadores"]
  }
};

/**
 * Verifica se um usuário possui determinado privilégio.
 * Suporta checagem de menu principal (ex: 'membros') e checagem granular (ex: 'membros.cadastrar')
 */
export const hasPermission = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === "admin" || user.email === "admin@iel.com" || user.email === "admin@igb.org") {
    return true;
  }
  if (!user.permissoes || !Array.isArray(user.permissoes)) {
    return false;
  }
  if (user.permissoes.includes("all") || user.permissoes.includes("*")) {
    return true;
  }

  // Checagem direta
  if (user.permissoes.includes(permissionKey)) {
    return true;
  }

  // Se estiver checando um menu principal (ex: 'membros'), verifica se o usuário tem qualquer sub-recurso desse menu
  if (!permissionKey.includes(".")) {
    const hasAnySub = user.permissoes.some(p => p.startsWith(`${permissionKey}.`));
    if (hasAnySub) return true;
  }

  // Uma permissão de menu sem permissões granulares é tratada como acesso legado ao menu inteiro.
  // Quando há permissões granulares, a chave do menu só permite entrar na página, não todos os recursos.
  const parentMenu = permissionKey.split(".")[0];
  if (permissionKey.includes(".") && user.permissoes.includes(parentMenu)) {
    const hasGranularPermissions = user.permissoes.some(p => p.startsWith(`${parentMenu}.`));
    return !hasGranularPermissions;
  }

  return false;
};

export const pathToPermissionKey = (pathname) => {
  if (!pathname) return null;
  const clean = pathname.replace(/\/$/, "");
  if (clean === "/admin") return "dashboard";
  if (clean.startsWith("/admin/estatisticas")) return "estatisticas";
  if (clean.startsWith("/admin/membros")) return "membros";
  if (clean.startsWith("/admin/lideres")) return "conselho";
  if (clean.startsWith("/admin/departamentos")) return "departamentos";
  if (clean.startsWith("/admin/conselho") || clean.startsWith("/admin/direcao-restrita")) return "conselho";
  if (clean.startsWith("/admin/secretaria")) return "secretaria";
  if (clean.startsWith("/admin/entradas")) return "entradas";
  if (clean.startsWith("/admin/encargos")) return "encargos";
  if (clean.startsWith("/admin/patrimonio")) return "patrimonio";
  if (clean.startsWith("/admin/projetos")) return "projetos";
  if (clean.startsWith("/admin/igrejas") || clean.startsWith("/admin/filiais")) return "igrejas";
  if (clean.startsWith("/admin/configuracoes")) return "configuracoes";
  return null;
};
