@echo off
echo ========================================
echo   CDC Web App - Quick Start Server
echo ========================================
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting local server with Python...
    echo.
    echo Open your browser and go to:
    echo http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
    goto :end
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python not found. Trying Node.js...
    echo.
    
    REM Check if http-server is installed
    where http-server >nul 2>&1
    if %errorlevel% equ 0 (
        echo Starting local server with Node.js...
        echo.
        echo Open your browser and go to:
        echo http://localhost:8000
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        http-server -p 8000
        goto :end
    ) else (
        echo Installing http-server...
        npm install -g http-server
        echo.
        echo Starting local server with Node.js...
        echo.
        echo Open your browser and go to:
        echo http://localhost:8000
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        http-server -p 8000
        goto :end
    )
)

REM Check for PHP
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python and Node.js not found. Trying PHP...
    echo.
    echo Starting local server with PHP...
    echo.
    echo Open your browser and go to:
    echo http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:8000
    goto :end
)

REM No server found
echo ERROR: No suitable web server found!
echo.
echo Please install one of the following:
echo - Python 3: https://www.python.org/downloads/
echo - Node.js: https://nodejs.org/
echo - PHP: https://www.php.net/downloads
echo.
echo After installation, run this script again.
pause
goto :end

:end

