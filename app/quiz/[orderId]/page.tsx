"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircle, AlertCircle, Award } from "lucide-react";
import Link from "next/link";

// Holland Code (RIASEC) Асуултуудын бэлдэц
// Та энд хүссэн хэмжээгээрээ олон асуулт нэмж болно. Төрөл (type) нь R, I, A, S, E, C байна.
const QUESTIONS = [
  { id: 1, type: "R", text: "Би техникийн болон цахилгаан багаж хэрэгсэлтэй ажиллах дуртай." },
  { id: 2, type: "I", text: "Би шинжлэх ухааны бодлого бодох, судалгаа шинжилгээ хийх дуртай." },
  { id: 3, type: "A", text: "Би зураг зурах, хөгжим тоглох, бүтээлч зүйл хийх дуртай." },
  { id: 4, type: "S", text: "Би бусдад туслах, багшлах эсвэл зөвлөгөө өгөх дуртай." },
  { id: 5, type: "E", text: "Би бусдыг удирдан зохион байгуулах, бизнес төлөвлөх дуртай." },
  { id: 6, type: "C", text: "Би бичиг баримт цэгцлэх, тоо бүртгэл хөтлөх дуртай." },
  // Жишээ болгож 6 асуулт тавив. Яг ийм бүтэцтэйгээр доор нь олон асуулт нэмж болно шүү.
];

const RIASEC_MAP: Record<string, { title: string; jobs: string; desc: string }> = {
  R: { title: "Realistic (Бодит хандлагатай)", desc: "Та практик, гар урлал, техник сэтгэлгээ шаардсан ажилд тохирно.", jobs: "Инженер, Мэдээллийн технологийн мэргэжилтэн, Архитектор, Техникч" },
  I: { title: "Investigative (Шинжлэн шинжих)", desc: "Та судалгаа хийх, асуудлын учир шалтгааныг олох, аналитик сэтгэлгээнд гайхалтай.", jobs: "Эрдэмтэн, Дата аналитик, Эмч, Програмист, Эдийн засагч" },
  A: { title: "Artistic (Уран сайхны)", desc: "Та чөлөөт сэтгэлгээтэй, урлагийн мэдрэмжтэй, шинийг бүтээх эрмэлзэлтэй хүн.", jobs: "Дизайнер, Маркетер, Зохиолч, Найруулагч, Зураач" },
  S: { title: "Social (Нийгэмсэг)", desc: "Та бусадтай харилцах, туслах, зааж сургах, хүнтэй ажиллах сонирхолтой.", jobs: "Багш, Сэтгэл судлаач, Хүний нөөцийн менежер, Эмч, Харилцааны менежер" },
  E: { title: "Enterprising (Сэвхүүн/Уриалагч)", desc: "Та манлайлах чадвартай, эрсдэл үүрч чаддаг, бусдыг итгүүлэн үнэмшүүлэхдээ гаргууд.", jobs: "Бизнес эрхлэгч, Менежер, Хуульч, Борлуулалтын захирал, Улс төрч" },
  C: { title: "Conventional (Хэвшмэл/Нягт)", desc: "Та эмх цэгц, нарийвчлал, дүрэм журам, өгөгдөл мэдээлэлтэй ажиллах дуртай.", jobs: "Нягтлан бодогч, Банкны эдийн засагч, Статистикч, Системийн администратор" },
};

export default function QuizPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [quizFinished, setQuizFinished] = useState(false);

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

  const handleAnswer = (points: number) => {
    const q = QUESTIONS[currentIdx];
    setScores((prev) => ({ ...prev, [q.type]: prev[q.type] + points }));

    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-sky-100 flex items-center justify-center">Хэрэглэх эрхийг шалгаж байна...</div>;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Нэвтрэх эрхгүй байна</h1>
        <p className="text-slate-600 mb-6">Энэ сорилыг өгөхийн тулд төлбөр төлөгдөж, админ баталгаажуулсан байх ёстой.</p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium">Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  // Хамгийн өндөр оноо авсан зан төлөвийг олох
  const topCategory = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  const result = RIASEC_MAP[topCategory];

  return (
    <div className="min-h-screen bg-sky-100 text-slate-900 p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8">
        {!quizFinished ? (
          // Сорил явагдаж буй үе
          <div>
            <div className="flex justify-between items-center mb-6 text-xs font-semibold text-slate-400">
              <span>HOLLAND CODE СОРИЛ</span>
              <span>{currentIdx + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}></div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed text-center min-h-[60px]">
              {QUESTIONS[currentIdx].text}
            </h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleAnswer(3)} className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl py-3.5 px-4 font-medium transition-colors text-left">
                👍 Надад маш их тохирно (Дуртай)
              </button>
              <button onClick={() => handleAnswer(1)} className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl py-3.5 px-4 font-medium transition-colors text-left">
                😐 Заримдаа / Мэдэхгүй
              </button>
              <button onClick={() => handleAnswer(0)} className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl py-3.5 px-4 font-medium transition-colors text-left">
                👎 Надад огт тохирохгүй (Дургүй)
              </button>
            </div>
          </div>
        ) : (
          // Үр дүн харуулах үе
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 p-3 rounded-full">
              <Award size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Сорилын Үр Дүн</h2>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 text-left">
              <div className="text-xs font-bold text-indigo-600 mb-1">ТАНИЙ ҮНДСЭН ХЭВ ШИНЖ:</div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">{result.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{result.desc}</p>
              <div className="border-t border-indigo-100 pt-3">
                <span className="text-xs font-bold text-slate-500 block mb-1">САНАЛ БОЛГОХ МЭРГЭЖЛҮҮД:</span>
                <p className="text-sm font-semibold text-slate-800">{result.jobs}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Үр дүнг зургийг нь дараад хадгалж аваарай. Баярлалаа!</p>
            <Link href="/" className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors">
              Нүүр хуудас руу буцах
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}