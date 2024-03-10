const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const http = require("http");
const fs = require("fs");
async function listAssets(data, isAssetSearch) {
	const xmls = [], files = [];
	switch (data.type) { // if we are going to do chars, then we will need to make sure that custom characters are complatable with the Community Library.
		case "bg": {
			fs.readdirSync('./.site').forEach(file => {
				if (file.endsWith(".jpg")) {
					files.push(file);
					xmls.push(`<background id="${file}" enc_asset_id="${file}" name="${file}" published="1">
						<tags></tags>
					</background>`);
				}
			});
			break;
		} case "prop": {
			fs.readdirSync('./.site').forEach(file => {
				if (file.endsWith(".png")) {
					files.push(file);
					xmls.push(`<prop id="${file}" enc_asset_id="${file}" name="${
						file
					}" holdable="0" wearable="0" placeable="1" published="1" facing="left" subtype="0">
						<tags></tags>
					</prop>`);
				}
			});
			break;
		}
	}
	const zip = nodezip.create();
	if (!isAssetSearch) {
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="Comm" name="Community Library">${
			xmls.join("")
		}</theme>`);
		files.forEach((file) => {
			const buffer = fs.readFileSync(`./.site/${file}`);
			fUtil.addToZip(zip, `${data.type}/${file}`, buffer);
		});
	} else {
		let results = 0;
		files.filter(i => i.includes(data.keywords)).forEach((file) => {
			results++
			const buffer = fs.readFileSync(`./.site/${file}`);
			fUtil.addToZip(zip, `${data.type}/${file}`, buffer);
		});
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="Comm" name="Community Library" all_asset_count="${
			results
		}">${xmls.join("")}</theme>`);
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
		case "/goapi/getCommunityAssets/": break;
		case "/goapi/searchCommunityAssets/": {
			isAssetSearch = true;
			break;
		} default: return;
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
		} case "POST": {
			loadPost(req, res).then(async data => {
				const buff = await listAssets(data, isAssetSearch);
				res.setHeader("Content-Type", "application/zip");
				res.write(base);
				res.end(buff);
			});
			return true;
		} default: return;
	}
};
