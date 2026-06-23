# Implementasi API Get Current User

## Deskripsi Tugas

Kita akan membuat fitur untuk mendapatkan data user yang saat ini sedang login (get current user). Sistem akan memvalidasi request berdasarkan token autentikasi yang dikirim melalui HTTP Headers (`Authorization: Bearer <token>`). Jika token valid dan ditemukan di database (tabel `sessions` yang merujuk ke tabel `users`), maka sistem akan mengembalikan data profil user tersebut.

## 1. Spesifikasi API Endpoint

Buat endpoint baru untuk proses mendapatkan data user saat ini:

- **Endpoint:** `GET /api/users/current`
- **Headers:**
  - `Authorization`: `Bearer <token>` (di mana `<token>` adalah token UUID milik user yang didapatkan saat login sebelumnya)
- **Response Body (Berhasil - HTTP Status 200):**
  ```json
  {
    "data": {
      "id": 1,
      "name": "Arda",
      "email": "arda@localhost",
      "created_at": "2026-06-23T10:00:00.000Z"
    }
  }
  ```
- **Response Body (Gagal - HTTP Status 401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```

## 2. Struktur Folder dan File

Pekerjaan difokuskan pada file-file berikut di dalam folder `src/`:

- **`src/routes/users-route.ts`**: Berisi routing API menggunakan ElysiaJS. Di sini kita akan menambahkan endpoint `GET /current`.
- **`src/services/users-service.ts`**: Berisi logic bisnis. Tempat kita membuat fungsi untuk memvalidasi token dan mengambil data user.

---

## 🚀 Tahapan Implementasi (Step-by-Step Guide)

Silakan ikuti langkah-langkah di bawah ini secara berurutan:

### Langkah 1: Buat Logic Bisnis Get Current User (Service Layer)

1. Buka file `src/services/users-service.ts`.
2. Buat fungsi baru (contoh: `getCurrentUser(token: string)`).
3. **Logic di dalam fungsi:**
   - Karena token disimpan di tabel `sessions`, maka lakukan query untuk mencari data relasi table `sessions` dan `users` yang memiliki token sama dengan token dari parameter.
   - Contoh query (menggunakan Drizzle ORM): Lakukan `select` ke tabel `sessions` yang di-`innerJoin` ke tabel `users` pada field `user_id`, dengan kondisi `eq(sessions.token, token)`.
   - Jika data **tidak ditemukan**, lemparkan error (_throw new Error("Unauthorized")_).
   - Jika data **ditemukan**, kembalikan (return) objek data user tersebut yang memuat field `id`, `name`, `email`, dan `createdAt`.

### Langkah 2: Buat Routing API (Route Layer)

1. Buka file `src/routes/users-route.ts`.
2. Tambahkan route baru pada instance `Elysia` dari path user (tambahkan chain `.get("/current", handler)`).
3. Di dalam handler, ambil nilai token dari HTTP header. Di ElysiaJS, bisa mengakses `headers` atau `bearer` (jika menggunakan `@elysiajs/bearer`). Jika hanya menggunakan headers standar, ambil nilai dari `headers.authorization`.
4. Lakukan pengecekan:
   - Pastikan header _Authorization_ tidak kosong dan dimulai dengan teks `Bearer `.
   - Jika tidak valid, kembalikan HTTP Status `401` dengan respon `{ "error": "Unauthorized" }`.
   - Ekstrak _token_ dengan menghapus awalan `Bearer ` (misal `.split(" ")[1]`).
   - Panggil class `UsersService.getCurrentUser(token)`.
5. Tangani kembalian atau responnya dengan struktur `try...catch`:
   - Jika **sukses**, kembalikan response JSON: `{ data: userData }`.
   - Jika **gagal** (masuk ke blok catch), set status `set.status = 401` dan kembalikan `{ error: "Unauthorized" }`.

### Langkah 3: Testing Endpoint

1. Jalankan aplikasi menggunakan `bun run dev`.
2. Lakukan proses **login** terlebih dahulu ke `/api/users/login` untuk mendapatkan `token` yang valid.
3. Copas `token` tersebut.
4. Lakukan request `GET` ke http://localhost:3000/api/users/current menggunakan Postman, cURL, atau Thunder Client dengan menambahkan Header `Authorization: Bearer <paste_token_disini>`.
5. Pastikan jika token benar mengembalikan response data user, jika token diubah/salah akan mengembalikan pesan `Unauthorized`.
