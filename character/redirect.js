const http = require("http");
const defaultTypes = {
	family: "adam",
	anime: "guy",
};
const url2 = require("url");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/go/character_creator")) return;
	var match = /\/go\/character_creator\/(\w+)(\/\w+)?(\/.+)?$/.exec(url.pathname);
	if (!match) return;
	[, theme, mode, id] = match;
	const origin = (function() {
		const parsedUrl = url2.parse(req.headers.referer, true);
		if (parsedUrl.pathname.endsWith("/embed")) return `/cc/embed?${
			new URLSearchParams(parsedUrl.query).toString()
		}`;
		else return `/cc?${new URLSearchParams(parsedUrl.query).toString()}`;
	})();
	var redirect;
	switch (mode) {
		case "/copy": {
			redirect = `${origin}&original_asset_id=${id.substr(1)}`;
			break;
		}
		default: {
			var type = url.query.type || defaultTypes[theme] || "";
			redirect = `${origin}&bs=${type}`;
			break;
		}
	}
	res.setHeader("Location", redirect);
	res.statusCode = 302;
	res.end();
	return true;
};
