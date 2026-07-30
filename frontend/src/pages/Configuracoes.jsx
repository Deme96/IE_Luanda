import { useState, useEffect } from "react";
import { base44 } from "@/base44";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Settings, ShieldCheck, Users, Calendar, Newspaper, FolderOpen } from "lucide-react";

export default function Configuracoes() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("sistema");
  const [config, setConfig] = useState({ id: "1", nome_igreja: "", idioma_padrao: "pt", politica_uso: "" });
  
  // Mocks para listagem
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const c = await base44.db.get("Configuracoes");
    if (c.length > 0) setConfig(c[0]);

    const u = await base44.db.get("users");
    setUsuarios(u);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await base44.db.update("Configuracoes", config.id, config);
      toast.success("Configurações salvas com sucesso!");
      if (config.idioma_padrao !== i18n.language) {
        i18n.changeLanguage(config.idioma_padrao);
      }
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    }
  };

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const tabs = [
    { id: "sistema", label: "Sistema", icon: Settings },
    { id: "politica", label: "Política de Uso", icon: ShieldCheck },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "cultos", label: "Cultos", icon: Calendar },
    { id: "projetos", label: "Projetos", icon: FolderOpen },
    { id: "noticias", label: "Notícias", icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie as preferências e cadastros institucionais do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Menu Lateral das Configurações */}
        <div className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? "bg-military text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Ativo */}
        <div className="flex-1">
          <Card className="border-none shadow-md">
            
            {/* Aba: Sistema */}
            {activeTab === "sistema" && (
              <form onSubmit={handleSaveConfig}>
                <CardHeader>
                  <CardTitle>Geral do Sistema</CardTitle>
                  <CardDescription>Altere o nome da instituição e o idioma padrão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Igreja</label>
                    <Input 
                      name="nome_igreja"
                      value={config.nome_igreja} 
                      onChange={handleChange}
                      placeholder="Ex: Igreja Evangélica de Luanda" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Idioma Padrão</label>
                    <select 
                      name="idioma_padrao"
                      value={config.idioma_padrao}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military focus:border-transparent"
                    >
                      <option value="pt">Português (PT)</option>
                      <option value="en">Inglês (EN)</option>
                      <option value="fr">Francês (FR)</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Configurações</Button>
                  </div>
                </CardContent>
              </form>
            )}

            {/* Aba: Política de Bom Uso */}
            {activeTab === "politica" && (
              <form onSubmit={handleSaveConfig}>
                <CardHeader>
                  <CardTitle>Política de Bom Uso</CardTitle>
                  <CardDescription>O texto que aparece para os usuários na tela de login.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <textarea 
                      name="politica_uso"
                      value={config.politica_uso}
                      onChange={handleChange}
                      rows={10}
                      className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military focus:border-transparent resize-y"
                      placeholder="Escreva a política de uso aqui..."
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Política</Button>
                  </div>
                </CardContent>
              </form>
            )}

            {/* Aba: Usuários */}
            {activeTab === "usuarios" && (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Usuários e Privilégios</CardTitle>
                    <CardDescription>Gerencie quem tem acesso ao painel (Mock).</CardDescription>
                  </div>
                  <Button className="bg-military hover:bg-military-dark">+ Novo Usuário</Button>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-900">E-mail</th>
                          <th className="px-4 py-3 font-medium text-gray-900">Cargo / Privilégio</th>
                          <th className="px-4 py-3 font-medium text-gray-900 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {usuarios.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Administrador
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-blue-600 hover:underline">Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </>
            )}

            {/* Abas Extras em Mock */}
            {(activeTab === "cultos" || activeTab === "projetos" || activeTab === "noticias") && (
              <>
                <CardHeader>
                  <CardTitle className="capitalize">Gerenciar {activeTab}</CardTitle>
                  <CardDescription>Esta seção permite o cadastro institucional de {activeTab}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 border-2 border-dashed rounded-lg border-gray-200">
                    <p className="text-gray-500 mb-4">Nenhum registro encontrado.</p>
                    <Button className="bg-military hover:bg-military-dark">+ Adicionar Novo</Button>
                  </div>
                </CardContent>
              </>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
}
