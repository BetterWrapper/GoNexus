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
		case "/goapi/getCCPreMadeCharacters": {
			loadPost(req, res).then(async data => {
				let chars = process.env.XML_HEADER;
				if (data.v == "2010" && fs.existsSync(`./_PREMADE/${data.themeId}.xml`)) try { // only show stock chars for the 2010 char creator because this does not work on the 2012/2013 char creators for some reason.
					const realresult = new xmldoc.XmlDocument(fs.readFileSync(`./_PREMADE/${data.themeId}.xml`));
					for (const meta of realresult.children) {
						if (meta.attr) {
							const buf = await character.load(meta.attr.id)
							chars += `<cc_char aid="${meta.attr.id}" tags="family,_category_${meta.children[1].val.includes("Specialties") ? "professions" : "celebrities"}" id="${meta.attr.id}" name="${
								meta.attr.name
							}" ${buf.toString().split("<cc_char")[1]}`;
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
