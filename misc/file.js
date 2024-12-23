const folder = process.env.SAVED_FOLDER;
const nodezip = require("node-zip");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const mp3Duration = require("mp3-duration");
module.exports = {
	mp3Duration(buffer) {
		return new Promise((res, rej) => {
			mp3Duration(buffer, (e, d) => {
				res(d * 1e3);
			});
		})
	},
	/**
	 * converts a readable stream to any audio ext
	 * @param {import("stream".Readable)} data
	 * @param {string} from
	 * @param {string} to
	 * @returns {Promise<import("stream").Writable | import("stream").PassThrough>}
	 */
	convertStreamAudio(data, from, to) {
		return new Promise((res, rej) => {
			const command = ffmpeg(data).inputFormat(from).toFormat(to).audioBitrate(4.4e4).on("error", (err) => rej(err));
			res(command.pipe());
		});
	},
	convertStreamFile(data, from, to) {
		return new Promise((res, rej) => {
			const command = ffmpeg(data).inputFormat(from).toFormat(to).on("error", (err) => rej(err));
			res(command.pipe());
		});
	},
	/**
	 *
	 * @param {number} n
	 * @param {number} l
	 * @returns {string}
	 */
	padZero(n, l = process.env.FILE_NUM_WIDTH) {
		return ("" + n).padStart(l, "0");
	},
	/**
	 *
	 * @param {string} temp
	 * @param {string} info
	 * @returns {string}
	 */
	fillTemplate(temp, info) {
		return temp.replace(/%s/g, info);
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} l
	 * @returns {string}
	 */
	getNextFile(s, suf = ".xml", l = 7) {
		const regex = new RegExp(`${s}[0-9]*${suf}$`);
		const dir = fs.readdirSync(folder).filter((v) => v && regex.test(v));
		return `${folder}/${s}${this.padZero(dir.length, l)}${suf}`;
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} l
	 * @returns {number}
	 */
	getNextFileId(s, suf = ".xml", l = 7) {
		const indicies = this.getValidFileIndicies(s, suf, l);
		return indicies.length ? indicies[indicies.length - 1] + 1 : 0;
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {Buffer} data
	 * @param {number} l
	 * @returns {number}
	 */
	fillNextFileId(s, suf = ".xml", data = Buffer.alloc(0), l = 7) {
		const id = this.getNextFileId(s, suf);
		const fn = this.getFileIndex(s, suf, id, l);
		fs.writeFileSync(fn, data);
		return id;
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} n
	 * @param {number} l
	 * @returns {string}
	 */
	getFileIndex(s, suf = ".xml", n, l = 7) {
		return this.getFileString(s, suf, this.padZero(n, l));
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {string} name
	 * @returns {string}
	 */
	getFileString(s, suf = ".xml", name) {
		return `${folder}/${s}${name}${suf}`;
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} l
	 * @returns {number[]}
	 */
	getValidFileIndicies(s, suf = ".xml", l = 7) {
		const regex = new RegExp(`${s}[0-9]{${l}}${suf}$`);
		return fs.readdirSync(folder).filter((v) => v && regex.test(v)).map((v) => Number.parseInt(v.substr(s.length, l)));
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} l
	 * @returns {string[]}
	 */
	getValidFileNames(s, suf = ".xml", l = 7) {
		const regex = new RegExp(`${s}[0-9]{${l}}${suf}$`);
		return fs
			.readdirSync(folder)
			.filter((v) => v && regex.test(v))
			.map((v) => `${folder}/${v}`);
	},
	/**
	 * @param {string} s
	 * @param {string} suf
	 * @param {number} l
	 * @returns {string[]}
	 */
	getLastFileIndex(s, suf = ".xml", l = 7) {
		const regex = new RegExp(`${s}[0-9]{${l}}${suf}$`);
		const list = fs.readdirSync(folder).filter((v) => v && regex.test(v));
		return list.length ? Number.parseInt(list.pop().substr(s.length, l)) : -1;
	},
	/**
	 *
	 * @param {string} fileName
	 * @param {string} zipName
	 */
	makeZip(fileName, zipName) {
		if (!fs.existsSync(fileName)) return Promise.reject();
		const buffer = fs.readFileSync(fileName);
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},
	/**
	 *
	 * @param {Buffer} buf
	 * @param {string} zipName
	 */
	makeZipFromBuffer(buf, zipName) {
		if (buf.length <= 0) return Promise.reject();
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buf);
		return zip.zip();
	},
	/**
	 *
	 * @summary Fixed version of ZipFile.add
	 * @param {nodezip.ZipFile} zip
	 * @param {string} zipName
	 * @param {string} buffer
	 */
	addToZip(zip, zipName, buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0) zip[zipName].crc32 += 4294967296;
	},
};
