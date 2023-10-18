const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const http = require("http");

async function listAssets(data, isAssetSearch) {
	const xmls = [], files = [];
    switch (data.type) {
		case "bg": {
			fs.readdirSync('./.site').forEach(file => {
                if (file.endsWith(".jpg")) {
                    files.push(file);
                    xmls.push(`<background id="${file}" enc_asset_id="${file}" name="${file}" published="1"><tags></tags></background>`);
                }
            });
			break;
		} case "prop": {
			fs.readdirSync('./.site').forEach(file => {
                if (file.endsWith(".png")) {
                    files.push(file);
                    xmls.push(`<prop id="${file}" enc_asset_id="${file}" name="${file}" holdable="0" wearable="0" placeable="1" published="1" facing="left" subtype="0"><tags></tags></prop>`);
                }
            });
			break;
		}
	}
	const zip = nodezip.create();
	if (!isAssetSearch) {
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="Comm" name="Community Library">${xmls.map(v => v).join("")}</theme>`);
		files.forEach((file) => {
			const buffer = fs.readFileSync(`./.site/${file}`);
			fUtil.addToZip(zip, `${data.type}/${file.id}`, buffer);
		});
	} else {
		let results = 0;
		files.forEach((file) => {
			if (file.includes(data.keywords)) {
				results++
				const buffer = fs.readFileSync(`./.site/${file}`);
				fUtil.addToZip(zip, `${data.type}/${file.id}`, buffer);
			}
		});
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="Comm" name="Community Library" all_asset_count="${results}">${xmls.map(v => v).join("")}</theme>`);
	}
	return await zip.zip();
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var isAssetSearch = false;
	switch (url.pathname) {
		case "/goapi/getCommunityAssets/":
			break;
		case "/goapi/searchCommunityAssets/":
			isAssetSearch = true;
			break;
		default:
			return;
	}

	switch (req.method) {
		case "GET": {
			var q = url.query;
			if (q.userId && q.type) {
				listAssets(q, isAssetSearch).then((buff) => {
					res.setHeader("Content-Type", "application/zip");
					res.end(buff);
				});
				return true;
			} else return;
		}
		case "POST": {
			loadPost(req, res).then(async ([data]) => {
				if (data.movieId && data.movieId.startsWith("ft-") && data.type == "sound") res.end(1 + '<error><code>Because you are using a video that has been imported from FlashThemes, you cannot use your sounds in this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</code></error>');
				else {
					const buff = await listAssets(data, isAssetSearch);
					res.setHeader("Content-Type", "application/zip");
					res.write(base);
					res.end(buff);
				}
			});
			return true;
		}
		default:
			return;
	}
};
