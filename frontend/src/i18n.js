import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      "login_title": "Gestão Eclesiástica",
      "login_description": "Entre com suas credenciais para acessar o painel",
      "email_placeholder": "E-mail",
      "password_placeholder": "Senha",
      "login_button": "Entrar",
      "create_account": "Criar conta",
      "back_to_site": "Voltar ao site",
      
      "site_about": "Sobre",
      "site_services": "Cultos",
      "site_projects": "Projetos",
      "site_churches": "Igrejas",
      "site_contact": "Contato",
      "site_restricted_access": "Acesso Restrito",
      
      "site_hero_title": "Igreja Evangélica de Luanda",
      "site_hero_subtitle": "Um lugar de fé, esperança e comunhão. Venha fazer parte da nossa família.",
      "site_hero_schedule": "Ver Horários",
      
      "policy_title": "Política de Bom Uso",
      "policy_default": "Bem-vindo ao sistema de Gestão Eclesiástica. Este sistema é destinado ao uso exclusivo de membros e líderes autorizados. O uso indevido das informações aqui contidas está sujeito a penalidades éticas e legais. Ao fazer login, você concorda em manter a confidencialidade dos dados.",
      
      "menu_dashboard": "Dashboard",
      "menu_members": "Membros",
      "menu_leaders": "Líderes",
      "menu_council": "Conselho",
      "menu_tithes": "Dízimos",
      "menu_offerings": "Ofertas",
      "menu_charges": "Encargos",
      "menu_documents": "Documentos",
      "menu_projects": "Projetos",
      "menu_churches": "Igrejas",
      "menu_settings": "Configurações",
      "menu_finances": "Finanças",
      "menu_leadership": "Direção",
      "menu_human_resources": "Recursos Humanos",
      "menu_departments": "Departamentos",
      "menu_patrimony": "Patrimônio",
      "menu_restricted_direction": "Direção Restrita",
      "menu_statistics": "Estatísticas",
      "menu_logout": "Sair do Sistema"
    }
  },
  en: {
    translation: {
      "login_title": "Ecclesiastical Management",
      "login_description": "Enter your credentials to access the panel",
      "email_placeholder": "E-mail",
      "password_placeholder": "Password",
      "login_button": "Sign In",
      "create_account": "Create account",
      "back_to_site": "Back to site",
      
      "site_about": "About",
      "site_services": "Services",
      "site_projects": "Projects",
      "site_churches": "Churches",
      "site_contact": "Contact",
      "site_restricted_access": "Restricted Access",
      
      "site_hero_title": "Evangelical Church of Luanda",
      "site_hero_subtitle": "A place of faith, hope, and communion. Come join our family.",
      "site_hero_schedule": "View Schedule",
      
      "policy_title": "Good Use Policy",
      "policy_default": "Welcome to the Ecclesiastical Management system. This system is intended for the exclusive use of authorized members and leaders. Misuse of the information contained herein is subject to ethical and legal penalties. By logging in, you agree to maintain data confidentiality.",
      
      "menu_dashboard": "Dashboard",
      "menu_members": "Members",
      "menu_leaders": "Leaders",
      "menu_council": "Council",
      "menu_tithes": "Tithes",
      "menu_offerings": "Offerings",
      "menu_charges": "Charges",
      "menu_documents": "Documents",
      "menu_projects": "Projects",
      "menu_churches": "Churches",
      "menu_settings": "Settings",
      "menu_finances": "Finances",
      "menu_leadership": "Leadership",
      "menu_human_resources": "Human Resources",
      "menu_departments": "Departments",
      "menu_patrimony": "Patrimony",
      "menu_restricted_direction": "Restricted Direction",
      "menu_statistics": "Statistics",
      "menu_logout": "Logout"
    }
  },
  fr: {
    translation: {
      "login_title": "Gestion Ecclésiastique",
      "login_description": "Entrez vos identifiants pour accéder au panneau",
      "email_placeholder": "E-mail",
      "password_placeholder": "Mot de passe",
      "login_button": "Se connecter",
      "create_account": "Créer un compte",
      "back_to_site": "Retour au site",
      
      "site_about": "À propos",
      "site_services": "Services",
      "site_projects": "Projets",
      "site_churches": "Églises",
      "site_contact": "Contact",
      "site_restricted_access": "Accès Restreint",
      
      "site_hero_title": "Église Évangélique de Luanda",
      "site_hero_subtitle": "Un lieu de foi, d'espérance et de communion. Venez rejoindre notre famille.",
      "site_hero_schedule": "Voir l'horaire",
      
      "policy_title": "Politique de Bon Usage",
      "policy_default": "Bienvenue dans le système de gestion ecclésiastique. Ce système est destiné à l'usage exclusif des membres et dirigeants autorisés. La mauvaise utilisation des informations contenues ici est sujette à des sanctions éthiques et légales. En vous connectant, vous acceptez de maintenir la confidentialité des données.",
      
      "menu_dashboard": "Tableau de Bord",
      "menu_members": "Membres",
      "menu_leaders": "Dirigeants",
      "menu_council": "Conseil",
      "menu_tithes": "Dîmes",
      "menu_offerings": "Offrandes",
      "menu_charges": "Frais",
      "menu_documents": "Documents",
      "menu_projects": "Projets",
      "menu_churches": "Églises",
      "menu_settings": "Paramètres",
      "menu_finances": "Finances",
      "menu_leadership": "Direction",
      "menu_human_resources": "Ressources Humaines",
      "menu_departments": "Départements",
      "menu_patrimony": "Patrimoine",
      "menu_restricted_direction": "Direction Restreinte",
      "menu_statistics": "Statistiques",
      "menu_logout": "Se déconnecter"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt", // idioma padrão
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
