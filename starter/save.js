const loadPost = require("../misc/post_body");
const starter = require("../movie/main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || (url.path != "/goapi/saveTemplate/")) return;
	loadPost(req, res).then(async ([data]) => {
		try {
			const body = Buffer.from(data.body_zip, "base64");
			const thumb = data.thumbnail_large && Buffer.from(data.thumbnail, "base64");
			res.end(0 + await starter.save(body, thumb, data));
		} catch (e) {
			console.log(e);
			res.end("1");
		}
	});
	return true;
};
