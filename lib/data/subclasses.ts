export const SUBCLASSES: Record<string, {name: string, desc: string, bonuses?: string[]}[]> = {
  Barbarian: [
    {name: "Path of the Berserker", desc: "Mampu masuk ke dalam Frenzy. Mereka mengabaikan rasa sakit dan batasan fisik demi mendaratkan rentetan serangan mematikan yang tak bisa ditangkis.", bonuses: ["Frenzy (Bonus Action Attack)", "Mindless Rage (Immune to Charm/Frighten)"]}, 
    {name: "Path of the Totem Warrior", desc: "Menerima bimbingan pelindung gaib. Roh Beruang memberi ketahanan absolut, Elang menajamkan penglihatan, dan Serigala menginspirasi kawan.", bonuses: ["Spirit Seeker (Speak with Animals)", "Totem Spirit (Resistance/Mobility/Tactics)"]}
  ],
  Bard: [
    {name: "College of Lore", desc: "Pengumpul rahasia magis purba yang menggunakan pengetahuannya untuk mencela musuh dengan kata-kata magis yang melemahkan mental mereka.", bonuses: ["Bonus Proficiencies (3 Skills Any)", "Cutting Words (Reduce Enemy Rolls)"]}, 
    {name: "College of Valor", desc: "Skald heroik yang terjun ke garis depan dengan pedang, menyanyikan kidung perang untuk membakar semangat tempur kawan-kawannya.", bonuses: ["Bonus Proficiencies (Medium Armor, Shields, Martial Wpns)", "Combat Inspiration"]}
  ],
  Cleric: [
    {name: "Knowledge Domain", desc: "Membaktikan diri pada pencarian ilmu pengetahuan, masa lalu, dan rahasia kosmis melalui berkah dewa kebijaksanaan.", bonuses: ["Domain Spells (Command, Identify)", "Blessings of Knowledge (2 Languages, 2 Skills)"]},
    {name: "Life Domain", desc: "Ahli sihir penyembuhan paling murni. Mereka merepresentasikan energi positif absolut yang melindungi sekutu dari ambang kematian.", bonuses: ["Domain Spells (Bless, Cure Wounds)", "Bonus Proficiency (Heavy Armor)", "Disciple of Life (+Healing)"]}, 
    {name: "Light Domain", desc: "Pelayan dewa matahari yang memanipulasi kekuatan api dan cahaya menyilaukan untuk membakar musuh-musuh dan para penyembah kegelapan.", bonuses: ["Domain Spells (Burning Hands, Faerie Fire)", "Bonus Cantrip (Light)", "Warding Flare (Impose Disadvantage)"]},
    {name: "Nature Domain", desc: "Pelayan dewa alam liar yang memiliki kemampuan memanipulasi elemen hewan dan tumbuhan untuk melindungi ciptaan alami.", bonuses: ["Domain Spells (Animal Friendship, Speak with Animals)", "Acolyte of Nature (Druid Cantrip, Skill)"]},
    {name: "Tempest Domain", desc: "Membawa amarah badai, petir, dan guruh ke medan tempur. Mereka adalah perwujudan badai yang tak tertahankan.", bonuses: ["Domain Spells (Fog Cloud, Thunderwave)", "Bonus Proficiencies (Martial Wpns, Heavy Armor)", "Wrath of the Storm (Retaliation Damage)"]},
    {name: "Trickery Domain", desc: "Pendeta penipu yang menggunakan sihir ilusi dan siluman. Memuja dewa-dewa kekacauan, penipuan, atau pencurian.", bonuses: ["Domain Spells (Charm Person, Disguise Self)", "Blessing of the Trickster (Advantage on Stealth)"]},
    {name: "War Domain", desc: "Pendeta tempur berbaju zirah pelat tebal yang diberkati kemampuan menyerang berkali-kali atas nama dewa peperangan suci.", bonuses: ["Domain Spells (Divine Favor, Shield of Faith)", "Bonus Proficiencies (Heavy Armor, Martial Wpns)", "War Priest (Bonus Attack)"]}
  ],
  Druid: [
    {name: "Circle of the Land", desc: "Mistikus yang terikat kuat dengan magis spesifik dari topografi asal mereka, memberikan akses ke berbagai mantra rahasia alam yang kuat.", bonuses: ["Bonus Cantrip", "Natural Recovery (Restore Spell Slots)"]}, 
    {name: "Circle of the Moon", desc: "Pelindung keganasan liar yang memfokuskan sihir mereka sepenuhnya pada seni perubahan wujud (Wild Shape) menjadi monster karnivora buas.", bonuses: ["Combat Wild Shape (Bonus Action)", "Circle Forms (Higher CR Beasts)"]}
  ],
  Fighter: [
    {name: "Champion", desc: "Perwujudan dari kekuatan mentah dan kesempurnaan fisik. Mereka mendominasi musuh dengan serangan kritikal (Critical Hit) yang mematikan dan presisi tinggi.", bonuses: ["Improved Critical (Crit on 19 or 20)"]}, 
    {name: "Battle Master", desc: "Jenius taktis dan komandan veteran yang menggunakan berbagai 'Manuver Tempur' khusus untuk melucuti senjata, menjatuhkan, atau mengecoh musuh.", bonuses: ["Combat Superiority (3 Maneuvers)", "Student of War (Artisan's Tools)"]},
    {name: "Eldritch Knight", desc: "Prajurit elitis yang memadukan ilmu pedang tingkat tinggi dengan sihir elemen mematikan (Evokasi) dan tameng pelindung gaib (Abjurasi).", bonuses: ["Spellcasting (Wizard Spells)", "Weapon Bond (Summon Weapon)"]}
  ],
  Monk: [
    {name: "Way of the Open Hand", desc: "Master pertarungan tangan kosong. Mereka dapat memanipulasi titik Ki di tubuh musuh untuk melempar, memukul mundur, atau menghancurkan organ vital musuh seketika.", bonuses: ["Open Hand Technique (Knockdown/Push/Stagger)"]}, 
    {name: "Way of Shadow", desc: "Kultus pembunuh rahasia yang memanfaatkan energi gelap untuk berteleportasi dari satu bayangan ke bayangan lain, menyergap korban tanpa suara.", bonuses: ["Shadow Arts (Minor Illusion, Pass Without Trace, Darkness, Silence)"]},
    {name: "Way of the Four Elements", desc: "Biksu mistis yang mampu menyalurkan Ki mereka untuk memanipulasi elemen dasar (Api, Air, Bumi, Angin) di alam semesta.", bonuses: ["Disciple of the Elements (Elemental Disciplines)"]}
  ],
  Paladin: [
    {name: "Oath of Devotion", desc: "Kesatria ideal yang mengikat sumpah pada kejujuran dan kehormatan. Pedang mereka bersinar dengan cahaya suci yang mengusir setan dan iblis kembali ke asalnya.", bonuses: ["Oath Spells (Protection from Evil, Sanctuary)", "Channel Divinity (Sacred Weapon, Turn the Unholy)"]}, 
    {name: "Oath of the Ancients", desc: "Kesatria hijau yang bersumpah melestarikan keindahan alam. Mereka kebal terhadap pengaruh fey dan sihir gelap demi menjaga cahaya kosmis.", bonuses: ["Oath Spells (Ensnaring Strike, Speak with Animals)", "Channel Divinity (Nature's Wrath, Turn the Faithless)"]},
    {name: "Oath of Vengeance", desc: "Malaikat maut yang mengikat sumpah darah. Mereka mengabaikan belas kasih demi memburu dan memusnahkan pendosa besar tanpa henti dan tanpa ampun.", bonuses: ["Oath Spells (Bane, Hunter's Mark)", "Channel Divinity (Abjure Enemy, Vow of Enmity)"]}
  ],
  Ranger: [
    {name: "Hunter", desc: "Ahli taktik yang memfokuskan diri untuk membunuh tipe monster spesifik, baik itu membantai kerumunan Orc liar atau merobohkan Raksasa seorang diri.", bonuses: ["Hunter's Prey (Colossus Slayer / Giant Killer / Horde Breaker)"]}, 
    {name: "Beast Master", desc: "Membentuk ikatan telepati magis dengan seekor hewan buas (seperti serigala atau elang) yang bertarung berdampingan di medan pertempuran mematikan.", bonuses: ["Ranger's Companion (Beast Pet)"]}
  ],
  Rogue: [
    {name: "Thief", desc: "Pencuri jalanan dengan kelincahan super. Mereka memanjat dinding bagai laba-laba, bereaksi sangat cepat, dan dapat menggunakan artefak sihir tanpa batasannya.", bonuses: ["Fast Hands (Bonus Action Item Use)", "Second-Story Work (Climbing Speed)"]}, 
    {name: "Assassin", desc: "Ekskutor profesional berdarah dingin. Ahli menyamar, meracik racun, dan memberikan serangan kritikal instan kepada target yang tidak menyadari kehadiran mereka.", bonuses: ["Bonus Proficiencies (Disguise Kit, Poisoner's Kit)", "Assassinate (Advantage & Crit on Surprised)"]},
    {name: "Arcane Trickster", desc: "Pencuri yang memberdayakan kelicikan mereka dengan sihir ilusi dan pesona. Tangan gaib (Mage Hand) mereka bisa mencuri benda dari kantong Anda tanpa terlihat.", bonuses: ["Spellcasting (Wizard Spells)", "Mage Hand Legerdemain (Invisible Hand)"]}
  ],
  Sorcerer: [
    {name: "Draconic Bloodline", desc: "Sihir dari warisan naga kuno. Tumbuh sisik tak terlihat yang melindungi fisik mereka, dan mantra elemen mereka mewarisi keganasan warna naga leluhur mereka.", bonuses: ["Dragon Ancestor (Element Affinity)", "Draconic Resilience (+1 HP/Lvl, 13+DEX AC)"]}, 
    {name: "Wild Magic", desc: "Sihirnya berasal dari kekacauan multiverse. Setiap kali merapal mantra mistis, anomali magis acak bisa terjadi—entah itu ledakan hebat, atau mengubah diri sendiri menjadi domba.", bonuses: ["Wild Magic Surge (Random Magic Effects)", "Tides of Chaos (Advantage for a Surge)"]}
  ],
  Warlock: [
    {name: "The Archfey", desc: "Kekuatan hasil pakta dengan penguasa ras peri. Mereka spesialis memanipulasi emosi, menciptakan ilusi menakutkan, dan mengendalikan pikiran mahluk hidup dengan paksa.", bonuses: ["Expanded Spell List (Faerie Fire, Sleep)", "Fey Presence (Charm/Frighten AoE)"]},
    {name: "The Fiend", desc: "Kekuatan hasil pakta dengan entitas neraka terdalam. Mereka ahli memanggil lautan api neraka, dan meregenerasi kekuatan setiap kali mengorbankan nyawa lawan.", bonuses: ["Expanded Spell List (Burning Hands, Command)", "Dark One's Blessing (Temp HP on Kill)"]}, 
    {name: "The Great Old One", desc: "Kekuatan hasil pakta dengan entitas kosmis kuno tak bernama. Mereka bisa berkomunikasi secara telepati dan menggunakan sihir yang menghancurkan kewarasan pikiran musuh.", bonuses: ["Expanded Spell List (Dissonant Whispers, Tasha's Laughter)", "Awakened Mind (Telepathy 30ft)"]}
  ],
  Wizard: [
    {name: "School of Abjuration", desc: "Pelindung mutlak. Mereka menciptakan perisai mistis yang menyerap serangan, menolak sihir musuh, dan menghalau entitas sihir masuk.", bonuses: ["Abjuration Savant (Half Cost)", "Arcane Ward (Magical HP Shield)"]},
    {name: "School of Conjuration", desc: "Spesialisasi menembus dimensi ruang untuk memanggil makhluk hidup, energi ajaib, dan objek fisik murni dari ketiadaan absolut.", bonuses: ["Conjuration Savant (Half Cost)", "Minor Conjuration (Create Small Objects)"]},
    {name: "School of Divination", desc: "Bisa melihat jalinan masa depan, masa lalu, dan rahasia yang paling tersembunyi. Ahli sihir ramalan bisa memanipulasi guliran dadu takdir.", bonuses: ["Divination Savant (Half Cost)", "Portent (Store 2 d20 Rolls)"]},
    {name: "School of Enchantment", desc: "Spesialisasi memanipulasi pikiran, ingatan, dan emosi makhluk hidup, membengkokkan kehendak mereka menjadi boneka penurut.", bonuses: ["Enchantment Savant (Half Cost)", "Hypnotic Gaze (Charm/Incapacitate target)"]},
    {name: "School of Evocation", desc: "Ahli merakit ledakan murni seperti Fireball atau Lightning Bolt. Mereka bahkan bisa melindungi kawan dari jangkauan efek ledakan sihir destruktif mereka sendiri.", bonuses: ["Evocation Savant (Half Cost)", "Sculpt Spells (Protect Allies from AoE)"]}, 
    {name: "School of Illusion", desc: "Spesialisasi menipu indera dan pikiran manusia dengan ilusi visual serta suara yang luar biasa realistis, memutarbalikkan realita target.", bonuses: ["Illusion Savant (Half Cost)", "Improved Minor Illusion (Both Sound & Image)"]},
    {name: "School of Necromancy", desc: "Spesialisasi memanipulasi energi kehidupan kosmis dan merangkul kematian, menghisap nyawa dan membangkitkan pasukan mayat hidup.", bonuses: ["Necromancy Savant (Half Cost)", "Grim Harvest (Heal on Kill)"]},
    {name: "School of Transmutation", desc: "Spesialisasi mengubah energi dan materi benda fisik dari satu wujud ke wujud lain. Seperti mengubah besi menjadi perak murni.", bonuses: ["Transmutation Savant (Half Cost)", "Minor Alchemy (Alter Physical Materials)"]}
  ],
};
