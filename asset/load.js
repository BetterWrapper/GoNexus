const loadPost = require("../misc/post_body");
const asset = require("./main");
const https = require("https");
const {
	getBuffersOnline,
	getBuffersOnlineViaRequestModule
} = require("../movie/main");
const http = require("http");
const base = Buffer.alloc(1, 0);
const fs = require("fs");
const fUtil = require("../misc/file");
const parse = require("../movie/parse");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			switch (url.pathname) {
				default: {
					const match = url.path.match(/\/(assets|(goapi|qvm_micRecord_goapi)\/getAsset)\/([^/]+)$/);
					if (!match) return;
					console.log(match);
					const aId = match[3];
					try {
						const b = parse.retrieveTTSBuffer(aId) || asset.load(aId);
						res.statusCode = 200;
						res.end(b);
					} catch (e) {
						res.statusCode = 404;
						console.log(e);
						res.end("Not found");
					}
					break;
				}
			}
			return true;
		}

		case "POST": {
			switch (url.pathname) {
				case "/goapi/getAssetEx/":
				case "/goapi/getAsset/": {
					loadPost(req, res).then(async data => {
						const aId = data.assetId || data.enc_asset_id;
						try {
							let b;
							if (data.movieId && data.movieId.startsWith("ft-")) b = await getBuffersOnline({
								hostname: "flashthemes.net",
								path: `/goapi/getAsset/${aId}`
							});
							else b = parse.retrieveTTSBuffer(aId) || asset.load(aId);
							if (data.file == "old_full_2013.swf" || parseInt(data.v) <= 2012) res.end(Buffer.concat([base, b]));
							else res.end(b);
						} catch (e) {
							res.statusCode = 404;
							console.log(e);
							res.end();
						}
					});
					return true;
				}
				case "/goapi/deleteAsset/":
				case "/goapi/deleteUserTemplate/":
				case "/goapi/DeleteUserTemplate/": {
					loadPost(req, res).then(data => {
						try {
							asset.delete(data);
							res.end("0");
						} catch (e) {
							console.log(e);
							res.end("1");
						}
					});
					break;
				} case "/goapi/updateAsset/": {
					loadPost(req, res).then(data => {
						try {
							asset.update(data);
							res.end("0");
						} catch (e) {
							console.log(e);
							res.end("1");
						}
					});
					break;
				} case "/goapi/getWaveform/": {
					loadPost(req, res).then(async data => {
						if (data.movieId) try {
							switch (data.movieId.substr(0, data.movieId.lastIndexOf("-"))) {
								case "ft": return res.end(await getBuffersOnlineViaRequestModule({
									method: "post",
									url: "https://flashthemes.net/goapi/getWaveform/"
								}, {
									formData: {
										wfid: data.wfid
									}
								}))
								default: if (fs.existsSync(`${asset.folder}/${data.wfid}.txt`)) return res.end(
									fs.readFileSync(`${asset.folder}/${data.wfid}.txt`)
								);
							}
						} catch (e) {
							console.log(e);
							res.end("1");
						} else if (fs.existsSync(`${asset.folder}/${data.wfid}.txt`)) res.end(fs.readFileSync(`${
							asset.folder
						}/${data.wfid}.txt`))
						else res.end("0");
					});
					break;
				} case "/goapi/saveWaveform/": {
					loadPost(req, res).then(data => {
						if (data.movieId && data.movieId.startsWith("ft-")) return res.end("1");
						fs.writeFileSync(`${asset.folder}/${data.wfid}.txt`, data.waveform);
						res.end("0");
					});
					break;
				}
				default:
					return;
			}
		}
		default:
			return;
	}
};
