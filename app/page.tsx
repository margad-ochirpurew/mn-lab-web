"use client";

import { useState, useEffect } from "react";
import { Star, Download, Menu, Loader2, Code2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
// Энэ хэсгийн замыг "./lib/firebase" болгож зассан
import { db } from "./lib/firebase"; 

const CATEGORIES = ["Бүгд", "Курс", "Материал", "Файл/Загвар"];

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
        console.error("Алдаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => 
    activeCategory === "Бүгд" ? true : product.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">MN Lab</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#products" className="text-white hover:text-indigo-400 transition">Бүтээгдэхүүн</a>
            <a href="#" className="hover:text-white transition">Курсууд</a>
            <a href="#" className="hover:text-white transition">Бидний тухай</a>
          </div>
          <Menu className="md:hidden text-zinc-400" />
        </div>
      </nav>

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-6 py-20 text-center md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Мэдлэгээ зах зээлд <br className="hidden md:block" /> хувиргаарай
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          MN Lab дээр та бэлдсэн курс, сургалтын материал болон код загваруудаа худалдаалах боломжтой.
        </p>
      </header>

      {/* Бүтээгдэхүүний хэсэг */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Бүтээгдэхүүнүүд</h2>
            <p className="text-sm text-zinc-400">Нийт {filteredProducts.length} бүтээгдэхүүн олдлоо</p>
          </div>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Мэдээллийг татаж байна...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <p>Одоогоор бүтээгдэхүүн нэмэгдээгүй байна.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
                <div className="relative h-48 overflow-hidden bg-zinc-800">
                  <img src={product.image || "https://images.unsplash.com/photo-1618477388954-7852f32655cb?auto=format&fit=crop&w=800&q=80"} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full border border-zinc-700">
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                    <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">{product.category || "Ангилалгүй"}</span>
                    <span className="flex items-center gap-1"><Download size={14}/> {product.downloads || 0}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{product.title || "Нэргүй бүтээгдэхүүн"}</h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{product.description || ""}</p>
                  <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="font-medium text-white">{product.rating || "5.0"}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white">₮{product.price || "0"}</span>
                      </div>
                    </div>
                    <button className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold py-2 px-5 rounded-lg transition-colors">
                      Авах
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}