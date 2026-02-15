@echo off
title Bintang Global - Running Project
cd /d "%~dp0"

echo.
echo  [ Bebaskan port 5000 dan 3000 ]
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul

echo.
echo  [ Start ] Backend + Frontend
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo  Tekan Ctrl+C untuk stop.
echo.
call npm start
