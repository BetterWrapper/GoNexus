const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
const xmldoc = require("xmldoc");
const char = require("../character/main");
const fUtil = require("../misc/file");
const asset = require("../asset/main");
const get = require("../misc/get");
const {
	THEME_FOLDER: themeFolder,
	CLIENT_URL2: source,
	XML_HEADER: header,
	STORE_URL2: store
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
	/**
	 * @summary Reads an XML buffer, decodes the elements, and returns a PK stream the LVM can parse.
	 * @param {Buffer} xmlBuffer
	 * @param {string} uId
	 * @param {Buffer} packThumb
	 * @param {string} mId
	 * @param {string} ownAssets
	 * @returns {Buffer}
	 */
	async packMovie(xmlBuffer, uId, packThumb, mId, ownAssets) {
		if (xmlBuffer.length == 0) throw null;

		const zip = nodezip.create();
		const themes = { common: true };
		var ugc = `${header}<theme id="ugc" name="ugc">`;
		fUtil.addToZip(zip, "movie.xml", xmlBuffer);

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

								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
	
								if (themeId == "ugc") {
									// remove the action from the array
									pieces.splice(3, 1);

									const id = pieces[2];
									try {
										const buffer = await char.load(id);
										const filename = pieces.join(".");

										ugc += asset.meta2Xml({
											// i can't just select the character data because of stock chars
											id: id,
											type: "char",
											themeId: char.getTheme(buffer)
										});
										fUtil.addToZip(zip, filename + ".xml", buffer);
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
		if (packThumb != false) {
			if (mId.startsWith("m-")) fUtil.addToZip(zip, 'thumbnail.png', fs.readFileSync(fUtil.getFileIndex("thumb-", ".png", mId.substr(2))));
			else if (mId.startsWith("s-")) fUtil.addToZip(zip, 'thumbnail.png', fs.readFileSync(fUtil.getFileIndex("starter-", ".png", mId.substr(2))));
		}
		return await zip.zip();
	},
	/**
	 * @summary Given a PK stream from the LVM, returns an XML buffer to save locally.
	 * @param {nodezip.ZipFile} zipFile
	 * @param {Buffer} thumb
	 * @param {{[aId:string]:Buffer}} assetBuffers
	 * @returns {Promise<Buffer>}
	 */
	async unpackMovie(body) {
		const zip = nodezip.unzip(body);
		const readStream = zip["movie.xml"].toReadStream();
		const buffer = await stream2Buffer(readStream);
		return buffer;
	},
	/**
	 * @summary Checks to see if any audio exists in the xml as the current exporter does not have audio yet
	 * @param {Buffer} xml
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
		const xml = new xmldoc.XmlDocument(fs.readFileSync(`${themeFolder}/_themelist.xml`));
		const themes = [];
		for (const elem of xml.children) {
			if (elem.name == "theme") themes.push(elem);
		}
		return themes;
	}
};
