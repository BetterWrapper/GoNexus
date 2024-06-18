const http = require("http");
const loadPost = require("../misc/post_body");
const xmldoc = require("xmldoc");
const character = require("./main");
const fs = require("fs");
const session = require("../misc/session");
const asset = require("../asset/main");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
function getCharType(buffer) {
	const beg = buffer.indexOf(`component_id="`) + 14;
	const end = buffer.indexOf(`"`, beg);
	return buffer.subarray(beg, end).toString();
}
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/api/getLatestPremadeCharIds": {
			res.setHeader("Content-Type", "application/json");
			const array = fs.readdirSync("./premadeChars/xml");
			const table = [];
			var count = 0;
			for (const i of array) {
				const val = i.slice(0, -4);
				const buffer = fs.readFileSync(`./premadeChars/xml/${i}`);
				const tid = character.getTheme(buffer);
				if (
					tid == url.query.ti
					&& fs.existsSync(`./premadeChars/thumb/${val}.png`)
					&& fs.existsSync(`./premadeChars/head/${val}.png`)
				) table.unshift({
					index: (count++) + 1,
					val
				})
			}
			res.end(JSON.stringify(table));
			break;
		} case "/goapi/getCCPreMadeCharacters": {
			loadPost(req, res).then(async data => {
				let chars = '';
				if (data.v == "2010" && fs.existsSync(`./_PREMADE/${data.theme_code || data.themeId}.json`)) try { 
					const json = JSON.parse(fs.readFileSync(`./_PREMADE/${data.theme_code || data.themeId}.json`));
					for (const meta of json) {
						for (const s of meta.people) {
							const buf = await character.load(s.id);
							chars += buf.toString().split("<cc_char").join(`<cc_char is_premium="Y" sharing="5" money="0" aid="${
								s.id
							}" tags="${data.theme_code || data.themeId},_category_${
								meta.tag
							}" id="${s.id}" name="${
								s.name
							}"`)
						}
					}
					res.setHeader("Content-Type", "application/xml");
					res.end(chars);
				} catch (e) {
					console.log(e);
					res.end("1");
				} else res.end();
			});
			break;
		} case "/ajax/getCCPreMadeCharacters": {
			loadPost(req, res).then(async data => {
				const chars = [];
				res.setHeader("Content-Type", "application/json");
				function newInfo(v) {
					chars.unshift({
						id: v.id, 
						tid: v.id,
						tags: v.charType, 
						url: `char_thumbs/${v.id}.png`, 
						money: "0", 
						sharing: "0" 
					});
				}
				if (data.cat != "*") {
					fs.readdirSync(`./premadeChars/xml`).forEach(file => {
						if (data.theme_code == character.getTheme(fs.readFileSync(`./premadeChars/xml/${file}`))) {
							if (data.cat == getCharType(fs.readFileSync(`./premadeChars/xml/${file}`))) newInfo({
								id: file.split(".xml")[0],
								charType: getCharType(fs.readFileSync(`./premadeChars/xml/${file}`))
							});
						}
					})
				} else {
					fs.readdirSync(`./premadeChars/xml`).forEach(file => {
						if (data.theme_code == character.getTheme(fs.readFileSync(`./premadeChars/xml/${file}`))) newInfo({
							id: file.split(".xml")[0],
							charType: getCharType(fs.readFileSync(`./premadeChars/xml/${file}`))
						});
					})
				}
				console.log(chars);
				res.end(JSON.stringify(chars));
			});
			break;
		} default: return;
	}
	return true;
};
