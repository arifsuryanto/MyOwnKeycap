---
name: blender-keycap-pipeline
description: Pipeline end-to-end untuk membuat model 3D keycap artisan (figurin hewan/karakter di atas keycap MX) lewat Blender MCP - dari gambar referensi multi-view, generator image-to-3D, fit ke basis keycap parametrik, validasi cetak, sampai render produk "picture perfect". Gunakan skill ini setiap kali user menyebut keycap artisan, keycap 3D print, Blender MCP untuk keycap, image-to-3D untuk figurin, jumlah gambar referensi untuk 3D, atau render produk keycap, walaupun user tidak menyebut kata "skill".
---

# Blender Keycap Pipeline

Tujuan: dari foto/sketsa referensi menjadi (a) STL siap cetak resin dan (b) render produk berkualitas foto, dengan Claude menggerakkan Blender lewat MCP.

## 0. Ekspektasi jujur (sampaikan ke user di awal)

- Claude lewat MCP menjalankan **Python di Blender**. Ia hebat untuk skala, boolean, perbaikan mesh, material, kamera, lampu, render, dan validasi. Ia **tidak memahat bebas**.
- Detail organik (bulu per helai, mata kaca, ekspresi) berasal dari **generator image-to-3D** lalu **sculpt manual** (Blender Sculpt / ZBrush). Jangan menjanjikan "100% sama dengan foto" dari satu prompt.
- Hasil cetak seperti foto referensi butuh **resin MSLA** dan **cat tangan**. FDM 0,4 mm tidak bisa menampilkan bulu halus.
- Semua dimensi di skill ini adalah **default awal**. Kalibrasi dengan test print sebelum produksi.

## 1. Konvensi (wajib konsisten di semua skrip)

| Hal | Aturan |
|---|---|
| Unit | Metrik, `scale_length = 0.001`, **1 Blender Unit = 1 mm** |
| Sumbu | Z ke atas, **depan keycap = -Y**, kanan = +X |
| Origin | Basis keycap: pusat footprint di (0,0,0), dasar skirt di Z=0 |
| Nama objek | `CatHead` (figurin), `KeycapBase`, `KeycapFinal`, `Floor`, `Cam_*`, `Light_*` |
| Dimensi 1u MX (default) | footprint bawah 18,0 x 18,0 mm; tinggi basis 9,5 mm; atas 14,0 mm; dinding 1,5 mm; atap 1,8 mm |
| Stem MX (default) | silang 4,0 x 1,3 mm + toleransi 0,15 mm; silinder luar 5,5 mm; kedalaman slot 4,6 mm |
| Tinggi total maks | 22 mm (periksa clearance dengan keycap tetangga) |

## 2. Alur dan gerbang kualitas

| # | Tahap | Alat | Gerbang lulus |
|---|---|---|---|
| 1 | Kumpulkan referensi | foto/AI sheet (lihat `references/image-capture-guide.md`) | 4 view inti konsisten, resolusi memadai |
| 2 | Generate mesh | Tripo / Meshy / Hunyuan3D / Rodin (multiview) | siluet cocok dengan front dan side; telinga dan hidung benar |
| 3 | Siapkan scene | `scripts/01_scene_setup.py` | unit mm, Cycles aktif |
| 4 | Impor dan fit | `scripts/02_import_fit.py` | lebar kepala 16-17 mm, mesh bersih |
| 5 | Basis parametrik | `scripts/03_keycap_base.py` | stem dan skirt manifold |
| 6 | Sculpt manual | Blender Sculpt (manusia) | bulu, mata, telinga rapi pada 2x zoom |
| 7 | Merge dan validasi | `scripts/04_merge_validate.py` | 0 non-manifold, dinding >= batas, tinggi <= 22 mm |
| 8 | Render produk | `scripts/05_product_render.py` | 6 sudut seperti foto referensi, tanpa artefak |
| 9 | Cetak dan cat | lihat `references/print-and-paint-spec.md` | fit di switch, QC visual |

Jangan lanjut ke tahap berikutnya sebelum gerbang lulus. Setelah tiap tahap, ambil **screenshot viewport** lewat MCP dan periksa sendiri (bagian 6).

## 3. Jumlah gambar referensi (ringkasan; detail di references)

- **Optimal untuk generator: 4 gambar inti** = Front, Left, Back, Right, kamera dan jarak sama, latar polos.
- **Tambahan opsional: +2** = Top dan satu 3/4 depan, hanya jika alatnya punya slot itu (beberapa platform menyediakan 8 posisi: Front, Left, Back, Right, Top, Bottom, Left-Front, Right-Front).
- **Jangan masukkan Bottom** untuk figurin. Bagian bawah dibuat parametrik oleh skrip 03.
- **Referensi detail (tidak dimasukkan ke generator):** 3-5 close-up (mata, bulu, telinga, hidung-mulut, peralihan bulu ke basis) untuk tahap sculpt dan cat.
- Lebih dari 4-6 gambar generator tidak menambah akurasi; justru menambah risiko konflik antar view.
- Batas input berbeda per platform dan versi. Cek UI terbaru sebelum upload.

## 4. Tahap 2 - Generate mesh (di luar Blender)

1. Upload view inti ke generator multiview. Urutan slot: Front, Left, Back, Right (lalu Top bila ada).
2. Pilih output **mesh polygon tinggi** (>= 500 ribu tris), format GLB atau OBJ. Matikan retopo otomatis dulu; retopo tidak diperlukan untuk cetak.
3. Hasilkan 3-4 varian (seed berbeda). Pilih berdasarkan siluet, bukan tekstur.
4. Simpan di folder kerja user, misalnya `~/keycap/cat_v1.glb`.

Prompt tambahan bila generator menerimanya: "single artisan keycap sculpture, cat head, polymer clay, fur strands sculpted, glass eyes, neutral pose, no base, no background, symmetrical ears".

## 5. Tahap 3-5 - Skrip Blender

Skrip dibaca Claude dari folder `scripts/` lalu **dikirim isinya** ke tool eksekusi kode milik Blender MCP (Blender berjalan di komputer user dan tidak bisa membaca filesystem Claude). Atur parameter di blok `PARAMS` paling atas sebelum mengirim.

Urutan dan hasil yang harus dilaporkan Claude:

1. `01_scene_setup.py` - lapor engine, unit, device render.
2. `02_import_fit.py` - lapor jumlah tris, ukuran bounding box (mm), jumlah lubang yang ditutup.
3. `03_keycap_base.py` - lapor dimensi basis dan status manifold.
4. (Manual) sculpt dan penyesuaian posisi kepala.
5. `04_merge_validate.py` - lapor volume (mm3), tinggi total, tebal dinding p5/min, jumlah non-manifold. Jika gagal, jelaskan penyebab dan perbaikan, jangan ekspor.

## 6. Loop verifikasi visual (wajib)

Setelah setiap skrip: ambil screenshot viewport dari 3 sudut (depan, 3/4, atas) dan bandingkan dengan referensi. Periksa:

- Siluet kepala dan telinga sama dengan front/back referensi.
- Kepala duduk **tertanam 1-1,5 mm** ke atap basis (tidak melayang, tidak tembus ke rongga).
- Tidak ada tepi tajam tipis (< 0,3 mm) selain bulu halus yang memang disengaja.
- Rongga bawah tetap terbuka dan stem terlihat jelas.
Jika ada ketidaksesuaian, perbaiki dengan parameter skrip atau minta user melakukan sculpt manual; jangan menebak.

## 7. Tahap 8 - Render produk "picture perfect"

`05_product_render.py` membuat 6 sudut (FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM) seperti foto referensi: lensa 85 mm, f/11, 3 lampu area (key, fill, rim), latar gelap dengan lantai mengilap redup, Cycles + denoise.

- Lewat MCP, gunakan sampel rendah (64-128) untuk pratinjau.
- Untuk final (256-512 sampel, 2048 px): minta user menjalankan Blender background: `blender -b file.blend -P render_final.py` agar tidak timeout.
- Realisme berasal dari 3 hal: **mikro-relief bulu** (geometri, bukan bump), **SSS lembut** di material clay, **mata dengan kornea cembung glossy**. Jika mesh dari generator tanpa mata terpisah, minta user memisahkan mata menjadi objek bola dan beri material kaca.

## 8. Kegagalan umum dan perbaikan

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Kepala melar atau miring | view referensi tidak sejajar | buat ulang view dengan kamera sama; pakai view yang paling konsisten |
| Telinga hilang atau ganda | Back view tidak cocok dengan Front | hasilkan ulang Back dengan seed karakter yang sama |
| Boolean gagal | mesh non-manifold atau self-intersect | jalankan bagian clean di 02, voxel remesh 0,03-0,05 mm, ulangi |
| Dinding bulu terlalu tipis | detail di bawah batas resin | smooth atau thicken (Solidify 0,3 mm) pada area itu |
| Render gelap atau noise | energi lampu tak sesuai skala mm | naikkan `KEY_POWER_BASE` atau exposure; sampel + denoise |
| Skrip error `Principled BSDF` | beda versi Blender | skrip memakai `set_input` dengan banyak alias; laporkan versi Blender |

## 9. Checklist final sebelum menyerahkan ke user

- [ ] Referensi: 4 view inti konsisten, catat sumber dan seed
- [ ] Mesh akhir 1 objek manifold, volume masuk akal
- [ ] Stem MX diuji dengan Fit-Test (toleransi 0,10 / 0,15 / 0,20)
- [ ] Tinggi total <= 22 mm, tidak menabrak keycap tetangga
- [ ] 6 render produk + 1 turntable (opsional)
- [ ] STL + file .blend + parameter yang dipakai disimpan bersama
- [ ] Catatan jujur ke user: bagian mana dari hasil yang masih membutuhkan sculpt/cat manual
