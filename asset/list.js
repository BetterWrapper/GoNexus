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
		default: return tId;
	}
}
function searchStuff(tId, data) {
	for (const folder2 of fs.readdirSync(`./charStore/${tId}/${data.attr.type}`)) {
		for (const i of fs.readdirSync(`./charStore/${tId}/${data.attr.type}/${folder2}`)) {
			return fs.existsSync(`./charStore/${tId}/${data.attr.type}/${folder2}/${data.attr.state_id}.swf`);
		}
	}
}
async function listAssets(data, makeZip) {
	var files, xmlString;
	switch (data.type) {
		case "char": {
			const tId = data.cc_theme_id || getTid(data.themeId);
			const fatials = {};
			const actions = {};
			const actionPack = {};
			const action_cat = {};
			const defaultActions = {};
			files = asset.list(data.userId, "char", 0, tId);
			if (parseInt(data.studio) >= 2010 && parseInt(data.studio) < 2012) {
				const isZip = data.studio == "2010" ? ".zip" : ".xml"
				xmlString = `${header}<ugc id="ugc" name="ugc" more="0" moreChar="0">`;
				for (const file of files) {
					fatials[file.id] = fatials[file.id] || [];
					action_cat[file.id] = action_cat[file.id] || {};
					actionPack[file.id] = actionPack[file.id] || {};
					actions[file.id] = actions[file.id] || [];
					defaultActions[file.id] = defaultActions[file.id] || {};
					const data = new xmldoc.XmlDocument(fs.readFileSync(`./charStore/${
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
						const i = fs.readdirSync(`./charStore/${file.themeId}/emotions`)[a];
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
							switch (file.themeId) {
								case "cctoonadventure":
								case "family": {
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
									break;
								} default: {
									for (const info of i.children.filter(i => i.name == 'actionpack')) {
										const inf = info.attr;
										if (!actionPack[file.id][inf.id]) actionPack[file.id][
											inf.id
										] = {
											array: info.children.filter(i => i.name == 'action'),
											xml: `<actionpack id="${inf.id}" name="${
												inf.name
											}" money="${inf.money}" sharing="${inf.sharing}" enable="${
												inf.enable
											}">`
										};
									}
								}
							}
						}
					}
					else fs.readdirSync(`./charStore/${file.themeId}/emotions`).forEach(i => {
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
					if (isZip == ".xml") for (const i in actionPack[file.id]) {
						for (const info of actionPack[file.id][i].array) {
							const inf = info.attr;
							const data = info.children.filter(i => i.name == "selection");
							inf.facial = data[0].attr.facial_id;
							if (inf.category) {
								if (!action_cat[file.id][inf.category]) action_cat[file.id][
									inf.category
								] = {
									array: [],
									xml: `<category name="${inf.category}">`
								};
								action_cat[file.id][inf.category].array.unshift(inf);
							} else actionPack[file.id][i].xml += `<action id="${inf.id}" name="${
								inf.name
							}" loop="${inf.loop}" totalframe="${inf.totalframe}" enable="${
								inf.enable
							}" is_motion="${inf.is_motion}"/>`
						}
					}
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
					}</tags>${(() => {
						switch (file.themeId) {
							case "cctoonadventure":
							case "family": return Object.keys(action_cat[file.id]).map(i => {
								return action_cat[file.id][i].xml + '</category>'
							});
							default: return Object.keys(actionPack[file.id]).map(d => {
								return Object.keys(action_cat[file.id]).map(i => {
									return action_cat[file.id][i].xml + '</category>'
								}) + actionPack[file.id][d].xml + '</actionpack>';
							})
						}
					})()}${
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
				xmlString += `</ugc>`;
				console.log(xmlString);
			} else if (data.studio == "2012") {
				const defaults = {
					family: `<action id="stand.xml" name="Stand" loop="Y" totalframe="1" enable="Y" is_motion="N"/>`,
					cc2: `<action id="stand.xml" name="Standing" loop="Y" totalframe="1" enable="Y" is_motion="N"/>`
				}
				xmlString = `${header}<ugc id="ugc" name="ugc" more="0" moreChar="0">`;
				for (const file of files) {
					fatials[file.id] = fatials[file.id] || [];
					const data = new xmldoc.XmlDocument(fs.readFileSync(`./charStore/${
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
				xmlString += `</ugc>`;
			}
			break;
		} default: {
			files = asset.list(data.userId, data.type);
			break;
		}
	}
	if (!xmlString) xmlString = `${header}<ugc more="0"${
		parseInt(data.studio) <= 2012 ? (function() {
			switch (data.type) {
				case "bg": return ' moreBG="0"'
				default: {
					const letter = data.type.slice(0, data.type.length - 1);
					return ` more${letter.toUpperCase()}${data.type.split(letter)[1]}="0"`
				}
			}
		})() : ''
	}>${files.map(asset.meta2Xml).join("")}</ugc>`;
	if (makeZip) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));
		for (const file of files) {
			switch (file.type) {
				case "bg": {
					const buffer = asset.load(file.id);
					fUtil.addToZip(zip, `bg/${file.id}`, buffer);
					break;
				} case "char": {
					const buffer = await char.loadThumb(file.id);
					fUtil.addToZip(zip, `char/${file.id}/${file.id}.png`, buffer);
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
						if (!data.studio) res.write(base);
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