# LiburanYuk – Rekomendasi Wisata Jawa Barat (Metode SAW)

Website statis (HTML + CSS + JS tanpa build). Cukup buka `index.html` di browser, atau jalankan server lokal:

## Struktur folder

```
index.html            Markup halaman (hero, filter, bobot, hasil, tentang SAW, footer)
css/style.css         Seluruh gaya (token warna ada di :root di bagian atas)
js/data.js            DATA: daftar destinasi, kriteria, preset bobot
js/app.js             Logika: render kartu, perhitungan SAW, modal, animasi scroll
assets/img/fox.png Maskot rubah (hero, loading, CTA penutup)
assets/img/hero-bg.jpg Foto latar sisi kanan hero
```

---

## 1. Mengganti gambar

### a. Maskot rubah
Timpa `assets/img/rubah.webp` dengan gambar baru **berlatar transparan** (webp/png).
Kalau pakai PNG, ubah ekstensinya di 3 tempat di `index.html` (cari `rubah.webp`): loading, hero, dan CTA penutup.
Tips: tinggi 900–1000 px sudah cukup, ukuran file di bawah 100 KB agar loading cepat.

### b. Latar kanan hero
Timpa `assets/img/hero-bg.jpg` (disarankan 1600×900, warna terang/pudar supaya teks tetap terbaca).
Gambar ini dipakai di `css/style.css` pada aturan `.hero` (`background: ... url("../assets/img/hero-bg.jpg")`).

### c. Foto destinasi
Foto tiap destinasi ada di properti `image` pada `js/data.js`. Dua cara:

**Pakai file sendiri (disarankan, lebih cepat & stabil)**
1. Simpan foto di `assets/img/destinasi/`, mis. `kawah-putih.jpg` (lebar 900 px, kompres < 150 KB).
2. Ubah datanya:
   ```js
   image: "assets/img/destinasi/kawah-putih.jpg"
   ```

**Pakai URL online**
```js
image: "https://images.unsplash.com/photo-xxxx?auto=format&fit=crop&w=900&q=80" 
```
Kalau gambar gagal dimuat, otomatis tampil gambar pengganti (placeholder).

---

## 2. Menambah destinasi baru

Buka `js/data.js`, lalu tambahkan satu objek baru di dalam array `destinations` (jangan lupa koma antar objek):

```js
{
  id: "tangkuban-perahu",           // unik, huruf kecil, tanpa spasi
  name: "Tangkuban Parahu",
  location: "Lembang, Kabupaten Bandung Barat",
  area: "Bandung",                  // harus sama dengan salah satu opsi filter wilayah
  category: "Alam",                 // harus sama dengan salah satu chip kategori
  desc: "Kawah gunung berapi dengan udara sejuk dan jalur wisata mudah.",
  image: "assets/img/destinasi/tangkuban-perahu.jpg",

  // Biaya per orang (Rupiah) – dijumlahkan jadi kriteria C1 (Total biaya)
  ticket: 30000, parking: 10000, food: 30000, transport: 25000, extra: 5000,

  // Skor 1–10 (makin tinggi makin baik)
  facility: 7, beauty: 9, cleanliness: 7, safety: 8,
  access: 8, activities: 6, comfort: 7
},
```

Semua field di atas **wajib diisi**, kalau ada yang kosong nilai SAW bisa jadi `NaN`.

### Kalau wilayah atau kategorinya baru
Filter wilayah dan chip kategori ditulis manual di `index.html`, jadi tambahkan juga di sana:

- **Wilayah baru**: cari `<select id="areaFilter">`, tambah
  `<option value="Cianjur">Cianjur</option>` (nilai `value` harus sama persis dengan `area` di data).
- **Kategori baru**: cari `id="categoryRow"`, salin salah satu tombol chip dan ubah
  `data-category="Kuliner"` serta teksnya (harus sama persis dengan `category` di data).
- **Teks "7 destinasi"** pada statistik hero (`.hero-stats`) diketik manual, sesuaikan jumlahnya.

Kartu, hasil ranking, perbandingan, dan modal detail akan otomatis ikut memakai data baru.

---

## 3. Mengubah kriteria, bobot awal, dan warna

- **Kriteria** (`criteria` di `data.js`): `attribute` bernilai `"Cost"` (makin kecil makin baik) atau `"Benefit"` (makin besar makin baik).
  Menambah kriteria baru juga perlu field baru di tiap destinasi, ikonnya di `CRITERIA_ICONS`, dan menyesuaikan perhitungan di `app.js`.
- **Preset bobot** (`presets` di `data.js`): urutan angkanya mengikuti urutan kriteria
  (biaya, fasilitas, keindahan, kebersihan, keamanan, akses, aktivitas, kenyamanan), skala 1–10.
- **Warna**: ubah token di `:root` pada `css/style.css`
  - `--sun` oranye utama (`#f69335`), `--teal` / `--teal-deep` hijau olive untuk teks.
  - `--peach` / `--cream` warna latar section.
- **Font**: diatur lewat link Google Fonts di `<head>` `index.html` dan variabel `--font-display` / `--font-body`.

---

## 4. Catatan

- Data biaya dan skor adalah **data demonstrasi**, bukan harga resmi. Verifikasi sebelum dipakai sungguhan.
- Setelah mengubah `data.js`, cukup refresh browser (tekan Ctrl+F5 jika masih tampil data lama).
- Agar tetap ringan: kompres foto, gunakan webp/jpg, dan hindari menambah animasi yang berjalan terus-menerus.
