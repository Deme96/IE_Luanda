import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogIn, Menu, X } from "lucide-react";

export default function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  const links = [
    { label: "Sobre", href: "#sobre" },
    { label: "Cultos", href: "#cultos" },
    { label: "Projetos", href: "#projetos" },
    { label: "Igrejas", href: "#igrejas" },
    { label: "Contato", href: "#contato" },
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
            {!isMobile && "Acesso Restrito"}
          </Link>

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
