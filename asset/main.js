const fUtil = require("../misc/file");
const fs = require("fs");

module.exports = {
	folder: './_ASSETS',
	load(aId) {
		return fs.readFileSync(`${this.folder}/${aId}`);
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
				for (const path of paths) fs.unlinkSync(path);
			}
			else fs.unlinkSync(`${this.folder}/${info.id}`);
			userInfo.assets.splice(index, 1);
			fs.writeFileSync(`${this.folder}/users.json`, JSON.stringify(json, null, "\t"));
		} else {
			if (data.id.startsWith("s-")) {
				const paths = [
					fUtil.getFileIndex("starter-", ".xml", data.id.substr(2)),
					fUtil.getFileIndex("starter-", ".png", data.id.substr(2))
				];
				for (const path of paths) fs.unlinkSync(path);
			}
			else fs.unlinkSync(`${this.folder}/${data.id}`);
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
	list(uId, type, subtype, themeId) {
		const json = JSON.parse(fs.readFileSync(`${this.folder}/users.json`)).users.find(i => i.id == uId);
		let aList = json.assets.filter(i => i.type == type);
		if (subtype) aList = aList.filter(i => i.subtype == subtype);
		if (themeId) aList = aList.filter(i => i.themeId == themeId);
		return aList;
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
				}" downloadtype="progressive"/>`;
				break;
			}	
			case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${
					v.title
				}" thumbnail_url="/movie_thumbs/${v.id}.png"><tags></tags></movie>`;
				break;
			}
			case "prop": {
				xml = `<prop subtype="0" id="${v.id}" name="${v.title}" enable="Y" ${
					v.ptype != "placeable" ? `${v.ptype}="1"` : ''
				} placeable="1" facing="left" width="0" height="0" asset_url="/assets/${v.id}"/>`;
				break;
			}
		}
		return xml;
	}
};
