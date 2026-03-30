@echo off
echo ============================================
echo   ESG Trust Platform - Starting App
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI)...
cd backend
call venv\Scripts\activate
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (React)...
cd ..\frontend
start cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ============================================
echo  App is starting up!
echo  Backend:  http://localhost:8000/docs
echo  Frontend: http://localhost:3000
echo ============================================
start http://localhost:3000
