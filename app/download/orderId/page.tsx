"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircle, Home, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyOrder() {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder(orderSnap.data());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    verifyOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mr-2" size={24} />
        <span>Захиалгыг шалгаж байна...</span>
      </div>
    );
  }

  if (!order || order.status !== "approved") {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Төлбөр баталгаажаагүй байна</h1>
        <p className="text-slate-600 mb-6">Энэхүү файлыг татахын тулд төлбөр бүрэн баталгаажсан байх шаардлагатай.</p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm">Нүүр хуудас руу буцах</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <CheckCircle size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">ТӨЛБӨР АМЖИЛТТАЙ!</h1>
          <p className="text-sm text-slate-500">Таны худалдаж авсан <b>{order.productTitle}</b> бүтээгдэхүүний төлбөр баталгаажлаа.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-sm space-y-2">
          <div className="flex justify-between"><span className="text-slate-400">Хүлээн авах и-мэйл:</span><span className="font-bold text-slate-700">{order.userEmail}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Төлсөн дүн:</span><span className="font-bold text-indigo-600">{Number(order.amount).toLocaleString()} ₮</span></div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-700 font-medium leading-relaxed">
          📥 Файлыг таны оруулсан <b>{order.userEmail}</b> хаяг руу админ 5-10 минутын дотор илгээх болно. Хэрэв хугацаа хэтэрвэл админтай холбогдоорой.
        </div>

        <Link href="/" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
          <Home size={16} /> Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}