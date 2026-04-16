@echo off
echo ========================================
echo   MAX Limpieza - Iniciando Proyecto
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Error instalando dependencias
        pause
        exit /b 1
    )
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo [2/3] Configurando variables de entorno...
    copy .env.example .env.local
    echo.
    echo IMPORTANTE: Edit .env.local con tu numero de WhatsApp
    echo.
    pause
)

echo [3/3] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo   Abriendo en http://localhost:3000
echo ========================================
echo.
echo Tienda: http://localhost:3000
echo Admin:  http://localhost:3000/admin/login
echo.
echo Presiona Ctrl+C para detener
echo ========================================
echo.

call npm run dev
