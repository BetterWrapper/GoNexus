const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const http = require("http");
const fs = require("fs");
const xmldoc = require("xmldoc");
async function listAssets(data, isAssetSearch) {
	const xmls = [], files = [], counts = {
		min: Number(data.page) * Number(data.count),
	};
	counts.max = counts.min + Number(data.count);
	var checkcode;
	switch (data.type) { // if we are going to do chars, then we will need to make sure that custom characters are complatable with the Community Library.
		case "bg": {
			const stuff = fs.readdirSync('./.site').filter(i => i.endsWith(".jpg"));
			checkcode = counts.max >= stuff.length ? 0 : 1;
			for (; counts.min < counts.max; counts.min++) {
				const file = stuff[counts.min];
				if (!file) continue;
				files.push(file);
				xmls.push(`<background id="${file}" enc_asset_id="${file}" name="${file}" published="1">
					<tags></tags>
				</background>`);
			}
			break;
		} case "prop": {
			const stuff = fs.readdirSync('./.site').filter(i => i.endsWith(".png"));
			checkcode = counts.max >= stuff.length ? 0 : 1;
			for (; counts.min < counts.max; counts.min++) {
				const file = stuff[counts.min];
				if (!file) continue;
				files.push(file);
				xmls.push(`<prop id="${file}" enc_asset_id="${file}" name="${
					file
				}" holdable="0" wearable="0" placeable="1" published="1" facing="left" subtype="0">
					<tags></tags>
				</prop>`);
			}
			break;
		}
	}
	const zip = nodezip.create();
	const charsXML = fs.readFileSync('./_PREMADE/Comm.xml');
	var charsXml = '';
	if (!isAssetSearch) {
		if (data.type != "char") files.forEach((file) => {
			const buffer = fs.readFileSync(`./.site/${file}`);
			fUtil.addToZip(zip, `${data.type}/${file}`, buffer);
		});
		else try {
			const result = new xmldoc.XmlDocument(charsXML);
			checkcode = counts.max >= result.children.length ? 0 : 1;
			for (; counts.min < counts.max; counts.min++) {
				const i = result.children[counts.min];
				if (!i) continue;
				if (i.children) {
					charsXml += `<char ${Object.keys(i.attr).map(v => `${v}="${i.attr[v]}"`).join(" ")}><tags>${
						i.children.find(i => i.name == "tags").val
					}</tags>`;
					for (const d of i.children.filter(i => i.name == "action")) {
						charsXml += `<action ${Object.keys(d.attr).map(v => `${v}="${d.attr[v]}"`).join(" ")}/>`;
						if (fs.existsSync(`./_PREMADE/comm_chars/${i.attr.id}/${
							d.attr.id
						}`)) fUtil.addToZip(zip, `char/${i.attr.id}/${
							d.attr.id
						}`, fs.readFileSync(`./_PREMADE/comm_chars/${i.attr.id}/${d.attr.id}`));
					}
					charsXml += '</char>';
				}
			}
		} catch (e) {
			console.log(e);
		}
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="ugc"${
			parseInt(data.studio) <= 2012 ? (() => {
				switch (data.type) {
					case "bg": return ` moreBG="${checkcode}"`
					default: {
						const letter = data.type.substr(0, 1);
						return ` more${letter.toUpperCase()}${data.type.substr(1)}="${checkcode}"`
					}
				}
			})() : ''
		}>${
			data.type != "char" ? xmls.join("") : charsXml
		}</theme>`);
	} else {
		let results = 0;
		files.filter(i => i.includes(data.keywords)).forEach((file) => {
			results++
			const buffer = fs.readFileSync(`./.site/${file}`);
			fUtil.addToZip(zip, `${data.type}/${file}`, buffer);
		});
		fUtil.addToZip(zip, "desc.xml", `${header}<theme id="ugc" all_asset_count="${
			results
		}"${
			parseInt(data.studio) <= 2012 ? (() => {
				switch (data.type) {
					case "bg": return ` moreBG="${checkcode}"`
					default: {
						const letter = data.type.substr(0, 1);
						return ` more${letter.toUpperCase()}${data.type.substr(1)}="${checkcode}"`
					}
				}
			})() : ''
		}>${xmls.join("")}</theme>`);
	}
	console.log(checkcode);
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
