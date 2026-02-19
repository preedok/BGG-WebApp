# Bintang Global - Owner Mobile App (React Native + Android)

Aplikasi React Native (CLI) untuk **role Owner**, dijalankan di **Android Studio emulator** atau device fisik.

## Persyaratan

- Node.js 18+
- **Android Studio** (dengan Android SDK & emulator)
- JDK 17
- Variabel environment: `ANDROID_HOME` mengarah ke SDK Android

## Setup

### 1. Install dependency

Dari **root** project:

```bash
npm run install:all
```

Atau hanya mobile:

```bash
cd mobile
npm install
```

**Penting:** Jika IDE/TypeScript menampilkan error "Cannot find module 'react'" atau "Cannot find module 'react-native'", pastikan dependency sudah terinstall (`npm install` di folder `mobile` atau `npm run install:all` dari root). Lalu reload window IDE (Ctrl+Shift+P → "Developer: Reload Window").

### 2. Jalankan Metro (bundler)

Dari **root** (backend + frontend web + Metro):

```bash
npm start
```

Atau hanya Metro:

```bash
cd mobile
npm start
```

### 3. Set ANDROID_HOME (penting agar emulator terdeteksi)

**Windows:** Tanpa ini, `npm run android` tidak menemukan SDK dan emulator tidak muncul.

- Buka **Pengaturan Windows** → **Sistem** → **Tentang** → **Pengaturan sistem lanjutan** → **Variabel lingkungan**.
- Di "Variabel sistem", pilih **Baru** → Nama: `ANDROID_HOME`, Nilai: `C:\Users\<USERNAME>\AppData\Local\Android\Sdk` (sesuaikan jika SDK Anda di folder lain).
- Tambahkan ke **Path**: `%ANDROID_HOME%\platform-tools` dan `%ANDROID_HOME%\emulator`.
- **Tutup dan buka lagi** terminal/IDE agar variabel terbaca.

Atau untuk **satu sesi** di PowerShell (sebelum `npm run android`):

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"
```

### 4. Jalankan emulator, lalu aplikasi

**`npm start` hanya menjalankan Metro (bundler).** Emulator **tidak** otomatis muncul. Lakukan:

1. **Jalankan emulator dulu** (pilih salah satu):
   - **Android Studio** → **Device Manager** (ikon ponsel di toolbar) → pilih AVD → klik **Play**.
   - Atau dari terminal (setelah ANDROID_HOME benar):
     ```powershell
     # Lihat daftar AVD
     & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
     # Jalankan AVD (ganti Pixel_5_API_34 dengan nama AVD Anda)
     & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_5_API_34
     ```
2. **Tunggu emulator sampai layar home Android terbuka.**
3. Di **terminal lain** (dengan Metro sudah jalan lewat `npm start`):
   ```bash
   cd mobile
   npm run android
   ```
   Atau di **PowerShell** (script ini otomatis set ANDROID_HOME untuk sesi ini):
   ```powershell
   cd mobile
   .\run-android.ps1
   ```

Aplikasi akan ter-build dan terbuka di emulator.

**Belum punya AVD?** Di Android Studio: **Tools** → **Device Manager** → **Create Device** → pilih device (mis. Pixel 5) → pilih system image (mis. API 34) → Finish.

## Script

| Script | Deskripsi |
|--------|-----------|
| `npm start` | Jalankan Metro bundler |
| `npm run android` | Build & run di emulator/device Android |
| `npm run clean:android` | Bersihkan build Android |

## API URL

- **Emulator:** gunakan `http://10.0.2.2:5000/api/v1` (10.0.2.2 = localhost dari emulator).
- **Device fisik:** gunakan IP komputer Anda, misal `http://192.168.1.100:5000/api/v1`.

Atur di `mobile/src/config.ts` atau lewat env (sesuaikan jika pakai env).

## Fitur Owner

- Login (email & password)
- Dashboard
- Daftar Produk
- Daftar Order & Invoice
- Profil & Logout

Token disimpan di AsyncStorage.

---

## Emulator tidak muncul?

1. **ANDROID_HOME belum diset** → Ikuti langkah **3. Set ANDROID_HOME** di atas, lalu tutup dan buka lagi terminal.
2. **Belum jalankan emulator** → Metro (`npm start`) tidak membuka emulator. Buka **Device Manager** di Android Studio dan klik Play pada AVD, atau jalankan `emulator -avd <nama_avd>`.
3. **Belum punya AVD** → Buat di Android Studio: **Tools** → **Device Manager** → **Create Device**.
4. Setelah emulator hidup, di terminal lain: `cd mobile` lalu `npm run android`.
