import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, Image as ImageIcon } from "lucide-react";

export default function PhotoCarousel({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRef = useRef(null);

  // Filtra apenas os slides ativos e ordena por ordem
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
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex, total]);

  if (total === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center text-white">
        <ImageIcon className="mx-auto h-12 w-12 opacity-60 mb-3" />
        <p className="text-lg font-medium">Galeria de Fotos</p>
        <p className="text-sm text-gray-200 opacity-80">Nenhuma foto ativa no momento. Adicione fotos em Configurações &gt; Carrossel.</p>
      </div>
    );
  }

  const current = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div id="galeria" className="w-full max-w-5xl mx-auto mt-10 md:mt-14 px-4 select-none">
      
      {/* Container Principal do Carrossel */}
      <div 
        className="relative group rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/40 backdrop-blur-sm"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Aspect Ratio Box (16:9 / 21:9 em telas grandes) */}
        <div className="relative w-full h-[280px] sm:h-[400px] md:h-[480px] lg:h-[520px] overflow-hidden">
          {activeSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
              }`}
              style={{ transition: "opacity 0.7s ease, transform 0.7s ease" }}
            >
              <img
                src={slide.url}
                alt={slide.titulo || "Foto da galeria"}
                className="w-full h-full object-cover object-center cursor-pointer"
                onClick={() => setLightboxOpen(true)}
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {/* Overlay Escuro com Gradiente para Legenda */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {/* Informações / Legenda do Slide */}
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 text-white z-20 flex flex-col justify-end">
                <div className="inline-flex items-center gap-2 bg-military/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider w-fit mb-2 text-green-100 border border-green-400/30">
                  <ImageIcon size={13} /> Galeria I.E.L.
                </div>
                <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {slide.titulo || "Comunhão e Fé"}
                </h3>
                {slide.descricao && (
                  <p className="text-sm md:text-base text-gray-200 mt-1 max-w-2xl line-clamp-2 drop-shadow">
                    {slide.descricao}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botão Anterior */}
        {total > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            aria-label="Foto anterior"
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Botão Próximo */}
        {total > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            aria-label="Próxima foto"
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Top Controls: Contador e Ações */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Badge Contador */}
          <span className="px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full border border-white/20 backdrop-blur-md font-mono">
            {currentIndex + 1} / {total}
          </span>

          {/* Botão Play/Pause */}
          {total > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar carrossel" : "Reproduzir carrossel"}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition"
              title={isPlaying ? "Pausar reprodução" : "Iniciar reprodução"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}

          {/* Botão Maximizar / Lightbox */}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="Ver em tela cheia"
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition"
            title="Ver foto ampliada"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Indicadores / Pontos em Baixo */}
        {total > 1 && (
          <div className="absolute bottom-3 md:bottom-4 inset-x-0 z-30 flex justify-center items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Ir para foto ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? "w-8 h-2 bg-green-400 shadow-md" 
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas de Navegação Rápida (Thumbnails) */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 md:gap-3 mt-4 overflow-x-auto py-2 px-2">
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              onClick={() => goToSlide(idx)}
              className={`relative shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                idx === currentIndex 
                  ? "border-green-400 scale-105 shadow-md shadow-green-500/20" 
                  : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/50"
              }`}
            >
              <img src={slide.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal (Foto Ampliada) */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={24} />
          </button>

          <div className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={current.url}
              alt={current.titulo || "Foto"}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl mx-auto"
            />
            <div className="text-center text-white mt-4">
              <h4 className="text-xl font-bold">{current.titulo}</h4>
              {current.descricao && <p className="text-sm text-gray-300 mt-1">{current.descricao}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

