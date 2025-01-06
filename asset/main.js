const fUtil = require("../misc/file");
const char = require("../character/main");
const tempbuffer = require("../tts/tempBuffer");
const fs = require('fs');
const xml2js = require("xml2js")

module.exports = {
	folder: './_ASSETS',
	tempFolder: './_CACHÉ',
	load(aId, isStream = false) {
		return fs[isStream ? 'createReadStream' : 'readFileSync'](aId.startsWith('asset-') ? `./_SAVED/${aId}` : `${this.folder}/${aId}`);
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
			deleteFiles(info)
			userInfo.assets.splice(index, 1);
			fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
		} else deleteFiles();
		function deleteFiles(info = data) {
			if (info.id.startsWith("s-")) for (const path of [
				fUtil.getFileIndex("starter-", ".xml", info.id.substr(2)),
				fUtil.getFileIndex("starter-", ".png", info.id.substr(2))
			]) if (fs.existsSync(path)) fs.unlinkSync(path);
			else if (info.id.startsWith("c-")) for (const path of [
				fUtil.getFileIndex("char-", ".xml", info.id.substr(2)),
				fUtil.getFileIndex("char-", ".png", info.id.substr(2)),
				fUtil.getFileIndex("head-", ".png", info.id.substr(2))
			]) if (fs.existsSync(path)) fs.unlinkSync(path);
			else for (const path of [
				`${this.folder}/${info.id}`,
				`${this.folder}/${info.id}.txt`
			]) if (fs.existsSync(path)) fs.unlinkSync(path);
		}
	},
	generateId() {
		return ("" + Math.random()).replace(".", "");
	},
	save(buffer, meta, data) {
		meta.enc_asset_id = this.generateId();
		meta.id = meta.file = meta.enc_asset_id + '.' + meta.ext;
		if (data.isTemplate) {
			tempbuffer.set(meta.id, buffer);
			return meta;
		} else {
			fs.writeFileSync(`${this.folder}/${meta.id}`, buffer);
			const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`));
			json.users.find(i => i.id == data.userId).assets.unshift(meta);
			fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
			return meta.id;
		}
	},
	list(data, filters) {
		const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`)).users.find(i => i.id == data.userId);
		let aList = json.assets;
		if (filters) for (const i in filters) aList = aList.filter(d => d[i] == filters[i]);
		const table = [];
		function push() {
			for (const i of aList) table.unshift(i);
		}
		if (data.count && data.page) {
			const count = Number(data.count);
			const page = Number(data.page);
			if (!isNaN(count) && !isNaN(page)) {
				const beg = count * page;
				const end = beg + count;
				console.log(beg, end);
				for (var i = beg; i < end; i++) if (aList[i]) table.unshift(aList[i]);
			} else push();
		} else push()
		if (data.exclude_ids) {
			const array = data.exclude_ids.split(",");
			for (const id of array) {
				const index = table.findIndex(i => i.id == id);
				if (index) table.splice(index, 1);
			}
		}
		return table;
	},
	checkcode(aList, data = {
		count: "7",
		page: "0"
	}) {
		const count = Number(data.count);
		const page = Number(data.page);
		const beg = count * page;
		const end = beg + count;
		console.log(beg, end);
		delete data.count;
		delete data.page;
		return end <= aList.length ? 1 : 0;
	},
	async genOldCharAssetXmlWithPreloadedEmotions(files, ext, tId, defaultFule) {
		let xml = '';
		if (ext == "zip") defaultFule += 2010;
		for (const file of files) {
			if (file.type != "char") continue;
			xml += `<char id="${file.id}" thumb="stand.xml" name="${
				file.title || "Untitled"
			}" cc_theme_id="${tId || file.themeId}" default="stand.${ext}" motion="walk.${
				ext
			}" editable="Y" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0">
				<tags>${file.tags || ""}</tags>
				${fs.readFileSync(`./_PREMADE/emotions/${tId || file.themeId}/${defaultFule}.xml`).toString()}
			</char>`;
		}
		return xml;
	},
	async genOldCharAssetXml(files, ext, tid, isLegacy = false) {
		let ccFile = 'cc_theme';
		if (isLegacy) ccFile += '_old';
		let xml = ''
		let ccTheme;
		if (tid) ccTheme = await xml2js.parseStringPromise(fs.readFileSync(`./frontend/static/store/cc_store/${tid}/${ccFile}.xml`))
		for (const file of files) {
			if (file.type != "char") continue;
			const tId = tid || file.themeId;
			const parts = (ccTheme || await xml2js.parseStringPromise(
				fs.readFileSync(`./frontend/static/store/cc_store/${tId}/${ccFile}.xml`)
			)).cc_theme;
			const result = await xml2js.parseStringPromise(await char.load(file.id));
			const info = parts.bodyshape.find(i => i._attributes.id == char.getCharTypeViaXml2jsOutput(result))
			const facials = parts.facial;
			const actions = {};
			for (const v of info.action) {
				const act = !v._attributes.category ? "all" : v._attributes.category;
				const tag = v._attributes.is_motion == "Y" ? 'motion' : 'action';
				actions[act] = actions[act] || '';
				actions[act] += `<${tag} ${Object.keys(v._attributes).map(i => {
					if (i != "category") return `${i}="${v._attributes[i]}${i == "id" ? `.${ext}` : ''}"`
				}).join(' ')}/>`
			}
			xml += `<char id="${file.id}" thumb="stand.xml" name="${
				file.title || "Untitled"
			}" cc_theme_id="${tId}" default="${info._attributes.default_action}.${ext}" motion="${
				info._attributes.default_motion
			}.${ext}" editable="Y" enable="Y" copyable="Y" isCC="Y" locked="N" facing="left" published="0">
				<tags>${file.tags || ""}</tags>
				${Object.keys(actions).map(i => i != "all" ? `<category name="${i}">${actions[i]}</category>` : actions[i])}
				${facials.map(v => `<facial ${
					Object.keys(v._attributes).map(i => `${i}="${v._attributes[i]}${i == "id" ? `.${ext}` : ''}"`).join(' ')
				}/>`).join("")}
			</char>`;
		}
		return xml;
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
				xml = `<sound subtype="${v.subtype}" id="${v.id}" name="${v.title || "Untitled"}" enable="Y" duration="${
					v.duration
				}" downloadtype="progressive"><tags>${v.tags || ""}</tags></sound>`;
				break;
			} case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="${v.id}.png" numScene="1" title="${
					v.title
				}" thumbnail_url="/movie_thumbs/${v.id}.png"><tags>${v.tags || ""}</tags></movie>`;
				break;
			} case "prop": {
				xml = `<prop subtype="0" id="${v.id}" name="${v.title}" enable="Y" ${
					v.ptype != "placeable" ? `${v.ptype}="1"` : ''
				} placeable="1" facing="left" width="0" height="0" asset_url="/assets/${v.id}"/>`;
				break;
			}
		}
		return xml;
	}
};
