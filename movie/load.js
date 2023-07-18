const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/movies\/([^.]+)(?:\.(zip|xml))?$/);
			if (!match) return;

			var id = match[1];
			var ext = match[2];
			switch (ext) {
				case "zip":
					res.setHeader("Content-Type", "application/zip");
					movie.loadZip({movieId: id}, {movieOwner: url.query.movieOwnerId}).then((v) => {
						if (v) {
							res.statusCode = 200;
							res.end(v);
						} else {
							res.statusCode = 404;
							res.end();
						}
					});
					break;
				default:
					res.setHeader("Content-Type", "text/xml");
					movie.loadXml(id).then((v) => {
						if (v) {
							res.statusCode = 200;
							res.end(v);
						} else {
							res.statusCode = 404;
							res.end();
						}
					});
					break;
			}
			return true;
		}

		case "POST": {
			if (!url.path.startsWith("/goapi/getMovie/")) return;
			res.setHeader("Content-Type", "application/zip");
			loadPost(req, res).then(async ([data]) => {
				try {
					const b = await movie.loadZip(url.query, data);
					res.end(Buffer.concat([base, b]));
				} catch (e) {
					console.log(e);
					res.end(1 + e);
				}
			});
			return true;
		}
		default:
			return;
	}
};
