export const RACES: Record<string, any> = {
  Dwarf: { 
    icon: "/images/races/dwarf.png", 
    imageFilter: "none", 
    desc: "Penempa baja dari kedalaman bumi, pejuang tangguh yang tak kenal takut, dan peminum bir yang melegenda. Dwarf memiliki perawakan pendek namun sangat padat dan berotot. Mereka membangun kerajaan megah di dalam perut gunung, dipenuhi ukiran emas dan gemuruh tungku tempa. Kesetiaan pada klan dan dendam pada musuh (terutama ras goblinoid) mengalir kuat di darah mereka.", 
    speed: 25, 
    bonuses: { CON: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dengan jelas di kegelapan total hingga jarak 60 kaki. Anda melihat dalam nuansa abu-abu." }, 
      { name: "Dwarven Resilience", desc: "Memiliki ketahanan alami terhadap racun, memberi keuntungan (Advantage) pada saving throw melawan racun, dan resistansi terhadap damage racun." }, 
      { name: "Dwarven Combat Training", desc: "Otomatis ahli menggunakan kapak perang (Battleaxe), kapak tangan (Handaxe), palu lempar (Light Hammer), dan palu perang (Warhammer)." },
      { name: "Tool Proficiency", desc: "Anda mendapatkan keahlian menggunakan alat pertukangan pilihan Anda: smith's tools, brewer's supplies, atau mason's tools." },
      { name: "Stonecunning", desc: "Kapan pun Anda melakukan pengecekan History terkait asal-usul pahatan batu, Anda dianggap proficient dan menambahkan dua kali lipat proficiency bonus Anda." }
    ], 
    subraces: [
      { 
        name: "Hill Dwarf", 
        desc: "Insting bertahan hidup yang tak tertandingi dan intuisi tajam. Hill Dwarf dikenal luas ketangguhannya.", 
        bonuses: { WIS: 1 }, 
        traits: [{ name: "Dwarven Toughness", desc: "Maksimal HP Anda bertambah 1 setiap kali Anda naik level." }] 
      }, 
      { 
        name: "Mountain Dwarf", 
        desc: "Lebih kuat, lebih besar, dan terbiasa dengan medan pegunungan kasar. Mountain Dwarf dihormati sebagai prajurit handal.", 
        bonuses: { STR: 2 }, 
        traits: [{ name: "Dwarven Armor Training", desc: "Anda memiliki keahlian memakai Light dan Medium Armor secara alami." }] 
      }
    ] 
  },
  Elf: { 
    icon: "/images/races/elf.png", 
    imageFilter: "none", 
    desc: "Makhluk fey kuno dengan keanggunan mistis dan umur yang bisa mencapai lebih dari tujuh abad. Elf jarang memedulikan ambisi sesaat manusia; mereka hidup dengan kecepatan mereka sendiri, membaur secara harmonis dengan magis alam liar. Mereka menghargai kebebasan, kesenian tingkat tinggi, ilmu pedang bagai tarian, dan sihir yang mengalir murni seperti air terjun perak.", 
    speed: 30, 
    bonuses: { DEX: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dengan jelas di kegelapan total hingga jarak 60 kaki." }, 
      { name: "Keen Senses", desc: "Memiliki pendengaran dan penglihatan super tajam (Otomatis Proficient di skill Perception)." }, 
      { name: "Fey Ancestry", desc: "Sihir tidak bisa membuat Anda tertidur, dan Anda kebal (Advantage) terhadap sihir pesona (Charmed)." }, 
      { name: "Trance", desc: "Tidak butuh tidur normal. Cukup meditasi mendalam selama 4 jam (setara tidur 8 jam bagi ras lain) untuk pulih sepenuhnya." }
    ], 
    subraces: [
      { 
        name: "High Elf", 
        desc: "Elf berdarah murni dengan pikiran tajam dan afinitas sihir tinggi.", 
        bonuses: { INT: 1 }, 
        traits: [
          { name: "Elf Weapon Training", desc: "Anda mahir menggunakan Longsword, Shortsword, Shortbow, dan Longbow." },
          { name: "Cantrip", desc: "Mengetahui satu Cantrip sihir dari kelas Wizard (Spellcasting: Intelligence)." }, 
          { name: "Extra Language", desc: "Bisa berbicara, membaca, dan menulis satu bahasa ekstra tambahan." }
        ] 
      }, 
      { 
        name: "Wood Elf", 
        desc: "Elf liar yang berlari secepat angin di tengah lebatnya hutan.", 
        bonuses: { WIS: 1 }, 
        traits: [
          { name: "Elf Weapon Training", desc: "Anda mahir menggunakan Longsword, Shortsword, Shortbow, dan Longbow." },
          { name: "Fleet of Foot", desc: "Kecepatan gerak dasar Anda meningkat menjadi 35 kaki." }, 
          { name: "Mask of the Wild", desc: "Bisa mencoba bersembunyi (Hide) meski Anda hanya tertutup samar oleh dedaunan, hujan deras, badai salju, atau kabut." }
        ] 
      }, 
      { 
        name: "Drow (Dark Elf)", 
        desc: "Elf penguasa bawah tanah yang diberkati sihir gelap.", 
        bonuses: { CHA: 1 }, 
        traits: [
          { name: "Superior Darkvision", desc: "Penglihatan gelap meningkat hingga 120 kaki." }, 
          { name: "Sunlight Sensitivity", desc: "Anda mendapatkan Disadvantage pada serangan atau pengecekan Perception saat target Anda berada di bawah sinar matahari langsung." },
          { name: "Drow Magic", desc: "Anda tahu cantrip Dancing Lights. Saat level 3, Anda bisa merapal Faerie Fire 1x/hari. Level 5: Darkness 1x/hari. (Charisma)" },
          { name: "Drow Weapon Training", desc: "Mahir menggunakan Rapier, Shortsword, dan Hand Crossbow." }
        ] 
      }
    ] 
  },
  Halfling: { 
    icon: "/images/races/halfling.png", 
    imageFilter: "none", 
    desc: "Sangat mungil, lincah, dan tampaknya selalu dilindungi oleh keberuntungan mistis yang tak bisa dijelaskan akal sehat. Halfling mendambakan kehidupan yang damai, rumah yang hangat, dan hidangan melimpah. Namun, rasa penasaran sering kali mendorong ras mungil ini keluar dari pintu rumah mereka untuk menjelajahi dunia luas, membuktikan bahwa tubuh kecil bisa menyimpan nyali pahlawan terbesar.", 
    speed: 25, 
    bonuses: { DEX: 2 }, 
    traits: [
      { name: "Lucky", desc: "Jika Anda melempar angka 1 (Critical Miss) pada dadu d20 untuk serangan, ability check, atau saving throw, Anda bisa membuangnya dan melempar ulang, namun wajib menggunakan hasil yang baru." }, 
      { name: "Brave", desc: "Memiliki keberanian absolut, memberi keuntungan (Advantage) pada saving throw melawan efek rasa takut (Frightened)." }, 
      { name: "Halfling Nimbleness", desc: "Bisa menyelinap dan bergerak melintasi wilayah musuh asalkan ukuran mereka setidaknya satu kategori lebih besar dari Anda (contoh: Medium atau Large)." }
    ], 
    subraces: [
      { 
        name: "Lightfoot Halfling", 
        desc: "Paling lincah dan licin, mereka mudah berbaur and bersembunyi.", 
        bonuses: { CHA: 1 }, 
        traits: [{ name: "Naturally Stealthy", desc: "Bisa mencoba bersembunyi (Hide) meski Anda berada di belakang makhluk yang ukurannya minimal satu lebih besar dari Anda." }] 
      }, 
      { 
        name: "Stout Halfling", 
        desc: "Lebih kekar dari halfling biasa, konon memiliki darah kurcaci.", 
        bonuses: { CON: 1 }, 
        traits: [{ name: "Stout Resilience", desc: "Memiliki ketahanan alami terhadap racun (Advantage pada saving throw dan Resistance pada damage)." }] 
      }
    ] 
  },
  Gnome: { 
    icon: "/images/races/gnome.png", 
    imageFilter: "none", 
    desc: "Gnome memiliki tingkat energi, antusiasme, dan rasa ingin tahu yang bisa membuat ras lain kelelahan hanya dengan melihatnya. Sebagai penemu berbakat, pandai ilusi, dan peretas misteri alam semesta, Gnome melihat setiap objek dan rintangan sebagai teka-teki yang menyenangkan. Mereka kerap memadukan mekanika mesin dengan sihir ilusi, menciptakan alat (dan kadang ledakan) yang mengejutkan teman maupun lawan.", 
    speed: 25, 
    bonuses: { INT: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Gnome Cunning", desc: "Mendapatkan Advantage pada semua saving throw berbasis Intelligence, Wisdom, dan Charisma saat melawan sihir." }
    ], 
    subraces: [
      { 
        name: "Forest Gnome", 
        desc: "Gnome yang bersembunyi di hutan mistis dan berteman dengan satwa.", 
        bonuses: { DEX: 1 }, 
        traits: [
          { name: "Natural Illusionist", desc: "Otomatis menguasai cantrip Minor Illusion (Spellcasting: Intelligence)." }, 
          { name: "Speak with Small Beasts", desc: "Melalui gestur dan suara khusus, Anda bisa mengomunikasikan ide sederhana ke hewan kecil." }
        ] 
      }, 
      { 
        name: "Rock Gnome", 
        desc: "Penemu sejati, pembuat mesin jam tangan dan kotak musik presisi.", 
        bonuses: { CON: 1 }, 
        traits: [
          { name: "Artificer's Lore", desc: "Setiap kali Anda membuat check History tentang barang ajaib atau alat teknologi, tambahkan dua kali lipat proficiency Anda." },
          { name: "Tinker", desc: "Proficient dengan Tinker's tools. Mampu membuat perangkat mekanis kecil seperti Clockwork Toy, Fire Starter, atau Music Box." }
        ] 
      }
    ] 
  },
  Aasimar: { 
    icon: "/images/races/aasimar.png", 
    imageFilter: "none", 
    desc: "Di dalam nadi Aasimar, mengalir setitik cahaya ilahi dari alam para dewa (Celestial). Mereka ditakdirkan sejak lahir untuk menjadi pembawa keadilan suci di dunia yang dikepung bayang-bayang kejahatan. Meski berwujud mirip manusia, Aasimar didampingi oleh makhluk spiritual sebagai pembimbing misterius mereka, yang menuntun mereka untuk memenuhi tugas suci—atau memperingatkan mereka akan kejatuhan yang menanti jika menyimpang.", 
    speed: 30, 
    bonuses: { CHA: 2 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Celestial Resistance", desc: "Anda mendapatkan resistance (setengah damage) terhadap serangan berunsur Necrotic dan Radiant." }, 
      { name: "Healing Hands", desc: "Sebagai sebuah aksi, Anda dapat menyentuh makhluk untuk menyembuhkan HP sebesar Level karakter Anda. Dapat dipakai sekali per Long Rest." }, 
      { name: "Light Bearer", desc: "Secara bawaan Anda mengetahui cantrip Light (Charisma)." }
    ], 
    subraces: [
      { 
        name: "Protector Aasimar", 
        desc: "Bertugas melindungi yang lemah. Dapat memunculkan sayap cahaya murni.", 
        bonuses: { WIS: 1 }, 
        traits: [{ name: "Radiant Soul", desc: "Mulai level 3, Anda bisa melepaskan divine energy. Muncul sayap dari cahaya (Fly speed 30ft) selama 1 menit. Tiap giliran, 1 target serangan Anda menerima ekstra radiant damage sebesar level Anda." }] 
      }, 
      { 
        name: "Scourge Aasimar", 
        desc: "Diresapi energi penghancur jahat. Mereka memakai topeng untuk menutupi cahaya menyilaukan.", 
        bonuses: { CON: 1 }, 
        traits: [{ name: "Radiant Consumption", desc: "Mulai level 3, Anda memancarkan cahaya menyilaukan. Selama 1 menit, Anda & makhluk dalam 10 kaki menerima radiant damage (setengah level Anda), dan ekstra damage pada 1 serangan per giliran." }] 
      }, 
      { 
        name: "Fallen Aasimar", 
        desc: "Telah kehilangan cahayanya, sayap mereka gugur dan auranya menjadi menakutkan.", 
        bonuses: { STR: 1 }, 
        traits: [{ name: "Necrotic Shroud", desc: "Mulai level 3, Anda memancarkan kegelapan & sayap hitam. Makhluk di 10 kaki harus Charisma saving throw atau ketakutan (Frightened). Satu serangan Anda tiap giliran dapat bonus necrotic damage sebesar level." }] 
      }
    ] 
  },
  Dragonborn: { 
    icon: "/images/monster_dragon.png", 
    imageFilter: "hue-rotate(-35deg) saturate(2) brightness(1.1)", 
    desc: "Menjulang tinggi dengan tubuh dilapisi sisik tebal mirip leluhur naga mereka, Dragonborn merupakan pemandangan yang mengintimidasi sekaligus menakjubkan. Mereka tidak memiliki ekor maupun sayap, melainkan berdiri tegak layaknya manusia, dan mewarisi semburan elemen destruktif leluhur draconic mereka. Kehormatan klan adalah hal mutlak bagi Dragonborn—lebih penting dari kehidupan itu sendiri.", 
    speed: 30, 
    bonuses: { STR: 2, CHA: 1 }, 
    traits: [
      { name: "Draconic Ancestry", desc: "Anda memilih satu jenis naga (Black, Blue, Brass, Bronze, Copper, Gold, Green, Red, Silver, White) yang menentukan damage type nafas dan resistance Anda." }, 
      { name: "Breath Weapon", desc: "Sebagai sebuah aksi, Anda dapat menyemburkan energi destruktif sesuai Ancestry Anda. Setiap musuh di area (garis 30ft atau kerucut 15ft) harus melakukan Saving Throw atau menerima damage (2d6 di level 1, meningkat di level lebih tinggi)." }, 
      { name: "Damage Resistance", desc: "Anda mendapatkan Resistance permanen terhadap elemen/tipe kerusakan yang terkait dengan nenek moyang Draconic Anda." }
    ] 
  },
  "Half-Elf": { 
    icon: "/images/hero_astral.png", 
    imageFilter: "hue-rotate(30deg) saturate(1.3) brightness(1.0)", 
    desc: "Bagi manusia, Half-Elf terlihat layaknya Elf; bagi Elf, mereka terlihat seperti manusia. Lahir dari dua peradaban besar, mereka mewarisi sisi terbaik dari kedua belah pihak: keanggunan, bakat sihir, dan pendengaran tajam Elf, dipadukan dengan ambisi, energi tak kenal lelah, dan rasa penemuan tanpa batas dari ras Manusia. Sayangnya, mereka sering kali merasa tak sepenuhnya diterima di masyarakat mana pun.", 
    speed: 30, 
    bonuses: { CHA: 2, DEX: 1, INT: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Fey Ancestry", desc: "Mendapatkan Advantage melawan sihir penidur, dan kebal dari status Charmed." }, 
      { name: "Skill Versatility", desc: "Anda mendapatkan Proficiency pada dua keterampilan (skills) pilihan Anda sendiri." }
    ] 
  },
  "Half-Orc": { 
    icon: "/images/classes/barbarian.png", 
    imageFilter: "hue-rotate(100deg) saturate(0.9) brightness(0.8) contrast(1.2)", 
    desc: "Memiliki tubuh tinggi kekar dengan kulit keabu-abuan atau hijau kusam, gigi taring menonjol, dan otot yang terukir dari pertarungan konstan. Half-Orc mewarisi kekuatan buas dan ketahanan brutal dari darah Orc, membuat mereka menjadi sosok prajurit atau penjaga bayaran yang sangat ditakuti. Meski sering menghadapi prasangka dari ras beradab, banyak Half-Orc membuktikan bahwa hati mereka bisa lebih mulia (dan lebih setia) daripada manusia mana pun.", 
    speed: 30, 
    bonuses: { STR: 2, CON: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Menacing", desc: "Penampilan Anda mengintimidasi. Anda otomatis Proficient pada skill Intimidation." }, 
      { name: "Relentless Endurance", desc: "Ketika nyawa (HP) Anda turun menjadi 0 namun tidak terbunuh langsung (Instant Death), Anda bisa memilih untuk turun ke 1 HP saja. Bisa digunakan sekali per Long Rest." }, 
      { name: "Savage Attacks", desc: "Saat mendapatkan Critical Hit memakai serangan senjata jarak dekat, Anda bisa melempar salah satu dadu senjata sekali lagi dan menambahkannya ke total kerusakan kritikal tersebut." }
    ] 
  },
  Human: { 
    icon: "/images/classes/fighter.png", 
    imageFilter: "saturate(1.05) contrast(1.05)", 
    desc: "Manusia adalah ras paling muda, berumur pendek, namun memiliki dorongan dan ambisi yang melampaui semua ras lainnya. Karena tidak memiliki umur panjang seperti Elf atau memori genetik seperti Dwarf, mereka terobsesi untuk meninggalkan jejak monumental dalam sejarah—baik sebagai penakluk tiran, arsitek kerajaan megah, maupun pahlawan legendaris. Adaptabilitas mereka yang luar biasa memungkinkan mereka berkembang di setiap sudut dunia.", 
    speed: 30, 
    bonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 }, 
    traits: [
      { name: "Adaptability", desc: "Mendapatkan peningkatankan +1 untuk SELURUH enam atribut Ability Scores." }, 
      { name: "Extra Language", desc: "Dapat berbicara, membaca, dan menulis satu bahasa ekstra secara bebas pilihan Anda." }
    ] 
  },
  Tiefling: { 
    icon: "/images/hero_arcane.png", 
    imageFilter: "hue-rotate(-60deg) saturate(2.4) brightness(0.9) contrast(1.25)", 
    desc: "Manusia yang menanggung dosa leluhur mereka, mewarisi kutukan darah penguasa dimensi neraka (Fiend). Dengan kulit kemerahan, tanduk iblis melingkar, mata tak bermata putih, dan ekor berduri, mereka memancarkan aura bahaya misterius. Meski penampilan mereka sering kali memicu teror dan pengasingan dari penduduk desa yang takhyul, Tiefling sejatinya memiliki kebebasan mutlak untuk memilih takdir magis mereka sendiri—menjadi monster seperti kata orang, atau pahlawan sejati.", 
    speed: 30, 
    bonuses: { CHA: 2, INT: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Hellish Resistance", desc: "Memiliki ketahanan alami (Resistance) terhadap elemen api (Fire Damage berkurang setengahnya)." }, 
      { name: "Infernal Legacy", desc: "Secara bawaan Anda mengetahui cantrip Thaumaturgy. Pada level 3 dapat merapal Hellish Rebuke (Level 2). Pada level 5 dapat merapal Darkness. Semua mereset per Long Rest (Spellcasting: Charisma)." }
    ] 
  },
  Goliath: { 
    icon: "/images/classes/barbarian.png", 
    imageFilter: "grayscale(0.7) brightness(1.15) contrast(1.25)", 
    desc: "Berkerabat jauh dengan raksasa batu, Goliath adalah sosok manusia raksasa setinggi lebih dari tujuh kaki dengan kulit keras bagai batu granit. Mereka hidup di puncak-puncak pegunungan bersalju yang tak tertembus, mengukur nilai kehidupan berdasarkan kompetisi fisik tanpa ampun dan keunggulan kekuatan mentah. Kelemahan adalah dosa terbesar, namun mereka memiliki ikatan komunitas persaudaraan kuat yang tak akan membiarkan rekan setimnya tertinggal.", 
    speed: 30, 
    bonuses: { STR: 2, CON: 1 }, 
    traits: [
      { name: "Natural Athlete", desc: "Anda otomatis mendapatkan Proficiency dalam skill Athletics." }, 
      { name: "Stone's Endurance", desc: "Ketika menerima kerusakan, gunakan reaksi (Reaction) untuk melempar 1d12 + CON Mod. Kurangi kerusakan total dari serangan tersebut sebesar hasil lemparan. Dapat dipakai sekali per Short/Long Rest." }, 
      { name: "Powerful Build", desc: "Tubuh raksasa ini membuat Anda dianggap 1 ukuran (Size) lebih besar dalam hal kapasitas membawa beban angkat/dorong/tarik (Carrying Capacity)." },
      { name: "Mountain Born", desc: "Tahan terhadap cuaca dingin ekstrem dan kebal dari efek negatif berada di dataran yang sangat tinggi (High Altitude)." }
    ] 
  },
  Tabaxi: { 
    icon: "/images/classes/rogue.png", 
    imageFilter: "hue-rotate(25deg) saturate(1.6) sepia(0.4) brightness(0.95)", 
    desc: "Ras manusia-kucing berkaki lincah yang berasal dari hutan hujan tropis jauh di seberang samudra. Digerakkan bukan oleh emas atau kejayaan, melainkan oleh rasa penasaran obsesif terhadap relik-relik misterius, rahasia kuno, dan kisah-kisah legenda yang belum pernah mereka dengar. Kelincahan tak terduga dan cakar alami mereka menjadikan para Tabaxi pengintai dan pemanjat terhebat yang pernah ada.", 
    speed: 30, 
    bonuses: { DEX: 2, CHA: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki." }, 
      { name: "Feline Agility", desc: "Saat bergerak pada giliran Anda di pertempuran, Anda bisa menggandakan pergerakan (Speed) hingga ujung turn itu. Anda harus tidak bergerak 1 putaran penuh (0ft) agar fitur ini bisa tereset." }, 
      { name: "Cat's Claws", desc: "Cakar Anda adalah senjata mematikan (Unarmed Strike: 1d4 + STR slahing) dan memberikan Anda Climbing Speed setara 20 kaki." }, 
      { name: "Cat's Talent", desc: "Berkat insting kucing predator, Anda otomatis Proficient pada skill Perception dan Stealth." }
    ] 
  },
  Tortle: { 
    icon: "/images/classes/paladin.png", 
    imageFilter: "hue-rotate(90deg) saturate(0.8) brightness(0.8) contrast(1.1)", 
    desc: "Ras bipedal menyerupai kura-kura raksasa berumur panjang, yang terlahir sebagai nomaden pengembara. Menjelajahi padang gurun hingga rawa pasang surut, Tortle tidak pernah tersesat karena 'rumah' teraman mereka berupa cangkang keras permanen selalu ada di punggung. Ketenangan spiritual yang tak tergoyahkan membuat mereka tak ternilai sebagai kawan di kala krisis, dan mereka ahli bertahan hidup di tengah alam ekstrem.", 
    speed: 30, 
    bonuses: { STR: 2, WIS: 1 }, 
    traits: [
      { name: "Natural Armor", desc: "Cangkang alami yang tebal mengatur AC Anda menjadi 17 secara permanen (Dexterity tidak memengaruhi ini, dan Anda tidak bisa memakai Armor luar biasa)." }, 
      { name: "Shell Defense", desc: "Sebagai sebuah aksi, menarik diri ke cangkang. Anda mendapat +4 AC dan Advantage pada CON dan STR saves. Anda menjadi Rawan (Prone) dan kecepatan 0. Tidak bisa melakukan aksi selain muncul kembali (Bonus Action)." }, 
      { name: "Hold Breath", desc: "Dapat menahan napas Anda terus-menerus selama 1 jam tanpa sesak." },
      { name: "Claws", desc: "Bisa menggunakan serangan cakar natural. Unarmed Strike menjadi 1d4 + STR slashing damage." }
    ] 
  },
  Kenku: { 
    icon: "/images/classes/rogue.png", 
    imageFilter: "grayscale(1) brightness(0.3) contrast(1.5)", 
    desc: "Manusia-burung gagak misterius yang hidup di lorong gelap kota metropolitan, kehilangan sayap dan kebebasan terbang mereka karena sebuah kutukan kosmis kuno. Tanpa memiliki percikan kreativitas mandiri, Kenku berevolusi menjadi ahli meniru ulung. Mereka berkomunikasi secara akurat dengan menyalin bunyi lingkungan sekitar, atau memalsukan dokumen dengan akurasi seratus persen berbekal ingatan visual mereka yang luar biasa tajam.", 
    speed: 30, 
    bonuses: { DEX: 2, WIS: 1 }, 
    traits: [
      { name: "Mimicry", desc: "Mampu meniru SEMUA suara yang pernah Anda dengar dengan sempurna, termasuk suara monster atau pembicaraan rahasia." }, 
      { name: "Expert Forgery", desc: "Memiliki Advantage mutlak (Keuntungan ganda) saat memalsukan surat, dokumen tulisan tangan, segel, dan objek buatan orang lain." }, 
      { name: "Kenku Training", desc: "Mendapat dua keahlian (Skill Proficiency) pilihan dari daftar: Acrobatics, Deception, Stealth, dan Sleight of Hand." }
    ] 
  },
  Goblin: { 
    icon: "/images/classes/rogue.png", 
    imageFilter: "hue-rotate(130deg) saturate(1.7) brightness(0.8) contrast(1.2)", 
    desc: "Makhluk bertelinga panjang lancip kelam, bermata tajam, dengan kulit kehijauan dan ukuran badan mungil yang kerap dianggap rendah di dunia permukaan. Namun, Goblin menyembunyikan naluri bertahan hidup absolut yang tiada duanya; mereka bergerak tanpa suara di kegelapan, sangat licin, dan siap menikam musuh yang tiga kali lebih besar memanfaatkan taktik oportunis kotor (namun sangat mematikan).", 
    speed: 30, 
    bonuses: { DEX: 2, CON: 1 }, 
    traits: [
      { name: "Darkvision", desc: "Mampu melihat dalam kegelapan hingga jarak 60 kaki secara terang." }, 
      { name: "Fury of the Small", desc: "Saat menyerang dan melukai musuh dengan ukuran lebih besar, Anda menambahkan jumlah damage ekstra setara level Anda. (Sekali per Short/Long Rest)." }, 
      { name: "Nimble Escape", desc: "Anda bisa mengambil aksi sembunyi (Hide) atau lari (Disengage) dengan menggunakan aksi bonus (Bonus Action) pada giliran tempur Anda." }
    ] 
  }
};
