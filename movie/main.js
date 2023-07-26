const exFolder = process.env.EXAMPLE_FOLDER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const parse = require("./parse");
const fs = require("fs");
const path = require("path");
const https = require("https");

module.exports = {
	genImage() {
		return new Promise((res, rej) => {
			https.get('https://upload.wikimedia.org/wikipedia/en/0/01/Sans_undertale.jpg', (r) => {
				const buffers = [];
				r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
			}).on("error", rej);
		});
	},
	/**
	 *
	 * @param {Buffer} movieZip
	 * @param {string} nëwId
	 * @param {string} oldId
	 * @returns {Promise<string>}
	 */
	save(movieZip, thumb, data, isStarter = false) {
		return new Promise(async (res, rej) => {
			// Saves the thumbnail of the respective video.
			const mId = data.movieId || !isStarter ? data.presaveId : `s-${fUtil.getNextFileId("starter-", ".xml")}`;
			if (thumb) {
				const n = Number.parseInt(mId.substr(2));
				let thumbFile;
				if (mId.startsWith("m-")) thumbFile = fUtil.getFileIndex("thumb-", ".png", n);
				else if (mId.startsWith("s-")) thumbFile = fUtil.getFileIndex("starter-", ".png", n);
				fs.writeFileSync(thumbFile, thumb);
			}
			var i = mId.indexOf("-");
			var prefix = mId.substr(0, i);
			var suffix = mId.substr(i + 1);
			switch (prefix) {
				case "m": {
					var path = fUtil.getFileIndex("movie-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					parse.unpackMovie(movieZip).then((buffer) => {
						writeStream.write(buffer, () => {
							writeStream.close();
							this.meta(mId).then(m => {
								const json = JSON.parse(fs.readFileSync("./_ASSETS/users.json"));
								const meta = json.users.find(i => i.id == data.userId);
								const mMeta = meta.movies.find(i => i.id == m.id);
								if (!mMeta) meta.movies.unshift(m);
								else {
									for (const stuff in m) {
										if (m[stuff] != mMeta[stuff]) {
											mMeta[stuff] = m[stuff];
										}
									}
								}
								fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
								res(m.id);
							}).catch(rej);
						});
					}).catch(rej);
					break;
				} case "s": {
					var path = fUtil.getFileIndex("starter-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					parse.unpackMovie(movieZip).then((buffer) => {
						writeStream.write(buffer, () => {
							writeStream.close();
							this.meta(mId).then(m => {
								const json = JSON.parse(fs.readFileSync("./_ASSETS/users.json"));
								const meta = json.users.find(i => i.id == data.userId);
								meta.assets.unshift(m);
								fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
								res(m.id);
							}).catch(rej);
						});
					}).catch(rej);
					break;
				}
			}
		});
	},
	loadZip(query, data, packThumb = false) {
		return new Promise(async (res, rej) => {
			try {
				const mId = query.movieId;
				const i = mId.indexOf("-");
				const prefix = mId.substr(0, i);
				const suffix = mId.substr(i + 1);
				switch (prefix) {
					case "s":
					case "m": {
						let numId = Number.parseInt(suffix);
						let filePath;
						switch (prefix) {
							case "m": {
								filePath = fUtil.getFileIndex("movie-", ".xml", numId);
								break;
							} case "s": {
								filePath = fUtil.getFileIndex("starter-", ".xml", numId);
								break;
							}
						}
						const buffer = fs.readFileSync(filePath);
						const pack = await parse.packMovie(buffer, data.movieOwnerId || query.userId, packThumb, query.movieId);
						res(pack);
						break;
					}
				}
			} catch (e) {
				rej(e);
			}
		});
	},
	check4XmlAudio(mId, isPreview = false) {
		return new Promise(async (res, rej) => {
			try {
				const i = mId.indexOf("-");
				const prefix = mId.substr(0, i);
				const suffix = mId.substr(i + 1);
				let filePath;
				if (isPreview) filePath = `./previews/${mId}.mp4`;
				else switch (prefix) {
					case "s":
					case "m": {
						let numId = Number.parseInt(suffix);
						switch (prefix) {
							case "m": {
								filePath = fUtil.getFileIndex("movie-", ".xml", numId);
								break;
							} case "s": {
								filePath = fUtil.getFileIndex("starter-", ".xml", numId);
								break;
							}
						}
						break;
					}
				}
				const buffer = fs.readFileSync(filePath);
				const pack = await parse.check4XmlAudio(buffer);
				res(pack);
			} catch (e) {
				rej(e);
			}
		});
	},
	loadXml(movieId) {
		return new Promise(async (res, rej) => {
			const i = movieId.indexOf("-");
			const prefix = movieId.substr(0, i);
			const suffix = movieId.substr(i + 1);
			switch (prefix) {
				case "m": {
					const fn = fUtil.getFileIndex("movie-", ".xml", suffix);
					if (fs.existsSync(fn)) res(fs.readFileSync(fn));
					else rej();
					break;
				}
				case "e": {
					const fn = `${exFolder}/${suffix}.zip`;
					if (!fs.existsSync(fn)) return rej();
					parse
						.unpackMovie(nodezip.unzip(fn))
						.then((v) => res(v))
						.catch((e) => rej(e));
					break;
				}
				default:
					rej();
			}
		});
	},
	loadThumb(movieId) {
		return new Promise(async (res, rej) => {
			try {
				const n = Number.parseInt(movieId.substr(2));
				let fn;
				if (movieId.startsWith("m-")) fn = fUtil.getFileIndex("thumb-", ".png", n);
				else if (movieId.startsWith("s-")) fn = fUtil.getFileIndex("starter-", ".png", n);
				res(fs.readFileSync(fn));
			} catch (e) {
				rej(e);
			}
		});
	},
	list() {
		const array = [];
		const last = fUtil.getLastFileIndex("movie-", ".xml");
		for (let c = last; c >= 0; c--) {
			const movie = fs.existsSync(fUtil.getFileIndex("movie-", ".xml", c));
			const thumb = fs.existsSync(fUtil.getFileIndex("thumb-", ".png", c));
			if (movie && thumb) array.push(`m-${c}`);
		}
		return array;
	},
	meta(movieId) {
		return new Promise(async (res, rej) => {
			try {
				let fn;
				const n = Number.parseInt(movieId.substr(2));
				if (movieId.startsWith("m-")) fn = fUtil.getFileIndex("movie-", ".xml", n);
				else if (movieId.startsWith("s-")) fn = fUtil.getFileIndex("starter-", ".xml", n);
				const buffer = fs.readFileSync(fn);
				const begTitle = buffer.indexOf("<title>") + 16;
				const endTitle = buffer.indexOf("]]></title>");
				const title = buffer.slice(begTitle, endTitle).toString();
				const begDesc = buffer.indexOf("<desc>") + 15;
				const endDesc = buffer.indexOf("]]></desc>");
				const desc = buffer.slice(begDesc, endDesc).toString();
				const begTag = buffer.indexOf("<tag>") + 14;
				const endTag = buffer.indexOf("]]></tag>");
				const tags = buffer.slice(begTag, endTag).toString();
				const begDuration = buffer.indexOf('duration="') + 10;
				const endDuration = buffer.indexOf('"', begDuration);
				const duration = Number.parseFloat(buffer.slice(begDuration, endDuration));
				const min = ("" + ~~(duration / 60)).padStart(2, "0");
				const sec = ("" + ~~(duration % 60)).padStart(2, "0");
				const durationStr = `${min}:${sec}`;
				const begPublic = buffer.indexOf('published="') + 11;
				const endPublic = buffer.indexOf('"', begPublic);
				const public = buffer.slice(begPublic, endPublic).toString();
				function getPublishStatus() {
					const begPrivate = buffer.indexOf('pshare="') + 8;
					const endPrivate = buffer.indexOf('"', begPrivate);
					const private = buffer.slice(begPrivate, endPrivate).toString();
					if (public == "0" && private == "0") return "draft";
					if (public == "1" && private == "0") return "public";
					if (public == "0" && private == "1") return "private";
				}
				res({
					desc,
					date: fs.statSync(fn).mtime,
					durationString: durationStr,
					duration,
					title: title || "Untitled Video",
					published: public,
					tags,
					publishStatus: getPublishStatus(),
					id: movieId,
					enc_asset_id: movieId,
					type: "movie",
					file: fn.substr(fn.lastIndexOf("/") + 1)
				});
			} catch (e) {
				rej(e);
			}
		});
	},
};
