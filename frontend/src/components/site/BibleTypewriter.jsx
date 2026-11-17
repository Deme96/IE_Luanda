import { useState, useEffect } from "react";
import { BookOpen, Sparkles } from "lucide-react";

const BIBLE_VERSES = [
  {
    versiculo: "O Senhor é o meu pastor; de nada terei falta.",
    referencia: "Salmos 23:1"
  },
  {
    versiculo: "Tudo posso naquele que me fortalece.",
    referencia: "Filipenses 4:13"
  },
  {
    versiculo: "Lâmpada para os meus pés é a tua palavra e luz, para o meu caminho.",
    referencia: "Salmos 119:105"
  },
  {
    versiculo: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.",
    referencia: "João 3:16"
  },
  {
    versiculo: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    referencia: "Isaías 41:10"
  },
  {
    versiculo: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
    referencia: "Salmos 37:5"
  },
  {
    versiculo: "A paz vos deixo, a minha paz vos dou; não vo-la dou como o mundo a dá.",
    referencia: "João 14:27"
  },
  {
    versiculo: "Buscai primeiro o Reino de Deus e a sua justiça, e tudo vos será acrescentado.",
    referencia: "Mateus 6:33"
  },
  {
    versiculo: "Sê forte e corajoso; não temas, nem te espantes, pois o Senhor é contigo.",
    referencia: "Josué 1:9"
  }
];

export default function BibleTypewriter() {
  const [verseIndex, setVerseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(65);

  const currentVerse = BIBLE_VERSES[verseIndex];
  const fullText = `"${currentVerse.versiculo}" — ${currentVerse.referencia}`;

  useEffect(() => {
    let timer;

    if (!isDeleting && displayedText !== fullText) {
      // Digitando letra por letra
      timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
        setTypingSpeed(45 + Math.random() * 25);
      }, typingSpeed);
    } else if (!isDeleting && displayedText === fullText) {
      // Pausa quando o texto termina de ser escrito para dar tempo de ler
      timer = setTimeout(() => {
        setIsDeleting(true);
        setTypingSpeed(25); // Velocidade de apagar é mais rápida
      }, 3500);
    } else if (isDeleting && displayedText !== "") {
      // Apagando letra por letra
      timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
      }, typingSpeed);
    } else if (isDeleting && displayedText === "") {
      // Quando apaga tudo, passa para o próximo versículo
      setIsDeleting(false);
      setVerseIndex((prev) => (prev + 1) % BIBLE_VERSES.length);
      setTypingSpeed(80);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, fullText, typingSpeed]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-black/45 border border-white/20 backdrop-blur-md px-5 py-4 shadow-2xl flex items-center gap-3.5 text-left">
        {/* Ícone Solene */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-300">
          <BookOpen size={20} />
        </div>

        {/* Área do Texto com Efeito Máquina de Escrever e Cursor Piscante */}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-green-300 flex items-center gap-1.5 mb-0.5">
            <Sparkles size={12} /> Palavra de Deus para você
          </div>
          <div className="text-sm md:text-base font-serif italic text-white/95 leading-snug min-h-[1.5rem] flex items-center flex-wrap">
            <span>{displayedText}</span>
            {/* Cursor piscante simulando digitação de terminal / prompt */}
            <span className="inline-block w-[3px] h-4 md:h-5 ml-1 bg-green-400 animate-pulse font-sans font-normal align-middle" />
          </div>
        </div>
      </div>
    </div>
  );
}
