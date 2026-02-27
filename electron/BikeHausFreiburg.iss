; Bike Haus Freiburg - Inno Setup Installer Script
; Bu dosya ile tek tikla kurulabilir setup dosyasi olusturulur

#define MyAppName "Bike Haus Freiburg"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Bike Haus Freiburg"
#define MyAppExeName "Bike Haus Freiburg.exe"

[Setup]
AppId={{B1E8A8F2-7C4D-4A6B-9E5F-3D2C1A0B9E8F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\installer-output
OutputBaseFilename=BikeHausFreiburg_Setup_v{#MyAppVersion}
SetupIconFile=icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\{#MyAppExeName}
DisableDirPage=auto
DisableProgramGroupPage=auto

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "turkish"; MessagesFile: "compiler:Languages\Turkish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Kurulumdan once eski surumu kaldir
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  Result := '';
  // Uygulama calisiyorsa kapat
  if FileExists(ExpandConstant('{app}\{#MyAppExeName}')) then
  begin
    Exec('taskkill', '/F /IM "Bike Haus Freiburg.exe"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Sleep(500);
  end;
end;
