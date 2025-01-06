const cachéFolder = process.env.CACHÉ_FOLDER;
const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fUtil = require("../misc/file");
const get = require("../misc/get");
const fw = process.env.FILE_WIDTH;
const fs = require("fs");
const http = require("http");
const {jsonToXml, xmlToJson} = require("../movie/xmlConverter");
const xmldoc = require("xmldoc");
const https = require("https");
const nodezip = require("node-zip");
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
	async getCCThemeParts(charComponents, isLegacy = false) {
		let file = 'cc_theme';
		if (isLegacy) file += '_old';
		const info = charComponents.find(i => i._attributes.type == "bodyshape");
		const result = await xmlToJson(fs.readFileSync(`./frontend/static/store/cc_store/${info._attributes.theme_id}/${file}.xml`));
		return {
			info,
			data: result.cc_theme
		};
	},
	async getBodyshapeParts(charComponents, isLegacy = false) {
		const stuff = await this.getCCThemeParts(charComponents, isLegacy)
		return stuff.data.bodyshape.find(i => i._attributes.id == stuff.info._attributes.component_id);
	},
	prepxml(result) {
		for (const component of result.cc_char.component) {
			switch (component._attributes.type) {
				case "bodyshape": {
					component._attributes.file = "thumbnail.swf";
					break;
				} default: {
					if (fs.existsSync(`./frontend/static/store/cc_store/${component._attributes.theme_id}/${component._attributes.type}/${
						component._attributes.component_id
					}/default.swf`)) component._attributes.file = "default.swf";
					break;
				}
			}
			if (component._attributes.file) component._attributes.path = component._attributes.component_id
		}
		return result;
	},
	async finalxml(result, action, array, isLegacy = false) {
		const $this = this;
		async function c(a, b) {
			const info = a.find(i => i._attributes.id == b);
			for (const json of info.selection) {
				if (json._attributes.type == "facial") {
					const facials = (await $this.getCCThemeParts(result.cc_char.component, isLegacy)).data.facial;
					await c(facials, json._attributes.facial_id)
				} else {
					const components = result.cc_char.component.filter(i => i._attributes.type == json._attributes.type);
					for (const component of components) {
						component._attributes.file = json._attributes.state_id + '.swf';
						if (!component._attributes.path) component._attributes.path = component._attributes.component_id
					}
				}
			}
		}
		await c(array, action);
		return result;
	},
	async genActionXml(result, action, isLegacy = false) {
		return jsonToXml(
			await this.finalxml(
				this.prepxml(result), action, (await this.getBodyshapeParts(result.cc_char.component, isLegacy)).action, isLegacy
			)
		);
	},
	async genFacialXml(result, facial, tagStart) {
		if (tagStart && typeof tagStart == "string") result = this.prepxml(result);
		result = await this.finalxml(result, facial, (
			await this.getCCThemeParts(result.cc_char.component, typeof tagStart == "boolean" && tagStart)
		).data.facial);
		return tagStart && typeof tagStart == "string" ? `<${tagStart}>
			${jsonToXml(result.cc_char)}
		</${tagStart}>` : jsonToXml(result);
	},
	async genZip4ActionAndFacials(result, actions = [], isLegacy = false) {
		const zip = nodezip.create();
		fUtil.addToZip(zip, `desc.xml`, jsonToXml(result));
		for (const j of actions) {
			const xml = await this[j.function](result, j.action, isLegacy);
			const json = await xmlToJson(xml);
			for (const info of json.cc_char.component) {
				const i = info._attributes;
				if (i.path && i.file) {
					const filename = `${i.theme_id}.${i.type}.${i.path}`;
					fUtil.addToZip(zip, filename + '.swf', fs.readFileSync(`./frontend/static/store/cc_store/${
						filename.split(".").join("/") + `/${i.file}`
					}`));
				}
			}
		}
		return await zip.zip();
	},
	async packZip(data) {
		try {
			const buf = await this.load(data.assetId);
			const zip = nodezip.create();
			const result = await xmlToJson(buf);
			if (data.action) return await this.genZip4ActionAndFacials(result, [
				{
					function: 'genActionXml',
					action: data.action
				}
			]);
			if (data.emotion) return await this.genZip4ActionAndFacials(result, [
				{
					function: 'genFacialXml',
					action: data.emotion
				}
			])
			if (data.emotionsFile) {
				if (data.studio == "2010") data.emotionsFile += 2010;
				const themeid = this.getThemeViaXml2jsOutout(result);
				const emotions = (await xmlToJson(`<emotions>${
					fs.readFileSync(`./_PREMADE/emotions/${themeid}/${data.emotionsFile}.xml`)
				}</emotions>`)).emotions;
				const actions = ["action","motion"];
				async function packActions(a, $this) {
					for (const action of a) fUtil.addToZip(zip, `char/${data.assetId}/${
						action._attributes.id
					}`, Buffer.from(await $this.genZip4ActionAndFacials(result, [
						{
							function: 'genActionXml',
							action: action._attributes.id.split(".")[0]
						}
					])));
				}
				function prepActionpack(l, $this) {
					for (const f of actions) {
						if (!l[f]) continue;
						packActions(l[f], $this);
					}
				}
				for (const catInfo of emotions.category) prepActionpack(catInfo, this);
				prepActionpack(emotions, this);
				for (const facial of emotions.facial) fUtil.addToZip(zip, `char/${data.assetId}/head/${
					facial._attributes.id
				}`, Buffer.from(await this.genZip4ActionAndFacials(result, [
					{
						function: 'genFacialXml',
						action: facial._attributes.id.split(".")[0]
					}
				])));
			} else {
				const actions = (await this.getBodyshapeParts(result.cc_char.component, data.studio == "2010")).action;
				for (var num = 0; num < actions.length; num++) fUtil.addToZip(zip, `char/${data.assetId}/${
					actions[num]._attributes.id
				}.zip`, Buffer.from(await this.genZip4ActionAndFacials(result, [
					{
						function: 'genActionXml',
						action: actions[num]._attributes.id
					}
				], data.studio == "2010")));
				const facials = (await this.getCCThemeParts(result.cc_char.component, data.studio == "2010")).data.facial;
				for (a = 0; a < facials.length; a++) fUtil.addToZip(zip, `char/${data.assetId}/head/${
					facials[a]._attributes.id
				}.zip`, Buffer.from(await this.genZip4ActionAndFacials(result, [
					{
						function: 'genFacialXml',
						action: facials[a]._attributes.id
					}
				], data.studio == "2010")));
			}
			return await zip.zip();
		} catch (e) {
			console.warn(e, '\nLoading your character from the Community Library instead.');
			try {
				const zip = nodezip.create();
				fs.readdirSync(`./_PREMADE/comm_chars/${data.assetId}`).forEach(i => {
					fUtil.addToZip(zip, `char/${data.assetId}/${i}`, fs.readFileSync(`./_PREMADE/comm_chars/${data.assetId}/${i}`));
				});
				return await zip.zip();
			} catch (e) {
				console.error('Character Load Failed due to this', e)
			}
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
		return this.getThemeVisXmldocOutput(json);
	},
	getThemeVisXmldocOutput(json) {
		return json.children.filter(i => i.name == "component").find(i => i.attr.type == "bodyshape").attr.theme_id;
	},
	getThemeViaXml2jsOutout(json) {
		return json.cc_char.component.find(i => i._attributes.type == "bodyshape")._attributes.theme_id;
	},
	async getCharType(id) {
		return this.getCharTypeViaBuff(await this.load(id))
	},
	getCharTypeViaBuff(buff) {
		return this.getCharTypeViaXmldocOutput(new xmldoc.XmlDocument(buff));
	},
	getCharTypeViaXmldocOutput(json) {
		return json.children.filter(i => i.name == "component").find(i => i.attr.type == "bodyshape").attr.component_id;
	},
	getCharTypeViaXml2jsOutput(result) {
		return result.cc_char.component.find(i => i._attributes.type == "bodyshape")._attributes.component_id;
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
					case "C": {
						fs.writeFile(getCharPath(id), data, (e) => (e ? rej(e) : res(id)));
						break;
					} default: res(save(id, data));
				}
			} else res(save(`c-${fUtil.getNextFileId("char-", ".xml")}`, data));
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
