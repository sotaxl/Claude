@echo off
:: Keyboard Mode Guard — Launcher
:: Requests admin rights, checks Python, then runs keyboard_guard.py

:: Re-launch with UAC elevation if not already admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

:: Check Python is available
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo  ERROR: Python is not installed or not on PATH.
    echo.
    echo  Please download Python from:  https://www.python.org/downloads/
    echo  During install, tick "Add Python to PATH" then re-run this file.
    echo.
    pause
    exit /b 1
)

:: Run the guard (same folder as this .bat)
cd /d "%~dp0"
python keyboard_guard.py
