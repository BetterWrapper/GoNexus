const loadPost = require("../misc/post_body");
const asset = require("./main");
const http = require("http");
const fs = require("fs");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			const match = req.url.match(/\/assets\/([^/]+)$/);
			if (!match) return;

			const aId = match[1];
			try {
				const b = asset.load(aId);
				res.statusCode = 200;
				res.end(b);
			} catch (e) {
				res.statusCode = 404;
				console.log(e);
				res.end("Not found");
			}
			return true;
		}

		case "POST": {
			switch (url.pathname) {
				case "/goapi/deleteAsset/":
				case "/goapi/deleteUserTemplate/":
				case "/goapi/DeleteUserTemplate/": {
					loadPost(req, res).then(([data]) => {
						try {
							const json = JSON.parse(fs.readFileSync('./users.json'));
							const userInfo = json.users.find(i => i.id == data.userId);
							let info, index;
							if (data.id) {
								info = userInfo.assets.find(i => i.enc_asset_id == data.id);
								index = userInfo.assets.findIndex(i => i.enc_asset_id == data.id);
							} else if (data.templateId) {
								info = userInfo.assets.find(i => i.enc_asset_id == data.templateId);
								index = userInfo.assets.findIndex(i => i.enc_asset_id == data.templateId);
							} else if (data.assetId) {
								info = userInfo.assets.find(i => i.id == data.assetId);
								index = userInfo.assets.findIndex(i => i.id == data.assetId);
							}
							fs.unlinkSync(`./_ASSETS/${info.id}`);
							userInfo.assets.splice(index, 1);
							fs.writeFileSync('./users.json', JSON.stringify(json, null, "\t"));
							res.end("0");
						} catch (e) {
							console.log(e);
							res.end("1");
						}
					});
					break;
				}
				case "/goapi/getAsset/":
				case "/goapi/getAssetEx/": {
					loadPost(req, res).then(([data]) => {
						const aId = data.assetId || data.enc_asset_id;

						try {
							const b = asset.load(aId);
							res.setHeader("Content-Length", b.length);
							res.setHeader("Content-Type", "audio/mp3");
							res.end(b);
						} catch (e) {
							res.statusCode = 404;
							console.log(e);
							res.end();
						}
					});
					return true;
				} case "/goapi/updateAsset/": {
					loadPost(req, res).then(([data]) => {
						try {
							const meta = {
								title: true,
								tags: true
							};
							const json = JSON.parse(fs.readFileSync('./users.json'));
							const userInfo = json.users.find(i => i.id == data.userId);
							const info = userInfo.assets.find(i => i.id == data.assetId);
							for (const stuff in data) {
								if (meta[stuff]) {
									info[stuff] = data[stuff];
								}
							}
							fs.writeFileSync('./users.json', JSON.stringify(json, null, "\t"));
							res.end("0");
						} catch (e) {
							console.log(e);
							res.end("1");
						}
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
