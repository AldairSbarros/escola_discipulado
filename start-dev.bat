@echo off
echo ==========================================
echo Iniciando Escola de Discipulado (Dev)
echo ==========================================

echo [1/2] Iniciando Backend (Porta 3001)...
start cmd /k "cd backend && npm install && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend PWA (Porta 3000)...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Servidores iniciados!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
pause