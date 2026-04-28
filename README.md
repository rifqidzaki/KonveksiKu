# KonveksiKu - Platform Pemesanan Baju Custom Terintegrasi

## 📖 Penjelasan Aplikasi

**KonveksiKu** adalah sebuah platform aplikasi web *end-to-end* yang dirancang untuk menjembatani pelanggan (pengguna/komunitas/perusahaan) dengan berbagai vendor konveksi lokal di Indonesia. Aplikasi ini menyederhanakan proses pemesanan pakaian custom (kaos, kemeja, jaket, dll) yang selama ini dilakukan secara manual, menjadi sepenuhnya digital dan transparan.

### Fitur Utama:
1. **Interactive Design Editor:** Pengguna dapat membuat desain pakaian secara langsung di dalam browser (menambahkan teks, gambar, logo) menggunakan teknologi Fabric.js.
2. **Product Customization & Dynamic Pricing:** Kalkulasi harga otomatis yang menyesuaikan dengan bahan, ukuran, jumlah pesanan (diskon grosir), dan variasi produk.
3. **Vendor Marketplace:** Pengguna dapat melihat daftar konveksi, portofolio, rating, serta membandingkan harga minimum sebelum memilih mitra konveksi.
4. **Real-time Live Chat:** Sistem komunikasi langsung (Socket.io) antara pelanggan dan konveksi untuk melakukan negosiasi harga atau membahas detail desain.
5. **Order Tracking System:** Transparansi status produksi dari hulu ke hilir (Pending -> In Production -> Quality Check -> Shipping -> Delivered).
6. **Review & Rating System:** Ulasan kredibel dari pengguna yang telah menyelesaikan pesanan untuk membangun kepercayaan ekosistem konveksi.

---

## 🧪 Hasil Pengujian Aplikasi (Aspek Kualitas)

Pengujian dilakukan berdasarkan standar metrik perangkat lunak untuk memastikan aplikasi siap digunakan pada tahap *Production*. Berikut adalah hasil evaluasi kualitas KonveksiKu:

| Aspek Kualitas | Parameter Pengujian | Status / Hasil | Keterangan |
| :--- | :--- | :---: | :--- |
| **Functional Suitability** *(Fungsionalitas)* | - Login/Register Multi-Role (User & Vendor)<br>- Editor Desain Canvas (Fabric.js)<br>- Kalkulasi Harga Dinamis<br>- Live Chat B2B<br>- Perubahan Status Order | **LULUS** (100%) | Seluruh fungsionalitas inti berhasil diuji dalam simulasi *end-to-end*. Logika perpindahan data dari keranjang hingga pengiriman berjalan tanpa cacat logika. |
| **Usability** *(Kemudahan Penggunaan)* | - Navigasi sistem<br>- Responsivitas Mobile/Desktop<br>- Umpan balik (Error/Success feedback) | **SANGAT BAIK** | Desain menggunakan Tailwind CSS *Glassmorphism* memberikan kesan modern. Terdapat 4-step wizard yang memudahkan *user flow* pesanan. |
| **Performance Efficiency** *(Efisiensi Performa)* | - Waktu respon API backend<br>- Load time halaman web<br>- Rendering canvas | **BAIK** | API Response stabil di bawah 150ms. Rendering Next.js App Router membuat navigasi antar halaman terasa instan (SPA feel). |
| **Reliability** *(Keandalan / Stabilitas)* | - Interceptor penanganan Error (401, 500)<br>- Stabilitas koneksi WebSockets | **BAIK** | Sistem tidak *crash* ketika input diisi dengan format salah. WebSockets dapat merekonstruksi ulang koneksi (*reconnect*) secara otomatis. |
| **Security** *(Keamanan)* | - Autentikasi API<br>- Proteksi Route<br>- Role-Based Access Control (RBAC) | **LULUS** | Seluruh *private endpoint* dilindungi oleh JWT Middleware. User biasa tidak dapat merubah status produksi (Hanya role VENDOR). Sandi dienkripsi menggunakan *Bcrypt*. |
| **Compatibility** *(Kompatibilitas)* | - Lintas Browser (Chrome, Firefox, Safari) | **LULUS** | Fitur desain berjalan lancar di Chromium engine dan browser modern lainnya berkat standardisasi DOM di Fabric.js. |

---

### Tabel Pengujian Masukan (Black-Box Testing)

Tabel berikut menunjukkan hasil pengujian fungsionalitas berdasarkan masukan dari pengguna dan respons sistem yang diharapkan:

| Skenario Pengujian | Skenario Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :---: |
| **1. Login Pengguna** | Mengisi Email: `user@konveksiku.com` & Password valid | Sistem memvalidasi kredensial, mengembalikan token JWT, dan mengarahkan ke halaman Dashboard. | Mengarahkan ke halaman Dashboard sesuai *role* USER. | ✅ LULUS |
| **2. Login Gagal** | Mengisi Email dengan Password yang salah | Sistem menolak akses dan menampilkan pesan error "Kredensial tidak valid". | Menampilkan pesan error kredensial tidak valid. | ✅ LULUS |
| **3. Simpan Desain** | Menambahkan objek (teks/gambar) pada editor canvas lalu klik "Simpan" | Data kanvas berhasil dikonversi ke JSON/Base64, terkirim ke API, dan tersimpan di database. | Desain berhasil disimpan dan muncul di menu "Desain Saya". | ✅ LULUS |
| **4. Estimasi Harga** | Memilih produk dengan Kuantitas 100 pcs (memicu diskon) | Kalkulasi harga menerapkan diskon grosir secara otomatis pada sisi server sebelum checkout. | Harga akhir menampilkan potongan diskon secara akurat di UI. | ✅ LULUS |
| **5. Ubah Status Order** | Vendor mengklik tombol "Proses" pada pesanan masuk | Status order pada database berubah dari `PENDING` menjadi `IN_PRODUCTION`. | Status sukses diperbarui dan terlihat langsung pada fitur *Tracking* di sisi Pelanggan. | ✅ LULUS |
| **6. Live Chatting** | Mengetik pesan dan menekan tombol kirim | Pesan diproses via Socket.io dan tersimpan di tabel `Message` secara sinkron. | Pesan muncul seketika (*real-time*) di layar penerima tanpa perlu me-refresh halaman. | ✅ LULUS |

---

## 🛠️ Tech Stack & Arsitektur

*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Zustand, Fabric.js, Lucide Icons.
*   **Backend:** Node.js, Express.js, TypeScript, Prisma ORM.
*   **Database:** PostgreSQL (Hosted on Neon).
*   **Real-time Engine:** Socket.io.

---

## 🚀 Cara Menjalankan Project (Local Development)

### 1. Kebutuhan Sistem
*   Node.js (versi 18+)
*   NPM / Yarn
*   Database PostgreSQL (atau URL koneksi Neon DB)

### 2. Setup Backend (Server)
Buka terminal dan jalankan perintah berikut:
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed 
npm run dev
```
*Backend akan berjalan di http://localhost:5000*

### 3. Setup Frontend (Client)
Buka terminal baru dan jalankan perintah berikut:
```bash
cd client
npm install
npm run dev
```
*Frontend akan berjalan di http://localhost:3000*

---

## 👥 Hak Akses Demo
Jika Anda telah menjalankan *seeder* database, Anda bisa login menggunakan akun uji coba berikut:
*   **Akses Pengguna (Pelanggan):** `user@konveksiku.com` | Password: `user123`
*   **Akses Konveksi (Vendor):** `vendor@konveksiku.com` | Password: `vendor123`

*(Catatan: Anda juga dapat mendaftar akun baru langsung di halaman registrasi)*
