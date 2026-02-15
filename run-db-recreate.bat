@echo off
title Bintang Global - Recreate Database (db_bgg_group)
cd /d "%~dp0"
echo.
echo  [ DB Recreate ] Hapus DB lama (bintang_global), buat db_bgg_group + migrate + seed
echo.
call npm run db:recreate
echo.
if %ERRORLEVEL% EQU 0 (
  echo  Selesai. Database: db_bgg_group. Password akun: Password123
) else (
  echo  Gagal. Cek error di atas.
)
echo.
pause
