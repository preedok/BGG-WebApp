@echo off
title Bintang Global - Update Database
cd /d "%~dp0"
echo.
echo  [ DB Update ] Migrate + Sync tabel + Seed (isi cabang, user, produk, order)
echo.
call npm run db:update
echo.
if %ERRORLEVEL% EQU 0 (
  echo  Selesai. Password akun: Password123
) else (
  echo  Gagal. Cek error di atas.
)
echo.
pause
