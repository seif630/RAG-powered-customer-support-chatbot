@echo off
cd /d "%~dp0"
echo ======================================================
echo Starting the RAG Chatbot Flask Application
echo ======================================================

:: Activate the virtual environment
if exist ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
) else (
    echo Virtual environment not found. Please ensure .venv exists.
    pause
    exit /b 1
)

:: Open the browser (the server might take a moment to start, you can refresh if it's not ready immediately)
echo Opening browser...
start http://localhost:5000

:: Start the Flask app
echo Starting Server...
python app.py

pause
