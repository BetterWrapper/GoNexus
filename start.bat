:: Important stuff
@echo off && cls
set APP_NAME=GoNexus
set APP_VERSION=0.0.1
title %APP_NAME% %APP_VERSION% [Initializing]
::::::::::::::::::::
:: Initialization ::
::::::::::::::::::::

:: Terminate existing node.js apps
TASKKILL /IM node.exe /F 2>nul
cls

:::::::::::::::::::::::::
:: Start BetterWrapper ::
:::::::::::::::::::::::::

:: Check for installation
if not exist node_modules (
        title %APP_NAME% %APP_VERSION% [Installing dependecies]
	echo %APP_NAME% does not have it's dependecies installed! Installing dependecies...
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
npm start
