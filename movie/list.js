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
	if (req.method != "GET" || url.pathname != "/movieList") return;
	res.setHeader("Content-Type", "application/json");
	if (url.query.uid && JSON.parse(fs.readFileSync('./users.json')).users.find(i => i.id == url.query.uid)) {
		const a = JSON.parse(fs.readFileSync('./users.json')).users.find(i => i.id == url.query.uid).movies;
		const sorted = a.sort((a, b) => b.id - a.id);
		res.end(JSON.stringify(sorted));
	} else res.end(JSON.stringify([]));
	return true;
};
