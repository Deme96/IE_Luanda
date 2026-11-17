import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Image as ImageIcon } from "lucide-react";

export default function HeroBackgroundCarousel({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  // Filtra apenas slides ativos e ordena por 'ordem'
  const activeSlides = (slides && slides.length > 0)
    ? [...slides]
        .filter(s => s.ativo !== false)
        .sort((a, b) => Number(a.ordem || 0) - Number(b.ordem || 0))
    : [];

  const total = activeSlides.length;

  const nextSlide = () => {
    if (total <= 1) return;
    setCurrentIndex(prev => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (total <= 1) return;
    setCurrentIndex(prev => (prev - 1 + total) % total);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (isPlaying && total > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex, total]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-auto select-none"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slides de Imagem em Toda a Parte Traseira com Alta Clareza */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-0 scale-100" : "opacity-0 -z-10 scale-105 pointer-events-none"
          }`}
          style={{ transition: "opacity 1.2s ease-in-out, transform 6s ease-out" }}
        >
          <img
            src={slide.url}
            alt={slide.titulo || "Foto de fundo"}
            className="w-full h-full object-cover object-center brightness-105 contrast-[1.03]"
            loading={idx === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* OVERLAY VERDE PURO COM MAIOR CLAREZA DAS IMAGENS (SEM O AMARELO COM APARÊNCIA DE SOL) */}
      <div 
        className="site-hero-overlay absolute inset-0 z-1 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(10, 42, 22, 0.46) 0%, rgba(7, 32, 16, 0.56) 50%, rgba(4, 20, 10, 0.74) 100%)",
        }}
      />

      {/* Círculos sutis decorativos de contorno (apenas verdes/transparentes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-2">
        <div 
          style={{ 
            width: 500, 
            height: 500, 
            borderRadius: "50%", 
            border: "1px solid rgba(255,255,255,0.06)", 
            position: "absolute", 
            top: -100, 
            right: -100 
          }} 
        />
        <div 
          style={{ 
            width: 320, 
            height: 320, 
            borderRadius: "50%", 
            border: "1px solid rgba(255,255,255,0.05)", 
            position: "absolute", 
            bottom: 40, 
            left: -60 
          }} 
        />
      </div>

      {/* Controles de Navegação Laterais Discretos */}
      {total > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Foto anterior"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105 shadow-lg"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Próxima foto"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105 shadow-lg"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Barra Inferior Discreta: Indicador da Foto e Pontos (SEM OS QUADRINHOS) */}
      {total > 1 && (
        <div className="absolute bottom-[140px] md:bottom-[152px] inset-x-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-auto">
          {/* Legenda Discreta da Foto Atual */}
          {currentSlide && currentSlide.titulo && (
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full text-xs text-white/90 border border-white/10 font-medium">
              <ImageIcon size={13} className="text-green-300" />
              <span>{currentSlide.titulo}</span>
              <span className="text-[11px] text-white/50 font-mono ml-1">
                ({currentIndex + 1}/{total})
              </span>
            </div>
          )}

          {/* Pontos Indicadores (Sem quadrinhos) */}
          <div className="flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Ir para foto de fundo ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? "w-7 h-2 bg-green-400 shadow-md" 
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

