// File: lib/dnd-data.ts

export const POINT_BUY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const ALIGNMENTS: Record<string, { title: string, desc: string }> = {
  "Lawful Good": { title: "Pahlawan Sejati", desc: "Bertindak dengan kasih sayang, kehormatan, dan rasa keadilan yang ketat sesuai hukum masyarakat." },
  "Neutral Good": { title: "Dermawan", desc: "Selalu berusaha membantu orang lain sebaik mungkin tanpa terikat kuat pada aturan atau hukum otoritas." },
  "Chaotic Good": { title: "Pemberontak Baik", desc: "Melakukan apa yang benar menurut hati nurani mereka sendiri, meski harus menentang tradisi atau otoritas korup." },
  "Lawful Neutral": { title: "Penegak Hukum", desc: "Mengikuti hukum, tradisi, atau kode etik pribadi di atas segalanya, tanpa memihak kebaikan atau kejahatan." },
  "True Neutral": { title: "Pragmatis", desc: "Tidak memihak. Bertindak wajar sesuai insting untuk bertahan hidup atau menjaga keseimbangan alam semesta." },
  "Chaotic Neutral": { title: "Jiwa Bebas", desc: "Mengikuti keinginan hati saat itu juga, menjunjung tinggi kebebasan pribadi mutlak di atas aturan dan masyarakat." },
  "Lawful Evil": { title: "Tiran Penguasa", desc: "Memanfaatkan hukum, sistem hierarki, dan tradisi untuk menindas serta menguasai orang lain secara metodis." },
  "Neutral Evil": { title: "Egois Murni", desc: "Mengutamakan diri sendiri secara absolut, tidak ragu mengorbankan nyawa orang lain asalkan menguntungkan diri sendiri." },
  "Chaotic Evil": { title: "Penghancur", desc: "Bertindak murni berdasarkan keserakahan, kebencian, dan kehausan akan darah serta kehancuran tanpa aturan apa pun." }
};

export const RACES: Record<string, { 
  icon: string, desc: string, speed: number; bonuses: Record<string, number>; traits: {name: string, desc: string}[];
  subraces?: { name: string, desc: string, bonuses: Record<string, number>, traits: {name: string, desc: string}[] }[]
}> = {
  Dwarf: { 
    icon: "⛏️", 
    desc: "Penempa baja, pejuang tangguh, dan peminum bir yang handal. Dwarf memiliki fisik yang padat, sangat sulit dibunuh, dan terbiasa hidup di kerajaan bawah tanah yang gelap.", 
    speed: 25, bonuses: { CON: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dengan jelas di kegelapan total hingga jarak 60 kaki." },
      { name: "Dwarven Resilience", desc: "Memiliki ketahanan alami terhadap racun, memberi keuntungan (Advantage) saat menahan efek racun." },
      { name: "Combat Training", desc: "Otomatis ahli menggunakan kapak perang (Battleaxe) dan palu perang (Warhammer)." }
    ],
    subraces: [
      { name: "Hill Dwarf", desc: "Insting bertahan hidup yang tak tertandingi dan intuisi tajam.", bonuses: { WIS: 1 }, traits: [{ name: "Dwarven Toughness", desc: "Maksimal HP Anda bertambah 1 setiap kali Anda naik level." }] },
      { name: "Mountain Dwarf", desc: "Lebih kuat, lebih besar, dan terbiasa dengan medan pegunungan kasar.", bonuses: { STR: 2 }, traits: [{ name: "Dwarven Armor Training", desc: "Anda memiliki keahlian memakai Light dan Medium Armor secara alami." }] }
    ]
  },
  Elf: { 
    icon: "🧝", 
    desc: "Makhluk magis dengan keanggunan abadi dan umur yang sangat panjang. Elf hidup harmonis dengan alam dan sihir, bergerak tanpa suara melintasi hutan kuno.", 
    speed: 30, bonuses: { DEX: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dengan jelas di kegelapan total hingga jarak 60 kaki." },
      { name: "Keen Senses", desc: "Memiliki pendengaran dan penglihatan super tajam (Otomatis Proficient di skill Perception)." },
      { name: "Fey Ancestry", desc: "Sihir tidak bisa membuat Anda tertidur, dan Anda kebal terhadap sihir pesona (Charmed)." },
      { name: "Trance", desc: "Tidak butuh tidur normal. Cukup meditasi mendalam selama 4 jam untuk pulih sepenuhnya." }
    ],
    subraces: [
      { name: "High Elf", desc: "Elf berdarah murni dengan pikiran tajam dan afinitas sihir tinggi.", bonuses: { INT: 1 }, traits: [{ name: "Cantrip", desc: "Mengetahui satu Cantrip sihir dari Wizard." }, { name: "Extra Language", desc: "Bisa berbicara satu bahasa tambahan." }] },
      { name: "Wood Elf", desc: "Elf liar yang berlari secepat angin di tengah lebatnya hutan.", bonuses: { WIS: 1 }, traits: [{ name: "Fleet of Foot", desc: "Kecepatan gerak Anda meningkat menjadi 35 kaki." }, { name: "Mask of the Wild", desc: "Bisa bersembunyi meski hanya terhalang dedaunan atau hujan ringan." }] },
      { name: "Drow (Dark Elf)", desc: "Elf penguasa bawah tanah yang diberkati sihir gelap.", bonuses: { CHA: 1 }, traits: [{ name: "Superior Darkvision", desc: "Penglihatan gelap meningkat hingga 120 kaki." }, { name: "Drow Magic", desc: "Bisa merapal sihir Dancing Lights secara bawaan." }] }
    ]
  },
  Halfling: { 
    icon: "🍀", 
    desc: "Sangat mungil, lincah, dan penuh dengan keberuntungan mistis. Halfling cinta kedamaian, suka makan enak, dan memiliki nyali besar meski ukurannya kecil.", 
    speed: 25, bonuses: { DEX: 2 }, 
    traits: [
      { name: "Lucky", desc: "Jika Anda melempar angka 1 (Critical Miss) pada dadu d20, Anda bisa membuangnya dan melempar ulang." },
      { name: "Brave", desc: "Memiliki keberanian absolut, memberi keuntungan melawan sihir rasa takut (Frightened)." },
      { name: "Halfling Nimbleness", desc: "Bisa menyelinap dan bergerak melintasi celah kaki makhluk yang lebih besar dari Anda." }
    ],
    subraces: [
      { name: "Lightfoot Halfling", desc: "Paling lincah dan licin, mereka mudah berbaur dan bersembunyi.", bonuses: { CHA: 1 }, traits: [{ name: "Naturally Stealthy", desc: "Bisa bersembunyi di balik makhluk yang ukurannya lebih besar." }] },
      { name: "Stout Halfling", desc: "Lebih kekar dari halfling biasa, konon memiliki darah kurcaci.", bonuses: { CON: 1 }, traits: [{ name: "Stout Resilience", desc: "Memiliki ketahanan alami terhadap racun (Advantage & Resistance)." }] }
    ]
  },
  Gnome: { 
    icon: "🍄", 
    desc: "Makhluk bertubuh mungil dengan antusiasme hidup yang luar biasa. Gnome sangat cerdik, suka menciptakan penemuan mesin, dan ahli dalam ilusi magis.", 
    speed: 25, bonuses: { INT: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Gnome Cunning", desc: "Keuntungan (Advantage) pada semua saving throw Intelligence, Wisdom, dan Charisma melawan sihir." }
    ],
    subraces: [
      { name: "Forest Gnome", desc: "Gnome yang bersembunyi di hutan mistis dan berteman dengan satwa.", bonuses: { DEX: 1 }, traits: [{ name: "Natural Illusionist", desc: "Otomatis menguasai sihir Minor Illusion." }, { name: "Speak with Small Beasts", desc: "Bisa berkomunikasi dengan hewan kecil secara magis." }] },
      { name: "Rock Gnome", desc: "Penemu sejati, pembuat mesin jam tangan dan kotak musik presisi.", bonuses: { CON: 1 }, traits: [{ name: "Tinker", desc: "Mampu membuat perangkat mekanis kecil seperti pemantik api atau mainan putar." }] }
    ]
  },
  Aasimar: { 
    icon: "👼", 
    desc: "Aasimar adalah ras manusia yang diberkati dengan sentuhan jiwa kosmis malaikat (Celestial). Mereka ditakdirkan untuk membawa keadilan suci ke dunia fana.", 
    speed: 30, bonuses: { CHA: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Celestial Resistance", desc: "Kebal sebagian terhadap serangan berunsur Necrotic dan Radiant." },
      { name: "Healing Hands", desc: "Mampu menyembuhkan luka dengan sentuhan suci sekali per hari." },
      { name: "Light Bearer", desc: "Mampu mengeluarkan cahaya suci yang menerangi kegelapan secara alami." }
    ],
    subraces: [
      { name: "Protector Aasimar", desc: "Bertugas melindungi yang lemah. Dapat memunculkan sayap cahaya murni.", bonuses: { WIS: 1 }, traits: [{ name: "Radiant Soul", desc: "Memunculkan sayap terbang dan memberikan bonus damage radiant pada serangan." }] },
      { name: "Scourge Aasimar", desc: "Diresapi energi penghancur jahat. Mereka memakai topeng untuk menutupi cahaya menyilaukan.", bonuses: { CON: 1 }, traits: [{ name: "Radiant Consumption", desc: "Memancarkan aura cahaya yang membakar diri sendiri dan semua musuh di sekitarnya." }] },
      { name: "Fallen Aasimar", desc: "Telah kehilangan cahayanya, sayap mereka gugur dan auranya menjadi menakutkan.", bonuses: { STR: 1 }, traits: [{ name: "Necrotic Shroud", desc: "Memancarkan aura kegelapan yang membuat musuh lari ketakutan dan memberi ekstra damage necrotic." }] }
    ]
  },
  Dragonborn: { 
    icon: "🐉", 
    desc: "Menyerupai naga yang berdiri tegak dalam wujud humanoid. Dragonborn sangat bangga akan warisan draconic mereka dan menjunjung tinggi kehormatan klan.", 
    speed: 30, bonuses: { STR: 2, CHA: 1 }, 
    traits: [
      { name: "Draconic Ancestry", desc: "Anda terhubung dengan satu jenis naga (Api, Petir, Es, dll)." },
      { name: "Breath Weapon", desc: "Anda bisa menyemburkan energi mematikan dari mulut Anda sebagai senjata." },
      { name: "Damage Resistance", desc: "Anda kebal sebagian terhadap tipe elemen yang sama dengan nafas naga Anda." }
    ] 
  },
  "Half-Elf": { 
    icon: "🌗", 
    desc: "Lahir dari dua dunia berbeda. Menggabungkan pesona magis dari darah Elf, dengan adaptabilitas tak terbatas dari darah manusia.", 
    speed: 30, bonuses: { CHA: 2, DEX: 1, INT: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Fey Ancestry", desc: "Kebal terhadap sihir penidur dan sangat resisten terhadap pesona." },
      { name: "Skill Versatility", desc: "Dapat memilih 2 keahlian (Skills) tambahan apa pun secara bebas." }
    ] 
  },
  "Half-Orc": { 
    icon: "🪓", 
    desc: "Bertubuh kekar dengan taring menonjol. Half-Orc memendam amarah buas dari darah Orc mereka, membuat mereka menjadi petarung yang mematikan.", 
    speed: 30, bonuses: { STR: 2, CON: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Menacing", desc: "Penampilan yang mengerikan (Otomatis Proficient di skill Intimidation)." },
      { name: "Relentless Endurance", desc: "Jika nyawa turun ke 0, Anda bertahan di 1 HP (Sekali per hari)." },
      { name: "Savage Attacks", desc: "Mendaratkan kerusakan ekstra masif ketika Anda mendapatkan Critical Hit." }
    ] 
  },
  Human: { 
    icon: "👤", 
    desc: "Ras paling adaptif dan berambisi. Karena umur mereka pendek, manusia selalu terdorong untuk membangun kerajaan dan meninggalkan warisan legendaris.", 
    speed: 30, bonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, 
    traits: [
      { name: "Adaptability", desc: "Satu-satunya ras yang mendapatkan bonus stat ke SEMUA atribut dasar." },
      { name: "Extra Language", desc: "Dapat mempelajari, berbicara, dan menulis satu bahasa ekstra secara bebas." }
    ] 
  },
  Tiefling: { 
    icon: "🔥", 
    desc: "Manusia yang diwarisi kutukan darah iblis. Ditandai dengan tanduk dan ekor berujung lancip. Mereka sering diasingkan oleh peradaban.", 
    speed: 30, bonuses: { CHA: 2, INT: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Hellish Resistance", desc: "Memiliki ketahanan alami terhadap elemen api (Fire Resistance)." },
      { name: "Infernal Legacy", desc: "Mampu merapal sihir ilusi dan api dari darah iblis secara bawaan." }
    ] 
  },
  Goliath: { 
    icon: "⛰️", 
    desc: "Berkerabat dengan kaum raksasa. Goliath memiliki tubuh menjulang tinggi dan hidup di gunung bersalju dengan hierarki kekuatan kompetitif.", 
    speed: 30, bonuses: { STR: 2, CON: 1 }, 
    traits: [
      { name: "Natural Athlete", desc: "Fisik atletis bawaan (Otomatis Proficient di skill Athletics)." },
      { name: "Stone's Endurance", desc: "Mampu mengeraskan kulit seperti batu untuk menahan damage musuh secara instan." },
      { name: "Powerful Build", desc: "Secara mekanis, tubuh Anda dianggap satu ukuran lebih besar saat mengangkat benda berat." }
    ] 
  },
  Tabaxi: { 
    icon: "🐆", 
    desc: "Ras manusia kucing yang sangat lincah, didorong oleh rasa penasaran obsesif untuk mengumpulkan rahasia dan menjelajahi wilayah tak terpetakan.", 
    speed: 30, bonuses: { DEX: 2, CHA: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Feline Agility", desc: "Kecepatan luar biasa. Mampu berlari dua kali lipat lebih cepat dalam satu putaran." },
      { name: "Cat's Claws", desc: "Cakar alami yang bisa digunakan untuk memanjat dinding tegak dan menyerang dekat." },
      { name: "Cat's Talent", desc: "Otomatis terampil dalam teknik menyelinap dan mengamati (Stealth & Perception)." }
    ] 
  },
  Tortle: { 
    icon: "🐢", 
    desc: "Pengembara berwujud kura-kura raksasa. Tortle membawa rumah berlapis baja kokoh di punggung mereka ke mana pun mereka pergi.", 
    speed: 30, bonuses: { STR: 2, WIS: 1 }, 
    traits: [
      { name: "Natural Armor", desc: "Cangkang tebal memberikan Armor Class (AC) permanen setinggi 17." },
      { name: "Shell Defense", desc: "Mampu masuk ke dalam cangkang, meningkatkan AC total melawan bahaya." },
      { name: "Hold Breath", desc: "Paru-paru kuat yang memungkinkan Anda menahan napas di bawah air hingga 1 jam penuh." }
    ] 
  },
  Kenku: { 
    icon: "🦅", 
    desc: "Manusia gagak tanpa sayap. Kehilangan kemampuan terbang, namun bertahan hidup dengan menyalin suara dan metode ras lain.", 
    speed: 30, bonuses: { DEX: 2, WIS: 1 }, 
    traits: [
      { name: "Mimicry", desc: "Pita suara ajaib yang dapat meniru SEMUA suara dengan akurasi 100%." },
      { name: "Expert Forgery", desc: "Ahli memalsukan dokumen, tulisan tangan, dan seni pahat dari milik orang lain." },
      { name: "Kenku Training", desc: "Mendapat 2 ekstra skill dari: Acrobatics, Deception, Stealth, atau Sleight of Hand." }
    ] 
  },
  Goblin: { 
    icon: "👺", 
    desc: "Makhluk bertelinga lancip kelam. Meski sering dianggap remeh, Goblin berevolusi menjadi ahlinya bertahan hidup dan melarikan diri.", 
    speed: 30, bonuses: { DEX: 2, CON: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." },
      { name: "Fury of the Small", desc: "Bisa memberikan ekstra damage secara langsung saat melawan monster lebih besar." },
      { name: "Nimble Escape", desc: "Bisa bersembunyi (Hide) atau lari (Disengage) secepat kilat di pertempuran." }
    ] 
  }
};

export const BACKGROUNDS: Record<string, { desc: string, skills: string[]; equipment: string[] }> = {
  Acolyte: { desc: "Anda telah menghabiskan sebagian besar hidup Anda melayani di sebuah kuil suci. Anda bertindak sebagai perantara antara alam keilahian dan dunia fana.", skills: ["Insight", "Religion"], equipment: ["A holy symbol", "A prayer book", "5 sticks of incense", "15 gp"] },
  Charlatan: { desc: "Penipuan adalah seni yang Anda kuasai. Anda selalu memahami apa yang menggerakkan seseorang dan menggunakannya untuk memanipulasi mereka secara mulus.", skills: ["Deception", "Sleight of Hand"], equipment: ["A set of fine clothes", "A disguise kit", "15 gp"] },
  Criminal: { desc: "Anda memiliki sejarah panjang melanggar hukum dan membaur di dunia bawah tanah yang kelam. Anda lebih akrab dengan kekerasan daripada rakyat biasa.", skills: ["Deception", "Stealth"], equipment: ["A crowbar", "Dark common clothes", "15 gp"] },
  Entertainer: { desc: "Anda berkembang pesat di bawah sorotan lampu panggung. Baik melalui puisi, musik, atau tarian, Anda tahu cara memikat penonton.", skills: ["Acrobatics", "Performance"], equipment: ["A musical instrument", "The favor of an admirer", "15 gp"] },
  "Folk Hero": { desc: "Anda mungkin berasal dari kelas sosial paling bawah, namun takdir memilih Anda untuk berdiri melawan tirani demi melindungi kaum tertindas.", skills: ["Animal Handling", "Survival"], equipment: ["Artisan's tools", "A shovel", "10 gp"] },
  "Guild Artisan": { desc: "Anda adalah anggota serikat pekerja yang dihormati. Anda telah menghabiskan bertahun-tahun menciptakan barang dengan nilai tak terkira.", skills: ["Insight", "Persuasion"], equipment: ["A set of artisan's tools", "A letter of introduction", "15 gp"] },
  Hermit: { desc: "Anda pernah mengasingkan diri dari hiruk pikuk masyarakat untuk merenung dan berhasil menemukan sebuah pencerahan kosmis.", skills: ["Medicine", "Religion"], equipment: ["A scroll case stuffed with notes", "A winter blanket", "5 gp"] },
  Noble: { desc: "Anda sangat memahami rasanya hidup dengan kekuasaan absolut. Di mana pun Anda memijakkan kaki, Anda mengharapkan perlakuan layaknya raja.", skills: ["History", "Persuasion"], equipment: ["A set of fine clothes", "A signet ring", "25 gp"] },
  Outlander: { desc: "Anda dibesarkan di ujung dunia, terbiasa dengan buasnya alam liar, dan ahli bertahan hidup di lanskap yang tak kenal ampun.", skills: ["Athletics", "Survival"], equipment: ["A staff", "A hunting trap", "A trophy from an animal", "10 gp"] },
  Sage: { desc: "Perpustakaan tua adalah rumah Anda. Anda menghabiskan bertahun-tahun mempelajari naskah kuno dan meneliti sihir yang terlupakan.", skills: ["Arcana", "History"], equipment: ["Bottle of black ink", "A quill", "A small knife", "10 gp"] },
  Sailor: { desc: "Bagi Anda, lautan lepas jauh lebih nyata daripada daratan. Anda telah memimpin kru kapal melewati badai ganas dan monster laut.", skills: ["Athletics", "Perception"], equipment: ["A belaying pin", "50 feet of silk rope", "10 gp"] },
  Soldier: { desc: "Medan perang telah membentuk jiwa Anda. Anda mengetahui realitas pahit dari pertumpahan darah dan strategi militer lebih dari siapapun.", skills: ["Athletics", "Intimidation"], equipment: ["Insignia of rank", "A trophy from a fallen enemy", "10 gp"] },
  Urchin: { desc: "Anda anak jalanan yang berjuang hidup tanpa orang tua. Anda bertahan dari hari ke hari dengan mencuri di lorong-lorong sempit kota.", skills: ["Sleight of Hand", "Stealth"], equipment: ["A small knife", "A map of the city", "A pet mouse", "10 gp"] },
};

export const CLASSES: Record<string, any> = {
  Barbarian: { image: "https://www.dndbeyond.com/avatars/43940/615/638607453021957927.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🪓", color: "from-red-700 to-orange-800", desc: "Pejuang buas yang menolak taktik peradaban, digerakkan sepenuhnya oleh amarah primal. Mereka mengandalkan kekuatan mentah, insting bertahan hidup mutlak, dan kemampuan untuk mengamuk (Rage) di medan tempur demi menahan kerusakan masif. Bagi Barbarian, kemarahan adalah senjata sekaligus perisai yang tak tertembus.", hitDie: 12, isCaster: false, primary: "STR", saves: ["STR", "CON"], proficiencies: { armor: "Light Armor, Medium Armor, Shields", weapons: "Simple Weapons, Martial Weapons", tools: "None" }, skillCount: 2, skillOptions: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], equipmentChoices: [{ id: "weapon1", options: ["A greataxe", "Any martial melee weapon"] }, { id: "weapon2", options: ["Two handaxes", "Any simple weapon"] }], baseEquipment: ["An explorer's pack", "4 javelins"] },
  Bard: { image: "https://www.dndbeyond.com/avatars/43940/760/638607457244101778.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🎸", color: "from-pink-700 to-purple-800", desc: "Seniman magis yang menyadap benang-benang penciptaan multiverse melalui musik, puisi, dan orasi. Mereka ahli dalam memotivasi sekutu, membingungkan pikiran musuh, dan memanipulasi situasi sosial. Seorang Bard adalah perwujudan dari pepatah 'Pena lebih tajam dari pedang'.", hitDie: 8, isCaster: true, primary: "CHA", saves: ["DEX", "CHA"], proficiencies: { armor: "Light Armor", weapons: "Simple Weapons, Hand Crossbows, Longswords, Rapiers, Shortswords", tools: "Three musical instruments of your choice" }, skillCount: 3, skillOptions: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], cantripsKnown: 2, spellsKnown: 4, equipmentChoices: [{ id: "weapon", options: ["A rapier", "A longsword", "Any simple weapon"] }, { id: "pack", options: ["A diplomat's pack", "An entertainer's pack"] }, { id: "instrument", options: ["A lute", "Any other musical instrument"] }], baseEquipment: ["Leather armor", "A dagger"] },
  Cleric: { image: "https://www.dndbeyond.com/avatars/43940/780/638607457552642121.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "⚕️", color: "from-yellow-600 to-amber-700", desc: "Juara para dewa yang memegang sihir ilahi langsung dari alam surgawi. Cleric bukan sekadar penyembuh; mereka adalah komandan spiritual yang mampu menyembuhkan luka fatal, membangkitkan yang mati, memanggil badai kemarahan dewa, dan membakar mayat hidup (Undead) menjadi abu.", hitDie: 8, isCaster: true, primary: "WIS", saves: ["WIS", "CHA"], proficiencies: { armor: "Light Armor, Medium Armor, Shields", weapons: "Simple Weapons", tools: "None" }, skillCount: 2, skillOptions: ["History", "Insight", "Medicine", "Persuasion", "Religion"], cantripsKnown: 3, spellsKnown: 4, equipmentChoices: [{ id: "weapon", options: ["A mace", "A warhammer"] }, { id: "armor", options: ["Scale mail", "Leather armor", "Chain mail"] }, { id: "pack", options: ["A priest's pack", "An explorer's pack"] }], baseEquipment: ["A shield", "A holy symbol"] },
  Druid: { image: "https://www.dndbeyond.com/avatars/43940/798/638607457907453415.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🌿", color: "from-green-700 to-emerald-800", desc: "Pendeta alam kuno yang menolak peradaban logam demi ikatan mistis dengan bumi. Druid dapat memanggil elemen alam, berbicara dengan flora dan fauna, serta merubah wujud fisik mereka menjadi berbagai binatang buas (Wild Shape) untuk mencabik-cabik ancaman.", hitDie: 8, isCaster: true, primary: "WIS", saves: ["INT", "WIS"], proficiencies: { armor: "Light/Medium Armor, Shields (non-metal)", weapons: "Clubs, Daggers, Darts, Javelins, Maces, Quarterstaffs, Scimitars, Sickles, Slings, Spears", tools: "Herbalism Kit" }, skillCount: 2, skillOptions: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"], cantripsKnown: 2, spellsKnown: 4, equipmentChoices: [{ id: "weapon", options: ["A wooden shield", "Any simple weapon"] }, { id: "weapon2", options: ["A scimitar", "Any simple melee weapon"] }], baseEquipment: ["Leather armor", "An explorer's pack", "A druidic focus"] },
  Fighter: { image: "https://www.dndbeyond.com/avatars/43940/813/638607458268123998.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "⚔️", color: "from-slate-600 to-slate-800", desc: "Ahli seni bela diri bersenjata dan taktik perang yang tak tertandingi oleh siapapun. Dari kesatria berbaju besi pelat tebal hingga penembak jitu mematikan, Fighter menguasai setiap jenis senjata dan memiliki fleksibilitas serangan tertinggi di medan pertempuran.", hitDie: 10, isCaster: false, primary: "STR", saves: ["STR", "CON"], proficiencies: { armor: "All Armor, Shields", weapons: "Simple Weapons, Martial Weapons", tools: "None" }, skillCount: 2, skillOptions: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"], equipmentChoices: [{ id: "armor", options: ["Chain mail", "Leather armor, longbow, and 20 arrows"] }, { id: "weapon1", options: ["A martial weapon and a shield", "Two martial weapons"] }, { id: "pack", options: ["A dungeoneer's pack", "An explorer's pack"] }], baseEquipment: [] },
  Monk: { image: "https://www.dndbeyond.com/avatars/43940/744/638607456916761515.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "👊", color: "from-cyan-600 to-blue-800", desc: "Petarung asketis yang telah membuka rahasia mistis dari energi kehidupan (Ki). Tanpa bantuan zirah tebal atau senjata tajam, Monk mampu berlari di atas air, menangkap panah dengan tangan kosong, dan melumpuhkan musuh dengan rentetan serangan mematikan.", hitDie: 8, isCaster: false, primary: "DEX", saves: ["STR", "DEX"], proficiencies: { armor: "None", weapons: "Simple Weapons, Shortswords", tools: "One type of artisan's tools or musical instrument" }, skillCount: 2, skillOptions: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"], equipmentChoices: [{ id: "weapon", options: ["A shortsword", "Any simple weapon"] }, { id: "pack", options: ["A dungeoneer's pack", "An explorer's pack"] }], baseEquipment: ["10 darts"] },
  Paladin: { image: "https://www.dndbeyond.com/avatars/43940/832/638607458605123169.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🛡️", color: "from-yellow-500 to-yellow-700", desc: "Kesatria suci yang kekuatannya bersumber dari sumpah dan keyakinan absolut. Paladin memadukan keterampilan bela diri baja dengan sihir cahaya mematikan (Divine Smite) untuk mengenyahkan kejahatan mutlak, sekaligus menjadi tameng hidup bagi mereka yang tak berdaya.", hitDie: 10, isCaster: true, primary: "STR", saves: ["WIS", "CHA"], proficiencies: { armor: "All Armor, Shields", weapons: "Simple Weapons, Martial Weapons", tools: "None" }, skillCount: 2, skillOptions: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"], cantripsKnown: 0, spellsKnown: 0, equipmentChoices: [{ id: "weapon1", options: ["A martial weapon and a shield", "Two martial weapons"] }, { id: "weapon2", options: ["Five javelins", "Any simple melee weapon"] }, { id: "pack", options: ["A priest's pack", "An explorer's pack"] }], baseEquipment: ["Chain mail", "A holy symbol"] },
  Ranger: { image: "https://www.dndbeyond.com/avatars/43940/841/638607458994233790.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🏹", color: "from-emerald-700 to-green-900", desc: "Penjaga perbatasan yang berdiri di antara peradaban dan teror alam liar. Ranger adalah pengintai ahli, pemburu monster presisi tinggi, yang memanfaatkan kelicikan, keterampilan bersembunyi, dan sihir primitif untuk mengubah alam menjadi senjata mereka.", hitDie: 10, isCaster: true, primary: "DEX", saves: ["STR", "DEX"], proficiencies: { armor: "Light Armor, Medium Armor, Shields", weapons: "Simple Weapons, Martial Weapons", tools: "None" }, skillCount: 3, skillOptions: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"], cantripsKnown: 0, spellsKnown: 0, equipmentChoices: [{ id: "armor", options: ["Scale mail", "Leather armor"] }, { id: "weapon1", options: ["Two shortswords", "Two simple melee weapons"] }, { id: "pack", options: ["A dungeoneer's pack", "An explorer's pack"] }], baseEquipment: ["A longbow and a quiver of 20 arrows"] },
  Rogue: { image: "https://www.dndbeyond.com/avatars/43940/853/638607459373183811.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "🗡️", color: "from-zinc-800 to-zinc-950", desc: "Bayangan mematikan yang mengandalkan keahlian siluman dan serangan mematikan pada titik lemah (Sneak Attack). Rogue bukan petarung garis depan, melainkan pakar membongkar kunci, melucuti perangkap, dan membunuh target sebelum mereka menyadari bahaya datang.", hitDie: 8, isCaster: false, primary: "DEX", saves: ["DEX", "INT"], proficiencies: { armor: "Light Armor", weapons: "Simple Weapons, Hand Crossbows, Longswords, Rapiers, Shortswords", tools: "Thieves' tools" }, skillCount: 4, skillOptions: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"], equipmentChoices: [{ id: "weapon1", options: ["A rapier", "A shortsword"] }, { id: "weapon2", options: ["A shortbow and quiver of 20 arrows", "A shortsword"] }, { id: "pack", options: ["A burglar's pack", "A dungeoneer's pack", "An explorer's pack"] }], baseEquipment: ["Leather armor", "Two daggers", "Thieves' tools"] },
  Sorcerer: { image: "https://www.dndbeyond.com/avatars/43940/871/638607459719752506.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "✨", color: "from-red-600 to-rose-800", desc: "Mistikus yang memancarkan sihir dari dalam darah mereka sendiri, berkat garis keturunan eksotis, kutukan mistis, atau anomali kosmis. Sorcerer dapat memanipulasi hukum realitas secara langsung (Metamagic) tanpa perlu mempelajari buku sihir tebal.", hitDie: 6, isCaster: true, primary: "CHA", saves: ["CON", "CHA"], proficiencies: { armor: "None", weapons: "Daggers, Darts, Slings, Quarterstaffs, Light Crossbows", tools: "None" }, skillCount: 2, skillOptions: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"], cantripsKnown: 4, spellsKnown: 2, equipmentChoices: [{ id: "weapon", options: ["A light crossbow and 20 bolts", "Any simple weapon"] }, { id: "focus", options: ["A component pouch", "An arcane focus"] }, { id: "pack", options: ["A dungeoneer's pack", "An explorer's pack"] }], baseEquipment: ["Two daggers"] },
  Warlock: { image: "https://www.dndbeyond.com/avatars/43940/890/638607460049450769.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "👁️", color: "from-fuchsia-800 to-purple-950", desc: "Perapal mantra gelap yang mengikat perjanjian jiwa dengan entitas kuno penguasa kosmos (Iblis, Archfey, atau Dewa Kosmis). Sebagai bayaran atas rahasia terlarang (Eldritch Invocations), mereka melepaskan energi magis yang destruktif dan tak bisa dipahami nalar.", hitDie: 8, isCaster: true, primary: "CHA", saves: ["WIS", "CHA"], proficiencies: { armor: "Light Armor", weapons: "Simple Weapons", tools: "None" }, skillCount: 2, skillOptions: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"], cantripsKnown: 2, spellsKnown: 2, equipmentChoices: [{ id: "weapon", options: ["A light crossbow and 20 bolts", "Any simple weapon"] }, { id: "focus", options: ["A component pouch", "An arcane focus"] }, { id: "pack", options: ["A scholar's pack", "An dungeoneer's pack"] }], baseEquipment: ["Leather armor", "Any simple weapon", "Two daggers"] },
  Wizard: { image: "https://www.dndbeyond.com/avatars/43940/902/638607460390730233.jpeg?width=1000&height=1000&fit=bounds&quality=95&auto=webp", icon: "📖", color: "from-blue-700 to-indigo-900", desc: "Sarjana magis paling intelektual yang merangkai realitas melalui rumus matematika kosmis di dalam buku sihir mereka. Dengan waktu dan persiapan, Wizard memiliki spektrum sihir paling mematikan dan luas di seluruh dimensi, dari ledakan elemen hingga manipulasi gravitasi.", hitDie: 6, isCaster: true, primary: "INT", saves: ["INT", "WIS"], proficiencies: { armor: "None", weapons: "Daggers, Darts, Slings, Quarterstaffs, Light Crossbows", tools: "None" }, skillCount: 2, skillOptions: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"], cantripsKnown: 3, spellsKnown: 6, equipmentChoices: [{ id: "weapon", options: ["A quarterstaff", "A dagger"] }, { id: "focus", options: ["A component pouch", "An arcane focus"] }, { id: "pack", options: ["A scholar's pack", "An explorer's pack"] }], baseEquipment: ["A spellbook"] },
};

export const SUBCLASSES: Record<string, {name: string, desc: string}[]> = {
  Barbarian: [
    {name: "Path of the Berserker", desc: "Mampu masuk ke dalam Frenzy. Mereka mengabaikan rasa sakit dan batasan fisik demi mendaratkan rentetan serangan mematikan yang tak bisa ditangkis."}, 
    {name: "Path of the Totem Warrior", desc: "Menerima bimbingan pelindung gaib. Roh Beruang memberi ketahanan absolut, Elang menajamkan penglihatan, dan Serigala menginspirasi kawan."}
  ],
  Bard: [
    {name: "College of Lore", desc: "Pengumpul rahasia magis purba yang menggunakan pengetahuannya untuk mencela musuh dengan kata-kata magis yang melemahkan mental mereka."}, 
    {name: "College of Valor", desc: "Skald heroik yang terjun ke garis depan dengan pedang, menyanyikan kidung perang untuk membakar semangat tempur kawan-kawannya."}
  ],
  Cleric: [
    {name: "Knowledge Domain", desc: "Membaktikan diri pada pencarian ilmu pengetahuan, masa lalu, dan rahasia kosmis melalui berkah dewa kebijaksanaan."},
    {name: "Life Domain", desc: "Ahli sihir penyembuhan paling murni. Mereka merepresentasikan energi positif absolut yang melindungi sekutu dari ambang kematian."}, 
    {name: "Light Domain", desc: "Pelayan dewa matahari yang memanipulasi kekuatan api dan cahaya menyilaukan untuk membakar musuh-musuh dan para penyembah kegelapan."},
    {name: "Nature Domain", desc: "Pelayan dewa alam liar yang memiliki kemampuan memanipulasi elemen hewan dan tumbuhan untuk melindungi ciptaan alami."},
    {name: "Tempest Domain", desc: "Membawa amarah badai, petir, dan guruh ke medan tempur. Mereka adalah perwujudan badai yang tak tertahankan."},
    {name: "Trickery Domain", desc: "Pendeta penipu yang menggunakan sihir ilusi dan siluman. Memuja dewa-dewa kekacauan, penipuan, atau pencurian."},
    {name: "War Domain", desc: "Pendeta tempur berbaju zirah pelat tebal yang diberkati kemampuan menyerang berkali-kali atas nama dewa peperangan suci."}
  ],
  Druid: [
    {name: "Circle of the Land", desc: "Mistikus yang terikat kuat dengan magis spesifik dari topografi asal mereka, memberikan akses ke berbagai mantra rahasia alam yang kuat."}, 
    {name: "Circle of the Moon", desc: "Pelindung keganasan liar yang memfokuskan sihir mereka sepenuhnya pada seni perubahan wujud (Wild Shape) menjadi monster karnivora buas."}
  ],
  Fighter: [
    {name: "Champion", desc: "Perwujudan dari kekuatan mentah dan kesempurnaan fisik. Mereka mendominasi musuh dengan serangan kritikal (Critical Hit) yang mematikan dan presisi tinggi."}, 
    {name: "Battle Master", desc: "Jenius taktis dan komandan veteran yang menggunakan berbagai 'Manuver Tempur' khusus untuk melucuti senjata, menjatuhkan, atau mengecoh musuh."},
    {name: "Eldritch Knight", desc: "Prajurit elitis yang memadukan ilmu pedang tingkat tinggi dengan sihir elemen mematikan (Evokasi) dan tameng pelindung gaib (Abjurasi)."}
  ],
  Monk: [
    {name: "Way of the Open Hand", desc: "Master pertarungan tangan kosong. Mereka dapat memanipulasi titik Ki di tubuh musuh untuk melempar, memukul mundur, atau menghancurkan organ vital musuh seketika."}, 
    {name: "Way of Shadow", desc: "Kultus pembunuh rahasia yang memanfaatkan energi gelap untuk berteleportasi dari satu bayangan ke bayangan lain, menyergap korban tanpa suara."},
    {name: "Way of the Four Elements", desc: "Biksu mistis yang mampu menyalurkan Ki mereka untuk memanipulasi elemen dasar (Api, Air, Bumi, Angin) di alam semesta."}
  ],
  Paladin: [
    {name: "Oath of Devotion", desc: "Kesatria ideal yang mengikat sumpah pada kejujuran dan kehormatan. Pedang mereka bersinar dengan cahaya suci yang mengusir setan dan iblis kembali ke asalnya."}, 
    {name: "Oath of the Ancients", desc: "Kesatria hijau yang bersumpah melestarikan keindahan alam. Mereka kebal terhadap pengaruh fey dan sihir gelap demi menjaga cahaya kosmis."},
    {name: "Oath of Vengeance", desc: "Malaikat maut yang mengikat sumpah darah. Mereka mengabaikan belas kasih demi memburu dan memusnahkan pendosa besar tanpa henti dan tanpa ampun."}
  ],
  Ranger: [
    {name: "Hunter", desc: "Ahli taktik yang memfokuskan diri untuk membunuh tipe monster spesifik, baik itu membantai kerumunan Orc liar atau merobohkan Raksasa seorang diri."}, 
    {name: "Beast Master", desc: "Membentuk ikatan telepati magis dengan seekor hewan buas (seperti serigala atau elang) yang bertarung berdampingan di medan pertempuran mematikan."}
  ],
  Rogue: [
    {name: "Thief", desc: "Pencuri jalanan dengan kelincahan super. Mereka memanjat dinding bagai laba-laba, bereaksi sangat cepat, dan dapat menggunakan artefak sihir tanpa batasannya."}, 
    {name: "Assassin", desc: "Ekskutor profesional berdarah dingin. Ahli menyamar, meracik racun, dan memberikan serangan kritikal instan kepada target yang tidak menyadari kehadiran mereka."},
    {name: "Arcane Trickster", desc: "Pencuri yang memberdayakan kelicikan mereka dengan sihir ilusi dan pesona. Tangan gaib (Mage Hand) mereka bisa mencuri benda dari kantong Anda tanpa terlihat."}
  ],
  Sorcerer: [
    {name: "Draconic Bloodline", desc: "Sihir dari warisan naga kuno. Tumbuh sisik tak terlihat yang melindungi fisik mereka, dan mantra elemen mereka mewarisi keganasan warna naga leluhur mereka."}, 
    {name: "Wild Magic", desc: "Sihirnya berasal dari kekacauan multiverse. Setiap kali merapal mantra mistis, anomali magis acak bisa terjadi—entah itu ledakan hebat, atau mengubah diri sendiri menjadi domba."}
  ],
  Warlock: [
    {name: "The Archfey", desc: "Kekuatan hasil pakta dengan penguasa ras peri. Mereka spesialis memanipulasi emosi, menciptakan ilusi menakutkan, dan mengendalikan pikiran mahluk hidup dengan paksa."},
    {name: "The Fiend", desc: "Kekuatan hasil pakta dengan entitas neraka terdalam. Mereka ahli memanggil lautan api neraka, dan meregenerasi kekuatan setiap kali mengorbankan nyawa lawan."}, 
    {name: "The Great Old One", desc: "Kekuatan hasil pakta dengan entitas kosmis kuno tak bernama. Mereka bisa berkomunikasi secara telepati dan menggunakan sihir yang menghancurkan kewarasan pikiran musuh."}
  ],
  Wizard: [
    {name: "School of Abjuration", desc: "Pelindung mutlak. Mereka menciptakan perisai mistis yang menyerap serangan, menolak sihir musuh, dan menghalau entitas sihir masuk."},
    {name: "School of Conjuration", desc: "Spesialisasi menembus dimensi ruang untuk memanggil makhluk hidup, energi ajaib, dan objek fisik murni dari ketiadaan absolut."},
    {name: "School of Divination", desc: "Bisa melihat jalinan masa depan, masa lalu, dan rahasia yang paling tersembunyi. Ahli sihir ramalan bisa memanipulasi guliran dadu takdir."},
    {name: "School of Enchantment", desc: "Spesialisasi memanipulasi pikiran, ingatan, dan emosi makhluk hidup, membengkokkan kehendak mereka menjadi boneka penurut."},
    {name: "School of Evocation", desc: "Ahli merakit ledakan murni seperti Fireball atau Lightning Bolt. Mereka bahkan bisa melindungi kawan dari jangkauan efek ledakan sihir destruktif mereka sendiri."}, 
    {name: "School of Illusion", desc: "Spesialisasi menipu indera dan pikiran manusia dengan ilusi visual serta suara yang luar biasa realistis, memutarbalikkan realita target."},
    {name: "School of Necromancy", desc: "Spesialisasi memanipulasi energi kehidupan kosmis dan merangkul kematian, menghisap nyawa dan membangkitkan pasukan mayat hidup."},
    {name: "School of Transmutation", desc: "Spesialisasi mengubah energi dan materi benda fisik dari satu wujud ke wujud lain. Seperti mengubah besi menjadi perak murni."}
  ],
};

export const SPELL_DATABASE: Record<string, Record<string, { name: string, desc: string }[]>> = {
  Bard: {
    Cantrips: [
      { name: "Dancing Lights", desc: "Menciptakan 4 cahaya obor yang bisa digerakkan secara bebas." },
      { name: "Friends", desc: "Keuntungan pada cek Charisma melawan satu makhluk (ia akan sadar setelah 1 menit)." },
      { name: "Light", desc: "Membuat objek bersinar seperti obor selama 1 jam." },
      { name: "Mage Hand", desc: "Tangan gaib untuk memanipulasi objek dari jarak 30 kaki." },
      { name: "Minor Illusion", desc: "Menciptakan suara atau bayangan objek kecil." },
      { name: "Prestidigitation", desc: "Trik sihir kecil untuk membersihkan, memanaskan, atau mewarnai objek." },
      { name: "Vicious Mockery", desc: "Hinaan magis yang memberikan 1d4 psychic damage dan disadvantage serangan." }
    ],
    Level1: [
      { name: "Bane", desc: "Hingga 3 target harus mengurangi 1d4 dari serangan dan saving throw." },
      { name: "Charm Person", desc: "Membuat humanoid menganggap Anda sebagai teman dekat." },
      { name: "Cure Wounds", desc: "Menyembuhkan 1d8 + Spellcasting mod HP dengan sentuhan." },
      { name: "Dissonant Whispers", desc: "Bisikan horor yang memberikan 3d6 psychic damage dan memaksa musuh lari." },
      { name: "Faerie Fire", desc: "Menandai musuh dengan cahaya, memberikan keuntungan serangan terhadap mereka." },
      { name: "Healing Word", desc: "Bonus Action: Menyembuhkan 1d4 + mod HP dari jarak jauh." },
      { name: "Sleep", desc: "Menidurkan makhluk hidup berdasarkan jumlah HP mereka (gulir 5d8)." }
    ]
  },
  Cleric: {
    Cantrips: [
      { name: "Guidance", desc: "Memberikan +1d4 pada cek kemampuan target berikutnya." },
      { name: "Light", desc: "Membuat objek bersinar terang." },
      { name: "Resistance", desc: "Memberikan +1d4 pada saving throw target berikutnya." },
      { name: "Sacred Flame", desc: "Cahaya suci dari langit memberikan 1d8 radiant damage (DEX save)." },
      { name: "Spare the Dying", desc: "Menstabilkan makhluk yang memiliki 0 HP seketika." },
      { name: "Thaumaturgy", desc: "Menciptakan manifestasi keilahian seperti suara guntur atau mata yang menyala." }
    ],
    Level1: [
      { name: "Bless", desc: "Memberikan +1d4 pada serangan dan saving throw hingga 3 sekutu." },
      { name: "Command", desc: "Memerintahkan satu kata (Turun, Lari, Diam) yang harus ditaati musuh." },
      { name: "Cure Wounds", desc: "Sihir penyembuhan standar (1d8 + mod)." },
      { name: "Guiding Bolt", desc: "Serangan cahaya 4d6 radiant damage; serangan berikutnya ke target mendapat keuntungan." },
      { name: "Healing Word", desc: "Penyembuhan instan (Bonus Action)." },
      { name: "Inflict Wounds", desc: "Sentuhan kematian yang memberikan 3d10 necrotic damage." },
      { name: "Shield of Faith", desc: "Menciptakan perisai pelindung yang memberikan +2 AC pada target." }
    ]
  },
  Druid: {
    Cantrips: [
      { name: "Druidcraft", desc: "Memprediksi cuaca, membuat bunga mekar, atau memadamkan api kecil." },
      { name: "Guidance", desc: "Bantuan dewa alam (+1d4 cek kemampuan)." },
      { name: "Produce Flame", desc: "Api di telapak tangan untuk penerangan atau dilempar (1d8 fire)." },
      { name: "Resistance", desc: "Ketahanan alamiah (+1d4 saving throw)." },
      { name: "Shillelagh", desc: "Memperkuat tongkat kayu dengan energi alam, menggunakan Wisdom untuk serangan." },
      { name: "Thorn Whip", desc: "Cambuk duri memberikan 1d6 piercing damage dan menarik musuh mendekat." }
    ],
    Level1: [
      { name: "Animal Friendship", desc: "Meyakinkan hewan bahwa Anda tidak berbahaya." },
      { name: "Cure Wounds", desc: "Penyembuhan melalui energi bumi." },
      { name: "Entangle", desc: "Tanaman merambat muncul dari tanah untuk menjerat musuh (Restrained)." },
      { name: "Faerie Fire", desc: "Cahaya peri untuk menandai musuh di kegelapan." },
      { name: "Fog Cloud", desc: "Menciptakan kabut tebal yang menghalangi pandangan total." },
      { name: "Goodberry", desc: "Menciptakan 10 buah beri yang menyembuhkan 1 HP dan memberi nutrisi sehari penuh." },
      { name: "Thunderwave", desc: "Gelombang suara guntur mendorong musuh menjauh dan memberikan 2d8 damage." }
    ]
  },
  Sorcerer: {
    Cantrips: [
      { name: "Acid Splash", desc: "Gelembung asam memberikan 1d6 acid damage pada 1 atau 2 musuh." },
      { name: "Chill Touch", desc: "Tangan hantu mencegah musuh menyembuhkan diri (1d8 necrotic)." },
      { name: "Fire Bolt", desc: "Lemparan api jarak jauh (1d10 fire damage)." },
      { name: "Mage Hand", desc: "Tangan gaib 30 kaki." },
      { name: "Minor Illusion", desc: "Trik bayangan." },
      { name: "Poison Spray", desc: "Semburan gas beracun (1d12 poison damage)." },
      { name: "Ray of Frost", desc: "Sinar es memberikan 1d8 cold damage dan mengurangi kecepatan musuh 10 kaki." },
      { name: "Shocking Grasp", desc: "Sengatan listrik mencegah musuh mengambil reaksi (1d8 lightning)." }
    ],
    Level1: [
      { name: "Burning Hands", desc: "Semburan api berbentuk kerucut (3d6 fire damage)." },
      { name: "Chaos Bolt", desc: "Serangan energi acak 2d8 + 1d6 (tipe damage ditentukan oleh dadu)." },
      { name: "Chromatic Orb", desc: "Bola elemen (Pilih: Api, Es, Listrik, dll) sekuat 3d8 damage." },
      { name: "Mage Armor", desc: "Armor sihir permanen (AC = 13 + DEX mod) selama 8 jam." },
      { name: "Magic Missile", desc: "3 panah energi yang PASTI kena (automatic hit) sekuat 1d4+1 force damage." },
      { name: "Shield", desc: "Reaction: Memberikan +5 AC instan saat diserang." },
      { name: "Thunderwave", desc: "Ledakan suara destruktif." }
    ]
  },
  Warlock: {
    Cantrips: [
      { name: "Eldritch Blast", desc: "Serangan laser energi paling ikonik (1d10 force damage)." },
      { name: "Friends", desc: "Manipulasi sosial singkat." },
      { name: "Mage Hand", desc: "Manipulasi objek jarak jauh." },
      { name: "Minor Illusion", desc: "Ilusi visual/suara." },
      { name: "Poison Spray", desc: "Gas racun mematikan." },
      { name: "Prestidigitation", desc: "Trik sihir serbaguna." },
      { name: "Toll the Dead", desc: "Bunyi lonceng kematian (1d8 atau 1d12 necrotic jika target sudah luka)." }
    ],
    Level1: [
      { name: "Armor of Agathys", desc: "Perisai es dingin; memberikan 5 temp HP dan 5 damage es ke penyerang." },
      { name: "Arms of Hadar", desc: "Tentakel hitam menyerang semua di sekitar Anda (2d6 necrotic)." },
      { name: "Charm Person", desc: "Manipulasi pikiran humanoid." },
      { name: "Hellish Rebuke", desc: "Reaction: Membakar musuh yang baru saja melukai Anda (2d10 fire damage)." },
      { name: "Hex", desc: "Mengutuk musuh; Anda memberikan tambahan 1d6 necrotic damage setiap kali memukulnya." },
      { name: "Protection from Evil and Good", desc: "Melindungi dari iblis, hantu, dan makhluk dimensi lain." },
      { name: "Witch Bolt", desc: "Sambaran petir berkelanjutan (1d12 damage setiap putaran)." }
    ]
  },
  Wizard: {
    Cantrips: [
      { name: "Acid Splash", desc: "Ledakan asam kecil." },
      { name: "Fire Bolt", desc: "Sihir api standar penyihir (1d10)." },
      { name: "Light", desc: "Sinar penerangan." },
      { name: "Mage Hand", desc: "Tangan mistis." },
      { name: "Minor Illusion", desc: "Tipuan visual." },
      { name: "Prestidigitation", desc: "Trik sekolah sihir." },
      { name: "Ray of Frost", desc: "Sinar pembeku." },
      { name: "Shocking Grasp", desc: "Sengatan listrik jarak dekat." }
    ],
    Level1: [
      { name: "Burning Hands", desc: "Semburan api dari jari." },
      { name: "Chromatic Orb", desc: "Bola elemen fleksibel." },
      { name: "Comprehend Languages", desc: "Memahami semua bahasa tulisan/lisan selama 1 jam." },
      { name: "Detect Magic", desc: "Mendeteksi aura sihir dalam jarak 30 kaki." },
      { name: "Find Familiar", desc: "Memanggil roh hewan pembantu (burung, kucing, kodok)." },
      { name: "Grease", desc: "Licin! Membuat area menjadi licin dan musuh jatuh terjerembap (Prone)." },
      { name: "Identify", desc: "Mengetahui sifat magis dari sebuah objek." },
      { name: "Mage Armor", desc: "Pelindung tubuh transparan." },
      { name: "Magic Missile", desc: "Panah energi yang tak pernah meleset." },
      { name: "Shield", desc: "Perisai reaksi (+5 AC)." },
      { name: "Sleep", desc: "Sihir pembius masal." },
      { name: "Tasha's Hideous Laughter", desc: "Membuat musuh tertawa tak terkendali hingga jatuh tak berdaya." }
    ]
  }
};