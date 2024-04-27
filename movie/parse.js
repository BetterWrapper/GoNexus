const fs = require("fs");
const nodezip = require("node-zip");
const mp3Duration = require("mp3-duration");
const https = require("https");
const request = require("request");
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
const xmldoc = require("xmldoc");
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
	async extractAudioTimes(xmlBuffer) {
		const film = new xmldoc.XmlDocument(xmlBuffer);
		let audios = [];

		for (const eI in film.children) {
			const elem = film.children[eI];

			if (elem.name !== "sound") continue;
			audios.push(elem);
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
			else filepath = `${store1}/${pieces.join("/")}`;

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
	/**
	 * @summary Reads an XML buffer, decodes the elements, and returns a PK stream the LVM can parse.
	 * @param {Buffer} xmlBuffer
	 * @param {string} uId
	 * @param {boolean} packThumb
	 * @param {string} mId
	 * @param {Array} ownAssets
	 * @returns {Buffer}
	 */
	async packMovie(xmlBuffer, data, packThumb, mId, ownAssets) {
		if (xmlBuffer.length == 0) throw null;
		const store = data.v ? "https://file.garden/ZP0Nfnn29AiCnZv5/static/store" : store1;
		const zip = nodezip.create();
		const themes = { common: true };
		var ugc = `${header}<theme id="ugc" name="ugc">`;
		fUtil.addToZip(zip, "movie.xml", xmlBuffer);
		const uId = data.movieOwnerId || data.userId;
		// this is common in this file
		async function basicParse(file, type, subtype) {
			const pieces = file.split(".");
			const themeId = pieces[0];

			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, type);

			const filename = pieces.join(".");
			if (themeId == "ugc") {
				const id = pieces[2];
				try {
					const buffer = asset.load(id);

					// add asset meta
					ugc += asset.meta2Xml(ownAssets ? ownAssets.find(i => i.id == id) : JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == uId).assets.find(i => i.id == id));
					// and add the file
					fUtil.addToZip(zip, filename, buffer);

					/* add video thumbnails
					if (type == "prop" && subtype == "video") {
						pieces[2] = pieces[2].slice(0, -3) + "png";
						const filename = pieces.join(".")
						const buffer = asset.load(pieces[2]);
						fUtil.addToZip(zip, filename, buffer);
					}
					*/
				} catch (e) {
					console.error(`WARNING: ${id}:`, e);
					return;
				}
			} else {
				const filepath = `${store}/${pieces.join("/")}`;

				// add the file to the zip
				fUtil.addToZip(zip, filename, await get(filepath));
			}

			themes[themeId] = true;
		}

		// begin parsing the movie xml
		const film = new xmldoc.XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			const elem = film.children[eI];

			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
				
					await basicParse(file, elem.name)
					break;
				}

				case "scene": {
					for (const e2I in elem.children) {
						const elem2 = elem.children[e2I];

						let tag = elem2.name;
						// change the tag to the one in the store folder
						if (tag == "effectAsset") tag = "effect";

						switch (tag) {
							case "durationSetting": break;
							case "trans": break;
							case "bg":
							case "effect":
							case "prop": {
								const file = elem2.childNamed("file")?.val;
								if (!file) continue;

								await basicParse(file, tag, elem2.attr.subtype);
								break;
							}
						
							case "char": {
								let file = elem2.childNamed("action")?.val;
								if (!file) continue;
								const pieces = file.split(".");
								const themeId = pieces[0];
								const action = pieces[2];
								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
								console.log(action);
								if (themeId == "ugc") {
									// remove the action from the array
									pieces.splice(3, 1);

									const id = pieces[2];
									try {
										const buffer = await char[data.v == "2010" ? 'packZip' : 'load'](data.v == "2010" ? {
											assetId: id,
											userId: uId,
											action
										} : id);
										const filename = data.v == "2010" ? file : pieces.join(".") + ".xml"
										console.log(filename)
										ugc += await asset[data.v == "2010" ? 'meta2OldXml' : 'meta2Xml']({
											// i can't just select the character data because of stock chars
											id,
											type: "char",
											themeId: char.getTheme(data.v == "2010" ? await char.load(id) : buffer),
											data
										});
										fUtil.addToZip(zip, filename, buffer);
									} catch (e) {
										console.error(`WARNING: ${id}:`, e);
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
									if (elem3.name != "head") await basicParse(file, "prop");
									else { // heads
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

								// arial doesn't need to be added
								if (text.attr.font == "Arial") continue;

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

		if (themes.cc2) {
			delete themes.cc2;
			themes.action = true;
		}

		const themeKs = Object.keys(themes);
		themeKs.forEach(t => {
			if (t == 'ugc') return;
			const file = fs.readFileSync(`${themeFolder}/${t}.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		});

		fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`${header}<themes>${themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));
		fUtil.addToZip(zip, 'ugc.xml', Buffer.from(ugc + `</theme>`));
		if (packThumb) {
			if (mId.startsWith("m-")) fUtil.addToZip(zip, 'thumbnail.png', fs.readFileSync(fUtil.getFileIndex("thumb-", ".png", mId.substr(2))));
			else if (mId.startsWith("s-")) fUtil.addToZip(zip, 'thumbnail.png', fs.readFileSync(fUtil.getFileIndex("starter-", ".png", mId.substr(2))));
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
		const film = new xmldoc.XmlDocument(buffer);
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
							console.log(`Saving Sound: ${e2I.val.split("ugc.")[1]}.`)
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
								subtype: "voiceover",
								title: e2I.val.split("ugc.")[1],
								published: 0,
								tags: "",
								duration: await getMP3Duration(buffer),
								downloadtype: "progressive",
								file: e2I.val.split("ugc.")[1]
							})
							console.log(`Saved Sound: ${e2I.val.split("ugc.")[1]} successfully!`)
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
										console.log(`Saving ${e2I.name}: ${e3I.val.split("ugc.")[1]}.`)
										let buffer;
										if (mId.startsWith("ft-")) buffer = await getBuffersOnline({
											hostname: "flashthemes.net",
											path: `/goapi/getAsset/${e3I.val.split("ugc.")[1]}`,
											headers: {
												"Content-Type": "audio/mp3"
											}
										});
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
										console.log(`Saved ${e2I.name}: ${e3I.val.split("ugc.")[1]} successfully!`)
									}
								}
								break;
							} case "char": {
								for (const e3I of e2I.children.filter(i => i.name == "action")) {
									const charId = e3I.val.split("ugc.")[1].split(".")[0]
									if (e3I.val.startsWith("ugc.c-")) {
										if (!fs.existsSync(fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]))) {
											console.log(`Saving Character: ${charId}.`)
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
												fs.writeFileSync(fUtil.getFileIndex("char-", ".png", charId.split("-")[1]), await getFlashThemesCharThumb());
												buffer = (await getBuffersOnlineViaRequestModule({
													method: "post",
													url: "https://flashthemes.net/goapi/getCcCharCompositionXml/"
												}, { 
													formData: { 
														assetId: charId
													} 
												})).split('0<?xml version="1.').join('<?xml version="1.');
											}
											fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]), buffer);
											userInfo.assets.unshift({
												id: charId,
												enc_asset_id: charId,
												type: "char",
												subtype: 0,
												title: "Untitled",
												themeId: char.getTheme(Buffer.from(buffer)),
												published: 0,
												tags: "",
												file: fUtil.getFileIndex("char-", ".xml", charId.split("-")[1]).split("./_SAVED/")[1]
											})
											console.log(`Saved Character: ${charId} successfully!`)
										}
									} else if (e3I.val.startsWith("ugc.") && e3I.val.endsWith(".swf")) {
										console.error("Your video cannot be saved correctly because it includes a char from the FlashThemes Community Library that GoNexus can't put onto the database. Please try converting a FlashThemes video that does not include chars from FlashThemes's Community Library.")
										return {
											error: "Your video cannot be saved correctly because it includes a char from the FlashThemes Community Library that GoNexus can't put onto the database. Please try converting a video that does not include chars from FlashThemes's Community Library."
										}
									}
								}
								break;
							}
						}
					} 
					break;
				}
			}
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
			const xml = new xmldoc.XmlDocument(fs.readFileSync(`./static/2010/store/cc_store/${tId}/cc_theme.xml`));
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

		const xml = new xmldoc.XmlDocument(xmlBuffer);

		for (const eI in xml.children) {
			const elem = xml.children[eI];
			if (elem.name == "sound") return true;
		}
		return false;
	},
	getThemes() {
		const xml = new xmldoc.XmlDocument(fs.readFileSync(`${themeFolder}/themelist.xml`));
		const themes = [];
		for (const elem of xml.children) {
			if (elem.name == "theme") themes.push(elem);
		}
		return themes;
	},
	async deleteTTSFiles(xmlBuffer, uId) {
		if (xmlBuffer.length == 0) throw null;

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
					const json = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`)).users.find(i => i.id == uId).assets.find(i => i.id == id);
					if (json.type == "sound" && json.subtype == "tts") asset.delete({
						userId: uId,
						assetId: id
					});
				} catch (e) {
					console.error(`WARNING: ${id}:`, e);
					return {
						error: `WARNING: ${id}: ${e}`
					};
				}
			}
		}
		// begin parsing the movie xml
		const film = new xmldoc.XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			const elem = film.children[eI];
			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
					return await basicParse(file, elem.name);
				}
			}
		}
	},
};
