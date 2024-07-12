/*
This file starts nexus using electron so that it can be used offline.
*/

const { app, BrowserWindow, Menu, shell } = require("electron");
const fs = require("fs");
const path = require("path");

// start nexus before electron starts
require("./server");

/*
load flash player
*/
let pluginName;
fs.writeFileSync("./jyvee.json", JSON.stringify(process.env, null, "\t"))
console.log(process.platform);
switch (process.platform) {
	case "win32": {
		pluginName = `./flash/windows/${process.env.PROCESSOR_ARCHITECTURE}/pepflashplayer.dll`;
		break;
	}
	case "darwin": {
		pluginName = "./flash/macos/PepperFlashPlayer.plugin";
		break;
	}
	case "linux": {
		pluginName = "./flash/linux/libpepflashplayer.so";
		app.commandLine.appendSwitch("no-sandbox");
		break;
	}
	default: {
		throw new Error("You are running Nexus on an unsupported platform.");
	}
}
app.commandLine.appendSwitch("ppapi-flash-path", path.join(__dirname, pluginName));
app.commandLine.appendSwitch("ppapi-flash-version", "32.0.0.371");

let mainWindow;
const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 700,
		title: "Nexus",
		icon: "./ui/img/icon/favicon.ico",
		webPreferences: {
			plugins: true,
			contextIsolation: true
		}
	});
	Menu.setApplicationMenu(Menu.buildFromTemplate([
		{
			label: "Home",
			click: () => {
				mainWindow.loadURL(`http://localhost:${process.env.SERVER_PORT}`)
			}
		},
		{
			label: "View",
			submenu: [
				{ type: "separator" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ role: "resetZoom" },
				{ type: "separator" },
				{ role: "toggleDevTools" },
				{ role: "reload" },
				{ type: "separator" },
				{ role: "minimize" },
				...(process.platform == "darwin" ? [
					{ role: "front" },
					{ type: "separator" },
					{ role: "window" }
				] : [
					{ role: "close" }
				]),
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Discord Server",
					click: async () => {
						await shell.openExternal("https://discord.gg/BcVeWEhuqJ");
					}
				}
			]
		}
	]));
	// load the video list
	mainWindow.loadURL("http://localhost:" + process.env.SERVER_PORT);
	mainWindow.on("closed", () => process.exit(0));
};

app.whenReady().then(() => {
	// wait for the server
	setTimeout(createWindow, 2000);
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (mainWindow === null) createWindow();
});