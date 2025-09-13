# Servir el sitio `web/` por HTTPS local (certificado autofirmado)

Este archivo explica cómo generar un certificado autofirmado y levantar un servidor HTTPS para desarrollo local.

Requisitos
- Python 3.7+ (incluye `http.server`)
- OpenSSL instalado en el sistema (opcional, el script PowerShell puede usarlo)

Archivos creados
- `serve_https.py` — servidor HTTPS pequeño que usa `certs/cert.pem` y `certs/key.pem`.
- `generate_cert.ps1` — helper PowerShell para generar un certificado autofirmado usando OpenSSL.
- `certs/` — carpeta donde se colocarán `cert.pem` y `key.pem`.

Generar certificado con OpenSSL (PowerShell)
1. Abre PowerShell en la carpeta `web/`.
2. Ejecuta:

```powershell
.\generate_cert.ps1 -CommonName "localhost" -OutputDir .\certs
```

El script intentará usar `openssl` para generar:
- `certs/key.pem` (clave privada)
- `certs/cert.pem` (certificado público en PEM)

Si no tienes OpenSSL o el script falla, puedes generar manualmente:

```powershell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -subj "/CN=localhost"
```

Confiar en el certificado (Windows - solo para desarrollo)
- Para evitar advertencias del navegador, puedes añadir `certs/cert.pem` a certificados de entidades de confianza locales. Atención: esto debe hacerse solo en máquinas de desarrollo.
- Abre `certmgr.msc`, importa `certs/cert.pem` a "Entidades de certificación raíz de confianza" (Current User) y acepta.

Servir el sitio por HTTPS
1. En PowerShell, coloca el directorio actual en `web/`:

```powershell
Set-Location -LiteralPath 'C:\Users\AndresGC\Desktop\GC UTILS\web'
python serve_https.py --cert certs/cert.pem --key certs/key.pem --port 5443
```

2. Abre `https://localhost:5443/` en tu navegador.

Aviso de seguridad
- Estos certificados son autofirmados. No los uses en producción.
- No expongas estos servicios en redes públicas sin protección adicional.

Si quieres, puedo:
- Automatizar la creación de la carpeta `certs/` y validar que `openssl` está disponible antes de ejecutar el script PowerShell.
- Extraer los scripts inline y entrenar una CSP estricta (quitar `'unsafe-inline'`).
