"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Character from "@/models/Character";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UpdateUserPayloadSchema } from "@/lib/validations/schemas";
import { getSessionUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
}

// --- FUNGSI MENGAMBIL DATA FRESH DARI DATABASE ---
export async function getUserProfileAction(email: string) {
  try {
    const sessionUser = await getSessionUser();
    const validatedEmail = z.string().email("Format email salah").parse(email);

    // BOLA/IDOR Protection: Pastikan email yang diminta cocok dengan pengguna yang sedang login
    if (validatedEmail.toLowerCase() !== sessionUser.email?.toLowerCase()) {
      throw new Error("Unauthorized: Anda hanya dapat mengakses profil Anda sendiri.");
    }

    await connectDB();
    const user = await User.findOne({ email: validatedEmail.toLowerCase() }).lean();
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    logger.error("UserProfileAction", "Gagal mengambil profil", error);
    return null;
  }
}

export async function updateUserProfileAction(currentEmail: string, payload: UpdateUserPayload) {
  try {
    const sessionUser = await getSessionUser();
    const sessionEmail = sessionUser.email?.toLowerCase();
    
    if (!sessionEmail) {
      return { success: false, message: "Sesi tidak valid." };
    }

    // BOLA/IDOR Protection: Abaikan currentEmail dari client, paksa menggunakan email dari session server
    const validatedEmail = z.string().email("Format email salah").parse(sessionEmail);
    const validatedPayload = UpdateUserPayloadSchema.parse(payload);
    
    await connectDB();
    
    // Mencari pemilik asli di database
    const user = await User.findOne({ email: validatedEmail });
    if (!user) return { success: false, message: "Akun pahlawan tidak ditemukan di Weave!" };

    const updateData: any = {};

    // 1. Validasi & Update Username Unik
    if (validatedPayload.username && validatedPayload.username !== user.username) {
      const existingName = await User.findOne({ username: validatedPayload.username });
      if (existingName) return { success: false, message: "Nama Pahlawan (Username) sudah digunakan oleh Guild lain!" };
      updateData.username = validatedPayload.username;
    }

    // 2. Validasi & Update Email Unik
    if (validatedPayload.email && validatedPayload.email.toLowerCase() !== user.email.toLowerCase()) {
      const targetEmail = validatedPayload.email.toLowerCase();
      const existingEmail = await User.findOne({ email: targetEmail });
      if (existingEmail) return { success: false, message: "Email komunikasi ini sudah direkam oleh Weave!" };
      updateData.email = targetEmail;
      
      // SINKRONISASI: Pindahkan semua karakter ke email yang baru agar tidak terhapus dari Tavern!
      await Character.updateMany({ userEmail: validatedEmail }, { userEmail: targetEmail });
    }

    // 3. Update Password (Enkripsi ulang)
    if (validatedPayload.password && validatedPayload.password.trim() !== "") {
      updateData.password = await bcrypt.hash(validatedPayload.password, 10);
    }

    // 4. Update Avatar
    if (validatedPayload.image !== undefined) {
      updateData.image = validatedPayload.image;
    }

    await User.findOneAndUpdate({ email: validatedEmail }, updateData, { strict: false });
    return { success: true, message: "Identitas berhasil diukir ulang ke dalam Realm!" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message || "Input data tidak valid" };
    }
    return { success: false, message: error?.message || "Terjadi gangguan kosmis pada database." };
  }
}