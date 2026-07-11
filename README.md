# InventarioSys Desktop

## Para DESARROLLADOR (tú)

### Primer uso
1. Descarga PHP portable de https://windows.php.net/download
   → PHP 8.2 x64 Thread Safe (.zip)
2. Descomprime y renombra la carpeta a `php`
3. Pégala en `php-src/php/` → debe existir `php-src/php/php.exe`
4. Doble clic en **INICIAR.bat** → instala todo y abre la app

### Generar el instalador para tu compañero
1. Asegúrate de que el paso anterior funcione bien
2. Doble clic en **GENERAR_INSTALADOR.bat**
3. Espera 3-5 minutos
4. El archivo `dist/InventarioSys Setup 1.0.0.exe` es el que le mandas

---

## Para el COMPAÑERO (usuario final)
Solo necesita:
1. Abrir `InventarioSys Setup 1.0.0.exe`
2. Instalar (siguiente → siguiente → instalar)
3. Abrir desde el escritorio

**Usuario:** admin  
**Contraseña:** admin123

Los datos se guardan en:
`C:\Users\[nombre]\AppData\Roaming\inventariosys-desktop\data\inventario.db`
