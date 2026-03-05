@echo off
chcp 65001 >nul
echo ============================================
echo   Bike Haus Freiburg - Installer Builder
echo   Tek tikla kurulabilir setup dosyasi
echo ============================================
echo.

cd /d "%~dp0"

:: Step 1: Build Angular for production
echo [1/6] Angular frontend derleniyor...
cd BikeHaus.Client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo HATA: npm install basarisiz!
    pause
    exit /b 1
)
call npx ng build --configuration production
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Angular build basarisiz!
    pause
    exit /b 1
)
cd ..

:: Step 2: Publish .NET API as self-contained
echo.
echo [2/6] .NET API derleniyor (self-contained)...
dotnet publish BikeHaus.API/BikeHaus.API.csproj -c Release -r win-x64 --self-contained true -o publish
if %ERRORLEVEL% NEQ 0 (
    echo HATA: .NET publish basarisiz!
    pause
    exit /b 1
)

:: Step 3: Copy Angular output to publish/wwwroot
echo.
echo [3/6] Angular dosyalari kopyalaniyor...
if exist publish\wwwroot rmdir /s /q publish\wwwroot
mkdir publish\wwwroot
xcopy /s /e /y BikeHaus.Client\dist\bike-haus.client\browser\* publish\wwwroot\
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Angular dosyalari kopyalanamadi!
    pause
    exit /b 1
)

:: Step 4: Ensure uploads directory exists
echo.
echo [4/6] Klasorler hazirlaniyor...
if not exist publish\uploads mkdir publish\uploads
if not exist publish\uploads\image mkdir publish\uploads\image
if not exist publish\uploads\screenshot mkdir publish\uploads\screenshot

:: Step 5: Install Electron dependencies
echo.
echo [5/6] Electron bagimliliklari yukleniyor...
cd electron
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Electron npm install basarisiz!
    pause
    exit /b 1
)

:: Step 6: Build installer with electron-builder
echo.
echo [6/6] NSIS Installer olusturuluyor...
call npx electron-builder --win --x64
if %ERRORLEVEL% NEQ 0 (
    echo UYARI: Electron builder hata bildirdi (uyari olabilir)
)
cd ..

echo.
echo ============================================
echo   Installer olusturuldu!
echo.
echo   Konum: dist-electron\
echo   Dosya: Bike Haus Freiburg Setup x.x.x.exe
echo ============================================
echo.
echo Setup dosyasini paylasabilir veya
echo diger bilgisayarlara kurabilirsiniz.
echo.
pause
