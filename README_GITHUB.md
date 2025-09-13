# Subir el sitio a GitHub y conectar a Cloudflare Pages

Opciones para crear el repositorio y subir el contenido de `web/`:

1) Usando GitHub CLI (`gh`) y el script `push_to_github.ps1` (recomendado)

Requisitos:
- Git instalado y en `PATH`.
- `gh` (GitHub CLI) instalado y autenticado: `gh auth login`.

Uso:
```powershell
Set-Location -LiteralPath 'C:\Users\AndresGC\Desktop\GC UTILS'
.\push_to_github.ps1 -RepoName "gc-utils-site" -Visibility public -GitHubOwner "<tu-usuario-github>"
```

Esto creará el repo en tu cuenta y empujará el contenido de `web/` al branch `main`.

2) Manual (UI)
- Crea un repo nuevo en GitHub web.
- Descomprime `site.zip` y sube su contenido al repo (o arrastra los archivos en la UI).
- Asegúrate de que el contenido quede en la raíz del repo o ajusta Cloudflare Pages para usar `web` como directorio de salida.

3) Subir con Git manualmente (PowerShell)
```powershell
Set-Location -LiteralPath 'C:\Users\AndresGC\Desktop\GC UTILS'
git init
git add web
git commit -m "Upload site"
# Crea el repo en GitHub (UI) y luego:
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git branch -M main
git push -u origin main
```

Conectar a Cloudflare Pages
- En Cloudflare Dashboard -> Pages -> Create project -> conecta tu proveedor Git -> selecciona el repo -> Build output directory: `web` -> Deploy.

Notas:
- No subir `web/certs/` al repo.
- Añadí un `.gitignore` en la raíz del proyecto para excluir `web/certs/`, `site.zip` y carpetas temporales.

Si necesitas, puedo ejecutar el script `push_to_github.ps1` por ti (necesitarás autenticar `gh` y proveer tu usuario GitHub).