import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 1. Validasi Input di sisi Server (Mencegah malicious API request)
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Semua field harus diisi." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || password.length < 8) {
      return NextResponse.json({ message: "Format email tidak valid atau password terlalu pendek." }, { status: 400 });
    }

    await connectDB();

    // Cek apakah email atau username sudah dipakai pemain lain
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: "Email atau Username sudah terdaftar di The Weave!" }, { status: 400 });
    }

    // Enkripsi Password (Hashing) agar tidak bisa dibaca hacker
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke Database
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Pahlawan berhasil didaftarkan!" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada Server Database." }, { status: 500 });
  }
}