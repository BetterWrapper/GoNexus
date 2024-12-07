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
let settings, moviearray = [], scenecache = [], cachedmovie = [];
function stream2buffer(r) {
	return new Promise((res, rej) => {
		const buffers = [];
		r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
	})
}
module.exports = {
	genxml(theme, c1, c2, textarray, charorders, cam, micids, times, id) {
		console.log(c1, c2);
		return new Promise((resolve, reject) => {
			moviearray = [];

			function xmlToJson(xmlString) {
				return new Promise((resolve, reject) => {
					const parser = new xml2js.Parser();
					parser.parseString(xmlString, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result);
						}
					});
				});
			}
			//Until then only use template1
			let scenetimes = times;
			let sound = 0;
			cachedmovie = [];
			scenecache = [];
			moviearray = [];
			let moviexml;
			console.log(theme);
			if (fs.existsSync(`./_TEMPLATES/${id}_${theme}.xml`)) {
				moviexml = fs.readFileSync(`./_TEMPLATES/${id}_${theme}.xml`).toString();
				settings = JSON.parse(fs.readFileSync(`./_TEMPLATES/${id}_${theme}.json`).toString());
			}
			else return reject("The selected template does not exist.")
			//let jObj = "";
			const xmlJs = require('xml-js');
			let scenejsoncache = [];
			xmlToJson(moviexml).then(async jsonOutput => {
				try {
					//Add the first scene timings
					for (let v of settings.toffset) {
						scenetimes.unshift(v);
					}
					//Add the last scene timings
					for (let v of settings.toffset_end) {
						scenetimes.push(v);
					}
					//The qvms will be a straight line of an xml! for now
					for (let i = 0; i < 5200; i++) {
						if (cachedmovie.join("").toString().includes("<sc")) {
							//console.log(cachedmovie.join(""), "also here");
							moviearray.push(cachedmovie.join("").slice(0, -3));
							cachedmovie = [];
							break;
						}
						else cachedmovie.push(moviexml.charAt(i));
					}
					//Meta all the scenes
					for (let number = 0; number < jsonOutput.film.scene.length; number++) {
						let ruffer = jsonOutput.film.scene[number];
						this.sceneMeta2Xml(ruffer, number);
					}
					//This vars is for the thingy!!
					let hasPassedStartPos = false;
					let hasPassedEndPos = false;
					let grrrrrr = [];
					let avaternum = 1133;
					let avatournum = 1134;
					let bum = 0;
					let swapnum1 = "1";
					let swapnum2 = "2";
					if (settings.swap == true) {
						swapnum1 = "2";
						swapnum2 = "1";
					}
					let sum = 0;
					for (let i = 0; i < scenetimes.length; i++) {
						sum = sum + scenetimes[i]; // The old math script didnt work. So I made one myself
					}
					//Time to generate for real
					for (let num = 0; num < scenetimes.length; num++) {
						let pson;
						if (num == settings.startPos && !hasPassedStartPos) {
							hasPassedStartPos = true;
						}
						//console.log(JSON.stringify(pson));
						function jsonToXml(jsonData) {
							const options = {
								compact: true,
								ignoreComment: true,
								spaces: 4
							};
							return xmlJs.js2xml(jsonData, options);
						}
						console.log(num, hasPassedEndPos);
						if (micids[num - settings.startPos] == undefined && hasPassedStartPos || hasPassedEndPos) {
							console.log("ended");
							hasPassedStartPos = false;
							hasPassedEndPos = true;
							bum++;
							console.log(settings.toffset_end[bum - 1]);
							if (settings.toffset_end[bum - 1] === undefined) {
								console.log("And we're out");
								//break;
							}
						}
						if (hasPassedStartPos) {
							if (charorders[num - settings.startPos] == swapnum1) {
								let scenepson;
								if (cam[num - settings.startPos] != "normal") {
									scenepson = await xmlToJson(scenecache[settings.char1camscene]);
								}
								else {
									scenepson = await xmlToJson(scenecache[settings.char1scene]);
								}
								grrrrrr.push(avaternum.toString());
								grrrrrr.push(avatournum.toString());
								for (const v in scenepson.scene.char) {
									if (scenepson.scene.char[v]._attributes.id == settings.avater1id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avaternum;
										maction[1] = c1;
										console.log(c1);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum2) {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP29817",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else {
												scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml";
											}
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
									if (scenepson.scene.char[v]._attributes.id == settings.avater2id) {
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avatournum;
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										maction[1] = c2;
										console.log(c2);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum1) {
											if (!scenepson.scene.char[v].head) {
												console.log("The qvm goes in here even when its not supposed to");
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP165678",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else {
												scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml";
											}
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
								}
								scenepson.scene._attributes.index = num;
								scenepson.scene._attributes.id = "SCENE" + num;
								scenepson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
								const xmlData = jsonToXml(scenepson);
								scenejsoncache.push(xmlData);
								avaternum += 2;
								avatournum += 2;
							}
							else {
								let scenepson;
								if (cam[num - settings.startPos] != "normal") {
									scenepson = await xmlToJson(scenecache[settings.char2camscene]);
								}
								else {
									scenepson = await xmlToJson(scenecache[settings.char2scene]);
								}
								grrrrrr.push(avaternum.toString());
								grrrrrr.push(avatournum.toString());
								for (const v in scenepson.scene.char) {
									if (scenepson.scene.char[v]._attributes.id == settings.avater1id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avaternum;

										maction[1] = c1;
										console.log(c1);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum2 && !scenepson.scene.char[v].head) {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP282778",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else {
												scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml";
											}
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
										//console.log(maction.join("."));
									}
									if (scenepson.scene.char[v]._attributes.id == settings.avater2id) {
										let maction = scenepson.scene.char[v].action[0]._text.toString().split(".");
										scenepson.scene.char[v]._attributes.id = "AVATOR" + avatournum;
										maction[1] = c2;
										console.log(c2);
										//Only make a head if it doesnt exist already
										if (charorders[num - settings.startPos] == swapnum1 && !scenepson.scene.char[v].head) {
											if (!scenepson.scene.char[v].head) {
												scenepson.scene.char[v].head = [];												
												scenepson.scene.char[v].head.push(
													{
														_attributes: {
															id: "PROP165678",
															raceCode: "1"
														},
														file: [
															"ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml"
														]
													});
											}
											else {
												console.log("char2");
												scenepson.scene.char[v].head[0].file[0] = "ugc." + maction[1] + ".head.head_" + textarray[num - settings.startPos] + ".xml";
											}
										}
										scenepson.scene.char[v].action[0]._text = maction.join(".");
									}
								}
								scenepson.scene._attributes.index = num;
								scenepson.scene._attributes.id = "SCENE" + num;
								scenepson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
								const xmlData = jsonToXml(scenepson);
								scenejsoncache.push(xmlData);
								avaternum += 2;
								avatournum += 2;
							}
						}
						else {
							if (!hasPassedEndPos) {
								pson = await xmlToJson(scenecache[num]);
									if (num != 0) {
										//Assign the correct chars
										for (const v in pson.scene.char) {
											if (pson.scene.char[v]._attributes.id == settings.avater1id) {
												let maction = pson.scene.char[v].action[0]._text.toString().split(".");
												maction[1] = c1;
												pson.scene.char[v].action[0]._text = maction.join(".");
												//console.log(maction.join("."));
											}
											if (pson.scene.char[v]._attributes.id == settings.avater2id) {
												let maction = pson.scene.char[v].action[0]._text.toString().split(".");
												maction[1] = c2;
												pson.scene.char[v].action[0]._text = maction.join(".");
											}
										}
									}
									pson.scene._attributes.index = num;
									pson.scene._attributes.id = "SCENE" + num;
									if (scenetimes[num] == 0.25 || scenetimes[num] == 0.5 || scenetimes[num] == 0.75)
									{
									pson.scene._attributes.adelay = scenetimes[num] * 24;
									}
									else
									{
									pson.scene._attributes.adelay = Math.round(scenetimes[num]) * 24;
									}
									const xmlData = jsonToXml(pson);
									scenejsoncache.push(xmlData);
								}
								else {
									let dson = await xmlToJson(scenecache[(settings.endPos - 1) + bum]);
									for (const v in dson.scene.char) {
										if (dson.scene.char[v]._attributes.id == settings.avater1id) {
											let maction = dson.scene.char[v].action[0]._text.toString().split(".");
											dson.scene.char[v]._attributes.id = "AVATOR" + avaternum;
											maction[1] = c1;
											dson.scene.char[v].action[0]._text = maction.join(".");
											//console.log(maction.join("."));
										}
										if (dson.scene.char[v]._attributes.id == settings.avater2id) {
											let maction = dson.scene.char[v].action[0]._text.toString().split(".");
											dson.scene.char[v]._attributes.id = "AVATOR" + avatournum;

											maction[1] = c2;
											dson.scene.char[v].action[0]._text = maction.join(".");
											//console.log(maction.join("."));
										}
									}
									dson.scene._attributes.index = num;
									dson.scene._attributes.id = "SCENE" + num;
									dson.scene._attributes.adelay = Math.round(settings.toffset_end[bum - 1]) * 24;
									const xmlData = jsonToXml(dson);
									scenejsoncache.push(xmlData);
								}
							}
						}
						//console.log(scenejsoncache);
						//console.log("poop", times);
						//Time for the cool thing people want, SOUNDNDUdyiesiuhdwogyftdwcuxei2wpuyfdtewsuiefpwdyftdewusipfeuwystfdrewyu
						//Add a placeholder sound for some reason idk
						if (settings.usesSong == "Y")
						{
						scenejsoncache.push(`<sound id="SOUND0" index="0" track="0" vol="0.75" tts="0">
						<sfile>${settings.song}</sfile>
						<start>1</start>
						<stop>${(sum * 72)}</stop>
						<trimEnd>${(sum * 72)}</trimEnd>
						<fadein duration="48" vol="1"/>
						<fadeout duration="48" vol="0"/>
						</sound>`);
						}
						scenejsoncache.push(`<sound id="SOUND2" index="1" track="0" vol="1" tts="1">
					<sfile>ugc.${micids[0]}</sfile>
					<start>${settings.audioOffset}</start>
					<stop>${(Math.round(times[settings.toffset.length]) * 24) + settings.audioOffset}</stop>
					<fadein duration="0" vol="0"/>
					<fadeout duration="0" vol="0"/>
					<ttsdata>
					<type><![CDATA[tts]]></type>
					<text><![CDATA[poop]]></text>
					<voice><![CDATA[joey1]]></voice>
					</ttsdata>
					</sound>`);
						sound = 4;
						let endingformat = settings.audioOffset;
						for (let i = 1; i < micids.length; i++) {
							scenejsoncache.push(`<sound id="SOUND${sound}" index="${i + 1}" track="0" vol="1" tts="1">
							<sfile>ugc.${micids[i]}</sfile>
							<start>${(Math.round(times[settings.toffset.length + i - 1]) * 24) + endingformat}</start>
							<stop>${(Math.round(times[settings.toffset.length + i]) * 24) + (times[settings.toffset.length + i - 1] * 24) + endingformat}</stop>
							<fadein duration="0" vol="0"/>
							<fadeout duration="0" vol="0"/>
							</sound>`);
							sound += 2;
							endingformat = (Math.round(times[settings.toffset.length + i - 1]) * 24) + endingformat;
						}
						let soundoffset = 2;
						let sceneoffset = settings.toffset.length;
						let owne = 1;
						let twro = 2;
						if (settings.swap) {
							//OMG SWAP FOR ONE CHARRRR
							owne = 2;
							twro = 1;
						}
						for (let i = 0; i < charorders.length; i++) {
							if (charorders[i] == "1") scenejsoncache.push(`<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${grrrrrr[soundoffset - owne]}</linkage>`);
							else if (charorders[i] == "2") scenejsoncache.push(`<linkage>SOUND${soundoffset},SCENE${sceneoffset}~~~AVATOR${grrrrrr[soundoffset - twro]}</linkage>`);
							soundoffset += 2;
							sceneoffset++;
						}
						fs.writeFileSync('./previews/template.xml', moviearray + scenejsoncache.join("") + "</film>");
						//console.log("ITS DONE!");
					} catch (e) {
						console.log(e);
						reject(e);
					}
				})
			resolve({ "success": true });
		});
	},
	/**
	 * Converts a movie scene into an xml. Puts it in the scene array: @var {array} scenearray
	 * @param {string} pson 
	 * @param {num} scenepos 
	 * @returns {fs.readStream}
	 */
	sceneMeta2Xml(v, num = 0) {
		const xmlJs = require('xml-js');
		function jsonToXml(jsonData) {
			const options = {
				compact: true,
				ignoreComment: true,
				spaces: 4
			};
			return xmlJs.js2xml(jsonData, options);
		}
		//if (num != 0) v.char[0]._attributes.id = "AVATER121";
		//if (num != 0) v.char[1]._attributes.id = "AVATER122";
		let xnl = jsonToXml({ scene: v });
		scenecache.push(xnl);
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
