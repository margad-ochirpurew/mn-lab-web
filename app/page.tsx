"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";

const CATEGORIES = ["Бүгд", "Сорил", "Курс", "Материал", "Файл/Загвар"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Бүгд");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (activeCategory === "Бүгд") return true;
    return product.category === activeCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-sky-100 text-slate-900 font-sans pb-12">
      {/* Навбар / Дээд цэс - ЛОГО ТОМРУУЛСАН ХЭСЭГ */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 md:h-16 w-auto" />
            <div className="flex flex-col">
              <span className="font-black text-2xl md:text-3xl text-indigo-700 tracking-tight">M&N Research Lab</span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-bold hidden sm:block">Edutech & Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Үндсэн хэсэг */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Боловсролын Дижитал Зах Зээл</h1>
          <p className="text-slate-600">Holland Code сорил, хичээлийн материал, PPT загваруудыг нэг дороос.</p>
        </div>

        {/* Ангилал шүүх цэс */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Бүтээгдэхүүний жагсаалт */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-slate-500">Энэ ангилалд одоогоор бүтээгдэхүүн байхгүй байна.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{product.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4">{product.description}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                      <Star size={16} fill="currentColor" />
                      <span className="text-slate-600">{product.rating || "5.0"}</span>
                    </div>
                    <span className="font-bold text-slate-900">{Number(product.price || 0).toLocaleString()} ₮</span>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl block transition-colors"
                  >
                    Дэлгэрэнгүй үзэх
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}