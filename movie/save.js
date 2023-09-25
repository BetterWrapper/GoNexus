const loadPost = require("../misc/post_body");
const movie = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveMovie/") return;
	loadPost(req, res).then(async ([data]) => {
		try {
			var thumb;
			const trigAutosave = data.is_triggered_by_autosave;
			if (trigAutosave && (!data.movieId || !data.thumbnail_large)) thumb = await movie.genImage();
			else thumb = Buffer.from(data.thumbnail_large, "base64");
			const body = Buffer.from(data.body_zip, "base64");
			res.end(0 + await movie.save(body, thumb, data, false, req));
		} catch (e) {
			console.log(e);
			res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
		}
	});
	return true;
};
