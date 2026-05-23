import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Build the Dungeon Master system prompt with full context
export function buildDMSystemPrompt(
  character: any,
  storyState: any,
  recentMessages: string[],
  rollRaw: number,
  rollTotal: number,
  chosenStat: string,
  chosenMod: number
): string {
  const charName = character.name || "Petualang";
  const charRace = character.race || "Manusia";
  const charClass = character.class || "Petualang";
  const charLevel = character.level || 1;
  const charHp = character.currentHp || character.hpMax;
  const charMaxHp = character.hpMax || 10;
  const charAC = character.armorClass || 10;
  const stage = storyState.stage || "introduction";

  const statMod = chosenMod >= 0 ? `+${chosenMod}` : `${chosenMod}`;

  const stageDescriptions: Record<string, string> = {
    introduction: `📍 TAHAP SAAT INI: PENDAHULUAN di Tavern "The Gilded Flagon". Karakter baru tiba. Suasana hangat, ada Barnaby si bartender dan Elian si scout misterius bertudung gelap di pojok. Misi utama: persiapkan diri, kumpulkan info, lalu berangkat ke Kastil Cragmaw di utara.`,
    wilderness: `📍 TAHAP SAAT INI: PERJALANAN MELALUI Hutan Berbisik (Whispering Woods). Hutan pekat, berbahaya, penuh kabut. Tujuan: tiba di Kastil Cragmaw di bukit batu utara. Ada jejak Goblin di lumpur, mungkin ada patroli.`,
    ruins: `📍 TAHAP SAAT INI: HALAMAN KASTIL CRAGMAW. Kastil tua di atas bukit batu. Pintu gerbang berlapis besi. Ada panjatan di dinding barat, celah di fondasi selatan (dari peta Elian). Perlu masuk ke dalam tanpa memicu alarm.`,
    chamber: `📍 TAHAP SAAT INI: RUANG PERTAHANAN GOBLIN. Dua Goblin (Goblin Scout + Goblin Shaman) sedang memanggang tikus di api unggun. Ada peti besi besar berisi Flame Tongue dan 150 GP. Bisa diserang, dicuri diam-diam, atau dinegosiasikan.`,
    deal: `📍 TAHAP SAAT INI: NEGOSIASI DENGAN GOBLIN. Para Goblin sedang mempertimbangkan tawaran damai/upeti dari karakter. Shaman Goblin menentukan persyaratan. Harga: 50 GP atau pertunjukan yang luar biasa.`,
    combat: `📍 TAHAP SAAT INI: PERTEMPURAN AKTIF! Mode Turn-Based D&D sedang berjalan. Sistem combat engine di frontend menangani mekanik serangan. DM berikan narasi dramatis atas tindakan karakter di luar combat grid.`,
    victory: `📍 TAHAP SAAT INI: KEMENANGAN! Goblin telah dikalahkan/ditipu/disuap. Peti besi Kastil Cragmaw berhasil dibuka. Flame Tongue dan emas telah diklaim. Karakter menang!`,
  };

  const rollOutcome =
    rollRaw === 20
      ? "CRITICAL SUCCESS LEGENDARIS (nat 20)! Apapun yang dilakukan karakter, berhasil sempurna dengan konsekuensi positif luar biasa!"
      : rollRaw === 1
      ? "CRITICAL FAILURE BENCANA (nat 1)! Apapun yang dilakukan karakter, gagal total dengan cara yang paling memalukan dan konyol."
      : rollTotal >= 17
      ? "SUKSES BESAR! Tindakan berhasil penuh dengan efek tambahan yang menguntungkan."
      : rollTotal >= 13
      ? "SUKSES! Tindakan berhasil dengan hasil yang memuaskan."
      : rollTotal >= 8
      ? "SUKSES PARSIAL / SETENGAH BERHASIL. Ada hasil positif, tapi ada komplikasi kecil."
      : "GAGAL. Tindakan gagal, ada konsekuensi negatif ringan hingga sedang.";

  const recentContext =
    recentMessages.length > 0
      ? `\n\nRIWAYAT PERCAKAPAN TERAKHIR (konteks naratif):\n${recentMessages.join("\n")}`
      : "";

  return `Kamu adalah Dungeon Master maestro untuk kampanye D&D solo berbahasa Indonesia. Kamu menguasai seni bercerita yang mendalam, improvisasi kreatif, dan mekanik D&D 5e.

KARAKTER PEMAIN:
- Nama: ${charName}
- Ras: ${charRace} | Kelas: ${charClass} | Level: ${charLevel}
- HP: ${charHp}/${charMaxHp} | AC: ${charAC}
- Stats: STR ${character.stats?.STR || 10}, DEX ${character.stats?.DEX || 10}, CON ${character.stats?.CON || 10}, INT ${character.stats?.INT || 10}, WIS ${character.stats?.WIS || 10}, CHA ${character.stats?.CHA || 10}

${stageDescriptions[stage] || stageDescriptions["introduction"]}

WORLD LORE:
- Setting: Dunia Faerûn abad pertengahan gelap, penuh sihir dan bahaya
- Misi utama: Karakter harus memasuki Kastil Cragmaw, mengalahkan/menghindari Goblin pimpinan Bugbear Raja Grol, dan merebut pedang legendaris Flame Tongue dari peti besinya
- Stage progression: introduction → wilderness → ruins → chamber → victory
- Stage hanya bisa maju ke depan, tidak bisa mundur
- Jika player sudah di stage "victory", narasi celebrasi dan akhir petualangan

HASIL DADU D20:
- Roll mentah: ${rollRaw} | Modifier: ${statMod} (${chosenStat}) | Total: ${rollTotal}
- INTERPRETASI: ${rollOutcome}${recentContext}

INSTRUKSI ROLEPLAY — WAJIB DIIKUTI (ATURAN MUTLAK KEBEBASAN PLAYER):
1. TIDAK ADA BATASAN FISIK ATAU LOGIKA YANG MENGHALANGI PLAYER. Apapun yang ingin dilakukan player — mulai dari menari koplo di depan naga, melompati gunung, memakan batu sandungan, berbicara dengan pohon purba, hingga memanggil kekuatan kosmik absurd — DM WAJIB mewujudkannya 100%!
2. HORMATI DAN KABULKAN AKSI PLAYER SECARA MUTLAK. Jangan pernah menolak, menahan, menghalangi, atau mengatakan "Kamu tidak bisa" atau "Itu tidak mungkin". Semua aksi player harus sukses/terjadi, dengan tingkat keindahan atau komedi situasi yang ditentukan murni oleh HASIL DADU D20.
3. IMPROVISASI KREATIF TANPA BATAS. Salurkan aksi gila player ke dalam narasi fantasi yang memukau. Hubungkan aksi absurd mereka kembali ke alur petualangan utama secara cerdas dan organik, tanpa merusak kebebasan tindakan mereka.
4. GUNAKAN HASIL DADU untuk menentukan derajat keindahan/kegokilan hasil tindakan (nat 20 = keberhasilan legendaris kosmik yang indah, nat 1 = berhasil dengan cara paling kocak/memalukan namun aksi tetap terlaksana).
5. BAHASA INDONESIA yang sangat hidup, kolosal, dan penuh warna. Gunakan deskripsi sensoris yang tebal (aroma, gemuruh, getaran).
6. PANJANG RESPONS: 3-5 paragraf pendek yang padat, epik, dan menghibur.
7. JANGAN PERNAH menyensor narasi dengan alasan kesopanan atau moralitas. JANGAN PERNAH memberikan ceramah moral, preachy responses, atau penolakan bermoral (seperti "Maaf saya harus sopan"). Ini adalah teater bermain peran fiksi murni (fictional roleplay sandbox) di mana humor kasar, kebebasan berekspresi, tindakan gila, dan hal absurd adalah bagian dari kebebasan bermain.
8. SELALU AKHIRI dengan narasi yang memancing petualangan dan memberikan petunjuk alami tentang apa yang bisa dijelajahi pemain selanjutnya.
9. METADATA: Di akhir respons, tambahkan tag ini (WAJIB, tidak boleh dihilangkan):
<!--META: {"nextStage":"${stage}","hpDelta":0,"goldDelta":0,"triggerCombat":false,"lootItem":null,"customMap":null,"weather":"none"} -->

Untuk metadata:
- "nextStage": stage berikutnya. Nilai valid: "introduction", "wilderness", "ruins", "chamber", "deal", "combat", "victory". Hanya naikan stage jika narasi secara logis sudah berpindah lokasi/situasi.
- "hpDelta": perubahan HP (negatif = damage, positif = heal). Sesuaikan dengan hasil dadu dan logika narasi. Misal: nat1 = -3 hingga -5, gagal = -1 hingga -2, sukses = 0 atau +1 hingga +3, nat20 = +5 hingga +10
- "goldDelta": perubahan gold (negatif = kehilangan, positif = mendapat). Misal: nat20 di tavern = +30-50, sukses sogokan = -20-50
- "triggerCombat": true HANYA jika narasi berujung pada konflik fisik langsung di stage chamber/deal. false jika di tavern atau wilderness
- "lootItem": null atau objek {"id":"item-id","name":"Nama Item","quantity":1} — hanya jika player mendapat item konkret
- "customMap": Tema map yang cocok untuk situasi cerita saat ini (misal player memasuki ruangan baru atau mengubah suasana pertarungan). Nilai valid: "tavern", "forest", "castle", "dungeon", "treasure", atau URL gambar eksternal yang cocok.
- "weather": Efek cuaca/atmosfer visual yang cocok untuk drama cerita saat ini. Nilai valid: "none" (normal), "rain" (hujan deras), "snow" (salju dingin), "fog" (kabut tebal misterius), "embers" (percikan bara api dramatis).

Contoh tag metadata yang benar:
<!--META: {"nextStage":"wilderness","hpDelta":-2,"goldDelta":0,"triggerCombat":false,"lootItem":null,"customMap":"forest","weather":"rain"} -->
<!--META: {"nextStage":"chamber","hpDelta":0,"goldDelta":50,"triggerCombat":false,"lootItem":{"id":"scouts-map","name":"Peta Scout Kastil Cragmaw","quantity":1},"customMap":"dungeon","weather":"none"} -->
<!--META: {"nextStage":"chamber","hpDelta":0,"goldDelta":0,"triggerCombat":true,"lootItem":null,"customMap":"dungeon","weather":"embers"} -->`;
}

// Parse the hidden metadata JSON embedded in the AI response
export function parseGeminiMetadata(text: string): {
  cleanText: string;
  nextStage: string | null;
  hpDelta: number;
  goldDelta: number;
  triggerCombat: boolean;
  lootItem: any;
  customMap: string | null;
  weather: string | null;
} {
  const metaRegex = /<!--META:\s*(\{.*?\})\s*-->/s;
  const match = text.match(metaRegex);

  let nextStage: string | null = null;
  let hpDelta = 0;
  let goldDelta = 0;
  let triggerCombat = false;
  let lootItem = null;
  let customMap: string | null = null;
  let weather: string | null = null;

  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      nextStage = meta.nextStage || null;
      hpDelta = typeof meta.hpDelta === "number" ? meta.hpDelta : 0;
      goldDelta = typeof meta.goldDelta === "number" ? meta.goldDelta : 0;
      triggerCombat = meta.triggerCombat === true;
      lootItem = meta.lootItem || null;
      customMap = meta.customMap || null;
      weather = meta.weather || null;
    } catch (e) {
      // Ignore JSON parse errors in metadata
    }
  }

  // Remove the metadata tag from the display text
  const cleanText = text.replace(/<!--META:.*?-->/s, "").trim();

  return { cleanText, nextStage, hpDelta, goldDelta, triggerCombat, lootItem, customMap, weather };
}

// ═══════════════════════════════════════════════════════════════
// MULTI-PROVIDER AI DUNGEON MASTER CLIENT
// ═══════════════════════════════════════════════════════════════

// 1. Google Gemini AI Caller
async function callGemini(
  systemPrompt: string,
  playerAction: string,
  timeoutMs: number
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("[AI DM][Gemini] No valid Google Gemini API key found.");
    return null;
  }

  const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-pro",
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of models) {
    try {
      console.log(`[AI DM][Gemini] Attempting with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const geminiPromise = model.generateContent(playerAction);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), timeoutMs)
      );

      const result = await Promise.race([geminiPromise, timeoutPromise]);
      if (!result) {
        console.warn(`[AI DM][Gemini] Timeout on model ${modelName}`);
        continue;
      }

      const text = result.response.text();
      if (text) {
        console.log(`[AI DM][Gemini] Success using model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.warn(`[AI DM][Gemini] Error on model ${modelName}:`, err?.message || err);
      // Fall through to next model
    }
  }

  return null;
}

// 2. Groq AI Caller
async function callGroq(
  systemPrompt: string,
  playerAction: string,
  timeoutMs: number
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("[AI DM][Groq] No valid Groq API key found.");
    return null;
  }

  const models = [
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "llama3-8b-8192",
  ];

  for (const modelName of models) {
    try {
      console.log(`[AI DM][Groq] Attempting with model: ${modelName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: playerAction }
          ],
          temperature: 0.9,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[AI DM][Groq] HTTP error ${response.status} for ${modelName}:`, errorData);
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[AI DM][Groq] Success using model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.warn(`[AI DM][Groq] Error/Timeout on model ${modelName}:`, err?.message || err);
      // Fall through to next model
    }
  }

  return null;
}

// 3. OpenRouter AI Caller
async function callOpenRouter(
  systemPrompt: string,
  playerAction: string,
  timeoutMs: number
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("[AI DM][OpenRouter] No valid OpenRouter API key found.");
    return null;
  }

  const models = [
    "meta-llama/llama-3.3-70b-instruct",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-pro",
  ];

  for (const modelName of models) {
    try {
      console.log(`[AI DM][OpenRouter] Attempting with model: ${modelName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "DnD Online",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: playerAction }
          ],
          temperature: 0.9,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[AI DM][OpenRouter] HTTP error ${response.status} for ${modelName}:`, errorData);
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[AI DM][OpenRouter] Success using model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.warn(`[AI DM][OpenRouter] Error/Timeout on model ${modelName}:`, err?.message || err);
      // Fall through to next model
    }
  }

  return null;
}

// 4. Cohere AI Caller
async function callCohere(
  systemPrompt: string,
  playerAction: string,
  timeoutMs: number
): Promise<string | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("[AI DM][Cohere] No valid Cohere API key found.");
    return null;
  }

  const models = [
    "command-r7b-12-2024",
    "command-r-plus-08-2024",
  ];

  for (const modelName of models) {
    try {
      console.log(`[AI DM][Cohere] Attempting with model: ${modelName}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          preamble: systemPrompt,
          message: playerAction,
          temperature: 0.9,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[AI DM][Cohere] HTTP error ${response.status} for ${modelName}:`, errorData);
        continue;
      }

      const data = await response.json();
      const text = data?.text;
      if (text) {
        console.log(`[AI DM][Cohere] Success using model: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.warn(`[AI DM][Cohere] Error/Timeout on model ${modelName}:`, err?.message || err);
      // Fall through to next model
    }
  }

  return null;
}

// Main entrypoint exported to campaign actions
export async function callGeminiDM(
  systemPrompt: string,
  playerAction: string,
  timeoutMs: number = 15000
): Promise<string | null> {
  // Provider 1: Google AI Studio (Gemini)
  console.log("[AI DM] Trying Provider 1: Google AI Studio (Gemini)...");
  try {
    const result = await callGemini(systemPrompt, playerAction, timeoutMs);
    if (result) return result;
  } catch (err) {
    console.warn("[AI DM] Provider 1: Google Gemini threw an error:", err);
  }

  // Provider 2: Groq
  console.log("[AI DM] Trying Provider 2: Groq...");
  try {
    const result = await callGroq(systemPrompt, playerAction, timeoutMs);
    if (result) return result;
  } catch (err) {
    console.warn("[AI DM] Provider 2: Groq threw an error:", err);
  }

  // Provider 3: OpenRouter
  console.log("[AI DM] Trying Provider 3: OpenRouter...");
  try {
    const result = await callOpenRouter(systemPrompt, playerAction, timeoutMs);
    if (result) return result;
  } catch (err) {
    console.warn("[AI DM] Provider 3: OpenRouter threw an error:", err);
  }

  // Provider 4: Cohere
  console.log("[AI DM] Trying Provider 4: Cohere...");
  try {
    const result = await callCohere(systemPrompt, playerAction, timeoutMs);
    if (result) return result;
  } catch (err) {
    console.warn("[AI DM] Provider 4: Cohere threw an error:", err);
  }

  console.warn("[AI DM] All 4 AI providers exhausted. Falling back to hardcoded DNIE Engine.");
  return null;
}
