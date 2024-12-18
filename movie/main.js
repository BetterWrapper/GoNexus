const exFolder = process.env.EXAMPLE_FOLDER;
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const parse = require("./parse");
const fs = require("fs");
const https = require("https");
const request = require("request");
const xmldoc = require("xmldoc");
const xml2js = require('xml2js');
const char = require("../character/main");
function stream2buffer(r) {
	return new Promise((res, rej) => {
		const buffers = [];
		r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
	})
}
function assignObjects(json, array, options) {
	function c(s) {
		const json = {};
		for (const i in s) {
			if (Array.isArray(s[i]) && !options?.noArray) {
				if (json[i] && options?.onlyAssignNewArrays) continue; 
				if (!json[i]) json[i] = [];
				Object.assign(json[i], s[i]);
			} else if (typeof s[i] != "object") {
				if (json[i] && options?.onlyAssignNewStrings) continue; 
				json[i] = !options?.noString ? s[i] : json[i];
			}
			else if (!options?.noObject) {
				if (json[i] && options?.onlyAssignNewObjects) continue; 
				if (!json[i]) json[i] = {};
				assignObjects(json[i], [c(s[i])]);
			}
		}
		return json;
	}
	for (const j of array) {
		for (const i in j) {
			if (Array.isArray(j[i])) {
				if (json[i] && options?.onlyAssignNewArrays) continue; 
				if (!json[i]) json[i] = [];
				Object.assign(json[i], j[i]);
			} else if (typeof j[i] != "object") {
				if (json[i] && options?.onlyAssignNewStrings) continue; 
				json[i] = !options?.noString ? j[i] : json[i];
			} else if (!options?.noObject) {
				if (json[i] && options?.onlyAssignNewObjects) continue; 
				if (!json[i]) json[i] = {};
				assignObjects(json[i], [c(j[i])])
			}
		}
	}
	return json;
}
module.exports = {
	stringIsArray(json) {
		return json ? json.startsWith('[') && json.endsWith(']') : false;
	},
	stringIsJson(json) {
		return json ? json.startsWith('{') && json.endsWith('}') : false;
	},
	addArray2ObjectWithNumbers(json) {
		function c(j) {
			let info = {};
			for (const i in j) {
				if (typeof j[i] == "object") {
					if (isNaN(Number(i))) info[i] = c(j[i])
					else {
						info = !Array.isArray(info) ? [] : info;
						info[Number(i)] = info[Number(i)] || {};
						assignObjects(info[Number(i)], [j[i]]);
					}
				} else info[i] = j[i]
			}
			return info;
		}
		return c(json);
	},
	extractMeta(file, folder, prefix) {
		return new Promise(async (res, rej) => {
			try {
				if (file.endsWith(".zip")) {
					const zip = nodezip.unzip(fs.readFileSync(`${folder}/${file}`));
					if (!zip["movie.xml"]) rej("movie.xml does not exist.");
					else {
						const json = new xmldoc.XmlDocument(await stream2buffer(zip["movie.xml"].toReadStream()));
						const info = json.attr;
						info.path = file.slice(0, -3) + "png",
						info.id = `${prefix}-${file.slice(0, -4)}`;
						info.numScene = json.children.filter(i => i.name == "scene").length;
						const meta = json.children.filter(i => i.name == "meta");
						if (meta.length < 2) {
							console.log(meta[0].children);
							const stuff2fill = {
								title: "title",
								tags: "tag"
							};
							for (const i in stuff2fill) {
								const s = meta[0].children.filter(d => d.name == stuff2fill[i]);
								if (s.length > 1) return rej(`There cannot be more than 1 <${stuff2fill[i]}> tag in the movie.xml file.`);
								info[i] = s[0].val;
							}
							console.log(info);
							res(info)
						} else rej("There cannot be more than 1 <meta> tag in the movie.xml file.");
					}
				}
			} catch (e) {
				rej(e);
			} 
		})
	},
	async stream2buffer(r) {
		return await stream2buffer(r);
	},
	getBuffersOnline(options, data) {
		return new Promise((res, rej) => {
			try {
				if (options.method) {
					const req = https.request(options, r => stream2buffer(r).then(res).catch(rej)).on("error", rej);
					data ? req.end(data) : req.end();
				} else https.get(options, r => stream2buffer(r).then(res).catch(rej)).on("error", rej);
			} catch (e) {
				rej(e);
			}
		});
	},
	assignObjects(json = {}, array = [], options = {}) {
		return assignObjects(json, array, options);
	},
	stringArray2Array(json) {
		const a = [];
		for (const key in json) {
			let k = key.split("][").join(".").split("[").join(".").split("]")
			k = k[0].split(".");
			function c(e = 0) {
				if (e == k.length) return json[key];
				const a = {};
				a[k[e]] = c(e + 1);
				return a;
			}
			a.unshift(c())
		}
		return a;
	},
	getBuffersOnlineViaRequestModule(options, data, loadStream = false) {
		return new Promise((res, rej) => {
			try {
				request[options.method](options.url, data, (e, r, b) => {
					e ? rej(e) : !loadStream ? res(b) : res(r);
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
			let mId = data.movieId && (
				data.movieId.startsWith("s-") || data.movieId.startsWith("ft-")
			) ? data.movieId : !isStarter ? data.presaveId : `s-${
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
					const oldInfo = JSON.parse(fs.readFileSync("./_ASSETS/users.json")).users.find(i => i.id == data.userId).movies.find(
						i => i.oldmId == data.movieId
					);
					if (!oldInfo) {
						mId = `m-${fUtil.getNextFileId("movie-", ".xml")}`;
					}
					let buffer;
					if (data.v == "2010") buffer = movieZip;
					else buffer = await parse.unpackMovie(movieZip, data.movieId, data.userId);
					if (typeof buffer == "object" && buffer.error) return rej(buffer.error);
					fs.writeFileSync(fUtil.getFileIndex("thumb-", ".png", mId.split("-")[1]), thumb);
					const writeStream = fs.createWriteStream(fUtil.getFileIndex("movie-", ".xml", mId.split("-")[1]));
					writeStream.write(buffer, () => {
						writeStream.close();
						this[data.v == "2010" ? 'oldMeta' : 'meta']((oldInfo ? oldInfo.id : "") || mId, false, data.movieId).then(m => {
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
							} else rej(`Your movie has been saved, but a file called ${
								data.movieId.split("ft-")[1]
							}.zip does not exist in the ftContent folder within the GoNexus LVM Project meaning that the movie id ${
								data.movieId.split("ft-")[1]
							} will be inaccessable until you import a FlashThemes video similar to the movie id ${
								data.movieId.split("ft-")[1]
							} using the FlashThemes Video Converter tool.`);
						});
					})
					break;
				} case "m": {
					if (fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix)) && !data.is_triggered_by_autosave) fs.unlinkSync(
						fUtil.getFileIndex("movie-autosaved-", ".xml", suffix)
					);
					var path;
					if (
						data.is_triggered_by_autosave 
						&& fs.existsSync(fUtil.getFileIndex("movie-", ".xml", suffix))
					) path = fUtil.getFileIndex("movie-autosaved-", ".xml", suffix);
					else path = fUtil.getFileIndex("movie-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					let buffer;
					if (data.v == "2010") buffer = movieZip;
					else buffer = await parse.unpackMovie(movieZip, mId, data.userId);
					writeStream.write(buffer, () => {
						writeStream.close();
						this[data.v == "2010" ? 'oldMeta' : 'meta'](
							mId, data.is_triggered_by_autosave == '1' && fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix))
						).then(m => {
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
							if (
								fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", m.id.substr(2)))
							) fs.unlinkSync(fUtil.getFileIndex("movie-", ".mp4", m.id.substr(2)));
							res(m.id);
						}).catch(rej);
					});
					break;
				} case "s": {
					var path = fUtil.getFileIndex("starter-", ".xml", suffix);
					var writeStream = fs.createWriteStream(path);
					let buffer;
					if (data.v == "2010") buffer = movieZip;
					else buffer = await parse.unpackMovie(movieZip, mId, data.userId)
					writeStream.write(buffer, () => {
						writeStream.close();
						this[data.v == "2010" ? 'oldMeta' : 'meta'](mId).then(m => {
							const json = JSON.parse(fs.readFileSync("./_ASSETS/users.json"));
							const meta = json.users.find(i => i.id == data.userId);
							meta.assets.unshift(m);
							fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
							res(m.id);
						}).catch(rej);
					});
					break;
				}
			}
		});
	},
	uploadMovieAssets2Flashthemes(ftsession, xmlPath) { 
		// Uploads assets from a movie xml to flashthemes in an attempt to fix some videos not loading.
		return new Promise(async (res, rej) => {
			try {
				let hasChars = false, charCounter = 0;
				const buffer = fs.readFileSync(xmlPath);
				const parser = new xml2js.Parser();
				const charFtInfo = JSON.parse((await this.getBuffersOnline({
					hostname: "flashthemes.net",
					path: "/character/creator/family/adam",
					headers: {
						cookie: ftsession
					}
				})).toString().split(".flash(")[1].split(");")[0]);
				parser.parseString(buffer, async (err, json) => {
					try {
						if (err) res(false);
						else {
							if (
								!json.film || (!json.film.scene && !json.film.sound)
							) res(false);
							for (const i in json.film) {
								if (i.startsWith("_") || i == "meta") continue;
								for (const info of json.film[i]) {
									/*if (i == "sound") {
										if (!info.sfile[0]) continue;
										await basicParse(info.sfile[0], i, info);
									} else*/ 
									for (const i in info) {
										const altNames = {
											effectAsset: "effect"
										}
										if (i.startsWith("_")) continue;
										for (const info1 of info[i]) {
											switch (i) {
												case "char": {
													if (!info1.action[0]._text) continue;
													const filearray = info1.action[0]._text.split(".")
													const themeId = filearray[0];
													const charId = filearray[1];
													if (themeId == "ugc" && charId.startsWith("c-")) {
														hasChars = true;
														const thumb = fs.readFileSync(fUtil.getFileIndex("char-", ".png", charId.substr(2)));
														//const head = fs.readFileSync(fUtil.getFileIndex("head-", ".png", charId.substr(2)));
														const json = new xmldoc.XmlDocument(await char.load(charId));
														charFtInfo.flashvars.body = `${header}<${json.name} ${
															Object.keys(json.attr).map(v => `${v}="${json.attr[v]}"`).join(" ")
														}>`;
														for (const info of json.children) {
															if (info.text) continue;
															charFtInfo.flashvars.body += `<${info.name} ${
																Object.keys(info.attr).map(v => `${v}="${info.attr[v]}"`).join(" ")
															}${!info.val ? `/` : ''}>${info.val ? `</${info.name}>` : ''}`;
														}
														charFtInfo.flashvars.body += `</${json.name}>`
														charFtInfo.flashvars.bs = await char.getCharTypeViaBuff(charFtInfo.flashvars.body);
														charFtInfo.flashvars.themeId = char.getTheme(charFtInfo.flashvars.body);
														charFtInfo.flashvars.thumbdata = thumb.toString("base64");
														//charFtInfo.flashvars.imagedata = head.toString("base64");
														const params = new URLSearchParams(charFtInfo.flashvars).toString();
														const code = (await this.getBuffersOnline({
															method: "POST",
															hostname: "flashthemes.net",
															path: "/goapi/saveCCCharacter/",
															headers: {
																Host: "flashthemes.net",
																"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0",
																Accept: "*/*",
																"Accept-Language": "en-US,en;q=0.5",
																"Accept-Encoding": "gzip, deflate, br",
																Origin: "https://flashthemes.net",
																Connection: "keep-alive",
																Cookie: ftsession,
																TE: "Trailers",
																"Content-Type": "application/x-www-form-urlencoded",
																"Content-Length": params.length
															}
														}, params)).toString();
														console.log(code);
														if (!code.startsWith("0")) continue;
														charCounter++
													}
													break;
												} /*default: {
													if (!info1.file) continue;
													await basicParse(info1.file[0], altNames[i] || i);
													break;
												}*/
											}
										}
									}
								}
							}
							if (
								hasChars && charCounter > 0
							) res(true);
							else res(false);
						}
					} catch (e) {
						console.log(e);
						res(false);
					}
				});
			} catch (e) {
				console.log(e);
				res(false);
			}
		})
	},
	loadZip(query, data, packThumb = false) {
		return new Promise(async (res, rej) => {
			try {
				const mId = query.movieId;
				const suffix = mId.substr(mId.split("-")[0].length + 1);
				const prefix = mId.split(suffix)[0].slice(0, -1);
				console.log(suffix, prefix);
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
						parse.packMovie(buffer, data, packThumb).then(res).catch(rej);
						break;
					} case "ft": {
						res(fs.readFileSync(`./ftContent/${suffix}.zip`));
						break;
					} case "e": {
						let data = fs.readFileSync(`${exFolder}/${suffix}.zip`);
						res(data.subarray(data.indexOf(80)));
						break;
					} case "url": {
						res(await parse.packMovieFromUrl(suffix));
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
					else rej('File Does Not Exist');
					break;
				} case "e": {
					const fn = `${exFolder}/${suffix}.zip`;
					if (!fs.existsSync(fn)) return rej('File Does Not Exist');
					parse.unpackMovie(nodezip.unzip(fn)).then(res).catch(rej);
					break;
				} default: rej('stuff');
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
				const begPrivate = buffer.indexOf('pshare="') + 8;
				const endPrivate = buffer.indexOf('"', begPrivate);
				const private = buffer.slice(begPrivate, endPrivate).toString();
				function getPublishStatus() {
					if (public == "0" && private == "0") return "draft";
					if (public == "1" && private == "0") return "public";
					if (public == "0" && private == "1") return "private";
				}
				const begCopyable = buffer.indexOf('copyable="') + 10;
				const endCopyable = buffer.indexOf('"', begCopyable);
				const copyable = buffer.slice(begCopyable, endCopyable).toString();
				const begWide = buffer.indexOf('isWide="') + 8;
				const endWide = buffer.indexOf('"', begWide);
				const isWide = buffer.slice(begWide, endWide).toString();
				res({
					isWide,
					copyable,
					desc,
					hiddenTag,
					date: fs.statSync(fn).mtime,
					durationString: durationStr,
					duration,
					title: title || "Untitled Video",
					published: public,
					pshare: private,
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
	stringIsArray(json) {
        return json ? json.startsWith('[') && json.endsWith(']') : false;
    },
    stringIsJson(json) {
        return json ? json.startsWith('{') && json.endsWith('}') : false;
    },
	oldMeta(movieId, isAutosave = false, oldmId) {
		return new Promise(async (res, rej) => {
			try {
				let fn;
				const n = Number.parseInt(movieId.substr(2));
				if (movieId.startsWith("m-")) {
					if (!isAutosave) fn = fUtil.getFileIndex("movie-", ".xml", n);
					else fn = fUtil.getFileIndex("movie-autosaved-", ".xml", n);
				} else if (movieId.startsWith("s-")) fn = fUtil.getFileIndex("starter-", ".xml", n);
				const buffer = fs.readFileSync(fn);
				const begTitle = buffer.indexOf("<title>") + 7;
				const endTitle = buffer.indexOf("</title>");
				const title = buffer.slice(begTitle, endTitle).toString();
				const begDesc = buffer.indexOf("<desc>");
				const endDesc = buffer.indexOf("</desc>");
				const desc = buffer.slice(begDesc, endDesc).toString();
				const begTag = buffer.indexOf("<tag>");
				const endTag = buffer.indexOf("</tag>");
				const tags = buffer.slice(begTag, endTag).toString();
				const begHiddenTag = buffer.indexOf("<hiddenTag>");
				const endHiddenTag = buffer.indexOf("</hiddenTag>");
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
				const begPrivate = buffer.indexOf('pshare="') + 8;
				const endPrivate = buffer.indexOf('"', begPrivate);
				const private = buffer.slice(begPrivate, endPrivate).toString();
				function getPublishStatus() {
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
					pshare: private,
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
