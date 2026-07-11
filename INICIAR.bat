@echo off
chcp 65001 > nul
title InventarioSys — Configuración inicial
color 1F

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║           INVENTARIOSYS — CONFIGURACIÓN              ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: Verificar Node.js
echo  [1/3] Verificando Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ✗ Node.js no está instalado.
    echo.
    echo  Por favor instala Node.js desde:
    echo  https://nodejs.org
    echo.
    echo  Descarga la versión LTS (botón verde grande)
    echo  Instálala y luego ejecuta este archivo de nuevo.
    echo.
    pause
    start https://nodejs.org
    exit /b 1
)
echo  ✓ Node.js encontrado
echo.

:: Verificar PHP
echo  [2/3] Verificando PHP embebido...
if exist "php-src\php\php.exe" (
    echo  ✓ PHP encontrado en php-src\php\
) else (
    echo.
    echo  ✗ PHP no encontrado.
    echo.
    echo  Descargando instrucciones...
    echo.
    echo  1. Ve a: https://windows.php.net/download
    echo  2. Descarga "PHP 8.2 x64 Thread Safe" (archivo .zip)
    echo  3. Descomprime el ZIP
    echo  4. Renombra la carpeta a "php"
    echo  5. Cópiala aquí: php-src\php\
    echo     (debe existir php-src\php\php.exe)
    echo.
    echo  Abriendo la página de descarga de PHP...
    pause
    start https://windows.php.net/download
    echo.
    echo  Cuando termines, ejecuta este archivo de nuevo.
    pause
    exit /b 1
)

:: Copiar php.ini si no existe el php.exe real (solo placeholder)
if exist "php-src\php\php.ini" (
    echo  ✓ php.ini configurado
) else (
    if exist "php-src\php\php.ini-development" (
        copy "php-src\php\php.ini-development" "php-src\php\php.ini" > nul
        echo  ✓ php.ini creado automáticamente
    )
)

:: Instalar dependencias npm
echo.
echo  [3/3] Instalando dependencias de Electron...
echo      (esto puede tardar 1-2 minutos la primera vez)
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo  ✗ Error al instalar dependencias.
    echo    Verifica tu conexión a internet e intenta de nuevo.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   ✓ ¡TODO LISTO! Iniciando InventarioSys...         ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Usuario: admin
echo  Contraseña: admin123
echo.
timeout /t 2 > nul
call npm start
