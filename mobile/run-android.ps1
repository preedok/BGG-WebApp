# Set ANDROID_HOME jika belum ada (Windows - SDK default)
if (-not $env:ANDROID_HOME) {
    $sdk = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $sdk) {
        $env:ANDROID_HOME = $sdk
        $env:Path = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"
        Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME"
    } else {
        Write-Host "ERROR: Android SDK tidak ditemukan di $sdk. Install Android Studio dan pastikan SDK terinstall."
        exit 1
    }
}

# Cek apakah emulator sudah jalan
$devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices 2>$null
$running = ($devices | Select-String "emulator-\d+\s+device").Count -gt 0

if (-not $running) {
    Write-Host "Emulator belum berjalan. Menampilkan daftar AVD..."
    & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
    Write-Host ""
    Write-Host "Jalankan emulator dari Android Studio (Device Manager -> Play) atau:"
    Write-Host '  & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd <nama_avd>'
    Write-Host ""
    $start = Read-Host "Lanjutkan build anyway? (y/n)"
    if ($start -ne "y") { exit 0 }
}

npx react-native run-android
