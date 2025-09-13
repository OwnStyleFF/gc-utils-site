Param(
    [string]$CommonName = "localhost",
    [string]$OutputDir = "certs"
)

# Create output dir if missing
if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$certPath = Join-Path $OutputDir 'cert.pem'
$keyPath = Join-Path $OutputDir 'key.pem'

# Check for openssl
$openssl = Get-Command openssl -ErrorAction SilentlyContinue
if (-not $openssl) {
    Write-Error "OpenSSL no está disponible en PATH. Instala OpenSSL o genera los archivos manualmente."
    exit 1
}

# Generate cert and key
Write-Output "Generando certificado autofirmado para $CommonName en $OutputDir..."
$cmd = "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout `"$keyPath`" -out `"$certPath`" -subj `/CN=$CommonName`"
Invoke-Expression $cmd

if (Test-Path $certPath -and Test-Path $keyPath) {
    Write-Output "Certificado generado: $certPath"
    Write-Output "Clave privada generada: $keyPath"
} else {
    Write-Error "No se pudieron generar los archivos. Comprueba que OpenSSL funciona." 
    exit 2
}
