const loadPost = require("../misc/post_body");
const folder = process.env.THEME_FOLDER;
const fUtil = require("../misc/file");
const http = require("http");
const parse = require("../movie/parse");
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
			loadPost(req, res).then(data => {
				var theme = data.themeId;
				const themeInfo = (parse.getThemes()).find(i => i.attr.id == theme);
				switch (theme) {
					case "family":
						theme = "custom";
						break;
				}
				res.setHeader("Content-Type", "application/zip");
				fUtil.makeZip(`${folder}/${theme}${themeInfo && themeInfo.attr && themeInfo.attr.cc_theme_id && data.studio ? 'old' : ''}.xml`, "theme.xml").then((b) => res.end(b));
			});
			break;
		} case "/goapi/getThemeList/": {
			loadPost(req, res).then(data => {
				let filename = 'themelist';
				if (data.studio) {
					filename += '-old';
					if (data.studio == '2010' || data.studio == '2012') filename += `-${data.studio}`;
					if (data.studio == "2010" && data.ctc == "domo") filename += `-domo`;
				}
				res.setHeader("Content-Type", "application/zip");
				fUtil.makeZip(`${folder}/${filename}.xml`, "themelist.xml").then((b) => res.end(b));
			})
			break;
		} default: return;
	}
	return true;
};
