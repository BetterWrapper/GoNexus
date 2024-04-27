const cachéFolder = process.env.CACHÉ_FOLDER;
const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fUtil = require("../misc/file");
const get = require("../misc/get");
const fw = process.env.FILE_WIDTH;
const fs = require("fs");
const http = require("http");
const xmldoc = require("xmldoc");
const https = require("https");
const nodezip = require("node-zip");
function getCharActionsJson(v) { // loads char actions from the cc theme xml using char bs
	const actions = {
		default: {
			upper_body: v.action,
			lower_body: v.action,
			skeleton: v.action == "default" ? "stand" : v.action
		}
	}
	const ccTheme = fs.readFileSync(`./static/2010/store/cc_store/${v.theme_id}/cc_theme.xml`);
	const result = new xmldoc.XmlDocument(ccTheme);
	const shapes = result.children.filter(i => i.name == "bodyshape");
	const char = shapes.find(i => i.attr.id == v.bs);
	switch (v.theme_id) {
		case "cctoonadventure":
		case "family": {
			for (const charActions of char.children.filter(i => i.name == "action")) {
				actions[charActions.attr.id] = {};
				for (const act of charActions.children.filter(i => i.name == "selection")) {
					if (!act.attr.facial_id) actions[charActions.attr.id][act.attr.type] = act.attr.state_id;
				}
			}
			break;
		} default: {
			for (const packs of char.children.filter(i => i.name == "actionpack")) {
				for (const charActions of packs.children.filter(i => i.name == "action")) {
					actions[charActions.attr.id] = {
						freeaction: charActions.attr.id
					}
				}
			}
		}
	}
	return actions;
}
function getCharEmotionsJson(v) {
	const emotions = {
		default: {
			eye: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			eyebrow: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action,
			mouth: v.action.startsWith("head_") ? v.action.split("head_")[1] : v.action
		}
	}
	const ccTheme = fs.readFileSync(`./static/2010/store/cc_store/${v.theme_id}/cc_theme.xml`);
	const result = new xmldoc.XmlDocument(ccTheme);
	for (const facial of result.children.filter(i => i.name == "facial")) {
		emotions[facial.attr.id] = {};
		for (const stuff of facial.children.filter(i => i.name == "selection")) {
			if (stuff.attr.state_id != "default") emotions[facial.attr.id][stuff.attr.type] = stuff.attr.state_id;
		}
	}
	return emotions;
}
function save(id, data) {
	const i = id.indexOf("-");
	const prefix = id.substr(0, i);
	const suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", suffix), data);
			break;
		case "C":
	}
	return id;
}
/**
 * @param {string} id
 * @returns {string}
 */
function getCharPath(id) {
	var i = id.indexOf("-");
	var prefix = id.substr(0, i);
	var suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			return fUtil.getFileIndex("char-", ".xml", suffix);
		case "C":
		default:
			return `${cachéFolder}/char.${id}.xml`;
	}
}
/**
 * @param {string} id
 * @returns {string}
 */
function getThumbPath(id) {
	var i = id.indexOf("-");
	var prefix = id.substr(0, i);
	var suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			return fUtil.getFileIndex("char-", ".png", suffix);
		case "C":
		default:
			return `${cachéFolder}/char.${id}.png`;
	}
}
function getHeadPath(id) {
	var i = id.indexOf("-");
	var prefix = id.substr(0, i);
	var suffix = id.substr(i + 1);
	switch (prefix) {
		case "c":
			return fUtil.getFileIndex("head-", ".png", suffix);
		case "C":
		default:
			return `${cachéFolder}/head.${id}.png`;
	}
}

module.exports = {
	meta2libraryXml(w) {
		return `<library type="${w.type}" file="${w.component_id}.swf" path="${
			w.component_id
		}" component_id="${w.component_id}" theme_id="${w.theme_id}"/>`
	},
	getJoseph() {
		return new Promise((res, rej) => {
			https.get('https://wrapperclassic.netlify.app/chars/4048901.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getDaniel() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004797.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getDavidEscobar() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004414.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getRage() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/6667041.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getBluePeacocks() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004418.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getTutGirl() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000001.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getOwen() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0000000.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getJyvee() {
		return new Promise((res, rej) => {
			https.get('https://file.garden/ZP0Nfnn29AiCnZv5/0004416.xml', r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
			});
		});
	},
	getCharEmotionsJson(v) { // loads char emotions from the cc theme xml (not all emotions work).
		return getCharEmotionsJson(v);
	},
	getJyveeEmotions(tId) { // Jyvee we are finally loading your emotions into Nexus :)
		const emotions = {};
		fs.readdirSync(`./static/2010/store/cc_store/${tId}/emotions`).filter(i => i.startsWith("head_")).forEach(feeling => {
			emotions[feeling.split(".json")[0]] = JSON.parse(fs.readFileSync(`./static/2010/store/cc_store/${tId}/emotions/${
				feeling
			}`));
		});
		return emotions;
	},
	getJyveeActions(tId) { // Jyvee we are finally loading your actions into Nexus :)
		const actions = {};
		fs.readdirSync(`./static/2010/store/cc_store/${tId}/emotions`).filter(i => !i.startsWith("head_")).forEach(act => {
			actions[act.split(".json")[0]] = JSON.parse(fs.readFileSync(`./static/2010/store/cc_store/${tId}/emotions/${act}`));
		});
		return actions;
	},
	meta2componentXml(v) {
		const stuff = getCharEmotionsJson(v);
		let xml;
		let ty = v.type;
		const action2 = stuff[v.action] && stuff[v.action][v.type] ? stuff[v.action][
			v.type
		] : stuff.head_neutral[v.type];
		const action = fs.existsSync(`./static/2010/store/cc_store/${v.theme_id}/${v.type}/${v.component_id}/${
			action2
		}.swf`) ? action2 : "default";
		if (ty == "eye" || ty == "eyebrow" || ty == "mouth") {
			let animetype = v.theme_id == "anime" ? "side_" + action : action;
			xml = `<component type="${v.type}" theme_id="${
				v.theme_id
			}" file="${animetype}.swf" path="${v.component_id}" x="${v.x}" y="${v.y}" xscale="${
				v.xscale
			}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" ${v.split ? `split="N"` : ``}/>`;
		} else if (v.id) xml = `<component id="${v.id}" type="${v.type}" theme_id="${v.theme_id}" path="${v.component_id}" x="${v.x}" y="${
			v.y
		}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
		else if (
			v.type != "skeleton" 
			&& v.type != "bodyshape" 
			&& v.type != "freeaction"
		) xml = `<component type="${v.type}" theme_id="${
			v.theme_id
		}" path="${v.component_id}" x="${
			v.x
		}" y="${v.y}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
		else xml = `<component type="${v.type}" theme_id="${v.theme_id}" ${
			v.type == "skeleton" ? `file="${
				action
			}.swf"` : v.type == "freeaction" && v.theme_id == "cc2" ? `file="${
				action
			}.swf"` : `file="thumbnail.swf"`
		} path="${v.component_id}" x="${v.x}" y="${
			v.y
		}" xscale="${v.xscale}" yscale="${v.yscale}" offset="${v.offset}" rotation="${v.rotation}" />`;
		return xml;
	},
	getCharActionsJson(v) {
		return getCharActionsJson(v);
	},
	meta2componentXml2(v) {
		const stuff = getCharActionsJson(v);
		const action = stuff[v.action] && stuff[v.action][v.type] ? stuff[v.action][v.type] : stuff.default[
			v.type
		] ? stuff.default[v.type] : v.type == "bodyshape" ? 'thumbnail' : "default";
		return `<component type="${v.type}" theme_id="${v.theme_id}" file="${action}.swf" path="${
			v.component_id
		}" component_id="${v.component_id}" x="${v.x}" y="${v.y}" xscale="${v.xscale}" yscale="${
			v.yscale
		}" offset="${v.offset}" rotation="${v.rotation}" />`;
	},
	meta2colourXml(v) {
		let xml;
		if (v.oc === undefined && !v.targetComponent) xml = `<color r="${v.r}">${v.text}</color>`;
		else if (v.targetComponent === undefined) xml = `<color r="${v.r}" oc="${v.oc}">${v.text}</color>`;	
		else xml = `<color r="${v.r}" targetComponent="${v.targetComponent}">${v.text}</color>`;	
		return xml;
	},
	async zipAction(bs, act, result, actions) {
		const components = result.children.filter(i => i.name == "component");
		const action = actions[act];
		const libArray = [];
		const mappedColors = [];
		const mappedComponent = [];
		const componentswithactions = {};
		const actionzip = nodezip.create();
		for (const info of result.children) {
			switch (info.name) {
				case "library": {
					libArray.unshift(info.attr);
					break;
				} case "component": {
					const inf = info.attr;
					inf.action = act;
					inf.bs = bs;
					mappedComponent.unshift(inf);
					break;
				} case "color": {
					const inf = info.attr;
					inf.text = info.val;
					mappedColors.unshift(inf);
					break;
				}
			}
		}
		fUtil.addToZip(actionzip, `desc.xml`, `<cc_char ${
			result.attr ? `xscale='${result.attr.xscale}' yscale='${
				result.attr.yscale
			}' hxscale='${result.attr.hxscale}' hyscale='${
				result.attr.hyscale
			}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
		}>${mappedComponent.map(this.meta2componentXml2).join("")}${
			mappedColors.map(this.meta2colourXml).join("")
		}${libArray.map(this.meta2libraryXml).join("")}</cc_char>`);
		for (const i in action) {
			const component = components.find(d => d.attr.type == i);
			if (component) {
				fUtil.addToZip(actionzip, `${component.attr.theme_id}.${
					component.attr.type
				}.${
					component.attr.component_id
				}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${component.attr.theme_id}/${
					component.attr.type
				}/${
					component.attr.component_id
				}/${action[component.attr.type]}.swf`));
				componentswithactions[component.attr.type] = true;
			}
		}
		for (const component of components) {
			switch (component.attr.type) {
				case "bodyshape": {
					fUtil.addToZip(actionzip, `${component.attr.theme_id}.${
						component.attr.type
					}.${
						component.attr.component_id
					}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${
						component.attr.theme_id
					}/${component.attr.type}/${
						component.attr.component_id
					}/thumbnail.swf`))
					break;
				} default: {
					if (!componentswithactions[component.attr.type]) fUtil.addToZip(
						actionzip, `${component.attr.theme_id}.${component.attr.type}.${
							component.attr.component_id
						}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${
							component.attr.theme_id
						}/${
							component.attr.type
						}/${component.attr.component_id}/${
							component.attr.type == "skeleton" ? "stand" : "default"
						}.swf`)
					);
					break;
				}
			}
		}
		return await actionzip.zip();
	},
	async zipEmotion(bs, feeling, result, facials) {
		const components = result.children.filter(i => i.name == "component");
		const libArray = []
		const mappedColors = [];
		const mappedComponent = [];
		const componentswithactions = {};
		const facialzip = nodezip.create();
		for (const info of result.children) {
			switch (info.name) {
				case "library": {
					libArray.unshift(info.attr);
					break;
				} case "component": {
					const inf = info.attr;
					inf.action = feeling;
					inf.bs = bs
					mappedComponent.unshift(inf);
					break;
				} case "color": {
					const inf = info.attr;
					inf.text = info.val;
					mappedColors.unshift(inf);
					break;
				}
			}
		}
		fUtil.addToZip(facialzip, `desc.xml`, `<cc_char ${
			result.attr ? `xscale='${result.attr.xscale}' yscale='${
				result.attr.yscale
			}' hxscale='${result.attr.hxscale}' hyscale='${
				result.attr.hyscale
			}' headdx='${result.attr.headdx}' headdy='${result.attr.headdy}'` : ``
		}>${mappedComponent.map(this.meta2componentXml2).join("")}${
			mappedColors.map(this.meta2colourXml).join("")
		}${libArray.map(this.meta2libraryXml).join("")}</cc_char>`);
		for (const i in facials[feeling]) {
			const component = components.find(d => d.attr.type == i);
			if (component) {
				fUtil.addToZip(facialzip, `${component.attr.theme_id}.${
					component.attr.type
				}.${
					component.attr.component_id
				}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${component.attr.theme_id}/${
					component.attr.type
				}/${
					component.attr.component_id
				}/${facials[feeling][component.attr.type]}.swf`));
				componentswithactions[component.attr.type] = true;
			}
		}
		for (const component of components) {
			switch (component.attr.type) {
				case "lower_body":
				case "upper_body":
				case "skeleton": break;
				case "bodyshape": {
					fUtil.addToZip(facialzip, `${component.attr.theme_id}.${
						component.attr.type
					}.${
						component.attr.component_id
					}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${
						component.attr.theme_id
					}/${component.attr.type}/${
						component.attr.component_id
					}/thumbnail.swf`))
					break;
				} default: {
					if (!componentswithactions[component.attr.type]) fUtil.addToZip(
						facialzip, `${component.attr.theme_id}.${component.attr.type}.${
							component.attr.component_id
						}.swf`, fs.readFileSync(`./static/2010/store/cc_store/${
							component.attr.theme_id
						}/${
							component.attr.type
						}/${component.attr.component_id}/default.swf`)
					);
					break;
				}
			}
		}
		return await facialzip.zip();
	},
	async packZip(data) {
		try {
			const buf = await this.load(data.assetId);
			const zip = nodezip.create();
			const result = new xmldoc.XmlDocument(buf);
			const themeid = this.getTheme(buf);
			const actions = this.getJyveeActions(themeid);
			const actionproperties = Object.keys(actions);
			if (data.action) return await this.zipAction(this.getCharTypeViaBuff(buf), data.action, result, actions);
			for (var num = 0; num < actionproperties.length; num++) fUtil.addToZip(zip, `char/${data.assetId}/${
				actionproperties[num]
			}.zip`, Buffer.from(await this.zipAction(this.getCharTypeViaBuff(buf), actionproperties[num], result, actions)));
			const facials = this.getJyveeEmotions(themeid)
			const testfacials = Object.keys(facials);
			if (data.emotion) return await this.zipEmotion(this.getCharTypeViaBuff(buf), data.emotion, result, facials)
			for (a = 0; a < 3; a++) fUtil.addToZip(zip, `char/${data.assetId}/head/${
				testfacials[a]
			}.zip`, Buffer.from(await this.zipEmotion(this.getCharTypeViaBuff(buf), testfacials[a], result, facials)));
			return await zip.zip();
		} catch (e) {
			const zip = nodezip.create();
			fs.readdirSync(`./_PREMADE/comm_chars/${data.assetId}`).forEach(i => {
				fUtil.addToZip(zip, `char/${data.assetId}/${i}`, fs.readFileSync(`./_PREMADE/comm_chars/${data.assetId}/${i}`));
			});
			return await zip.zip();
		}
	},
	async getThemeFromCharId(id) {
		return this.getTheme(await this.load(id))
	},
	/**
	 * @param {Buffer} buffer
	 * @returns {Buffer}
	 */
	getTheme(buff) {
		const json = new xmldoc.XmlDocument(buff);
		return json.children.filter(i => i.name == "component").find(i => i.attr.type == "bodyshape").attr.theme_id;
	},
	async getCharType(id) {
		return this.getCharTypeViaBuff(await this.load(id))
	},
	getCharTypeViaBuff(buff) {
		const json = new xmldoc.XmlDocument(buff);
		return json.children.filter(i => i.name == "component").find(i => i.attr.type == "bodyshape").attr.component_id;
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		return new Promise(async (res, rej) => {
			var i = id.indexOf("-");
			var prefix = id.substr(0, i);
			var suffix = id.substr(i + 1);

			switch (prefix) {
				case "c":
				case "C":
					fs.readFile(getCharPath(id), (e, b) => {
						if (e) {
							rej(`Error Loading Character: ${e}`);
						} else {
							res(b);
						}
					});
					break;

				case "":
				default: {
					try {
						res(fs.readFileSync(`./premadeChars/xml/${id}.xml`));
					} catch (e) {
						if (id == "4048901") res(await this.getJoseph());
						else if (id == "4715202") res(await this.getTutGirl());
						else if (id == "192") res(await this.getDavidEscobar());
						else if (id == "60897073") res(await this.getBluePeacocks());
						else if (id == "66670973") res(await this.getJyvee());
						else if (id == "4635901") res(await this.getOwen());
						else if (id == "0000000") res(await this.getRage());
						else if (id == "666") res(await this.getDaniel());
						else if (prefix) try {
							const b = fs.readFileSync(`./premadeChars/TXT/${suffix.slice(0, -3) + "000"}.TXT`);
							res(b.toString("utf8").split(suffix.substr(6))[1].split("</cc_char>")[0] + "</cc_char>")
						} catch (e) {
							get(`https://file.garden/ZP0Nfnn29AiCnZv5/${prefix}_chardump/${
								suffix.slice(0, -3) + "000"
							}.txt`).then(
								b => res(b.toString("utf8").split(suffix.substr(6))[1].split("</cc_char>")[0] + "</cc_char>")
							).catch(rej);
						} else {
							var nId = parseInt(suffix);
							var xmlSubId = nId % fw;
							var fileId = nId - xmlSubId;
							var lnNum = fUtil.padZero(xmlSubId, xNumWidth);
							var url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;
							get(url).then((b) => {
								const line = b.toString("utf8").split("\n").find((v) => v.substr(0, xNumWidth) == lnNum);
								if (line) res(Buffer.from(line.substr(xNumWidth)));
								else rej("Character does not exist");
							});
						}
					}
				}
			}
		});
	},
	/**
	 * @param {Buffer} data
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	save(data, id) {
		return new Promise((res, rej) => {
			if (id) {
				const i = id.indexOf("-");
				const prefix = id.substr(0, i);
				switch (prefix) {
					case "c":
					case "C":
						fs.writeFile(getCharPath(id), data, (e) => (e ? rej() : res(id)));
					default:
						res(save(id, data));
				}
			} else {
				saveId = `c-${fUtil.getNextFileId("char-", ".xml")}`;
				res(save(saveId, data));
			}
		});
	},
	/**
	 * @param {Buffer} data
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	saveThumb(data, id) {
		return new Promise((res, rej) => {
			var thumb = Buffer.from(data, "base64");
			fs.writeFileSync(getThumbPath(id), thumb);
			res(id);
		});
	},
	saveHead(data, id) {
		return new Promise((res, rej) => {
			var thumb = Buffer.from(data, "base64");
			fs.writeFileSync(getHeadPath(id), thumb);
			res(id);
		});
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	loadThumb(id) {
		return new Promise(res => {
			try {
				res(fs.readFileSync(getThumbPath(id)));
			} catch (e) {
				try {
					res(fs.readFileSync(`./premadeChars/thumb/${id}.png`));
				} catch (e) {
					res('');
				}
			}
		});
	},
	loadHead(id) {
		return new Promise(res => {
			try {
				res(fs.readFileSync(getHeadPath(id)));
			} catch (e) {
				try {
					res(fs.readFileSync(`./premadeChars/head/${id}.png`));
				} catch (e) {
					res('');
				}
			}
		});
	},
};
