@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto use_python
py -3 "%~dp0start_game.py"
goto finished
:use_python
python "%~dp0start_game.py"
:finished
if not errorlevel 1 goto done
echo Game failed to start. Run: py -3 start_game.py
pause
:done
endlocal
