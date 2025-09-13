Param(
    [string]$RepoName = "gc-utils-site",
    [string]$Visibility = "public",
    [string]$Description = "Sitio estático GC UTILS - contenido de la carpeta web/",
    [string]$GitHubOwner = "$env:USER",
    [string]$Branch = "main"
)

# Requirements: gh (GitHub CLI) authenticated, git installed
# Usage: .\push_to_github.ps1 -RepoName "gc-utils-site" -Visibility public

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "El comando 'gh' (GitHub CLI) no está instalado o no está en PATH. Instálalo desde https://cli.github.com/"
    exit 1
}

Set-Location -LiteralPath (Resolve-Path .)\..\
$root = Get-Location
$siteDir = Join-Path $root 'web'

if (-not (Test-Path $siteDir)) {
    Write-Error "No se encontró la carpeta 'web' en $root"
    exit 1
}

# Create repo via gh
Write-Output "Creando repositorio $RepoName en tu cuenta GitHub..."
$createCmd = "gh repo create $RepoName --$Visibility --description `"$Description`" --confirm"
Invoke-Expression $createCmd

# Initialize git in a temp folder and push web/ as the repo root
$tempDir = Join-Path $env:TEMP ("deploy_" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy web content into tempDir
robocopy $siteDir $tempDir /E /XD $siteDir\certs

Set-Location -LiteralPath $tempDir
git init
git checkout -b $Branch
# create .gitignore
"web/certs/`nsite.zip`nweb-deploy/" | Out-File -FilePath .gitignore -Encoding utf8

git add .
git commit -m "Initial site upload for Cloudflare Pages"
# Set remote and push
$remote = "https://github.com/$GitHubOwner/$RepoName.git"
git remote add origin $remote
git branch -M $Branch
git push -u origin $Branch

# Cleanup
Set-Location -LiteralPath $root
Remove-Item -Recurse -Force $tempDir

Write-Output "Repositorio creado y contenido subido: https://github.com/$GitHubOwner/$RepoName"
Write-Output "Ahora puedes conectar este repo a Cloudflare Pages y usar 'web' como directorio de salida si necesitas mantener la carpeta."