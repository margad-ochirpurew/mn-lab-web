"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Mail, Phone, MapPin } from "lucide-react";

export default function CVBuilderPage() {
  // Хэрэглэгчийн бөглөх мэдээллүүд (Анхны утгуудтай)
  const [name, setName] = useState("Бат-Эрдэнэ Тэмүүлэн");
  const [profession, setProfession] = useState("График Дизайнер ба Маркетер");
  const [phone, setPhone] = useState("+976 9911 XXXX");
  const [email, setEmail] = useState("temuulen.b@gmail.com");
  const [address, setAddress] = useState("Улаанбаатар хот, Сүхбаатар дүүрэг");
  const [about, setAbout] = useState("Шинийг эрэлхийлэгч, бүтээлч сэтгэлгээтэй, багаар ажиллах чадвартай...");
  const [experience, setExperience] = useState("2021 - Одоо | МУИС - Ахлах дизайнер\n• Байгууллагын өнгө төрхийг тодорхойлох\n• Сошиал медиа контент бэлтгэх\n\n2019 - 2021 | Үндэсний TV - Эвлүүлэгч\n• Мэдээний график дизайн гаргах");
  const [education, setEducation] = useState("2015 - 2019 | МУИС\nМэдээллийн технологийн сургууль, Бакалавр\n\n2005 - 2015 | Нийслэлийн 1-р дунд сургууль");
  const [skills, setSkills] = useState("Photoshop, Illustrator\nАсуудал шийдвэрлэх\nАнгли хэл (B2 түвшин)\nЦагийн менежмент");

  // PDF болгож хадгалах үйлдэл
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Энэ хэсэг хөтөчийн илүү дутуу огноо, линкийг устгана */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      <div className="min-h-screen bg-slate-100 font-sans print:bg-white">
        {/* Толгой хэсэг - Хэвлэх/PDF татах үед харагдахгүй (print:hidden) */}
        <div className="bg-white shadow-sm p-4 print:hidden flex justify-between items-center z-10 sticky top-0">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium">
            <ArrowLeft size={18} /> Буцах
          </Link>
          <button 
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download size={18} /> PDF-ээр татах
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 print:p-0 print:m-0 print:block">
          
          {/* ЗҮҮН ТАЛ: Мэдээлэл бөглөх форм (PDF дээр харагдахгүй) */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden space-y-5 h-fit">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Анкетын мэдээлэл</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ОВОГ, НЭР</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded-lg bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">МЭРГЭЖИЛ / АЛБАН ТУШААЛ</label>
              <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full border p-2 rounded-lg bg-slate-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">УТАС</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">И-МЭЙЛ</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded-lg bg-slate-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ХАЯГ</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border p-2 rounded-lg bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">МИНИЙ ТУХАЙ (Товч)</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} className="w-full border p-2 rounded-lg bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">АЖЛЫН ТУРШЛАГА</label>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={5} className="w-full border p-2 rounded-lg bg-slate-50 whitespace-pre-wrap" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">БОЛОВСРОЛ</label>
              <textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={4} className="w-full border p-2 rounded-lg bg-slate-50 whitespace-pre-wrap" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">УР ЧАДВАРУУД</label>
              <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={4} className="w-full border p-2 rounded-lg bg-slate-50 whitespace-pre-wrap" />
            </div>
          </div>

          {/* БАРУУН ТАЛ: A4 хэмжээтэй CV-ийн шууд харагдах байдал */}
          {/* PDF татах үед зөвхөн энэ хэсэг л хэвлэгдэнэ */}
          <div className="w-full lg:w-2/3 flex justify-center print:w-full print:block overflow-x-auto">
            {/* A4 Size Ratio (210x297mm) */}
            <div className="bg-white w-[210mm] min-h-[297mm] shadow-xl print:shadow-none print:w-full print:p-0 flex flex-col text-slate-800">
              
              {/* CV Header */}
              <div className="bg-slate-900 text-white p-10">
                <h1 className="text-4xl font-black tracking-wider uppercase mb-2">{name}</h1>
                <h2 className="text-lg font-medium text-indigo-400 tracking-widest uppercase">{profession}</h2>
              </div>

              <div className="flex flex-row flex-grow">
                {/* Зүүн багана (Contact & Skills) */}
                <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-200">
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">Холбоо барих</h3>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div className="flex items-center gap-3"><Phone size={16} className="text-indigo-600"/> {phone}</div>
                      <div className="flex items-center gap-3"><Mail size={16} className="text-indigo-600"/> <span className="break-all">{email}</span></div>
                      <div className="flex items-start gap-3"><MapPin size={16} className="text-indigo-600 shrink-0"/> {address}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">Ур чадвар</h3>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {skills}
                    </div>
                  </div>
                </div>

                {/* Баруун багана (About, Experience, Education) */}
                <div className="w-2/3 p-8">
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-indigo-600 border-b-2 border-indigo-100 pb-2 mb-4 uppercase tracking-wider">Миний тухай</h3>
                    <p className="text-sm text-slate-700 leading-relaxed text-justify">{about}</p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-indigo-600 border-b-2 border-indigo-100 pb-2 mb-4 uppercase tracking-wider">Ажлын туршлага</h3>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {experience}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-indigo-600 border-b-2 border-indigo-100 pb-2 mb-4 uppercase tracking-wider">Боловсрол</h3>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {education}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}