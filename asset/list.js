const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const http = require("http");

async function listAssets(data, makeZip) {
	var files;
	switch (data.type) {
		case "char": {
			let tId;
			switch (data.themeId) {
				case "custom": {
					tId = "family";
					break;
				} case "action": {
					tId = "cc2";
					break;
				}
			}
			files = asset.list(data.userId, "char", 0, tId);
			break;
		} default: {
			files = asset.list(data.userId, data.type);
			break;
		}
	}
	var xmlString = `${header}<ugc more="0">${files.map(asset.meta2Xml).join("")}</ugc>`;

	if (makeZip) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));

		files.forEach((file) => {
			switch (file.type) {
				case "bg": {
					const buffer = asset.load(file.id);
					fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
					break;
				}
			}
		});
		return await zip.zip();
	} else return Buffer.from(xmlString);
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var makeZip = false;
	switch (url.pathname) {
		case "/goapi/getUserAssets/":
			makeZip = true;
			break;
		case "/goapi/getUserAssetsXml/":
			break;
		default:
			return;
	}

	switch (req.method) {
		case "GET": {
			var q = url.query;
			if (q.userId && q.type) {
				listAssets(q, makeZip).then((buff) => {
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					res.end(buff);
				});
				return true;
			} else return;
		}
		case "POST": {
			loadPost(req, res).then(async ([data]) => {
				if (data.movieId && data.movieId.startsWith("ft-") && data.type == "sound") res.end(1 + '<error><code>Because you are using a video that has been imported from FlashThemes, you cannot use your sounds in this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</code></error>');
				else {
					const buff = await listAssets(data, makeZip);
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					if (makeZip) res.write(base);
					res.end(buff);
				}
			});
			return true;
		}
		default:
			return;
	}
};
