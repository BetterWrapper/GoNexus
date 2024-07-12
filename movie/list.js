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
	const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == url.query.uid);
	function loadMoviesFromJSON(j) {
		const a = j.movies;
		const sorted = a.sort((a, b) => b.id - a.id);
		res.end(JSON.stringify(sorted));
	}
	if (url.query.uid && json) loadMoviesFromJSON(json);
	else {
		if (!req.headers.host.includes("localhost")) res.end(JSON.stringify([]));
		else loadMoviesFromJSON(JSON.parse(fs.readFileSync('./_ASSETS/local.json')));
	}
	return true;
};
