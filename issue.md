# Implementasi Fitur Login User & Manajemen Session

## Deskripsi Tugas

Kita akan membuat fitur untuk autentikasi login user. User akan login menggunakan email dan password, lalu sistem akan memvalidasi data tersebut. Jika valid, sistem akan menghasilkan token (berupa UUID), menyimpan token tersebut beserta relasi user ke tabel `sessions` di database, dan merespons dengan token tersebut.

## 1. Spesifikasi Database

Buatkan tabel baru bernama `sessions` dengan struktur kolom sebagai berikut:

- `id` : integer, Primary Key, Auto Increment
- `token` : varchar(255), Not Null, (akan diisi dengan UUID hasil generate saat login sukses)
- `user_id` : integer, Foreign Key yang merujuk ke tabel `users` (id)
- `created_at` : timestamp, default ke current_timestamp

## 2. Spesifikasi API Endpoint

Buat endpoint baru untuk proses login:

- **Endpoint:** `POST /api/users/login`
- **Request Body (JSON):**
  ```json
  {
    "email": "arda@localhost",
    "password": "rahasia"
  }
  ```
- **Response Body (Berhasil - HTTP Status 200/201):**
  ```json
  {
    "data": "token-berupa-uuid-disini"
  }
  ```
- **Response Body (Gagal - HTTP Status 400/401):**
  ```json
  {
    "error": "Email atau password salah"
  }
  ```

## 3. Struktur Folder dan File

Implementasikan kode dengan memisahkannya berdasarkan tanggung jawab (Separation of Concerns). Struktur kode ada di dalam folder `src/`:

- **`src/routes/`**: Berisi routing ElysiaJS (menangani HTTP request dan response).
  - Nama file dibuat dengan format kebap-case: `users-route.ts`
- **`src/services/`**: Berisi logic bisnis aplikasi (query ke DB, validasi, hashing/checking password).
  - Nama file dibuat dengan format kebap-case: `users-service.ts`

---

## 🚀 Tahapan Implementasi (Step-by-Step Guide)

Silakan ikuti langkah-langkah di bawah ini secara berurutan:

### Langkah 1: Update Schema Database

1. Buka file `src/db/schema.ts`.
2. Tambahkan deklarasi tabel `sessions` menggunakan Drizzle ORM sesuai dengan spesifikasi kolom di atas.
3. Pastikan kolom `user_id` memiliki referensi (foreign key) ke tabel `users`.
4. Jalankan perintah untuk _generate_ migration dan jalankan migrasi database agar tabel tercipta di DB lokal (misalnya menggunakan command `bun run db:generate` dan `bun run db:push`, sesuaikan dengan script migrate yang ada di `package.json`).

### Langkah 2: Buat Logic Bisnis Login (Service Layer)

1. Buka (atau buat jika belum ada) file `src/services/users-service.ts`.
2. Buat fungsi baru (contoh: `loginUser(payload)`).
3. **Logic di dalam fungsi:**
   - Cari user di database berdasarkan `email` yang dikirim.
   - Jika user **tidak ditemukan**, berikan _throw error_ atau kembalikan response gagal.
   - Jika user **ditemukan**, bandingkan `password` plain text dari request dengan password hash yang tersimpan di DB menggunakan helper bcrypt/argon2 yang sebelumnya sudah ada (pastikan password dicek dengan benar).
   - Jika password **salah**, berikan _throw error_ (`"Email atau password salah"`).
   - Jika kredensial **benar**, ciptakan token UUID baru menggunakan library crypto atau standar UUID generator (`crypto.randomUUID()`).
   - Lakukan perintah `INSERT` data ke tabel `sessions` untuk menyimpan asosisasi `token` tersebut dengan `user_id` terkait.
   - Return token (string UUID) sebagai kembalian (output) dari fungsi ini.

### Langkah 3: Buat Routing API (Route Layer)

1. Buka file `src/routes/users-route.ts`.
2. Tambahkan route baru menggunakan framework Elysia dengan endpoint `POST /api/users/login`.
3. Validasi body menggunakan `t` validator bawaan Elysia untuk memastikan `email` dan `password` bertipe `string` dan wajib dikirim.
4. Di dalam handler, panggil fungsi service `loginUser` yang telah dibuat pada Langkah 2.
5. Tangani hasil kembaliannya.
   - Jika sukses, format data menjadi `{ "data": "isi_token" }`.
   - Lakukan blok `try...catch` atau _error handling_ Elysia untuk menangkap error gagal login, dan ubah respons menjadi `{ "error": "Email atau password salah" }` dengan HTTP Status 401.

### Langkah 4: Registrasikan Route

1. Buka entry point aplikasi utama, biasanya di `src/index.ts`.
2. Pastikan file `users-route.ts` diimpor dan dipasang (`app.use(usersRoute)`) ke dalam aplikasi utama Elysia.
3. Jalankan server lokal aplikasi (`bun run dev`) dan lakukan testing menggunakan Postman, cURL, atau Thunder Client untuk memastikan request sukses dan request gagal (error message) sesuai dengan ekspektasi.
