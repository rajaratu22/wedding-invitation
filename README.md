# Undangan Digital — Luxury Romantic

Buka `index.html` di VS Code (ekstensi Live Server) atau klik dua kali di browser.

## 1. Memasukkan foto pengantin
Folder `assets/` sudah berisi foto ILUSTRASI siluet (bukan foto asli) dan musik contoh.
Untuk memakai foto asli, timpa file dengan nama yang sama: `pengantin-1.jpg` s/d `pengantin-4.jpg`,
serta `tirmidzi.jpg` (portrait mempelai pria) dan `aisyah.jpg` (portrait mempelai wanita).
Jika sebuah file tidak ditemukan, website menampilkan bingkai gelap dengan monogram.

## 2. Mengganti semua foto
Buka `script.js`, edit `galleryImages`. Tambah/kurangi nama file sesuka hati (galeri menyesuaikan otomatis).
Atur foto tiap bagian di `photoMap` (angka = urutan foto, mulai dari 0, atau tulis path file, mis. `"assets/tirmidzi.jpg"`).
Atur fokus wajah di `photoPosition` (mis. `"40% 20%"`).

## 3. Mengganti nama
`weddingConfig.groom` dan `weddingConfig.bride`. Orang tua: `groomFather`, `groomMother`, `brideFather`, `brideMother`.

## 4. Mengganti tanggal
`weddingConfig.date` format `TAHUN-BULAN-TANGGAL` (mis. `2027-01-30`), `akadTime`, `receptionTime`, dan `timezone`.
Countdown otomatis menghitung ke jam akad.

## 5. Mengganti lokasi
`venue`, `address`, dan `mapsUrl` (tempel link dari Google Maps > Bagikan).
Jika `mapsUrl` belum diganti, tombol LIHAT LOKASI mencari dari nama + alamat.

## 6. Mengganti musik
Ubah `weddingConfig.musicVideoUrl` di `script.js` dengan link video YouTube. Pemutar perlu koneksi internet dan video harus mengizinkan penyematan.

## 7. Mengganti QRIS
Ganti `assets/qris.jpe` dengan gambar QRIS Anda, lalu sesuaikan `qrisImage` dan `qrisName` di `weddingConfig.gift` pada `script.js`. Pastikan kode QR tetap jelas dan dapat dipindai.

## 8. Nama tamu
Di halaman pembuka, tulis nama tamu lalu pilih SALIN LINK UNDANGAN. Nama pada parameter `?to=Nama+Tamu` akan tampil sebagai sapaan dan mengisi nama RSVP/ucapan.

## 9. Hosting gratis dengan Netlify
Situs ini statis dan tidak memerlukan proses build:
1. Ekstrak `wedding-invitation-netlify.zip`.
2. Buka `https://app.netlify.com/drop` dan masuk atau buat akun Netlify.
3. Seret folder hasil ekstraksi yang berisi `index.html` ke halaman Netlify Drop.
4. Buka URL `.netlify.app` yang diberikan Netlify dan kirim link tersebut kepada tamu.

Link akan tetap tersedia selama situs dan akun Netlify aktif serta mengikuti ketentuan layanan; hosting gratis tidak menjamin ketersediaan permanen. Nama, foto, dan QRIS pada undangan menjadi dapat diakses publik melalui link tersebut.

## 10. RSVP
Mode demo: data hanya tersimpan di browser pengunjung (localStorage), bukan terkirim kepada pemilik undangan. Untuk menerima data sungguhan, isi `rsvpEndpoint` (Google Apps Script / Formspree).

Catatan: font memakai Google Fonts (butuh internet); tanpa internet tampil dengan font cadangan.
