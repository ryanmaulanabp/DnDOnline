import Link from "next/link";
import { connectDB } from "@/lib/mongodb"; // Diperbaiki: Menggunakan { connectDB }
import Character from "@/models/Character";

// Memaksa Next.js untuk selalu mengambil data terbaru dari database
export const revalidate = 0;

async function getCharacters() {
  try {
    await connectDB();
    const characters = await Character.find({}).sort({ updatedAt: -1 });
    return characters;
  } catch (error) {
    console.error("Gagal mengambil daftar karakter:", error);
    return [];
  }
}

export default async function HomePage() {
  const characters = await getCharacters();

  return (
    <main className="min-h-screen bg-[#0f111a] text-slate-200 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
              Realm <span className="text-red-600">Forge</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Panteon pahlawan yang telah Anda tempa.</p>
          </div>
          <Link 
            href="/characters/new" 
            className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] active:scale-95 flex items-center gap-3 group"
          >
            <span>TEMPA KARAKTER BARU</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* CHARACTER GRID */}
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <Link 
                key={char._id.toString()} 
                href={`/characters/${char._id}`}
                className="group bg-[#181b26] border border-[#2d3245] p-6 rounded-2xl hover:border-red-600/50 transition-all shadow-lg hover:shadow-red-900/10 relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute -right-4 -bottom-4 text-slate-800/20 text-8xl font-black italic pointer-events-none group-hover:text-red-900/10 transition-colors uppercase">
                  {char.class.split(' ')[0]}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-[#0f111a] rounded-lg border border-[#3e455c] flex items-center justify-center text-2xl group-hover:border-red-500 transition-colors">
                      🐉
                    </div>
                    <span className="text-[10px] font-black bg-blue-900/30 text-blue-400 px-2 py-1 rounded uppercase tracking-widest border border-blue-900/50">
                      Level {char.level}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase truncate">
                    {char.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tight">
                    {char.race} • {char.class}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#2d3245] pt-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Hit Points</span>
                      <span className="text-sm font-black text-slate-300">{char.currentHp} / {char.hpMax} HP</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Main Stat</span>
                      <span className="text-sm font-black text-yellow-500">{char.stats.STR} STR</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#181b26] rounded-3xl border border-[#2d3245] border-dashed">
            <div className="text-6xl mb-6 opacity-20">⚔️</div>
            <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest">Belum Ada Pahlawan</h2>
            <p className="text-slate-600 mt-2">Dunia ini sunyi tanpa kehadiran karakter buatanmu.</p>
            <Link 
              href="/characters/new" 
              className="mt-8 inline-block text-red-500 font-black text-sm hover:underline tracking-widest"
            >
              MULAI PERJALANANMU DI SINI
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-20 text-center border-t border-[#2d3245] pt-8 max-w-6xl mx-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          Powered by Realm Forge Engine • v1.2 Final
        </p>
      </footer>
    </main>
  );
}