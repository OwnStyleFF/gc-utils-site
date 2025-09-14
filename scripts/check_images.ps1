# Comprueba imágenes referenciadas en juegos-consolas.json
# Crea carpeta image/imagescorrupted si no existe
# Genera missing_images.txt y corrupted_images.txt dentro de esa carpeta

param(
    [string]$JsonPath = "c:\Users\AndresGC\Desktop\GC UTILS\juegos\juegos-consolas.json",
    [string]$RepoRoot = "c:\Users\AndresGC\Desktop\GC UTILS"
)

try {
    if (-not (Test-Path $JsonPath)) {
        Write-Error "No se encontró $JsonPath"
        exit 2
    }
    $json = Get-Content $JsonPath -Raw | ConvertFrom-Json
    $outDir = Join-Path $RepoRoot "image\imagescorrupted"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

    $missing = @()
    $corrupt = @()

    foreach ($j in $json) {
        $imgRel = $j.imagen
        if (-not $imgRel) { continue }
        # Normalizar path: si comienza con ../ lo convertimos relativo al RepoRoot
        $imgPath = $imgRel -replace '^\.\./', ''
        $imgFull = Join-Path $RepoRoot $imgPath
        if (-not (Test-Path $imgFull)) {
            $missing += $imgFull
        } else {
            # Comprobar tamaño
            $fi = Get-Item $imgFull
            if ($fi.Length -eq 0) { $corrupt += $imgFull }
        }
    }

    $missingFile = Join-Path $outDir "missing_images.txt"
    $corruptFile = Join-Path $outDir "corrupted_images.txt"

    if ($missing.Count -gt 0) {
        $missing | Out-File -FilePath $missingFile -Encoding UTF8
        Write-Output "Se encontraron $($missing.Count) imágenes faltantes. Listadas en: $missingFile"
    } else {
        "No missing images" | Out-File -FilePath $missingFile -Encoding UTF8
        Write-Output "No se encontraron imágenes faltantes."
    }

    if ($corrupt.Count -gt 0) {
        $corrupt | Out-File -FilePath $corruptFile -Encoding UTF8
        Write-Output "Se encontraron $($corrupt.Count) imágenes corruptas (0 bytes). Listadas en: $corruptFile"
    } else {
        "No corrupted images" | Out-File -FilePath $corruptFile -Encoding UTF8
        Write-Output "No se encontraron imágenes corruptas."
    }
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
