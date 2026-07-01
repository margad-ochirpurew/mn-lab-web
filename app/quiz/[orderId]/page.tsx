"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { AlertCircle, Loader2, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import Chart from "chart.js/auto";

// 1. ХОЛЛАНД КОДНЫ ҮНДСЭН ТАЙЛБАРУУД
const TYPES_INFO: Record<string, { name: string; emoji: string; desc: string; careers: string }> = {
  'R': {
    name: 'Бодит (Realistic)',
    emoji: '🛠',
    desc: 'Та гараараа бүтээх, багаж хэрэгсэл, машин техниктэй ажиллах дуртай. Практик, бодит үр дүн гардаг зүйлд дуртай бөгөөд гадаа байгальд ажиллах сонирхолтой байдаг.',
    careers: 'Инженер, механикч, архитектор, нисгэгч, газар тариалангийн мэргэжилтэн, цагдаа.'
  },
  'I': {
    name: 'Судлаач (Investigative)',
    emoji: '🔬',
    desc: 'Та асуудлын учир шалтгааныг олох, судалгаа хийх, дүн шинжилгээ хийх дуртай. Шинжлэх ухаан, математикийн салбарт илүү сонирхолтой, бие даан ажиллахыг илүүд үздэг.',
    careers: 'Программ хөгжүүлэгч, эрдэмтэн, өгөгдлийн шинжээч, эмч, судлаач, эдийн засагч.'
  },
  'A': {
    name: 'Уран бүтээлч (Artistic)',
    emoji: '🎨',
    desc: 'Та шинэлэг, бүтээлч зүйл сэтгэх дуртай. Өөрийгөө урлаг, дуу хөгжим, дизайн, зохиол зэргээр илэрхийлэх дуртай бөгөөд хайрцагнаас гадуур сэтгэдэг.',
    careers: 'График дизайнер, зохиолч, жүжигчин, хөгжимчин, интерьер дизайнер, маркетер.'
  },
  'S': {
    name: 'Нийгмийн (Social)',
    emoji: '🤝',
    desc: 'Та бусдад туслах, зааж сургах, зөвлөгөө өгөх дуртай. Хүмүүстэй харилцах, багаар ажиллах чадвар маш сайн хөгжсөн байдаг бөгөөд нийгэмд тустай үйлс хийхийг зорьдог.',
    careers: 'Багш, сэтгэл судлаач, хүний нөөцийн мэргэжилтэн, сувилагч, нийгмийн ажилтан.'
  },
  'E': {
    name: 'Манлайлагч (Enterprising)',
    emoji: '💼',
    desc: 'Та хүмүүсийг удирдан чиглүүлэх, нөлөөлөх, бизнес хийх дуртай. Эрсдэл хүлээх, өрсөлдөх дуртай бөгөөд манлайлах, зохион байгуулах өндөр чадвартай.',
    careers: 'Бизнес эрхлэгч, борлуулалтын менежер, хуульч, улс төрч, төслийн удирдагч.'
  },
  'C': {
    name: 'Уламжлалт (Conventional)',
    emoji: '📊',
    desc: 'Та нарийн зохион байгуулалт, дүрэм журам, өгөгдөлтэй ажиллах дуртай. Нягт нямбай, тооцоо судалгаатай, системтэйгээр аливаад ханддаг.',
    careers: 'Нягтлан бодогч, санхүүгийн шинжээч, ложистикийн менежер, аудитор, бичиг хэргийн ажилтан.'
  }
};

// 2. АСУУЛТУУД
const INITIAL_QUESTIONS = [
  { text: "Машин, мотор, эсвэл тоног төхөөрөмж засаж янзлах", type: "R" },
  { text: "Шинжлэх ухааны туршилт хийж, үр дүнг ажиглах", type: "I" },
  { text: "Шинэ лого гаргах, зураг зурах эсвэл дизайн хийх", type: "A" },
  { text: "Хүмүүст шинэ зүйл хэрхэн хийхийг зааж тайлбарлах", type: "S" },
  { text: "Бусад хүмүүсийг удирдан зохион байгуулах", type: "E" },
  { text: "Бичиг баримт, файлуудыг нарийн ангилж цэгцлэх", type: "C" },
  { text: "Мод эсвэл металлаар ямар нэгэн зүйл урлах, угсрах", type: "R" },
  { text: "Нарийн төвөгтэй математик эсвэл логик бодлого бодох", type: "I" },
  { text: "Хөгжмийн зэмсгээр тоглох эсвэл дуу дуулах", type: "A" },
  { text: "Сэтгэлээр унасан эсвэл тусламж хэрэгтэй хүнд зөвлөх", type: "S" },
  { text: "Шинэ бизнес эхлүүлэх санаа бодож олох", type: "E" },
  { text: "Компьютерт өгөгдөл, мэдээлэл оруулах (Дата энтри)", type: "C" },
  { text: "Оффист суухаас илүү гадаа байгальд ажиллах", type: "R" },
  { text: "Эд зүйлс, байгалийн үзэгдэл хэрхэн ажилладгийг судлах", type: "I" },
  { text: "Шүлэг, өгүүллэг, эсвэл блог бичих", type: "A" },
  { text: "Багаар ажиллах, хүмүүстэй хамтран үр дүнд хүрэх", type: "S" },
  { text: "Бараа, бүтээгдэхүүн, үйлчилгээ борлуулах", type: "E" },
  { text: "Санхүүгийн тооцоо хийх, орлого зарлагын тайлан гаргах", type: "C" },
  { text: "Амьтан тэжээх, маллах", type: "R" },
  { text: "Техникийн эсвэл шинжлэх ухааны нийтлэл унших", type: "I" },
  { text: "Урлагийн үзэсгэлэн, музей үзэх", type: "A" },
  { text: "Сайн дурын ажил хийж нийгэмд туслах", type: "S" },
  { text: "Олон хүний өмнө гарч үг хэлэх, илтгэл тавих", type: "E" },
  { text: "Нарийн дүрэм, зааварчилгааг чандлан дагаж мөрдөх", type: "C" },
  { text: "Биеийн хүчний ажил хийх (жишээ нь барилга, спорт)", type: "R" },
  { text: "Бие даан гүнзгийрүүлэн судалгаа хийх", type: "I" },
  { text: "Тайзан дээр гарах, жүжиглэх", type: "A" },
  { text: "Хүүхэд асрах, тэднийг хүмүүжүүлэх", type: "S" },
  { text: "Улс төр, нийгмийн үйл ажиллагаанд манлайлан оролцох", type: "E" },
  { text: "Бараа материалын тооллого хийх, нөөц шалгах", type: "C" }
];

export default function QuizPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<"intro" | "test" | "results">("intro");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [top3, setTop3] = useState<any[]>([]);
  const [hollandCode, setHollandCode] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists() && orderSnap.data().status === "approved") {
          setAuthorized(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    verifyPayment();
  }, [orderId]);

  useEffect(() => {
    if (view === "results" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        chartInstanceRef.current = new Chart(ctx, {
          type: "radar",
          data: {
            labels: ['R (Бодит)', 'I (Судлаач)', 'A (Уран бүтээлч)', 'S (Нийгмийн)', 'E (Манлайлагч)', 'C (Уламжлалт)'],
            datasets: [{
              label: 'Таны оноо',
              data: [scores.R, scores.I, scores.A, scores.S, scores.E, scores.C],
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              borderColor: 'rgba(79, 70, 229, 1)',
              pointBackgroundColor: 'rgba(79, 70, 229, 1)',
              pointBorderColor: '#fff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                pointLabels: {
                  font: { size: 12, weight: 'bold' },
                  color: '#475569'
                },
                ticks: { display: false }
              }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [view, scores]);

  const startTest = () => {
    const shuffled = [...INITIAL_QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
    setView("test");
  };

  const handleAnswer = (points: number) => {
    const currentQ = questions[currentIdx];
    const updatedScores = { ...scores, [currentQ.type]: scores[currentQ.type] + points };
    setScores(updatedScores);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const sorted = Object.entries(updatedScores).sort((a: any, b: any) => b[1] - a[1]);
      const top3Sliced = sorted.slice(0, 3);
      const code = top3Sliced.map(item => item[0]).join('');
      
      setTop3(top3Sliced);
      setHollandCode(code);
      setView("results");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mr-2" size={24} />
        <span>Сорилын эрхийг баталгаажуулж байна...</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Нэвтрэх эрх баталгаажаагүй байна</h1>
        <p className="text-slate-600 mb-6">Энэхүү сорилыг өгөхийн тулд эхлээд төлбөрөө төлж, баталгаажуулсан байх шаардлагатай.</p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm">Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50 px-6 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-between items-center">
          {/* ЛОГО БА НҮҮР ХУУДАС РУУ БУЦАХ ЛИНК */}
          <Link href="/" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Logo" className="h-12 md:h-16 w-auto" />
            <div className="flex flex-col">
              <span className="font-black text-2xl md:text-3xl text-indigo-700 tracking-tight">M&N Research Lab</span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-bold hidden sm:block">Edutech & Analysis</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* НҮҮР ХУУДАС ТОВЧ */}
            <Link href="/" className="px-4 py-2 text-xs md:text-sm font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-full transition-all flex items-center gap-1.5 bg-slate-50 hover:bg-white shadow-sm">
              <Home size={14} /> <span className="hidden sm:inline">Нүүр хуудас</span>
            </Link>
            
            {/* ЭХНЭЭС НЬ ЭХЛЭХ ТОВЧ */}
            <button onClick={() => setView("intro")} className="px-4 py-2 text-xs md:text-sm font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-full transition-all flex items-center gap-1.5 bg-slate-50 hover:bg-white shadow-sm">
              <RotateCcw size={14} /> <span className="hidden sm:inline">Эхнээс нь</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col justify-center">
        
        {view === "intro" && (
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-block p-4 bg-indigo-50 rounded-2xl shadow-inner text-4xl">🚀</div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">ӨӨРИЙГӨӨ <span className="text-indigo-600">ТАНЬЖ</span> МЭД</h1>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Энэхүү хэсэгт та Жон Холландын алдартай <b>RIASEC</b> онолд суурилсан тестийг өгөх болно. Хүмүүсийн сонирхол, зан чанарыг 6 үндсэн төрөлд хуваадаг бөгөөд таны онцлогт тохирсон ажлын орчин, мэргэжлүүдийг санал болгодог.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
              {Object.entries(TYPES_INFO).map(([key, info]) => (
                <div key={key} className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
                  <div className="font-bold text-indigo-600 text-sm md:text-base">{key} - {info.name.split(' ')[0]}</div>
                  <div className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">{info.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={startTest} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-12 rounded-xl text-lg shadow-md transition-transform hover:-translate-y-0.5 mt-6">
              Тест эхлэх
            </button>
          </div>
        )}

        {view === "test" && questions.length > 0 && (
          <div className="max-w-xl mx-auto w-full space-y-6">
            <p className="text-slate-400 text-center text-xs italic">Хэрэв тухайн үйлдэл танд таалагддаг бол "Тийм", үгүй бол "Үгүй" гэж сонгоно уу.</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 tracking-wider">
                <span>ЯВЦ</span>
                <span className="text-indigo-600">{currentIdx + 1} / {questions.length}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${(currentIdx / questions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Та дараах зүйлийг хийх дуртай юу?</h3>
              <div className="text-xl md:text-2xl font-extrabold text-slate-800 py-12 min-h-[160px] flex items-center justify-center leading-relaxed">
                {questions[currentIdx].text}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <button onClick={() => handleAnswer(0)} className="border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 text-slate-600 font-bold py-3.5 rounded-xl text-base transition-all active:scale-95">
                  ❌ Үгүй
                </button>
                <button onClick={() => handleAnswer(1)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-base shadow-sm transition-all active:scale-95">
                  ✅ Тийм
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "results" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900">ТАНИЫ ҮР ДҮН</h1>
              <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">Таны хариултууд дээр үндэслэн таны хувийн онцлогийг хамгийн сайн тодорхойлох Холланд кодыг гаргалаа.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <h3 className="text-sm font-bold text-center text-slate-500 uppercase tracking-wider mb-4">Төрлүүдийн үзүүлэлт</h3>
                <div className="h-[280px] md:h-[340px] relative">
                  <canvas ref={canvasRef} id="radar-chart"></canvas>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="bg-indigo-600 p-8 rounded-2xl shadow-md text-white text-center relative overflow-hidden">
                  <div className="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-1">Таны Холланд Код</div>
                  <div className="text-5xl md:text-6xl font-black tracking-widest drop-shadow">{hollandCode}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">Дэлгэрэнгүй тайлбар</h3>
                  
                  <div className="space-y-4">
                    {top3.map(([key, score], index) => {
                      const info = TYPES_INFO[key];
                      return (
                        <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex gap-4 items-start hover:bg-indigo-50/30 transition-colors">
                          <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                            {info.emoji}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                              {index + 1}. {info.name} <span className="text-indigo-600 text-xs font-bold">({score} оноо)</span>
                            </h4>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{info.desc}</p>
                            <div className="pt-1.5">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Тохирох мэргэжлүүд:</span>
                              <span className="text-xs md:text-sm text-indigo-700 font-bold">{info.careers}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ҮР ДҮНГИЙН ДООРХ НҮҮР ХУУДАС РУУ БУЦАХ ТОВЧ */}
            <div className="mt-8 text-center pt-6 border-t border-slate-200">
              <Link href="/" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm active:scale-95">
                <Home size={18} /> Нүүр хуудас руу буцах
              </Link>
            </div>

          </div>
        )}

      </main>

      <footer className="bg-white border-t mt-auto py-6 text-center text-xs text-slate-400 font-medium">
        M&N Research Lab © 2026. Бүх эрх хуулиар хамгаалагдсан.
      </footer>
    </div>
  );
}