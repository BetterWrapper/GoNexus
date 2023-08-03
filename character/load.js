const loadPost = require("../misc/post_body");
const character = require("./main");
const asset = require("../asset/main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = url.pathname.match(/\/characters\/([^.]+)(?:\.xml)?$/);
			if (!match) return;

			var id = match[1];
			if (match[2] != "xml") return;
			res.setHeader("Content-Type", "text/xml");
			character.load(id).then((v) => {
				(res.statusCode = 200), res.end(v);
			}).catch((e) => {
				(res.statusCode = 404), 
				console.log(e),
				res.end(e);
			});
			break;
		} case "POST": {
			switch (url.pathname) {
				case "/api/getChars": {
					loadPost(req, res).then(async ([data]) => {
						const json = asset.list(data.userId, 'char', 0, data.cc_theme_id);
						if (!json) return res.end(JSON.stringify([
							{
								error: "Unable to get your characters. userid: " + data.userId
							}
						]));
						else res.end(JSON.stringify(json));
					});
					break;
				} case "/goapi/getCcCharCompositionXml/": {
					loadPost(req, res).then(async ([data]) => {
						res.setHeader("Content-Type", "text/html; charset=UTF-8");
						character.load(data.assetId || data.original_asset_id).then((v) => {
							(res.statusCode = 200), res.end(0 + v);
						}).catch(e => { 
							res.statusCode = 404, 
							console.log(e),
							res.end(1 + e); 
						});
					});
					break;
				} default: return;
			}
		} default: return;
	}
	return true;
};
