import SiteNavbar from "@/components/site/SiteNavbar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { base44 } from "@/base44";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock, CheckCircle, ChevronRight,
  BookOpen, Heart, Users, ArrowRight, Pickaxe, Bell
} from "lucide-react";

const CULTOS = [
  { nome: "Escola Bíblica Dominical", dia: "Domingo", hora: "09:00", desc: "Estudo aprofundado das escrituras" },
  { nome: "Culto da Família", dia: "Domingo", hora: "19:00", desc: "Celebração e louvor em família" },
  { nome: "Círculo de Oração", dia: "Terça-feira", hora: "19:30", desc: "Intercessão e comunhão" },
  { nome: "Culto de Ensino", dia: "Quinta-feira", hora: "19:30", desc: "Doutrina e crescimento espiritual" },
  { nome: "Reunião de Jovens", dia: "Sexta-feira", hora: "20:00", desc: "Geração levantando bandeira" },
  { nome: "Culto de Oração e Jejum", dia: "Sábado", hora: "08:00", desc: "Buscando a face de Deus" },
];

export default function Site() {
  const [projetos, setProjetos] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [proximaNoticia, setProximaNoticia] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadData() {
      const p = await base44.db.get("Projeto");
      const i = await base44.db.get("IgrejaFilhada");
      const n = await base44.db.get("Noticias");
      setProjetos(p.filter(proj => proj.status === "em_andamento"));
      setIgrejas(i.filter(ig => ig.status === "ativa"));
      if (n && n.length > 0) setProximaNoticia(n[0]);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNavbar />

      {/* ═══════════════ ALERTAS / EVENTOS ═══════════════ */}
      {proximaNoticia && (
        <div style={{ background: "hsl(44, 78%, 52%)", padding: "12px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Bell size={18} color="#111" />
          <span style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>
            Aviso Importante:
          </span>
          <span style={{ color: "#222", fontSize: "0.95rem" }}>
            {proximaNoticia.titulo} ({proximaNoticia.data}) - {proximaNoticia.descricao}
          </span>
        </div>
      )}

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        id="inicio"
        style={{
          background: "radial-gradient(circle at center, hsla(48, 85%, 45%, 0.75) 0%, hsl(142, 70%, 15%) 60%)",
        }}
        className="relative text-white overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", position: "absolute", top: -100, right: -100 }} />
          <div style={{ width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", position: "absolute", bottom: -50, left: -50 }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-44 text-center">
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "6px 18px", fontSize: 13, marginBottom: 28 }}
          >
            <span style={{ width: 8, height: 8, background: "#86efac", borderRadius: "50%", display: "inline-block" }} />
            Bem-vindo à nossa comunidade de fé
          </div>

          <h1
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24 }}
          >
            {t("site_hero_title").split(" ").slice(0, -1).join(" ")}<br />
            <span style={{ color: "#bbf7d0" }}>{t("site_hero_title").split(" ").slice(-1)[0]}</span>
          </h1>

          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            {t("site_hero_subtitle")}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#cultos"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 600, textDecoration: "none", transition: "all 0.2s", fontSize: "0.95rem" }}
            >
              {t("site_hero_schedule")} <ChevronRight size={18} />
            </a>
            <a
              href="#contato"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "hsl(142, 60%, 25%)", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", fontSize: "0.95rem", border: "none" }}
            >
              {t("site_contact")}
            </a>
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, overflow: "hidden", lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" />
          </svg>
        </div>
      </section>

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

      {/* ═══════════════ SOBRE ═══════════════ */}
      <section id="sobre" style={{ padding: "96px 24px", background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>NOSSA MISSÃO</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", marginBottom: 16, lineHeight: 1.2 }}>Edificando vidas,<br />transformando comunidades</h2>
            <p style={{ color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Comprometidos com a Palavra de Deus e com o serviço ao próximo, crescemos juntos em fé e amor.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { icon: BookOpen, title: "Fiel à Palavra", desc: "Baseamos nossos ensinamentos e práticas exclusivamente nas Sagradas Escrituras, sem acréscimos ou tradições humanas.", color: "#dcfce7" },
              { icon: Heart, title: "Amor ao Próximo", desc: "Praticamos o amor incondicional através de ações solidárias, visitação e suporte à comunidade ao nosso redor.", color: "#dcfce7" },
              { icon: Users, title: "Comunhão Fraterna", desc: "Valorizamos profundamente a união, o suporte mútuo e o crescimento espiritual conjunto entre todos os irmãos.", color: "#dcfce7" },
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
        </div>
      </section>

      {/* ═══════════════ CULTOS ═══════════════ */}
      <section id="cultos" style={{ padding: "96px 24px", background: "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>PROGRAMAÇÃO</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Horários dos Cultos</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {CULTOS.map((c) => (
              <div
                key={c.nome}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 12, background: "white", border: "1px solid #e5e7eb" }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "hsl(142, 60%, 25%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={22} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>{c.nome}</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 2 }}>{c.desc}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: "hsl(142, 60%, 25%)", fontSize: "0.9rem" }}>{c.hora}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{c.dia}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PROJETOS ═══════════════ */}
      <section id="projetos" style={{ padding: "96px 24px", background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>MISSÕES</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Projetos Missionários</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Conheça e participe dos projetos que estão transformando vidas.</p>
          </div>

          {projetos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#9ca3af" }}>
              <Pickaxe size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
              <p>Nenhum projeto em andamento no momento.<br />Cadastre projetos no painel administrativo.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
              {projetos.map(proj => {
                const progress = proj.orcamento ? Math.min((Number(proj.valor_arrecadado) / Number(proj.orcamento)) * 100, 100) : 0;
                return (
                  <div key={proj.id} style={{ borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", background: "white" }}>
                    <div style={{ height: 6, background: "#e5e7eb" }}>
                      <div style={{ height: 6, background: "hsl(142, 60%, 25%)", width: `${progress}%` }} />
                    </div>
                    <div style={{ padding: 28 }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{proj.nome}</h3>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 20 }}>{proj.descricao || "Projeto de missão em andamento."}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }}>
                        <span>Arrecadado: <strong style={{ color: "#111827" }}>XOF {Number(proj.valor_arrecadado || 0).toFixed(2)}</strong></span>
                        <span>Meta: <strong style={{ color: "#111827" }}>XOF {Number(proj.orcamento || 0).toFixed(2)}</strong></span>
                      </div>
                      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 999 }}>
                        <div style={{ height: 6, borderRadius: 999, background: "hsl(142, 60%, 25%)", width: `${progress}%`, transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.75rem", color: "hsl(142, 60%, 25%)", fontWeight: 600, marginTop: 6 }}>{progress.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ IGREJAS ═══════════════ */}
      {igrejas.length > 0 && (
        <section id="igrejas" style={{ padding: "96px 24px", background: "#f9fafb" }}>
          <div className="max-w-5xl mx-auto">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>CONGREGAÇÕES</div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Igrejas Filiadas</h2>
              <p style={{ color: "#6b7280", marginTop: 12 }}>Encontre uma congregação próxima de você.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {igrejas.map(ig => (
                <div key={ig.id} style={{ padding: 24, borderRadius: 14, border: "1px solid #e5e7eb", background: "white" }}>
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
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6", fontSize: "0.82rem", color: "#9ca3af" }}>
                    Pastor: <strong style={{ color: "#374151" }}>{ig.pastor || "A definir"}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ CONTATO ═══════════════ */}
      <section id="contato" style={{ padding: "96px 24px", background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "hsl(142, 60%, 25%, 0.15)", color: "hsl(142, 60%, 25%)", borderRadius: 999, padding: "4px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>CONTATO</div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Entre em Contato</h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Tem dúvidas ou precisa de oração? Fale conosco.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48 }}>
            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { icon: MapPin, title: "Endereço", text: "Rua da Paz, 123 – Centro" },
                { icon: Phone, title: "Telefone", text: "(00) 1234-5678" },
                { icon: Mail, title: "E-mail", text: "geraliel@igreja.gb" },
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

            {/* Form */}
            <div style={{ background: "#f9fafb", borderRadius: 16, padding: 32 }}>
              <form onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada com sucesso!"); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input
                  type="text"
                  placeholder="Seu nome"
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
                  placeholder="Sua mensagem..."
                  required
                  rows={5}
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

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ background: "hsl(142, 70%, 15%)", color: "rgba(255,255,255,0.75)", padding: "48px 24px" }}>
        <div className="max-w-5xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: "1.25rem", marginBottom: 12 }}>🏛️ I.E.L.</div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
              Proclamando o Evangelho, edificando vidas e servindo ao próximo com excelência e amor.
            </p>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}>Navegação</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["#sobre", "#cultos", "#projetos", "#contato"].map(href => (
                <a key={href} href={href} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.875rem", textTransform: "capitalize" }}>
                  {href.replace("#", "").charAt(0).toUpperCase() + href.replace("#", "").slice(1)}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}>Acesso</div>
            <Link
              to="/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.875rem" }}
            >
              Painel Administrativo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 40, paddingTop: 24, textAlign: "center", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Gestão Eclesiástica Pro. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
