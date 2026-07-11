# InventarioSys Desktop — Instrucciones de instalación
## ✅ Lo que incluye este paquete

- `main.js` — proceso principal de Electron
- `splash.html` — pantalla de carga
- `preload.js` — puente de seguridad
- `package.json` — configuración de la app
- Carpeta `SYS_sqlite/` — tu proyecto PHP adaptado a SQLite

---

## 📋 Requisitos (instalar una sola vez)

| Herramienta | Enlace | Para qué |
|---|---|---|
| **Node.js 18+** | https://nodejs.org | Ejecutar Electron |
| **PHP portable (Windows)** | https://windows.php.net/download | Servidor web embebido |

> ⚠️ **Ya NO necesitas XAMPP ni MySQL.**

---

## 🗂️ Estructura final que debes tener

```
inventariosys-desktop/
├── main.js
├── preload.js
├── splash.html
├── package.json
├── INSTRUCCIONES.md
├── assets/
│   └── icon.ico          (opcional, pon aquí tu ícono)
└── php-src/
    ├── php/               ← PHP portable aquí
    │   ├── php.exe
    │   ├── php.ini        ← cópialo de php.ini-development
    │   └── ext/
    └── SYS/               ← proyecto PHP (del ZIP SYS_sqlite)
        └── app/
            ├── config/
            ├── controllers/
            ├── models/
            ├── public/    ← aquí está login.php, index.php...
            └── views/
```

---

## 🚀 Paso a paso

### Paso 1 — Descomprimir

Descomprime este ZIP en una carpeta, por ejemplo:
```
C:\Users\TuUsuario\Desktop\inventariosys-desktop\
```

### Paso 2 — Agregar PHP portable

1. Ve a: https://windows.php.net/download
2. Descarga **PHP 8.2 x64 Thread Safe** (el archivo `.zip`)
3. Descomprime el ZIP
4. Renombra la carpeta descomprimida a `php`
5. Cópiala dentro de `php-src/` → debe quedar `php-src/php/php.exe`

**Configurar php.ini:**
1. Dentro de `php-src/php/` encuentra el archivo `php.ini-development`
2. Cópialo y renómbralo a `php.ini`
3. Abre `php.ini` con el Bloc de notas
4. Busca y quita el `;` de estas líneas:
```
extension=pdo_sqlite
extension=pdo
extension=sqlite3
extension=mbstring
extension=openssl
extension=gd
```
5. Guarda el archivo

### Paso 3 — Copiar el proyecto PHP

1. Del ZIP que descargaste, copia la carpeta `SYS_sqlite`
2. Pégala dentro de `php-src/`
3. Renómbrala a `SYS`
4. Resultado: `php-src/SYS/app/public/login.php` debe existir

### Paso 4 — Instalar dependencias de Electron

Abre **PowerShell** o **CMD** en la carpeta del proyecto y ejecuta:
```bash
npm install
```
(Esto descarga Electron automáticamente, ~150MB)

### Paso 5 — Probar la app

```bash
npm start
```

Debe aparecer la pantalla de carga y luego abrirse el sistema. ✅

**Usuario:** `admin`  
**Contraseña:** `admin123`

---

## 📦 Crear el instalador .exe (para distribuir)

Cuando todo funcione, ejecuta:
```bash
npm run build
```

Esto crea la carpeta `dist/` con un instalador `.exe` que puedes enviar a cualquier computadora con Windows.

> La base de datos SQLite se guarda automáticamente en:
> `C:\Users\[Usuario]\AppData\Roaming\inventariosys-desktop\data\inventario.db`
>
> Esto significa que los datos **persisten aunque desinstales y reinstales** la app.

---

## 🔧 Solución de errores comunes

| Error | Causa | Solución |
|---|---|---|
| "No se encontró php.exe" | PHP mal colocado | Verifica que `php-src/php/php.exe` existe |
| Pantalla blanca / no carga | Fallo en PHP | Abre Herramientas (menú Ver) y revisa la consola |
| Error de extensión PDO_SQLITE | php.ini sin activar | Activa `extension=pdo_sqlite` en php.ini |
| Puerto 8085 ocupado | Otro proceso lo usa | Cambia `PHP_PORT` en `main.js` a 8086 u otro |
| Datos no se guardan | Permisos de AppData | Ejecuta la app como administrador la primera vez |

---

## 📊 Acerca de la base de datos SQLite

- **No requiere servidor**: todo está en un archivo `.db`
- **Backup**: copia el archivo `inventario.db` y listo
- **Compatible**: el esquema es idéntico al de MySQL, solo cambia el motor
- **Rendimiento**: perfecta para hasta ~100,000 registros
