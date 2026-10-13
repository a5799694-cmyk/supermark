@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
    py start_game.py
) else (
    python start_game.py
)
if errorlevel 1 (
    echo 启动失败，请安装 Python 3 后再试。
    pause
)
