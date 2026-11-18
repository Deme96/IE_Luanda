const API_URL = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const requestApi = async (path, { method = "GET", body, authenticated = true } = {}) => {
  if (!API_URL) {
    throw new Error("VITE_API_URL não está configurada no build do frontend.");
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("base44_token");
  if (authenticated && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store"
    });
  } catch {
    throw new Error("Não foi possível conectar à API compartilhada. Verifique a conexão e o serviço do Render.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Falha na API (${response.status}).`);
  }
  return result;
};

export const base44 = {
  auth: {
    async register(email, password, extraData = {}) {
      return requestApi("/api/auth/register", {
        method: "POST",
        authenticated: false,
        body: { email, password, nome: extraData.nome }
      });
    },

    async login(email, password) {
      const result = await requestApi("/api/auth/login", {
        method: "POST",
        authenticated: false,
        body: { email, password }
      });
      localStorage.setItem("base44_token", result.token);
      localStorage.setItem("base44_session", JSON.stringify(result.user));
      return result.user;
    },

    async logout() {
      localStorage.removeItem("base44_token");
      localStorage.removeItem("base44_session");
      localStorage.removeItem("b44_session");
    },

    async getSession() {
      const token = localStorage.getItem("base44_token");
      if (!token) return null;

      try {
        const result = await requestApi("/api/auth/me");
        localStorage.setItem("base44_session", JSON.stringify(result.user));
        return result.user;
      } catch {
        localStorage.removeItem("base44_token");
        localStorage.removeItem("base44_session");
        return null;
      }
    }
  },

  systemLogs: {
    async list(limit = 250) {
      return requestApi(`/api/system-logs?limit=${encodeURIComponent(limit)}`);
    }
  },

  db: {
    async export() {
      return requestApi("/api/data/export");
    },

    async importBackup(database) {
      return requestApi("/api/data/import", {
        method: "POST",
        body: { collections: database }
      });
    },

    async reset() {
      return requestApi("/api/data/reset", { method: "POST" });
    },

    async get(collection) {
      return requestApi(`/api/collections/${encodeURIComponent(collection)}`);
    },

    async create(collection, data) {
      const id = data.id || globalThis.crypto?.randomUUID?.() || Date.now().toString();
      return requestApi(`/api/collections/${encodeURIComponent(collection)}`, {
        method: "POST",
        body: { ...data, id }
      });
    },

    async update(collection, id, data) {
      return requestApi(`/api/collections/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data
      });
    },

    async delete(collection, id) {
      return requestApi(`/api/collections/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    }
  }
};
