/**
 * InventarioSys Desktop — main.js
 * PHP embebido + SQLite. Sin MySQL. Sin XAMPP.
 * El usuario solo instala y abre. Nada más.
 */

const { app, BrowserWindow, dialog, shell, Menu } = require('electron');
const path   = require('path');
const { spawn, exec } = require('child_process');
const http   = require('http');
const fs     = require('fs');

// ── RUTAS ─────────────────────────────────────────────────
const PHP_PORT  = 8085;
const PHP_URL   = `http://localhost:${PHP_PORT}`;
const IS_PACKED = app.isPackaged;

// En producción todo vive en resources/php-src
const BASE_DIR  = IS_PACKED
    ? path.join(process.resourcesPath, 'php-src')
    : path.join(__dirname, 'php-src');

// PHP portable empaquetado dentro de la app
const PHP_BIN   = path.join(BASE_DIR, 'php', 'php.exe');
const WEB_ROOT  = path.join(BASE_DIR, 'SYS', 'app', 'public');

// Base de datos SQLite en AppData del usuario (persiste entre actualizaciones)
const DATA_DIR      = path.join(app.getPath('userData'), 'data');
const DB_PATH       = path.join(DATA_DIR, 'inventario.db');
const SESSIONS_DIR  = path.join(DATA_DIR, 'php_sessions');   // FIX: directorio de sesiones

// ── ESTADO ────────────────────────────────────────────────
let mainWindow   = null;
let splashWindow = null;
let phpProcess   = null;

// ── SPLASH ────────────────────────────────────────────────
function createSplash() {
    splashWindow = new BrowserWindow({
        width: 440, height: 290,
        frame: false, transparent: true,
        alwaysOnTop: true, resizable: false,
        webPreferences: { nodeIntegration: false }
    });
    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

// ── VENTANA PRINCIPAL ─────────────────────────────────────
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280, height: 820,
        minWidth: 960, minHeight: 640,
        show: false,
        title: 'InventarioSys',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    const menu = Menu.buildFromTemplate([
        {
            label: 'Aplicación',
            submenu: [
                { label: '🏠 Inicio',      click: () => mainWindow.loadURL(`${PHP_URL}/index.php`) },
                { label: '🛒 Ventas',      click: () => mainWindow.loadURL(`${PHP_URL}/sales.php`) },
                { label: '📦 Productos',   click: () => mainWindow.loadURL(`${PHP_URL}/products.php`) },
                { label: '👥 Clientes',    click: () => mainWindow.loadURL(`${PHP_URL}/clients.php`) },
                { label: '🚚 Suplidores',  click: () => mainWindow.loadURL(`${PHP_URL}/suppliers.php`) },
                { label: '📊 Reportes',    click: () => mainWindow.loadURL(`${PHP_URL}/reports.php`) },
                { type: 'separator' },
                { label: 'Recargar',       accelerator: 'F5', click: () => mainWindow.reload() },
                { type: 'separator' },
                { label: 'Salir',          accelerator: 'Alt+F4', click: () => app.quit() },
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { role: 'zoomIn',        label: 'Acercar' },
                { role: 'zoomOut',       label: 'Alejar' },
                { role: 'resetZoom',     label: 'Tamaño normal' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Pantalla completa (F11)' },
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: '📁 Abrir carpeta de datos',
                    click: () => shell.openPath(DATA_DIR)
                },
                { type: 'separator' },
                {
                    label: 'ℹ️ Acerca de',
                    click: () => dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'InventarioSys',
                        message: 'InventarioSys v1.0\n\nSistema de Gestión de Inventario\nBase de datos: SQLite\n\nUsuario por defecto:\nadmin / admin123',
                        buttons: ['OK']
                    })
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => { mainWindow = null; });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// ── INICIAR PHP ───────────────────────────────────────────
function startPhp() {
    return new Promise((resolve, reject) => {
        // Verificar que PHP existe dentro de la app
        if (!fs.existsSync(PHP_BIN)) {
            reject(new Error(
                'No se encontró el servidor PHP interno.\n\n' +
                'Reinstala la aplicación.\n\n' +
                'Ruta esperada:\n' + PHP_BIN
            ));
            return;
        }

        // Crear carpetas de datos y sesiones si no existen
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        // FIX: Crear directorio de sesiones PHP con ruta real (sin %USERNAME%)
        if (!fs.existsSync(SESSIONS_DIR)) {
            fs.mkdirSync(SESSIONS_DIR, { recursive: true });
        }

        const env = {
            ...process.env,
            SQLITE_DB_PATH: DB_PATH,
        };

        console.log('[PHP] Iniciando en puerto', PHP_PORT);
        console.log('[DB]  SQLite:', DB_PATH);
        console.log('[SES] Sesiones PHP:', SESSIONS_DIR);

        // FIX: Pasar session.save_path directamente como opción -d para evitar
        // el problema de %USERNAME% sin expandir en php.ini en Windows
        phpProcess = spawn(PHP_BIN, [
            '-d', `session.save_path=${SESSIONS_DIR}`,
            '-S', `localhost:${PHP_PORT}`,
            '-t', WEB_ROOT
        ], {
            cwd: WEB_ROOT,
            env,
            windowsHide: true   // Sin ventana CMD visible
        });

        phpProcess.on('error', err => reject(new Error('Error PHP: ' + err.message)));

        // Esperar hasta 15 seg a que PHP responda
        waitForServer(`${PHP_URL}/login.php`, 30, resolve, reject);
    });
}

function waitForServer(url, retries, resolve, reject) {
    http.get(url, () => { resolve(); })
        .on('error', () => {
            if (retries <= 0) {
                reject(new Error('El sistema tardó demasiado en iniciar.\nIntenta abrir la app de nuevo.'));
                return;
            }
            setTimeout(() => waitForServer(url, retries - 1, resolve, reject), 500);
        });
}

// ── ARRANQUE ──────────────────────────────────────────────
app.whenReady().then(async () => {
    createSplash();
    try {
        await startPhp();
        createMainWindow();
        mainWindow.loadURL(`${PHP_URL}/login.php`);
    } catch (err) {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();
        dialog.showErrorBox('Error al iniciar InventarioSys', err.message);
        app.quit();
    }
});

// ── CIERRE LIMPIO ─────────────────────────────────────────
app.on('window-all-closed', () => {
    killPhp();
    if (process.platform !== 'darwin') app.quit();
});
app.on('before-quit', killPhp);

function killPhp() {
    if (!phpProcess) return;
    try {
        exec(`taskkill /PID ${phpProcess.pid} /T /F`);
    } catch (_) {
        try { phpProcess.kill(); } catch (_) {}
    }
    phpProcess = null;
}
