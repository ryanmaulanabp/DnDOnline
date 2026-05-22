"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Character from "@/models/Character";
import bcrypt from "bcryptjs";

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
}

// --- FUNGSI MENGAMBIL DATA FRESH DARI DATABASE ---
export async function getUserProfileAction(email: string) {
  try {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    return null;
  }
}

export async function updateUserProfileAction(currentEmail: string, payload: UpdateUserPayload) {
  try {
    await connectDB();
    
    // Mencari pemilik asli
    const user = await User.findOne({ email: currentEmail });
    if (!user) return { success: false, message: "Akun pahlawan tidak ditemukan di Weave!" };

    const updateData: any = {};

    // 1. Validasi & Update Username Unik
    if (payload.username && payload.username !== user.username) {
      const existingName = await User.findOne({ username: payload.username });
      if (existingName) return { success: false, message: "Nama Pahlawan (Username) sudah digunakan oleh Guild lain!" };
      updateData.username = payload.username;
    }

    // 2. Validasi & Update Email Unik
    if (payload.email && payload.email !== user.email) {
      const existingEmail = await User.findOne({ email: payload.email });
      if (existingEmail) return { success: false, message: "Email komunikasi ini sudah direkam oleh Weave!" };
      updateData.email = payload.email;
      
      // SINKRONISASI: Pindahkan semua karakter ke email yang baru agar tidak terhapus dari Tavern!
      await Character.updateMany({ userEmail: currentEmail }, { userEmail: payload.email });
    }

    // 3. Update Password (Enkripsi ulang)
    if (payload.password && payload.password.trim() !== "") {
      updateData.password = await bcrypt.hash(payload.password, 10);
    }

    // 4. Update Avatar
    if (payload.image !== undefined) {
      updateData.image = payload.image;
    }

    await User.findOneAndUpdate({ email: currentEmail }, updateData, { strict: false });
    return { success: true, message: "Identitas berhasil diukir ulang ke dalam Realm!" };
  } catch (error: any) {
    return { success: false, message: "Terjadi gangguan kosmis pada database." };
  }
}