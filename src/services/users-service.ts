import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export class UsersService {
  static async register(payload: RegisterUserPayload) {
    const { name, email, password } = payload;

    // 1. Cek apakah email sudah terdaftar
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Hash password menggunakan Bun.password (bcrypt)
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Simpan user baru ke database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { success: true };
  }

  static async login(payload: LoginUserPayload) {
    const { email, password } = payload;

    // 1. Cari user berdasarkan email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID();

    // 4. Simpan session ke database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  }
}
