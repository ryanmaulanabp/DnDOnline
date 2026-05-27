import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Data tidak lengkap.");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("Email tidak ditemukan di Realm ini.");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Secret Key (Password) salah.");
        }

        return { id: user._id.toString(), name: user.username, email: user.email };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          // Buat akun baru di DB untuk user Google jika belum terdaftar
          // Gunakan kata sandi acak hasil hashing bcrypt untuk memenuhi validasi Mongoose
          const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
          await User.create({
            username: user.name || email.split("@")[0] || `Hero_${Math.floor(Math.random() * 10000)}`,
            email,
            password: randomPassword,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email?.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Mengambil session pengguna yang sedang login secara aman di server side.
 * Melempar error 'Unauthorized' jika tidak ada session yang aktif.
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    throw new Error("Unauthorized: Anda harus login terlebih dahulu.");
  }
  return session.user;
}
