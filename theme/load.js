const loadPost = require("../misc/post_body");
const folder = process.env.THEME_FOLDER;
const fUtil = require("../misc/file");
const https = require("https");
const http = require("http");
const parse = require("../movie/parse");
const char = require("../character/main");
const fs = require("fs");
const xmldoc = require("xmldoc");
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
					} case "cc2": {
						theme = "action";
						break;
					} case "cctoonadventure": {
						theme = "toonadv";
						break;
					}
				}
				async function getThemeXML() {
					let filename = 'themelist';
					if (data.v) {
						filename += '-old';
						if (data.v == '2010' || data.v == '2012') filename += `-${data.v}`;
					}
					const json = new xmldoc.XmlDocument(fs.readFileSync(`${folder}/${filename}.xml`));
					const tJSON = json.children.filter(i => i.name == "theme").find(i => i.attr.id == theme);
					/*if (tJSON.attr.cc_theme_id && fs.existsSync(`./_PREMADE/${tJSON.attr.cc_theme_id}.json`)) {
						const json = JSON.parse(fs.readFileSync(`./_PREMADE/${tJSON.attr.cc_theme_id}.json`));
						if (
							data.v
							&& parseInt(data.v) <= 2012
						) return await oldStockCharsXML(json, tJSON.attr.cc_theme_id);
						else return await stockCharsXML(json, tJSON.attr.cc_theme_id);
					} else */return fs.readFileSync(`./_THEMES/${theme}${parseInt(data.v) <= 2012 ? 'old' : ''}.xml`)
				}
				async function stockCharsXML(stockChars, tId) {
					var xml2zip = (fs.readFileSync(`./_THEMES/${theme}.xml`)).toString().split("</theme>")[0];
					for (const stockChar of stockChars) {
						for (const v of stockChar.people) {
							const id = stockChar.id ? stockChar.id + v.id : v.id;
							xml2zip += `<char id="${id}" name="${
								v.name
							}" thumbnail_url="/char-default.png" cc_theme_id="${
								tId
							}" copyable="Y"><tags>${tId},_free,_cat:${v.cat}</tags></char>`
						}
					}
					return xml2zip + '</theme>';
				}
				async function oldStockCharsXML(stockChars, tId) {
					var xml2zip = (fs.readFileSync(`./_THEMES/${theme}old.xml`)).toString().split("</theme>")[0];
					for (const stockChar of stockChars) {
						for (const v of stockChar.people) {
							const id = stockChar.id ? stockChar.id + v.id : v.id;
							const buf = await char.load(id);
							const charJSON = await parse.getStuffForOldStockChar(buf, data, tId);
							xml2zip += `<char id="${id}" enc_asset_id="${v.id}" thumb="${id}.zip" is_premium="Y" sharing="5" money="0" name="${
								v.name
							}" cc_theme_id="${tId}" editable="N" ${
								charJSON.defaults
							} enable="Y" copyable="Y" isCC="Y" locked="Y" facing="left" published="1"><tags>${
								tId
							},${
								stockChar.tag
							}</tags>${charJSON.xmls}</char>`
						}
					}
					return xml2zip + '</theme>';
				}
				res.setHeader("Content-Type", "application/zip");
				fUtil.makeZipFromBuffer(await getThemeXML(), "theme.xml").then((b) => res.end(b));
			});
			break;
		} case "/goapi/getThemeList/": {
			loadPost(req, res).then(async data => {
				let filename = 'themelist';
				if (data.v) {
					filename += '-old';
					if (data.v == '2010' || data.v == '2012') filename += `-${data.v}`;
				}
				res.setHeader("Content-Type", "application/zip");
				let userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.userId);
				if (req.headers.host.includes("localhost")) userInfo = JSON.parse(fs.readFileSync('./_ASSETS/local.json'));
				const tXML = fs.readFileSync(`${folder}/${filename}.xml`).toString().split("points").join(`points money="0" sharing="${userInfo.gopoints}"`);
				fUtil.makeZipFromBuffer(Buffer.from(tXML), "themelist.xml").then((b) => res.end(b));

			})
			break;
		} default: return;
	}
	return true;
};
