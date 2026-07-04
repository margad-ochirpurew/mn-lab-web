"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircle, Home, Loader2, AlertCircle, DownloadCloud } from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderAndProduct() {
      try {
        // 1. Захиалгын мэдээллийг шалгах
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setOrder(orderData);

          // 2. Тухайн барааны файлын линкийг давхар татаж авчрах
          const productRef = doc(db, "products", orderData.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            setProduct(productSnap.data());
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderAndProduct();
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
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 max-w-xl w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <CheckCircle size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">ТӨЛБӨР АМЖИЛТТАЙ!</h1>
          <p className="text-slate-500">Таны худалдаж авсан <b>{order.productTitle}</b> бүтээгдэхүүний төлбөр баталгаажлаа.</p>
        </div>

        {/* Ухаалаг Файл татах хэсэг */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mt-4">
          <h3 className="font-bold text-indigo-900 mb-2">Таны файл бэлэн боллоо</h3>
          <p className="text-sm text-indigo-700 mb-6">Доорх товчийг дарж файлаа компьютер эсвэл гар утсандаа татаж авна уу.</p>
          
          {product?.fileUrl ? (
            <a 
              href={product.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md"
            >
              <DownloadCloud size={24} /> ФАЙЛ ТАТАЖ АВАХ
            </a>
          ) : (
            <div className="text-rose-600 text-sm font-medium bg-rose-50 p-3 rounded-lg">
              Уучлаарай, файлын линк одоогоор холбогдоогүй байна. Админтай холбогдоно уу.
            </div>
          )}
        </div>

        <Link href="/" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-4">
          <Home size={16} /> Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}