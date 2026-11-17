import { useState } from "react";
import { Sparkles, Send, BookOpen, RefreshCw, MessageSquare, Copy, Check } from "lucide-react";

const BIBLICAL_MESSAGES = [
  {
    tema: "Paz e Ansiedade",
    keywords: ["paz", "ansiedade", "ansioso", "preocupado", "medo", "triste", "aflito", "calma", "angustia"],
    versiculo: "Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas, diante de Deus, as vossas petições, pela oração e pela súplica, com ações de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus.",
    referencia: "Filipenses 4:6-7",
    reflexao: "Entregue a Deus tudo aquilo que tira o seu sono hoje. A paz d'Ele não depende das circunstâncias ao seu redor, mas da presença viva do Espírito Santo em seu coração."
  },
  {
    tema: "Força e Coragem",
    keywords: ["força", "coragem", "desanimo", "fraco", "cansado", "desistir", "luta", "vencer", "batalha"],
    versiculo: "Não to mandei eu? Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.",
    referencia: "Josué 1:9",
    reflexao: "A sua força não vem da sua própria capacidade humana, mas dAquele que prometeu nunca abandonar você. Dê mais um passo com fé e confiança."
  },
  {
    tema: "Fé e Esperança",
    keywords: ["fe", "fé", "esperança", "esperanca", "confiança", "acreditar", "milagre", "futuro", "duvida"],
    versiculo: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
    referencia: "Jeremias 29:11",
    reflexao: "Deus tem o controle dos seus dias. Mesmo quando o caminho parece incerto, os desígnios do Senhor para a sua vida permanecem firmes e cheios de graça."
  },
  {
    tema: "Amor e Família",
    keywords: ["amor", "familia", "família", "filhos", "casamento", "uniao", "lar", "perdao", "relacionamento"],
    versiculo: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor. O amor nunca falha.",
    referencia: "1 Coríntios 13:4-5, 8",
    reflexao: "Cultive o perdão e o cuidado no seu lar. Quando colocamos o amor sacrificial de Cristo como base de nossas relações, a família é protegida e abençoada."
  },
  {
    tema: "Provisão e Trabalho",
    keywords: ["provisao", "trabalho", "dinheiro", "emprego", "finanças", "sustento", "dificuldade", "necessidade"],
    versiculo: "O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas.",
    referencia: "Salmos 23:1-2",
    reflexao: "Aquele que cuida das aves do céu e veste os lírios do campo conhece detalhadamente cada uma das suas necessidades. Permaneça fiel e diligente."
  },
  {
    tema: "Cura e Restauração",
    keywords: ["cura", "saude", "saúde", "doença", "dor", "cura divina", "restauração", "ferida", "hospital"],
    versiculo: "Ele cura os de coração quebrantado e cuida das suas feridas.",
    referencia: "Salmos 147:3",
    reflexao: "O Senhor é o Médico dos médicos. Há bálsamo e renovo espiritual e físico reservado para a sua vida quando você se achega ao altar com oração sincera."
  },
  {
    tema: "Gratidão e Louvor",
    keywords: ["gratidao", "gratidão", "obrigado", "louvor", "alegria", "vitoria", "celebração", "vencer"],
    versiculo: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.",
    referencia: "1 Tessalonicenses 5:18",
    reflexao: "Um coração agradecido atrai a presença de Deus e enxerga bênçãos em cada pequeno detalhe do dia. Que o seu louvor seja contínuo!"
  }
];

const PROMPT_SUGGESTIONS = [
  "Preciso de uma palavra de paz para o meu coração",
  "Estou me sentindo desanimado e sem forças",
  "Uma mensagem bíblica sobre esperança no futuro",
  "Palavra de Deus para abençoar a minha família",
  "Versículo sobre provisão e sustento",
  "Como ter mais fé no dia a dia?"
];

export default function BiblePromptWidget() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const searchMessage = (text) => {
    const clean = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Procura por keywords
    const match = BIBLICAL_MESSAGES.find(m => 
      m.keywords.some(k => clean.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
    );

    if (match) return match;

    // Se não encontrou palavra-chave exata, escolhe aleatoriamente ou pelo tema
    const randomIndex = Math.floor(Math.random() * BIBLICAL_MESSAGES.length);
    return BIBLICAL_MESSAGES[randomIndex];
  };

  const handleGenerate = (textToUse) => {
    const input = (textToUse || prompt).trim();
    if (!input) return;

    setLoading(true);
    setTimeout(() => {
      const result = searchMessage(input);
      setCurrentMessage({
        ...result,
        userQuery: input
      });
      setLoading(false);
      setCopied(false);
    }, 450);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * BIBLICAL_MESSAGES.length);
    setCurrentMessage({
      ...BIBLICAL_MESSAGES[randomIndex],
      userQuery: "Mensagem do dia inspirada pelo Espírito Santo"
    });
    setCopied(false);
  };

  const handleCopy = () => {
    if (!currentMessage) return;
    const textToCopy = `"${currentMessage.versiculo}" — ${currentMessage.referencia}\n\nReflexão: ${currentMessage.reflexao}\n(Igreja Evangélica de Luanda)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="palavra-do-dia" className="py-16 px-6 bg-gradient-to-b from-white via-green-50/40 to-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-military/10 text-military px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Inspiração das Escrituras
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Prompt Bíblico da Palavra de Deus
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Escreva o que está sentindo ou o que precisa hoje (ex: <em>paz, família, ansiedade, força, milagre</em>) e receba uma passagem bíblica com uma reflexão edificante.
          </p>
        </div>

        {/* Caixa de Entrada do Prompt */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-4 md:p-6 shadow-xl shadow-green-950/5 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Como encontrar paz em momentos de dificuldade?..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-military focus:bg-white transition"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-military hover:bg-military-dark disabled:opacity-50 text-white font-semibold text-sm transition shadow-md cursor-pointer"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                <span>Buscar Versículo</span>
              </button>
              <button
                type="button"
                onClick={handleRandom}
                title="Mensagem Aleatória"
                className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-military transition cursor-pointer"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </form>

          {/* Sugestões de cliques rápidos */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
              <BookOpen size={13} /> Sugestões:
            </span>
            {PROMPT_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sug);
                  handleGenerate(sug);
                }}
                className="text-xs bg-gray-100 hover:bg-green-100 hover:text-military text-gray-700 px-3 py-1.5 rounded-full transition cursor-pointer font-medium"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Resposta Gerada / Card do Versículo */}
        {currentMessage && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-gradient-to-br from-green-900 via-military-dark to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-green-500/20">
            {/* Decoração de fundo */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                <Sparkles size={12} /> {currentMessage.tema}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <blockquote className="text-lg md:text-2xl font-serif font-medium leading-relaxed italic text-white/95">
                "{currentMessage.versiculo}"
              </blockquote>

              <div className="text-right font-bold text-sm md:text-base text-emerald-300">
                — {currentMessage.referencia}
              </div>

              <div className="mt-4 pt-4 border-t border-white/15 text-sm md:text-base text-gray-200 leading-relaxed bg-black/20 p-4 rounded-2xl">
                <strong className="text-white block mb-1 flex items-center gap-1.5 font-semibold">
                  <BookOpen size={16} className="text-emerald-400" /> Reflexão Pastoral:
                </strong>
                {currentMessage.reflexao}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
