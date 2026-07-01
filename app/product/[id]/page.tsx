"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ArrowLeft, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Төлбөрийн захиалга үүсгэх функц
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("И-мэйл хаягаа оруулна уу!");
    
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        productId: id,
        productTitle: product.title,
        userEmail: email,
        status: "pending",
        amount: product.price,
        createdAt: new Date().toISOString()
      });
      setOrderId(orderRef.id); // Firebase-ийн үүсгэсэн ID-г авна
    } catch (error) {
      alert("Захиалга үүсгэхэд алдаа гарлаа.");
    }
  };

  // Төлбөр төлөгдсөн эсэхийг шалгах функц
  const checkPaymentStatus = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const status = orderSnap.data().status;
        setOrderStatus(status);
        if (status === "approved") {
          // Хэрэв батлагдсан бол шууд сорилын хуудас руу үсэрнэ
          router.push(`/quiz/${orderId}`);
        } else {
          alert("Төлбөр хараахан батлагдаагүй байна. Та түр хүлээнэ үү эсвэл админтай холбогдоно уу.");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-sky-100 flex items-center justify-center">Уншиж байна...</div>;
  if (!product) return <div className="min-h-screen bg-sky-100 flex items-center justify-center font-bold">Бүтээгдэхүүн олдсонгүй.</div>;

  return (
    <div className="min-h-screen bg-sky-100 text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 font-medium">
          <ArrowLeft size={18} /> Буцах
        </Link>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Зүүн тал: Барааны мэдээлэл */}
          <div>
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-slate-600 mb-6 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            <div className="text-3xl font-extrabold text-slate-900">{Number(product.price).toLocaleString()} ₮</div>
          </div>

          {/* Баруун тал: Төлбөр ба Захиалгын хэсэг */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center">
            {!orderId ? (
              // Алхам 1: И-мэйл авах
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Сорил эхлүүлэх үе шат</h3>
                <p className="text-sm text-slate-600">Сорилын үр дүнг баталгаажуулах болон нэвтрэх эрх авах и-мэйл хаягаа оруулна уу.</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ТАНЫ И-МЭЙЛ ХАЯГ</label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors">
                  Төлбөр төлөх хэсэг рүү шилжих
                </button>
              </form>
            ) : (
              // Алхам 2: Дансны мэдээлэл харуулах
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-amber-700 block mb-1">ГҮЙЛГЭЭНИЙ УТГА (ЗААВАЛ БИЧИХ)</span>
                  <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-amber-300 font-mono text-lg font-bold text-slate-800 selection:bg-amber-200">
                    {orderId.substring(0, 6).toUpperCase()}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">Энэ кодыг бичээгүй тохиолдолд сорил нээгдэхгүйг анхаарна уу.</p>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Хүлээн авах банк:</span><span className="font-semibold">Хаан Банк</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Дансны дугаар:</span><span className="font-semibold font-mono">5020XXXXXX (Дансаа бичээрэй)</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Хүлээн авагч:</span><span className="font-semibold">Таны Нэр</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Шилжүүлэх дүн:</span><span className="font-bold text-indigo-600">{Number(product.price).toLocaleString()} ₮</span></div>
                </div>

                <button
                  onClick={checkPaymentStatus}
                  disabled={checking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  {checking ? "Шалгаж байна..." : "Төлбөрөө төлсөн, шалгах"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}