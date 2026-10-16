# Panduan Gambar Referensi (berapa gambar, sudut apa, spesifikasi)

## 1. Jumlah gambar optimal

| Tujuan | Jumlah | Isi |
|---|---|---|
| **Masuk generator image-to-3D (inti)** | **4** | Front, Left, Back, Right |
| Generator yang punya slot ekstra | 5-6 | tambah Top, lalu Front-Left (3/4) |
| Referensi detail (tidak masuk generator) | 3-5 | mata, bulu pipi/dagu, telinga, hidung-mulut, sambungan ke basis |
| **Total yang disiapkan** | **8-10** | 4 inti + 1-2 opsional + 3-5 detail |

Alasan:
1. Empat view ortogonal memberi siluet 360 derajat; cukup untuk bentuk kepala simetris seperti kucing.
2. Top berguna untuk figurin (kepala, telinga, bulu atas) karena sering salah di generator.
3. Bottom tidak dipakai: bagian bawah keycap dibuat parametrik (skrip 03), jadi tidak perlu ditebak AI.
4. Di atas 4-6 gambar hasil tidak membaik. Setiap view tambahan menambah peluang detail yang saling bertentangan (mata, arah bulu, pola belang).
5. Satu gambar (front) bisa jalan, tetapi bagian belakang dan telinga ditebak AI sehingga akurasi jauh turun.

Batas input berbeda per platform dan versi (ada yang menerima 4, ada yang 5, ada yang hanya satu gambar untuk model tertentu). Cek UI terbaru. Jika slot hanya 4, pakai Front, Left, Back, Right.

## 2. Definisi tiap view

| View | Kamera berada di | Tinggi kamera | Catatan |
|---|---|---|---|
| Front | depan keycap (arah -Y) | setinggi tengah figurin | wajah menghadap lurus, kedua telinga terlihat penuh |
| Left | sisi kiri figurin (-X) | sama | **profil murni 90 derajat**, bukan 3/4 |
| Back | belakang (+Y) | sama | pola bulu belakang dan telinga belakang |
| Right | sisi kanan (+X) | sama | profil murni 90 derajat |
| Top | tepat di atas (+Z) | - | atas kepala, jarak telinga, orientasi basis |
| Front-Left (opsional) | 45 derajat kiri-depan | sedikit di atas | transisi pipi ke leher |

## 3. Spesifikasi pengambilan (foto atau render)

- Jarak dan lensa **sama** untuk semua view. Lensa setara >= 85 mm agar perspektif datar.
- Objek mengisi 70-80% frame, di tengah. Latar abu netral atau putih/hitam polos.
- Cahaya lembut dua sisi (softbox 45 derajat kiri dan kanan), tanpa bayangan keras dan tanpa silau di mata.
- Resolusi sisi panjang >= 2048 px; ekspor persegi 1:1; PNG atau JPG kualitas tinggi.
- Kunci eksposur, white balance, dan fokus (f/8-f/11) agar warna dan ketajaman sama.
- Penamaan: `cat_front.png`, `cat_left.png`, `cat_back.png`, `cat_right.png`, `cat_top.png`, `cat_detail_eye.png`, dst.

## 4. Jika referensi dibuat dengan AI (sheet multi-view)

Gambar multi-view dari generator gambar sering **tidak konsisten antar view**. Aturan:

1. Buat **satu karakter acuan** dulu (front). Pakai gambar itu sebagai referensi dan seed yang sama untuk view lain.
2. Minta tiap view sebagai gambar terpisah, bukan satu sheet, agar skala dan kamera seragam.
3. Cek konsistensi sebelum upload: posisi dan ukuran mata, ujung telinga, pola belang, bercak putih pipi, bentuk hidung. Jika ada view menyimpang, hasilkan ulang view itu saja.
4. Kata kunci per view: "orthographic, straight-on, 85mm, neutral gray background, soft studio light, no perspective distortion, same subject as reference".

## 5. Penilaian sheet foto kucing yang dikirim user

- Front, Back, Top: layak sebagai view inti.
- "Left side" dan "Right side": sudutnya **oblique (3/4)**, bukan profil murni. Pakai sebagai Front-Left dan Front-Right jika platform punya slot itu. Jika tidak, buat dulu profil 90 derajat yang konsisten.
- Bottom: tidak dipakai untuk figurin (hanya referensi rongga dan stem MX untuk skrip 03).
- Skala dan framing antar panel berbeda; samakan skala dan crop sebelum upload.

## 6. Contoh prompt pembuat view tambahan

```
Same cat artisan keycap as the reference image, exact same fur pattern, eye shape,
ear shape and colors. View: strict left profile at 90 degrees, orthographic look,
85mm lens, centered, neutral gray background, soft studio lighting, 1:1, 2048px.
```
