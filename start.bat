:: Important stuff
@echo off && cls
set APP_NAME=Nexus
set APP_VERSION=0.1.0 Beta
set NODE_ENV=dev
title %APP_NAME% %APP_VERSION% [Initializing]
::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

:: Terminate existing node.js apps
TASKKILL /IM node.exe /F 2>nul
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
echo Please navigate to http://localhost:8090 on your browser.
if %NODE_ENV%==dev (
	npm test
) else (
	npm start
)