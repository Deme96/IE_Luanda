import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, Menu, X, Globe, Bell } from "lucide-react";
import { base44 } from "@/base44";

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [noticia, setNoticia] = useState(null);
  const [showNoticia, setShowNoticia] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    async function loadNoticia() {
      const n = await base44.db.get("Noticias");
      if (n && n.length > 0) setNoticia(n[0]);
    }
    loadNoticia();
  }, []);

  const links = [
    { label: t("site_about"), href: "#sobre" },
    { label: t("site_services"), href: "#cultos" },
    { label: t("site_projects"), href: "#projetos" },
    { label: t("site_news"), href: "#noticias" },
    { label: t("site_churches"), href: "#igrejas" },
    { label: t("site_contact"), href: "#contato" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "hsl(142, 70%, 15%)" : "hsl(142, 60%, 25%)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.25)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#inicio"
          style={{ fontWeight: 800, fontSize: "1.15rem", color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
        >
          🏛️ <span>I.E.L</span>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "white")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.8)")}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              color: "hsl(142, 70%, 15%)",
              padding: "8px 18px",
              borderRadius: 8,
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.85rem",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <LogIn size={16} />
            {!isMobile && t("site_restricted_access")}
          </Link>

          {/* Notifications */}
          {noticia && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNoticia(!showNoticia)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  padding: 8,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}
              >
                <Bell size={18} />
                <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, background: "#ef4444", borderRadius: "50%" }}></span>
              </button>

              {showNoticia && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  width: 300,
                  background: "white",
                  borderRadius: 8,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  padding: 16,
                  zIndex: 100
                }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 8, fontSize: "0.95rem" }}>
                    Aviso Importante: {noticia.titulo}
                  </div>
                  <div style={{ color: "#4b5563", fontSize: "0.85rem", marginBottom: 8 }}>
                    {noticia.descricao}
                  </div>
                  <div style={{ color: "hsl(142, 60%, 25%)", fontSize: "0.75rem", fontWeight: 600 }}>
                    Data: {noticia.data}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language Selector */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px" }}>
            <Globe size={16} color="white" style={{ marginRight: 6 }} />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                outline: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                appearance: "none",
                paddingRight: 8
              }}
            >
              <option value="pt" style={{ color: "black" }}>PT</option>
              <option value="en" style={{ color: "black" }}>EN</option>
              <option value="fr" style={{ color: "black" }}>FR</option>
            </select>
          </div>

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobile && mobileOpen && (
        <div
          style={{
            background: "hsl(142, 70%, 15%)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "16px 24px 24px",
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                fontSize: "1rem",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
