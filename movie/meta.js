const movie = require("./main");
const http = require("http");
const fs = require("fs");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/meta")) return;
	const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
	const mId = url.pathname.substr(url.pathname.lastIndexOf("/") + 1)
	for (const meta of json.users) {
		const m = meta.movies.find(i => i.id == mId);
		if (m) return res.end(JSON.stringify(m));
	}
	res.end(JSON.stringify({}));
	return true;
};
