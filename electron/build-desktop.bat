@echo off
echo ============================================
echo   Bike Haus Freiburg - Desktop App Build
echo ============================================
echo.

cd /d "%~dp0.."

:: Step 1: Build Angular for production
echo [1/5] Building Angular frontend...
cd BikeHaus.Client
call npx ng build --configuration production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Angular build failed!
    pause
    exit /b 1
)
cd ..

:: Step 2: Publish .NET API as self-contained
echo.
echo [2/5] Publishing .NET API (self-contained)...
dotnet publish BikeHaus.API/BikeHaus.API.csproj -c Release -r win-x64 --self-contained true -o publish
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: .NET publish failed!
    pause
    exit /b 1
)

:: Step 3: Copy Angular output to publish/wwwroot
echo.
echo [3/5] Copying Angular build to API wwwroot...
if exist publish\wwwroot rmdir /s /q publish\wwwroot
mkdir publish\wwwroot
xcopy /s /e /y BikeHaus.Client\dist\bike-haus.client\browser\* publish\wwwroot\
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to copy Angular files!
    pause
    exit /b 1
)

:: Step 4: Ensure uploads directory exists
echo.
echo [4/5] Setting up directories...
if not exist publish\uploads mkdir publish\uploads
if not exist publish\uploads\image mkdir publish\uploads\image
if not exist publish\uploads\screenshot mkdir publish\uploads\screenshot

:: Step 5: Build Electron package
echo.
echo [5/5] Building Electron desktop app...
cd electron
call npm install
call .\node_modules\.bin\electron-packager.cmd . "Bike Haus Freiburg" --platform=win32 --arch=x64 --out=../dist-electron --overwrite --extra-resource="../publish" --no-prune
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Electron packager returned non-zero (may be just warnings)
)
cd ..

echo.
echo ============================================
echo   Build complete!
echo   Output: dist-electron/
echo ============================================
pause
