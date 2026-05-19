@echo off
chcp 65001 > nul
cls
cd /d "%~dp0"

echo ===================================================
echo   TU DONG CAP NHAT DU LIEU DASHBOARD VA NETLIFY
echo ===================================================
echo.
echo Buoc 0: Hay dat file .xlsx moi nhat vao thu muc:
echo   data\raw
echo.

echo [1/4] Doc Excel va sinh file JSX data...
call npm run data:update
if errorlevel 1 goto fail

echo.
echo [2/4] Kiem tra build website...
call npm run build
if errorlevel 1 goto fail

echo.
echo [3/4] Tao commit len Git...
git add .
git diff --cached --quiet
if errorlevel 1 goto commit_changes
echo Khong co thay doi moi de commit.
goto push_changes

:commit_changes
git commit -m "Cap nhat du lieu dashboard %date% %time%"
if errorlevel 1 goto fail

:push_changes
echo.
echo [4/4] Day code len GitHub de Netlify dong bo...
git push origin main
if errorlevel 1 goto fail

echo.
echo ===================================================
echo   HOAN TAT. NETLIFY SE TU DONG DEPLOY BAN MOI.
echo ===================================================
goto end

:fail
echo.
echo ===================================================
echo   CO LOI XAY RA. VUI LONG KIEM TRA THONG BAO BEN TREN.
echo ===================================================

:end
echo.
echo Bam mot phim bat ky de dong cua so nay.
pause > nul
