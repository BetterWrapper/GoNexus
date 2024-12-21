const http = require("http");
const fs = require("fs");
const session = require("../misc/session");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || url.pathname != "/movieList") return;
	const currentSession = session.get(req);
	res.setHeader("Content-Type", "application/json");
	const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == currentSession.data.current_uid);
	function loadMoviesFromJSON(j) {
		const a = j.movies;
		const sorted = a.sort((a, b) => b.id - a.id);
		res.end(JSON.stringify(sorted));
	}
	if (json) loadMoviesFromJSON(json);
	else {
		if (!req.headers.host.includes("localhost")) res.end(JSON.stringify([]));
		else loadMoviesFromJSON(JSON.parse(fs.readFileSync('./_ASSETS/local.json')));
	}
	return true;
};
