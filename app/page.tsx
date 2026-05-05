import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Character from "@/models/Character";

// Memaksa Next.js untuk selalu mengambil data terbaru dari database (menonaktifkan cache statis)
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Buka koneksi ke MongoDB
  await connectDB();
  
  // 2. Ambil semua karakter, urutkan dari yang terbaru dibuat
  const characters = await Character.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-[#06060c] text-slate-50 font-sans p-6 md:p-12 lg:p-20 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tighter">
              <span className="text-blue-500">Dungeons & Dragons</span><br />
              <span className="text-purple-400">Online Realm</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Selamat datang kembali, <span className="text-blue-400 font-bold">Yann</span>. Kelola karaktermu, pantau status petualangan, dan raih kemenangan di setiap lemparan dadu.
            </p>
          </div>
          <Link 
            href="/characters/new" 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap active:scale-95"
          >
            <span className="text-xl">⚔️</span> Buat Petualang Baru
          </Link>
        </div>

        {/* CHARACTER LIST SECTION */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-white whitespace-nowrap">Daftar Karakter</h2>
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-sm font-mono text-slate-500 whitespace-nowrap">{characters.length} Petualang Terdaftar</span>
          </div>

          {/* KONDISI JIKA KOSONG / ADA ISINYA */}
          {characters.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
              <span className="text-6xl block mb-4">🏕️</span>
              <h3 className="text-xl font-bold text-slate-300 mb-2">Tavern Masih Kosong</h3>
              <p className="text-slate-500">Belum ada pahlawan yang bergabung. Klik tombol biru di atas untuk memulai!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {characters.map((char: any) => {
                // Ekstrak ras utama (membuang teks dalam kurung subras agar rapi di badge)
                const mainRace = char.race.split(' (')[0];
                
                // Tentukan Ikon berdasarkan Class
                let classIcon = "🛡️";
                if (char.class.includes("Fighter") || char.class.includes("Barbarian") || char.class.includes("Paladin")) classIcon = "⚔️";
                if (char.class.includes("Wizard") || char.class.includes("Sorcerer") || char.class.includes("Warlock")) classIcon = "✨";
                if (char.class.includes("Rogue") || char.class.includes("Ranger") || char.class.includes("Monk")) classIcon = "🗡️";
                if (char.class.includes("Cleric") || char.class.includes("Druid") || char.class.includes("Bard")) classIcon = "⚕️";

                return (
                  <Link key={char._id.toString()} href={`/characters/${char._id.toString()}`} className="block group">
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-slate-900 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-blue-900/10">
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute -inset-24 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      
                      <div className="relative z-10">
                        {/* Bages & Icon */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-2">
                            <span className="bg-blue-900/30 text-blue-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-blue-800/30">
                              LVL {char.level || 1}
                            </span>
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-slate-700">
                              {mainRace}
                            </span>
                          </div>
                          <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                            {classIcon}
                          </div>
                        </div>

                        {/* Nama Karakter */}
                        <h3 className="text-3xl font-black text-white mb-8 truncate group-hover:text-blue-400 transition-colors">
                          {char.name}
                        </h3>

                        {/* Health Bar */}
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Health Points</span>
                            <span className="text-xs font-bold text-slate-300">{char.hpMax} <span className="text-slate-600">/ {char.hpMax}</span></span>
                          </div>
                          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                            {/* Simulasi bar HP penuh (karena kita belum melacak Current HP) */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-400 w-full h-full rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center pt-12 border-t border-slate-900">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Developed by <span className="text-slate-400">Yann</span> • Built with Next.js & Mongoose
          </p>
        </div>
        
      </div>
    </main>
  );
}