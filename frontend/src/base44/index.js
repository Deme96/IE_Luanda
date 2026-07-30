/**
 * MOCK do Base44 SDK e BaaS
 * Simula a persistência e autenticação via localStorage
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getDB = () => {
  let db = localStorage.getItem("base44_db");
  let parsedDb;
  if (!db) {
    parsedDb = {
      users: [
        { id: "1", email: "admin@iel.com", password: "admin" }
      ], // auth users
      Membro: [],
      Lider: [],
      ConselhoPresbiterio: [],
      Dizimo: [],
      Oferta: [],
      Encargo: [],
      Documento: [],
      Projeto: [],
      IgrejaFilhada: [],
      Configuracoes: [
        {
          id: "1",
          nome_igreja: "Igreja Evangélica de Luanda",
          idioma_padrao: "pt",
          politica_uso: "Bem-vindo ao sistema de Gestão Eclesiástica. Este sistema é destinado ao uso exclusivo de membros e líderes autorizados. O uso indevido das informações aqui contidas está sujeito a penalidades éticas e legais. Ao fazer login, você concorda em manter a confidencialidade dos dados."
        }
      ],
      Noticias: [
        { id: "1", titulo: "Conferência de Jovens 2026", data: "2026-08-15", descricao: "Participe da nossa conferência anual focada em fortalecer a juventude." },
        { id: "2", titulo: "Mutirão Solidário", data: "2026-08-20", descricao: "Ação social para doação de cestas básicas na comunidade local." }
      ],
      Cultos: [
        { id: "1", nome: "Culto da Família", dia: "Domingo", hora: "19:00", descricao: "Culto de celebração e ministração da palavra." },
        { id: "2", nome: "Culto de Ensino", dia: "Quarta-feira", hora: "19:30", descricao: "Estudo aprofundado das sagradas escrituras." }
      ],
      Patrimonio: [
        { id: "1", nome: "Templo Principal", categoria: "Imovel", valor_estimado: "5000000", data_aquisicao: "2010-03-15", estado: "Bom" },
        { id: "2", nome: "Sistema de Som", categoria: "Equipamento", valor_estimado: "120000", data_aquisicao: "2023-06-01", estado: "Ótimo" },
        { id: "3", nome: "Veículo Furgão", categoria: "Veiculo", valor_estimado: "350000", data_aquisicao: "2022-01-10", estado: "Bom" }
      ],
      Departamento: [
        { id: "1", nome: "Jovens", responsavel: "Pr. João", descricao: "Departamento de jovens e adolescentes." },
        { id: "2", nome: "Senhoras", responsavel: "Ir. Maria", descricao: "Departamento feminino da igreja." },
        { id: "3", nome: "Louvor", responsavel: "Ir. Paulo", descricao: "Ministério de louvor e adoração." },
        { id: "4", nome: "Infantil", responsavel: "Ir. Ana", descricao: "Departamento de crianças e EBD infantil." }
      ],
      DirecaoRestrita: [
        { id: "1", nome: "Pastor Titular", membro: "Rev. Manuel", cargo: "Pastor Presidente", data_posse: "2015-01-01", status: "ativo" },
        { id: "2", nome: "Vice-Pastor", membro: "Rev. António", cargo: "Vice-Presidente", data_posse: "2018-06-15", status: "ativo" }
      ],
      Estatisticas: [
        { id: "1", ano: "2024", novos_convertidos: 45, cultos_realizados: 156, participantes_cultos: 12480, seminarios: 6, estudos_biblicos: 48, batismos: 22, casamentos: 4 },
        { id: "2", ano: "2025", novos_convertidos: 62, cultos_realizados: 160, participantes_cultos: 15200, seminarios: 8, estudos_biblicos: 52, batismos: 30, casamentos: 6 },
        { id: "3", ano: "2026", novos_convertidos: 38, cultos_realizados: 90, participantes_cultos: 9800, seminarios: 4, estudos_biblicos: 28, batismos: 15, casamentos: 2 }
      ]
    };
  } else {
    parsedDb = JSON.parse(db);
    // Ensure admin user exists even if db was already created
    if (!parsedDb.users) parsedDb.users = [];
    if (!parsedDb.users.find(u => u.email === "admin@iel.com")) {
      parsedDb.users.push({ id: "1", email: "admin@iel.com", password: "admin" });
    }
  }
  localStorage.setItem("base44_db", JSON.stringify(parsedDb));
  return parsedDb;
};

const saveDB = (db) => {
  localStorage.setItem("base44_db", JSON.stringify(db));
};

export const base44 = {
  auth: {
    async register(email, password) {
      await delay(500);
      const db = getDB();
      if (db.users.find(u => u.email === email)) {
        throw new Error("Usuário já existe");
      }
      const newUser = { id: Date.now().toString(), email, password };
      db.users.push(newUser);
      saveDB(db);
      return newUser;
    },
    async login(email, password) {
      await delay(500);
      const db = getDB();
      const user = db.users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Credenciais inválidas");
      }
      localStorage.setItem("base44_session", JSON.stringify(user));
      return user;
    },
    async logout() {
      await delay(300);
      localStorage.removeItem("base44_session");
    },
    async getSession() {
      await delay(100);
      const session = localStorage.getItem("base44_session");
      return session ? JSON.parse(session) : null;
    }
  },
  db: {
    async get(collection) {
      await delay(400);
      const db = getDB();
      return db[collection] || [];
    },
    async create(collection, data) {
      await delay(400);
      const db = getDB();
      const newItem = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...data };
      if (!db[collection]) db[collection] = [];
      db[collection].push(newItem);
      saveDB(db);
      return newItem;
    },
    async update(collection, id, data) {
      await delay(400);
      const db = getDB();
      if (!db[collection]) throw new Error("Collection not found");
      const index = db[collection].findIndex(item => item.id === id);
      if (index === -1) throw new Error("Item not found");
      db[collection][index] = { ...db[collection][index], ...data, updatedAt: new Date().toISOString() };
      saveDB(db);
      return db[collection][index];
    },
    async delete(collection, id) {
      await delay(400);
      const db = getDB();
      if (!db[collection]) throw new Error("Collection not found");
      db[collection] = db[collection].filter(item => item.id !== id);
      saveDB(db);
      return true;
    }
  }
};
