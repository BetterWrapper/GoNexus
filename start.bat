:: Important stuff
@echo off && cls
title BetterWrapper
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
	echo BetterWrapper is not installed! Installing...
	call npm install
	cls
	goto start
) else (
	goto start
)

:: Run npm start
:start
echo BetterWrapper is now starting...
echo Please navigate to http://localhost:8090 on your browser.
npm start
