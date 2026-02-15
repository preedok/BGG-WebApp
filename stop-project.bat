@echo off
title Bintang Global - Stop Project
cd /d "%~dp0"
echo.
echo  Menghentikan proses di port 5000 (backend) dan 3000 (frontend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo.
echo  Selesai. Port 5000 dan 3000 sudah kosong.
echo.
pause
