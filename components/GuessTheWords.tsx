"use client";
import { useState, useRef, useEffect } from "react";



// ...existing code...
// Sustituye el array por el nuevo formato con hints
const PHRASES = [
  {
    phrase: "Más sabe el diablo por viejo, que por diablo",
    words: [
      { word: "diablo", hints: ["Figura asociada al mal", "Lleva cuernos en muchas historias"] },
      { word: "viejo", hints: ["Persona con muchos años", "Contrario de joven"] },
      { word: "diablo", hints: ["Se dice que sabe más por la edad que por ser quien es"] },
    ],
  },
  {
    phrase: "Camaron que se duerme se lo lleva la corriente",
    words: [
      { word: "Camaron", hints: ["Crustáceo marino", "Se pesca en la costa"] },
      { word: "duerme", hints: ["Estado de reposo", "Lo que haces en la cama de noche"] },
      { word: "corriente", hints: ["Movimiento del agua", "Río o electricidad"] },
    ],
  },
  {
    phrase: "El que madruga Dios lo ayuda",
    words: [
      { word: "madruga", hints: ["Despertar muy temprano", "Lo hace quien se levanta al amanecer"] },
      { word: "Dios", hints: ["Figura divina", "Ser supremo en muchas religiones"] },
      { word: "ayuda", hints: ["Prestar apoyo", "Dar asistencia a alguien"] },
    ],
  },
  {
    phrase: "A caballo regalado no se le mira el colmillo",
    words: [
      { word: "caballo", hints: ["Animal que se monta", "Tiene crines y relincha"] },
      { word: "regalado", hints: ["Obsequiado sin pagar", "Se recibe sin costo"] },
      { word: "colmillo", hints: ["Diente afilado", "Parte que se mira en algunos animales para saber la edad"] },
    ],
  },
  {
    phrase: "En boca cerrada no entran moscas",
    words: [
      { word: "boca", hints: ["Parte del cuerpo que usamos para hablar", "Se abre para comer"] },
      { word: "cerrada", hints: ["Lo opuesto a abierta", "Sin posibilidad de entrada o salida"] },
      { word: "moscas", hints: ["Insectos voladores", "Zumban y molestan"] },
    ],
  },
  {
    phrase: "Cría cuervos y te sacarán los ojos",
    words: [
      { word: "Cría", hints: ["Acción de cuidar desde pequeño", "Lo que hace una madre con su hijo"] },
      { word: "cuervos", hints: ["Aves negras", "Se asocian a la mala suerte"] },
      { word: "ojos", hints: ["Órganos de la vista", "Nos permiten ver"] },
    ],
  },
  {
    phrase: "Más vale pájaro en mano que cien volando",
    words: [
      { word: "pájaro", hints: ["Animal con alas", "Canta y vuela"] },
      { word: "mano", hints: ["Parte del cuerpo", "Con ella agarramos cosas"] },
      { word: "volando", hints: ["Acción de estar en el aire", "Lo hacen los aviones y aves"] },
    ],
  },
  {
    phrase: "No por mucho madrugar amanece más temprano",
    words: [
      { word: "madrugar", hints: ["Levantarse antes del amanecer", "Despertar muy temprano"] },
      { word: "amanece", hints: ["Cuando sale el sol", "Inicio del día"] },
      { word: "temprano", hints: ["Antes de lo esperado", "Lo contrario de tarde"] },
    ],
  }
];




function getMaskedPhrase(phrase: string, hiddenWords: string[], answers: string[]) {
  let masked = phrase;
  let lastIndex = 0;
  let positions: number[] = [];
  hiddenWords.forEach((word, i) => {
    // Buscar la siguiente coincidencia desde lastIndex
    const regex = new RegExp(`\\b${word}\\b`, "i");
    const match = regex.exec(masked.slice(lastIndex));
    if (match) {
      const start = lastIndex + match.index;
      const end = start + word.length;
      const replacement = answers[i]
        ? answers[i]
        : `___(${i + 1})___`;
      masked = masked.slice(0, start) + replacement + masked.slice(end);
      lastIndex = start + replacement.length;
      positions.push(start);
    }
  });
  return masked;
}


export default function GuessTheWords() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<string[][]>(PHRASES[0].words.map(wordObj => Array(wordObj.word.length).fill("")));
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const maskedPhrase = () => {
    const { phrase, words } = PHRASES[step];
    let masked = phrase;
    let lastIndex = 0;
    words.forEach((wordObj, i) => {
      const regex = new RegExp(`\\b${wordObj.word}\\b`, "i");
      const match = regex.exec(masked.slice(lastIndex));
      if (match) {
        const start = lastIndex + match.index;
        const end = start + wordObj.word.length;
        let replacement = "";
        if (inputs[i].every(l => l)) {
          replacement = inputs[i].join("");
        } else {
          // Mostrar tantos guiones bajos como letras tenga la palabra
          replacement = wordObj.word.split("").map(() => "_").join(" ");
        }
        masked = masked.slice(0, start) + replacement + masked.slice(end);
        lastIndex = start + replacement.length;
      }
    });
    return masked;
  };

  const handleLetterChange = (letterIdx: number, value: string) => {
    if (value.length > 1) return;
    const newInputs = inputs.map(arr => [...arr]);
    newInputs[current][letterIdx] = value;
    setInputs(newInputs);
    if (value && letterIdx < PHRASES[step].words[current].word.length - 1) {
      inputRefs.current[letterIdx + 1]?.focus();
    }
  };

  // Cambiar de pista
  const handlePrevHint = () => {
    setHintIndex(idx => Math.max(0, idx - 1));
  };
  const handleNextHint = () => {
    const hints = PHRASES[step].words[current].hints;
    setHintIndex(idx => Math.min(hints.length - 1, idx + 1));
  };

  const handleLetterKeyDown = (letterIdx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!inputs[current][letterIdx] && letterIdx > 0) {
        inputRefs.current[letterIdx - 1]?.focus();
      }
    }
    if (e.key === "Enter") {
      if (inputs[current].every(l => l)) {
        handleVerify();
      } else if (showNextPrompt) {
        handleNextPhrase();
      }
    }
  };

  const handleVerify = () => {
    const normalized = (arr: string[]) => arr.join("").toLowerCase();
    const currentWordObj = PHRASES[step].words[current];
    const inputWord = (inputs[current] || []).join("");
    if (inputWord.toLowerCase() === currentWordObj.word.toLowerCase()) {
      if (current + 1 < PHRASES[step].words.length) {
        setCurrent(current + 1);
        setHintIndex(0); // Reiniciar hint al cambiar de palabra
        setResult(null);
      } else {
        setResult("correcto-mi-pana");
        setShowAnimation(true);
        setTimeout(() => {
          setShowAnimation(false);
          setShowNextPrompt(true);
        }, 1500);
      }
    } else {
      const newInputs = inputs.map(arr => [...arr]);
      newInputs[current] = Array(currentWordObj.word.length).fill("");
      setInputs(newInputs);
      setResult("Respuesta incorrecta ❌");
    }
  };

  const handleNextPhrase = () => {
    if (step + 1 < PHRASES.length) {
      setStep(prev => prev + 1);
      setInputs(PHRASES[step + 1].words.map(wordObj => Array(wordObj.word.length).fill("")));
      setCurrent(0);
      setHintIndex(0); // Reiniciar hint al cambiar de frase
      setResult(null);
      setShowNextPrompt(false);
    }
  };

  useEffect(() => {
    if (showNextPrompt) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          handleNextPhrase();
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [showNextPrompt]);

  useEffect(() => {
    // Enfocar el primer input al cambiar de frase
    if (!showNextPrompt) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, showNextPrompt]);

  return (
    <div className="bg-[#0d1117] rounded-xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center min-h-[600px]">
      <div className="flex flex-col items-center mb-4">
        <span className="text-sm font-semibold text-[#58a6ff] mb-2 bg-[#1f2937] px-3 py-1 rounded-full">Nivel {step + 1} / {PHRASES.length}</span>
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Adivina las palabras faltantes
        </h1>
      </div>
      <p className="text-xl mb-10 text-center text-gray-200 font-mono tracking-wide leading-relaxed">
        {maskedPhrase()}
      </p>
      {!showNextPrompt && (
        <div className="flex flex-col gap-6 w-full mb-6">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold text-[#58a6ff] mr-2">{`Palabra (${current + 1}):`}</span>
            {Array(PHRASES[step].words[current].word.length)
              .fill(0)
              .map((_, j) => (
                <input
                  key={j}
                  ref={el => { inputRefs.current[j] = el; }}
                  type="text"
                  maxLength={1}
                  value={inputs[current][j]}
                  onChange={e => handleLetterChange(j, e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/, ""))}
                  onKeyDown={e => handleLetterKeyDown(j, e)}
                  className="border border-[#30363d] bg-[#0d1117] rounded px-2 py-2 w-10 h-10 text-center font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#58a6ff] text-white font-bold transition-all hover:border-[#58a6ff]"
                  autoComplete="off"
                />
              ))}
          </div>
          {/* Carrusel de pistas de la palabra actual */}
          <div className="mt-4 text-center flex items-center justify-center gap-3">
            <button
              onClick={handlePrevHint}
              className="px-3 py-2 rounded-lg bg-[#21262d] text-[#58a6ff] font-bold disabled:opacity-50 hover:bg-[#30363d] transition-colors border border-[#30363d] hover:border-[#58a6ff]"
              disabled={hintIndex === 0}
              aria-label="Pista anterior"
            >
              ◀
            </button>
            <span className="text-md text-white bg-[#21262d] rounded-lg px-4 py-2 inline-block font-medium min-w-[200px] border border-[#30363d]">
              {PHRASES[step].words[current].hints[hintIndex]}
            </span>
            <button
              onClick={handleNextHint}
              className="px-3 py-2 rounded-lg bg-[#21262d] text-[#58a6ff] font-bold disabled:opacity-50 hover:bg-[#30363d] transition-colors border border-[#30363d] hover:border-[#58a6ff]"
              disabled={hintIndex === PHRASES[step].words[current].hints.length - 1}
              aria-label="Siguiente pista"
            >
              ▶
            </button>
          </div>
          <button
            onClick={handleVerify}
            className="bg-[#238636] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2ea043] transition-colors mt-4 w-40 mx-auto"
          >
            Verificar
          </button>
        </div>
      )}
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center animate-bounce">
            <span className="text-4xl font-extrabold text-green-700 mb-2">¡Correcto mi pana!</span>
            <span className="text-6xl">🎉</span>
          </div>
        </div>
      )}
      {showNextPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center">
            <span className="text-4xl font-extrabold text-blue-900 mb-2">Presiona <b>Enter</b> para la siguiente frase</span>
          </div>
        </div>
      )}
      {result && result !== "correcto-mi-pana" && (
        <div className="mt-6 text-lg font-bold text-center">
          {result}
        </div>
      )}
    </div>
  );
}
