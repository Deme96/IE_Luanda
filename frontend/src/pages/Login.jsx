import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/base44";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ArrowLeft, Globe } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [policyText, setPolicyText] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await base44.db.get("Configuracoes");
        if (config && config.length > 0 && config[0].politica_uso) {
          setPolicyText(config[0].politica_uso);
        } else {
          setPolicyText(t("policy_default"));
        }
      } catch (err) {
        setPolicyText(t("policy_default"));
      }
    }
    loadConfig();
  }, [t]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await base44.auth.login(email, password);
      toast.success("Login efetuado com sucesso!");
      navigate("/admin");
    } catch (e) {
      toast.error(e.message || "Erro ao fazer login");
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-gray-900">
      
      {/* Lado Esquerdo: Política de Bom Uso */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-military-dark text-white flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-sm font-medium hover:text-gray-300 transition-colors mb-12">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_site")}
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t("policy_title")}</h1>
          </div>
          
          <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-lg opacity-90">
            {policyText.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 flex justify-between items-end mt-12">
          <div>
            <p className="text-sm font-semibold opacity-75">I.E.L. - Sistema Interno</p>
            <p className="text-xs opacity-50">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário de Login */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 lg:p-16 relative">
        
        {/* Seletor de Idioma no topo direito */}
        <div className="absolute top-6 right-8 flex items-center gap-2 text-sm text-gray-500">
          <Globe className="h-4 w-4" />
          <button onClick={() => changeLanguage('pt')} className={`hover:text-military ${i18n.language === 'pt' ? 'font-bold text-military' : ''}`}>PT</button> |
          <button onClick={() => changeLanguage('en')} className={`hover:text-military ${i18n.language === 'en' ? 'font-bold text-military' : ''}`}>EN</button> |
          <button onClick={() => changeLanguage('fr')} className={`hover:text-military ${i18n.language === 'fr' ? 'font-bold text-military' : ''}`}>FR</button>
        </div>

        {/* Botão voltar mobile */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back_to_site")}
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {t("login_title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("login_description")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder={t("email_placeholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-200 bg-gray-50/50 focus-visible:ring-military"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder={t("password_placeholder")}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-200 bg-gray-50/50 focus-visible:ring-military"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-military hover:bg-military-dark text-white rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              {t("login_button")}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/register" className="text-sm font-medium text-military hover:text-military-dark hover:underline transition-colors">
              {t("create_account")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
