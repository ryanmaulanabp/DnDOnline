"use client";

import { useState, useMemo } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { BACKGROUNDS, ALIGNMENTS } from "@/lib/dnd-data";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Fingerprint, 
  Image as ImageIcon, 
  ChevronDown, 
  Dices, 
  BookOpen, 
  UserCircle2, 
  Dumbbell, 
  ScrollText,
  FastForward
} from "lucide-react";

const playClickSound = () => {
  try {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  } catch (e) {}
};

const LIFESTYLES = ["Wretched", "Squalid", "Poor", "Modest", "Comfortable", "Wealthy", "Aristocratic"];
const FAITHS = [
  "Atheist / Tidak Ada", "Lathander (Dewa Fajar)", "Selûne (Dewi Bulan)", "Tyr (Dewa Keadilan)", 
  "Kelemvor (Dewa Kematian)", "Mystra (Dewi Sihir)", "Tempus (Dewa Perang)", "Sune (Dewi Kecantikan)", 
  "Helm (Dewa Penjaga)", "Oghma (Dewa Pengetahuan)", "Bahamut (Dewa Naga Baik)", "Tiamat (Dewi Naga Jahat)"
];

const RACE_PHYSICAL_DATA: Record<string, { height: string[], weight: string[] }> = {
  "Human": { height: ["147cm (Sangat Pendek)", "160cm (Pendek)", "175cm (Sedang)", "185cm (Tinggi)", "198cm (Sangat Tinggi)"], weight: ["55kg (Kurus)", "70kg (Sedang)", "85kg (Berisi)", "100kg (Kekar)", "120kg (Sangat Besar)"] },
  "Elf": { height: ["142cm (Ramping)", "155cm (Sedang)", "170cm (Tinggi)", "185cm (Sangat Tinggi)"], weight: ["45kg (Sangat Ringan)", "55kg (Sedang)", "65kg (Atletis)", "75kg (Kekar)"] },
  "Dwarf": { height: ["120cm (Sangat Pendek)", "135cm (Sedang)", "145cm (Maksimal Dwarf)"], weight: ["65kg (Padat)", "75kg (Sedang)", "85kg (Sangat Berat)", "100kg (Gempal)"] },
  "Halfling": { height: ["84cm (Pendek)", "90cm (Sedang)", "100cm (Tinggi)"], weight: ["15kg (Ringan)", "18kg (Sedang)", "22kg (Berisi)"] },
  "Dragonborn": { height: ["175cm (Pendek)", "190cm (Sedang)", "205cm (Tinggi)", "215cm (Raksasa)"], weight: ["85kg (Ringan)", "105kg (Sedang)", "125kg (Kekar)", "150kg (Masif)"] },
  "Gnome": { height: ["90cm (Pendek)", "105cm (Sedang)", "120cm (Tinggi)"], weight: ["18kg (Kurus)", "20kg (Sedang)", "23kg (Berisi)"] },
  "Half-Elf": { height: ["150cm (Pendek)", "170cm (Sedang)", "185cm (Tinggi)", "195cm (Sangat Tinggi)"], weight: ["55kg (Kurus)", "75kg (Sedang)", "90kg (Berisi)", "110kg (Kekar)"] },
  "Half-Orc": { height: ["160cm (Pendek)", "185cm (Sedang)", "205cm (Tinggi)", "220cm (Sangat Besar)"], weight: ["80kg (Ramping)", "100kg (Sedang)", "130kg (Kekar)", "170kg (Masif)"] },
  "Tiefling": { height: ["148cm (Pendek)", "170cm (Sedang)", "188cm (Tinggi)"], weight: ["50kg (Kurus)", "70kg (Sedang)", "90kg (Berisi)"] },
  "Default": { height: ["150cm", "170cm", "190cm"], weight: ["60kg", "80kg", "100kg"] }
};

const PHYSICAL_PRESETS_GENERAL = {
  hair: ["Hitam Legam", "Cokelat Gelap", "Pirang Kemilau", "Merah Api", "Perak Terang", "Putih Salju", "Botak", "Bercahaya Mistis", "Gimbal Kasar", "Cukur Rapi"],
  skin: ["Pucat (Pale)", "Kuning Langsat", "Cokelat Terang (Tan)", "Cokelat Gelap", "Tembaga (Copper)", "Perunggu (Bronze)", "Hitam Arang", "Merah Iblis", "Hijau Zamrud"],
  eyes: ["Cokelat Tajam", "Biru Langit", "Hijau Zamrud", "Hazel", "Kuning Emas", "Merah Menyala", "Perak Buta", "Ungu Mistis", "Hitam Kosong"],
  age: ["Remaja", "Dewasa Muda", "Dewasa", "Paruh Baya", "Tua", "Sangat Kuno (Venerable)"],
  gender: ["Pria", "Wanita", "Androgini", "Non-binary", "Bentuk Esensi (Fluid)", "Tidak Diketahui"]
};

const generateLore = (bg: string, type: "traits" | "ideals" | "bonds" | "flaws") => {
  const loreDB: Record<string, Record<string, string[]>> = {
    "Acolyte": {
      traits: ["Saya mengutip teks suci dalam berbagai situasi.", "Saya melihat pertanda ilahi dalam setiap peristiwa.", "Saya selalu tenang dan penuh belas kasih.", "Saya telah menghabiskan begitu banyak waktu di kuil sehingga saya sulit bersosialisasi."],
      ideals: ["Tradisi. Tradisi kuno harus dilestarikan dan dihormati.", "Amal. Saya selalu membantu mereka yang membutuhkan.", "Iman. Saya percaya dewa membimbing langkah saya.", "Kekuasaan. Saya mencari posisi tinggi dalam hierarki religius."],
      bonds: ["Saya akan mengorbankan nyawa demi memulihkan kuil kuno.", "Saya mencari relik suci yang hilang ratusan tahun lalu.", "Segala sesuatu yang saya lakukan adalah untuk orang-orang miskin.", "Saya berhutang budi pada imam yang membesarkan saya."],
      flaws: ["Saya terlalu percaya pada mereka yang mengaku beriman.", "Saya sangat kaku dan sulit mentolerir penyimpangan ajaran.", "Saya menyimpan kecurigaan mendalam terhadap dewa-dewa lain.", "Saya terobsesi dengan ramalan kiamat."]
    },
    "Criminal": {
      traits: ["Saya selalu merencanakan rute pelarian di setiap bangunan.", "Pikiran pertama saya saat melihat orang adalah: betapa mudahnya ia ditipu.", "Saya selalu bersandar di dinding paling gelap.", "Saya memiliki bahasa rahasia dengan rekan kriminal saya."],
      ideals: ["Kebebasan. Rantai dibuat untuk dipatahkan.", "Keserakahan. Uang adalah solusi dari semua masalah.", "Loyalitas. Saya tidak akan pernah mengkhianati teman.", "Penebusan. Saya ingin menghapus dosa masa lalu saya."],
      bonds: ["Saya berhutang budi pada bos mafia yang menyelamatkan saya.", "Saya mencuri untuk menghidupi keluarga saya yang miskin.", "Seseorang yang saya cintai dipenjara karena kesalahan saya.", "Saya ingin membalas dendam pada polisi korup yang menjebak saya."],
      flaws: ["Saat melihat barang berharga, saya tidak bisa menahan diri.", "Jika ada opsi berbohong, saya akan memilihnya.", "Saya sering meremehkan kecerdasan lawan saya.", "Saya sangat penakut jika berhadapan dengan otoritas resmi."]
    },
    "Folk Hero": {
      traits: ["Saya selalu siap membantu siapapun yang dalam kesulitan.", "Saya sangat bangga dengan asal-usul desa saya.", "Saya tidak mengerti etika bangsawan yang rumit.", "Saya bicara dengan bahasa rakyat jelata yang kasar."],
      ideals: ["Ketulusan. Tidak ada gunanya berpura-pura menjadi orang lain.", "Takdir. Saya percaya saya ditakdirkan untuk hal besar.", "Keadilan. Hukum harus berpihak pada orang kecil.", "Kebebasan. Tyrant harus digulingkan."],
      bonds: ["Keluarga saya adalah segalanya bagi saya.", "Saya melindungi tempat kelahiran saya dengan nyawa saya.", "Saya ingin membuktikan bahwa pahlawan bisa datang dari mana saja.", "Saya berjuang demi kehormatan guru saya."],
      flaws: ["Saya terlalu sombong dengan status 'pahlawan' saya.", "Saya memiliki rasa percaya diri yang berlebihan yang berbahaya.", "Saya sangat membenci siapapun yang memiliki gelar bangsawan.", "Saya sulit menolak tantangan duel."]
    },
    "Noble": {
      traits: ["Saya selalu menuntut pelayanan terbaik ke manapun saya pergi.", "Saya bicara dengan sangat lambat dan penuh wibawa.", "Saya tidak terbiasa melakukan pekerjaan fisik kotor.", "Keluarga saya memiliki sejarah panjang yang membanggakan."],
      ideals: ["Tanggung Jawab. Adalah tugas saya untuk melindungi rakyat.", "Kekuatan. Hanya yang memiliki darah biru yang pantas memimpin.", "Keluarga. Nama baik keluarga harus dijaga di atas segalanya.", "Kemuliaan. Saya ingin diingat dalam sejarah dunia."],
      bonds: ["Saya mencoba merebut kembali takhta yang dicuri dari saya.", "Aliansi politik keluarga saya adalah prioritas utama.", "Saya sangat mencintai rakyat jelata yang saya pimpin.", "Saya ingin menjadi lebih hebat dari ayah/ibu saya."],
      flaws: ["Saya diam-diam percaya bahwa semua orang berada di bawah saya.", "Saya sangat takut pada kemiskinan dan kotoran.", "Saya mudah tersinggung jika tidak dihormati.", "Saya menghabiskan uang secara boros."]
    },
    "Sage": {
      traits: ["Saya sering bicara pada diri sendiri saat berpikir keras.", "Saya menggunakan kata-kata sulit yang tidak dimengerti orang lain.", "Saya lebih suka membaca buku daripada bicara dengan manusia.", "Saya menyimpan banyak gulungan kertas di kantong saya."],
      ideals: ["Pengetahuan. Pengetahuan adalah jalan menuju kekuatan.", "Logika. Emosi tidak boleh membutakan pikiran kita.", "Kebenaran. Kebenaran harus diungkap meski menyakitkan.", "Kemajuan. Kita harus selalu belajar hal baru."],
      bonds: ["Saya mencari perpustakaan kuno yang tersembunyi.", "Tujuan hidup saya adalah menyelesaikan disertasi besar saya.", "Saya berhutang ilmu pada guru besar di akademi.", "Buku yang saya bawa adalah satu-satunya peninggalan orang tua saya."],
      flaws: ["Saya mudah terganggu oleh misteri yang belum terpecahkan.", "Saya sering lupa makan atau tidur saat sedang meneliti.", "Saya merasa superior karena kecerdasan saya.", "Saya sangat ceroboh dengan keselamatan fisik saya."]
    },
    "Soldier": {
      traits: ["Saya selalu menjaga senjata saya tetap bersih dan tajam.", "Saya bicara dengan nada komando yang tegas.", "Saya sering menceritakan kisah-kisah pertempuran masa lalu.", "Saya sangat disiplin dengan jadwal tidur dan makan."],
      ideals: ["Disiplin. Tanpa aturan, kita hanyalah monster.", "Kehormatan. Saya tidak akan melakukan hal yang memalukan tentara.", "Bangsa. Negara saya adalah segalanya.", "Kemenangan. Menang adalah satu-satunya pilihan."],
      bonds: ["Saya akan melakukan apapun demi rekan seperjuangan saya.", "Saya masih menyimpan lencana unit militer saya.", "Saya ingin memburu pengkhianat yang menyebabkan unit saya hancur.", "Saya berjuang untuk perdamaian abadi."],
      flaws: ["Saya menderita trauma perang yang sering muncul tiba-tiba.", "Saya sulit menerima perintah dari orang yang tidak saya hormati.", "Saya cenderung menyelesaikan masalah dengan kekerasan.", "Saya memiliki kebencian buta pada musuh lama saya."]
    },
    "Default": {
      traits: ["Sangat canggung dalam interaksi sosial.", "Tidak pernah mundur dari tantangan.", "Selalu punya cerita lucu.", "Lebih suka bertindak daripada banyak bicara.", "Sangat waspada terhadap orang asing."],
      ideals: ["Keadilan. Tidak ada yang berada di atas hukum.", "Kekuatan. Hanya yang kuat yang bertahan hidup.", "Kebaikan. Melindungi yang lemah adalah kewajiban.", "Kebebasan. Hidup harus dinikmati tanpa kekangan."],
      bonds: ["Peralatan saya adalah peninggalan keluarga.", "Mencari orang yang membunuh guru saya.", "Berjuang demi kemuliaan kampung halaman.", "Menjaga rahasia seorang teman lama."],
      flaws: ["Kelemahan terhadap minuman keras.", "Sikap arogan sering memicu masalah.", "Menyimpan rahasia kelam.", "Sangat serakah terhadap emas."]
    }
  };

  const selectedDB = loreDB[bg] || loreDB["Default"];
  const options = selectedDB[type] || loreDB["Default"][type];
  return options[Math.floor(Math.random() * options.length)];
};

export default function IdentityStep() {
  const store = useCharacterStore();
  const [openSection, setOpenSection] = useState<string>("Details");

  const physicalData = useMemo(() => {
    const baseRace = Object.keys(RACE_PHYSICAL_DATA).find(r => store.race?.includes(r)) || "Default";
    return RACE_PHYSICAL_DATA[baseRace];
  }, [store.race]);

  const toggleSection = (section: string) => {
    playClickSound();
    setOpenSection(prev => prev === section ? "" : section);
  };

  const handleGenerate = (key: "traits" | "ideals" | "bonds" | "flaws") => {
    playClickSound();
    store.updateField(key, generateLore(store.background, key));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl pb-24 relative z-10">
      <div className="relative">
        <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase relative z-10 flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-amber-700" /> Character Identity
        </h2>
        <p className="text-stone-500 mt-2 font-bold uppercase tracking-[0.2em] text-xs relative z-10">Lengkapi esensi fisik dan jiwa pahlawan Anda untuk petualangan ini.</p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-[2rem] border border-[#d4c5b0] shadow-xl relative overflow-hidden group focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          
          <div className="relative shrink-0 group/avatar">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-md flex items-center justify-center text-5xl overflow-hidden transition-all duration-500 ${store.avatarUrl ? 'border-amber-600 bg-[#fdfaf6]' : 'border-[#d4c5b0] bg-[#fdfaf6] border-dashed group-hover/avatar:border-amber-500/50'}`}>
              {store.avatarUrl ? (
                <img src={store.avatarUrl} alt="Hero Avatar" className="w-full h-full object-cover" style={{filter: 'sepia(0.3)'}} onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <ImageIcon className="w-12 h-12 text-stone-400 opacity-50" />
              )}
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div>
              <label className="block text-[10px] font-black text-amber-700 mb-2 uppercase tracking-[0.4em]">Legendary Name</label>
              <input 
                value={store.name} 
                onChange={e => store.updateField("name", e.target.value)} 
                className="w-full bg-transparent border-b-2 border-[#d4c5b0] focus:border-amber-600 py-2 font-black text-4xl md:text-5xl outline-none text-stone-900 transition-all placeholder:text-stone-300 uppercase tracking-tighter" 
                placeholder="E.G. ARKANIS SI BIRU" 
                spellCheck="false"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-stone-500 mb-2 uppercase tracking-[0.4em]">Custom Avatar URL (Opsional)</label>
              <div className="relative">
                <input 
                  value={store.avatarUrl} 
                  onChange={e => store.updateField("avatarUrl", e.target.value)} 
                  className="w-full bg-[#fdfaf6] border border-[#d4c5b0] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-10 pr-4 py-3 text-stone-800 text-xs font-bold outline-none transition-all placeholder:text-stone-400 shadow-sm" 
                  placeholder="Tempel link gambar dari internet (https://...)" 
                />
                <ImageIcon className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-5">
        
        {/* --- 1. CHARACTER DETAILS --- */}
        <motion.div layout className={`bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Details" ? "border-amber-600 ring-1 ring-amber-300 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Details")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Details" ? "bg-amber-100/50 border-l-amber-800" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Details" ? "bg-amber-200 text-amber-900" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <UserCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Character Details</h3>
                <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold tracking-[0.2em]">Alignment • Faith • Lifestyle • Background</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-500 ${openSection === "Details" ? "rotate-180 text-amber-800" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Details" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 bg-[#fdfaf6] border-t border-[#d4c5b0] grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="md:col-span-2 relative z-10">
                  <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">Background (Masa Lalu)</label>
                  <div className="relative">
                    <select value={store.background} onChange={e => store.updateField("background", e.target.value)} className="w-full bg-white border border-[#d4c5b0] rounded-xl pl-10 pr-10 py-4 text-stone-900 font-black outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-600 transition-all appearance-none cursor-pointer uppercase text-xs tracking-widest shadow-sm relative z-10">
                      <option value="">-- PILIH BACKGROUND --</option>
                      {Object.keys(BACKGROUNDS).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <BookOpen className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  </div>
                  {store.background && BACKGROUNDS[store.background] && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-amber-100 border border-amber-300 rounded-xl">
                      <p className="text-xs text-amber-900 leading-relaxed font-bold italic border-l-4 border-amber-700 pl-4">{BACKGROUNDS[store.background].desc}</p>
                    </motion.div>
                  )}
                </div>
                <div className="relative z-10">
                  <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">Alignment (Moralitas)</label>
                  <div className="relative">
                    <select value={store.alignment} onChange={e => store.updateField("alignment", e.target.value)} className="w-full bg-white border border-[#d4c5b0] rounded-xl px-5 py-4 text-stone-900 font-black outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-600 transition-all appearance-none uppercase text-xs tracking-widest shadow-sm">
                      {Object.keys(ALIGNMENTS).map(al => <option key={al} value={al}>{al}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none" />
                  </div>
                </div>
                <div className="relative z-10">
                  <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">Faith (Kepercayaan)</label>
                  <input list="faith-list" value={store.faith} onChange={e => store.updateField("faith", e.target.value)} className="w-full bg-white border border-[#d4c5b0] rounded-xl px-5 py-4 text-stone-900 font-black outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-600 transition-all uppercase text-xs tracking-widest placeholder:text-stone-400 shadow-sm" placeholder="KETIK DEWA..." />
                  <datalist id="faith-list">{FAITHS.map(f => <option key={f} value={f} />)}</datalist>
                </div>
                <div className="md:col-span-2 relative z-10">
                  <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">Lifestyle (Gaya Hidup)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                     {LIFESTYLES.map(life => (
                       <button key={life} onClick={() => { playClickSound(); store.updateField("lifestyle", life); }} className={`px-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${store.lifestyle === life ? 'bg-amber-200 border-amber-700 text-amber-900 shadow-sm' : 'bg-white border-[#d4c5b0] text-stone-500 hover:border-amber-600 hover:text-stone-700'}`}>
                         {life}
                       </button>
                     ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- 2. PHYSICAL CHARACTERISTICS --- */}
        <motion.div layout className={`bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Physical" ? "border-green-300 ring-1 ring-green-200 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Physical")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Physical" ? "bg-green-50/50 border-l-green-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Physical" ? "bg-green-100 text-green-700" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Physical Characteristics</h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Disesuaikan dengan Ras: <span className="text-green-700">{store.race || "Human"}</span></p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-500 ${openSection === "Physical" ? "rotate-180 text-green-600" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Physical" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 bg-[#fdfaf6] border-t border-[#d4c5b0] grid grid-cols-2 md:grid-cols-3 gap-8 relative">
                <div className="relative z-10">
                  <label className="block text-[10px] font-black text-green-700 mb-3 uppercase tracking-[0.2em]">Height (Tinggi)</label>
                  <input list="height-list" value={store.height} onChange={e => store.updateField("height", e.target.value)} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-green-400 rounded-xl px-5 py-4 text-stone-900 text-xs font-black outline-none focus:border-green-400 transition-all uppercase tracking-widest placeholder:text-stone-400 shadow-sm" placeholder="PILIH..." />
                  <datalist id="height-list">{physicalData.height.map(h => <option key={h} value={h} />)}</datalist>
                </div>
                <div className="relative z-10">
                  <label className="block text-[10px] font-black text-green-700 mb-3 uppercase tracking-[0.2em]">Weight (Berat)</label>
                  <input list="weight-list" value={store.weight} onChange={e => store.updateField("weight", e.target.value)} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-green-400 rounded-xl px-5 py-4 text-stone-900 text-xs font-black outline-none focus:border-green-400 transition-all uppercase tracking-widest placeholder:text-stone-400 shadow-sm" placeholder="PILIH..." />
                  <datalist id="weight-list">{physicalData.weight.map(w => <option key={w} value={w} />)}</datalist>
                </div>
                {(Object.keys(PHYSICAL_PRESETS_GENERAL) as Array<keyof typeof PHYSICAL_PRESETS_GENERAL>).map((key) => (
                  <div key={key} className="relative z-10">
                    <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">{key}</label>
                    <input list={`${key}-list`} value={(store as any)[key]} onChange={e => store.updateField(key as any, e.target.value)} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-green-300 rounded-xl px-5 py-4 text-stone-900 text-xs font-black outline-none focus:border-green-300 transition-all uppercase tracking-widest placeholder:text-stone-400 shadow-sm" placeholder="..." />
                    <datalist id={`${key}-list`}>{PHYSICAL_PRESETS_GENERAL[key].map(opt => <option key={opt} value={opt} />)}</datalist>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- 3. PERSONAL CHARACTERISTICS (DICE RANDOMIZER) --- */}
        <motion.div layout className={`bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Personal" ? "border-amber-600 ring-1 ring-amber-300 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Personal")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Personal" ? "bg-amber-100/50 border-l-amber-1000" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Personal" ? "bg-amber-200 text-amber-800" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <Dices className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Personal Characteristics</h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Traits • Ideals • Bonds • Flaws</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-500 ${openSection === "Personal" ? "rotate-180 text-amber-800" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Personal" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 bg-[#fdfaf6] border-t border-[#d4c5b0] grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {[ {label: "Personality Traits", key: "traits"}, {label: "Ideals", key: "ideals"}, 
                   {label: "Bonds", key: "bonds"}, {label: "Flaws", key: "flaws"} ].map(f => (
                  <div key={f.key} className="flex flex-col group relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">{f.label}</label>
                      <button 
                        onClick={() => handleGenerate(f.key as any)}
                        className="text-[9px] font-black bg-amber-200 text-amber-800 hover:bg-amber-700 hover:text-stone-900 px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-amber-300 shadow-sm active:scale-90"
                      >
                        <Dices className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> 
                        {store.background ? `ROLL ${store.background.substring(0,6).toUpperCase()}` : 'ROLL'}
                      </button>
                    </div>
                    <textarea 
                      value={(store as any)[f.key]} 
                      onChange={e => store.updateField(f.key as any, e.target.value)} 
                      rows={4} 
                      className="w-full flex-1 bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-700 rounded-xl p-5 text-stone-900 text-xs font-bold outline-none focus:border-amber-700 resize-none placeholder:text-stone-400 leading-relaxed shadow-sm" 
                      placeholder="Gunakan dadu cerdas di atas atau tulis imajinasi Anda..." 
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- 4. NOTES & LORE --- */}
        <motion.div layout className={`bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openSection === "Notes" ? "border-amber-300 ring-1 ring-amber-200 shadow-lg" : "border-[#d4c5b0] hover:border-[#a6937a]"}`}>
          <button onClick={() => toggleSection("Notes")} className={`w-full flex justify-between items-center p-6 transition-colors border-l-4 ${openSection === "Notes" ? "bg-amber-50/50 border-l-amber-500" : "hover:bg-[#fcfbf9] border-l-transparent"}`}>
            <div className="text-left flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${openSection === "Notes" ? "bg-amber-100 text-amber-700" : "bg-[#fdfaf6] border border-[#d4c5b0] text-stone-500"}`}>
                <ScrollText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Notes & Lore</h3>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em] mt-1">Backstory • Organizations • Allies • Enemies</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-stone-400 transform transition-transform duration-500 ${openSection === "Notes" ? "rotate-180 text-amber-600" : ""}`} />
          </button>
          
          <AnimatePresence>
            {openSection === "Notes" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 bg-[#fdfaf6] border-t border-[#d4c5b0] space-y-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                   {[ {label: "Organizations", key: "organizations"}, {label: "Allies", key: "allies"}, {label: "Enemies", key: "enemies"} ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-black text-stone-600 mb-3 uppercase tracking-[0.2em]">{f.label}</label>
                        <textarea value={(store as any)[f.key]} onChange={e => store.updateField(f.key as any, e.target.value)} rows={3} className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl p-5 text-stone-900 text-xs font-bold outline-none focus:border-amber-400 resize-none shadow-sm placeholder:text-stone-400" placeholder="..." />
                      </div>
                   ))}
                </div>
                <div className="relative z-10">
                  <label className="block text-[10px] font-black text-amber-700 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ScrollText className="w-4 h-4" /> Epic Backstory
                  </label>
                  <textarea 
                    value={store.backstory} 
                    onChange={e => store.updateField("backstory", e.target.value)} 
                    rows={6} 
                    placeholder="Ketikkan sejarah heroik Anda di sini..." 
                    className="w-full bg-white border border-[#d4c5b0] focus:ring-1 focus:ring-amber-400 rounded-xl p-6 text-stone-900 text-xs font-bold outline-none focus:border-amber-400 resize-none leading-relaxed shadow-sm placeholder:text-stone-400" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}