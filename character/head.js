const char = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var path = url.pathname;
	if (req.method != "GET" || !path.startsWith("/char_heads")) return;
	var beg = path.lastIndexOf("/") + 1;
	var end = path.lastIndexOf(".");
	var ext = path.substr(end + 1).toLowerCase();
	if (ext != "png") return;

	char
		.loadHead(path.substr(beg, end - beg))
		.then((v) => {
			res.setHeader("Content-Type", "image/png");
			res.statusCode = 200;
			res.end(v);
		})
		.catch(e => {
			res.statusCode = 400;
			console.log(e);
		});
	return true;
};
