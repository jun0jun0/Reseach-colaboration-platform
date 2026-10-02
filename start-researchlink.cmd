@echo off
cd /d "%~dp0"
echo ResearchLink - http://127.0.0.1:5173
node scripts/run-framework.mjs dev --hostname 127.0.0.1 --port 5173
pause
