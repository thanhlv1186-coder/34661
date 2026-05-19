@echo off
cls
echo ===================================================
echo    HE THONG TU DONG CAP NHAT CODE LEN NETLIFY      
echo ===================================================
echo.

:: Buoc 1: Gom tat ca cac file thay doi
echo [1/3] Dang gom cac file thay doi (git add) ...
git add .
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the gom file.
    goto end
)

:: Buoc 2: Tao ghi chu tu dong kem ngay gio
echo.
echo [2/3] Dang tao ghi chu luu tru (git commit) ...
set CURRENT_DATE=%date%
set CURRENT_TIME=%time%
git commit -m "Cap nhat tu dong ngay %CURRENT_DATE% luc %CURRENT_TIME%"

:: Buoc 3: Day code len GitHub
echo.
echo [3/3] Dang day code len GitHub (git push) ...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Day code that bai. Kiem tra mang hoac Github.
    goto end
)

echo.
echo ===================================================
echo   DA CAP NHAT THANH CONG! NETLIFY DANG DONG BO...   
echo ===================================================

:end
echo.
echo Bam mot phim bat ky de dong cua so nay.
pause > nul