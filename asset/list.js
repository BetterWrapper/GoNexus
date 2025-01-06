const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const http = require("http");
const base2 = Buffer.from([0x0]);
const fs = require('fs');
function getTid(tId) {
	switch (tId) {
		case "custom": return "family";
		case "action": return "cc2";
		case "toonadv": return "cctoonadventure";
		default: return tId;
	}
}
const sessuion = require("../misc/session"); 
async function listAssets(data, makeZip, makeJson) {
	var files, xmlString;
	switch (data.type) {
		case "prop": {
			files = asset.list(data, {
				type: "prop",
				subtype: data.subtype || 0
			});
			break;
		} case "char": {
			const currentSession = data.session;
			const tId = (() => {
				if (data.themeId || data.cc_theme_id) return getTid(data.themeId || data.cc_theme_id, data.studio);
				if (data.studio) return data.studio == "2010" ? "family" : "";
			})();
			const filters = {
				type: "char", 
				subtype: 0
			}
			if (tId) filters.themeId = tId;
			if (data.include_ids_only) filters.id = data.include_ids_only;
			files = asset.list(data, filters);
			async function getOldChars() {
				const ext = data.studio == "2010" ? "zip" : "xml";
				const defaultEmotions = currentSession.data?.emotionsDefault;
				xmlString = `${header}<theme id="ugc" moreChar="${asset.checkcode(files, data)}">${
					await asset[defaultEmotions ? "genOldCharAssetXmlWithPreloadedEmotions" : "genOldCharAssetXml"](
						files, ext, tId, defaultEmotions || data.studio == "2010"
					)
				}</theme>`;
			}
			if (data.file == "old_full_2013.swf" || (parseInt(data.studio) >= 2010 && parseInt(data.studio) < 2013)) await getOldChars();
			break;
		} default: {
			files = asset.list(data, {
				type: data.type
			});
			break;
		}
	}
	const checkcode = asset.checkcode(files, data);
	function stuff() {
		switch (data.type) {
			case "bg": return ` moreBG="${checkcode}"`
			default: {
				const letter = data.type.substr(0, 1);
				return ` more${letter.toUpperCase()}${data.type.substr(1)}="${checkcode}"`
			}
		}
	}
	function stuff2() {
		switch (data.type) {
			case "movie": return ` moreMovie="${checkcode}"`
			case "bg": return ` moreBg="${checkcode}"`
			default: return ` more="${checkcode}"`
		}
	}
	if (!xmlString) xmlString = `${header}<theme id="ugc" name="ugc"${parseInt(data.studio) <= 2015 ? stuff() : stuff2()}>${
		files.map(asset.meta2Xml).join("")
	}</theme>`;
	if (makeZip) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));
		for (const file of files) {
			switch (file.type) {
				case "prop":
				case "bg": {
					const buffer = asset.load(file.id);
					fUtil.addToZip(zip, `${file.type}/${file.id}`, buffer);
					break;
				} case "char": {
					if (data.studio != "2010" && (data.file == "old_full_2013.swf" || Number(data.studio) < 2013)) {
						fUtil.addToZip(zip, `char/${file.id}/stand.xml`, fs.readFileSync('./premadeChars/dummies/1.xml'));
					}
					break;
				} case "movie": {
					const buffer = fs.readFileSync(fUtil.getFileIndex('starter-', '.png', file.id.substr(2)));
					fUtil.addToZip(zip, `${file.id}.png`, buffer);
					break;
				}
			}
		}
		return await zip.zip();
	} else if (!makeJson) return Buffer.from(xmlString);
	return files;
}
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var makeZip = false, makeJson = false;
	switch (url.pathname) {
		case "/goapi/getUserAssets/":
			makeZip = true;
			break;
		case "/api/assets/get/theme/ugc":
			makeJson = true;
			break;
		case "/goapi/getUserAssetsXml/": break;
		default: return;
	}

	switch (req.method) {
		case "GET": {
			var q = url.query;
			if (q.userId && q.type) {
				listAssets(Object.assign({
					session: sessuion.get(req)
				}, q), makeZip, makeJson).then((buff) => {
					const type = makeZip ? "application/zip" : makeJson ? "application/json" : "text/xml";
					res.setHeader("Content-Type", type);
					res.end(makeJson ? JSON.stringify(buff) : buff);
				});
				return true;
			} else return;
		}
		case "POST": {
			loadPost(req, res).then(async data => {
				if (data.movieId && data.movieId.startsWith("ft-") && data.type == "sound") res.end(1 + `<error>
					<code>
						Because you are using a video that has been imported from FlashThemes, 
						you cannot use your sounds in this video at the moment as this video is right now using the FlashThemes servers 
						to get all of the assets provided in this video.
						Please save your video as a normal one in order to get some LVM features back.
					</code>
				</error>`);
				else {
					const buff = await listAssets(Object.assign({
						session: sessuion.get(req)
					}, data), makeZip, makeJson);
					const type = makeZip ? "application/zip" : makeJson ? "application/json" : "text/xml";
					res.setHeader("Content-Type", type);
					if (makeZip) {
						if (Number(data.studio) < 2014) res.write(base);
						else return res.end(Buffer.concat([base2, buff]));
					}
					res.end(makeJson ? JSON.stringify(buff) : buff);
				}
			});
			return true;
		}
		default:
			return;
	}
};