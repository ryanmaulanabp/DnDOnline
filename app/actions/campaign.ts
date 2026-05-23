"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Character from "@/models/Character";
import { updateCharacterHpAction } from "./character";
import { buildDMSystemPrompt, callGeminiDM, parseGeminiMetadata } from "@/lib/gemini";


// Fungsi pembantu untuk mengenerate kode acak (misal: "A1B2C3")
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- FUNGSI CREATE CAMPAIGN (Dungeon Master) ---
export async function createCampaignAction(dmEmail: string, name: string, description: string) {
  try {
    await connectDB();
    const inviteCode = generateInviteCode();
    const newCampaign = new Campaign({ dmEmail, name, description, inviteCode });
    await newCampaign.save();
    revalidatePath("/campaigns");
    return { success: true, id: newCampaign._id.toString(), inviteCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI JOIN CAMPAIGN (Player) ---
export async function joinCampaignAction(inviteCode: string, characterId: string) {
  try {
    await connectDB();
    const campaign = await Campaign.findOne({ inviteCode });
    if (!campaign) return { success: false, error: "Kode Invite tidak ditemukan!" };

    // Cek apakah karakter valid
    const character = await Character.findById(characterId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan!" };

    // Cek apakah karakter sudah ada di dalam campaign
    if (campaign.characters.includes(characterId)) {
      return { success: false, error: "Karakter ini sudah bergabung di Campaign tersebut!" };
    }

    // Tambahkan karakter ke campaign
    campaign.characters.push(characterId);
    await campaign.save();

    revalidatePath("/campaigns");
    revalidatePath(`/campaigns/${campaign._id}`);
    return { success: true, campaignId: campaign._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FUNGSI GET CAMPAIGNS (Berdasarkan Email DM atau Karakter) ---
export async function getUserCampaignsAction(userEmail: string) {
  try {
    await connectDB();
    
    // 1. Cari campaign di mana user adalah DM
    const dmCampaigns = await Campaign.find({ dmEmail: userEmail }).lean();
    
    // 2. Cari campaign di mana user bermain sebagai Player
    // Pertama, cari semua ID karakter milik user
    const userCharacters = await Character.find({ userEmail }).select('_id').lean();
    const charIds = userCharacters.map(c => c._id);
    
    // Kedua, cari campaign yang memiliki ID karakter user di dalamnya
    const playerCampaigns = await Campaign.find({ characters: { $in: charIds } })
      .populate('characters', 'name race class level avatarUrl currentHp hpMax') // Populate untuk menampilkan UI ringkas
      .lean();

    return JSON.parse(JSON.stringify({ dmCampaigns, playerCampaigns }));
  } catch (error) {
    console.error("Gagal mengambil data Campaign:", error);
    return { dmCampaigns: [], playerCampaigns: [] };
  }
}

// --- FUNGSI GET CAMPAIGN BY ID (Beserta data detail karakter) ---
export async function getCampaignByIdAction(id: string) {
  try {
    await connectDB();
    const campaign = await Campaign.findById(id).populate('characters').lean();
    if (!campaign) return null;
    return JSON.parse(JSON.stringify(campaign));
  } catch (error) {
    console.error("Gagal mengambil detail Campaign:", error);
    return null;
  }
}

// --- ADVANCED FEATURES ACTIONS ---

export async function sendCampaignMessageAction(campaignId: string, senderName: string, text: string, isRoll: boolean = false) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, {
      $push: { chatMessages: { senderName, text, isRoll, createdAt: new Date() } }
    });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCombatStateAction(campaignId: string, combatState: any) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { combatState });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addSharedItemAction(campaignId: string, item: { id: string, name: string, quantity: number }) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, {
      $push: { "sharedInventory.items": item }
    });
    revalidatePath(`/campaigns/${campaignId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSharedGoldAction(campaignId: string, amount: number) {
  try {
    await connectDB();
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.sharedInventory.gold += amount;
      await campaign.save();
      revalidatePath(`/campaigns/${campaignId}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAudioStateAction(campaignId: string, audioState: string) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { audioState });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGridStateAction(campaignId: string, gridState: any) {
  try {
    await connectDB();
    await Campaign.findByIdAndUpdate(campaignId, { gridState });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function claimLootAction(characterId: string, itemName: string) {
  try {
    await connectDB();
    // Cari apakah itu Gold atau Item. Kalau ada kata "Gold" atau "gp"
    if (itemName.toLowerCase().includes("gold") || itemName.toLowerCase().includes("gp")) {
      const match = itemName.match(/\d+/);
      const amount = match ? parseInt(match[0]) : 0;
      if (amount > 0) {
         // Cukup tambahkan gold. Namun Character schema mungkin beda, anggap punya currency.gp
         await Character.findByIdAndUpdate(characterId, { $inc: { "currency.gp": amount } });
      }
    } else {
      // Masukkan ke equipment array
      await Character.findByIdAndUpdate(characterId, { $push: { equipment: itemName } });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSoloCampaignAction(userEmail: string, characterId: string) {
  try {
    await connectDB();
    const character = await Character.findById(characterId);
    if (!character) return { success: false, error: "Karakter tidak ditemukan!" };

    const inviteCode = "SOLO-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const name = `Petualangan Solo: ${character.name}`;
    const description = `${JSON.stringify({ stage: "introduction" })} | Petualangan solo mendalam yang dipandu oleh AI Dungeon Master. Hadapi bahaya yang mengintai!`;

    // 1. Create default gridState with Tavern Background and Rain weather
    const gridState = {
      bgUrl: "/images/pixel_tavern_map.png", 
      weather: "rain",
      tokens: [
        {
          id: character._id.toString(),
          name: character.name,
          x: 150,
          y: 200,
          img: character.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + character.name,
          isMonster: false
        }
      ]
    };

    // 2. Roll initial initiative (combat is NOT active yet!)
    const playerInit = Math.floor(Math.random() * 20) + 1 + (character.initiative || 0);

    // 3. Create combatState (inactive at first!)
    const combatState = {
      isActive: false, // starts in peaceful narrative mode!
      round: 1,
      turnIndex: 0,
      participants: [
        {
          id: character._id.toString(),
          name: character.name,
          initiative: playerInit,
          hp: character.currentHp || character.hpMax,
          maxHp: character.hpMax,
          ac: character.armorClass || 10,
          action: 1,
          bonusAction: 1,
          reaction: 1,
          speed: character.speed || 30,
          isMonster: false
        }
      ]
    };

    // 4. Initial chat messages from AI DM (Roleplay introduction!)
    const introText = `🎙️ [AI Dungeon Master] Hujan lebat mengguyur wilayah luar, tetapi di dalam Tavern "The Gilded Flagon", udara terasa begitu hangat dan nyaman. Aroma kayu pinus terbakar bercampur dengan wangi semangkuk rebusan kentang dan ale segar memenuhi ruangan.\n\nSelamat datang, ${character.name} sang ${character.race} ${character.class}! Anda terduduk di sebuah meja kayu ek yang kokoh. Di balik meja bar, Barnaby sang bartender ramah sedang sibuk membersihkan tankard kuno dengan kain putih. Di pojok tavern yang temaram, tampak sesosok misterius bertudung gelap sedang mengamati peta tua.\n\nSebelum memulai perjalanan berbahaya Anda ke reruntuhan kuno Kastil Cragmaw di utara hutan, Anda memiliki kesempatan untuk bersiap di sini.\n\nApa yang ingin Anda lakukan? Ketik tindakan Anda di Tavern Log di bawah (misal: 'saya memesan segelas ale hangat ke bartender', 'saya mendatangi orang misterius bertudung', atau 'saya bertanya tentang rumor terbaru ke Barnaby').`;
    const chatMessages = [
      {
        senderName: "Dungeon Master",
        text: introText,
        isRoll: false,
        createdAt: new Date()
      }
    ];

    // Create the Solo campaign with dmEmail as ai-dm@dnd-online.com
    const newCampaign = new Campaign({
      dmEmail: "ai-dm@dnd-online.com",
      name,
      description,
      inviteCode,
      characters: [character._id],
      gridState,
      combatState,
      chatMessages,
      audioState: "tavern" // Starts with cozy tavern music!
    });

    await newCampaign.save();
    
    revalidatePath("/campaigns");
    return { success: true, campaignId: newCampaign._id.toString() };
  } catch (error: any) {
    console.error("Gagal membuat Solo Campaign:", error);
    return { success: false, error: error.message };
  }
}

// --- HELPER FUNCTION FOR DYNAMIC NARRATIVE IMPROVISATION ENGINE (DNIE) ---
function generateImprovisedNarrative(
  playerMessage: string,
  actionType: string,
  targetNoun: string,
  rollRaw: number,
  rollTotal: number,
  chosenStat: string,
  stage: string,
  character: any,
  storyState: any
): {
  text: string;
  nextStage: string;
  newHp: number;
  lootItem: any;
  goldReward: number;
  goldDeduction: number;
  triggerCombat: boolean;
} {
  const charName = character.name;
  const classTitle = character.class || "Petualang";
  const raceTitle = character.race || "Manusia";
  
  let nextStage = stage;
  let newHp = character.currentHp;
  let lootItem = null;
  let goldReward = 0;
  let goldDeduction = 0;
  let triggerCombat = false;
  let text = "";

  const isNat20 = rollRaw === 20;
  const isNat1 = rollRaw === 1;

  let verbDesc = "";
  if (actionType === "dance") verbDesc = "menari dan berjoget dengan gaya teatrikal";
  else if (actionType === "consume") verbDesc = "mengkonsumsi dan memakan/meminum sesuatu";
  else if (actionType === "acrobatics") verbDesc = "melakukan lompatan, salto, atau aksi akrobatik gesit";
  else if (actionType === "bribe") verbDesc = "mencoba menyogok atau menawarkan koin emas";
  else if (actionType === "smash") verbDesc = "melakukan hantaman fisik dengan kekuatan penuh";
  else if (actionType === "talk") verbDesc = "mengajak bicara, berdiskusi, atau merayu secara sosial";
  else if (actionType === "investigate") verbDesc = "meneliti, mencari jejak, dan menyelidiki area";
  else if (actionType === "stealth") verbDesc = "menyelinap secara senyap melompati bayangan";
  else if (actionType === "attack") verbDesc = "mempersiapkan senjata untuk menyerbu musuh";
  else verbDesc = "melakukan aksi tak terduga";

  let nounDesc = targetNoun || "lingkungan sekitar Anda";

  if (actionType === "dance") {
    if (isNat20) {
      goldReward = 50;
      newHp = Math.min(character.hpMax + 10, character.currentHp + 10);
      text = `✨ **MAHAKARYA KOPIAN TARI D&D!** Anda melompat dengan gaya spektakuler ke arah **${nounDesc}**, lalu mengeksekusi tarian koplo legendaris yang membelah hukum gravitasi! Zirah Anda yang biasanya berat bergemerincing seirama dengan irama ketukan magis Anda.\n\n`;
      if (stage === "introduction") {
        text += `Seluruh isi Tavern Gilded Flagon mendadak terdiam membisu, lalu meledak dalam sorak-sorai riuh rendah! Barnaby melompat ke atas meja bar sambil menangis kagum dan melempar sekantung berisi **50 Koin Emas (GP)** ke tangan Anda! Anda memulihkan stamina penuh (+10 temporary HP)!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Kedua Goblin Cragmaw ternganga melotot melihat tarian koplo Anda! Mereka begitu terhipnotis melihat pinggul Anda bergoyang lincah seirama zirah Anda, hingga mereka menjatuhkan tameng kayu and belati mereka dan mulai ikut bergoyang koplo secara damai! Anda berhasil membuka peti besi raksasa mereka tanpa perlawanan setetes darah pun!`;
        nextStage = "victory";
      } else {
        text += `Aksi teatrikal Anda memancarkan mana murni ke seluruh halaman kastil, membuat angin puyuh meniup kabut kelabu pergi menjauh. Anda menemukan kantong perbekalan ksatria terdahulu berisi **50 GP**!`;
      }
    } 
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 3);
      text = `💥 **BENCANA TEATRIKAL!** Anda berupaya mengeksekusi gerakan tarian koplo di dekat **${nounDesc}** dengan penuh rasa percaya diri.\n\n`;
      if (stage === "introduction") {
        text += `Namun kaki Anda terantuk kaki meja bar kayu ek kokoh! Anda meluncur terbang horizontal dan mendarat mulus dengan wajah terbenam langsung ke dalam panci rebusan kentang babi yang super panas! *PLOSH!* Rebusan panas menyiram wajah Anda, membuat seluruh pengunjung tavern tertawa terpingkal-pingkal! Anda menerima **3 Damage Rebusan Panas**!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Tumit Anda terantuk dahan api unggun para Goblin! Api unggun tersenggol berantakan, membakar ujung celah zirah Anda! Kedua Goblin berputar arah secara instan dan memekik histeris mencabut senjata mereka melihat penyusup gila yang menari kepanikan! Anda menerima **3 Damage Kebakaran**!`;
        triggerCombat = true;
      } else {
        text += `Anda terpeleset batu licin dan terjatuh telentang menghantam tanah berbatu tajam dengan sangat memalukan! Punggung Anda terasa sangat ngilu terhantam zirah. Anda menerima **3 Damage Jatuh**!`;
      }
    }
    else if (rollTotal >= 11) {
      goldReward = 20;
      text = ` Anda melompat anggun di dekat **${nounDesc}** dan mengeksekusi tarian yang sangat dinamis! ${charName} sang ${raceTitle} ${classTitle} menampilkan kelenturan tubuh luar biasa.\n\n`;
      if (stage === "introduction") {
        text += `Gerakan lincah Anda membuat suasana tavern menghangat! Barnaby tertawa lebar dan memberikan Anda **20 Koin Emas (GP)** serta segelas ale gratis! "Pertunjukan yang sangat kreatif, kawan!"`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin kebingungan melihat gerakan aneh Anda, mengira Anda sedang merapalkan mantra kutukan dahsyat. Mereka gemetar ketakutan di pojokan, memberi Anda kesempatan emas untuk menyelinap ke belakang mereka dan mengambil peti besi!`;
        nextStage = "victory";
      } else {
        text += `Tarian ekspresif Anda berhasil menyamarkan derit langkah kaki Anda di lumpur basah hutan Whispering Woods, membuat Anda melangkah aman.`;
      }
    }
    else {
      newHp = Math.max(1, character.currentHp - 1);
      text = ` Gerakan tari Anda terasa sangat kaku dan canggung karena zirah besi berat Anda berderit berisik di dekat **${nounDesc}**.\n\n`;
      if (stage === "introduction") {
        text += `Beberapa petualang di meja pojok tavern melempar kulit kacang ke arah zirah Anda sambil bersiul mengejek. Anda terpeleset tipis menghantam siku meja bar kayu, menerima **1 damage** memar ringan. Sungguh penampilan sosial yang kurang mulus!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin merasa tersinggung dan terancam melihat kelakuan aneh Anda! Mereka melolong marah dan langsung mencabut belati mereka untuk menyerang!`;
        triggerCombat = true;
      } else {
        text += `Derit zirah Anda akibat jogetan canggung memicu suara berisik, membuat burung gagak raksasa di dahan mematuk pelipis Anda sebelum terbang pergi. (1 damage).`;
      }
    }
  }

  else if (actionType === "consume") {
    if (isNat20) {
      newHp = Math.min(character.hpMax + 10, character.currentHp + 15);
      text = `✨ **DAYA TAHAN ELEMENTAL BUMI!** Dengan keberanian mutlak, Anda memutuskan untuk memakan/meminum **${nounDesc}**!\n\n`;
      if (targetNoun === "ground") {
        text += `Sistem pencernaan Anda beresonansi selaras dengan energi tanah purba! Mineral mentah tanah basah tersebut secara ajaib berubah menjadi rasa cokelat panggang hangat yang sangat lezat di lidah Anda! Stamina Anda meledak hebat, memulihkan kesehatan penuh dan memberikan +10 temporary HP!`;
      } else {
        text += `Rasa hidangan tersebut bagaikan nektar para dewa! Tubuh Anda memancarkan pendar emas hangat, memulihkan seluruh luka fisik zirah secara instan dan memberikan +10 temporary HP!`;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 4);
      text = `💥 **BENCANA LAMBUNG!** Anda mencoba memakan/meminum **${nounDesc}** secara sembarangan.\n\n`;
      if (targetNoun === "ground") {
        text += `Pasir tajam menggores parah dinding gusi Anda, dan seekor cacing tanah yang hidup di dalam lumpur tersebut menggeliat-geliat di lidah Anda! Anda terbatuk-batuk hebat, memuntahkan cairan lambung, and merasa sangat mual lemas! Anda menerima **4 Damage Keracunan**!`;
      } else {
        text += `Anda tersedak sangat parah! Makanan tersebut tersumbat di kerongkongan Anda, membuat wajah Anda membiru kehabisan napas hingga Barnaby harus menghantam punggung Anda sekuat tenaga! Anda menerima **3 Damage Saluran Pernapasan**!`;
      }
    }
    else if (rollTotal >= 11) {
      newHp = Math.min(character.hpMax + 5, character.currentHp + 5);
      text = ` Anda menikmati **${nounDesc}** dengan mantap. Tubuh ${raceTitle} Anda menyerap nutrisi dengan baik.\n\n`;
      if (targetNoun === "ground") {
        text += `Anda mencicipi lumpur hutan untuk menganalisis jejak kaki Goblin klan Cragmaw. Rasa pahit tanah basah mengkonfirmasi bahwa area ini dipenuhi residu sihir beracun Goblin Shaman. Anda mendapatkan +5 temporary HP karena kekebalan racun alami Anda meningkat!`;
      } else {
        text += `Kehangatan ale madu Barnaby menjalar cepat, melarutkan lelah otot zirah Anda secara instan. Anda mendapatkan +5 temporary HP!`;
      }
    }
    else {
      newHp = Math.max(1, character.currentHp - 1);
      text = ` Anda mencoba memakan/meminum **${nounDesc}**...\n\n`;
      if (targetNoun === "ground") {
        text += `Rasa asin kotor berlumpur langsung memenuhi mulut Anda, membuat Anda terbatuk-batuk tersiksa. Perut Anda melilit perih, menerima **1 damage lambung** ringan. Sungguh eksperimen kuliner yang buruk!`;
      } else {
        text += `Ale terasa agak asam dan hambar karena sudah terlalu dingin terkena air hujan luar, membuat Anda sedikit kembung dan lesu.`;
      }
    }
  }

  else if (actionType === "acrobatics") {
    if (isNat20) {
      newHp = Math.min(character.hpMax + 5, character.currentHp + 5);
      text = `✨ **KELINCAHAN ANGIN MALAM!** Anda melakukan lompatan salto udara tiga kali putaran secara berturut-turut melewati **${nounDesc}** dengan sangat presisi!\n\n`;
      if (stage === "introduction") {
        text += `Anda mendarat mulus dengan satu kaki di atas gelas ale kuningan milik Barnaby tanpa menumpahkan setetes air ale pun! Seluruh tavern melotot tak percaya, lalu bersorak riuh rendah bagaikan melihat ksatria sirkus legendaris! Barnaby menyelipkan **50 GP** ke kantong Anda!`;
        goldReward = 50;
      } else if (stage === "ruins") {
        text += `Anda melompat setinggi 4 meter mencengkeram celah jendela gotik lantai dua kastil, bersalto anggun menghindari jaring duri halaman, and mendarat tanpa suara di dalam aula pertahanan dalam benteng!`;
        nextStage = "chamber";
      } else {
        text += `Gerakan salto Anda mendaratkan tubuh Anda tepat di depan peti besi tersembunyi berisi **50 GP**!`;
        goldReward = 50;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 3);
      text = `💥 **BENCANA AKROBATIK!** Anda mencoba melakukan lompatan salto lincah di dekat **${nounDesc}**.\n\n`;
      if (stage === "introduction") {
        text += `Namun dahi Anda menghantam lampu gantung kuningan tavern yang berat! *KLANGGG!* Anda jatuh pusing sejenak dengan rambut sedikit terbakar lilin di atas lantai berdebu! Pengunjung tertawa riuh. Anda menerima **3 Damage Benturan**!`;
      } else if (stage === "ruins") {
        text += `Pegangan Anda pada dinding luar yang licin terlepas! Anda jatuh meluncur bebas dari ketinggian 3 meter dan mendarat telentang menghantam batu halaman benteng yang tajam! Anda menerima **3 Damage Jatuh**!`;
      } else {
        text += `Anda terpeleset ranting pohon basah, kaki zirah Anda terkilir sangat menyakitkan! Anda menerima **3 Damage Cedera Kaki**!`;
      }
    }
    else if (rollTotal >= 11) {
      text = ` Anda melompati **${nounDesc}** dengan ketangkasan seorang ${classTitle} terlatih.\n\n`;
      if (stage === "introduction") {
        text += `Gerakan berguling Anda di atas meja sangat mulus tanpa menyenggol satu gelas pun, membuat pengunjung tavern mengangguk kagum.`;
      } else if (stage === "ruins") {
        text += `Anda berhasil memanjat dinding batu licin benteng secara tenang, menyusup masuk melewati jendela kaca gotik yang pecah langsung ke aula pertahanan Goblin!`;
        nextStage = "chamber";
      } else {
        text += `Lompatan lincah Anda berhasil menyeberangi genangan air lumpur hutan tanpa memicu cipratan suara berisik.`;
      }
    }
    else {
      newHp = Math.max(1, character.currentHp - 2);
      text = ` Lompatan Anda kurang bertenaga karena beratnya beban zirah Anda di dekat **${nounDesc}**.\n\n`;
      if (stage === "introduction") {
        text += `Lutut Anda terbentur keras pada sudut meja kayu bar yang kaku! Anda meringis kesakitan menahan lebam membiru, menerima **2 Damage Fisik**!`;
      } else if (stage === "ruins") {
        text += `Anda tergelincir jatuh dari dinding kastil, menghantam tong kayu tua hingga hancur berantakan menimbulkan suara gaduh! Anda menerima **2 Damage Fisik**!`;
      } else {
        text += `Anda terperosok ke dalam lubang tanah berlumpur setinggi lutut, membuat kaki zirah Anda basah kuyup and kotor.`;
      }
    }
  }

  else if (actionType === "bribe") {
    if (isNat20) {
      text = `✨ **DIPLOMASI KEMAKMURAN EMAS!** Anda melemparkan segenggam emas murni berkilau ke arah **${nounDesc}**.\n\n`;
      if (stage === "introduction") {
        text += `Barnaby begitu terpukau melihat koin emas Anda berkilau emas ilahi. Ia membisikkan seluruh rumor rahasia kastil, menyembunyikan gada besinya, and memberikan **[LOOT: Ramuan Penyembuh]** gratis sebagai bentuk penghormatan tinggi!`;
        lootItem = { id: "potion-healing", name: "Ramuan Penyembuh (Potion of Healing)", quantity: 1 };
      } else if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin klan Cragmaw melotot liar melihat koin emas murni berkilau! Mereka bersimpuh di lantai berdebu, menciumi ujung sepatu zirah Anda, dan membiarkan Anda menjarah seluruh bilik harta karun pusaka mereka tanpa menuntut upeti lebih lanjut! Kesuksesan finansial mutlak!`;
        nextStage = "victory";
      } else {
        text += `Roh-roh hutan menerima persembahan emas Anda, menyibak kabut kelabu Whispering Woods menunjukkan altar rahasia berisi ramuan pusaka!`;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 2);
      text = `💥 **BENCANA SUAP!** Anda mengeluarkan emas untuk menyogok **${nounDesc}**.\n\n`;
      if (stage === "chamber" || stage === "deal") {
        text += `Goblin Shaman melihat kantong emas Anda yang tebal dan memekik serak dengan penuh keserakahan! "Pahlawan kaya raya membawa peti hartanya sendiri! Bunuh dia, ambil seluruh emas di sakunya!" teriaknya memicu battle turn-based instan dengan kerugian posisi!`;
        triggerCombat = true;
      } else {
        text += `Kantong emas Anda tidak sengaja sobek saat dilempar, membuat koin emas Anda menggelinding jatuh berserakan ke sela ubin lantai/lumpur basah yang dalam! Anda kehilangan **15 GP** and pinggang Anda terkilir lecet memar saat mencoba memungutnya di kegelapan! (2 damage).`;
        goldDeduction = 15;
      }
    }
    else if (rollTotal >= 12) {
      text = ` Sogokan/perjanjian emas Anda di dekat **${nounDesc}** berjalan sangat mulus.\n\n`;
      if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin klan Cragmaw setuju berdamai! Shaman Goblin mengantongi upeti emas Anda dan membiarkan Anda membuka peti besi pusaka mereka dengan aman tanpa pertumpahan darah!`;
        nextStage = "victory";
        goldDeduction = 50;
      } else if (stage === "introduction") {
        text += `Barnaby tersenyum licik menerima tips emas Anda, menyelipkan botol ramuan penyembuh ke saku Anda sebagai bonus rasa terima kasih!`;
        lootItem = { id: "potion-healing", name: "Ramuan Penyembuh (Potion of Healing)", quantity: 1 };
        goldDeduction = 10;
      } else {
        text += `Anda melemparkan koin untuk mengalihkan perhatian patroli hutan secara cerdas.`;
      }
    }
    else {
      text = ` Percobaan sogokan/perjanjian emas Anda di dekat **${nounDesc}** ditolak mentah-mentah!\n\n`;
      if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin menganggap emas yang Anda sodorkan terlalu sedikit! Mereka melotot marah and melolong meluncurkan serangan belati mematikan! Bersiaplah bertarung turn-based!`;
        triggerCombat = true;
      } else {
        text += `Barnaby mengerutkan kening tersinggung. "Simpan koin kotormu, petualang. Aku menolong karena kehormatan, bukan suap!" ketusnya membuang muka dingin.`;
      }
    }
  }

  else if (actionType === "smash") {
    if (isNat20) {
      text = `✨ **HANTAMAN KOSMIS PENGHANCUR BAJA!** Anda meluncurkan pukulan/hantaman dahsyat tepat sasaran ke **${nounDesc}**!\n\n`;
      if (stage === "ruins") {
        text += `*BOOOOMMMMM!!!* Pintu gerbang jati berlapis besi setebal 30 cm hancur lebur berkeping-keping menjadi abu kayu kuno beterbangan! Rantai baja pengikat terputus berkeping-keping bagaikan benang tipis! Fondasi kastil berguncang hebat akibat gelombang kejut hantaman Anda.\n\nDi balik gerbang, Anda menemukan zirah legendaris ksatria terdahulu: **[LOOT: Zirah Sisik Naga (Scale Mail of Resistance)]** berkilau merah hangat!\n\nAnda melangkah masuk aula pertahanan Goblin dengan sangat gagah!`;
        lootItem = { id: "scale-mail-resistance", name: "Zirah Sisik Naga (Scale Mail of Resistance)", quantity: 1 };
        nextStage = "chamber";
      } else if (stage === "introduction") {
        text += `Anda menghantam tiang kayu bar dengan gaya pahlawan. Tiang tersebut bergetar mengeluarkan pendaran cahaya magis, membuat sebuah botol penyembuh dari rak atas jatuh mulus ke pelukan Anda! Bartender Barnaby ternganga ketakutan melihat kekuatan fisik raksasa Anda!`;
        lootItem = { id: "potion-healing", name: "Ramuan Penyembuh (Potion of Healing)", quantity: 1 };
      } else {
        text += `Hantaman perusak Anda menghancurkan rintangan batu, memperlihatkan peti harta karun tersembunyi berisi **50 GP** berkilauan!`;
        goldReward = 50;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 4);
      text = `💥 **BENCANA HANTAMAN FISIK!** Anda melepaskan hantaman kekuatan penuh ke arah **${nounDesc}**.\n\n`;
      if (stage === "ruins") {
        text += `Namun kaki Anda terpeleset lumut licin saat melompat! Tubuh Anda terpelanting horizontal menghantam pilar besi berkarat dengan suara dentingan sangat keras: *KRAANGGGGG!* \n\nZirah bahu Anda penyok hebat menekan tulang belikat Anda, and persendian bahu Anda bergeser memar! Anda menerima **4 Damage Cedera Bahu**! Gerbang kastil tetap kokoh tak bergeming sedikit pun!`;
      } else {
        text += `Hantaman Anda meleset dan mengenai sudut runcing batuan/meja bar yang super keras! Jari-jari tangan Anda berderit patah memar hebat and zirah tangan Anda retak! Anda berteriak menahan sakit, menerima **3 Damage Fisik**!`;
      }
    }
    else if (rollTotal >= 12) {
      text = ` Hantaman fisik bertenaga Anda ke **${nounDesc}** membuahkan kesuksesan mutlak.\n\n`;
      if (stage === "ruins") {
        text += `*BRAAAKKKK!!!* Pintu gerbang kayu jati berlapis besi halaman benteng hancur terbelah dua! Rantai pengunci terputus memercikkan bara api merah, membuka jalan masuk lurus bagi Anda menuju aula pertahanan Goblin!`;
        nextStage = "chamber";
      } else if (stage === "introduction") {
        text += `Hantaman telapak tangan Anda ke bar membuat Barnaby terkejut, namun ia tersenyum melihat otot ksatria Anda. "Kekuatan yang luar biasa, pahlawan!" serunya menyuguhkan hidangan.`;
      } else {
        text += `Rintangan batu berhasil Anda remukkan hingga hancur berantakan, membuka rute jalan setapak baru.`;
      }
    }
    else {
      newHp = Math.max(1, character.currentHp - 2);
      text = ` Anda mencoba menggeram and menghantamkan seluruh tenaga ke **${nounDesc}**...\n\n`;
      if (stage === "ruins") {
        text += `Namun gerbang tersebut terlalu kokoh. Hantaman Anda memantul balik mengirimkan gelombang ngilu ke persendian bahu Anda! Otot dada Anda memar hebat, menerima **2 Damage Fisik**!`;
      } else {
        text += `Hantaman Anda meleset meleset mengenai lumpur licin/ubin dingin, membuat Anda terjatuh berguling kotor menerima **1 damage memar**.`;
      }
    }
  }

  else if (actionType === "talk" || actionType === "investigate") {
    if (isNat20) {
      goldReward = 30;
      text = `✨ **INTUISI TAJAM PARA DEWA D&D!** Anda mendekati **${nounDesc}** untuk menyelidiki dan berbicara secara mendalam.\n\n`;
      if (stage === "introduction") {
        text += `Barnaby dan Elian terpesona melihat wibawa sosial dan ketajaman deduksi Anda! Elian memberikan **Peta Scout Kastil Cragmaw** rahasia secara sukarela, and Barnaby menyelinapkan **Ramuan Penyembuh** serta **30 GP** ke saku Anda! "Semoga para dewa menyertai pedangmu, legenda!"`;
        lootItem = { id: "scouts-map", name: "Peta Scout Kastil Cragmaw", quantity: 1 };
      } else if (stage === "chamber" || stage === "deal") {
        text += `Anda menganalisis ketakutan psikologis para Goblin dan membujuk mereka dengan dialek kuno yang begitu indah! Goblin Shaman menangis haru mendengar kesopanan Anda, menyerahkan kunci emas peti pusaka mereka tanpa meminta koin sepeser pun!`;
        nextStage = "victory";
      } else {
        text += `Anda mendeteksi jejak rahasia druid kuno di lumpur basah hutan, menemukan altar berlumut berisi peti besi kuno pusaka berisi **30 GP**!`;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 2);
      text = `💥 **BENCANA INTERAKSI SOSIAL!** Anda berupaya menyelidiki/berbicara di dekat **${nounDesc}**.\n\n`;
      if (stage === "introduction") {
        text += `Kata-kata Anda tersendat konyol, and Anda tidak sengaja bersin keras tepat di depan wajah Barnaby yang bersih! Barnaby memerah tersinggung and menyuruh Anda melangkah keluar tavern dengan dingin tanpa memberi rumor sepeser pun. Anda terantuk tiang pintu keluar menerima **2 damage lebam**!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Bahasa Goblin Anda terdengar seperti caci maki kotor bagi telinga mereka! Goblin Shaman berteriak murka menudingkan tongkat tulang tulangnya! "Penyusup sombong ini berani mengejek kita! Bantai dia!" teriaknya memicu battle turn-based!`;
        triggerCombat = true;
      } else {
        text += `Anda terlalu fokus melotot ke lumut hutan hingga tidak menyadari adanya lubang sarang semut api merah tepat di bawah sepatu Anda! Kaki Anda diserbu gigitan gatal menyengat, menerima **2 Damage Sengatan**!`;
      }
    }
    else if (rollTotal >= 11) {
      text = ` Penyelidikan/interaksi lisan Anda di dekat **${nounDesc}** membuahkan hasil jeli.\n\n`;
      if (stage === "introduction") {
        if (playerMessage.includes("elian") || playerMessage.includes("tudung") || playerMessage.includes("pojok")) {
          text += `Elian mendongak lambat menatap Anda. "Namaku Elian," bisiknya. "Aku menggambar celah dinding rahasia sisi barat benteng Cragmaw yang tertutup semak berduri. Gunakan celah ini untuk menyelinap masuk secara aman!" ia menyerahkan **Peta Scout Kastil Cragmaw**!`;
          lootItem = { id: "scouts-map", name: "Peta Scout Kastil Cragmaw", quantity: 1 };
        } else {
          text += `Barnaby membisikkan rumor: "Kastil Cragmaw di utara hutan dikuasai Bugbear raksasa Raja Grol! Berhati-hatilah, mereka menyembunyikan **Flame Tongue**, pedang legendaris pusaka api!" Barnaby memberi **Ramuan Penyembuh** gratis!`;
          lootItem = { id: "potion-healing", name: "Ramuan Penyembuh (Potion of Healing)", quantity: 1 };
        }
      } else if (stage === "ruins") {
        text += `Anda berhasil melacak retakan dinding barat benteng yang ditutupi oleh tanaman ivy berduri tebal. Anda menyibak tanaman berduri and menemukan celah masuk aman langsung ke aula dalam kastil!`;
        nextStage = "chamber";
      } else if (stage === "chamber" || stage === "deal") {
        text += `Dialek Goblin Anda membuat mereka setuju bernegosiasi damai demi upeti 50 koin emas.`;
        nextStage = "deal";
      } else {
        text += `Jejak kaki klan Goblin di lumpur basah hutan Whispering Woods terlihat jelas mengarah lurus ke utara menuju bukit batu kastil.`;
      }
    }
    else {
      text = ` Anda mencoba menyelidiki/berbicara di dekat **${nounDesc}**...\n\n`;
      if (stage === "introduction") {
        text += `Barnaby mengangkat bahunya dingin. "Maaf kawan, aku terlalu sibuk menyeka cangkir ini untuk mengobrol rumor. Belilah makanan hangat jika lapar."`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Gaya bicara Anda terlalu mencurigakan! Goblins mengacungkan senjata melolong marah! Battle turn-based terpicu!`;
        triggerCombat = true;
      } else {
        text += `Kabut hutan purba Whispering Woods berputar sangat pekat, menutupi pandangan mata and menyamarkan segala tanda jejak. Anda tersesat tanpa petunjuk.`;
      }
    }
  }

  else if (actionType === "stealth") {
    if (isNat20) {
      text = `✨ **KEHENINGAN SILUMAN BAYANGAN!** Anda menyelinap melintasi **${nounDesc}** dengan kesunyian mutlak!\n\n`;
      if (stage === "chamber") {
        text += `Anda meluncur bagaikan embusan angin hantu berdebu melewati kedua Goblin yang sedang asyik memanggang tikus. Dengan satu sentuhan terampil kawat pembuka kunci... *KLIK!* Peti besi pusaka kuno terbuka tanpa suara! Anda meraup habis isinya, melompat keluar benteng dengan selamat!\n\n🏆 **Kemenangan Senyap Legendaris Rogue**:\n- Anda menjarah: **[LOOT: Pedang Naga Api (Flame Tongue)]** legendaris berselimut bara api!\n- Anda menjarah: **[LOOT: Kantong Emas Kastil (150 GP)]**!`;
        nextStage = "victory";
        lootItem = { id: "loot-flame-tongue", name: "Pedang Naga Api (Flame Tongue)", quantity: 1 };
        goldReward = 150;
      } else {
        text += `Langkah bayangan Anda begitu sempurna hingga burung hantu hutan yang bertengger di dahan tidak bergeming sedikit pun melihat pergerakan Anda. Anda menemukan kotak perbekalan tua berisi **50 GP**!`;
        goldReward = 50;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 2);
      text = `💥 **BENCANA SILUMAN KONYOL!** Anda berupaya mengendap-endap di dekat **${nounDesc}** secara senyap.\n\n`;
      if (stage === "chamber") {
        text += `Namun tumit zirah besi Anda menabrak mangkuk besi berkarat di lantai berdebu! *PRANGGGG!* Suara dentingan nyaring memantul keras di dinding aula! Kedua Goblin berputar arah secara instan dan menangkap basah Anda sedang membungkuk di depan peti pusaka mereka! "Pencuri licik mencoba menjarah kita! Bunuh dia!" teriak Goblin Shaman memicu battle!`;
        triggerCombat = true;
      } else {
        text += `Anda terperosok ke dalam sarang ranting kering basah! *KRAAAK!* Anda terkejut and terjatuh berguling menabrak semak berduri tajam halaman kastil, menerima **2 Damage Duri**!`;
      }
    }
    else if (rollTotal >= 13) {
      text = ` Langkah senyap Anda di dekat **${nounDesc}** berjalan sangat mulus.\n\n`;
      if (stage === "chamber") {
        text += `Para Goblin sibuk memperebutkan potongan tikus bakar terkecil. Anda menyelinap di belakang peti besi raksasa kuno, membuka gemboknya dengan Thieves' Tools... *KLIK!* Anda meraup habis hartanya and menyelinap keluar selamat!\n\n🏆 **Kemenangan Senyap Rogue**:\n- Anda memperoleh: **[LOOT: Pedang Naga Api (Flame Tongue)]**!\n- Anda memperoleh: **[LOOT: Kantong Emas Kastil (150 GP)]**!`;
        nextStage = "victory";
        lootItem = { id: "loot-flame-tongue", name: "Pedang Naga Api (Flame Tongue)", quantity: 1 };
        goldReward = 150;
      } else {
        text += `Anda meluncur mulus melewati area bayang pilar benteng luar tanpa memicu alarm penjaga kastil sedikit pun.`;
      }
    }
    else {
      text = ` Langkah senyap Anda di dekat **${nounDesc}** gagal menyembunyikan getaran zirah Anda!\n\n`;
      if (stage === "chamber") {
        text += `Gemerincing tali pengencang zirah Anda memecah kesunyian ruangan! Kedua Goblin berputar arah menangkap basah wujud Anda! "Penyusup pencuri! Seranggg!" teriak Shaman memicu battle turn-based!`;
        triggerCombat = true;
      } else {
        text += `Anda terpeleset batu halaman kastil basah, menimbulkan suara berisik yang memancing kedatangan burung pemakan bangkai.`;
      }
    }
  }

  else if (actionType === "attack") {
    text = `⚔️ [PERSIAPAN SERANGAN FRONTAL!]\n\nAnda menghunus senjata andalan Anda secara garang di dekat **${nounDesc}**, melepaskan pekikan perang yang menantang maut!\n\n`;
    if (stage === "chamber" || stage === "deal") {
      text += `Kedua Goblin Cragmaw terlonjak kaget setengah mati! Api unggun memanggang tikus mereka tersenggol berantakan memercikkan bara bara merah, and mereka menjerit histeris menyambar tameng kayu dan belati mereka! \n\nSistem Pertarungan Turn-Based D&D kini telah aktif! Pion monster telah muncul di Battle Grid berpiksel retro di sebelah kiri Anda. Gunakan Player HUD di bawah untuk memilih serangan senjata, mantra magis, atau bonus action D&D!`;
      triggerCombat = true;
    } else {
      text += `Anda menebaskan pedang Anda ke udara membelah dahan pohon rimbun Whispering Woods untuk membuka jalan, menunjukkan kesiapan tempur mutlak menghadapi sarang iblis di utara!`;
    }
  }

  else if (actionType === "leave") {
    text = ` Anda memutuskan melangkah meninggalkan **${nounDesc}** untuk melanjutkan perjalanan berbahaya...\n\n`;
    if (stage === "introduction") {
      text += `Anda merapatkan jubah wol tebal Anda, mendorong pintu kayu ek Tavern "The Gilded Flagon" yang berat dan melangkah keluar menuju kabut kelabu Whispering Woods di utara hutan.\n\n🗺️ **PETA DIREPLIKA**: Denah Hutan Berbisik berpiksel retro dimuat di VTT!`;
      nextStage = "wilderness";
    } else if (stage === "wilderness") {
      text += `Anda melangkah keluar menembus pekatnya ujung Hutan Berbisik yang basah, tiba di hadapan Kastil Cragmaw yang angkuh di atas bukit batu terjal!\n\n🗺️ **PETA DIREPLIKA**: Denah Halaman Depan Kastil Cragmaw berpiksel retro dimuat!`;
      nextStage = "ruins";
    } else if (stage === "ruins") {
      text += `Anda merangkak masuk menembus celah fondasi dinding batu luar, menyusup lurus langsung ke dalam Aula Pertahanan Goblin (Goblin Outpost Chamber) yang temaram!\n\n🗺️ **PETA DIREPLIKA**: Denah Aula Pertahanan Goblin piksel retro dimuat!`;
      nextStage = "chamber";
    } else {
      text += `Anda berjalan mantap mengamati tumpukan koin emas di bilik harta karun pusaka kastil yang legendaris.`;
    }
  }

  else {
    // COMPLETE FALLBACK: The AI DM ALWAYS responds to any player input, never ignores it
    if (isNat20) {
      goldReward = 40;
      newHp = Math.min(character.hpMax + 5, character.currentHp + 5);
      text = `✨ **KEBERHASILAN SANDBOX LEGENDA D&D!**\n\n*Dungeon Master merespon: "${playerMessage}"*\n\nAlam semesta D&D mendengar keinginan ${charName}! Dengan ketangkasan dan karisma seorang ${raceTitle} ${classTitle} sejati, Anda berhasil mengeksekusi manuver unik tersebut dengan sempurna!\n\n`;
      if (stage === "introduction") {
        text += `Seluruh penghuni Tavern Gilded Flagon terpana menyaksikan ulah kreatif Anda. Barnaby tertawa terpingkal, lalu diam-diam menyodorkan sekantung **40 GP** sambil berbisik: *"Kau adalah petualang paling aneh sekaligus paling menghibur yang pernah menginjakkan kaki di tavernku."* Anda mendapat +5 HP sementara dari semangat yang meluap!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin Cragmaw melotot bingung, lalu saling berpandangan aneh. Kepala Shaman Goblin miring 90 derajat penasaran. Mereka begitu bingung menyaksikan ulah Anda hingga lupa bertempur, dan Anda berhasil menyelinap ke peti besi pusaka mereka, meraup **40 GP**!`;
      } else {
        text += `Makhluk-makhluk hutan Whispering Woods terpana melihat aksi unik Anda. Semesta merestui keberanian kreatif Anda dengan membuka jalan rahasia dan memberikan sekantung emas tersembunyi berisi **40 GP**!`;
      }
    }
    else if (isNat1) {
      newHp = Math.max(1, character.currentHp - 3);
      text = `💥 **BENCANA SANDBOX KONYOL!**\n\n*Dungeon Master merespon: "${playerMessage}"*\n\nNamun Nasib menolak keras manuver aneh Anda! `;
      if (stage === "introduction") {
        text += `Anda terpeleset licin, kaki Anda menabrak tiang zirah kayu keras dengan suara dentuman memalukan! Zirah lutut Anda lecet memar dan kantong perbekalan Anda sobek berantakan!\n\n💥 Anda menerima **3 Damage**!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Aksi canggung Anda menimbulkan kegaduhan! Goblin Shaman menunjuk ke arah Anda sambil menjerit: *"Penyusup gila! Bunuh dia!"* Battle terpicu!\n\n💥 Anda menerima **3 Damage Awal**!`;
        triggerCombat = true;
      } else {
        text += `Hukum karma D&D menolak keras manuver aneh Anda! Anda menerima **3 Damage** dan satu tanda tanya dari semesta.`;
      }
    }
    else if (rollTotal >= 11) {
      goldReward = 15;
      text = `🎲 **IMPROVISASI BERHASIL!**\n\n*Dungeon Master merespon: "${playerMessage}"*\n\n${charName} berhasil mengeksekusi aksi tersebut dengan percaya diri! `;
      if (stage === "introduction") {
        text += `Barnaby si bartender mengangguk dengan ekspresi campur aduk antara kagum dan bingung. *"Sungguh... unik. Menghibur, memang."* Ia melempar **15 GP** ke arah Anda sebagai apresiasi atas kreativitas tidak terduga Anda!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Para Goblin berpandangan heran satu sama lain, lalu menggelengkan kepala bingung. Kebingungan mereka memberikan Anda celah untuk bergerak bebas sejenak di ruangan ini.`;
      } else {
        text += `Alam semesta Whispering Woods merespons aksi Anda dengan angin sepoi positif. Anda menemukan **15 GP** di saku petualang yang tergeletak di tepi jalan.`;
      }
    }
    else {
      newHp = Math.max(1, character.currentHp - 2);
      text = `🎲 **AKSI DITERIMA - TAPI TIDAK BERHASIL**\n\n*Dungeon Master merespon: "${playerMessage}"*\n\n${charName} mencoba melakukan hal tersebut... namun nasib kurang berpihak saat ini. `;
      if (stage === "introduction") {
        text += `Barnaby mengangkat satu alis dengan ekspresi tidak terkesan. *"Hmm. Menarik... tapi tidak cukup untuk membuatku terkesan, petualang."* Anda terpeleset sedikit dan siku Anda membentur sudut bar kayu yang keras. Anda menerima **2 damage memar**!`;
      } else if (stage === "chamber" || stage === "deal") {
        text += `Gaya Anda terlalu janggal. Para Goblin melotot curiga dan mencabut senjata mereka! Battle terpicu!\n\n💥 Anda menerima **2 Damage Awal** dari serangan pendahuluan Goblin!`;
        triggerCombat = true;
      } else {
        text += `Hutan Whispering Woods tidak merespons baik terhadap aksi Anda. Anda tersandung akar pohon dan memar di lutut. **(2 damage)**`;
      }
    }
  }

  return { text, nextStage, newHp, lootItem, goldReward, goldDeduction, triggerCombat };
}

export async function processSoloStoryAction(campaignId: string, playerMessage: string) {
  try {
    await connectDB();
    const campaign = await Campaign.findById(campaignId).populate('characters');
    if (!campaign) return { success: false, error: "Campaign tidak ditemukan" };

    const character = campaign.characters[0] as any;
    if (!character) return { success: false, error: "Karakter tidak ditemukan di campaign ini" };

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: LOAD PERSISTENT STORY STATE
    // ═══════════════════════════════════════════════════════════════
    let storyState: any = {
      stage: "introduction",
      goldLooted: false,
      elianMet: false,
      goblinBribery: 0,
      weirdActionsCount: 0,
      criticalSuccesses: 0,
      criticalFailures: 0,
      hasLootedFlame: false,
      hasLootedPotion: false,
      hasBefriendedBarnaby: false,
      scoutMapGiven: false,
      turnCount: 0
    };

    const descParts = campaign.description.split(" | ");
    try {
      const parsed = JSON.parse(descParts[0]);
      storyState = { ...storyState, ...parsed };
    } catch (e) { /* use defaults */ }

    let stage = storyState.stage || "introduction";
    storyState.turnCount = (storyState.turnCount || 0) + 1;

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: ROLL D20 + DETERMINE STAT
    // ═══════════════════════════════════════════════════════════════
    const getMod = (val: number) => Math.floor((val - 10) / 2);
    const strMod = getMod(character.stats?.STR || 10);
    const dexMod = getMod(character.stats?.DEX || 10);
    const conMod = getMod(character.stats?.CON || 10);
    const intMod = getMod(character.stats?.INT || 10);
    const wisMod = getMod(character.stats?.WIS || 10);
    const chaMod = getMod(character.stats?.CHA || 10);

    const cleanMsg = playerMessage.toLowerCase().trim();

    // Determine which stat to use based on action keywords
    let chosenStat = "DEX";
    let chosenMod = dexMod;

    if (/\b(dobrak|pukul|tendang|hancur|hantam|tinju|hajar|serang|serbu|tebas|tusuk|fight|attack)\b/.test(cleanMsg)) {
      chosenStat = "STR"; chosenMod = strMod;
    } else if (/\b(makan|minum|telan|konsumsi|bertahan|tahan|kebal)\b/.test(cleanMsg)) {
      chosenStat = "CON"; chosenMod = conMod;
    } else if (/\b(bicara|tanya|bujuk|rayu|negosiasi|tipu|goda|seduce|damai|diplomasi|omong|cerita|bernyanyi|menari|joget|koplo|dansa)\b/.test(cleanMsg)) {
      chosenStat = "CHA"; chosenMod = chaMod;
    } else if (/\b(selidik|periksa|analisis|lacak|cari|baca|deteksi|jejak|pelajari|investigasi|amati)\b/.test(cleanMsg)) {
      chosenStat = "INT"; chosenMod = intMod;
    } else if (/\b(persepsi|dengar|lihat|nonton|waspadai|intai|jaga|pantau)\b/.test(cleanMsg)) {
      chosenStat = "WIS"; chosenMod = wisMod;
    } else if (/\b(selinap|sembunyi|senyap|ngendap|merayap|menyusup|akrobat|salto|lompat|panjat|loncat)\b/.test(cleanMsg)) {
      chosenStat = "DEX"; chosenMod = dexMod;
    } else {
      // Use character's best stat to reward creative play
      const allMods = [
        { stat: "STR", mod: strMod }, { stat: "DEX", mod: dexMod },
        { stat: "CON", mod: conMod }, { stat: "INT", mod: intMod },
        { stat: "WIS", mod: wisMod }, { stat: "CHA", mod: chaMod }
      ].sort((a, b) => b.mod - a.mod);
      chosenStat = allMods[0].stat;
      chosenMod = allMods[0].mod;
    }

    const rawRoll = Math.floor(Math.random() * 20) + 1;
    const totalRoll = rawRoll + chosenMod;
    const modStr = chosenMod >= 0 ? `+${chosenMod}` : `${chosenMod}`;

    if (rawRoll === 20) storyState.criticalSuccesses = (storyState.criticalSuccesses || 0) + 1;
    if (rawRoll === 1) storyState.criticalFailures = (storyState.criticalFailures || 0) + 1;

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: EXTRACT LAST 8 MESSAGES AS CONVERSATION MEMORY
    // ═══════════════════════════════════════════════════════════════
    const recentMessages: string[] = (campaign.chatMessages || [])
      .slice(-8)
      .filter((m: any) => !m.text.includes("AI Dungeon Master sedang")) // Skip thinking indicators
      .map((m: any) => `[${m.senderName}]: ${m.text.substring(0, 200)}`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: BUILD DICE HEADER
    // ═══════════════════════════════════════════════════════════════
    const rollHeader = `\n🎲 **[Dadu D20: ${rawRoll} ${modStr} (${chosenStat}) = ${totalRoll}]**\n\n`;

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: CALL GEMINI AI (Primary engine)
    // ═══════════════════════════════════════════════════════════════
    const systemPrompt = buildDMSystemPrompt(
      character, storyState, recentMessages, rawRoll, totalRoll, chosenStat, chosenMod
    );

    let dmNarrativeRaw: string | null = null;
    let usedGemini = false;

    try {
      dmNarrativeRaw = await callGeminiDM(systemPrompt, playerMessage);
      if (dmNarrativeRaw) usedGemini = true;
    } catch (e) {
      console.warn("[AI DM] Gemini call failed, falling back to DNIE:", e);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: PARSE GEMINI RESPONSE or RUN DNIE FALLBACK
    // ═══════════════════════════════════════════════════════════════
    let replyText = "";
    let nextStage = stage;
    let hpDelta = 0;
    let goldDelta = 0;
    let triggerCombat = false;
    let lootItem: any = null;
    let aiCustomMap: string | null = null;
    let aiWeather: string | null = null;

    if (usedGemini && dmNarrativeRaw) {
      // === GEMINI PATH ===
      const parsed = parseGeminiMetadata(dmNarrativeRaw);
      replyText = rollHeader + parsed.cleanText;
      aiCustomMap = parsed.customMap || null;
      aiWeather = parsed.weather || null;

      // Validate and apply nextStage from AI (only allow forward progression)
      const validStages = ["introduction", "wilderness", "ruins", "chamber", "deal", "combat", "victory"];
      const aiStage = parsed.nextStage;
      const currentIdx = validStages.indexOf(stage);
      const aiIdx = aiStage ? validStages.indexOf(aiStage) : -1;
      if (aiIdx >= currentIdx && aiIdx !== -1) {
        nextStage = aiStage!;
      }

      hpDelta = parsed.hpDelta || 0;
      goldDelta = parsed.goldDelta || 0;
      triggerCombat = parsed.triggerCombat || false;
      lootItem = parsed.lootItem || null;

      // Safety clamp: don't heal above max or kill below 1
      const currentHp = character.currentHp || character.hpMax;
      const newHpFromGemini = Math.max(1, Math.min(character.hpMax + 10, currentHp + hpDelta));
      if (hpDelta !== 0 && newHpFromGemini !== currentHp) {
        await updateCharacterHpAction(character._id, newHpFromGemini);
      }

      if (goldDelta > 0) {
        await updateSharedGoldAction(campaign._id, goldDelta);
      } else if (goldDelta < 0) {
        await updateSharedGoldAction(campaign._id, goldDelta); // negative = deduct
        await Character.findByIdAndUpdate(character._id, { $inc: { "currency.gp": goldDelta } });
      }

    } else {
      // === DNIE FALLBACK PATH ===
      // Determine actionType and targetNoun from keywords
      let actionType = "fallback";
      let targetNoun = "lingkungan sekitar";

      if (/\b(menari|joget|dansa|koplo|goyang|bersiul|tari|berjoget|shuffle|bergoyang)\b/.test(cleanMsg)) actionType = "dance";
      else if (/\b(makan|minum|ale|bir|susu|roti|kentang|telan|tenggak|gigit|kunyah|lumpur|tanah|konsumsi|cicipi|teguk)\b/.test(cleanMsg)) actionType = "consume";
      else if (/\b(salto|lompat|guling|backflip|panjat|gelantungan|akrobat|berguling|jungkir|koprol|terjun|melompat|memanjat|loncat)\b/.test(cleanMsg)) actionType = "acrobatics";
      else if (/\b(sogok|bayar|koin|emas|upeti|gp|tips|beli|sogokan|uang|suap|menawarkan|kasih uang)\b/.test(cleanMsg)) actionType = "bribe";
      else if (/\b(dobrak|pukul|tendang|hancur|remuk|hantam|merusak|tinju|dorong|tabrak|gebuk|hajar|banting|menghancurkan|menghantam)\b/.test(cleanMsg)) actionType = "smash";
      else if (/\b(bicara|tanya|sapa|halo|obrol|negosiasi|damai|bujuk|rayu|katakan|ucap|ngobrol|bertanya|omong)\b/.test(cleanMsg)) actionType = "talk";
      else if (/\b(selidik|periksa|lihat|amati|cari|baca|deteksi|lacak|jejak|analisis|melihat|mencari|memeriksa|menyelidiki)\b/.test(cleanMsg)) actionType = "investigate";
      else if (/\b(selinap|sembunyi|senyap|pelan|ngendap|merayap|menyusup|merangkak|menyelinap|bersembunyi|diam-diam)\b/.test(cleanMsg)) actionType = "stealth";
      else if (/\b(serang|serbu|bunuh|tebas|tusuk|panah|tembak|spell|mantra|sihir|lawan|tarung|hajar|hunus|menyerang|fight|attack)\b/.test(cleanMsg)) actionType = "attack";
      else if (/\b(istirahat|tidur|meditasi|berdoa|merenung|relaks)\b/.test(cleanMsg)) { actionType = "investigate"; targetNoun = "diri sendiri"; }
      else if (/\b(pergi|keluar|jalan|hutan|kastil|berangkat|tinggalkan|maju|melangkah|berjalan|bergerak|menuju|masuk|berlari|lari)\b/.test(cleanMsg)) actionType = "leave";

      if (/\b(meja|kursi|bar|tiang|dinding|lantai|ubin|cangkir|gelas|panci|bangku)\b/.test(cleanMsg)) targetNoun = "furniture";
      else if (/\b(tanah|lumpur|pasir|batu|kerikil|rumput|altar|debu)\b/.test(cleanMsg)) targetNoun = "ground";
      else if (/\b(barnaby|bartender|pelayan|kasir|pemilik)\b/.test(cleanMsg)) targetNoun = "bartender";
      else if (/\b(elian|tudung|jubah|orang misterius|pojok|scout|sosok gelap)\b/.test(cleanMsg)) targetNoun = "elian";
      else if (/\b(peti|kotak|gembok|harta|pusaka|kunci|peti besi)\b/.test(cleanMsg)) targetNoun = "vault";
      else if (/\b(goblin|musuh|shaman|grol|raksasa|monster)\b/.test(cleanMsg)) targetNoun = "goblin";
      else if (/\b(gerbang|pintu|tembok|pagar|rantai|portal)\b/.test(cleanMsg)) targetNoun = "gate";
      else if (/\b(hutan|pohon|semak|dahan|ranting|kabut|angin|akar|daun)\b/.test(cleanMsg)) targetNoun = "forest";

      const dnieResult = generateImprovisedNarrative(
        playerMessage, actionType, targetNoun, rawRoll, totalRoll,
        chosenStat, stage, character, storyState
      );

      replyText = rollHeader + dnieResult.text;
      nextStage = dnieResult.nextStage;
      triggerCombat = dnieResult.triggerCombat;
      lootItem = dnieResult.lootItem;

      const hpChange = dnieResult.newHp - (character.currentHp || character.hpMax);
      hpDelta = hpChange;

      if (hpChange !== 0) {
        await updateCharacterHpAction(character._id, dnieResult.newHp);
      }
      if (dnieResult.goldReward > 0) {
        goldDelta = dnieResult.goldReward;
        await updateSharedGoldAction(campaign._id, dnieResult.goldReward);
      }
      if (dnieResult.goldDeduction > 0) {
        goldDelta = -dnieResult.goldDeduction;
        await updateSharedGoldAction(campaign._id, -dnieResult.goldDeduction);
        await Character.findByIdAndUpdate(character._id, { $inc: { "currency.gp": -dnieResult.goldDeduction } });
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: UPDATE STORY STATE
    // ═══════════════════════════════════════════════════════════════
    storyState.stage = nextStage;

    // Handle loot
    if (lootItem) {
      if (!campaign.sharedInventory) campaign.sharedInventory = { items: [], gold: 0 };
      const alreadyHas = campaign.sharedInventory.items?.some((it: any) => it.id === lootItem.id);
      if (!alreadyHas) {
        campaign.sharedInventory.items.push(lootItem);
        if (!usedGemini) {
          replyText += `\n\n🎒 **[LOOT DITEMUKAN]** Anda mendapatkan: **${lootItem.name}**!`;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: TRIGGER COMBAT if needed
    // ═══════════════════════════════════════════════════════════════
    if (triggerCombat && !campaign.combatState?.isActive) {
      const playerInit = rawRoll + dexMod;
      const goblin1Init = Math.floor(Math.random() * 20) + 1 + 2;
      const goblin2Init = Math.floor(Math.random() * 20) + 1 + 1;
      const playerHp = character.currentHp || character.hpMax;

      campaign.combatState = {
        isActive: true,
        round: 1,
        turnIndex: 0,
        participants: [
          { id: character._id.toString(), name: character.name, initiative: playerInit, hp: playerHp, maxHp: character.hpMax, ac: character.armorClass || 10, action: 1, bonusAction: 1, reaction: 1, speed: character.speed || 30, isMonster: false },
          { id: "monster-goblin-1", name: "Goblin Scout", initiative: goblin1Init, hp: 12, maxHp: 12, ac: 13, action: 1, bonusAction: 1, reaction: 1, speed: 30, isMonster: true },
          { id: "monster-goblin-2", name: "Goblin Shaman", initiative: goblin2Init, hp: 9, maxHp: 9, ac: 11, action: 1, bonusAction: 1, reaction: 1, speed: 30, isMonster: true }
        ].sort((a, b) => b.initiative - a.initiative)
      };

      campaign.gridState = {
        bgUrl: "/images/pixel_dungeon_map.png",
        weather: "embers",
        tokens: [
          { id: character._id.toString(), name: character.name, x: 150, y: 200, img: character.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${character.name}`, isMonster: false },
          { id: "monster-goblin-1", name: "Goblin Scout", x: 400, y: 350, img: "https://img.itch.zone/aW1nLzEyNjg3NTMyLnBuZw==/315x250%23c/46wZbg.png", isMonster: true },
          { id: "monster-goblin-2", name: "Goblin Shaman", x: 550, y: 450, img: "https://img.itch.zone/aW1nLzEzMDMyMTcwLnBuZw==/315x250%23c/qDq74X.png", isMonster: true }
        ]
      };
      campaign.audioState = "combat";
      storyState.stage = "combat";
      nextStage = "combat";
    }

    // Update map based on stage transitions and AI preferences
    const mapForStage: Record<string, string> = {
      introduction: "/images/pixel_tavern_map.png",
      wilderness: "/images/pixel_forest_map.png",
      ruins: "/images/pixel_castle_map.png",
      chamber: "/images/pixel_dungeon_map.png",
      deal: "/images/pixel_dungeon_map.png",
      victory: "/images/pixel_treasure_map.png",
    };

    let chosenBgUrl = mapForStage[nextStage];
    if (usedGemini && aiCustomMap) {
      const theme = aiCustomMap.toLowerCase().trim();
      if (theme.includes("tavern") || theme.includes("inn") || theme.includes("indoor")) {
        chosenBgUrl = "/images/pixel_tavern_map.png";
      } else if (theme.includes("forest") || theme.includes("jungle") || theme.includes("wilderness") || theme.includes("woods")) {
        chosenBgUrl = "/images/pixel_forest_map.png";
      } else if (theme.includes("castle") || theme.includes("ruins") || theme.includes("wall") || theme.includes("fortress")) {
        chosenBgUrl = "/images/pixel_castle_map.png";
      } else if (theme.includes("dungeon") || theme.includes("cave") || theme.includes("underdark") || theme.includes("cellar") || theme.includes("crypt")) {
        chosenBgUrl = "/images/pixel_dungeon_map.png";
      } else if (theme.includes("treasure") || theme.includes("victory") || theme.includes("gold") || theme.includes("shrine")) {
        chosenBgUrl = "/images/pixel_treasure_map.png";
      } else if (theme.startsWith("http://") || theme.startsWith("https://") || theme.startsWith("/")) {
        chosenBgUrl = aiCustomMap; // Support direct URL
      }
    }

    let chosenWeather = nextStage === "wilderness" ? "rain" : nextStage === "ruins" ? "fog" : "none";
    if (usedGemini && aiWeather) {
      const cleanW = aiWeather.toLowerCase().trim();
      if (["none", "rain", "snow", "fog", "embers"].includes(cleanW)) {
        chosenWeather = cleanW;
      }
    }

    if (!triggerCombat) {
      if (!campaign.gridState) campaign.gridState = { bgUrl: "", weather: "none", tokens: [] };
      campaign.gridState.bgUrl = chosenBgUrl;
      campaign.gridState.weather = chosenWeather;
      campaign.audioState = nextStage === "wilderness" ? "forest" : nextStage === "chamber" ? "dungeon" : nextStage === "victory" ? "victory" : "tavern";
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 9: BUILD CONTEXTUAL RECOMMENDATIONS (only for DNIE fallback)
    // ═══════════════════════════════════════════════════════════════
    if (!usedGemini) {
      const charClass = character.class || "Petualang";
      const charRace = character.race || "Manusia";
      let recommendationText = `\n\n💡 **[Saran Aksi — ${charRace} ${charClass}]**\n`;
      if (nextStage === "introduction") {
        recommendationText += `→ *'saya bertanya tentang rumor kastil ke Barnaby'*\n→ *'saya mendekati sosok bertudung di pojok'*\n→ *'saya berjalan keluar menuju hutan'*`;
      } else if (nextStage === "wilderness") {
        recommendationText += `→ *'saya melacak jejak kaki Goblin di lumpur'*\n→ *'saya menyelinap di antara pohon purba'*\n→ *'saya berjalan maju menuju tebing kastil'*`;
      } else if (nextStage === "ruins") {
        recommendationText += `→ *'saya mendobrak pintu gerbang'*\n→ *'saya memanjat jendela lantai dua'*\n→ *'saya mencari celah di tembok barat'*`;
      } else if (nextStage === "chamber") {
        recommendationText += `→ *'saya menyerang Goblin secara frontal'*\n→ *'saya menyelinap membuka peti besi'*\n→ *'saya menyapa mereka untuk negosiasi'*`;
      } else if (nextStage === "deal") {
        recommendationText += `→ *'saya membayar 50 koin emas sebagai upeti'*\n→ *'saya menolak dan langsung menyerang'*\n→ *'saya menari koplo menghibur mereka'*`;
      } else if (nextStage === "combat") {
        recommendationText += `→ *'saya menyerang Goblin Scout'*\n→ *'saya mengambil posisi dodge'*\n→ *'saya menggunakan bonus action Disengage'*`;
      } else if (nextStage === "victory") {
        recommendationText = `\n\n🏆 **[KEMENANGAN!]** Petualangan selesai! Anda adalah legenda Kastil Cragmaw!`;
      }
      replyText += recommendationText;
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 10: PERSIST EVERYTHING
    // ═══════════════════════════════════════════════════════════════
    const newDesc = `${JSON.stringify(storyState)} | ${descParts[1] || "Petualangan solo dipandu AI Dungeon Master."}`;
    campaign.description = newDesc;

    if (!campaign.chatMessages) campaign.chatMessages = [];
    campaign.chatMessages.push({
      senderName: "Dungeon Master",
      text: replyText,
      isRoll: false,
      createdAt: new Date()
    });

    await campaign.save();
    revalidatePath(`/campaigns/${campaignId}`);

    return { success: true, campaign: JSON.parse(JSON.stringify(campaign)) };

  } catch (error: any) {
    console.error("Gagal memproses cerita Solo:", error);
    return { success: false, error: error.message };
  }
}