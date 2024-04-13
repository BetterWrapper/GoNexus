const loadPost = require("../misc/post_body");
const character = require("./main");
const asset = require("../asset/main");
const http = require("http");
const xmldoc = require("xmldoc");
const fs = require("fs");
const https = require("https");
const nodezip = require("node-zip");
const fUtil = require("../misc/file");
const session = require("../misc/session");
const get = require("../misc/get");
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
				case "/goapi/getActionpacks/": {
					loadPost(req, res).then(async data => {
						const buf = await character.load(data.aid);
						const json = new xmldoc.XmlDocument(fs.readFileSync(`./charStore/${character.getTheme(buf)}/cc_theme.xml`))
						var actionpacks = '0<pack sold="0">';
						for (const i of json.children.filter(i => i.name == "bodyshape")) {
							if (
								i.attr.id == character.getCharTypeViaBuff(buf)
							) for (const d of i.children.filter(i => i.name == "actionpack")) {
								var actionpack = `<packs id="${d.attr.id}" title="${d.attr.name}" sold="1" gobucks="${d.attr.money}" buy="1">`;
								for (const i of d.children.filter(i => i.name == "action")) {
									var action = `<action`;
									i.attr.id = i.attr.id + '.xml';
									for (const d in i.attr) {
										action += ` ${d}="${i.attr[d]}"`;
									}
									actionpack += action + '/>';
								}
								actionpacks += actionpack + '</packs>';
							}
						}
						res.end(actionpacks + '</pack>');
					});
					break;
				}
				case "/goapi/getCharacter/": {
					loadPost(req, res).then(async data => res.end(await character.packZip(data)))
					break;
				} case "/api/getChars": {
					loadPost(req, res).then(async data => {
						try {
							const json = asset.list('', '', '', data.userId, 'char', 0, data.cc_theme_id);
							if (!json) return res.end(
								JSON.stringify(
									[
										{
											error: "Unable to get your characters. userid: " + data.userId
										}
									]
								)
							);
							res.end(JSON.stringify(json));
						} catch (e) {
							console.log(e);
							res.end(
								JSON.stringify(
									[
										{
											error: e.toString()
										}
									]
								)
							);
						}
					});
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
					loadPost(req, res).then(async data => { try {
						const componentArray = [];
						const colorArray = [];
						const libArray = [];
						const charId = data.charId.includes(".") ? data.charId.split(".")[0] : data.charId;
						const buf = await character.load(charId);
						const result = new xmldoc.XmlDocument(buf);
						if (
							data.actionId 
							&& data.facialId 
							&& data.facialId.endsWith(".zip") 
							&& data.actionId.endsWith(".zip")
						) {
							const components = result.children.filter(i => i.name == "component");
							const componentswithactions = {};
							const zip = nodezip.create();
							const emotion = (character.getCharEmotionsJson({
								action: data.facialId.split(".zip")[0],
								theme_id: character.getTheme(buf)
							}))[data.facialId.split(".zip")[0]]
							const action = (character.getCharActionsJson({
								action: data.actionId.split(".zip")[0],
								bs: character.getCharTypeViaBuff(buf),
								theme_id: character.getTheme(buf)
							}))[data.actionId.split(".zip")[0]]
							fUtil.addToZip(zip, "desc.xml", buf);
							res.setHeader("Content-Type", "application/zip");
							for (const i in action) {
								const component = components.find(d => d.attr.type == i);
								if (component) {
									fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${action[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
							}
							for (const i in emotion) {
								const component = components.find(d => d.attr.type == i);
								if (component) {
									fUtil.addToZip(zip, `${component.attr.theme_id}.${
										component.attr.type
									}.${
										component.attr.component_id
									}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
										component.attr.type
									}/${
										component.attr.component_id
									}/${emotion[component.attr.type]}.swf`));
									componentswithactions[component.attr.type] = true;
								}
							}
							for (const component of components) {
								switch (component.attr.type) {
									case "bodyshape": {
										fUtil.addToZip(zip, `${component.attr.theme_id}.${component.attr.type}.${
											component.attr.component_id
										}.swf`, fs.readFileSync(`./charStore/${
											component.attr.theme_id
										}/${component.attr.type}/${
											component.attr.component_id
										}/thumbnail.swf`))
										break;
									} default: {
										if (!componentswithactions[component.attr.type]) fUtil.addToZip(
											zip, `${component.attr.theme_id}.${component.attr.type}.${
												component.attr.component_id
											}.swf`, fs.readFileSync(`./charStore/${component.attr.theme_id}/${
												component.attr.type
											}/${component.attr.component_id}/default.swf`)
										);
										break;
									}
								}
							}
							res.end(await zip.zip());				
						} else if (data.actionId) {
							if (data.actionId.endsWith(".zip")) res.end(
								await character.zipAction(
									character.getCharTypeViaBuff(buf), data.actionId.split(".zip")[0], result, character.getCharActionsJson({
										action: data.actionId.split(".zip")[0],
										theme_id: character.getTheme(buf),
										bs: character.getCharTypeViaBuff(buf)
									})
								)
							);
							else if (data.actionId.endsWith(".xml")) {
								res.setHeader("Content-Type", "application/xml");
								for (const info of result.children) {
									switch (info.name) {
										case "library": {
											libArray.unshift(info.attr);
											break;
										} case "component": {
											const inf = info.attr;
											inf.action = data.actionId.split(".xml")[0];
											inf.bs = character.getCharTypeViaBuff(buf);
											componentArray.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											colorArray.unshift(inf);
											break;
										}
									}
								}							
								res.end(`<cc_char ${
									result.attr ? `xscale='${result.attr.xscale}' yscale='${
										result.attr.yscale
									}' hxscale='${result.attr.hxscale}' hyscale='${
										result.attr.hyscale
									}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
								}>${componentArray.map(character.meta2componentXml2).join("")}${
									colorArray.map(character.meta2colourXml).join("")
								}${libArray.map(character.meta2libraryXml).join("")}</cc_char>`);
							} 
						} else if (data.facialId) {
							if (data.facialId.endsWith(".zip")) res.end(
								await character.zipEmotion(
									character.getCharTypeViaBuff(buf), data.facialId.split(".zip")[0], result, character.getCharEmotionsJson({
										action: data.facialId.split(".zip")[0],
										theme_id: character.getTheme(buf)
									})
								)
							); else if (data.facialId.endsWith(".xml")) {
								res.setHeader("Content-Type", "application/xml");
								for (const info of result.children) {
									switch (info.name) {
										case "component": {
											const inf = info.attr;
											inf.action = data.facialId.split(".xml")[0];
											componentArray.unshift(inf);
											break;
										} case "color": {
											const inf = info.attr;
											inf.text = info.val;
											colorArray.unshift(inf);
											break;
										}
									}
								}
								res.end(`<facial>${componentArray.map(character.meta2componentXml).join("")}${
									colorArray.map(character.meta2colourXml).join("")
								}</facial>`);
							}
						}
					} catch (e) {
						console.log(e);
					}});
				} default: return;
			}
		} default: return;
	}
	return true;
};
