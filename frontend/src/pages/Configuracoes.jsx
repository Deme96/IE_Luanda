import { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/base44";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Settings, ShieldCheck, Users, Calendar, Newspaper, FolderOpen,
  Images, Plus, Trash2, Edit, Check, Shield, Upload, Eye,
  RefreshCw, Download, Key, Image as ImageIcon, ExternalLink,
  CheckSquare, Square, Search, ChevronDown, ChevronUp, Video
} from "lucide-react";
import { getVideoSource } from "@/lib/video";
import { usePermissions } from "@/lib/usePermissions";
import {
  MENU_SECTIONS, MENU_RESOURCES, ALL_PERMISSION_KEYS,
  hasPermission
} from "@/lib/permissions";

const USER_PROFILE_OPTIONS = [
  "Pastor",
  "Pastor Presidente",
  "Pastor Auxiliar",
  "Presbítero",
  "Evangelista",
  "Missionário",
  "Diácono",
  "Secretário",
  "Tesoureiro",
  "Líder de Departamento",
  "Membro",
  "Outro"
];

const normalizeUserProfile = (profile) => {
  if (!profile) return "";
  return USER_PROFILE_OPTIONS.includes(profile) ? profile : "Outro";
};

export default function Configuracoes() {
  const { t, i18n } = useTranslation();
  const { can, ready: permissionsReady } = usePermissions();
  const backupFileInputRef = useRef(null);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [activeTab, setActiveTab] = useState("sistema");
  const [loading, setLoading] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState([]);
  const [loadingSyncConflicts, setLoadingSyncConflicts] = useState(false);

  // Dados de Sistema
  const [config, setConfig] = useState({
    id: "1",
    nome_igreja: "Igreja Evangélica de Luanda",
    idioma_padrao: "pt",
    telefone: "",
    email: "",
    endereco: "Luanda, Guiné-Bissau",
    politica_uso: ""
  });

  // Dados das Listas
  const [usuarios, setUsuarios] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [videos, setVideos] = useState([]);
  const [cultos, setCultos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [noticias, setNoticias] = useState([]);

  // Modal de Usuário / Privilégios Detalhados
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    nome: "",
    cargo: "",
    email: "",
    password: "",
    role: "personalizado",
    status: "ativo",
    permissoes: ["dashboard", "dashboard.indicadores"]
  });
  const [permSearch, setPermSearch] = useState("");

  // Modal de Carrossel
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isProcessingCarouselImage, setIsProcessingCarouselImage] = useState(false);
  const [slideForm, setSlideForm] = useState({
    titulo: "",
    descricao: "",
    url: "",
    ordem: 1,
    ativo: true
  });

  // Modal de vídeos do site
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({ titulo: "", descricao: "", url: "", ordem: 1, ativo: true });

  // Modal de Culto
  const [isCultoModalOpen, setIsCultoModalOpen] = useState(false);
  const [editingCulto, setEditingCulto] = useState(null);
  const [cultoForm, setCultoForm] = useState({ nome: "", dia: "Domingo", hora: "19:00", descricao: "" });

  // Modal de Projeto
  const [isProjetoModalOpen, setIsProjetoModalOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState(null);
  const [projetoForm, setProjetoForm] = useState({
    nome: "",
    responsavel: "",
    orcamento: "",
    valor_arrecadado: "",
    status: "em_andamento",
    data_inicio: "",
    data_fim: "",
    descricao: ""
  });

  // Modal de Notícia
  const [isNoticiaModalOpen, setIsNoticiaModalOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [noticiaForm, setNoticiaForm] = useState({ titulo: "", data: "", descricao: "" });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [c, u, car, videoItems, cult, proj, not] = await Promise.all([
        base44.db.get("Configuracoes"),
        base44.db.get("users"),
        base44.db.get("Carousel"),
        base44.db.get("Videos"),
        base44.db.get("Cultos"),
        base44.db.get("Projeto"),
        base44.db.get("Noticias")
      ]);

      if (c && c.length > 0) setConfig(c[0]);
      setUsuarios(u || []);
      setCarouselSlides((car || []).sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0)));
      setVideos((videoItems || []).sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0)));
      setCultos(cult || []);
      setProjetos(proj || []);
      setNoticias(not || []);
    } catch (e) {
      toast.error("Erro ao carregar configurações: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SISTEMA & POLÍTICA
  // ═══════════════════════════════════════════════════════════════
  const handleSaveConfig = async (e) => {
    e && e.preventDefault();
    try {
      const existing = await base44.db.get("Configuracoes");
      if (existing.length > 0) {
        await base44.db.update("Configuracoes", config.id || existing[0].id, config);
      } else {
        await base44.db.create("Configuracoes", config);
      }
      toast.success("Configurações atualizadas com sucesso!");
      if (config.idioma_padrao && config.idioma_padrao !== i18n.language) {
        i18n.changeLanguage(config.idioma_padrao);
      }
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTÃO DE USUÁRIOS E PRIVILÉGIOS DETALHADOS POR MENU
  // ═══════════════════════════════════════════════════════════════
  const handleOpenUserModal = (user = null) => {
    setPermSearch("");
    if (user) {
      setEditingUser(user);
      setUserForm({
        nome: user.nome || "",
        cargo: normalizeUserProfile(user.cargo),
        email: user.email || "",
        password: "",
        role: user.role || "personalizado",
        status: user.status || "ativo",
        permissoes: Array.isArray(user.permissoes) ? [...user.permissoes] : ["dashboard", "dashboard.indicadores"]
      });
    } else {
      setEditingUser(null);
      setUserForm({
        nome: "",
        cargo: "",
        email: "",
        password: "",
        role: "personalizado",
        status: "ativo",
        permissoes: ["dashboard", "dashboard.indicadores"]
      });
    }
    setIsUserModalOpen(true);
  };

  // Verifica se todos os recursos de um menu estão marcados
  const isSectionFullyChecked = (section) => {
    return section.recursos.every(r => hasPermission(userForm, r.key));
  };

  // Conta quantos recursos de um menu estão marcados
  const getSectionCheckedCount = (section) => {
    return section.recursos.filter(r => hasPermission(userForm, r.key)).length;
  };

  // Alterna o menu inteiro (todos os seus recursos)
  const toggleSectionAll = (section) => {
    const isFull = isSectionFullyChecked(section);
    const subKeys = section.recursos.map(r => r.key);
    const allKeys = [section.key, ...subKeys];

    setUserForm(prev => {
      let updated;
      if (isFull) {
        // Desmarca todos deste menu
        updated = prev.permissoes.filter(k => !allKeys.includes(k));
      } else {
        // Marca todos deste menu
        const set = new Set([...prev.permissoes, ...allKeys]);
        updated = Array.from(set);
      }
      return { ...prev, role: prev.role === "admin" ? "admin" : "personalizado", permissoes: updated };
    });
  };

  // Alterna um recurso específico dentro de um menu
  const toggleResource = (section, resource) => {
    setUserForm(prev => {
      const exists = hasPermission(prev, resource.key);
      let updated;
      if (exists) {
        updated = prev.permissoes.filter(k => k !== resource.key);
        // Ao editar uma permissão antiga de menu inteiro, expande-a para subpermissões
        // explícitas antes de retirar somente o recurso selecionado.
        if (prev.permissoes.includes(section.key)) {
          const alreadyGranular = prev.permissoes.some(key => key.startsWith(`${section.key}.`));
          updated = updated.filter(key => key !== section.key);
          if (!alreadyGranular) {
            section.recursos
              .filter(item => item.key !== resource.key)
              .forEach(item => updated.push(item.key));
          }
        }
      } else {
        // O recurso granular não deve manter a chave do menu, pois ela representa acesso total legado.
        const set = new Set([...prev.permissoes.filter(key => key !== section.key), resource.key]);
        updated = Array.from(set);
      }
      return { ...prev, role: prev.role === "admin" ? "admin" : "personalizado", permissoes: updated };
    });
  };

  const selectAllPermissions = () => {
    setUserForm(prev => ({ ...prev, role: prev.role === "admin" ? "admin" : "personalizado", permissoes: [...ALL_PERMISSION_KEYS] }));
  };

  const clearAllPermissions = () => {
    setUserForm(prev => ({ ...prev, role: prev.role === "admin" ? "admin" : "personalizado", permissoes: ["dashboard.indicadores"] }));
  };

  // Filtra as seções de menu pela busca interna
  const filteredMenuSections = useMemo(() => {
    if (!permSearch.trim()) return MENU_SECTIONS;
    const q = permSearch.toLowerCase();
    return MENU_SECTIONS.filter(section => {
      const matchTitle = section.title.toLowerCase().includes(q) || section.descricao.toLowerCase().includes(q);
      const matchResource = section.recursos.some(r => r.label.toLowerCase().includes(q) || r.descricao.toLowerCase().includes(q));
      return matchTitle || matchResource;
    });
  }, [permSearch]);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.email.trim()) {
      toast.error("O e-mail é obrigatório.");
      return;
    }

    try {
      if (editingUser) {
        const updatePayload = {
          nome: userForm.nome.trim() || userForm.email.split("@")[0],
          cargo: userForm.cargo.trim(),
          email: userForm.email.trim().toLowerCase(),
          role: editingUser.role === "admin" ? "admin" : "personalizado",
          status: userForm.status,
          permissoes: userForm.permissoes
        };
        if (userForm.password.trim()) {
          updatePayload.password = userForm.password.trim();
        }
        await base44.db.update("users", editingUser.id, updatePayload);
        toast.success("Usuário e privilégios atualizados com sucesso!");
      } else {
        if (!userForm.password.trim()) {
          toast.error("Defina uma senha para o novo usuário.");
          return;
        }
        await base44.auth.register(userForm.email, userForm.password, {
          nome: userForm.nome,
          cargo: userForm.cargo,
          role: "personalizado",
          status: userForm.status,
          permissoes: userForm.permissoes
        });
        toast.success("Novo usuário cadastrado com sucesso!");
      }
      setIsUserModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar usuário.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === "admin@iel.com") {
      toast.error("Não é permitido excluir o administrador principal.");
      return;
    }
    if (window.confirm(`Deseja realmente excluir o usuário ${user.nome || user.email}?`)) {
      try {
        await base44.db.delete("users", user.id);
        toast.success("Usuário excluído com sucesso.");
        loadAllData();
      } catch (err) {
        toast.error("Erro ao excluir usuário: " + err.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTÃO DO CARROSSEL & GALERIA
  // ═══════════════════════════════════════════════════════════════
  const handleOpenCarouselModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        titulo: slide.titulo || "",
        descricao: slide.descricao || "",
        url: slide.url || "",
        ordem: slide.ordem || 1,
        ativo: slide.ativo !== false
      });
    } else {
      setEditingSlide(null);
      setSlideForm({
        titulo: "",
        descricao: "",
        url: "",
        ordem: carouselSlides.length + 1,
        ativo: true
      });
    }
    setIsCarouselModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = "";

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      toast.error("Formato não suportado. Selecione uma imagem JPG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 20 MB.");
      return;
    }

    setIsProcessingCarouselImage(true);
    try {
      const sourceUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
        reader.readAsDataURL(file);
      });

      const image = await new Promise((resolve, reject) => {
        const loadedImage = new Image();
        loadedImage.onload = () => resolve(loadedImage);
        loadedImage.onerror = () => reject(new Error("O arquivo selecionado não contém uma imagem válida."));
        loadedImage.src = sourceUrl;
      });

      if (image.naturalWidth < 1280 || image.naturalHeight < 720) {
        throw new Error(`A imagem tem ${image.naturalWidth}×${image.naturalHeight}px. Use uma imagem horizontal de pelo menos 1280×720px.`);
      }

      const scale = Math.min(1, 1920 / image.naturalWidth, 1080 / image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Não foi possível preparar a imagem neste navegador.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const optimizedImage = canvas.toDataURL("image/jpeg", 0.9);
      setSlideForm(prev => ({ ...prev, url: optimizedImage }));
      toast.success(`Imagem pronta: ${canvas.width}×${canvas.height}px, qualidade alta.`);
    } catch (error) {
      toast.error(error.message || "Não foi possível processar a imagem.");
    } finally {
      setIsProcessingCarouselImage(false);
    }
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!slideForm.url.trim()) {
      toast.error("Informe a imagem (Upload ou URL).");
      return;
    }

    try {
      if (editingSlide) {
        await base44.db.update("Carousel", editingSlide.id, slideForm);
        toast.success("Foto do carrossel atualizada!");
      } else {
        await base44.db.create("Carousel", slideForm);
        toast.success("Nova foto adicionada ao carrossel!");
      }
      setIsCarouselModalOpen(false);
      loadAllData();
    } catch (err) {
      const storageFull = err?.name === "QuotaExceededError" || /quota|storage/i.test(err?.message || "");
      toast.error(storageFull
        ? "O armazenamento do navegador está cheio. Remova fotos antigas ou use uma URL de imagem hospedada."
        : "Erro ao salvar foto: " + err.message);
    }
  };

  const handleToggleSlideActive = async (slide) => {
    try {
      await base44.db.update("Carousel", slide.id, { ativo: !slide.ativo });
      toast.success(slide.ativo ? "Foto desativada do site." : "Foto ativada no site!");
      loadAllData();
    } catch (err) {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  };

  const handleDeleteSlide = async (slide) => {
    if (window.confirm(`Deseja remover esta foto do carrossel?`)) {
      try {
        await base44.db.delete("Carousel", slide.id);
        toast.success("Foto removida com sucesso.");
        loadAllData();
      } catch (err) {
        toast.error("Erro ao excluir foto: " + err.message);
      }
    }
  };

  const handleOpenVideoModal = (video = null) => {
    setEditingVideo(video);
    setVideoForm(video ? {
      titulo: video.titulo || "",
      descricao: video.descricao || "",
      url: video.url || "",
      ordem: video.ordem || 1,
      ativo: video.ativo !== false
    } : {
      titulo: "",
      descricao: "",
      url: "",
      ordem: videos.length + 1,
      ativo: true
    });
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!getVideoSource(videoForm.url)) {
      toast.error("Informe um link válido do YouTube, Vimeo ou de um arquivo MP4, WebM ou OGG.");
      return;
    }

    try {
      const payload = { ...videoForm, ordem: Number(videoForm.ordem) || 1 };
      if (editingVideo) {
        await base44.db.update("Videos", editingVideo.id, payload);
        toast.success("Vídeo atualizado!");
      } else {
        await base44.db.create("Videos", payload);
        toast.success("Vídeo adicionado ao site!");
      }
      setIsVideoModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error("Erro ao salvar vídeo: " + err.message);
    }
  };

  const handleToggleVideoActive = async (video) => {
    try {
      await base44.db.update("Videos", video.id, { ativo: !video.ativo });
      toast.success(video.ativo ? "Vídeo ocultado do site." : "Vídeo publicado no site!");
      loadAllData();
    } catch (err) {
      toast.error("Erro ao atualizar vídeo: " + err.message);
    }
  };

  const handleDeleteVideo = async (video) => {
    if (!window.confirm(`Deseja remover o vídeo "${video.titulo || "sem título"}"?`)) return;
    try {
      await base44.db.delete("Videos", video.id);
      toast.success("Vídeo removido.");
      loadAllData();
    } catch (err) {
      toast.error("Erro ao excluir vídeo: " + err.message);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTÃO DE CULTOS
  // ═══════════════════════════════════════════════════════════════
  const handleOpenCultoModal = (culto = null) => {
    if (culto) {
      setEditingCulto(culto);
      setCultoForm({
        nome: culto.nome || "",
        dia: culto.dia || "Domingo",
        hora: culto.hora || "19:00",
        descricao: culto.descricao || culto.desc || ""
      });
    } else {
      setEditingCulto(null);
      setCultoForm({ nome: "", dia: "Domingo", hora: "19:00", descricao: "" });
    }
    setIsCultoModalOpen(true);
  };

  const handleSaveCulto = async (e) => {
    e.preventDefault();
    try {
      if (editingCulto) {
        await base44.db.update("Cultos", editingCulto.id, cultoForm);
        toast.success("Culto atualizado com sucesso!");
      } else {
        await base44.db.create("Cultos", cultoForm);
        toast.success("Culto cadastrado com sucesso!");
      }
      setIsCultoModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error("Erro ao salvar culto: " + err.message);
    }
  };

  const handleDeleteCulto = async (culto) => {
    if (window.confirm(`Excluir o culto "${culto.nome}"?`)) {
      try {
        await base44.db.delete("Cultos", culto.id);
        toast.success("Culto excluído.");
        loadAllData();
      } catch (err) {
        toast.error("Erro ao excluir: " + err.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTÃO DE PROJETOS
  // ═══════════════════════════════════════════════════════════════
  const handleOpenProjetoModal = (proj = null) => {
    if (proj) {
      setEditingProjeto(proj);
      setProjetoForm({
        nome: proj.nome || "",
        responsavel: proj.responsavel || "",
        orcamento: proj.orcamento || "",
        valor_arrecadado: proj.valor_arrecadado || "0",
        status: proj.status || "em_andamento",
        data_inicio: proj.data_inicio || "",
        data_fim: proj.data_fim || "",
        descricao: proj.descricao || ""
      });
    } else {
      setEditingProjeto(null);
      setProjetoForm({
        nome: "",
        responsavel: "",
        orcamento: "",
        valor_arrecadado: "0",
        status: "em_andamento",
        data_inicio: "",
        data_fim: "",
        descricao: ""
      });
    }
    setIsProjetoModalOpen(true);
  };

  const handleSaveProjeto = async (e) => {
    e.preventDefault();
    try {
      if (editingProjeto) {
        await base44.db.update("Projeto", editingProjeto.id, projetoForm);
        toast.success("Projeto atualizado!");
      } else {
        await base44.db.create("Projeto", projetoForm);
        toast.success("Projeto cadastrado!");
      }
      setIsProjetoModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error("Erro ao salvar projeto: " + err.message);
    }
  };

  const handleDeleteProjeto = async (proj) => {
    if (window.confirm(`Excluir o projeto "${proj.nome}"?`)) {
      try {
        await base44.db.delete("Projeto", proj.id);
        toast.success("Projeto excluído.");
        loadAllData();
      } catch (err) {
        toast.error("Erro ao excluir: " + err.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTÃO DE NOTÍCIAS
  // ═══════════════════════════════════════════════════════════════
  const handleOpenNoticiaModal = (not = null) => {
    if (not) {
      setEditingNoticia(not);
      setNoticiaForm({
        titulo: not.titulo || "",
        data: not.data || new Date().toISOString().split("T")[0],
        descricao: not.descricao || ""
      });
    } else {
      setEditingNoticia(null);
      setNoticiaForm({
        titulo: "",
        data: new Date().toISOString().split("T")[0],
        descricao: ""
      });
    }
    setIsNoticiaModalOpen(true);
  };

  const handleSaveNoticia = async (e) => {
    e.preventDefault();
    try {
      if (editingNoticia) {
        await base44.db.update("Noticias", editingNoticia.id, noticiaForm);
        toast.success("Notícia atualizada!");
      } else {
        await base44.db.create("Noticias", noticiaForm);
        toast.success("Notícia cadastrada!");
      }
      setIsNoticiaModalOpen(false);
      loadAllData();
    } catch (err) {
      toast.error("Erro ao salvar notícia: " + err.message);
    }
  };

  const handleDeleteNoticia = async (not) => {
    if (window.confirm(`Excluir a notícia "${not.titulo}"?`)) {
      try {
        await base44.db.delete("Noticias", not.id);
        toast.success("Notícia excluída.");
        loadAllData();
      } catch (err) {
        toast.error("Erro ao excluir: " + err.message);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // BACKUP & RESTAURAÇÃO
  // ═══════════════════════════════════════════════════════════════
  const handleExportData = async () => {
    try {
      await base44.db.syncLocal();
      const raw = localStorage.getItem("base44_db") || "{}";
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_gestao_igreja_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup baixado com sucesso!");
    } catch (e) {
      toast.error(e.message || "Erro ao exportar dados.");
    }
  };

  const handleLoadSyncConflicts = async () => {
    setLoadingSyncConflicts(true);
    try {
      setSyncConflicts(await base44.db.getSyncConflicts());
    } catch (error) {
      toast.error(error.message || "Não foi possível carregar os conflitos.");
    } finally {
      setLoadingSyncConflicts(false);
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!file.name.toLowerCase().endsWith(".json") || file.size > 25 * 1024 * 1024) {
      toast.error("Selecione um backup JSON com até 25 MB.");
      return;
    }

    setIsRestoringBackup(true);
    try {
      const contents = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo selecionado."));
        reader.readAsText(file);
      });
      const backup = JSON.parse(contents);

      if (!backup || typeof backup !== "object" || Array.isArray(backup) || !Array.isArray(backup.users)) {
        throw new Error("O arquivo não parece ser um backup válido do sistema.");
      }

      const invalidCollection = Object.entries(backup).find(([key, value]) =>
        !key.startsWith("_") && !Array.isArray(value)
      );
      if (invalidCollection) {
        throw new Error(`A coleção "${invalidCollection[0]}" tem formato inválido.`);
      }
      if (backup.users.some(user => !user || typeof user !== "object" || !user.id || !user.email)) {
        throw new Error("O backup contém usuários sem identificador ou e-mail.");
      }
      if (["_carouselContentVersion", "_userDataOnlyVersion"].some((key) =>
        backup[key] !== undefined && !Number.isInteger(backup[key])
      )) {
        throw new Error("A versão do backup está inválida.");
      }

      if (!window.confirm(`Importar o backup "${file.name}"? No modo compartilhado, os dados serão mesclados e conflitos serão preservados para revisão.`)) return;

      await base44.db.syncLocal(backup);
      await loadAllData();
      toast.success("Backup importado e sincronizado.");
    } catch (error) {
      const storageFull = error?.name === "QuotaExceededError";
      toast.error(storageFull
        ? "Não há espaço suficiente no navegador para restaurar este backup."
        : error instanceof SyntaxError
          ? "O arquivo não contém um JSON válido."
          : error.message || "Não foi possível restaurar o backup.");
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Atenção: Isso apagará todos os dados do sistema, mantendo as contas de usuário. Essa ação não pode ser desfeita sem um backup. Deseja continuar?")) {
      try {
        await base44.db.reset();
        toast.success("Dados do sistema eliminados. As contas de usuário foram preservadas.");
        await loadAllData();
      } catch (error) {
        toast.error(error.message || "Não foi possível eliminar os dados.");
      }
    }
  };

  const tabs = [
    { id: "sistema", label: "Sistema", icon: Settings, permission: "configuracoes.sistema" },
    { id: "carrossel", label: "Carrossel & Galeria", icon: Images, permission: "configuracoes.carrossel" },
    { id: "videos", label: "Vídeos do Site", icon: Video, permission: "configuracoes.videos" },
    { id: "usuarios", label: "Usuários & Privilégios", icon: Users, permission: "configuracoes.usuarios" },
    { id: "cultos", label: "Cultos", icon: Calendar, permission: "configuracoes.cultos" },
    { id: "projetos", label: "Projetos", icon: FolderOpen, permission: "configuracoes.projetos" },
    { id: "noticias", label: "Notícias", icon: Newspaper, permission: "configuracoes.noticias" },
    { id: "politica", label: "Política de Uso", icon: ShieldCheck, permission: "configuracoes.politica" },
    { id: "backup", label: "Backup & Dados", icon: RefreshCw, permission: "configuracoes.backup" },
  ];
  const visibleTabs = permissionsReady ? tabs.filter(tab => can(tab.permission)) : [];

  useEffect(() => {
    if (permissionsReady && visibleTabs.length > 0 && !visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [permissionsReady, activeTab, visibleTabs]);

  if (!permissionsReady) return <div className="p-8 text-center text-gray-500">Verificando privilégios...</div>;
  if (visibleTabs.length === 0) return <div className="p-8 text-center text-gray-500">Não possui privilégios para as configurações do sistema.</div>;

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-military" /> Configurações do Sistema
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie fotos do carrossel do site, usuários, privilégios detalhados por menu e preferências institucionais.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Menu Lateral das Configurações */}
        <div className="w-full md:w-64 flex flex-col gap-1.5 shrink-0">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? "bg-military text-white shadow-md shadow-military/20 translate-x-1" 
                  : "text-gray-600 hover:bg-white hover:text-gray-900 bg-gray-50/60"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Ativo */}
        <div className="flex-1 min-w-0">
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            
            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 1: SISTEMA */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "sistema" && (
              <form onSubmit={handleSaveConfig}>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle>Geral do Sistema</CardTitle>
                  <CardDescription>Informações institucionais da igreja e configurações de idioma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome_igreja">Nome da Igreja / Instituição</Label>
                      <Input 
                        id="nome_igreja"
                        value={config.nome_igreja} 
                        onChange={(e) => setConfig({ ...config, nome_igreja: e.target.value })}
                        placeholder="Ex: Igreja Evangélica de Luanda"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idioma_padrao">Idioma Padrão</Label>
                      <select 
                        id="idioma_padrao"
                        value={config.idioma_padrao}
                        onChange={(e) => setConfig({ ...config, idioma_padrao: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-military"
                      >
                        <option value="pt">Português (PT)</option>
                        <option value="en">Inglês (EN)</option>
                        <option value="fr">Francês (FR)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone Principal</Label>
                      <Input 
                        id="telefone"
                        value={config.telefone || ""} 
                        onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                        placeholder="Ex: +244 9XX XXX XXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail de Contato</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={config.email || ""} 
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                        placeholder="E-mail institucional"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="endereco">Endereço da Sede</Label>
                      <Input 
                        id="endereco"
                        value={config.endereco || ""} 
                        onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                        placeholder="Ex: Luanda, Guiné-Bissau"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Configurações</Button>
                  </div>
                </CardContent>
              </form>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 2: GESTÃO DO CARROSSEL & GALERIA DE FOTOS */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "carrossel" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Images className="text-military h-5 w-5" /> Gestão do Carrossel e Galeria
                    </CardTitle>
                    <CardDescription>
                      Adicione, edite ou altere as fotos de fundo exibidas na área principal da página inicial do site.
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenCarouselModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Nova Foto / Slide
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {carouselSlides.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Nenhuma foto cadastrada no carrossel.</p>
                      <Button onClick={() => handleOpenCarouselModal()} className="mt-4 bg-military hover:bg-military-dark">
                        + Adicionar Primeira Foto
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {carouselSlides.map((slide) => (
                        <div 
                          key={slide.id} 
                          className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div className="relative h-44 bg-gray-100 overflow-hidden">
                            <img 
                              src={slide.url} 
                              alt={slide.titulo} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm">
                              Ordem: #{slide.ordem || 1}
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                slide.ativo !== false ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                              }`}>
                                {slide.ativo !== false ? "Ativo no Fundo" : "Inativo"}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{slide.titulo || "Sem título"}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{slide.descricao || "Sem descrição"}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleToggleSlideActive(slide)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                                  slide.ativo !== false 
                                    ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100" 
                                    : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                                }`}
                              >
                                {slide.ativo !== false ? "Desativar" : "Ativar no Site"}
                              </button>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenCarouselModal(slide)}
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                  title="Editar foto"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSlide(slide)}
                                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  title="Excluir foto"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* ABA: VÍDEOS DO SITE */}
            {activeTab === "videos" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="text-military h-5 w-5" /> Vídeos do Site
                    </CardTitle>
                    <CardDescription>Publique vídeos do YouTube, Vimeo ou arquivos MP4, WebM e OGG usando o link do vídeo.</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenVideoModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Adicionar Vídeo
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {videos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
                      <Video className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Nenhum vídeo cadastrado.</p>
                      <Button onClick={() => handleOpenVideoModal()} className="mt-4 bg-military hover:bg-military-dark">
                        + Adicionar Primeiro Vídeo
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map(video => (
                        <div key={video.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-military mb-2">
                                <Video size={18} />
                                <span className="text-xs font-semibold">Ordem #{video.ordem || 1}</span>
                              </div>
                              <h4 className="font-bold text-gray-900">{video.titulo || "Vídeo sem título"}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{video.descricao || "Sem descrição"}</p>
                              <a href={video.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 text-xs text-blue-700 hover:underline">
                                <ExternalLink size={12} /> <span className="truncate">Abrir vídeo</span>
                              </a>
                            </div>
                            <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${video.ativo !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {video.ativo !== false ? "Publicado" : "Oculto"}
                            </span>
                          </div>
                          <div className="mt-4 pt-3 border-t flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleToggleVideoActive(video)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border text-military bg-green-50 border-green-200 hover:bg-green-100"
                            >
                              {video.ativo !== false ? "Ocultar" : "Publicar no Site"}
                            </button>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenVideoModal(video)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Editar vídeo">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video)} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Excluir vídeo">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 3: GESTÃO DE USUÁRIOS E PRIVILÉGIOS DETALHADOS POR MENU */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "usuarios" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="text-military h-5 w-5" /> Usuários e Privilégios Detalhados por Menu
                    </CardTitle>
                    <CardDescription>
                      Cadastre novos usuários e selecione minuciosamente os recursos de cada menu aos quais o usuário terá permissão de acesso.
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenUserModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Novo Usuário
                  </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b text-gray-700">
                        <tr>
                          <th className="px-4 py-3 font-bold">Nome & E-mail</th>
                          <th className="px-4 py-3 font-bold">Tipo de Perfil / Cargo</th>
                          <th className="px-4 py-3 font-bold">Menus & Recursos Liberados</th>
                          <th className="px-4 py-3 font-bold text-center">Status</th>
                          <th className="px-4 py-3 font-bold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {usuarios.map(u => {
                          const perms = Array.isArray(u.permissoes) ? u.permissoes : [];
                          const isFullAdmin = u.role === "admin" || perms.length === ALL_PERMISSION_KEYS.length;
                          const activeMenus = MENU_SECTIONS.filter(s => hasPermission(u, s.key));

                          return (
                            <tr key={u.id} className="hover:bg-gray-50/70 transition">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">{u.nome || "Usuário"}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                  u.role === "admin" 
                                    ? "bg-purple-100 text-purple-800" 
                                    : u.role === "pastor"
                                    ? "bg-blue-100 text-blue-800"
                                    : u.role === "tesouraria"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {u.cargo || "Cargo não informado"}
                                </span>
                                <div className="text-[11px] text-gray-500 mt-1">Privilégios definidos manualmente</div>
                              </td>
                              <td className="px-4 py-3">
                                {isFullAdmin ? (
                                  <span className="text-xs font-bold text-military bg-green-50 border border-green-200 px-2.5 py-1 rounded-md inline-block">
                                    ✓ Acesso Total a Todos os {MENU_SECTIONS.length} Menus
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-800">
                                      {activeMenus.length} de {MENU_SECTIONS.length} menus liberados ({perms.length} recursos)
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-w-sm">
                                      {activeMenus.map(m => (
                                        <span key={m.key} className="text-[10px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded border border-gray-200">
                                          {m.title.replace("Recursos Humanos - ", "RH: ").replace("Direção - ", "Direção: ").replace("Finanças - ", "Finanças: ")}
                                        </span>
                                      ))}
                                      {activeMenus.length === 0 && (
                                        <span className="text-xs text-red-500 italic">Nenhum menu liberado</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                  u.status !== "inativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {u.status !== "inativo" ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenUserModal(u)}
                                  className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-medium"
                                >
                                  Personalizar Privilégios
                                </Button>
                                {u.email !== "admin@iel.com" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(u)}
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                    title="Excluir usuário"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 4: PROGRAMAÇÃO DE CULTOS */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "cultos" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="text-military h-5 w-5" /> Programação de Cultos
                    </CardTitle>
                    <CardDescription>
                      Cadastre e edite os dias, horários e tipos de reuniões exibidas no site institucional.
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenCultoModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Novo Culto
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {cultos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
                      <p className="text-gray-500 mb-4">Nenhum culto cadastrado.</p>
                      <Button onClick={() => handleOpenCultoModal()} className="bg-military hover:bg-military-dark">
                        + Adicionar Culto
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cultos.map(c => (
                        <div key={c.id || c.nome} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-base">{c.nome}</span>
                              <span className="text-xs bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                                {c.dia} • {c.hora}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{c.descricao || c.desc || "Sem descrição"}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenCultoModal(c)} className="h-8 w-8 text-blue-600">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCulto(c)} className="h-8 w-8 text-red-600">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 5: PROJETOS MISSIONÁRIOS */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "projetos" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="text-military h-5 w-5" /> Projetos Missionários & Sociais
                    </CardTitle>
                    <CardDescription>
                      Gerencie as ações sociais e seus objetivos financeiros.
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenProjetoModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Novo Projeto
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {projetos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
                      <p className="text-gray-500 mb-4">Nenhum projeto cadastrado.</p>
                      <Button onClick={() => handleOpenProjetoModal()} className="bg-military hover:bg-military-dark">
                        + Adicionar Projeto
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projetos.map(p => {
                        const prog = p.orcamento ? Math.min((Number(p.valor_arrecadado || 0) / Number(p.orcamento)) * 100, 100) : 0;
                        return (
                          <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{p.nome}</h4>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  p.status === "em_andamento" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                }`}>
                                  {p.status || "em_andamento"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{p.descricao}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span>Responsável: <strong>{p.responsavel || "—"}</strong></span>
                                <span>Meta: <strong>XOF {Number(p.orcamento || 0).toLocaleString()}</strong></span>
                                <span>Arrecadado: <strong>XOF {Number(p.valor_arrecadado || 0).toLocaleString()} ({prog.toFixed(0)}%)</strong></span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenProjetoModal(p)} className="h-8 w-8 text-blue-600">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProjeto(p)} className="h-8 w-8 text-red-600">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 6: NOTÍCIAS & AVISOS */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "noticias" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="text-military h-5 w-5" /> Notícias e Comunicados
                    </CardTitle>
                    <CardDescription>
                      Publique novidades, conferências e comunicados visíveis na página inicial do site.
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenNoticiaModal()} className="bg-military hover:bg-military-dark gap-2">
                    <Plus size={16} /> Nova Notícia
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {noticias.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
                      <p className="text-gray-500 mb-4">Nenhuma notícia publicada.</p>
                      <Button onClick={() => handleOpenNoticiaModal()} className="bg-military hover:bg-military-dark">
                        + Publicar Notícia
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {noticias.map(n => (
                        <div key={n.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded">{n.data}</span>
                              <h4 className="font-bold text-gray-900">{n.titulo}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{n.descricao}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenNoticiaModal(n)} className="h-8 w-8 text-blue-600">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNoticia(n)} className="h-8 w-8 text-red-600">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 7: POLÍTICA DE USO */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "politica" && (
              <form onSubmit={handleSaveConfig}>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-military h-5 w-5" /> Política de Bom Uso
                  </CardTitle>
                  <CardDescription>
                    Texto institucional exibido na tela de login aos membros e líderes do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="politica_uso">Termo da Política de Uso</Label>
                    <textarea 
                      id="politica_uso"
                      name="politica_uso"
                      value={config.politica_uso}
                      onChange={(e) => setConfig({ ...config, politica_uso: e.target.value })}
                      rows={8}
                      className="flex w-full rounded-xl border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-military resize-y leading-relaxed"
                      placeholder="Escreva a política de uso aqui..."
                    />
                  </div>

                  {/* Prévia da Tela de Login */}
                  <div className="bg-military-dark text-white p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-green-300">Prévia da Tela de Login:</span>
                    <p className="opacity-80 italic line-clamp-3">{config.politica_uso || "Nenhum texto informado."}</p>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Política</Button>
                  </div>
                </CardContent>
              </form>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ABA 8: BACKUP & RESTAURAÇÃO */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === "backup" && (
              <div>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="text-military h-5 w-5" /> Backup e Restauração de Dados
                  </CardTitle>
                  <CardDescription>
                    Baixe uma cópia de segurança ou envie um backup JSON para recuperar os dados após uma exclusão acidental.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-blue-900">Exportar Backup JSON</h4>
                      <p className="text-xs text-blue-700 mt-1">Baixe todos os membros, dízimos, cultos, fotos do carrossel e configurações em um único arquivo.</p>
                    </div>
                    <Button onClick={handleExportData} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      <Download size={16} /> Baixar Backup
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-900">Restaurar de um Backup</h4>
                      <p className="text-xs text-emerald-700 mt-1">Selecione o backup JSON. No modo compartilhado, os dados são mesclados e conflitos ficam para revisão.</p>
                    </div>
                    <input
                      ref={backupFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isRestoringBackup}
                      onClick={() => backupFileInputRef.current?.click()}
                      className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 gap-2"
                    >
                      <Upload size={16} /> {isRestoringBackup ? "Restaurando…" : "Enviar Backup JSON"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-amber-900">Conflitos de sincronização</h4>
                        <p className="text-xs text-amber-700 mt-1">Registros locais diferentes dos que já estão no banco compartilhado.</p>
                      </div>
                      <Button type="button" variant="outline" onClick={handleLoadSyncConflicts} disabled={loadingSyncConflicts}>
                        {loadingSyncConflicts ? "Carregando…" : "Ver conflitos"}
                      </Button>
                    </div>
                    {syncConflicts.length > 0 && (
                      <ul className="max-h-48 overflow-y-auto divide-y divide-amber-200 text-sm text-amber-950">
                        {syncConflicts.map((conflict) => (
                          <li key={conflict.id} className="py-2">
                            <strong>{conflict.collection}</strong> — {conflict.record_id}
                            <span className="block text-xs text-amber-700">
                              {new Date(conflict.created_at).toLocaleString()}
                            </span>
                            <details className="mt-1 text-xs">
                              <summary className="cursor-pointer">Comparar versões preservadas</summary>
                              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                                <pre className="max-h-40 overflow-auto rounded bg-white/70 p-2 whitespace-pre-wrap break-words">
                                  {JSON.stringify(conflict.existing_data, null, 2)}
                                </pre>
                                <pre className="max-h-40 overflow-auto rounded bg-white/70 p-2 whitespace-pre-wrap break-words">
                                  {JSON.stringify(conflict.incoming_data, null, 2)}
                                </pre>
                              </div>
                            </details>
                          </li>
                        ))}
                      </ul>
                    )}
                    {syncConflicts.length === 0 && !loadingSyncConflicts && (
                      <p className="text-xs text-amber-800">Ainda não há conflitos carregados.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-red-900">Eliminar Dados do Sistema</h4>
                      <p className="text-xs text-red-700 mt-1">Apaga os registros do sistema e preserva todas as contas de usuário.</p>
                    </div>
                    <Button onClick={handleResetData} variant="outline" className="text-red-700 border-red-300 hover:bg-red-100 gap-2">
                      <RefreshCw size={16} /> Eliminar Dados
                    </Button>
                  </div>
                </CardContent>
              </div>
            )}

          </Card>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: USUÁRIO E GESTÃO DE PRIVILÉGIOS PERSONALIZADOS POR MENU */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Shield className="text-military h-6 w-6" />
              {editingUser ? "Editar Usuário e Privilégios Detalhados" : "Cadastrar Novo Usuário"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Defina as credenciais e selecione em cada menu exatamente quais recursos e permissões este usuário terá.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-5 pt-4">
            
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="user_nome">Nome Completo</Label>
                <Input
                  id="user_nome"
                  placeholder="Ex: Pastor Manuel"
                  value={userForm.nome}
                  onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user_email">E-mail de Acesso *</Label>
                <Input
                  id="user_email"
                  type="email"
                  placeholder="usuario@iel.org"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user_cargo">Tipo de Perfil / Cargo</Label>
                <Select value={userForm.cargo} onValueChange={(cargo) => setUserForm({ ...userForm, cargo })}>
                  <SelectTrigger id="user_cargo" className="bg-white">
                    <SelectValue placeholder="Selecione o perfil da pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_PROFILE_OPTIONS.map(profile => (
                      <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user_password">
                  {editingUser ? "Nova Senha (opcional)" : "Senha de Acesso *"}
                </Label>
                <Input
                  id="user_password"
                  type="password"
                  placeholder={editingUser ? "Deixe em branco para manter a atual" : "Mínimo 6 dígitos"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

            </div>

            {/* SELEÇÃO DETALHADA DE PRIVILÉGIOS APRESENTADA MENU POR MENU */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70 space-y-4">
              
              {/* Barra de Ações Rápidas & Busca de Privilégios */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Key size={16} className="text-military" /> Privilégios Detalhados por Menu
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Em cada menu abaixo, ative o menu inteiro ou selecione especificamente cada recurso desejado.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllPermissions}
                    className="text-xs h-7 px-2.5 gap-1 font-semibold text-military border-military/30 hover:bg-military/10"
                  >
                    <CheckSquare size={13} /> Marcar Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllPermissions}
                    className="text-xs h-7 px-2.5 gap-1 text-gray-600 hover:bg-gray-100"
                  >
                    <Square size={13} /> Desmarcar Todos
                  </Button>
                </div>
              </div>

              {/* Filtro de Busca de Recursos */}
              <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquisar por menu ou recurso (ex: dízimos, membros, carrossel, relatórios)..."
                  className="w-full text-xs outline-none bg-transparent"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                />
                {permSearch && (
                  <button 
                    type="button" 
                    onClick={() => setPermSearch("")}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Contador de Privilégios Ativos */}
              <div className="flex items-center justify-between text-xs text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <span>
                  Total selecionado: <strong>{userForm.permissoes.length}</strong> recursos em <strong>{MENU_SECTIONS.filter(s => hasPermission(userForm, s.key)).length}</strong> menus
                </span>
                <span className="text-[11px] text-gray-400">
                  Privilégios escolhidos manualmente
                </span>
              </div>

              {/* LISTA DE MENUS COM SEUS RESPECTIVOS RECURSOS */}
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredMenuSections.map(section => {
                  const isFull = isSectionFullyChecked(section);
                  const checkedCount = getSectionCheckedCount(section);
                  const isMenuPartiallyChecked = checkedCount > 0 && !isFull;
                  const isMenuChecked = isFull || isMenuPartiallyChecked;

                  return (
                    <div 
                      key={section.key}
                      className={`border rounded-xl p-3.5 transition bg-white shadow-sm ${
                        isMenuChecked 
                          ? "border-green-300 ring-1 ring-green-100" 
                          : "border-gray-200 opacity-90"
                      }`}
                    >
                      {/* Cabeçalho do Menu com Master Checkbox */}
                      <div className="flex items-start sm:items-center justify-between gap-3 border-b pb-2.5">
                        <label 
                          onClick={() => toggleSectionAll(section)}
                          className="flex items-center gap-2.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isFull}
                            ref={el => {
                              if (el) el.indeterminate = isMenuPartiallyChecked;
                            }}
                            onChange={() => {}}
                            className="h-4 w-4 rounded text-military focus:ring-military cursor-pointer"
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                              {section.title}
                            </span>
                            <span className="text-[11px] text-gray-500 line-clamp-1">
                              {section.descricao}
                            </span>
                          </div>
                        </label>

                        {/* Indicador de Recursos Marcados no Menu */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isFull 
                              ? "bg-green-100 text-green-800"
                              : checkedCount > 0 
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {checkedCount} / {section.recursos.length} recursos
                          </span>
                        </div>
                      </div>

                      {/* Grade de Recursos Específicos Deste Menu */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5">
                        {section.recursos.map(res => {
                          const isChecked = hasPermission(userForm, res.key);
                          return (
                            <label
                              key={res.key}
                              onClick={() => toggleResource(section, res)}
                              className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                                isChecked 
                                  ? "bg-green-50/50 border-green-300/80 shadow-2xs" 
                                  : "bg-gray-50/50 border-gray-100 hover:border-gray-200 text-gray-600"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 h-3.5 w-3.5 rounded text-military focus:ring-military cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-semibold block leading-tight ${isChecked ? "text-gray-900" : "text-gray-600"}`}>
                                  {res.label}
                                </span>
                                <span className="text-[10px] text-gray-500 block leading-tight mt-0.5 line-clamp-1">
                                  {res.descricao}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Status Ativo / Inativo */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
              <div>
                <Label htmlFor="status_switch" className="text-sm font-semibold cursor-pointer">Status do Usuário</Label>
                <p className="text-xs text-gray-500">Usuários inativos não conseguem entrar no sistema.</p>
              </div>
              <Select 
                value={userForm.status} 
                onValueChange={(val) => setUserForm({ ...userForm, status: val })}
              >
                <SelectTrigger className="w-32 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões do Rodapé */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">
                {editingUser ? "Salvar Alterações" : "Cadastrar Usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: CARROSSEL & GALERIA DE FOTOS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isCarouselModalOpen} onOpenChange={setIsCarouselModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="text-military h-5 w-5" />
              {editingSlide ? "Editar Foto do Carrossel" : "Adicionar Foto ao Carrossel"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Use uma foto horizontal de alta resolução ou cole um link direto. Uploads são preparados em até 1920×1080px, mantendo qualidade alta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSlide} className="space-y-4 pt-3">
            
            {/* Opção de Upload ou Link */}
            <div className="space-y-2">
              <Label>Foto / Imagem *</Label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-military rounded-xl p-3 cursor-pointer bg-gray-50 hover:bg-green-50/50 transition">
                  <Upload size={16} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">{isProcessingCarouselImage ? "Preparando imagem…" : "Enviar imagem em alta qualidade"}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileUpload} className="hidden" disabled={isProcessingCarouselImage} />
                </label>
              </div>
              <p className="text-[11px] text-gray-500">JPG, PNG, WebP ou AVIF · mínimo 1280×720px · máximo 20 MB. O arquivo é redimensionado para até 1920×1080px e salvo em JPEG de alta qualidade.</p>

              <div className="pt-1">
                <Input
                  placeholder="Ou cole a URL direta da imagem (https://...)"
                  value={slideForm.url}
                  onChange={(e) => setSlideForm({ ...slideForm, url: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* Prévia da Imagem */}
              {slideForm.url && (
                <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200 mt-2 bg-gray-100">
                  <img src={slideForm.url} alt="Prévia" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                    Prévia
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slide_titulo">Título do Slide</Label>
              <Input
                id="slide_titulo"
                placeholder="Ex: Culto de Louvor e Adoração"
                value={slideForm.titulo}
                onChange={(e) => setSlideForm({ ...slideForm, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slide_descricao">Descrição / Legenda</Label>
              <textarea
                id="slide_descricao"
                rows={2}
                placeholder="Breve frase descritiva sobre o momento ou evento..."
                className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-military"
                value={slideForm.descricao}
                onChange={(e) => setSlideForm({ ...slideForm, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slide_ordem">Ordem de Exibição</Label>
                <Input
                  id="slide_ordem"
                  type="number"
                  min="1"
                  value={slideForm.ordem}
                  onChange={(e) => setSlideForm({ ...slideForm, ordem: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Exibir no Site</Label>
                <Select 
                  value={slideForm.ativo ? "true" : "false"}
                  onValueChange={(val) => setSlideForm({ ...slideForm, ativo: val === "true" })}
                >
                  <SelectTrigger className="bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim (Ativo no Fundo)</SelectItem>
                    <SelectItem value="false">Não (Oculto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCarouselModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isProcessingCarouselImage} className="bg-military hover:bg-military-dark">
                Salvar Foto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: VÍDEO DO SITE */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="text-military h-5 w-5" />
              {editingVideo ? "Editar Vídeo" : "Adicionar Vídeo ao Site"}
            </DialogTitle>
            <DialogDescription>Insira o link de um vídeo do YouTube, Vimeo ou de um arquivo MP4, WebM ou OGG hospedado online.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveVideo} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="video_url">Link do Vídeo *</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoForm.url}
                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">Aceita links do YouTube, Vimeo e arquivos .mp4, .webm ou .ogg.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="video_titulo">Título</Label>
              <Input id="video_titulo" value={videoForm.titulo} onChange={(e) => setVideoForm({ ...videoForm, titulo: e.target.value })} placeholder="Ex: Culto de celebração" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="video_descricao">Descrição</Label>
              <textarea
                id="video_descricao"
                rows={3}
                value={videoForm.descricao}
                onChange={(e) => setVideoForm({ ...videoForm, descricao: e.target.value })}
                placeholder="Breve descrição do vídeo..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-military"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="video_ordem">Ordem de Exibição</Label>
                <Input id="video_ordem" type="number" min="1" value={videoForm.ordem} onChange={(e) => setVideoForm({ ...videoForm, ordem: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Exibir no Site</Label>
                <Select value={videoForm.ativo ? "true" : "false"} onValueChange={(val) => setVideoForm({ ...videoForm, ativo: val === "true" })}>
                  <SelectTrigger className="bg-white text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim (Publicado)</SelectItem>
                    <SelectItem value="false">Não (Oculto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsVideoModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Vídeo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: CULTO */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isCultoModalOpen} onOpenChange={setIsCultoModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingCulto ? "Editar Culto" : "Novo Culto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCulto} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="culto_nome">Nome do Culto *</Label>
              <Input
                id="culto_nome"
                placeholder="Ex: Culto da Família"
                value={cultoForm.nome}
                onChange={(e) => setCultoForm({ ...cultoForm, nome: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="culto_dia">Dia da Semana</Label>
                <Select value={cultoForm.dia} onValueChange={(val) => setCultoForm({ ...cultoForm, dia: val })}>
                  <SelectTrigger className="bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="culto_hora">Horário</Label>
                <Input
                  id="culto_hora"
                  placeholder="19:00"
                  value={cultoForm.hora}
                  onChange={(e) => setCultoForm({ ...cultoForm, hora: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="culto_desc">Descrição</Label>
              <Input
                id="culto_desc"
                placeholder="Ex: Estudo aprofundado e comunhão"
                value={cultoForm.descricao}
                onChange={(e) => setCultoForm({ ...cultoForm, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCultoModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Culto</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: PROJETO */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isProjetoModalOpen} onOpenChange={setIsProjetoModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingProjeto ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProjeto} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="proj_nome">Nome do Projeto *</Label>
              <Input
                id="proj_nome"
                placeholder="Ex: Água Potável para a Comunidade"
                value={projetoForm.nome}
                onChange={(e) => setProjetoForm({ ...projetoForm, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj_resp">Responsável</Label>
              <Input
                id="proj_resp"
                placeholder="Ex: Pr. Mário Gomes"
                value={projetoForm.responsavel}
                onChange={(e) => setProjetoForm({ ...projetoForm, responsavel: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proj_orc">Meta / Orçamento</Label>
                <Input
                  id="proj_orc"
                  type="number"
                  placeholder="5000000"
                  value={projetoForm.orcamento}
                  onChange={(e) => setProjetoForm({ ...projetoForm, orcamento: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj_rec">Arrecadado</Label>
                <Input
                  id="proj_rec"
                  type="number"
                  placeholder="1200000"
                  value={projetoForm.valor_arrecadado}
                  onChange={(e) => setProjetoForm({ ...projetoForm, valor_arrecadado: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj_desc">Descrição</Label>
              <textarea
                id="proj_desc"
                rows={2}
                placeholder="Descrição dos objetivos do projeto..."
                className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-military"
                value={projetoForm.descricao}
                onChange={(e) => setProjetoForm({ ...projetoForm, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsProjetoModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Projeto</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: NOTÍCIA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isNoticiaModalOpen} onOpenChange={setIsNoticiaModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingNoticia ? "Editar Notícia" : "Nova Notícia"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNoticia} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="not_titulo">Título da Notícia *</Label>
              <Input
                id="not_titulo"
                placeholder="Ex: Conferência de Jovens 2026"
                value={noticiaForm.titulo}
                onChange={(e) => setNoticiaForm({ ...noticiaForm, titulo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="not_data">Data</Label>
              <Input
                id="not_data"
                type="date"
                value={noticiaForm.data}
                onChange={(e) => setNoticiaForm({ ...noticiaForm, data: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="not_desc">Conteúdo / Descrição</Label>
              <textarea
                id="not_desc"
                rows={3}
                placeholder="Texto da notícia ou aviso..."
                className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-military"
                value={noticiaForm.descricao}
                onChange={(e) => setNoticiaForm({ ...noticiaForm, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsNoticiaModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">Salvar Notícia</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
