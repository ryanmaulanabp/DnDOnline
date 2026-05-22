export const BACKGROUNDS: Record<string, { desc: string, skills: string[]; equipment: string[] }> = {
  Acolyte: { 
    desc: "Anda telah menghabiskan sebagian besar hidup Anda melayani di sebuah kuil, kuil suci, atau kelompok biara. Berbeda dengan pendeta biasa, Anda diyakini memiliki ikatan spiritual langsung dengan entitas surgawi. Pengetahuan Anda tentang ritual keagamaan, doa kuno, dan hierarki divine menjadikan Anda sosok yang dihormati (atau ditakuti) oleh rakyat jelata yang mencari keselamatan jiwa.", 
    skills: ["Insight", "Religion"], 
    equipment: ["A holy symbol (amulet/emblem)", "A prayer book or prayer wheel", "5 sticks of incense", "Vestments", "A set of common clothes", "15 gp"] 
  },
  Charlatan: { 
    desc: "Dunia adalah panggung sandiwara, dan Anda adalah aktor utamanya. Penipuan adalah seni tinggi yang Anda kuasai untuk bertahan hidup dan mencari keuntungan. Baik dengan memalsukan identitas sebagai bangsawan asing, menjual ramuan ajaib palsu, atau mencurangi permainan kartu, Anda tahu persis cara membaca hasrat tersembunyi target dan memanfaatkannya dengan senyum memikat.", 
    skills: ["Deception", "Sleight of Hand"], 
    equipment: ["A set of fine clothes", "A disguise kit", "Tools of the con of your choice (ten stoppered bottles filled with colored liquid, a set of weighted dice, a deck of marked cards, or a signet ring of an imaginary duke)", "15 gp"] 
  },
  Criminal: { 
    desc: "Anda memiliki sejarah panjang melanggar hukum, tumbuh di lorong-lorong gelap dan kedai bawah tanah. Sebagai veteran dunia kriminal, Anda memiliki kontak penyelundup, pencuri, dan pembunuh bayaran. Anda telah belajar sejak dini bahwa hukum hanyalah jaring laba-laba yang menangkap yang lemah, dan Anda menolak menjadi korbannya.", 
    skills: ["Deception", "Stealth"], 
    equipment: ["A crowbar", "A set of dark common clothes including a hood", "15 gp"] 
  },
  Entertainer: { 
    desc: "Anda berkembang pesat di bawah sorotan lampu panggung dan tatapan kagum keramaian. Sebagai musisi, penyair, atau penari, Anda mampu menghidupkan suasana di kastil megah maupun kedai kumuh. Seni Anda bukan sekadar hiburan; ia adalah alat penawar duka, penyebar berita, dan terkadang sarana diplomasi tak terduga.", 
    skills: ["Acrobatics", "Performance"], 
    equipment: ["A musical instrument (one of your choice)", "The favor of an admirer (love letter, lock of hair, or trinket)", "A costume", "15 gp"] 
  },
  "Folk Hero": { 
    desc: "Anda lahir di tengah kemiskinan dan penderitaan, namun takdir memilih Anda untuk bangkit menentang tirani. Entah Anda menyelamatkan desa dari serangan monster, atau memimpin pemberontakan melawan tuan tanah kejam, nama Anda kini menjadi legenda yang dibisikkan dengan penuh harapan di antara rakyat jelata.", 
    skills: ["Animal Handling", "Survival"], 
    equipment: ["A set of artisan's tools (one of your choice)", "A shovel", "An iron pot", "A set of common clothes", "10 gp"] 
  },
  "Guild Artisan": { 
    desc: "Anda adalah anggota dihormati dari serikat pekerja terkemuka (Guild), di mana Anda mengasah keahlian Anda dalam seni menempa senjata, menenun sutra, atau meracik alkimia. Keterampilan ini memberi Anda posisi sosial dan perlindungan kuat, memungkinkan Anda bernegosiasi dengan bangsawan tertinggi berbekal karya agung dari tangan Anda.", 
    skills: ["Insight", "Persuasion"], 
    equipment: ["A set of artisan's tools (one of your choice)", "A letter of introduction from your guild", "A set of traveler's clothes", "15 gp"] 
  },
  Hermit: { 
    desc: "Anda pernah mengasingkan diri di biara terpencil, gunung terlarang, atau hutan purba jauh dari peradaban yang bising. Selama masa pengasingan itu, Anda merenung dalam kesunyian absolut dan menerima sebuah Pencerahan—rahasia kosmis, pengetahuan terlarang, atau visi masa depan yang kini memandu langkah Anda kembali ke dunia fana.", 
    skills: ["Medicine", "Religion"], 
    equipment: ["A scroll case stuffed with notes from your studies or prayers", "A winter blanket", "A set of common clothes", "A herbalism kit", "5 gp"] 
  },
  Noble: { 
    desc: "Anda terlahir di ranjang berhias emas, memegang gelar bangsawan sejak napas pertama. Darah yang mengalir di nadi Anda diyakini memiliki hak ilahi untuk memimpin dan memerintah. Kekayaan dan privilese ini membuka banyak pintu, tetapi sekaligus membawa beban intrik politik, konspirasi istana, dan kewajiban mempertahankan kehormatan keluarga.", 
    skills: ["History", "Persuasion"], 
    equipment: ["A set of fine clothes", "A signet ring", "A scroll of pedigree", "25 gp"] 
  },
  Outlander: { 
    desc: "Anda dibesarkan jauh di ujung peradaban dunia, membaur dengan suku pedalaman atau mengembara di tundra es tanpa akhir. Hukum rimba adalah satu-satunya aturan yang Anda pahami; Anda bisa melacak mangsa melalui jejak tak kasat mata, mengidentifikasi flora beracun, dan bertahan hidup dari buasnya alam dengan insting primitif.", 
    skills: ["Athletics", "Survival"], 
    equipment: ["A staff", "A hunting trap", "A trophy from an animal you killed", "A set of traveler's clothes", "10 gp"] 
  },
  Sage: { 
    desc: "Aroma kertas tua, debu perkamen, dan tinta hitam pekat adalah udara yang Anda hirup. Anda menghabiskan sebagian besar hidup meneliti di universitas besar, menara sihir, atau arsip purba. Obsesi Anda terhadap misteri multiverse membuat Anda menguasai sejarah berdarah peradaban runtuh dan anomali magis dunia.", 
    skills: ["Arcana", "History"], 
    equipment: ["A bottle of black ink", "A quill", "A small knife", "A letter from a dead colleague posing a question you have not yet been able to answer", "A set of common clothes", "10 gp"] 
  },
  Sailor: { 
    desc: "Bagi Anda, deru ombak mematikan jauh lebih menenangkan daripada dataran stabil. Sebagai pelaut tangguh, Anda telah menghadapi badai ganas, perompak tak kenal ampun, dan teror kraken dari jurang lautan lepas. Pengalaman ini menggembleng fisik dan mental Anda, mengubah Anda menjadi sosok tahan banting yang bisa beradaptasi di segala situasi darurat.", 
    skills: ["Athletics", "Perception"], 
    equipment: ["A belaying pin (club)", "50 feet of silk rope", "A lucky charm such as a rabbit foot or a small stone with a hole in the center", "A set of common clothes", "10 gp"] 
  },
  Soldier: { 
    desc: "Anda ditempa oleh api peperangan. Taktik militer, jeritan pasukan terluka, dan denting pedang bertubrukan telah mengukir trauma sekaligus kedisiplinan keras dalam jiwa Anda. Baik sebagai prajurit kavaleri legiun terhormat atau tentara bayaran, Anda menguasai strategi pertarungan sejati yang membedakan hidup dan mati di garis depan.", 
    skills: ["Athletics", "Intimidation"], 
    equipment: ["An insignia of rank", "A trophy taken from a fallen enemy (a dagger, broken blade, or piece of a banner)", "A set of bone dice or deck of cards", "A set of common clothes", "10 gp"] 
  },
  Urchin: { 
    desc: "Anda lahir tanpa kasih sayang, menjadi anak jalanan malang yang terabaikan oleh megahnya kota metropolis. Berlari telanjang kaki di lorong kotor, tidur bersama tikus got, dan mencuri roti basi demi bertahan hidup. Masa lalu kelam ini menjadikan Anda tangkas, sulit dilacak, dan peka terhadap gerak-gerik sekecil apapun di lingkungan urban.", 
    skills: ["Sleight of Hand", "Stealth"], 
    equipment: ["A small knife", "A map of the city you grew up in", "A pet mouse", "A token to remember your parents by", "A set of common clothes", "10 gp"] 
  }
};
