# 🐉 DnDOnline: Professional D&D Character Builder

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-orange?style=for-the-badge)

**Realm Forge** adalah platform manajemen karakter Dungeons & Dragons (D&D 5e) interaktif yang dirancang untuk memberikan pengalaman pendaftaran pahlawan yang mulus, detail, dan otomatis. Terinspirasi oleh D&D Beyond, aplikasi ini menghilangkan hambatan input manual dan menggantinya dengan sistem cerdas berbasis lore.

---

## ✨ Fitur Unggulan

### 1. 🧬 Smart Character Forging
- **Dynamic Racial Scaling:** Pilihan tinggi dan berat badan yang beradaptasi otomatis sesuai ras (Halfling vs Dragonborn).
- **Custom Origins (ASI):** Mendukung aturan Tasha's Cauldron untuk kustomisasi Ability Score Increase (+2/+1 atau +1/+1/+1).
- **Contextual Lore Generator:** Tombol "🎲 Acak" yang menghasilkan sifat, idealisme, dan kelemahan berdasarkan Background yang dipilih.

### 2. 🎲 Integrated Combat Engine
- **Floating Dice Tray:** Nampan dadu melayang (d4 - d20) dengan modal overlay teatrikal.
- **Inventory-to-Action Sync:** Fitur `EQUIP` cerdas yang mendeteksi senjata di tas dan memasukkannya ke daftar serangan secara otomatis menggunakan *fuzzy matching*.

### 3. 📄 Professional Character Sheets
- **Interactive Dashboard:** Manajemen HP (Heal/Damage), pelacakan keping emas (Gold), dan inspektor detail untuk setiap Spell/Feature.
- **Export to PDF:** Desain CSS Print khusus yang mengubah lembar digital menjadi dokumen PDF siap cetak dengan layout profesional.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **State Management:** Zustand (Global Character Store)
- **Database:** MongoDB & Mongoose
- **Styling:** Tailwind CSS (Modern Dark Theme)
- **Icons:** FontAwesome & Lucide React

---

## 🛠️ Instalasi Lokal

1. Clone repository:
   ```bash
   git clone https://github.com/ryanmaulanabp/DnDOnline.git
