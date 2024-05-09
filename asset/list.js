const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const char = require("../character/main");
const http = require("http");
const base2 = Buffer.from([0x0]);
const xmldoc = require("xmldoc");
const fs = require('fs');
function getTid(tId) {
	switch (tId) {
		case "custom": return "family";
		case "action": return "cc2";
		case "toonadv": return "cctoonadventure";
		default: return tId;
	}
}
function searchStuff(tId, data) {
	for (const folder2 of fs.readdirSync(`./static/2010/store/cc_store/${tId}/${data.attr.type}`)) {
		for (const i of fs.readdirSync(`./static/2010/store/cc_store/${tId}/${data.attr.type}/${folder2}`)) {
			return fs.existsSync(`./static/2010/store/cc_store/${tId}/${data.attr.type}/${folder2}/${data.attr.state_id}.swf`);
		}
	}
}
async function listAssets(data, makeZip) {
	var files, xmlString;
	const id = data.assetId ? data.assetId == 'null' ? data.include_ids_only : data.assetId : data.include_ids_only;
	switch (data.type) {
		case "prop": {
			files = data.subtype == "video" ? [] : asset.list(
				data.count || '', data.page || '', id, data.exclude_ids ? data.exclude_ids.split(",") : '', data.userId, "prop"
			);
			break;
		} case "char": {
			if ((data.v == "2011" || data.v == "2012") && !data.cc_theme_id) {
				files = [];
				xmlString = `${header}<theme id="ugc" moreChar="0"></theme>`;
				break;
			}
			const tId = (() => {
				if (data.themeId || data.cc_theme_id) return getTid(data.themeId || data.cc_theme_id, data.v);
				if (data.v) return data.v == "2010" ? "family" : "";
			})();
			const fatials = {};
			const actions = {};
			const actionPack = {};
			const action_cat = {};
			const defaultActions = {};
			files = asset.list(
				data.count || '', data.page || '', id, data.exclude_ids ? data.exclude_ids.split(",") : '', data.userId, "char", 0, tId
			);
			if (data.include_ids_only || data.exclude_ids) console.log(files);
			async function getOldChars2() {
				const defaults = {
					family: `<action id="stand.xml" name="Stand" loop="Y" totalframe="1" enable="Y" is_motion="N"/>`,
					cc2: `<action id="stand.xml" name="Standing" loop="Y" totalframe="1" enable="Y" is_motion="N"/>`
				}
				xmlString = `${header}<theme id="ugc" moreChar="${asset.checkcode(data.count || '', data.page || '', data.userId, 'char', 0, tId)}">`;
				console.log(xmlString);
				for (const file of files) {
					fatials[file.id] = fatials[file.id] || [];
					const data = new xmldoc.XmlDocument(fs.readFileSync(`./static/2010/store/cc_store/${
						file.themeId
					}/cc_theme.xml`));
					function get(stuff, param, com, com2) {
						if (!com2) for (const info of data.children.filter(i => i.name == com)) {
							for (const data of info.children.filter(i => i.name == "selection")) {
								if (data.attr.state_id == stuff && info.attr[param]) return info.attr[param]
							}
						}
						else for (const i of data.children.filter(i => i.name == com2)) {
							for (const info of i.children.filter(i => i.name == com)) {
								for (const data of info.children.filter(i => i.name == "selection")) {
									if (data.attr.state_id == stuff && info.attr[param]) return info.attr[param]
								}
							}
						}
					}
					for (const info of data.children.filter(i => i.name == 'facial')) {
						for (const data of info.children.filter(i => i.name == 'selection')) {
							if (
								!fatials[file.id].find(i => i.id == info.attr.id) 
								&& searchStuff(file.themeId, data) 
							) fatials[file.id].unshift(info.attr);
						}
					}
					xmlString += `<char id="${file.id}" thumb="${file.id}.zip" name="${
						file.title || ""
					}" cc_theme_id="${file.themeId}" default="stand.xml" motion="walk.xml" editable="Y" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0"><tags>${
						file.tags || ""
					}</tags>${fatials[file.id].map(v => `<facial id="${v.id}.xml" name="${v.name}" enable="${
						v.enable
					}"/>`).join("")}${defaults[file.themeId]}</char>`;
				}
				xmlString += `</theme>`;
			}
			async function getOldChars() {
				const isZip = data.v == "2010" ? ".zip" : ".xml"
				xmlString = `${header}<theme id="ugc" moreChar="${asset.checkcode(data.count || '', data.page || '', data.userId, 'char', 0, tId)}">`;
				console.log(xmlString);
				for (const file of files) {
					fatials[file.id] = fatials[file.id] || [];
					action_cat[file.id] = action_cat[file.id] || {};
					actionPack[file.id] = actionPack[file.id] || {};
					actions[file.id] = actions[file.id] || [];
					defaultActions[file.id] = defaultActions[file.id] || {};
					const data = new xmldoc.XmlDocument(fs.readFileSync(`./static/2010/store/cc_store/${
						file.themeId
					}/cc_theme.xml`));
					function get(stuff, param, com, com2) {
						if (!com2) for (const info of data.children.filter(i => i.name == com)) {
							for (const data of info.children.filter(i => i.name == "selection")) {
								if (data.attr.state_id == stuff && info.attr[param]) return info.attr[param]
							}
						}
						else for (const i of data.children.filter(i => i.name == com2)) {
							for (const info of i.children.filter(i => i.name == com)) {
								for (const data of info.children.filter(i => i.name == "selection")) {
									if (data.attr.state_id == stuff && info.attr[param]) return info.attr[param]
								}
							}
						}
					}
					if (isZip == ".xml") for (const info of data.children.filter(i => i.name == 'facial')) {
						fatials[file.id].unshift(info.attr);
					}
					else for (var a = 0; a < 4; a++) {
						const i = fs.readdirSync(`./static/2010/store/cc_store/${file.themeId}/emotions`)[a];
						if (i.startsWith("head_")) fatials[file.id].unshift({
							id: i.split(".json")[0],
							name: i.split("head_")[1].split(".json")[0],
							enable: get(i.split(".json")[0], "enable", "facial") || "Y"
						})
					}
					if (isZip == ".xml") for (const i of data.children.filter(i => i.name == 'bodyshape')) {
						if (i.attr.id == await char.getCharType(file.id)) {
							defaultActions[file.id].default = i.attr.default_action;
							defaultActions[file.id].motion = i.attr.default_motion;
							function actionsInsert(i) {
								for (const info of i.children.filter(i => i.name == 'action')) {
									const inf = info.attr;
									const data = info.children.filter(i => i.name == "selection");
									inf.facial = data[0].attr.facial_id;
									actions[file.id] = actions[file.id] || [];
									if (inf.category) {
										if (!action_cat[file.id][inf.category]) action_cat[file.id][
											inf.category
										] = {
											array: [],
											xml: `<category name="${inf.category}">`
										};
										action_cat[file.id][inf.category].array.unshift(inf);
									} else actions[file.id].unshift(inf);
								}
							}
							switch (file.themeId) {
								case "cctoonadventure":
								case "family": {
									actionsInsert(i);
									break;
								} default: {
									for (const d of i.children.filter(i => i.name == 'actionpack')) actionsInsert(d);
								}
							}
						}
					}
					else fs.readdirSync(`./static/2010/store/cc_store/${file.themeId}/emotions`).forEach(i => {
						defaultActions[file.id].default = "stand"
						defaultActions[file.id].motion = "walk"
						if (!i.startsWith("head_")) actions[file.id].unshift({
							id: i.split(".json")[0],
							name: i.split(".json")[0],
							loop: get(i.split(".json")[0], "loop", "action", "bodyshape") || "Y",
							totalframe: get(i.split(".json")[0], "totalframe", "action", "bodyshape") || "1",
							enable: get(i.split(".json")[0], "enable", "action", "bodyshape") || "Y",
							is_motion: get(i.split(".json")[0], "is_motion", "action", "bodyshape") || "N"
						})
					});
					if (isZip == ".xml") for (const i in action_cat[file.id]) {
						action_cat[file.id][i].xml += action_cat[file.id][i].array.map(v => `<${
							v.is_motion == "Y" ? "motion" : "action"
						} id="${v.id + isZip}" name="${
							v.name
						}" loop="${v.loop}" totalframe="${
							v.totalframe
						}" enable="${v.enable}" is_motion="${
							v.is_motion
						}"/>`).join("");
					}
					xmlString += `<char id="${file.id}" thumb="${file.id}.zip" name="${
						file.title || ""
					}" cc_theme_id="${file.themeId}" default="${
						defaultActions[file.id].default + isZip
					}" motion="${
						defaultActions[file.id].motion + isZip
					}" editable="Y" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0"><tags>${
						file.tags || ""
					}</tags>${Object.keys(action_cat[file.id]).map(i => action_cat[file.id][i].xml + '</category>')}${
						actions[file.id].map(v => `<${
							v.is_motion == "Y" ? "motion" : "action"
						} id="${v.id + isZip}" name="${v.name}" loop="${v.loop}" totalframe="${
							v.totalframe
						}" enable="${v.enable}" is_motion="${
							v.is_motion
						}"/>`).join("")
					}${fatials[file.id].map(v => `<facial id="${v.id + isZip}" name="${v.name}" enable="${
						v.enable
					}"/>`).join("")}</char>`;
				}
				xmlString += `</theme>`;
			}
			if (parseInt(data.v) >= 2010 && parseInt(data.v) < 2013) await getOldChars();
			else if (data.file == "old_full_2013.swf") await getOldChars();
			break;
		} default: {
			files = asset.list(
				data.count || '', data.page || '', id, data.exclude_ids ? data.exclude_ids.split(",") : '', data.userId, data.type
			);
			break;
		}
	}
	function stuff() {
		const checkcode = asset.checkcode(data.count || '', data.page || '', data.userId, data.type);
		switch (data.type) {
			case "bg": return ` moreBG="${checkcode}"`
			default: {
				const letter = data.type.substr(0, 1);
				return ` more${letter.toUpperCase()}${data.type.substr(1)}="${checkcode}"`
			}
		}
	}
	function stuff2() {
		const checkcode = asset.checkcode(data.count || '', data.page || '', data.userId, data.type);
		switch (data.type) {
			case "movie": return ` moreMovie="${checkcode}"`
			case "bg": return ` moreBg="${checkcode}"`
			default: return ` more="${checkcode}"`
		}
	}
	if (!xmlString) xmlString = `${header}<theme id="ugc"${
		parseInt(data.v) <= 2015 ? stuff() : stuff2()
	}>${files.map(asset.meta2Xml).join("")}</theme>`;
	console.log(stuff());
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
					const buffer = await char.loadThumb(file.id);
					fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, buffer);
					break;
				} case "movie": {
					const buffer = fs.readFileSync(fUtil.getFileIndex('starter-', '.png', file.id.substr(2)));
					fUtil.addToZip(zip, `${file.id}.png`, buffer);
					break;
				}
			}
		}
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
			loadPost(req, res).then(async data => {
				if (data.movieId && data.movieId.startsWith("ft-") && data.type == "sound") res.end(1 + '<error><code>Because you are using a video that has been imported from FlashThemes, you cannot use your sounds in this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</code></error>');
				else {
					const buff = await listAssets(data, makeZip);
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type);
					if (makeZip) {
						if (!data.v) res.write(base);
						else return res.end(Buffer.concat([base2, buff]));
					}
					res.end(buff);
				}
			});
			return true;
		}
		default:
			return;
	}
};