:: Important stuff
@echo off && cls
set APP_NAME=Nexus
set APP_VERSION=0.1.0
set NODE_ENV=dev
title %APP_NAME% %APP_VERSION% [Initializing]
::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed!
:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:-------------------------------------- 
	choco
	if '%errorlevel%' NEQ '0' (
		start powershell.exe -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
	) else ( choco install nodejs.install )
			
) else (
    echo Node.js is installed!
    node -v
)

:: Terminate existing node.js apps
TASKKILL /F /IM node.exe
cls

:::::::::::::::::
:: Start Nexus ::
:::::::::::::::::

:: Check for installation
if not exist node_modules (
        title %APP_NAME% %APP_VERSION% [Installing dependencies]
	echo %APP_NAME% does not have it's dependencies installed! Installing dependencies...
	call npm install
	cls
	goto start
) else (
	goto start
)

:: Run npm start
:start
title %APP_NAME% %APP_VERSION% [Starting]
echo %APP_NAME% is now starting...
if %NODE_ENV%==dev (npm test) else (npm start)
