const loadPost = require("../misc/post_body");
const character = require("./main");
const asset = require("../asset/main");
const http = require("http");
const xmldoc = require("xmldoc");
const fs = require("fs");
const {xmlToJson} = require("../movie/xmlConverter");
const base = Buffer.alloc(1, 0);
const nodezip = require("node-zip");
const fUtil = require("../misc/file");
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
			character.load(id).then((v) => {
				res.setHeader("Content-Type", "application/xml");
				(res.statusCode = 200), res.end(v);
			}).catch((e) => {
				(res.statusCode = 404), 
				console.log(e),
				res.end(e.toString());
			});
			break;
		} case "POST": {
			switch (url.pathname) {
				case "/goapi/getActionpacks/": {
					loadPost(req, res).then(async data => {
						const buf = await character.load(data.aid);
						const json = new xmldoc.XmlDocument(fs.readFileSync(`./frontend/static/store/cc_store/${
							character.getTheme(buf)
						}/cc_theme.xml`))
						var actionpacks = '0<packs>';
						for (const i of json.children.filter(i => i.name == "bodyshape")) {
							if (
								i.attr.id == character.getCharTypeViaBuff(buf)
							) for (const d of i.children.filter(i => i.name == "actionpack")) {
								var actionpack = `<pack id="${d.attr.id}" title="${d.attr.name}" sold="0" gobucks="${
									d.attr.money
								}" buy="1">`;
								for (const i of d.children.filter(i => i.name == "action")) {
									i.attr.id = i.attr.id + '.xml';
									actionpack += `<action ${Object.keys(i.attr).map(v => `${v}="${i.attr[v]}"`).join(" ")}/>`;
								}
								actionpacks += actionpack + '</pack>';
							}
						}
						res.setHeader("Content-Type", "application/xml");
						res.end(actionpacks + '</packs>');
					});
					break;
				}
				case "/goapi/getCharacter/": {
					loadPost(req, res).then(async data => res.end(await character.packZip(Object.assign({
						emotionsFile: (require("../misc/session")).get(req).data?.emotionsDefault
					}, data))))
					break;
				} case "/goapi/getCcCharCompositionXml/": {
					loadPost(req, res).then(async data => {
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
				} case "/goapi/getCharacterAction/": {
					loadPost(req, res).then(async data => { 
						const charId = data.charId.includes(".") ? data.charId.split(".")[0] : data.charId;
						try {
							const buf = await character.load(charId);
							const result = await xmlToJson(buf);
							if (
								data.actionId 
								&& data.facialId 
								&& data.facialId.endsWith(".zip") 
								&& data.actionId.endsWith(".zip")
							) {
								res.setHeader("Content-Type", "application/zip");
								res.end(await character.genZip4ActionAndFacials(result, [
									{
										action: data.actionId.split(".")[0],
										function: "genActionXml"
									},
									{
										action: data.facialId.split(".")[0],
										function: "genFacialXml"
									}
								]));			
							} else if (data.actionId) {
								const pieces = data.actionId.split(".");
								switch (pieces[1]) {
									case "xml": {
										res.setHeader("Content-Type", "application/xml");
										res.end(await character.genActionXml(result, pieces[0]));
										break;
									} case "zip": {
										res.setHeader("Content-Type", "application/zip");
										res.end(await character.genZip4ActionAndFacials(result, [
											{
												action: pieces[0],
												function: 'genActionXml'
											}
										]));
										break;
									}
								}
							} else if (data.facialId) {
								const pieces = data.facialId.split(".");
								switch (pieces[1]) {
									case "xml": {
										res.setHeader("Content-Type", "application/xml");
										res.end(await character.genFacialXml(result, pieces[0], 'facial'));
										break;
									} case "zip": {
										res.setHeader("Content-Type", "application/zip");
										res.end(await character.genZip4ActionAndFacials(result, [
											{
												action: pieces[0], 
												function: 'genFacialXml'
											}
										]));
										break;
									}
								}
							}
						} catch (e) {
							res.setHeader("Content-Type", "application/x-shockwave-flash");
							const p = './frontend/static/store';
							for (const g of fs.readdirSync(p)) {
								if (!fs.existsSync(`${p}/${g}/char/${data.charId}/${data.actionId}`)) continue;
								res.end(fs.readFileSync(`${p}/${g}/char/${data.charId}/${data.actionId}`));
							}
						}
					});
					break;
				} default: return;
			}
		} default: return;
	}
	return true;
};
