import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/base44";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, UserCog, Crown, HandCoins, HeartHandshake, FileText, Pickaxe, Map, LogOut, Banknote, Menu, Settings, UserCircle, ChevronDown, ChevronUp, BarChart3, Building2, ShieldCheck, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("Administrador");
  const [openMenus, setOpenMenus] = useState({ "Direção": false, "Finanças": false, "RH": false });

  useEffect(() => {
    try {
      const session = localStorage.getItem("b44_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch(e) {}
  }, []);

  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const navItems = [
    { name: t("menu_dashboard"), path: "/admin", icon: LayoutDashboard },
    { name: t("menu_statistics"), path: "/admin/estatisticas", icon: BarChart3 },
    { 
      name: t("menu_human_resources"), 
      key: "RH",
      icon: Users,
      subItems: [
        { name: t("menu_members"), path: "/admin/membros", icon: Users },
        { name: t("menu_departments"), path: "/admin/departamentos", icon: Layers },
      ]
    },
    { 
      name: t("menu_leadership"), 
      key: "Direção",
      icon: Crown,
      subItems: [
        { name: t("menu_restricted_direction"), path: "/admin/direcao-restrita", icon: ShieldCheck },
        { name: t("menu_council"), path: "/admin/conselho", icon: Crown },
      ]
    },
    { 
      name: t("menu_finances"), 
      key: "Finanças",
      icon: Banknote,
      subItems: [
        { name: t("menu_tithes"), path: "/admin/dizimos", icon: HandCoins },
        { name: t("menu_offerings"), path: "/admin/ofertas", icon: HeartHandshake },
        { name: t("menu_charges"), path: "/admin/encargos", icon: Banknote },
      ]
    },
    { name: t("menu_patrimony"), path: "/admin/patrimonio", icon: Building2 },
    { name: t("menu_documents"), path: "/admin/documentos", icon: FileText },
    { name: t("menu_projects"), path: "/admin/projetos", icon: Pickaxe },
    { name: t("menu_churches"), path: "/admin/igrejas", icon: Map },
    { name: t("menu_settings"), path: "/admin/configuracoes", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Mobile Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <aside className={`w-64 bg-military-dark text-white flex flex-col absolute inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40`}>
        <div className="p-6 font-bold text-xl border-b border-white/10 mt-12 md:mt-0 flex items-center gap-2">
          Gestão Eclesiástica
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        {item.name}
                      </div>
                      {openMenus[item.key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openMenus[item.key] && (
                      <ul className="mt-1 ml-6 space-y-1 border-l border-white/20 pl-2">
                        {item.subItems.map(sub => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                                location.pathname === sub.path ? "bg-white text-military-dark font-bold shadow-md" : "hover:bg-white/10 text-gray-300"
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === item.path ? "bg-white text-military-dark font-bold shadow-md" : "hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-6 shrink-0 shadow-sm z-10 hidden md:flex">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <span>{userEmail}</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition font-medium">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
