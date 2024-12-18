const fs = require("fs");
const nodezip = require("node-zip");
const JSZip = require("jszip");
const mp3Duration = require("mp3-duration");
const https = require("https");
const request = require("request");
const tempbuffer = require("../tts/tempBuffer");
function getBuffersOnline(options, data) {
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
}
function getBuffersOnlineViaRequestModule(options, data, loadStream = false) {
	return new Promise((res, rej) => {
		try {
			request[options.method](options.url, data, (e, r, b) => {
				if (e) rej(e);
				else if (!loadStream) res(b);
				else res(r);
			});
		} catch (e) {
			console.log(e);
		}
	});
}
function getMP3Duration(buffer) {
	return new Promise((res, rej) => {
		mp3Duration(buffer, (e, d) => {
			e ? rej(e) : res(d * 1e3);
		});
	})
}
const {
	XmlDocument
} = require("xmldoc");
const char = require("../character/main");
const fUtil = require("../misc/file");
const asset = require("../asset/main");
const get = require("../misc/get");
const {
	THEME_FOLDER: themeFolder,
	CLIENT_URL2: source,
	XML_HEADER: header,
	STORE_URL2: store1
} = process.env;

const xml2js = require('xml2js');
const tts = require("../tts/main");
/**
 * @param {ReadableStream} readStream 
 * @returns {Promise<Buffer>}
 */
function stream2Buffer(readStream) {
	return new Promise((res, rej) => {
		let buffers = [];
		readStream.on("data", (c) => buffers.push(c));
		readStream.on("end", () => res(Buffer.concat(buffers)));
	});
}

function name2Font(font) {
	switch (font) {
		case "Blambot Casual":
			return "FontFileCasual";
		case "BadaBoom BB":
			return "FontFileBoom";
		case "Entrails BB":
			return "FontFileEntrails";
		case "Tokyo Robot Intl BB":
			return "FontFileTokyo";
		case "Accidental Presidency":
			return "FontFileAccidental";
		case "BodoniXT":
			return "FontFileBodoniXT";
		case "Budmo Jiggler":
			return "FontFileBJiggler";
		case "Budmo Jigglish":
			return "FontFileBJigglish";
		case "Existence Light":
			return "FontFileExistence";
		case "HeartlandRegular":
			return "FontFileHeartland";
		case "Honey Script":
			return "FontFileHoney";
		case "I hate Comic Sans":
			return "FontFileIHate";
		case "Impact Label":
			return "FontFileImpactLabel";
		case "loco tv":
			return "FontFileLocotv";
		case "Mail Ray Stuff":
			return "FontFileMailRay";
		case "Mia's Scribblings ~":
			return "FontFileMia";
		case "Shanghai":
			return "FontFileShanghai";
		case "Comic Book":
			return "FontFileComicBook";
		case "Wood Stamp":
			return "FontFileWoodStamp";
		case "Brawler":
			return "FontFileBrawler";
		case "Coming Soon":
			return "FontFileCSoon";
		case "Glegoo":
			return "FontFileGlegoo";
		case "Lilita One":
			return "FontFileLOne";
		case "Telex Regular":
			return "FontFileTelex";
		case "Claire Hand":
			return "FontFileClaireHand";
		case "Oswald":
			return "FontFileOswald";
		case "Poiret One":
			return "FontFilePoiretOne";
		case "Raleway":
			return "FontFileRaleway";
		case "Bangers":
			return "FontFileBangers";
		case "Creepster":
			return "FontFileCreepster";
		case "BlackoutMidnight":
			return "FontFileBlackoutMidnight";
		case "BlackoutSunrise":
			return "FontFileBlackoutSunrise";
		case "Junction":
			return "FontFileJunction";
		case "LeagueGothic":
			return "FontFileLeagueGothic";
		case "LeagueSpartan":
			return "FontFileLeagueSpartan";
		case "OstrichSansMedium":
			return "FontFileOstrichSansMedium";
		case "Prociono":
			return "FontFileProciono";
		case "Lato":
			return "FontFileLato";
		case "Alegreya Sans SC":
			return "FontFileAlegreyaSansSC";
		case "Barrio":
			return "FontFileBarrio";
		case "Bungee Inline":
			return "FontFileBungeeInline";
		case "Bungee Shade":
			return "FontFileBungeeShade";
		case "Gochi Hand":
			return "FontFileGochiHand";
		case "IM Fell English SC":
			return "FontFileIMFellEnglishSC";
		case "Josefin":
			return "FontFileJosefin";
		case "Kaushan":
			return "FontFileKaushan";
		case "Lobster":
			return "FontFileLobster";
		case "Montserrat":
			return "FontFileMontserrat";
		case "Mouse Memoirs":
			return "FontFileMouseMemoirs";
		case "Patrick Hand":
			return "FontFilePatrickHand";
		case "Permanent Marker":
			return "FontFilePermanentMarker";
		case "Satisfy":
			return "FontFileSatisfy";
		case "Sriracha":
			return "FontFileSriracha";
		case "Teko":
			return "FontFileTeko";
		case "Vidaloka":
			return "FontFileVidaloka";
		case "":
		case null:
			return "";
		default:
			return `FontFile${font}`;
	}
}

module.exports = {
	/**
	 * @param {Buffer} xmlBuffer 
	 * @returns 
	 */
	async extractAudioTimes(xmlBuffer) {
		const film = new XmlDocument(xmlBuffer);
		let audios = [];
		for (const eI in film.children) {
			const elem = film.children[eI];
			if (elem.name == "sound") {
				const file = elem.childNamed("sfile")?.val;
				if (file) audios.push(elem);
			}
		}
		return audios.map((v) => {
			const pieces = v.childNamed("sfile").val.split(".");
			const themeId = pieces[0];
			
			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, "sound");
			let filepath;
			if (themeId == "ugc") filepath = `${asset.folder}/${pieces[pieces.length - 1]}`;
			else filepath = `./static/2010/store/${pieces.join("/")}`;
			return {
				filepath,
				start: +v.childNamed("start").val,
				stop: +v.childNamed("stop").val,
				trimStart: +v.childNamed("trimStart")?.val || 0,
				trimEnd: +v.childNamed("trimEnd")?.val || 0,
				fadeIn: {
					duration: +v.childNamed("fadein").attr.duration,
					vol: +v.childNamed("fadein").attr.vol
				},
				fadeOut: {
					duration: +v.childNamed("fadeout").attr.duration,
					vol: +v.childNamed("fadeout").attr.vol
				}
			}
		});
	},
	packMovieFromUrl(url) { // Reads an XML buffer from a url, decodes the elements, and returns a PK stream the LVM can parse.
		return new Promise(async (res, rej) => {
			const ext = url.split("?")[0].substr(url.lastIndexOf(".") + 1);
			function parseXml(buffer) {
				const parser = new xml2js.Parser();
				const zip = nodezip.create();
				const themes = [];
				let ugc = `${header}<theme id="ugc">`;
				fUtil.addToZip(zip, 'movie.xml', buffer);
				const store = "https://raw.githubusercontent.com/octanuary/GoAnimate-Archive/main/store/3a981f5cb2739137";
				function addType2Filearray(file, type) {
					const pieces = file.split(".");
					const themeId = pieces[0];
					if (!themes.find(i => i == themeId)) themes.push(themeId);
					pieces.splice(1, 0, type);
					const ext = pieces[pieces.length - 1];
					pieces.splice(pieces.length - 1, 1);
					pieces[pieces.length - 1] += `.${ext}`;
					return pieces;
				}
				async function basicParse(file, type, info = {}) {
					try {
						let filearray = addType2Filearray(file, type);
						if (type == "sound" && filearray[0] == "ugc" && info._attributes.tts == "1") {
							const ttsdata = info.ttsdata[0];
							filearray = addType2Filearray(file, ttsdata.type[0]);
							const buffer = await tts.genVoice4Qvm(ttsdata.voice[0].split("_")[0], ttsdata.text[0], true);
							tempbuffer.set(filearray[2], buffer);
							ugc += asset.meta2Xml({
								type: "sound",
								subtype: ttsdata.type[0],
								id: filearray[2],
								duration: await getMP3Duration(buffer)
							})
						} else {
							let filename = filearray.join(".");
							if (type == "char" && info.geartype) switch (info.geartype) {
								case "head": {
									filename = filename.split(type).join("prop");
									break;
								} default: {
									filearray[1] = info.geartype;
									filename = filearray.join(".");
									break;
								}
							}
							if (!zip[filename]) {
								console.log(filename);
								fUtil.addToZip(zip, filename, await getBuffersOnline(`${store}/${filearray.join("/")}`));
							}
						}
					} catch (e) {
						rej(e);
					}
				}
				parser.parseString(buffer, async (err, json) => {
					try {
						if (err) rej(err);
						else {
							if (
								!json.film || (!json.film.scene && !json.film.sound)
							) rej("The link to the xml you provided does not support the Legacy Video Player");
							for (const i in json.film) {
								if (i.startsWith("_") || i == "meta") continue;
								for (const info of json.film[i]) {
									if (i == "sound") {
										if (!info.sfile[0]) continue;
										await basicParse(info.sfile[0], i, info);
									} else for (const i in info) {
										const altNames = {
											effectAsset: "effect"
										}
										if (i.startsWith("_")) continue;
										for (const info1 of info[i]) {
											switch (i) {
												case "char": {
													if (!info1.action[0]._text) continue;
													const filearray = addType2Filearray(info1.action[0]._text, i);
													const themeId = filearray[0];
													const charId = filearray[2];
													if (themeId == "ugc") {
														filearray.splice(3, 1);
														if (!zip[filearray.join(".") + ".xml"]) {
															const buffer = await char.load(charId);
															ugc += asset.meta2Xml({
																type: "char",
																id: charId,
																themeId: char.getTheme(buffer)
															});
															fUtil.addToZip(zip, filearray.join(".") + ".xml", buffer);
														}
													} else {
														await basicParse(info1.action[0]._text, i);
														for (const type of ["head", "prop"]) {
															if (info1[type]) {
																if (info1[type][0].file) await basicParse(info1[type][0].file[0], i, {
																	geartype: type
																})
															}
														}
													}
													break;
												} default: {
													if (!info1.file) continue;
													await basicParse(info1.file[0], altNames[i] || i);
													break;
												}
											}
										}
									}
								}
							}
						}
						for (const t of themes) {
							if (t == "ugc" || zip[`${t}.xml`]) continue;
							const file = await getBuffersOnline(
								`https://raw.githubusercontent.com/GoAnimate-Wrapper/GoAnimate-Wrapper/master/_THEMES/${t}.xml`
							);
							fUtil.addToZip(zip, `${t}.xml`, file);
						}
						fUtil.addToZip(zip, "themelist.xml", Buffer.from(`${header}<themes>${
							themes.map((t) => `<theme>${t}</theme>`).join("")
						}</themes>`));
						fUtil.addToZip(zip, "ugc.xml", Buffer.from(ugc + "</theme>"));
						//console.log(zip);
						res(await zip.zip());
					} catch (e) {
						rej(e);
					}
				});
			}
			switch (ext) {
				case "xml": {
					parseXml(await getBuffersOnline(url));
					break;
				} case "zip": {
					async function attemptFileUnzip(buffer) {
						async function ttsBufferDump(json) {
							for (const elem of json.childrenNamed("sound")) {
								if (elem.attr.tts == "1") try {
									const file = elem.childNamed("sfile")?.val;
									if (!file || tempbuffer.get(file.substr(4))) continue;
									const ttsdata = elem.lastChild;
   									if (ttsdata.childNamed("voice") && ttsdata.childNamed("text")) {
										tempbuffer.set(file.substr(4), await tts.genVoice4Qvm(
											ttsdata.childNamed("voice").val.split("_")[0], ttsdata.childNamed("text").val, true
										));
									}
								} catch (e) {
									console.log(e);
								}
							}
						}
						async function movieXmlExists(zip, callback) {
							if (zip['movie.xml']) await callback();
							else rej(
								`The url to the zip file you typed in does not not contain the movie.xml 
								file which is needed to play the video.`
							)
						}
						async function mutipleFileExist(zip, buffer, callback) {
							if (zip['movie.xml'] && Object.keys(zip).length == 1) parseXml(buffer);
							else {
								const json = new XmlDocument(buffer);
								await ttsBufferDump(json);
								await callback();
							}
						}
						try {
							const zip = nodezip.unzip(buffer);
							await movieXmlExists(zip, async () => {
								await mutipleFileExist(zip, await stream2Buffer(zip['movie.xml'].toReadStream()), async () => {
									res(await zip.zip());
								})
							});
						} catch (e) {
							console.log(e);
							const zip = nodezip.create();
							const zip1 = await JSZip.loadAsync(buffer);
							await movieXmlExists(zip1.files, async () => {
								await mutipleFileExist(zip1.files, await zip1.file("movie.xml").async("nodebuffer"), async () => {
									for (const i in zip1.files) fUtil.addToZip(zip, i, await zip1.file(i).async("nodebuffer"));
									res(await zip.zip());
								});
							})
						}
					}
					try {
						await attemptFileUnzip(await getBuffersOnline(url));
					} catch (e) {
						console.log(e);
						try {
							fs.writeFileSync(`${asset.tempFolder}/zip.zip`, await getBuffersOnlineViaRequestModule({
								method: "get",
								url
							}));
							const data = fs.readFileSync(`${asset.tempFolder}/zip.zip`);
							res(data.subarray(data.indexOf(80)));
						} catch (e) {
							rej(e);
						}
					}
					break;
				} default: return rej("Please enter in a valid url to a xml or zip file.");
			}
		})
	},
	/**
	 * @summary Reads an XML buffer, decodes the elements, and returns a PK stream the LVM can parse.
	 * @param {Buffer} xmlBuffer
	 * @param {string} uId
	 * @param {boolean} packThumb
	 * @param {string} mId
	 * @param {Array} ownAssets
	 * @returns {Buffer}
	 */
	async packMovie(xmlBuffer, data = {}, packThumb = false, ownAssets = []) {
		if (xmlBuffer.length == 0) throw null;
		const uid = data.movieOwnerId || data.userId;
		const zip = nodezip.create();
		/** @type {Record<string, boolean>} */
		const themes = { common: true };
		var ugc = `${header}<theme id="ugc">`;
		fUtil.addToZip(zip, "movie.xml", xmlBuffer);
		const store = data.v ? `https://file.garden/ZP0Nfnn29AiCnZv5/static/2010/store` : data.storePath4Parser || store1;
		/**
		 * why not just merge em together they're all similar anyway
		 * @param {string} file 
		 * @param {string} type 
		 */
		async function basicParse(file, type) {
			const pieces = file.split(".");
			const themeId = pieces[0];
			
			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, type);
			const user = JSON.parse(fs.readFileSync(asset.folder + '/users.json')).users.find(i => i.id == uid);
			const filename = pieces.join(".");
			if (themeId == "ugc") {
				const id = pieces[2];
				try {
					const buffer = asset.load(id);
					// add asset meta
					const assetMeta = (!ownAssets[0] ? user.assets : ownAssets).find(i => i.id == id);
					if (!assetMeta) console.log(`Asset #${id} is in the XML, but it does not exist.`);
					else ugc += asset.meta2Xml(assetMeta);
					// and add the file
					fUtil.addToZip(zip, filename, buffer);
				} catch (e) {
					console.log(`WARNING: ${id}:`, e);
				}
			} else {
				if (type == "prop" && pieces.indexOf("head") > -1) pieces[1] = "char";
				const filepath = `${store}/${pieces.join("/")}`;
				// add the file to the zip
				fUtil.addToZip(zip, filename, await get(filepath));
			}
			themes[themeId] = true;
		}
	
		// begin parsing the movie xml
		const film = new XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			const elem = film.children[eI];
	
			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
					
					await basicParse(file, elem.name)
					break;
				} case "scene": {
					for (const e2I in elem.children) {
						const elem2 = elem.children[e2I];
	
						let tag = elem2.name;
						// change the tag to the one in the store folder
						if (tag == "effectAsset") tag = "effect";
	
						switch (tag) {
							case "durationSetting":
							case "trans":
								break;
							case "bg":
							case "effect":
							case "prop": {
								const file = elem2.childNamed("file")?.val;
								if (!file) continue;
								
								await basicParse(file, tag);
								break;
							} case "char": {
								let file = elem2.childNamed("action")?.val;
								if (!file) continue;
								const pieces = file.split(".");
								const themeId = pieces[0];
	
								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
		
								if (themeId == "ugc") {
									// remove the action from the array
									pieces.splice(3, 1);
	
									const id = pieces[2];
									try {
										const charXml = await char.load(id);
										const filename = pieces.join(".");
	
										ugc += asset.meta2Xml({
											// i can't just select the character data because of stock chars :(
											id,
											type: "char",
											themeId: char.getTheme(charXml)
										});
										fUtil.addToZip(zip, filename + ".xml", charXml);
									} catch (e) {
										console.log(`WARNING: ${id}:`, e);
										continue;
									}
								} else {
									const filepath = `${store}/${pieces.join("/")}`;
									const filename = pieces.join(".");
	
									fUtil.addToZip(zip, filename, await get(filepath));
								}
	
								for (const e3I in elem2.children) {
									const elem3 = elem2.children[e3I];
									if (!elem3.children) continue;
	
									// add props and head stuff
									file = elem3.childNamed("file")?.val;
									if (!file) continue;
									const pieces2 = file.split(".");
	
									// headgears and handhelds
									if (elem3.name != "head") {
										await basicParse(file, "prop");
									} else { // heads
										// i used to understand this
										// i'll look back on it and explain when i'm in the mood to refactor this
										if (pieces2[0] == "ugc") continue;
										pieces2.pop(), pieces2.splice(1, 0, "char");
										const filepath = `${store}/${pieces2.join("/")}.swf`;
										pieces2.splice(1, 1, "prop");
										const filename = `${pieces2.join(".")}.swf`;
										fUtil.addToZip(zip, filename, await get(filepath));
									}
	
									themes[pieces2[0]] = true;
								}
	
								themes[themeId] = true;
								break;
							}
	
							case 'bubbleAsset': {
								const bubble = elem2.childNamed("bubble");
								const text = bubble.childNamed("text");
								const filename = `${name2Font(text.attr.font)}.swf`;
								const filepath = `${source}/go/font/${filename}`;
								fUtil.addToZip(zip, filename, await get(filepath));
								break;
							}
						}
					}
					break;
				}
			}
		}
	
		if (themes.family) {
			delete themes.family;
			themes.custom = true;
		}
		
		if (themes.cctoonadventure) {
			delete themes.cctoonadventure;
			themes.toonadv = true;
		}
	
		if (themes.cc2) {
			delete themes.cc2;
			themes.action = true;
		}
	
		const themeKs = Object.keys(themes);
		for (const t of themeKs) {
			if (t == "ugc") continue;
			const file = await get(`${store}/${t}/theme.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		}
	
		fUtil.addToZip(zip, "themelist.xml", Buffer.from(
			`${header}<themes>${themeKs.map((t) => `<theme>${t}</theme>`).join("")}</themes>`
		));
		fUtil.addToZip(zip, "ugc.xml", Buffer.from(ugc + "</theme>"));
		if (packThumb) {
			fUtil.addToZip(zip, "thumbnail.png", packThumb);
		}
		return await zip.zip();
	},
	/**
	 * @summary Unpacks a movie using a PK stream the lvm generated and save the movie locally
	 * @param {nodezip.ZipFile} body
	 * @param {string} mId
	 * @param {string} uId
	 * @returns {Buffer}
	 */
	async unpackMovie(body, mId, uId) {
		const zip = nodezip.unzip(body);
		const readStream = zip["movie.xml"].toReadStream();
		const buffer = await stream2Buffer(readStream);
		if (buffer.length == 0) throw null;
		const film = new XmlDocument(buffer);
		const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
		const userInfo = json.users.find(i => i.id == uId);
		const onlineMoviePrefixes = {
			ft: true
		}
		if (onlineMoviePrefixes[mId.substr(0, mId.lastIndexOf("-"))]) {
			for (const eI of film.children) switch (eI.name) {
				case "sound": {
					for (const e2I of eI.children.filter(i => i.name == "sfile")) {
						if (e2I.val.startsWith("ugc.") && !fs.existsSync(`./_ASSETS/${e2I.val.split("ugc.")[1]}`)) {
							console.log(`Saving Sound ${e2I.val.split("ugc.")[1]}.`)
							let buffer;
							if (mId.startsWith("ft-")) buffer = await getBuffersOnline({
								hostname: "flashthemes.net",
								path: `/goapi/getAsset/${e2I.val.split("ugc.")[1]}`,
								headers: {
									"Content-Type": "audio/mp3"
								}
							});
							fs.writeFileSync(`./_ASSETS/${e2I.val.split("ugc.")[1]}`, buffer);
							userInfo.assets.unshift({
								id: e2I.val.split("ugc.")[1],
								enc_asset_id: e2I.val.split("ugc.")[1].split(".")[0],
								type: "sound",
								subtype: eI.attr.tts == "1" ? "voiceover" : eI.attr.track == "1" ? "bgmusic" : "soundeffect",
								title: e2I.val.split("ugc.")[1],
								published: 0,
								tags: "",
								duration: await getMP3Duration(buffer),
								downloadtype: "progressive",
								file: e2I.val.split("ugc.")[1]
							})
							console.log(`Saved Sound ${e2I.val.split("ugc.")[1]} successfully!`)
						}
					}
					break;
				} case "scene": {
					for (const e2I of eI.children) {
						switch (e2I.name) {
							case "bg":
							case "prop": {
								for (const e3I of e2I.children.filter(i => i.name == "file")) {
									if (e3I.val.startsWith("ugc.") && !fs.existsSync(`./_ASSETS/${e3I.val.split("ugc.")[1]}`)) {
										console.log(`Saving ${e2I.name} ${e3I.val.split("ugc.")[1]}.`)
										let buffer;
										if (mId.startsWith("ft-")) buffer = await getBuffersOnline(`https://flashthemes.net/goapi/getAsset/${
											e3I.val.split("ugc.")[1]
										}`);
										fs.writeFileSync(`./_ASSETS/${e3I.val.split("ugc.")[1]}`, buffer);
										userInfo.assets.unshift({
											id: e3I.val.split("ugc.")[1],
											enc_asset_id: e3I.val.split("ugc.")[1].split(".")[0],
											type: e2I.name,
											subtype: 0,
											title: e3I.val.split("ugc.")[1],
											published: 0,
											tags: "",
											file: e3I.val.split("ugc.")[1]
										})
										console.log(`Saved ${e2I.name} ${e3I.val.split("ugc.")[1]} successfully!`)
									}
								}
								break;
							} case "char": {
								for (const e3I of e2I.children.filter(i => i.name == "action")) {
									if (e3I.val.startsWith("ugc.c-")) try {
										const charId = e3I.val.split("ugc.")[1].split(".")[0]
										if (!fs.existsSync(fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]))) {
											console.log(`Saving Character ${charId}.`)
											let buffer;
											if (mId.startsWith("ft-")) {
												function getFlashThemesCharThumb() {
													return new Promise((res, rej) => {
														https.get('https://flashthemes.net/char_thumbs/' + charId + '.png', r => {
															const buffers = [];
															r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
														})
													})
												}
												fs.writeFileSync(
													fUtil.getFileIndex("char-", ".png", charId.split("-")[1]), await getFlashThemesCharThumb()
												);
												buffer = (await getBuffersOnlineViaRequestModule({
													method: "post",
													url: "https://flashthemes.net/goapi/getCcCharCompositionXml/"
												}, { 
													formData: { 
														assetId: charId
													} 
												})).toString().substr(1)
											}
											fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]), buffer);
											userInfo.assets.unshift({
												id: charId,
												enc_asset_id: charId,
												type: "char",
												subtype: 0,
												title: "Untitled",
												themeId: char.getTheme(buffer),
												published: 0,
												tags: "",
												file: fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]).split("./_SAVED/")[1]
											})
											console.log(`Saved Character ${charId} successfully!`)
										}
									} catch (e) {
										console.log(e);
									} else if (e3I.val.startsWith("ugc.") && e3I.val.endsWith(".swf")) return {
										error: "Your video cannot be saved correctly because it includes a char from the FlashThemes Community Library that GoNexus can't put onto the database. Please try converting a video that does not include chars from FlashThemes's Community Library."
									}
								}
								break;
							}
						}
					} 
					break;
				}
			}
			console.log("All FlashThemes assets that were in the XML were successfully saved!")
		}
		fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
		return buffer;
	},
	getStuffForOldStockChar(buf, data, tId) {
		return new Promise(async (res, rej) => {
			const ziporxml = data.studio == "2010" ? ".zip" : ".xml"
			const charJSON = {
				xmls: '',
				defaults: ''
			};
			let groupEmotionXml = '<category name="emotion">';
			const xml = new XmlDocument(fs.readFileSync(`./static/2010/store/cc_store/${tId}/cc_theme.xml`));
			for (const info of xml.children.filter(i => i.name == "bodyshape")) {
				if (info.attr.id == char.getCharTypeViaBuff(buf)) {
					charJSON.defaults = `default="${info.attr.action_thumb + ziporxml}" motion="${
						info.attr.default_motion + ziporxml
					}"`;
					for (const data of info.children.filter(i => i.name == "action")) {
						if (data.attr.category && data.attr.category == "emotion") groupEmotionXml +=  `<${
							data.attr.is_motion == "Y" ? 'motion' : 'action'
						} id="${data.attr.id + ziporxml}" name="${data.attr.name}" loop="${
							data.attr.loop
						}" totalframe="${
							data.attr.totalframe
						}" enable="${data.attr.enable}" is_motion="${data.attr.is_motion}"/>`
						else charJSON.xmls += `<${
							data.attr.is_motion == "Y" ? 'motion' : 'action'
						} id="${data.attr.id + ziporxml}" name="${data.attr.name}" loop="${
							data.attr.loop
						}" totalframe="${
							data.attr.totalframe
						}" enable="${data.attr.enable}" is_motion="${data.attr.is_motion}"/>`
					}
				}
			}
			charJSON.xmls += groupEmotionXml + '</category>';
			for (const info of xml.children.filter(i => i.name == "facial")) {
				charJSON.xmls += `<facial id="${info.attr.id + ziporxml}" name="${info.attr.name}" enable="${info.attr.enable}"/>`
			}
			charJSON.xmls = charJSON.xmls.toString("utf-8");
			res(charJSON);
		});
	},
	/**
	 * @summary Checks to see if any audio exists in the xml as the current exporter does not have audio yet
	 * @param {Buffer} xmlBuffer
	 * @returns {Boolean}
	 */
	check4XmlAudio(xmlBuffer) {
		if (xmlBuffer.length == 0) throw null;

		const xml = new XmlDocument(xmlBuffer);

		for (const eI in xml.children) {
			const elem = xml.children[eI];
			if (elem.name == "sound") return true;
		}
		return false;
	},
	getThemes(options = {}) {
		const xml = fs.readFileSync(`${themeFolder}/themelist.xml`);
		if (options.get_theme_xml) {
			if (options.value) {
				const path = `${themeFolder}/${options.value}.xml`
				if (fs.existsSync(path)) return fs.readFileSync(path);
				return `Sorry, the theme xml file for ${options.value} does not exist.`;
			}
			return xml;
		}
		const json = new XmlDocument(xml);
		const themes = !options.no_extras ? JSON.parse(fs.readFileSync(`${themeFolder}/themelist-extras.json`)) : [];
		if (!options.only_include_extras) for (const elem of json.children) {
			if (elem.name == "theme") themes.push(elem);
		}
		if (options.arrayAction && options.by && options.value) return themes[options.arrayAction](i => i.attr[options.by] == options.value);
		return themes;
	},
	async deleteTTSFiles(xmlBuffer, uId, xmlBuffer2) {
		if (!xmlBuffer || xmlBuffer.length == 0 || xmlBuffer2 != '1' && xmlBuffer2.length == 0) throw null;

		// this is common in this file
		async function basicParse(file, type) {
			const pieces = file.split(".");
			const themeId = pieces[0];

			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, type);

			if (themeId == "ugc") {
				const id = pieces[2];
				try {
					const json = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`)).users.find(i => i.id == uId).assets.find(
						i => i.id == id
					);
					if (json && json.type == "sound" && json.subtype == "tts") asset.delete({
						userId: uId,
						assetId: id
					});
				} catch (e) {
					console.log(`WARNING: ${id}:`, e);
					return {
						error: `WARNING: ${id}: ${e}`
					};
				}
			}
		}
		// begin parsing the movie xml
		async function del(film) {
			if (film) for (const eI in film.children) {
				const elem = film.children[eI];
				switch (elem.name) {
					case "sound": {
						const file = elem.childNamed("sfile")?.val;
						if (!file) continue;
						return await basicParse(file, elem.name);
					}
				}
			}
		}
		for (const stuff of [
			new XmlDocument(xmlBuffer),
			xmlBuffer2 != "1" ? new XmlDocument(xmlBuffer2) : undefined
		]) await del(stuff)
	},
};
