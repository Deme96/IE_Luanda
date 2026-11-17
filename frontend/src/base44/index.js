/**
 * MOCK do Base44 SDK e BaaS
 * Persistência e autenticação via localStorage
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ALL_PERMISSIONS = [
  "dashboard",
  "estatisticas",
  "membros",
  "departamentos",
  "conselho",
  "secretaria",
  "entradas",
  "encargos",
  "patrimonio",
  "projetos",
  "igrejas",
  "configuracoes"
];

const CAROUSEL_CONTENT_VERSION = 4;
const USER_DATA_ONLY_VERSION = 2;

const clearSystemCollections = (db, preserveCarousel = false) => {
  for (const [key, value] of Object.entries(db)) {
    if (key !== "users" && !(preserveCarousel && key === "Carousel") && Array.isArray(value)) {
      db[key] = JSON.parse(JSON.stringify(DEFAULT_DB[key] || []));
    }
  }
  if (preserveCarousel && (!Array.isArray(db.Carousel) || db.Carousel.length === 0)) {
    db.Carousel = JSON.parse(JSON.stringify(DEFAULT_DB.Carousel));
  }
  db.Configuracoes = JSON.parse(JSON.stringify(DEFAULT_DB.Configuracoes));
  db._carouselContentVersion = CAROUSEL_CONTENT_VERSION;
  db._userDataOnlyVersion = USER_DATA_ONLY_VERSION;
  return db;
};

const DEFAULT_DB = {
  _carouselContentVersion: CAROUSEL_CONTENT_VERSION,
  users: [
    {
      id: "1",
      nome: "Administrador Geral",
      email: "admin@iel.com",
      password: "admin",
      role: "admin",
      status: "ativo",
      permissoes: ALL_PERMISSIONS
    },
    {
      id: "2",
      nome: "Secretaria Geral",
      email: "secretaria@iel.com",
      password: "admin",
      role: "secretaria",
      status: "ativo",
      permissoes: ["dashboard", "membros", "departamentos", "conselho", "secretaria"]
    },
    {
      id: "3",
      nome: "Tesouraria Financeira",
      email: "financeiro@iel.com",
      password: "admin",
      role: "tesouraria",
      status: "ativo",
      permissoes: ["dashboard", "estatisticas", "entradas", "encargos", "patrimonio"]
    }
  ],
  Carousel: [
    {
      id: "site-church-exterior-v2",
      titulo: "Nossa Igreja por Fora",
      descricao: "Um espaço de fé e acolhimento para toda a comunidade. Foto: Horakvlado / Wikimedia Commons, licença CC BY-SA 3.0 PL.",
      url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Our_Lady_of_Cz%C4%99stochowa_and_St._Casimir_church%2C_2_Ma%C5%82ynicza_str.%2C_Mo%C5%84ki_town%2C_Gmina_Mo%C5%84ki%2C_Mo%C5%84ki_County%2C_Podlaskie_Voivodeship%2C_Poland_02.JPG",
      credito_url: "https://commons.wikimedia.org/wiki/File:Our_Lady_of_Cz%C4%99stochowa_and_St._Casimir_church,_2_Ma%C5%82ynicza_str.,_Mo%C5%84ki_town,_Gmina_Mo%C5%84ki,_Mo%C5%84ki_County,_Podlaskie_Voivodeship,_Poland_02.JPG",
      ordem: 1,
      ativo: true
    },
    {
      id: "site-evangelism-v2",
      titulo: "Evangelismo e Ação Comunitária",
      descricao: "Servir, acolher e partilhar esperança com as pessoas da nossa comunidade.",
      url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=85",
      ordem: 2,
      ativo: true
    },
    {
      id: "site-school-projects-v2",
      titulo: "Projetos Escolares",
      descricao: "Apoio à educação e criação de oportunidades para crianças e jovens.",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85",
      ordem: 3,
      ativo: true
    },
    {
      id: "site-worship-v2",
      titulo: "Momentos de Culto",
      descricao: "Louvor e adoração em comunhão, celebrando a fé e a esperança.",
      url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=85",
      ordem: 4,
      ativo: true
    }
  ],
  Videos: [],
  Membro: [
    { id: "1", nome: "Aminata Baldé", email: "aminata.balde@iel.org", telefone: "+244 900 001 111", data_nascimento: "1985-04-12", endereco: "Luanda, Angola", status: "ativo", departamento: "Jovens", estado_civil: "casado", data_batismo: "2005-06-10", cargo: "Líder de Célula" },
    { id: "2", nome: "Umaro Cande", email: "umaro.cande@iel.org", telefone: "+244 900 002 222", data_nascimento: "1990-09-03", endereco: "Luanda, Angola", status: "ativo", departamento: "Senhoras", estado_civil: "solteiro", data_batismo: "2010-11-05", cargo: "Diácono" },
    { id: "3", nome: "Fatoumata Sissoco", email: "fatou.sissoco@iel.org", telefone: "+244 900 003 333", data_nascimento: "1998-12-20", endereco: "Luanda, Angola", status: "ativo", departamento: "Louvor", estado_civil: "solteiro", data_batismo: "2019-05-12", cargo: "Vocalista" },
    { id: "4", nome: "Mateus Silva", email: "mateus.silva@iel.org", telefone: "+244 900 004 444", data_nascimento: "1992-07-15", endereco: "Luanda, Angola", status: "ativo", departamento: "Jovens", estado_civil: "casado", data_batismo: "2012-04-18", cargo: "Coordenador" },
    { id: "5", nome: "Beatriz António", email: "beatriz.antonio@iel.org", telefone: "+244 900 005 555", data_nascimento: "2000-02-28", endereco: "Luanda, Angola", status: "ativo", departamento: "Infantil", estado_civil: "solteiro", data_batismo: "2021-08-09", cargo: "Professora EBD" }
  ],
  Lider: [],
  ConselhoPresbiterio: [
    { id: "1", nome: "Pr. Mário Gomes", cargo: "Presidente", email: "mario.gomes@iel.org", telefone: "+244 900 010 101" },
    { id: "2", nome: "Pb. Mama Djalo", cargo: "Secretário", email: "mama.djalo@iel.org", telefone: "+244 900 020 202" }
  ],
  Reuniao: [
    { id: "1", assunto: "Reunião Ordinária do Conselho de Presbitério", data: "2026-11-16", hora: "18:00", local: "Sala do Conselho - Luanda", descricao: "Deliberação sobre novos diáconos e planejamento do culto de Ação de Graças." },
    { id: "2", assunto: "Reunião de Acompanhamento Financeiro", data: "2026-11-19", hora: "17:30", local: "Auditório Central de Luanda", descricao: "Revisão dos relatórios de dízimos, ofertas e prestação de contas dos projetos." },
    { id: "3", assunto: "Assembleia Geral de Membros e Líderes", data: "2026-11-23", hora: "19:00", local: "Templo Central - Luanda", descricao: "Apresentação dos resultados ministeriais de 2026 e diretrizes para o próximo ano." },
    { id: "4", assunto: "Reunião de Oração e Alinhamento da Liderança", data: "2026-11-26", hora: "07:30", local: "Gabinete Pastoral", descricao: "Momento devocional e intercessão com os pastores e líderes de departamentos." }
  ],
  EscalaCulto: [
    { id: "1", equipe: "Ministério de Louvor e Vozes", data: "2026-11-15", hora: "18:30", observacao: "Culto de Domingo - Templo Central" },
    { id: "2", equipe: "Diaconia e Recepção de Visitantes", data: "2026-11-17", hora: "19:00", observacao: "Culto de Ensino Bíblico e Doutrina" },
    { id: "3", equipe: "Comunicação e Transmissão ao Vivo", data: "2026-11-20", hora: "19:30", observacao: "Vigília de Avivamento e Poder" },
    { id: "4", equipe: "Evangelismo e Ação Social", data: "2026-11-22", hora: "08:30", observacao: "Ação de Evangelismo nos bairros de Luanda e arredores" }
  ],
  Dizimo: [
    { id: "1", nome_membro: "Aminata Baldé", membro_id: "1", valor: "50000", data: "2026-07-05", forma_pagamento: "transferencia", observacao: "Dízimo de Julho" },
    { id: "2", nome_membro: "Umaro Cande", membro_id: "2", valor: "35000", data: "2026-07-12", forma_pagamento: "dinheiro", observacao: "" }
  ],
  Oferta: [
    { id: "1", tipo: "culto", valor: "15000", data: "2026-07-10", forma_pagamento: "dinheiro", descricao: "Oferta culto de domingo" },
    { id: "2", tipo: "missao", valor: "25000", data: "2026-07-15", forma_pagamento: "mobile_money", descricao: "Oferta para ações comunitárias" }
  ],
  Entrada: [
    { id: "1", rubrica: "Dízimos", valor: "50000", data: "2026-07-05", forma_pagamento: "transferencia", descricao: "Dízimo de Julho" },
    { id: "2", rubrica: "Ofertas", valor: "25000", data: "2026-07-05", forma_pagamento: "dinheiro", descricao: "Oferta culto de domingo" },
    { id: "3", rubrica: "Dízimos", valor: "40000", data: "2026-07-12", forma_pagamento: "dinheiro", descricao: "Dízimo de agosto" }
  ],
  Encargo: [
    { id: "1", descricao: "Conta de Energia - Sede", valor: "45000", data: "2026-07-20", categoria: "Agua/Luz", status: "pago" },
    { id: "2", descricao: "Reparação do Telhado", valor: "120000", data: "2026-07-25", categoria: "Manutenção", status: "pendente" }
  ],
  Documento: [
    { id: "1", titulo: "Ata da Assembleia Geral Ordinária", tipo: "ata", categoria: "ata", data: "2026-11-02", autor: "Pb. Mama Djalo (Secretário)", file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", descricao: "Aprovação unânime do relatório de contas do 3º trimestre e homologação dos novos oficiais do conselho presbiteral." },
    { id: "2", titulo: "Estatuto Social e Canônico da Igreja", tipo: "estatuto", categoria: "estatuto", data: "2024-01-15", autor: "Conselho Presbiteral", file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", descricao: "Estatuto oficial registrado em cartório que rege as diretrizes eclesiásticas, administrativas e confessionais da I.E.L." },
    { id: "3", titulo: "Certidão de Batismo Coletivo - Turma 2026", tipo: "certidao", categoria: "certidao", data: "2026-10-28", autor: "Pr. Mário Gomes", file_url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80", descricao: "Registro oficial da celebração batismal por imersão de 42 novos crentes na fé em Luanda." },
    { id: "4", titulo: "Relatório Financeiro e Balancete Trimestral", tipo: "relatorio", categoria: "relatorio", data: "2026-11-08", autor: "Tesouraria Central", file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", descricao: "Demonstrativo detalhado de entradas de dízimos, ofertas e despesas operacionais da igreja sede e filiais." },
    { id: "5", titulo: "Ofício Pastoral de Nomeação de Líderes", tipo: "oficio", categoria: "oficio", data: "2026-11-10", autor: "Pastorado Titular", file_url: "", descricao: "Designação oficial de novos líderes de células e professores da Escola Bíblica Dominical para o próximo ano eclesiástico." },
    { id: "6", titulo: "Contrato de Prestação de Serviços de Climatização", tipo: "contrato", categoria: "contrato", data: "2026-10-15", autor: "Comissão de Patrimônio", file_url: "", descricao: "Contrato firmado com a empresa de engenharia térmica para manutenção preventiva do auditório principal." }
  ],
  Projeto: [
    { id: "1", nome: "Acesso à Água Potável nas Tabancas", orcamento: "5000000", valor_arrecadado: "1200000", status: "em_andamento", data_inicio: "2025-01-01", data_fim: "2027-12-31", responsavel: "Pr. Mário Gomes", descricao: "Projeto para melhorar o acesso à água potável em tabancas e comunidades rurais com perfuração de furos artesianos e bombas solares em setores com escassez de água tratada." },
    { id: "2", nome: "Programa de Saúde Comunitária e Alimentos", orcamento: "800000", valor_arrecadado: "650000", status: "em_andamento", data_inicio: "2026-03-01", data_fim: "2026-12-31", responsavel: "Pb. Mama Djalo", descricao: "Ações de assistência médica básica, exames preventivos e distribuição contínua de cestas alimentares para famílias vulneráveis cadastradas no programa de apoio social da congregação." },
    { id: "3", nome: "Construção do Centro Comunitário Infantil", orcamento: "8500000", valor_arrecadado: "3200000", status: "em_andamento", data_inicio: "2026-02-01", data_fim: "2027-06-30", responsavel: "Ir. Ana Paula", descricao: "Construção de salas de alfabetização, reforço escolar, laboratório de informática e berçário para atender mais de duzentas crianças com alimentação diária e ensino cristão." },
    { id: "4", nome: "Evangelização e Plantação de Igrejas no Interior", orcamento: "4200000", valor_arrecadado: "2900000", status: "em_andamento", data_inicio: "2026-01-15", data_fim: "2026-12-20", responsavel: "Ev. Pedro Catete", descricao: "Envio e sustento de missionários para regiões atendidas pela igreja, provendo materiais bíblicos, suporte espiritual, plantação de congregações locais e assistência humanitária." },
    { id: "5", nome: "Escola de Música e Artes Sacras da Juventude", orcamento: "2800000", valor_arrecadado: "1950000", status: "em_andamento", data_inicio: "2026-03-01", data_fim: "2026-11-30", responsavel: "Ir. Paulo David", descricao: "Aquisição de teclados, violões, instrumentos de sopro e percussão para capacitar gratuitamente jovens da comunidade, promovendo inclusão social, disciplina e formação musical." },
    { id: "6", nome: "Projeto Pão da Vida & Apoio Social", orcamento: "1500000", valor_arrecadado: "1100000", status: "em_andamento", data_inicio: "2026-01-01", data_fim: "2026-12-31", responsavel: "Ir. Maria Esperança", descricao: "Distribuição semanal de refeições quentes, vestuário e kits de higiene pessoal para pessoas em situação de vulnerabilidade nos bairros periféricos de Luanda." },
    { id: "7", nome: "Capacitação Profissional e Empreendedorismo", orcamento: "3500000", valor_arrecadado: "2100000", status: "em_andamento", data_inicio: "2026-04-01", data_fim: "2027-02-28", responsavel: "Pb. Carlos Silva", descricao: "Oficinas práticas de corte e costura, eletricidade básica, informática e pequenos negócios para capacitar chefes de família ao mercado de trabalho e gerar rendimento sustentável." },
    { id: "8", nome: "Reforma e Climatização do Templo Sede", orcamento: "12000000", valor_arrecadado: "7400000", status: "em_andamento", data_inicio: "2025-06-01", data_fim: "2026-12-31", responsavel: "Pr. Mário Gomes", descricao: "Modernização das instalações acústicas, reforma geral dos sanitários, rampas de acessibilidade e melhorias no auditório principal do Templo Central em Luanda." }
  ],
  IgrejaFilhada: [
    { id: "1", nome: "Congregação Luanda Centro", pastor: "Pb. Carlos", endereco: "Luanda, Angola", cidade: "Luanda", telefone: "+244 900 111 222", status: "ativa" },
    { id: "2", nome: "Congregação de Viana", pastor: "Ev. Pedro", endereco: "Viana, Luanda", cidade: "Viana", telefone: "+244 900 333 444", status: "ativa" },
    { id: "3", nome: "Congregação de Cacuaco", pastor: "Ev. Serifo", endereco: "Cacuaco, Luanda", cidade: "Cacuaco", telefone: "+244 900 555 666", status: "ativa" }
  ],
  Configuracoes: [
    {
      id: "1",
      nome_igreja: "Igreja Evangélica de Luanda",
      idioma_padrao: "pt",
      telefone: "",
      email: "",
      endereco: "Luanda, Angola",
      politica_uso: "Bem-vindo ao sistema de Gestão Eclesiástica da Igreja Evangélica de Luanda. Este sistema é destinado ao uso exclusivo de membros e líderes autorizados. O uso indevido das informações aqui contidas está sujeito a penalidades éticas e legais. Ao fazer login, você concorda em manter a confidencialidade e a integridade de todos os dados sob sua responsabilidade."
    }
  ],
  Noticias: [
    { id: "1", titulo: "Grande Conferência Nacional da Juventude 2026", data: "2026-08-15", descricao: "Participe da conferência anual em Luanda para fortalecer a juventude, despertar dons ministeriais e levantar uma geração comprometida com a fé e integridade." },
    { id: "2", titulo: "Mutirão Comunitário de Solidariedade", data: "2026-08-20", descricao: "Ação beneficente com doação de roupas, alimentos, atendimento médico voluntário e oração com famílias em situação de vulnerabilidade em Luanda." },
    { id: "3", titulo: "Batismo nas Águas Reúne Centenas em Luanda", data: "2026-08-25", descricao: "Em um dia marcado por intensa emoção e louvor a Deus, dezenas de novos convertidos deram testemunho público de sua fé através do batismo bíblico por imersão, selando sua aliança com Cristo." },
    { id: "4", titulo: "Inauguração da Biblioteca e Centro de Estudos Teológicos", data: "2026-09-02", descricao: "A igreja entregou aos membros e estudantes da Bíblia um acervo de títulos bíblicos, comentários de teologia pastoral e computadores para pesquisa." },
    { id: "5", titulo: "Seminário de Finanças Bíblicas e Mordomia Cristã", data: "2026-09-10", descricao: "Especialistas convidados ministraram ensinamentos práticos e bíblicos sobre planejamento doméstico, superação de dívidas, fidelidade nos dízimos e investimento familiar responsável." },
    { id: "6", titulo: "Campanha de Solidariedade Atende 300 Famílias", data: "2026-09-18", descricao: "Com o apoio de toda a congregação, a Sociedade Feminina concluiu com êxito a entrega de cestas alimentares e kits de higiene nos bairros de maior vulnerabilidade em Luanda." },
    { id: "7", titulo: "Coral Geral da Igreja Prepara Grande Cantata de Louvor", data: "2026-09-25", descricao: "Mais de setenta vozes da igreja iniciaram ensaios intensivos para a tradicional celebração de Ação de Graças, com entrada franca para toda a comunidade de Luanda." },
    { id: "8", titulo: "Cruzada Evangelística ao Ar Livre em Santa Luzia", data: "2026-10-05", descricao: "Três noites de louvor, oração e proclamação do Evangelho em praça pública impactaram moradores locais, resultando em vidas transformadas e renovação espiritual." }
  ],
  Cultos: [
    { id: "1", nome: "Escola Bíblica Dominical", dia: "Domingo", hora: "09:00", descricao: "Estudo aprofundado das sagradas escrituras separado por faixas etárias, desde crianças até adultos, promovendo maturidade bíblica e discipulado sistemático." },
    { id: "2", nome: "Culto da Família", dia: "Domingo", hora: "19:00", descricao: "Culto solene de celebração, adoração congregacional com o ministério de louvor, pregação expositiva da Palavra de Deus e comunhão entre as famílias." },
    { id: "3", nome: "Círculo de Oração", dia: "Terça-feira", hora: "19:30", descricao: "Clamor fervoroso, intercessão pelas famílias, pelos enfermos, pelas autoridades e busca de avivamento e renovo espiritual guiado pelas irmãs intercessoras." },
    { id: "4", nome: "Culto de Ensino Bíblico", dia: "Quinta-feira", hora: "19:30", descricao: "Estudos temáticos e doutrinários versículo por versículo ministrados pelos pastores para capacitar a igreja a discernir as verdades fundamentais da fé cristã." },
    { id: "5", nome: "Culto de Jovens", dia: "Sexta-feira", hora: "20:00", descricao: "Reunião dinâmica e vibrante com louvor jovem, mensagens inspiradoras, teatro e dinâmicas voltadas para os desafios práticos da juventude e estudantes." },
    { id: "6", nome: "Culto de Oração e Jejum", dia: "Sábado", hora: "08:00", descricao: "Manhã consagrada de quebrantamento, jejum coletivo, meditação nas Escrituras e momentos dedicados à oração pelas necessidades do povo de Deus." },
    { id: "7", nome: "Culto de Homens & Liderança", dia: "Segunda-feira", hora: "19:30", descricao: "Encontro focado no sacerdócio do homem no lar, integridade no trabalho, paternidade responsável e fortalecimento da liderança eclesiástica masculina." },
    { id: "8", nome: "Vigília de Avivamento e Poder", dia: "Sexta-feira", hora: "23:00", descricao: "Madrugada inteira de busca contínua da presença do Senhor, louvor ininterrupto, intercessão pelas nações e ministração de renovo espiritual." },
    { id: "9", nome: "Culto da Terceira Idade (Geração de Fé)", dia: "Quarta-feira", hora: "15:00", descricao: "Reunião vespertina acolhedora dedicada aos idosos e veteranos da fé, com cânticos tradicionais, devocional edificante e momento de chá fraterno." },
    { id: "10", nome: "Culto de Casais & Vida a Dois", dia: "Sábado", hora: "19:00", descricao: "Ministração mensal voltada para a edificação matrimonial, resolução bíblica de conflitos, diálogo a dois e renovação dos votos de fidelidade e amor." },
    { id: "11", nome: "Discipulado e Novos Convertidos", dia: "Sábado", hora: "16:30", descricao: "Acompanhamento inicial com classes de fundamentos da fé, oração, leitura bíblica e preparação para o santo batismo nas águas e membresia ativa." },
    { id: "12", nome: "Culto de Clamor e Cura Divina", dia: "Terça-feira", hora: "09:30", descricao: "Momento matinal com imposição de mãos, oração especial pelos enfermos e intercessão por livramento e restauração da saúde física e emocional." }
  ],
  Patrimonio: [
    { id: "1", nome: "Templo Central Sede - Luanda", categoria: "Imovel", modalidade: "Ativo", valor_estimado: "50000000", periodo_vida: "360", data_aquisicao: "2010-03-15", estado: "Bom" },
    { id: "2", nome: "Sistema de Som Digital e Instrumentos", categoria: "Equipamento", modalidade: "Ativo", valor_estimado: "3500000", periodo_vida: "60", data_aquisicao: "2023-06-01", estado: "Ótimo" },
    { id: "3", nome: "Viatura de Apoio Pastoral e Missionário", categoria: "Veiculo", modalidade: "Ativo", valor_estimado: "12000000", periodo_vida: "84", data_aquisicao: "2022-01-10", estado: "Bom" }
  ],
  Departamento: [
    { id: "1", nome: "Jovens", responsavel: "Pr. João Baptista", descricao: "Departamento de jovens, universitários e adolescentes." },
    { id: "2", nome: "Senhoras", responsavel: "Ir. Maria Esperança", descricao: "Sociedade feminina de mulheres cristãs e intercessoras." },
    { id: "3", nome: "Louvor", responsavel: "Ir. Paulo David", descricao: "Ministério de louvor, músicos, coral e técnica de som." },
    { id: "4", nome: "Infantil", responsavel: "Ir. Ana Paula", descricao: "Departamento de crianças e Escola Bíblica Infantil." }
  ],
  DirecaoRestrita: [
    { id: "1", nome: "Pastor Titular", membro: "Rev. Manuel Costa", cargo: "Pastor Presidente", data_posse: "2015-01-01", status: "ativo" },
    { id: "2", nome: "Vice-Pastor", membro: "Rev. António Afonso", cargo: "Vice-Presidente", data_posse: "2018-06-15", status: "ativo" }
  ],
  Deliberacao: [
    {
      id: "1",
      titulo: "Aprovação do Orçamento Anual 2027",
      reuniao_assunto: "Reunião Ordinária do Conselho de Presbitério",
      data_reuniao: "2026-11-16",
      tipo: "financeira",
      status: "aprovada",
      descricao: "O Conselho aprovou por unanimidade o orçamento anual para o exercício de 2027, no valor total de XOF 48.000.000, destinados a obras, missões e manutenção operacional.",
      responsavel: "Pb. Mama Djalo",
      votos_favor: 7,
      votos_contra: 0,
      abstencoes: 1,
      prazo_execucao: "2026-12-31",
      observacoes: "Relatório de execução a ser apresentado trimestralmente ao Conselho."
    },
    {
      id: "2",
      titulo: "Nomeação de Novos Diáconos para o Ministério de Recepção",
      reuniao_assunto: "Reunião Ordinária do Conselho de Presbitério",
      data_reuniao: "2026-11-16",
      tipo: "institucional",
      status: "aprovada",
      descricao: "Foram nomeados por aclamação 4 novos diáconos para servir no ministério de acolhimento e recepção de visitantes durante os cultos dominicais e eventos especiais.",
      responsavel: "Pr. Mário Gomes",
      votos_favor: 8,
      votos_contra: 0,
      abstencoes: 0,
      prazo_execucao: "2026-12-01",
      observacoes: "Cerimônia de posse a ser realizada no próximo culto de domingo."
    },
    {
      id: "3",
      titulo: "Autorização para Reforma do Espaço Infantil",
      reuniao_assunto: "Assembleia Geral de Membros e Líderes",
      data_reuniao: "2026-11-23",
      tipo: "patrimonio",
      status: "em_andamento",
      descricao: "Aprovada a reforma completa das salas da EBI com adequação do espaço, pintura, aquisição de mobiliário infantil e instalação de climatização, com orçamento de XOF 3.500.000.",
      responsavel: "Comissão de Patrimônio",
      votos_favor: 6,
      votos_contra: 1,
      abstencoes: 1,
      prazo_execucao: "2027-02-28",
      observacoes: "Contratação de empresa a ser realizada mediante concurso de três orçamentos."
    }
  ],
  Estatisticas: [
    { id: "1", ano: "2024", novos_convertidos: 45, cultos_realizados: 156, participantes_cultos: 12480, seminarios: 6, estudos_biblicos: 48, batismos: 22, casamentos: 4 },
    { id: "2", ano: "2025", novos_convertidos: 62, cultos_realizados: 160, participantes_cultos: 15200, seminarios: 8, estudos_biblicos: 52, batismos: 30, casamentos: 6 },
    { id: "3", ano: "2026", novos_convertidos: 38, cultos_realizados: 90, participantes_cultos: 9800, seminarios: 4, estudos_biblicos: 28, batismos: 15, casamentos: 2 }
  ]
};

export const getDB = () => {
  let db = localStorage.getItem("base44_db");
  let parsedDb;
  if (!db) {
    parsedDb = JSON.parse(JSON.stringify(DEFAULT_DB));
  } else {
    try {
      parsedDb = JSON.parse(db);
    } catch (e) {
      parsedDb = JSON.parse(JSON.stringify(DEFAULT_DB));
    }

    if (!parsedDb.users || !Array.isArray(parsedDb.users)) {
      parsedDb.users = JSON.parse(JSON.stringify(DEFAULT_DB.users));
    }

    // Garantir que admin@iel.com existe com todas as permissões
    let adminUser = parsedDb.users.find(u => u.email.toLowerCase() === "admin@iel.com");
    if (!adminUser) {
      adminUser = {
        id: "1",
        nome: "Administrador Geral",
        email: "admin@iel.com",
        password: "admin",
        role: "admin",
        status: "ativo",
        permissoes: ALL_PERMISSIONS
      };
      parsedDb.users.unshift(adminUser);
    } else {
      adminUser.role = "admin";
      adminUser.permissoes = ALL_PERMISSIONS;
      if (!adminUser.nome) adminUser.nome = "Administrador Geral";
    }

    // Garantir que todos os usuários tenham permissoes e nome
    parsedDb.users.forEach(u => {
      if (!u.nome) u.nome = u.email ? u.email.split("@")[0] : "Usuário";
      if (!u.role) u.role = "personalizado";
      if (!u.status) u.status = "ativo";
      if (!u.permissoes || !Array.isArray(u.permissoes)) {
        if (u.role === "admin") u.permissoes = ALL_PERMISSIONS;
        else if (u.role === "secretaria") u.permissoes = ["dashboard", "membros", "departamentos", "conselho", "secretaria"];
        else if (u.role === "tesouraria") u.permissoes = ["dashboard", "estatisticas", "entradas", "encargos", "patrimonio"];
        else if (u.role === "pastor") u.permissoes = ["dashboard", "estatisticas", "membros", "departamentos", "conselho", "secretaria", "projetos", "igrejas"];
        else u.permissoes = ["dashboard"];
      }
    });

    // Completar apenas o formato das coleções ausentes sem repor dados de demonstração.
    for (const [key, defaultValue] of Object.entries(DEFAULT_DB)) {
      if (key === "users" || key.startsWith("_")) continue;
      if (!Array.isArray(parsedDb[key])) parsedDb[key] = [];
    }
  }

  // Limpeza única dos dados já existentes; manter usuários e conteúdo do carrossel.
  // O marcador impede que registros sejam repovoados em visitas futuras.
  if (parsedDb._userDataOnlyVersion !== USER_DATA_ONLY_VERSION) {
    clearSystemCollections(parsedDb, true);
  } else if (parsedDb._carouselContentVersion !== CAROUSEL_CONTENT_VERSION) {
    if (!Array.isArray(parsedDb.Carousel) || parsedDb.Carousel.length === 0) {
      parsedDb.Carousel = JSON.parse(JSON.stringify(DEFAULT_DB.Carousel));
    }
    parsedDb._carouselContentVersion = CAROUSEL_CONTENT_VERSION;
  }

  localStorage.setItem("base44_db", JSON.stringify(parsedDb));
  return parsedDb;
};

export const saveDB = (db) => {
  localStorage.setItem("base44_db", JSON.stringify(db));
};

export const resetDB = () => {
  const current = getDB();
  const cleared = clearSystemCollections(current);
  saveDB(cleared);
  return cleared;
};

export const base44 = {
  auth: {
    async register(email, password, extraData = {}) {
      await delay(200);
      const db = getDB();
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail) throw new Error("E-mail é obrigatório.");
      if (db.users.find(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error("Já existe um usuário cadastrado com este e-mail.");
      }

      const role = extraData.role || "personalizado";
      let permissoes = extraData.permissoes;
      if (!permissoes || !Array.isArray(permissoes)) {
        if (role === "admin") permissoes = ALL_PERMISSIONS;
        else if (role === "secretaria") permissoes = ["dashboard", "membros", "departamentos", "conselho", "secretaria"];
        else if (role === "tesouraria") permissoes = ["dashboard", "estatisticas", "entradas", "encargos", "patrimonio"];
        else if (role === "pastor") permissoes = ["dashboard", "estatisticas", "membros", "departamentos", "conselho", "secretaria", "projetos", "igrejas"];
        else if (role === "lider") permissoes = ["dashboard", "membros", "departamentos"];
        else permissoes = ["dashboard"];
      }

      const newUser = {
        id: Date.now().toString(),
        nome: extraData.nome ? extraData.nome.trim() : cleanEmail.split("@")[0],
        cargo: String(extraData.cargo || "").trim(),
        email: cleanEmail,
        password: password || "123456",
        role,
        status: extraData.status || "ativo",
        permissoes,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDB(db);
      return newUser;
    },

    async login(email, password) {
      await delay(250);
      const db = getDB();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const user = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (!user) {
        throw new Error("Credenciais inválidas. Verifique o e-mail e a senha digitados.");
      }
      if (user.status === "inativo") {
        throw new Error("Este usuário está inativo no sistema. Contate o administrador.");
      }
      localStorage.setItem("base44_session", JSON.stringify(user));
      return user;
    },

    async logout() {
      await delay(100);
      localStorage.removeItem("base44_session");
      localStorage.removeItem("b44_session");
    },

    async getSession() {
      await delay(50);
      const sessionStr = localStorage.getItem("base44_session") || localStorage.getItem("b44_session");
      if (!sessionStr) return null;
      try {
        const session = JSON.parse(sessionStr);
        const db = getDB();
        const freshUser = db.users.find(u => u.id === session.id || u.email.toLowerCase() === session.email.toLowerCase());
        if (freshUser) {
          if (freshUser.status === "inativo") {
            localStorage.removeItem("base44_session");
            localStorage.removeItem("b44_session");
            return null;
          }
          localStorage.setItem("base44_session", JSON.stringify(freshUser));
          return freshUser;
        }
        localStorage.removeItem("base44_session");
        localStorage.removeItem("b44_session");
        return null;
      } catch (e) {
        return null;
      }
    }
  },

  db: {
    async get(collection) {
      await delay(150);
      const db = getDB();
      return db[collection] || [];
    },

    async create(collection, data) {
      await delay(200);
      const db = getDB();
      const newItem = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...data };
      if (!db[collection]) db[collection] = [];
      db[collection].push(newItem);
      saveDB(db);
      return newItem;
    },

    async update(collection, id, data) {
      await delay(200);
      const db = getDB();
      if (!db[collection]) throw new Error("Coleção não encontrada: " + collection);
      const index = db[collection].findIndex(item => String(item.id) === String(id));
      if (index === -1) throw new Error("Registro não encontrado.");
      
      const updated = {
        ...db[collection][index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      db[collection][index] = updated;
      saveDB(db);

      // Se for a coleção de usuários e for o usuário logado, atualiza a sessão ativa
      if (collection === "users") {
        const currentSessionStr = localStorage.getItem("base44_session");
        if (currentSessionStr) {
          try {
            const currentSession = JSON.parse(currentSessionStr);
            if (String(currentSession.id) === String(id)) {
              localStorage.setItem("base44_session", JSON.stringify(updated));
            }
          } catch (e) {}
        }
      }

      return updated;
    },

    async delete(collection, id) {
      await delay(200);
      const db = getDB();
      if (!db[collection]) throw new Error("Coleção não encontrada: " + collection);

      // Proteção para usuários
      if (collection === "users") {
        const userToDelete = db.users.find(u => String(u.id) === String(id));
        if (userToDelete && userToDelete.email === "admin@iel.com") {
          throw new Error("Não é permitido excluir o administrador principal do sistema.");
        }
      }

      db[collection] = db[collection].filter(item => String(item.id) !== String(id));
      saveDB(db);
      return true;
    }
  }
};
