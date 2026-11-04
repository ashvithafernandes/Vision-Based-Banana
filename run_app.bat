@echo off
title RipeScan Two-Stage AI Mobile Launcher
cd /d "%~dp0"
cls
echo ==================================================================
echo   Starting RipeScan Unified AI + Expo Environment
echo ==================================================================
.venv\Scripts\python.exe run_app.py
pause
