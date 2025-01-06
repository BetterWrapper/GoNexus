const loadPost = require("../misc/post_body");
const folder = process.env.THEME_FOLDER;
const fUtil = require("../misc/file");
const http = require("http");
const {
	xmlToJson,
	jsonToXml
} = require("../movie/xmlConverter");
const asset = require("../asset/main");
const fs = require("fs");
const { assignObjects } = require("../movie/main");
const session = require("../misc/session");
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
				const buffer = fs.readFileSync(`./_THEMES/${theme}.xml`);
				const themeInfo = (await xmlToJson(buffer)).theme;
				async function getThemeXML() {
					if (themeInfo._attributes.cc_theme_id && fs.existsSync(`./_PREMADE/${themeInfo._attributes.cc_theme_id}.json`)) {
						const json = JSON.parse(fs.readFileSync(`./_PREMADE/${themeInfo._attributes.cc_theme_id}.json`));
						if (
							data.studio
							&& parseInt(data.studio) <= 2012
						) return await oldStockCharsXML(json, themeInfo._attributes.cc_theme_id);
						if (data.file != "old_full_2013.swf") return await stockCharsXML(json, themeInfo._attributes.cc_theme_id);
						return buffer
					} else return buffer
				}
				async function stockCharsXML(stockChars, tId) {
					var xml2zip = buffer.toString().split("</theme>")[0];
					for (const stockChar of stockChars) {
						const encId = stockChar.id || '';
						for (const v of stockChar.people) {
							const id = encId + v.id;
							xml2zip += `<char id="${id}" name="${
								v.title
							}" thumbnail_url="/char-default.png" cc_theme_id="${
								tId
							}" copyable="Y"><tags>${tId},_free,_cat:${v.cat}</tags></char>`
						}
					}
					return xml2zip + '</theme>';
				}
				async function oldStockCharsXML(stockChars, tId) {
					var xml2zip = buffer.toString().split("</theme>")[0];
					const currentSession = session.get(req);
					const defaultEmotions = currentSession.data?.emotionsDefault;
					for (const stockChar of stockChars) {
						const json = await xmlToJson(`<chars>${await asset[
							defaultEmotions ? "genOldCharAssetXmlWithPreloadedEmotions" : "genOldCharAssetXml"
						](stockChar.people, data.studio == "2010" ? "zip" : 'xml', tId, defaultEmotions || data.studio == "2010")}</chars>`);
						xml2zip += jsonToXml({
							char: json.chars.char.map(v => assignObjects(v, [
								{
									_attributes: {
										sharing: 2,
										is_premium: "Y",
										money: 0
									},
									tags: [`${tId},${stockChar.tag}`]
								}
							]))
						});
					}
					return xml2zip + '</theme>';
				}
				res.setHeader("Content-Type", "application/zip");
				res.end(await fUtil.makeZipFromBuffer(await getThemeXML(), "theme.xml"));
			});
			break;
		} case "/goapi/getThemeList/": {
			loadPost(req, res).then(async data => {
				let filename = 'themelist';
				if (data.studio) {
					filename += '-old';
					if (data.studio == '2010' || data.studio == '2012') filename += `-${data.studio}`;
				}
				res.setHeader("Content-Type", "application/zip");
				let userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.userId);
				if (req.headers.host.includes("localhost")) userInfo = JSON.parse(fs.readFileSync('./_ASSETS/local.json'));
				const tXML = fs.readFileSync(`${folder}/${filename}.xml`).toString().split("points").join(
					`points money="0" sharing="${userInfo.gopoints}"`
				);
				res.end(await fUtil.makeZipFromBuffer(Buffer.from(tXML), "themelist.xml"));
			})
			break;
		} default: return;
	}
	return true;
};
