const cachéFolder = process.env.CACHÉ_FOLDER;
const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fUtil = require("../misc/file");
const get = require("../misc/get");
const fw = process.env.FILE_WIDTH;
const fs = require("fs");

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
	/**
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	getTheme(buffer) {
		const beg = buffer.indexOf(`theme_id="`) + 10;
		const end = buffer.indexOf(`"`, beg);
		return buffer.subarray(beg, end).toString();
	},
	async getCharType(id) {
		const buffer = await this.load(id);
		const beg = buffer.indexOf(`component_id="`) + 14;
		const end = buffer.indexOf(`"`, beg);
		return buffer.subarray(beg, end).toString();
	},
	getCharTypeViaBuff(buff) {
		const beg = buff.indexOf(`component_id="`) + 14;
		const end = buff.indexOf(`"`, beg);
		return buff.subarray(beg, end).toString();
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		return new Promise((res, rej) => {
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
						// Blank prefix is left here for backwards-compatibility purposes.
						var nId = Number.parseInt(suffix);
						var xmlSubId = nId % fw;
						var fileId = nId - xmlSubId;
						var lnNum = fUtil.padZero(xmlSubId, xNumWidth);
						var url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;
						get(url).then((b) => {
							var line = b.toString("utf8").split("\n").find((v) => v.substr(0, xNumWidth) == lnNum);
							if (line) res(Buffer.from(line.substr(xNumWidth)));
							else rej("Character does not exist");
						});
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
				res(fs.readFileSync(`./premadeChars/thumb/${id}.png`));
			}
		});
	},
	loadHead(id) {
		return new Promise(res => {
			try {
				res(fs.readFileSync(getHeadPath(id)));
			} catch (e) {
				res(fs.readFileSync(`./premadeChars/head/${id}.png`));
			}
		});
	},
};
