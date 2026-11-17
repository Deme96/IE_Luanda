import SiteNavbar from "@/components/site/SiteNavbar";
import HeroBackgroundCarousel from "@/components/site/HeroBackgroundCarousel";
import BiblePromptWidget from "@/components/site/BiblePromptWidget";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { base44 } from "@/base44";
import { Link } from "react-router-dom";
import { getVideoSource } from "@/lib/video";
import {
  MapPin, Phone, Mail, Clock, CheckCircle, ChevronRight,
  BookOpen, Heart, Users, ArrowRight, Pickaxe, Bell, Newspaper,
  ChevronDown, ChevronUp, X, Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CULTOS_PADRAO = [
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
];

export default function Site() {
  const [projetos, setProjetos] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [cultos, setCultos] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [videos, setVideos] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  
  // Estados para controle de resumos e "Ler mais"
  const [expandedNoticias, setExpandedNoticias] = useState({});
  const [expandedProjetos, setExpandedProjetos] = useState({});
  const [expandedCultos, setExpandedCultos] = useState({});
  const [modalNoticia, setModalNoticia] = useState(null);
  const [showSobreMais, setShowSobreMais] = useState(false);

  // Estados para expansão de listas "Visualizar tudo"
  const [showAllCultos, setShowAllCultos] = useState(false);
  const [showAllNoticias, setShowAllNoticias] = useState(false);
  const [showAllProjetos, setShowAllProjetos] = useState(false);
  const [showAllIgrejas, setShowAllIgrejas] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    async function loadData() {
      const [p, i, n, c, car, videoItems, reunioes] = await Promise.all([
        base44.db.get("Projeto"),
        base44.db.get("IgrejaFilhada"),
        base44.db.get("Noticias"),
        base44.db.get("Cultos"),
        base44.db.get("Carousel"),
        base44.db.get("Videos"),
        base44.db.get("Reuniao")
      ]);

      const today = new Date();
      const upcoming = (reunioes || []).filter(item => {
        if (!item.data) return false;
        const eventDate = new Date(`${item.data}T${item.hora || "00:00"}`);
        const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).sort((a, b) => new Date(`${a.data}T${a.hora || "00:00"}`) - new Date(`${b.data}T${b.hora || "00:00"}`));

      setProjetos(p.filter(proj => proj.status === "em_andamento" || !proj.status));
      setIgrejas(i.filter(ig => ig.status === "ativa" || !ig.status));
      setNoticias(n || []);
      setCultos((c && c.length > 0) ? c : CULTOS_PADRAO);
      setCarouselSlides(car || []);
      setVideos((videoItems || []).filter(video => video.ativo !== false).sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0)));
      setUpcomingMeetings(upcoming);
    }
    loadData();
  }, []);

  const toggleNoticia = (id) => {
    setExpandedNoticias(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleProjeto = (id) => {
    setExpandedProjetos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCulto = (id) => {
    setExpandedCultos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNavbar />
      <div className="site-body">

      {/* ═══════════════ HERO / CARROSSEL ═══════════════ */}
      <section
        id="inicio"
        style={{
          background: "hsl(142, 70%, 11%)",
        }}
        className="relative text-white overflow-hidden min-h-[620px] md:min-h-[680px] flex flex-col justify-center"
      >
        {/* Carrossel em toda a parte traseira da zona com alta clareza e tom verde puro */}
        <HeroBackgroundCarousel slides={carouselSlides} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 md:py-20 text-center">
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(10, 40, 20, 0.55)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "7px 20px", fontSize: 13, marginBottom: 20, backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <span style={{ width: 8, height: 8, background: "#86efac", borderRadius: "50%", display: "inline-block" }} />
            Bem-vindo à nossa comunidade de fé
          </div>

          <h1
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 20, textShadow: "0 2px 14px rgba(0,0,0,0.85), 0 4px 28px rgba(0,0,0,0.6)" }}
          >
            {t("site_hero_title").split(" ").slice(0, -1).join(" ")}<br />
            <span style={{ color: "#86efac" }}>{t("site_hero_title").split(" ").slice(-1)[0]}</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.92)", maxWidth: 580, margin: "0 auto 28px", lineHeight: 1.6, textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}>
            {t("site_hero_subtitle")}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#cultos"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(10, 40, 20, 0.65)", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 600, textDecoration: "none", transition: "all 0.2s", fontSize: "0.95rem", backdropFilter: "blur(6px)", boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}
            >
              {t("site_hero_schedule")} <ChevronRight size={18} />
            </a>
            <a
              href="#contato"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "hsl(142, 60%, 25%)", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", fontSize: "0.95rem", border: "1px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}
            >
              {t("site_contact")}
            </a>
          </div>
        </div>

      </section>

      {upcomingMeetings.length > 0 && (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-4 mb-6">
          <div className="rounded-3xl bg-white/95 border border-green-200 p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Bell className="h-4 w-4" /> Alerta de Reunião
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", marginTop: 10 }}>Próxima reunião do Conselho</h2>
              <p style={{ color: "#4b5563", marginTop: 6, maxWidth: 540, fontSize: "0.95rem" }}>
                {upcomingMeetings[0].assunto} em {upcomingMeetings[0].data} às {upcomingMeetings[0].hora}.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:items-center">
              {upcomingMeetings.slice(0, 2).map((item) => (
                <div key={item.id} className="rounded-2xl bg-green-50 border border-green-100 p-4">
                  <p className="text-sm font-semibold text-green-800">{item.assunto}</p>
                  <p className="text-sm text-green-700">{item.data} • {item.hora}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "32px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, textAlign: "center" }}>
            {[
              { label: "Anos de Fundação", value: "30+" },
              { label: "Membros Ativos", value: "500+" },
              { label: "Células Ativas", value: "40+" },
              { label: "Missões Apoiadas", value: "12" },
            ].map(s => (
              <div key={s.label} style={{ padding: "16px 8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "hsl(142, 60%, 25%)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PROMPT BÍBLICO INTERATIVO ═══════════════ */}
      <BiblePromptWidget />

      {/* ═══════════════ VÍDEOS ═══════════════ */}
      <section id="videos" style={{ padding: "72px 24px", background: "#f9fafb", scrollMarginTop: 72 }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>VÍDEOS</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Vídeos da Igreja</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Assista às celebrações, mensagens e momentos especiais da nossa comunidade.</p>
          </div>
          {videos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              Nenhum vídeo publicado no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map(video => {
                const source = getVideoSource(video.url);
                if (!source) return null;
                return (
                  <article key={video.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="aspect-video bg-black">
                      {source.type === "embed" ? (
                        <iframe
                          src={source.src}
                          title={video.titulo || "Vídeo da igreja"}
                          className="h-full w-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <video className="h-full w-full" src={source.src} controls preload="metadata">
                          Seu navegador não suporta a reprodução de vídeo.
                        </video>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900">{video.titulo || "Vídeo"}</h3>
                      {video.descricao && <p className="mt-2 text-sm leading-relaxed text-gray-600">{video.descricao}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ SOBRE ═══════════════ */}
      <section id="sobre" style={{ padding: "96px 24px", background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>NOSSA MISSÃO</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", marginBottom: 16, lineHeight: 1.2 }}>Edificando vidas,<br />transformando comunidades</h2>
            <p style={{ color: "#6b7280", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              Comprometidos com a Palavra de Deus e com o serviço ao próximo, crescemos juntos em fé e amor fraternal na capital Bissau e em todas as regiões da Guiné-Bissau.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: BookOpen, title: "Fiel à Palavra", desc: "Baseamos nossos ensinamentos e práticas exclusivamente nas Sagradas Escrituras, sem acréscimos ou tradições humanas, edificando crentes firmes na fé.", color: "#dcfce7" },
              { icon: Heart, title: "Amor ao Próximo", desc: "Praticamos o amor incondicional através de ações solidárias, visitação aos hospitais e suporte material e espiritual constante à comunidade.", color: "#dcfce7" },
              { icon: Users, title: "Comunhão Fraterna", desc: "Valorizamos profundamente a união, o suporte mútuo, a oração e o crescimento espiritual conjunto entre todos os irmãos e famílias da igreja.", color: "#dcfce7" },
            ].map(item => (
              <div
                key={item.title}
                style={{ padding: 32, borderRadius: 16, border: "1px solid #f3f4f6", background: "white", transition: "box-shadow 0.2s" }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 12, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <item.icon size={24} color="hsl(142, 60%, 25%)" />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Recurso "Ler Mais" sobre a história e visão da igreja */}
          <div className="mt-12 text-center">
            {showSobreMais ? (
              <div className="bg-green-50/60 border border-green-200/80 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto text-left space-y-4 animate-in fade-in duration-300">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-military" /> Nossa Trajetória e Visão Ministerial
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Fundada há mais de três décadas em Bissau, a Igreja Evangélica da Guiné-Bissau nasceu com o firme propósito de pregar o Evangelho integral de Jesus Cristo, restaurar lares desfeitos e ser um farol de esperança e verdade espiritual na sociedade guineense.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ao longo dos anos, expandimos congregações por vários bairros e setores, estabelecemos frentes missionárias no interior e desenvolvemos ministérios voltados para a formação de crianças, fortalecimento de jovens e suporte a famílias necessitadas.
                </p>
                <button
                  onClick={() => setShowSobreMais(false)}
                  className="text-xs font-bold text-military hover:underline inline-flex items-center gap-1"
                >
                  Recolher texto <ChevronUp size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSobreMais(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-military/30 text-military text-xs font-bold hover:bg-military/10 transition"
              >
                Ler mais sobre a história da igreja <ChevronDown size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ CULTOS (12 Programações com "Ler Mais") ═══════════════ */}
      <section id="cultos" style={{ padding: "96px 24px", background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>PROGRAMAÇÃO COMPLETA</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Horários dos Cultos e Reuniões</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Participe de nossos cultos de celebração, estudo bíblico e oração durante a semana.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {(showAllCultos ? cultos : cultos.slice(0, 6)).map((c) => {
              const desc = c.descricao || c.desc || "";
              const isExpanded = expandedCultos[c.id || c.nome];
              const isLong = desc.length > 75;
              const shortDesc = isLong ? `${desc.slice(0, 75)}...` : desc;

              return (
                <div
                  key={c.id || c.nome}
                  style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 24px", borderRadius: 14, background: "white", border: "1px solid #e5e7eb", transition: "box-shadow 0.2s" }}
                  className="hover:shadow-sm"
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "hsl(142, 60%, 25%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Clock size={22} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "#111827" }}>{c.nome}</div>
                    
                    {/* Descrição Resumida com "Ler mais" */}
                    <p style={{ fontSize: "0.83rem", color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>
                      {isExpanded ? desc : shortDesc}
                    </p>
                    
                    {isLong && (
                      <button
                        onClick={() => toggleCulto(c.id || c.nome)}
                        className="mt-1 text-[11px] font-bold text-military hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        {isExpanded ? "Ler menos ↑" : "Ler mais →"}
                      </button>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: "hsl(142, 60%, 25%)", fontSize: "0.95rem" }}>{c.hora}</div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 }}>{c.dia}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Visualizar Tudo / Visualizar Menos Cultos */}
          {cultos.length > 6 && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setShowAllCultos(prev => !prev)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-military/30 text-military hover:bg-military hover:text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {showAllCultos ? (
                  <>
                    <span>Visualizar Menos Cultos</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>Visualizar Todos os Cultos ({cultos.length})</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ NOTÍCIAS (8 Notícias com Resumo & "Ler Mais") ═══════════════ */}
      {noticias.length > 0 && (
        <section id="noticias" style={{ padding: "96px 24px", background: "white" }}>
          <div className="max-w-5xl mx-auto">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{t("site_news").toUpperCase()}</div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Fique por Dentro</h2>
              <p style={{ color: "#6b7280", marginTop: 12 }}>Avisos, conferências e novidades da congregação na Guiné-Bissau.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {(showAllNoticias ? noticias : noticias.slice(0, 3)).map(n => {
                const isExpanded = expandedNoticias[n.id];
                const fullText = n.descricao || "";
                const isLong = fullText.length > 95;
                const summarized = isLong ? `${fullText.slice(0, 95)}...` : fullText;

                return (
                  <div 
                    key={n.id} 
                    style={{ background: "#f9fafb", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", flexDirection: "column" }}
                    className="hover:border-green-300 transition-colors"
                  >
                    <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(142, 60%, 25%)", fontWeight: 600, fontSize: "0.85rem", marginBottom: 12 }}>
                          <Newspaper size={16} />
                          {n.data}
                        </div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: 10, lineHeight: 1.3 }}>
                          {n.titulo}
                        </h3>
                        
                        {/* Descrição Resumida com Opção "Ler mais" */}
                        <p style={{ color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.6 }}>
                          {isExpanded ? fullText : summarized}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-gray-200/60 flex items-center justify-between">
                        {isLong && (
                          <button
                            onClick={() => toggleNoticia(n.id)}
                            className="text-xs font-bold text-military hover:text-military-dark hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? "Ler menos ↑" : "Ler mais →"}
                          </button>
                        )}
                        <button
                          onClick={() => setModalNoticia(n)}
                          className="text-xs text-gray-500 hover:text-gray-900 font-medium ml-auto hover:underline cursor-pointer"
                        >
                          Ver completa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão Visualizar Tudo / Visualizar Menos Notícias */}
            {noticias.length > 3 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAllNoticias(prev => !prev)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-military text-white hover:bg-military-dark font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  {showAllNoticias ? (
                    <>
                      <span>Visualizar Menos Notícias</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Visualizar Todas as Notícias ({noticias.length})</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════ PROJETOS (8 Projetos com Resumo & "Ler Mais") ═══════════════ */}
      <section id="projetos" style={{ padding: "96px 24px", background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>MISSÕES E AÇÕES SOCIAIS</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Projetos em Andamento</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Conheça, ore e apoie os projetos que estão transformando comunidades.</p>
          </div>

          {projetos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#9ca3af" }}>
              <Pickaxe size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
              <p>Nenhum projeto em andamento no momento.<br />Cadastre projetos no painel administrativo.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                {(showAllProjetos ? projetos : projetos.slice(0, 4)).map(proj => {
                  const progress = proj.orcamento ? Math.min((Number(proj.valor_arrecadado) / Number(proj.orcamento)) * 100, 100) : 0;
                  const isExpanded = expandedProjetos[proj.id];
                  const fullDesc = proj.descricao || "Projeto de missão e apoio social em andamento.";
                  const isLong = fullDesc.length > 85;
                  const summarizedDesc = isLong ? `${fullDesc.slice(0, 85)}...` : fullDesc;

                  return (
                    <div key={proj.id} style={{ borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", background: "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ height: 6, background: "#e5e7eb" }}>
                        <div style={{ height: 6, background: "hsl(142, 60%, 25%)", width: `${progress}%` }} />
                      </div>
                      <div style={{ padding: 26, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{proj.nome}</h3>
                          
                          {/* Descrição Resumida com "Ler mais" */}
                          <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 8 }}>
                            {isExpanded ? fullDesc : summarizedDesc}
                          </p>

                          {isLong && (
                            <button
                              onClick={() => toggleProjeto(proj.id)}
                              className="text-xs font-bold text-military hover:underline inline-flex items-center gap-1 mb-4 cursor-pointer"
                            >
                              {isExpanded ? "Ler menos ↑" : "Ler mais detalhes →"}
                            </button>
                          )}
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: 8, marginTop: 12 }}>
                            <span>Arrecadado: <strong style={{ color: "#111827" }}>XOF {Number(proj.valor_arrecadado || 0).toLocaleString()}</strong></span>
                            <span>Meta: <strong style={{ color: "#111827" }}>XOF {Number(proj.orcamento || 0).toLocaleString()}</strong></span>
                          </div>
                          <div style={{ height: 6, background: "#f3f4f6", borderRadius: 999 }}>
                            <div style={{ height: 6, borderRadius: 999, background: "hsl(142, 60%, 25%)", width: `${progress}%`, transition: "width 0.6s ease" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
                            <span>Líder: <strong style={{ color: "#374151" }}>{proj.responsavel || "Coordenação"}</strong></span>
                            <span style={{ color: "hsl(142, 60%, 25%)", fontWeight: 700 }}>{progress.toFixed(0)}% arrecadado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Visualizar Tudo / Visualizar Menos Projetos */}
              {projetos.length > 4 && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setShowAllProjetos(prev => !prev)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-military/30 text-military hover:bg-military hover:text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {showAllProjetos ? (
                      <>
                        <span>Visualizar Menos Projetos</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <span>Visualizar Todos os Projetos ({projetos.length})</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══════════════ IGREJAS FILIADAS ═══════════════ */}
      {igrejas.length > 0 && (
        <section id="igrejas" style={{ padding: "96px 24px", background: "white" }}>
          <div className="max-w-5xl mx-auto">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>CONGREGAÇÕES</div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Igrejas Filiadas</h2>
              <p style={{ color: "#6b7280", marginTop: 12 }}>Encontre uma congregação próxima de você em Bissau e demais regiões.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {(showAllIgrejas ? igrejas : igrejas.slice(0, 2)).map(ig => (
                <div key={ig.id} style={{ padding: 24, borderRadius: 14, border: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(142, 60%, 25%)", marginBottom: 14 }}>{ig.nome}</h3>
                  {ig.endereco && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                      <MapPin size={16} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{ig.endereco}{ig.cidade ? ` - ${ig.cidade}` : ""}</span>
                    </div>
                  )}
                  {ig.telefone && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <Phone size={16} color="#9ca3af" />
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{ig.telefone}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e5e7eb", fontSize: "0.82rem", color: "#9ca3af" }}>
                    Pastor: <strong style={{ color: "#374151" }}>{ig.pastor || "A definir"}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Visualizar Tudo / Visualizar Menos Igrejas */}
            {igrejas.length > 2 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAllIgrejas(prev => !prev)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-military/30 text-military hover:bg-military hover:text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  {showAllIgrejas ? (
                    <>
                      <span>Visualizar Menos Congregações</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Visualizar Todas as Congregações ({igrejas.length})</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════ CONTATO ═══════════════ */}
      <section id="contato" style={{ padding: "96px 24px", background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>CONTATO</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Entre em Contato</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Tem dúvidas, precisa de uma visita pastoral ou de oração? Fale conosco.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48 }}>
            {/* Informações */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { icon: MapPin, title: "Endereço", text: "Avenida Amílcar Cabral, Bissau, Guiné-Bissau" },
                { icon: Phone, title: "Telefone", text: "+245 955 000 000" },
                { icon: Mail, title: "E-mail", text: "contato@iegb.org" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "hsl(142, 60%, 25%, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={24} style={{ color: "hsl(142, 60%, 25%)" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{item.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formulário */}
            <div style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid #e5e7eb" }}>
              <form onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada com sucesso! Em breve entraremos em contato."); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  required
                  style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }}
                />
                <textarea
                  placeholder="Escreva seu pedido de oração ou mensagem..."
                  required
                  rows={4}
                  style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: "0.9rem", outline: "none", resize: "vertical", fontFamily: "inherit" }}
                />
                <button
                  type="submit"
                  style={{ padding: "13px 24px", background: "hsl(142, 60%, 25%)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
                >
                  Enviar Mensagem <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="site-footer" style={{ background: "hsl(142, 70%, 12%)", color: "rgba(255,255,255,0.75)", padding: "48px 24px" }}>
        <div className="max-w-5xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: "1.25rem", marginBottom: 12 }}>🏛️ I.E.G.B.</div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
              Igreja Evangélica da Guiné-Bissau — Proclamando o Evangelho de Cristo, edificando vidas e servindo a comunidade com fé e amor.
            </p>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}>Navegação</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["#inicio", "#videos", "#sobre", "#cultos", "#projetos", "#noticias", "#contato"].map(href => (
                <a key={href} href={href} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.875rem", textTransform: "capitalize" }}>
                  {href.replace("#", "")}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}>Acesso Restrito</div>
            <Link
              to="/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#86efac", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Painel Administrativo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 40, paddingTop: 24, textAlign: "center", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Igreja Evangélica da Guiné-Bissau. Todos os direitos reservados.
        </div>
      </footer>

      {/* Modal para leitura completa de Notícia */}
      <Dialog open={!!modalNoticia} onOpenChange={() => setModalNoticia(null)}>
        <DialogContent className="sm:max-w-[550px] p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-military uppercase">
              <Newspaper size={14} /> {modalNoticia?.data}
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 mt-1">
              {modalNoticia?.titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-700 leading-relaxed space-y-3">
            <p>{modalNoticia?.descricao}</p>
          </div>
          <div className="border-t pt-3 flex justify-end">
            <button
              onClick={() => setModalNoticia(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
