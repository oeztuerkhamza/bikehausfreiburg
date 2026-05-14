---
description: Build the Windows Electron installer (.exe)
---

Run `.\build-installer.bat` from the repo root. This:
1. Builds the Angular admin client (`ng build` in `BikeHaus.Client/`).
2. Runs `dotnet publish` for the API in win-x64 self-contained mode → `publish/`.
3. Copies Angular dist to `publish/wwwroot`.
4. Creates `publish/uploads/{image,screenshot}` folders.
5. Runs `electron-builder --win --x64` to produce `dist-electron/Bike Haus Freiburg Setup x.x.x.exe`.

This is a long-running build. Run in the background and notify when complete. If any step fails, surface the exact error from stdout.
