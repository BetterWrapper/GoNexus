const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
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
	for (const folder2 of fs.readdirSync(`./charStore/${tId}/${data.attr.type}`)) {
		for (const i of fs.readdirSync(`./charStore/${tId}/${data.attr.type}/${folder2}`)) {
			return fs.existsSync(`./charStore/${tId}/${data.attr.type}/${folder2}/${data.attr.state_id}.swf`);
		}
	}
}
module.exports = {
	folder: './_ASSETS',
	load(aId, isStream = false) {
		return fs[isStream ? 'createReadStream' : 'readFileSync'](`${this.folder}/${aId}`);
	},
	update(data) {
		const meta = {
			title: true,
			tags: true
		};
		const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`));
		const userInfo = json.users.find(i => i.id == data.userId);
		const info = userInfo.assets.find(i => i.id == data.assetId);
		for (const stuff in data) {
			if (meta[stuff]) {
				info[stuff] = data[stuff];
			}
		}
		fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
	},
	delete(data, justFiles = false) {
		if (!justFiles) {
			const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`));
			const userInfo = json.users.find(i => i.id == data.userId);
			let info, index;
			if (data.id && data.id != "null") {
				info = userInfo.assets.find(i => i.enc_asset_id == data.id);
				index = userInfo.assets.findIndex(i => i.enc_asset_id == data.id);
			} else if (data.templateId && data.templateId != "null") {
				info = userInfo.assets.find(i => i.enc_asset_id == data.templateId);
				index = userInfo.assets.findIndex(i => i.enc_asset_id == data.templateId);
			} else if (data.assetId && data.assetId != "null") {
				info = userInfo.assets.find(i => i.id == data.assetId);
				index = userInfo.assets.findIndex(i => i.id == data.assetId);
			}
			if (info.id.startsWith("s-")) {
				const paths = [
					fUtil.getFileIndex("starter-", ".xml", info.id.substr(2)),
					fUtil.getFileIndex("starter-", ".png", info.id.substr(2))
				];
				for (const path of paths) if (fs.existsSync(path)) fs.unlinkSync(path);
			} else if (info.id.startsWith("c-")) {
				const paths = [
					fUtil.getFileIndex("char-", ".xml", info.id.substr(2)),
					fUtil.getFileIndex("char-", ".png", info.id.substr(2)),
					fUtil.getFileIndex("head-", ".png", info.id.substr(2))
				];
				for (const path of paths) if (fs.existsSync(path)) fs.unlinkSync(path);
			} else fs.unlinkSync(`${this.folder}/${info.id}`);
			userInfo.assets.splice(index, 1);
			fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
		} else {
			if (data.id.startsWith("s-")) {
				const paths = [
					fUtil.getFileIndex("starter-", ".xml", data.id.substr(2)),
					fUtil.getFileIndex("starter-", ".png", data.id.substr(2))
				];
				for (const path of paths) if (fs.existsSync(path)) fs.unlinkSync(path);
			} if (data.id.startsWith("c-")) {
				const paths = [
					fUtil.getFileIndex("char-", ".xml", data.id.substr(2)),
					fUtil.getFileIndex("char-", ".png", data.id.substr(2)),
					fUtil.getFileIndex("head-", ".png", data.id.substr(2))
				];
				for (const path of paths) if (fs.existsSync(path)) fs.unlinkSync(path);
			} else fs.unlinkSync(`${this.folder}/${data.id}`);
		}
	},
	generateId() {
		return ("" + Math.random()).replace(".", "");
	},
	save(buffer, meta, data) {
		meta.enc_asset_id = this.generateId();
		meta.id = meta.file = meta.enc_asset_id + '.' + meta.ext;
		fs.writeFileSync(`${this.folder}/${meta.id}`, buffer);
		if (data.isTemplate) return meta;
		else {
			const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`));
			json.users.find(i => i.id == data.userId).assets.unshift(meta);
			fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
			return meta.id;
		}
	},
	list(count, page, id2load, ids2exclude, uId, type, subtype, themeId) {
		const assetIds = {};
		const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`)).users.find(i => i.id == uId);
		let aList = json.assets.filter(i => i.type == type);
		if (subtype) aList = aList.filter(i => i.subtype == subtype);
		if (themeId) aList = aList.filter(i => i.themeId == themeId);
		const table = [];
		const e = `${count * page + count}`;
		console.log(count * page, parseInt(e.substr(1)), id2load)
		if (id2load) return aList.filter(i => i.id == id2load);
		else if (page && count) for (var i = count * page; i < parseInt(e.substr(1)); i++) {
			if (aList[i]) {
				assetIds[aList[i].id] = true;
				table.unshift(aList[i]);
			}
		}
		else for (const i of aList) {
			assetIds[i.id] = true;
			table.unshift(i);
		}
		for (const id of ids2exclude) {
			if (assetIds[id]) {
				const index = table.findIndex(i => i.id == id);
				table.splice(index, 1);
			}
		}
		return table;
	},
	checkcode(count, page, uId, type, subtype, themeId) {
		const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`)).users.find(i => i.id == uId);
		let aList = json.assets.filter(i => i.type == type);
		if (subtype) aList = aList.filter(i => i.subtype == subtype);
		if (themeId) aList = aList.filter(i => i.themeId == themeId);
		const e = `${count * page + count}`;
		return parseInt(e.substr(1)) >= aList.length ? '0' : '1';
	},
	meta2Xml(v) {
		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" name="${v.title || "Untitled"}" cc_theme_id="${v.themeId}" thumbnail_url="${
					v.thumb_url || `/char-default.png`
				}" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
				break;
			} case "bg": {
				xml = `<background subtype="0" id="${v.id}" name="${v.title}" enable="Y"/>`;
				break;
			} case "sound": {
				xml = `<sound subtype="${v.subtype}" id="${v.id}" name="${v.title}" enable="Y" duration="${
					v.duration
				}" downloadtype="progressive"><tags>${v.tags || ""}</tags></sound>`;
				break;
			}	
			case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="${v.id}.png" numScene="1" title="${
					v.title
				}" thumbnail_url="/movie_thumbs/${v.id}.png"><tags>${v.tags || ""}</tags></movie>`;
				break;
			}
			case "prop": {
				xml = `<prop subtype="0" id="${v.id}" name="${v.title}" enable="Y" ${
					v.ptype != "placeable" ? `${v.ptype}="1"` : ''
				} placeable="1" facing="left" width="0" height="0" asset_url="/goapi/getAsset/${v.id}"/>`;
				break;
			}
		}
		return xml;
	},
	async meta2OldXml(v) {
		const isZip = v.data.studio == "2010" ? ".zip" : ".xml"
		switch (v.type) {
			case "char": {
				const fatials = [];
				const actions = [];
				const actionPack = {};
				const action_cat = {};
				const defaultActions = {
					default: "stand",
					motion: "walk"
				};
				const data = new xmldoc.XmlDocument(fs.readFileSync(`./charStore/${
					v.themeId
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
					fatials.unshift(info.attr);
				}
				else for (var a = 0; a < 4; a++) {
					const i = fs.readdirSync(`./charStore/${v.themeId}/emotions`)[a];
					if (i.startsWith("head_")) fatials.unshift({
						id: i.split(".json")[0],
						name: i.split("head_")[1].split(".json")[0],
						enable: get(i.split(".json")[0], "enable", "facial") || "Y"
					})
				}
				if (isZip == ".xml") for (const i of data.children.filter(i => i.name == 'bodyshape')) {
					if (i.attr.id == await char.getCharType(v.id)) {
						defaultActions.default = i.attr.default_action;
						defaultActions.motion = i.attr.default_motion;
						switch (v.themeId) {
							case "cctoonadventure":
							case "family": {
								for (const info of i.children.filter(i => i.name == 'action')) {
									const inf = info.attr;
									const data = info.children.filter(i => i.name == "selection");
									inf.facial = data[0].attr.facial_id;
									if (inf.category) {
										if (!action_cat[inf.category]) action_cat[
											inf.category
										] = {
											array: [],
											xml: `<category name="${inf.category}">`
										};
										action_cat[inf.category].array.unshift(inf);
									} else actions.unshift(inf);
								}
								break;
							} default: {
								for (const info of i.children.filter(i => i.name == 'actionpack')) {
									const inf = info.attr;
									if (!actionPack[inf.id]) actionPack[
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
				else fs.readdirSync(`./charStore/${v.themeId}/emotions`).forEach(i => {
					if (!i.startsWith("head_")) actions.unshift({
						id: i.split(".json")[0],
						name: i.split(".json")[0],
						loop: get(i.split(".json")[0], "loop", "action", "bodyshape") || "Y",
						totalframe: get(i.split(".json")[0], "totalframe", "action", "bodyshape") || "1",
						enable: get(i.split(".json")[0], "enable", "action", "bodyshape") || "Y",
						is_motion: get(i.split(".json")[0], "is_motion", "action", "bodyshape") || "N"
					})
				});
				if (isZip == ".xml") for (const i in actionPack) {
					for (const info of actionPack[i].array) {
						const inf = info.attr;
						const data = info.children.filter(i => i.name == "selection");
						inf.facial = data[0].attr.facial_id;
						if (inf.category) {
							if (!action_cat[inf.category]) action_cat[
								inf.category
							] = {
								array: [],
								xml: `<category name="${inf.category}">`
							};
							action_cat[inf.category].array.unshift(inf);
						} else actionPack[i].xml += `<action id="${inf.id}" name="${
							inf.name
						}" loop="${inf.loop}" totalframe="${inf.totalframe}" enable="${
							inf.enable
						}" is_motion="${inf.is_motion}"/>`
					}
				}
				if (isZip == ".xml") for (const i in action_cat) {
					action_cat[i].xml += action_cat[i].array.map(v => `<${
						v.is_motion == "Y" ? "motion" : "action"
					} id="${v.id + isZip}" name="${
						v.name
					}" loop="${v.loop}" totalframe="${
						v.totalframe
					}" enable="${v.enable}" is_motion="${
						v.is_motion
					}"/>`).join("");
				}
				return `<char id="${v.id}" thumb="${v.id}.zip" name="${
					v.title || ""
				}" cc_theme_id="${v.themeId}" default="${
					defaultActions.default + isZip
				}" motion="${
					defaultActions.motion + isZip
				}" editable="Y" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0"><tags>${
					v.tags || ""
				}</tags>${(() => {
					switch (v.themeId) {
						case "cctoonadventure":
						case "family": return Object.keys(action_cat).map(i => {
							return action_cat[i].xml + '</category>'
						});
						default: return Object.keys(actionPack).map(d => {
							return Object.keys(action_cat).map(i => {
								return action_cat[i].xml + '</category>'
							}) + actionPack[d].xml + '</actionpack>';
						})
					}
				})()}${
					actions.map(v => `<${
						v.is_motion == "Y" ? "motion" : "action"
					} id="${v.id + isZip}" name="${v.name}" loop="${v.loop}" totalframe="${
						v.totalframe
					}" enable="${v.enable}" is_motion="${
						v.is_motion
					}"/>`).join("")
				}${fatials.map(v => `<facial id="${v.id + isZip}" name="${v.name}" enable="${
					v.enable
				}"/>`).join("")}</char>`;
			}
		}
	}
};
