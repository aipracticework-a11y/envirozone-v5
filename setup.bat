@echo off
echo ============================================
echo   ESG Trust Platform - First Time Setup
echo ============================================
echo.

echo [1/3] Setting up Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if not exist .env copy .env.example .env
echo Backend setup complete!
echo.

echo [2/3] Setting up React frontend...
cd ..\frontend
npm install
echo Frontend setup complete!
echo.

echo [3/3] Done!
echo ============================================
echo  Setup complete! Now run: start.bat
echo  Or follow README.md for manual steps.
echo ============================================
pause
