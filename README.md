# LiburanYuk – Sistem Pendukung Keputusan Wisata (Metode SAW)

Website statis untuk merekomendasikan destinasi wisata di Jawa Barat berdasarkan prioritas pengguna, dihitung dengan **Simple Additive Weighting (SAW)**. Tanpa backend dan tanpa database; semua perhitungan berjalan di browser.

> Semua harga dan skor adalah **data simulasi** untuk keperluan akademik. Verifikasi ke sumber resmi sebelum bepergian.

---

## 1. Teknologi

| Teknologi | Dipakai untuk |
|---|---|
| HTML5 | Struktur halaman |
| CSS vanilla (`css/style.css`) | Styling komponen kompleks: loader, hero, navbar, pemilih bobot, modal, responsif |
| Tailwind CSS v4 (CDN browser build) | Token tema (`@theme`) dan utility layout cepat di HTML |
| Font Awesome 6 (CDN) | Seluruh ikon |
| JavaScript vanilla | Logika SAW, render kartu, modal, navbar, loader |
| Google Fonts | Lexend (judul) dan Plus Jakarta Sans (teks) |

Karena memakai CDN, **butuh koneksi internet** saat membuka website.

---

## 2. Struktur folder

```
liburanyuk/
├── index.html            # Markup + token tema Tailwind + importmap Three.js
├── README.md
├── css/
│   └── style.css         # Seluruh styling vanilla, dibagi 13 bagian bernomor
├── js/
│   ├── data.js           # Data destinasi, kriteria, preset bobot, skala bobot
│   └── app.js            # Logika SAW, render UI, modal, navbar, loader
└── assets/
    └── img/
        └── traveling.gif # GIF loading milikmu (taruh di sini)
```

Urutan script di `index.html`: `data.js` → `app.js`. `data.js` dan `app.js` memakai variabel global bersama.

---

## 3. Cara menjalankan

1. Buka folder `liburanyuk` di VS Code.
2. Install ekstensi **Live Server**, klik kanan `index.html` → *Open with Live Server*.

Jangan membuka `index.html` langsung dengan klik dua kali (`file://`). Sebagian fitur browser dibatasi di protokol itu. Alternatif tanpa VS Code: jalankan `python -m http.server 8000` di folder proyek, lalu buka `http://localhost:8000`.

---

## 4. Fitur

- **Loading overlay** dengan GIF traveling dan progress bar. Hilang setelah halaman siap (minimal 1,5 detik, maksimal menunggu 9 detik).
- **Hero** berupa foto alam dengan overlay gradasi hijau toska di belakang heading, serta kartu "Destinasi pilihan" yang bisa diklik untuk melihat detail.
- **Navbar pintar**: tersembunyi saat scroll ke bawah, muncul lagi begitu scroll ke atas sedikit. Menu aktif ikut berubah sesuai bagian yang sedang dilihat.
- **Hamburger mobile** beranimasi: tiga garis berubah jadi X, panel menu membuka dengan efek lingkaran dan link muncul berurutan. Tutup dengan tombol X, tekan Esc, atau pilih salah satu menu.
- **Filter** destinasi berdasarkan kategori, area, dan budget.
- **Mesin SAW** dengan bobot **1–10** per kriteria, 4 preset, dan batas anggaran opsional.
- **Hasil**: 3 teratas, tabel rincian (nilai mentah, normalisasi, kontribusi), detail destinasi, dan perbandingan 2–3 destinasi.
- **Favorit** (disimpan selama halaman terbuka).
- **Responsif** mobile, tablet, dan desktop. Menghormati pengaturan `prefers-reduced-motion`.

---

## 5. Cara kerja SAW

1. **Bobot**: pengguna memberi nilai 1–10 untuk tiap kriteria. Bobot dinormalisasi: `w' = w / Σw`.
2. **Normalisasi** matriks keputusan:
   - Cost (C1 total biaya): `r = min(x) / x`
   - Benefit (C2–C8): `r = x / max(x)`
3. **Nilai preferensi**: `Vi = Σ (w'j × rij)`.
4. **Peringkat**: destinasi diurutkan dari nilai tertinggi. Skor ditampilkan sebagai `Vi × 10` (skala /10).

Kriteria: C1 total biaya (cost), C2 fasilitas, C3 keindahan, C4 kebersihan, C5 keamanan, C6 aksesibilitas, C7 variasi aktivitas, C8 kenyamanan (semua benefit). Total biaya = tiket + parkir + makan + transportasi + biaya tambahan.

---

## 6. Panduan mengubah isi

### Menambah destinasi
Buka `js/data.js`, tambahkan objek baru di array `destinations`:

```js
{id:"nama-unik", name:"Nama Wisata", location:"Kecamatan, Kabupaten", area:"Bandung",
 category:"Alam", desc:"Deskripsi singkat.", image:"https://...jpg",
 ticket:30000, parking:10000, food:30000, transport:20000, extra:5000,
 facility:8, beauty:9, cleanliness:8, safety:8, access:7, activities:8, comfort:8}
```

- `area` harus salah satu: `Bandung`, `Ciwidey`, `Bogor`, `Garut` (atau tambah opsi baru di `<select id="areaFilter">` pada `index.html`).
- `category` harus salah satu: `Alam`, `Keluarga`, `Edukasi`, `Petualangan` (atau tambah chip baru di `#categoryRow`).
- Nilai kualitas memakai skala 1–10, biaya dalam rupiah.

### Mengganti foto hero
Foto hero diatur di bagian 6 `css/style.css` (aturan `.hero`, properti `background`, URL `url("https://images.unsplash.com/...")`). Ganti dengan URL lain atau foto lokal, misalnya `url("../assets/img/hero.jpg")`. Pakai foto lanskap terang berukuran minimal 1600 px. Gradasi hijau toska di atasnya menjaga teks tetap terbaca.

### Mengganti destinasi pilihan di hero
Daftar tiga id destinasi ada di fungsi `renderHeroPicks` pada `js/app.js`.

### Mengubah preset bobot
Edit objek `presets` di `js/data.js`. Urutan angka: biaya, fasilitas, keindahan, kebersihan, keamanan, akses, aktivitas, kenyamanan. Nilai harus 1–10.

### Mengubah skala bobot
Ubah `MAX_WEIGHT` di `js/data.js`. Pemilih angka dan perhitungan menyesuaikan otomatis (di CSS, `.score-group` memakai `repeat(10, 1fr)`, sesuaikan angkanya).

### Mengganti warna dan font
- Palet: toska `--teal`, kuning matahari `--sun`, koral `--coral`, hijau daun `--leaf`, dengan latar putih kebiruan `--mist` dan `--sky`. Ubah di `:root` pada bagian 1 `css/style.css` dan token `@theme` di `index.html`.
- Font: ubah link Google Fonts di `<head>` dan `--font-display` / `--font-body`.

---

## 7. Mengganti GIF loading

1. Simpan GIF sebagai `assets/img/traveling.gif`.
2. Selesai. Kalau nama berbeda, ubah atribut `src` pada `<img id="loaderGif">` di `index.html`.

Bila file GIF tidak ditemukan, loader otomatis memakai animasi SVG bawaan. Ukuran tampilan diatur lewat `.loader-stage` di `css/style.css` (bagian 4). Usahakan GIF di bawah 1 MB agar cepat muncul.

---

## 8. Perilaku navbar

Logika ada di `js/app.js` (blok "Navbar"):

- Di dekat atas halaman (< 80 px): navbar selalu tampil.
- Scroll turun lebih dari 6 px: navbar sembunyi (class `nav-hidden`).
- Scroll naik lebih dari 4 px: navbar muncul lagi.
- Saat menu mobile terbuka: navbar tidak pernah disembunyikan dan scroll halaman dikunci.

Angka ambang batas bisa diubah langsung di kode tersebut.

---

## 9. Breakpoint responsif

| Lebar layar | Perubahan utama |
|---|---|
| > 960 px | Layout desktop penuh, navbar horizontal |
| ≤ 960 px | Hamburger aktif, hero dan mesin SAW menjadi satu kolom, grid 2 kolom |
| ≤ 620 px | Satu kolom, tombol penuh lebar, kartu destinasi 84% lebar (geser horizontal), modal tampil seperti bottom sheet |
| ≤ 380 px | Angka pemilih bobot dan judul hero diperkecil |

Di layar kecil, kartu "Destinasi pilihan" pada hero menjadi baris yang bisa digeser horizontal.

---

## 10. Pemecahan masalah

| Masalah | Penyebab dan solusi |
|---|---|
| Loading tidak selesai | Loader menunggu maksimal 9 detik lalu menutup sendiri. Periksa koneksi internet (CDN). |
| GIF tidak tampil | Pastikan nama file `assets/img/traveling.gif`. Animasi SVG dipakai sebagai cadangan. |
| Gaya Tailwind tidak jalan | Script Tailwind CDN gagal dimuat. Periksa koneksi internet. |
| Foto destinasi kosong | URL gambar Unsplash gagal dimuat, gambar pengganti otomatis tampil. |
| Hero tampil hijau polos tanpa foto | Foto Unsplash gagal dimuat. Periksa internet atau ganti dengan foto lokal. |

---

## 11. Catatan

- Tidak ada penyimpanan permanen. Preferensi dan favorit hilang saat halaman dimuat ulang.
- Biaya pungutan liar tidak diasumsikan atau dituduhkan pada destinasi mana pun.
- Proyek UTS Sistem Pendukung Keputusan, metode SAW.
