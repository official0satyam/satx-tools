@echo off
title SatX Tools Live Preview Launcher
echo ===================================================
echo 🚀 Launching SatX Tools Local Preview Server...
echo ===================================================
python serve.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error: Failed to run serve.py. 
    echo Please make sure Python is installed and in your system PATH.
    echo.
    pause
)
