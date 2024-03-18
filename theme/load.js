const loadPost = require("../misc/post_body");
const folder = process.env.THEME_FOLDER;
const fUtil = require("../misc/file");
const https = require("https");
const http = require("http");
const parse = require("../movie/parse");
const char = require("../character/main");
const fs = require("fs");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/goapi/getTheme/": {
			loadPost(req, res).then(async data => {
				var theme = data.themeId;
				const themeInfo = (parse.getThemes()).find(i => i.attr.id == theme);
				switch (theme) {
					case "family": {
						theme = "custom";
						break;
					}
				}
				async function oldStockCharsXML(stockChars) {
					var xml2zip = (fs.readFileSync(`./_THEMES/${theme}old.xml`)).toString().split("</theme>")[0];
					for (const stockChar of stockChars) {
						for (const v of stockChar.people) {
							const charJSON = await parse.getStuffForOldStockChar(v.id, data);
							function getJoseph() {
								return new Promise((res, rej) => {
									https.get('https://wrapperclassic.netlify.app/chars/4048901.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getDaniel() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004797.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getDavidEscobar() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004414.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getRage() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/6667041.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getBluePeacocks() { // Does not work (probably because the 2010 lvm char does not support some face)
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004418.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getTutGirl() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000001.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getOwen() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000000.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							function getJyvee() {
								return new Promise((res, rej) => {
									https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004416.xml', r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
									});
								});
							}
							let buf;
							if (v.id == "4048901") buf = await getJoseph();
							else if (v.id == "4715202") buf = await getTutGirl();
							else if (v.id == "192") buf = await getDavidEscobar();
							else if (v.id == "60897073") buf = await getBluePeacocks();
							else if (v.id == "66670973") buf = await getJyvee();
							else if (v.id == "4635901") buf = await getOwen();
							else if (v.id == "0000000") buf = await getRage();
							else if (v.id == "666") buf = await getDaniel();
							xml2zip += `<char id="${v.id}" enc_asset_id="${v.id}" thumb="${
								v.id
							}.zip" is_premium="N" sharing="0" money="0" name="${
								v.name
							}" cc_theme_id="${char.getTheme(buf)}" editable="N" ${
								charJSON.defaults
							} enable="Y" copyable="Y" isCC="Y" locked="Y" facing="left" published="1"><tags>${
								char.getTheme(buf)
							},_category_${
								stockChar.tag
							}</tags>${charJSON.xmls}</char>`
						}
					}
					return xml2zip + '</theme>';
				}
				res.setHeader("Content-Type", "application/zip");
				if (
					theme != "custom" 
					&& themeInfo 
					&& themeInfo.attr
					&& themeInfo.attr.cc_theme_id 
					&& data.studio
				) fUtil.makeZip(`${folder}/${theme}${
					themeInfo && themeInfo.attr && themeInfo.attr.cc_theme_id && data.studio ? 'old' : ''
				}.xml`, "theme.xml").then((b) => res.end(b));
				else fUtil.makeZipFromBuffer(await oldStockCharsXML([
					{ // professions (not developers of GoNexus)
						tag: "professions",
						people: [
							{
								name: "2010 LVM Tutorial Woman",
								id: "4715202"
							},
							{
								 name: "David Escobar",
								 id: "192"
							},
							{
								 name: "Daniel",
								 id: "666"
							}
						]
					},
					{ // celebrities (developers of GoNexus)
						tag: "celebrities",
						people: [
							{
								name: "BluePeacocks",
								id: "60897073"
							},
							{
								name: "Jyvee",
								id: "66670973"
							},
							{
								name: "Joseph",
								id: "4048901"
							},
							{
								name: "Rage",
								id: "0000000"
							},
							{
								name: "Owen",
								id: "4635901"
							},
						]
					},
				]), "theme.xml").then((b) => res.end(b));
			});
			break;
		} case "/goapi/getThemeList/": {
			loadPost(req, res).then(data => {
				let filename = 'themelist';
				if (data.studio) {
					filename += '-old';
					if (data.studio == '2010' || data.studio == '2012') filename += `-${data.studio}`;
				}
				res.setHeader("Content-Type", "application/zip");
				fUtil.makeZip(`${folder}/${filename}.xml`, "themelist.xml").then((b) => res.end(b));
			})
			break;
		} default: return;
	}
	return true;
};
