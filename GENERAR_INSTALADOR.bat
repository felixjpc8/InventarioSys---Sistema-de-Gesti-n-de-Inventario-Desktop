@echo off
chcp 65001 > nul
title InventarioSys — Generando instalador .exe
color 1F

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║        GENERANDO INSTALADOR InventarioSys.exe        ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  IMPORTANTE: Antes de continuar verifica que:
echo.
echo  [✓] php-src\php\php.exe   existe  (PHP portable)
echo  [✓] php-src\SYS\app\public\login.php  existe
echo  [✓] npm install  ya fue ejecutado
echo.
pause

echo.
echo  Construyendo... (puede tardar 3-5 minutos)
echo.
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo  ✗ Error al construir.
    echo    Revisa los mensajes de error arriba.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   ✓ ¡Instalador generado exitosamente!              ║
echo  ║                                                      ║
echo  ║   Busca el archivo en la carpeta:  dist\            ║
echo  ║   Archivo: InventarioSys Setup 1.0.0.exe            ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Ese .exe puedes enviárselo a tu compañero.
echo  Solo necesita instalarlo y ya funciona. Sin nada más.
echo.
explorer dist
pause
