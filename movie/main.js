const exFolder = process.env.EXAMPLE_FOLDER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const parse = require("./parse");
const fs = require("fs");
const https = require("https");
const request = require("request");

module.exports = {
	getBuffersOnline(options, data) {
		return new Promise((res, rej) => {
			try {
				if (options.method == "POST") {
					const req = https.request(options, r => {
						try {
							const buffers = [];
							r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
						} catch (e) {
							rej(e);
						}
					}).on("error", rej);
					if (data) req.end(data);
				} else if (!options.method) https.get(options, r => {
					try {
						const buffers = [];
						r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
					} catch (e) {
						rej(e);
					}
				}).on("error", rej);
			} catch (e) {
				rej(e);
			}
		});
	},
	getBuffersOnlineViaRequestModule(options, data, loadStream = false) {
		return new Promise((res, rej) => {
			try {
				request[options.method](options.url, data, (e, r, b) => {
					if (e) rej(e);
					else if (!loadStream) res(b);
					else res(r);
				});
			} catch (e) {
				rej(e);
			}
		});
	},
	previewer: {
		folder: './previews',
		push(dataStr, ip) {
			const fn = `${this.folder}/${ip}.xml`;
			const ws = fs.createWriteStream(fn, { flags: 'a' });
			dataStr.pipe(ws);
			return ws;
		},
		pop(ip) {
			const fn = `${this.folder}/${ip}.xml`;
			const stream = fs.createReadStream(fn);
			stream.on('end', () => fs.unlinkSync(fn));
			return stream;
		}
	},
	genImage() {
		return new Promise((res, rej) => {
			const q = new URLSearchParams({
				category: "technology",
				height: "360"
			}).toString();
			https.get({
				hostname: "api.api-ninjas.com",
				path: `/v1/randomimage?${q}`,
				headers: {
					"X-Api-Key": "eAx5KPJixJ9MMRiyg2LJ3g==vOWqxgrHLxeb4hPw",
					Accept: "image/jpg"
				}
			}, r => {
				const buffers = [];
				r.on("data", b => buffers.push(b)).on("end", async () => {
					res(Buffer.concat(buffers))
				})
			})
		});
	},
	/**
	 *
	 * @param {Buffer} movieZip
	 * @param {string} nëwId
	 * @param {string} oldId
	 * @returns {Promise<string>}
	 */
	save(movieZip, thumb, data, isStarter = false, req) {
		return new Promise(async (res, rej) => {
			// Saves the thumbnail of the respective video.
			let mId = data.movieId && (data.movieId.startsWith("s-") || data.movieId.startsWith("ft-")) ? data.movieId : !isStarter ? data.presaveId : `s-${
				fUtil.getNextFileId("starter-", ".xml")
			}`;
			if (thumb) {
				const n = Number.parseInt(mId.substr(2));
				let thumbFile;
				if (mId.startsWith("m-")) thumbFile = fUtil.getFileIndex("thumb-", ".png", n);
				else if (mId.startsWith("s-")) thumbFile = fUtil.getFileIndex("starter-", ".png", n);
				if (thumbFile) fs.writeFileSync(thumbFile, thumb);
			}
			var i = mId.indexOf("-");
			var prefix = mId.substr(0, i);
			var suffix = mId.substr(i + 1);
			switch (prefix) {
				case "ft": {
					const oldInfo = JSON.parse(fs.readFileSync("./_ASSETS/users.json")).users.find(i => i.id == data.userId).movies.find(i => i.oldmId == data.movieId);
					if (!oldInfo) {
						mId = `m-${fUtil.getNextFileId("movie-", ".xml")}`;
					}
					parse.unpackMovie(movieZip, data.movieId, data.userId).then((buffer) => {
						if (typeof buffer == "object" && buffer.error) return rej(buffer.error);
						fs.writeFileSync(fUtil.getFileIndex("thumb-", ".png", mId.split("-")[1]), thumb);
						const writeStream = fs.createWriteStream(fUtil.getFileIndex("movie-", ".xml", mId.split("-")[1]));
						writeStream.write(buffer, () => {
							writeStream.close();
							this.meta((oldInfo ? oldInfo.id : "") || mId, false, data.movieId).then(m => {
								const json = JSON.parse(fs.readFileSync("./_ASSETS/users.json"));
								const meta = json.users.find(i => i.id == data.userId);
								const mMeta = meta.movies.find(i => i.id == m.id);
								const oldMovieInfoIndex = meta.movies.findIndex(i => i.id == data.movieId);
								meta.movies.splice(oldMovieInfoIndex, 1);
								if (!mMeta) meta.movies.unshift(m);
								else {
									for (const stuff in m) {
										if (m[stuff] != mMeta[stuff]) {
											mMeta[stuff] = m[stuff];
										}
									}
								}
								fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
								if (fs.existsSync(`./ftContent/${data.movieId.split("ft-")[1]}.zip`)) {
									fs.unlinkSync(`./ftContent/${data.movieId.split("ft-")[1]}.zip`);
									res(m.id);
								} else rej(`Your movie has been saved, but the File: ${data.movieId.split("ft-")[1]}.zip does not exist in the ftContent folder within the GoNexus LVM Project meaning that the movie id: ${data.movieId.split("ft-")[1]} will be inaccessable until you import a FlashThemes video simular to the movie id: ${data.movieId.split("ft-")[1]} using the FlashThemes Video Converter tool. Please go to ${req.headers.origin}/movie/${m.id} in another browser window.`);
							}).catch(rej);
						});
					}).catch(rej);
					break;
				} case "m": {
					if (fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix))) fs.unlinkSync(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix));
					var path;
					if (data.is_triggered_by_autosave && fs.existsSync(fUtil.getFileIndex("movie-", ".xml", suffix))) path = fUtil.getFileIndex("movie-autosaved-", ".xml", suffix);
					else path = fUtil.getFileIndex("movie-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					parse.unpackMovie(movieZip, mId, data.userId).then((buffer) => {
						writeStream.write(buffer, () => {
							writeStream.close();
							this.meta(mId, data.is_triggered_by_autosave == '1').then(m => {
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
								if (fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", m.id.substr(2)))) fs.unlinkSync(fUtil.getFileIndex("movie-", ".mp4", m.id.substr(2)));
								res(m.id);
							}).catch(rej);
						});
					}).catch(rej);
					break;
				} case "s": {
					var path = fUtil.getFileIndex("starter-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					parse.unpackMovie(movieZip, mId, data.userId).then((buffer) => {
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
								if (data.loadFromAutosave) filePath = fUtil.getFileIndex("movie-autosaved-", ".xml", numId);
								else filePath = fUtil.getFileIndex("movie-", ".xml", numId);
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
					} case "ft": {
						res(fs.readFileSync(`./ftContent/${suffix}.zip`));
						break;
					}
				}
			} catch (e) {
				rej(e);
			}
		});
	},
	checkXml4Audio(mId) {
		const prefix = mId.substr(0, mId.indexOf("-"));
		switch (prefix) {
			case "s":
			case "m": {
				let numId = Number.parseInt(mId.substr(mId.indexOf("-") + 1));
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
				return parse.check4XmlAudio(fs.readFileSync(filePath));
			}
		}
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
				if (!movieId.startsWith("ft-")) res(fs.readFileSync(fn)); 
				else res(await this.getBuffersOnline({
					hostname: "flashthemes.net",
					path: `/movie_thumbs/thumb-${movieId.split("ft-")[1]}.png`,
					headers: { 
						"Content-type": "image/png"
					}
				}));
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
	meta(movieId, isAutosave = false, oldmId) {
		return new Promise(async (res, rej) => {
			try {
				let fn;
				const n = Number.parseInt(movieId.substr(2));
				if (movieId.startsWith("m-")) {
					if (!isAutosave) fn = fUtil.getFileIndex("movie-", ".xml", n);
					else fn = fUtil.getFileIndex("movie-autosaved-", ".xml", n);
				} else if (movieId.startsWith("s-")) fn = fUtil.getFileIndex("starter-", ".xml", n);
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
				const begHiddenTag = buffer.indexOf("<hiddenTag>") + 20;
				const endHiddenTag = buffer.indexOf("]]></hiddenTag>");
				const hiddenTag = buffer.slice(begHiddenTag, endHiddenTag).toString();
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
					hiddenTag,
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
					file: fn.substr(fn.lastIndexOf("/") + 1),
					oldmId
				});
			} catch (e) {
				rej(e);
			}
		});
	},
};
