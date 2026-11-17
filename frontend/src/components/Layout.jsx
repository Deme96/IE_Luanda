import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/base44";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Users, UserCog, Crown, LogOut, Banknote,
  Menu, Settings, UserCircle, ChevronDown, ChevronUp, BarChart3,
  Building2, Layers, Pickaxe, Map, ShieldAlert, ArrowLeft
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { hasPermission, pathToPermissionKey } from "@/lib/permissions";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [openMenus, setOpenMenus] = useState({ "Direção": true, "Finanças": true, "RH": true, "Patrimônio": true });
  const { t } = useTranslation();

  const loadUser = async () => {
    try {
      const session = await base44.auth.getSession();
      setCurrentUser(session);
    } catch (e) {
      console.error("Erro ao carregar sessão:", e);
    }
  };

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  // Definição estruturada de todos os itens do menu
  const rawNavItems = useMemo(() => [
    { name: t("menu_dashboard"), path: "/admin", icon: LayoutDashboard, key: "dashboard" },
    { name: t("menu_statistics"), path: "/admin/estatisticas", icon: BarChart3, key: "estatisticas" },
    { 
      name: t("menu_human_resources"), 
      groupKey: "RH",
      icon: Users,
      subItems: [
        { name: t("menu_members"), path: "/admin/membros", icon: Users, key: "membros" },
        { name: t("menu_departments"), path: "/admin/departamentos", icon: Layers, key: "departamentos" },
      ]
    },
    { 
      name: t("menu_leadership"), 
      groupKey: "Direção",
      icon: Crown,
      subItems: [
        { name: t("menu_presbytery_council"), path: "/admin/conselho", icon: Crown, key: "conselho" },
        { name: t("menu_secretary"), path: "/admin/secretaria", icon: UserCog, key: "secretaria" },
      ]
    },
    { 
      name: t("menu_finances"), 
      groupKey: "Finanças",
      icon: Banknote,
      subItems: [
        { name: t("menu_entries"), path: "/admin/entradas", icon: Banknote, key: "entradas" },
        { name: t("menu_charges"), path: "/admin/encargos", icon: Banknote, key: "encargos" },
        { name: t("menu_projects"), path: "/admin/projetos", icon: Pickaxe, key: "projetos" },
      ]
    },
    { 
      name: t("menu_patrimony"), 
      groupKey: "Patrimônio",
      icon: Building2,
      subItems: [
        { name: t("menu_patrimony"), path: "/admin/patrimonio", icon: Building2, key: "patrimonio" },
        { name: t("menu_churches"), path: "/admin/igrejas", icon: Map, key: "igrejas" },
      ]
    },
  ], [t]);

  // Filtra itens com base nas permissões detalhadas do usuário logado
  const filteredNavItems = useMemo(() => {
    if (!currentUser) return [];
    return rawNavItems.reduce((acc, item) => {
      if (item.subItems) {
        const allowedSubs = item.subItems.filter(sub => hasPermission(currentUser, sub.key));
        if (allowedSubs.length > 0) {
          acc.push({ ...item, subItems: allowedSubs });
        }
      } else {
        if (hasPermission(currentUser, item.key)) {
          acc.push(item);
        }
      }
      return acc;
    }, []);
  }, [currentUser, rawNavItems]);

  const canAccessSettings = useMemo(() => {
    return hasPermission(currentUser, "configuracoes");
  }, [currentUser]);

  // Validação de acesso à rota atual
  const currentKey = pathToPermissionKey(location.pathname);
  const isAuthorized = useMemo(() => {
    if (!currentUser) return true; // Ainda carregando
    if (!currentKey) return true; // Rota sem restrição estrita
    return hasPermission(currentUser, currentKey);
  }, [currentUser, currentKey]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Botão de Toggle Sidebar no Mobile */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar Lateral */}
      <aside className={`admin-sidebar w-64 bg-military-dark text-white flex flex-col absolute inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40 shadow-xl`}>
        
        {/* Topo / Logo */}
        <div className="h-16 px-4 py-2 font-bold text-lg border-b border-white/10 mt-12 md:mt-0 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <div className="font-extrabold tracking-tight text-white leading-tight">Gestão Eclesiástica</div>
              <div className="text-[11px] text-green-300 font-normal">Igreja Evangélica de Luanda</div>
            </div>
          </div>
        </div>

        {/* Itens Principais do Menu com Rolagem */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <div key={item.name || item.groupKey}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.groupKey)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-gray-300" />
                      {item.name}
                    </div>
                    {openMenus[item.groupKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openMenus[item.groupKey] && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-white/20 pl-2">
                      {item.subItems.map(sub => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                              location.pathname === sub.path 
                                ? "bg-white text-military-dark font-bold shadow-md" 
                                : "hover:bg-white/10 text-gray-300"
                            }`}
                          >
                            <sub.icon size={16} />
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    location.pathname === item.path 
                      ? "bg-white text-military-dark font-bold shadow-md" 
                      : "hover:bg-white/10 text-gray-200"
                  }`}
                >
                  <item.icon size={18} className="text-gray-300" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Rodapé da Sidebar: Menu Configurações Fixado Embaixo */}
        <div className="p-3 border-t border-white/10 shrink-0 mt-auto bg-black/10 space-y-2">
          {canAccessSettings && (
            <Link
              to="/admin/configuracoes"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                location.pathname === "/admin/configuracoes" 
                  ? "bg-white text-military-dark shadow-md" 
                  : "hover:bg-white/10 text-gray-200"
              }`}
            >
              <Settings size={18} className="text-gray-300" />
              <span>{t("menu_settings")}</span>
            </Link>
          )}

          {/* Resumo do Usuário Logado */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between px-2 text-xs text-gray-300">
            <div className="truncate max-w-[130px]">
              <p className="font-semibold text-white truncate">{currentUser?.nome || currentUser?.email || "Usuário"}</p>
              {currentUser?.cargo?.trim() && <p className="text-[10px] text-green-300 truncate">{currentUser.cargo}</p>}
            </div>
            <button 
              onClick={handleLogout} 
              title="Sair do sistema"
              className="p-1.5 rounded hover:bg-white/10 text-red-300 hover:text-red-200 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay para fechar sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="admin-topbar bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Igreja Evangélica de Luanda</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle className="text-gray-600 dark:text-gray-200" />
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserCircle className="h-5 w-5 text-military" />
              <span>{currentUser?.nome || currentUser?.email || "Administrador"}</span>
              {currentUser?.cargo?.trim() && (
                <span className="ml-1 text-[11px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                  {currentUser.cargo}
                </span>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition font-medium"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        {/* Conteúdo com Validação de Permissão */}
        <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8 bg-gray-50">
          {isAuthorized ? (
            <Outlet />
          ) : (
            <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Você não possui privilégios configurados para acessar este recurso no momento.
                Caso necessite deste acesso, solicite a um administrador para atualizar suas permissões em <strong className="text-gray-800">Configurações &gt; Usuários e Privilégios</strong>.
              </p>
              <div className="pt-2">
                <Button 
                  onClick={() => navigate("/admin")}
                  className="bg-military hover:bg-military-dark gap-2"
                >
                  <ArrowLeft size={16} /> Voltar ao Painel Principal
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
