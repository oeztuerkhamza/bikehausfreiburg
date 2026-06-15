<#
.SYNOPSIS
  One-time import of the scraped feldmeier IDEAL e-bikes into the BikeHaus E-Bike catalog
  via the admin API. Creates each e-bike (as INACTIVE by default), then downloads and
  uploads its product image(s).

.DESCRIPTION
  Reads feldmeier-ebikes.json (next to this script), logs in to the admin API to get a JWT,
  and for each bike:
    1. POST   /api/e-bikes            (create)  -> gets new id
    2. (download each imageUrl)        -> temp file
       POST   /api/e-bikes/{id}/images (multipart field "files")
    3. PUT    /api/e-bikes/{id}        (set IsActive = $Active, default $false)

  Idempotent: skips any bike whose Titel already exists in the catalog.

.PARAMETER ApiBase
  Base API URL, e.g. http://localhost:5196/api (local/desktop) or
  https://api.bikehausfreiburg.com/api (production). No trailing slash.

.PARAMETER Username
  Admin username.

.PARAMETER Password
  Admin password. If omitted you are prompted securely.

.PARAMETER Active
  If supplied, imported bikes are published immediately. Default: imported as INACTIVE
  so you can review/edit them in admin and publish per-item.

.EXAMPLE
  pwsh scripts/ebike-import/import.ps1 -ApiBase http://localhost:5196/api -Username admin

.EXAMPLE
  pwsh scripts/ebike-import/import.ps1 -ApiBase https://api.bikehausfreiburg.com/api -Username admin -Active
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $ApiBase,
    [Parameter(Mandatory = $true)] [string] $Username,
    [string] $Password,
    [switch] $Active
)

$ErrorActionPreference = 'Stop'
$ApiBase = $ApiBase.TrimEnd('/')

if (-not $Password) {
    $sec = Read-Host -AsSecureString "Password for '$Username'"
    $Password = [System.Net.NetworkCredential]::new('', $sec).Password
}

$jsonPath = Join-Path $PSScriptRoot 'feldmeier-ebikes.json'
if (-not (Test-Path $jsonPath)) { throw "Dataset not found: $jsonPath" }
$bikes = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "Loaded $($bikes.Count) e-bikes from dataset."

# --- Login ---------------------------------------------------------------
$loginBody = @{ username = $Username; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$ApiBase/auth/login" -ContentType 'application/json' -Body $loginBody
$token = $login.token
if (-not $token) { throw "Login failed: no token returned." }
$authHeader = @{ Authorization = "Bearer $token" }
Write-Host "Logged in as $Username."

# --- Existing titles (idempotency) --------------------------------------
$existing = Invoke-RestMethod -Method Get -Uri "$ApiBase/e-bikes" -Headers $authHeader
$existingTitles = @($existing | ForEach-Object { $_.titel })

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("ebike-import-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$created = 0; $skipped = 0; $imgOk = 0; $imgFail = 0
try {
    foreach ($b in $bikes) {
        if ($existingTitles -contains $b.titel) {
            Write-Host "  SKIP (exists): $($b.titel)"
            $skipped++; continue
        }

        # 1) Create (only EBikeCreateDto fields; strip sourceUrl/imageUrls)
        $createBody = @{
            titel            = $b.titel
            beschreibung     = $b.beschreibung
            preis            = $b.preis
            preisText        = $null
            kategorie        = $b.kategorie
            marke            = $b.marke
            modell           = $b.modell
            farbe            = $b.farbe
            rahmengroesse    = $b.rahmengroesse
            reifengroesse    = $b.reifengroesse
            gangschaltung    = $b.gangschaltung
            zustand          = $b.zustand
            angebot          = $null
            motorMarke       = $b.motorMarke
            motorPosition    = $b.motorPosition
            akkuKapazitaetWh = $b.akkuKapazitaetWh
            reichweiteKm     = $b.reichweiteKm
            motorLeistungNm  = $b.motorLeistungNm
        } | ConvertTo-Json
        $new = Invoke-RestMethod -Method Post -Uri "$ApiBase/e-bikes" -Headers $authHeader -ContentType 'application/json' -Body $createBody
        $id = $new.id
        Write-Host "  CREATED #$id : $($b.titel)"
        $created++

        # 2) Images
        $sort = 0
        foreach ($url in @($b.imageUrls)) {
            if (-not $url) { continue }
            try {
                $ext = '.jpg'
                if ($url -match '\.png') { $ext = '.png' } elseif ($url -match '\.webp') { $ext = '.webp' }
                $imgFile = Join-Path $tmpDir ("img_${id}_${sort}${ext}")
                Invoke-WebRequest -Uri $url -OutFile $imgFile -UseBasicParsing
                Invoke-RestMethod -Method Post -Uri "$ApiBase/e-bikes/$id/images" -Headers $authHeader -Form @{ files = Get-Item $imgFile } | Out-Null
                $imgOk++; $sort++
            }
            catch {
                Write-Warning "    image failed ($url): $($_.Exception.Message)"
                $imgFail++
            }
        }

        # 3) Set active flag (create defaults to active=true; force desired state)
        $isActive = [bool]$Active
        $updateBody = @{
            titel            = $b.titel
            beschreibung     = $b.beschreibung
            preis            = $b.preis
            preisText        = $null
            kategorie        = $b.kategorie
            marke            = $b.marke
            modell           = $b.modell
            farbe            = $b.farbe
            rahmengroesse    = $b.rahmengroesse
            reifengroesse    = $b.reifengroesse
            gangschaltung    = $b.gangschaltung
            zustand          = $b.zustand
            angebot          = $null
            motorMarke       = $b.motorMarke
            motorPosition    = $b.motorPosition
            akkuKapazitaetWh = $b.akkuKapazitaetWh
            reichweiteKm     = $b.reichweiteKm
            motorLeistungNm  = $b.motorLeistungNm
            isActive         = $isActive
        } | ConvertTo-Json
        Invoke-RestMethod -Method Put -Uri "$ApiBase/e-bikes/$id" -Headers $authHeader -ContentType 'application/json' -Body $updateBody | Out-Null
    }
}
finally {
    Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Done. Created: $created, Skipped(existing): $skipped, Images OK: $imgOk, Images failed: $imgFail."
if (-not $Active) {
    Write-Host "Imported bikes are INACTIVE. Review/edit them in admin (/e-bikes) and publish per-item."
}
