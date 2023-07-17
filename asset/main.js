const chars = require("../character/main");
const fUtil = require("../misc/file");
const fs = require("fs");

module.exports = {
	load(aId) {
		return fs.readFileSync(`./_ASSETS/${aId}`);
	},
	generateId() {
		return ("" + Math.random()).replace(".", "");
	},
	save(buffer, meta, data) {
		meta.enc_asset_id = this.generateId();
		meta.id = meta.file = meta.enc_asset_id + '.' + meta.ext;
		fs.writeFileSync(`./_ASSETS/${meta.id}`, buffer);
		const json = JSON.parse(fs.readFileSync('./users.json'));
		json.users.find(i => i.id == data.userId).assets.unshift(meta);
		fs.writeFileSync('./users.json', JSON.stringify(json, null, "\t"));
		return meta.id;
	},
	list(uId, type, subtype, themeId) {
		const json = JSON.parse(fs.readFileSync('./users.json')).users.find(i => i.id == uId);
		let aList = json.assets.filter(i => i.type == type);
		if (subtype) aList = aList.filter(i => i.subtype == subtype);
		if (themeId) aList = aList.filter(i => i.themeId == themeId);
		return aList;
	},
	meta2Xml(v) {
		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" name="${v.title || "Untitled"}" cc_theme_id="${v.themeId}" thumbnail_url="/char_thumbs/${
					v.id
				}.png" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
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
					v.ptype ? `${v.ptype}="1"` : ''
				} placeable="1" facing="left" width="0" height="0"/>`;
				break;
			}
		}
		return xml;
	}
};
