"use client";

import { useState, useMemo } from "react";
import { useCharacterStore } from "@/store/useCharacterStore";
import { BACKGROUNDS, ALIGNMENTS } from "@/lib/dnd-data";

// --- DATA CONSTANTS ---
const LIFESTYLES = ["Wretched", "Squalid", "Poor", "Modest", "Comfortable", "Wealthy", "Aristocratic"];
const FAITHS = [
  "Atheist / Tidak Ada", "Lathander (Dewa Fajar)", "Selûne (Dewi Bulan)", "Tyr (Dewa Keadilan)", 
  "Kelemvor (Dewa Kematian)", "Mystra (Dewi Sihir)", "Tempus (Dewa Perang)", "Sune (Dewi Kecantikan)", 
  "Helm (Dewa Penjaga)", "Oghma (Dewa Pengetahuan)", "Bahamut (Dewa Naga Baik)", "Tiamat (Dewi Naga Jahat)"
];

// --- DATABASE FISIK DINAMIS PER RAS (D&D 5E OFFICIAL RANGE) ---
const RACE_PHYSICAL_DATA: Record<string, { height: string[], weight: string[] }> = {
  "Human": {
    height: ["147cm (Sangat Pendek)", "160cm (Pendek)", "175cm (Sedang)", "185cm (Tinggi)", "198cm (Sangat Tinggi)"],
    weight: ["55kg (Kurus)", "70kg (Sedang)", "85kg (Berisi)", "100kg (Kekar)", "120kg (Sangat Besar)"]
  },
  "Elf": {
    height: ["142cm (Ramping)", "155cm (Sedang)", "170cm (Tinggi)", "185cm (Sangat Tinggi)"],
    weight: ["45kg (Sangat Ringan)", "55kg (Sedang)", "65kg (Atletis)", "75kg (Kekar)"]
  },
  "Dwarf": {
    height: ["120cm (Sangat Pendek)", "135cm (Sedang)", "145cm (Maksimal Dwarf)"],
    weight: ["65kg (Padat)", "75kg (Sedang)", "85kg (Sangat Berat)", "100kg (Gempal)"]
  },
  "Halfling": {
    height: ["84cm (Pendek)", "90cm (Sedang)", "100cm (Tinggi)"],
    weight: ["15kg (Ringan)", "18kg (Sedang)", "22kg (Berisi)"]
  },
  "Dragonborn": {
    height: ["175cm (Pendek)", "190cm (Sedang)", "205cm (Tinggi)", "215cm (Raksasa)"],
    weight: ["85kg (Ringan)", "105kg (Sedang)", "125kg (Kekar)", "150kg (Masif)"]
  },
  "Gnome": {
    height: ["90cm (Pendek)", "105cm (Sedang)", "120cm (Tinggi)"],
    weight: ["18kg (Kurus)", "20kg (Sedang)", "23kg (Berisi)"]
  },
  "Half-Elf": {
    height: ["150cm (Pendek)", "170cm (Sedang)", "185cm (Tinggi)", "195cm (Sangat Tinggi)"],
    weight: ["55kg (Kurus)", "75kg (Sedang)", "90kg (Berisi)", "110kg (Kekar)"]
  },
  "Half-Orc": {
    height: ["160cm (Pendek)", "185cm (Sedang)", "205cm (Tinggi)", "220cm (Sangat Besar)"],
    weight: ["80kg (Ramping)", "100kg (Sedang)", "130kg (Kekar)", "170kg (Masif)"]
  },
  "Tiefling": {
    height: ["148cm (Pendek)", "170cm (Sedang)", "188cm (Tinggi)"],
    weight: ["50kg (Kurus)", "70kg (Sedang)", "90kg (Berisi)"]
  },
  "Default": {
    height: ["150cm", "170cm", "190cm"],
    weight: ["60kg", "80kg", "100kg"]
  }
};

const PHYSICAL_PRESETS_GENERAL = {
  hair: ["Hitam Legam", "Cokelat Gelap", "Pirang Kemilau", "Merah Api", "Perak Terang", "Putih Salju", "Botak", "Bercahaya Mistis", "Gimbal Kasar", "Cukur Rapi"],
  skin: ["Pucat (Pale)", "Kuning Langsat", "Cokelat Terang (Tan)", "Cokelat Gelap", "Tembaga (Copper)", "Perunggu (Bronze)", "Hitam Arang", "Merah Iblis", "Hijau Zamrud"],
  eyes: ["Cokelat Tajam", "Biru Langit", "Hijau Zamrud", "Hazel", "Kuning Emas", "Merah Menyala", "Perak Buta", "Ungu Mistis", "Hitam Kosong"],
  age: ["Remaja", "Dewasa Muda", "Dewasa", "Paruh Baya", "Tua", "Sangat Kuno (Venerable)"],
  gender: ["Pria", "Wanita", "Androgini", "Non-binary", "Bentuk Esensi (Fluid)", "Tidak Diketahui"]
};

// --- COMPREHENSIVE LORE GENERATOR (6 BACKGROUNDS + DEFAULT) ---
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

  // LOGIKA DINAMIS: Ambil tinggi & berat sesuai Ras
  const physicalData = useMemo(() => {
    const baseRace = Object.keys(RACE_PHYSICAL_DATA).find(r => store.race.includes(r)) || "Default";
    return RACE_PHYSICAL_DATA[baseRace];
  }, [store.race]);

  const toggleSection = (section: string) => setOpenSection(prev => prev === section ? "" : section);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight">Character Identity</h2>
        <p className="text-slate-400 mt-1">Lengkapi esensi fisik dan jiwa pahlawan Anda untuk petualangan ini.</p>
      </div>

      {/* INPUT NAMA KARAKTER */}
      <div className="bg-[#181b26] p-6 rounded-2xl border border-[#2d3245] shadow-xl">
        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Character Name</label>
        <input 
          value={store.name} 
          onChange={e => store.updateField("name", e.target.value)} 
          className="w-full p-4 rounded-xl bg-[#0f111a] border border-[#3e455c] focus:border-blue-500 font-black text-3xl outline-none text-white transition-all placeholder:text-slate-800 shadow-inner" 
          placeholder="e.g. Arkanis Si Biru" 
        />
      </div>

      <div className="space-y-4">
        
        {/* --- 1. CHARACTER DETAILS --- */}
        <div className="bg-[#181b26] rounded-2xl border border-[#2d3245] overflow-hidden shadow-lg transition-all">
          <button onClick={() => toggleSection("Details")} className="w-full flex justify-between items-center p-6 bg-[#181b26] hover:bg-[#2d3245]/50 transition-colors border-l-4 border-l-blue-500">
            <div className="text-left">
              <h3 className="text-xl font-black text-white">Character Details</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Alignment • Faith • Lifestyle • Background</p>
            </div>
            <span className={`text-slate-500 transform transition-transform text-xl ${openSection === "Details" ? "rotate-180" : ""}`}>▼</span>
          </button>
          
          {openSection === "Details" && (
            <div className="p-8 bg-[#0f111a] border-t border-[#2d3245] grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">Background (Masa Lalu)</label>
                <select value={store.background} onChange={e => store.updateField("background", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                  <option value="">-- Pilih Background --</option>
                  {Object.keys(BACKGROUNDS).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
                {store.background && BACKGROUNDS[store.background] && (
                  <div className="mt-3 p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                    <p className="text-xs text-blue-300 leading-relaxed italic">{BACKGROUNDS[store.background].desc}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">Alignment (Moralitas)</label>
                <select value={store.alignment} onChange={e => store.updateField("alignment", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all">
                  {Object.keys(ALIGNMENTS).map(al => <option key={al} value={al}>{al}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">Faith (Kepercayaan)</label>
                <input list="faith-list" value={store.faith} onChange={e => store.updateField("faith", e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all" placeholder="Pilih atau ketik dewa..." />
                <datalist id="faith-list">{FAITHS.map(f => <option key={f} value={f} />)}</datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">Lifestyle (Gaya Hidup)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                   {LIFESTYLES.map(life => (
                     <button key={life} onClick={() => store.updateField("lifestyle", life)} className={`px-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all border ${store.lifestyle === life ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' : 'bg-[#181b26] border-[#3e455c] text-slate-500 hover:text-slate-300'}`}>
                       {life}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 2. PHYSICAL CHARACTERISTICS (DYNAMIC BY RACE) --- */}
        <div className="bg-[#181b26] rounded-2xl border border-[#2d3245] overflow-hidden shadow-lg transition-all">
          <button onClick={() => toggleSection("Physical")} className="w-full flex justify-between items-center p-6 bg-[#181b26] hover:bg-[#2d3245]/50 transition-colors border-l-4 border-l-green-500">
            <div className="text-left">
              <h3 className="text-xl font-black text-white">Physical Characteristics</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Disesuaikan dengan Ras: <span className="text-green-500">{store.race || "Human"}</span></p>
            </div>
            <span className={`text-slate-500 transform transition-transform text-xl ${openSection === "Physical" ? "rotate-180" : ""}`}>▼</span>
          </button>
          
          {openSection === "Physical" && (
            <div className="p-8 bg-[#0f111a] border-t border-[#2d3245] grid grid-cols-2 md:grid-cols-3 gap-6 animate-fadeIn">
              {/* HEIGHT (Tinggi - DINAMIS) */}
              <div className="relative">
                <label className="block text-xs font-black text-green-500 mb-2 uppercase tracking-widest">Height (Tinggi)</label>
                <input list="height-list" value={store.height} onChange={e => store.updateField("height", e.target.value)} className="w-full bg-[#181b26] border border-green-900/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition-all" placeholder="Pilih Tinggi..." />
                <datalist id="height-list">{physicalData.height.map(h => <option key={h} value={h} />)}</datalist>
              </div>

              {/* WEIGHT (Berat - DINAMIS) */}
              <div className="relative">
                <label className="block text-xs font-black text-green-500 mb-2 uppercase tracking-widest">Weight (Berat)</label>
                <input list="weight-list" value={store.weight} onChange={e => store.updateField("weight", e.target.value)} className="w-full bg-[#181b26] border border-green-900/30 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition-all" placeholder="Pilih Berat..." />
                <datalist id="weight-list">{physicalData.weight.map(w => <option key={w} value={w} />)}</datalist>
              </div>

              {/* OTHERS (GENERAL PRESETS) */}
              {(Object.keys(PHYSICAL_PRESETS_GENERAL) as Array<keyof typeof PHYSICAL_PRESETS_GENERAL>).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">{key}</label>
                  <input list={`${key}-list`} value={(store as any)[key]} onChange={e => store.updateField(key as any, e.target.value)} className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all" placeholder={`Pilih ${key}...`} />
                  <datalist id={`${key}-list`}>{PHYSICAL_PRESETS_GENERAL[key].map(opt => <option key={opt} value={opt} />)}</datalist>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. PERSONAL CHARACTERISTICS (DICE RANDOMIZER) --- */}
        <div className="bg-[#181b26] rounded-2xl border border-[#2d3245] overflow-hidden shadow-lg transition-all">
          <button onClick={() => toggleSection("Personal")} className="w-full flex justify-between items-center p-6 bg-[#181b26] hover:bg-[#2d3245]/50 transition-colors border-l-4 border-l-purple-500">
            <div className="text-left">
              <h3 className="text-xl font-black text-white">Personal Characteristics</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Traits • Ideals • Bonds • Flaws</p>
            </div>
            <span className={`text-slate-500 transform transition-transform text-xl ${openSection === "Personal" ? "rotate-180" : ""}`}>▼</span>
          </button>
          
          {openSection === "Personal" && (
            <div className="p-8 bg-[#0f111a] border-t border-[#2d3245] grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              {[ {label: "Personality Traits", key: "traits"}, {label: "Ideals", key: "ideals"}, 
                 {label: "Bonds", key: "bonds"}, {label: "Flaws", key: "flaws"} ].map(f => (
                <div key={f.key} className="flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                    <button 
                      onClick={() => store.updateField(f.key as any, generateLore(store.background, f.key as any))}
                      className="text-[10px] font-black bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 border border-purple-900/50 shadow-lg active:scale-95"
                    >
                      🎲 GENERATE {store.background ? `FROM ${store.background.toUpperCase()}` : ''}
                    </button>
                  </div>
                  <textarea 
                    value={(store as any)[f.key]} 
                    onChange={e => store.updateField(f.key as any, e.target.value)} 
                    rows={4} 
                    className="w-full flex-1 bg-[#181b26] border border-[#3e455c] rounded-xl p-4 text-white text-sm outline-none focus:border-purple-500 resize-none placeholder:text-slate-800 leading-relaxed" 
                    placeholder="Gunakan dadu cerdas di atas atau tulis imajinasi Anda..." 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 4. NOTES & BACKSTORY --- */}
        <div className="bg-[#181b26] rounded-2xl border border-[#2d3245] overflow-hidden shadow-lg transition-all">
          <button onClick={() => toggleSection("Notes")} className="w-full flex justify-between items-center p-6 bg-[#181b26] hover:bg-[#2d3245]/50 transition-colors border-l-4 border-l-yellow-500">
            <div className="text-left">
              <h3 className="text-xl font-black text-white">Notes & Lore</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Backstory • Organizations • Allies • Enemies</p>
            </div>
            <span className={`text-slate-500 transform transition-transform text-xl ${openSection === "Notes" ? "rotate-180" : ""}`}>▼</span>
          </button>
          
          {openSection === "Notes" && (
            <div className="p-8 bg-[#0f111a] border-t border-[#2d3245] space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[ {label: "Organizations", key: "organizations"}, {label: "Allies", key: "allies"}, {label: "Enemies", key: "enemies"} ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">{f.label}</label>
                      <textarea value={(store as any)[f.key]} onChange={e => store.updateField(f.key as any, e.target.value)} rows={3} className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 resize-none" placeholder="..." />
                    </div>
                 ))}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Epic Backstory</label>
                <textarea 
                  value={store.backstory} 
                  onChange={e => store.updateField("backstory", e.target.value)} 
                  rows={8} 
                  placeholder="Ketikkan sejarah heroik Anda di sini..." 
                  className="w-full bg-[#181b26] border border-[#3e455c] rounded-xl p-6 text-white text-sm outline-none focus:border-yellow-500 resize-none leading-relaxed shadow-inner" 
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}