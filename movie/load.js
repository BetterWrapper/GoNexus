const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");
const fUtil = require("../misc/file");
const formidable = require("formidable");
let userId = null;
const path = require("path");
const tts = require("../tts/main");
const asset = require("../asset/main");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
const { exec } = require('child_process');
const fs = require("fs");
const parse = require("./parse");
const mp3Duration = require("mp3-duration");
const templateAssets = [];
function getMp3Duration(buffer) {
	return new Promise((res, rej) => {
		mp3Duration(buffer, (e, d) => {
			var dur = d * 1e3;
			if (e || !dur) rej(e || "Unable to retreive file duration");
			else res(dur);
		});
	})
}
const nodezip = require("node-zip");
const session = require("../misc/session");
const https = require("https");
const framerate = 24;
const frameToSec = (f) => f / framerate;
const nodemailer = require('nodemailer');
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	switch (req.method) {
		case "GET": {
			switch (url.pathname) {
				default: {
					const match = req.url.match(/\/movies\/([^/]+)$/);
					if (!match) return;
					const id = match[1].substr(0, match[1].lastIndexOf("."));
					const ext = match[1].substr(match[1].lastIndexOf(".") + 1);
					switch (ext) {
						case "xml": {
							res.setHeader("Content-Type", "text/xml");
							movie.loadXml(id).then((v) => res.end(v)).catch(e => {
								console.log(e);
								res.end("Not Found");
							});
							break;
						} case "zip": {
							res.setHeader("Content-Type", "application/zip");
							movie.loadZip({
								movieId: id,
							}, {
								movieOwnerId: userId
							}, true).then(v => res.end(v)).catch(e => {
								console.log(e);
								res.end("Not Found");
							});
							break;
						} case "mp4": {
							if (fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", id.substr(2)))) {
								res.setHeader("Content-Type", "video/mp4");
								res.end(fs.readFileSync(fUtil.getFileIndex("movie-", ".mp4", id.substr(2))));
							} else res.end("Not Found");
						}
					}
					break;
				}
			}
			break;
		} case "POST": {
			switch (url.pathname) {
				case "/api/uploadMovie2FlashThemes": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						res.setHeader("Content-Type", "application/json");
						const userInfo = session.get(req);
						function getFlashThemesUserInfo() {
							return new Promise((res, rej) => {
								https.get({
									hostname: "flashthemes.net",
									path: "/videomaker/custom/full/",
									headers: {
										cookie: userInfo.data.sessionCookies[1]
									}
								}, r => {
									const buffers = [];
									r.on("data", b => buffers.push(b)).on("end", () => {
										const buffer = Buffer.concat(buffers).toString("utf8");
										res(JSON.parse(buffer.split("studio_data.flashvars = ")[1].split("        var _ccad = null;")[0]));
									})
								})
							})
						}
						function uploadMovie2FlashThemes(body_zip, thmb) {
							return new Promise(async (res, rej) => {
								const info = {
									body_zip,
									thumbnail_large: thmb,
									thumbnail: thmb,
									save_thumbnail: 1,
									publish_quality: "360p",
								};
								for (const i in await getFlashThemesUserInfo()) info[i] = (await getFlashThemesUserInfo())[i];
								console.log(info);
								https.request({
									method: "POST",
									hostname: "flashthemes.net",
									path: "/goapi/saveMovie/",
									headers: {
										"Content-Type": "application/x-www-form-urlencoded",
										cookie: userInfo.data.sessionCookies[1]
									}
								}, r => {
									const buffers = [];
									r.on("data", b => buffers.push(b)).on("end", () => {
										const buffer = Buffer.concat(buffers).toString();
										console.log(buffer);
										if (buffer.startsWith("0")) res({
											success: true,
											movieURL: `https://flashthemes.net/movie/${buffer.substring(1)}`
										});
										else res({
											success: false,
											error: buffer.slice(buffer.indexOf("<message>"), buffer.indexOf("</message>", buffer.indexOf("<message>"))).toString() || "An unknown error occured"
										});
									})
								}).end(new URLSearchParams(info).toString());
							})
						}
						if (!userInfo.data || !userInfo.data.sessionCookies) res.end(JSON.stringify({
							success: false,
							error: 'Please <a href="javascript:uploadMovieAfterLoginComplete()" onclick="showOverlayOnElement(\'#FlashThemesMovieUploader\', jQuery(\'#FTAccLoginWindowLightbox\'))">login</a> to your FlashThemes account again in order to continue uploading your movie to FlashThemes'
						}));
						else if (f.movieId) {
							const filepathxml = fUtil.getFileIndex("movie-", ".xml", f.movieId.substr(f.movieId.lastIndexOf("-") + 1));
							const filepaththumb = fUtil.getFileIndex("thumb-", ".png", f.movieId.substr(f.movieId.lastIndexOf("-") + 1));
							if (!fs.existsSync(filepathxml) || !fs.existsSync(filepaththumb)) res.end(JSON.stringify({
								success: false,
								error: "Your movie could not be uploaded to FlashThemes because one of your movie files are missing from the _SAVED folder in GoNexus. Please try uploading a different movie to GoNexus."
							}))
							else movie.loadZip({
								movieId: f.movieId,
								userId: userInfo.data.current_uid
							}, {}).then(async buff => res.end(JSON.stringify(await uploadMovie2FlashThemes(buff.toString("base64"), fs.readFileSync(filepaththumb).toString("base64")))))
						} else if (f.movieURL) {
							if (f.movieURL.endsWith(".zip")) https.get(f.movieURL, r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", async () => {
									const zip = nodezip.unzip(Buffer.concat(buffers));
									if (!zip['movie.xml']) res.end(JSON.stringify({
										success: false,
										error: "The url to the zip file you provided does not have the movie.xml file inside the zip file which is required for FlashThemes to parse your movie properly. Please use a url which leads to a zip file but has the movie.xml file inside."
									}));
									else res.end(JSON.stringify(uploadMovie2FlashThemes((await zip.zip()).toString("base64"), (await movie.genImage()).toString("base64"))))
								});
							})
						}
					})
					break;
				} case "/api/check4MovieFilepaths": {
					loadPost(req, res).then(data => {
						const params = {
							mId: true,
							action: true
						};
						for (const stuff in data) {
							if (!params[stuff]) return res.end(JSON.stringify({
								status: "error",
								msg: "Missing one or more fields."
							}));
						}
						const filepaths = [];
						if (data.mId.includes("-")) {
							const prefix = data.mId.substr(0, data.mId.lastIndexOf("-"));
							const suffix = data.mId.substr(data.mId.lastIndexOf("-") + 1);
							switch (prefix) {
								case "ft": {
									filepaths.push(`./ftContent/${suffix}.zip`);
									break;
								} case "m": {
									filepaths.push(fUtil.getFileIndex("movie-", ".xml", suffix));
									filepaths.push(fUtil.getFileIndex("thumb-", ".png", suffix));
									break;
								} default: {
									return res.end(JSON.stringify({
										status: "error",
										msg: `The prefix: ${prefix} does not exist in our database.`
									}))
								}
							}
						}
						for (const filepath of filepaths) {
							if (!fs.existsSync(filepath)) return res.end(JSON.stringify({
								status: "error",
								msg: `The filepath: ${filepath} does not exist on this server. it is needed in order to ${data.action}.`
							}));
						}
						res.end(JSON.stringify({
							status: "ok"
						}));
					});
					break;
				} case "/api/movie/delete": {
					loadPost(req, res).then(data => {
						const params = {
							mId: true,
							uId: true
						};
						for (const stuff in data) {
							if (!params[stuff]) return res.end(JSON.stringify({
								status: "error",
								msg: "Missing one or more fields."
							}));
						}
						const filepaths = [];
						if (data.mId.includes("-")) {
							const prefix = data.mId.substr(0, data.mId.lastIndexOf("-"));
							const suffix = data.mId.substr(data.mId.lastIndexOf("-") + 1);
							switch (prefix) {
								case "ft": {
									fs.unlinkSync(`./ftContent/${suffix}.zip`);
									const userInfo = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`));
									const json = userInfo.users.find(i => i.id == data.uId);
									const index = json.movies.findIndex(i => i.id == data.mId);
									json.movies.splice(index, 1);
									fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(userInfo, null, "\t"));
									return res.end(JSON.stringify({
										status: "ok"
									}));
								} case "m": {
									filepaths.push(fUtil.getFileIndex("movie-", ".xml", suffix));
									filepaths.push(fUtil.getFileIndex("thumb-", ".png", suffix));
									if (fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", suffix))) filepaths.push(fUtil.getFileIndex("movie-", ".mp4", suffix));
									break;
								} default: {
									return res.end(JSON.stringify({
										status: "error",
										msg: `The prefix: ${prefix} does not exist in our database.`
									}))
								}
							}
						}
						parse.deleteTTSFiles(fs.readFileSync(filepaths[0]), data.uId).then(json => {
							console.log(json);
							if (!json) try {
								for (const filepath of filepaths) fs.unlinkSync(filepath);
								const userInfo = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`));
								const json = userInfo.users.find(i => i.id == data.uId);
								const index = json.movies.findIndex(i => i.id == data.mId);
								json.movies.splice(index, 1);
								fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(userInfo, null, "\t"));
								res.end(JSON.stringify({
									status: "ok"
								}));
							} catch (e) {
								console.log(e);
								res.end(JSON.stringify({
									status: "error",
									msg: e
								}));
							}
							else res.end(JSON.stringify({
								status: "error",
								msg: json.error
							}));
						});
					});
					break;
				} case "/ajax/saveText2Video": { // save a qvm video (requires a user to be logged in)
					loadPost(req, res).then(data => {
						console.log(data, templateAssets);
						if (!data.userId) return res.end(JSON.stringify({
							error: "You need to be logged in to your account in order to save your video."
						}));
						let movieXml = fs.readFileSync(`./previews/template.xml`, 'utf8');
						movieXml = movieXml.replace(`<title><![CDATA[]]></title>`, `<title><![CDATA[${data.title}]]></title>`);
						movieXml = movieXml.replace(`<desc><![CDATA[]]></desc>`, `<desc><![CDATA[${data.desc}]]></desc>`);
						movieXml = movieXml.replace(`<tag><![CDATA[]]></tag>`, `<tag><![CDATA[qvm]]></tag>`);
						const mId = `m-${fUtil.getNextFileId("movie-", ".xml")}`;
						const mIdParts = {
							prefix: mId.substr(0, mId.lastIndexOf("-")),
							suffix: mId.substr(mId.lastIndexOf("-") + 1)
						};
						let thumb;
						if (data.thumbnail) { // if there was a thumbnail in the video

						} else switch (data.enc_tid){ // generate a thumbnail from the enc_tid param.
							case "0GWxgtNKvSes": {
								thumb = fs.readFileSync(`./qvm_files/basketball/bg01.jpg`);
								break;
							} case "0nZrWjgxqytA": {
								thumb = fs.readFileSync(`./qvm_files/bg03.jpg`);
								break;
							} default: {
								return res.end(JSON.stringify({
									error: "A thumbnail does not exist for this id. because of that, your video could not be saved. if you think that this is a bug, please contact @_sleepyguy on discord and let him know about this bug."
								}));
							}
						}
						const thumbpath = fUtil.getFileIndex("thumb-", ".png", mIdParts.suffix);
						const filepath = fUtil.getFileIndex("movie-", ".xml", mIdParts.suffix);
						fs.writeFileSync(thumbpath, thumb);
						fs.writeFileSync(filepath, movieXml);
						movie.meta(mId).then(m => {
							const user = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`))
							const json = user.users.find(i => i.id == data.userId);
							for (const meta of templateAssets) json.assets.unshift(meta);
							json.movies.unshift(m);
							fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(user, null, "\t"));
							templateAssets = [];
							console.log(templateAssets);
							res.end(JSON.stringify({
								url: `/player?movieId=${mId}`
							}));
						}).catch(e => {
							console.log(e);
							res.end(JSON.stringify({
								error: e
							}));
						})
					});
					break;
				} case "/ajax/previewText2Video": { // loads qvm preview
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						console.log(e, f, files);
						let scriptsCount = 0;
						for (const data in f) if (data == `script[${scriptsCount}][char_num]`) scriptsCount++
						console.log(scriptsCount);
						for (let i = 0; i < scriptsCount; i++) {
							if (f[`script[${i}][type]`] == "talk" && f[`script[${i}][text]`]) {
								const buffer = await tts.genVoice(f[`script[${i}][voice]`], f[`script[${i}][text]`], f.userId);
								const duration = await getMp3Duration(buffer);
								const id = asset.generateId() + ".mp3";
								templateAssets.unshift({
									orderNum: i,
									id,
									enc_asset_id: id,
									file: id,
									type: "sound",
									subtype: "tts",
									title: `[${tts.getVoiceInfo(f[`script[${i}][voice]`]).name}] ${f[`script[${i}][text]`]}`,
									published: 0,
									tags: "",
									duration,
									downloadtype: "progressive",
									ext: "mp3"
								});
								fs.writeFileSync(`./_ASSETS/${id}`, buffer);
							}
						}
						console.log(templateAssets);
						https.request({
							method: "POST",
							hostname: "wrapperclassic.netlify.app",
							path: "/.netlify/functions/api/genQVMXml",
							headers: {
								"Content-Type": "application/x-www-form-urlencoded"
							}
						}, r => {
							const buffers = [];
							r.on("data", b => buffers.push(b)).on("end", async () => {
								if (Buffer.concat(buffers).toString().startsWith("<!DOCTYPE html>")) return res.end(JSON.stringify({
									htmlError: Buffer.concat(buffers).toString()
								})); 
								const json = JSON.parse(Buffer.concat(buffers));
								console.log(json);
								if (json.success) {
									console.log(json.logs);
									fs.writeFileSync(`./previews/template.xml`, json.xml);
									res.end({
										script: f,
										flashvars: {
											apiserver: "/",
											isEmbed: 1,
											tlang: "en_US",
											is_golite_preview: 1,
											autostart: 1,
											storePath: "https://wrapperclassic.netlify.app/static/store/<store>",
											clientThemePath: "https://wrapperclassic.netlify.app/static/tommy/2016/<client_theme>",
										}
									})
								} else if (json.error) res.end(JSON.stringify({
									error: json.error
								}));
								else if (json.errorType && json.errorMessage && json.trace) {
									let html = '<pre>';
									let count = 0;
									let width;
									for (let i of json.trace) {
										html += i + '<br>';
										if (count < 1) width = `${i.length + 700}px`;
										count++
									}
									res.end(JSON.stringify({
										htmlError: html + '</pre>',
										htmlCSS: {
											width
										}
									}));
								}
							}).on("error", e => {
								console.log(e);
								res.end(JSON.stringify({
									error: e.toString()
								}))
							})
						}).end(new URLSearchParams({
							e,
							f,
							files,
							templateAssets,
							xml: fs.readFileSync(`./previews/${f.enc_tid}.xml`).toString().split("\n").join(""),
							settings: JSON.stringify(JSON.parse(fs.readFileSync(`./previews/${f.enc_tid}.json`)))
						}).toString()).on("error", e => {
							console.log(e);
							res.end(JSON.stringify({
								error: e.toString()
							}))
						})
					});
					break;
				} case "/api/sendUserInfo": { // sends the user info firebase provides to the server
					function sendUserInfo() {
						return new Promise(async resolve => {
							const data = await loadPost(req, res)
							userId = data.userId;
							resolve();
						});
					}
					sendUserInfo().then(() => res.end());
					break;
				} case "/goapi/getMovie/": { // loads a movie using the parse.js file
					res.setHeader("Content-Type", "application/zip");
					loadPost(req, res).then(async data => {
						try {
							if (url.query.movieId != "templatePreview") {
								const b = await movie.loadZip(url.query, data);
								if (!url.query.movieId.startsWith("ft-")) res.end(Buffer.concat([base, b]));
								else res.end(b);
							} else res.end(
								Buffer.concat(
									[
										base, 
										parse.packMovie(
											fs.readFileSync("./previews/template.xml"), 
											false, 
											false, 
											false, 
											templateAssets
										)
									]
								)
							);
						} catch (e) {
							console.log(e);
							res.end(1 + e);
						}
					});
					break;
				} case "/api/dafunk/userDataFromProfileURL": {
					res.setHeader("Content-Type", "application/json");
					function handleError(e) {
						console.log(e);
						res.end(JSON.stringify({
							success: false,
							msg: '1Internal Server Error'
						}, null, "\t"))
					}
					const uId = url.query.url.substr(url.query.url.lastIndexOf("/") + 1);
					https.get('https://dafunk.3hj.repl.co/insideFile?path=/users.json', r => {
						const buffers = [];
						r.on("data", b => buffers.push(b)).on("end", () => {
							try {
								console.log(Buffer.concat(buffers).toString());
								const users = JSON.parse(Buffer.concat(buffers));
								res.end(JSON.stringify({
									success: true,
									data: users.users.find(i => i.id == uId)
								}, null, "\t"));
							} catch (e) {
								handleError(e);
							}
						}).on("error", handleError)
					}).on("error", handleError)
					break;
				} case "/api/videoExport/publish": {
					loadPost(req, res).then(data => {
						res.setHeader("Content-Type", "application/json");
						function handleError(e) {
							console.log(e);
							res.end(JSON.stringify({
								msg: '1Internal Server Error'
							}))
						}
						const fieldsRequiredGlobaly = {
							base64: 'AA',
							type: 'video/mp4',
							id: '666',
							userData: 'id=666',
							platform: 'dafunk'
						};
						for (const i in fieldsRequiredGlobaly) {
							if (!data[i]) res.end(JSON.stringify({
								msg: "1Missing one or more required fields."
							}))
						}
						const userData = Object.fromEntries(new URLSearchParams(data.userData));
						console.log(userData);
						try {
							const videoInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == userData.id || userData.uid).movies.find(i => i.id == data.id);
							console.log(videoInfo);
							switch (data.platform) {
								case "dafunk": {
									if (!data.userInfo) res.end(JSON.stringify({
										msg: '1You need to provide your profile URL you got from dafunk.'
									}));
									else https.request({
										method: "POST",
										hostname: "dafunk.3hj.repl.co",
										path: "/uploadViabase64",
										headers: {
											"Content-Type": "application/x-www-form-urlencoded"
										}
									}, r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", () => {
											try {
												console.log(Buffer.concat(buffers).toString());
												const json = JSON.parse(Buffer.concat(buffers));
												if (json.success) res.end(JSON.stringify({
													msg: `0Your video has been published to Da Funk successfully! to view the video that you just published to Da Funk, please click <a href="${
														json.url
													}">here</a>.`
												}))
												else res.end(JSON.stringify({
													msg: 1 + json.error
												}))
											} catch (e) {
												handleError(e);
											}
										}).on("error", handleError);
									}).end(new URLSearchParams({
										video: data.base64,
										headerVal: data.type,
										title: videoInfo.title,
										userInfo: data.userInfo
									}).toString()).on("error", handleError);
									break;
								} case "email": {
									if (!data.formData) return res.end(JSON.stringify({
										msg: '1You need to include all of your cridentials'
									}));
									const f = Object.fromEntries(new URLSearchParams(data.formData));
									const transporter = nodemailer.createTransport({
										auth: {
											user: userData.email,
											pass: f.appPass
										}
									});
									const html = `<p>${
										f.message || 'I don\'t have anything else to say other than check out this animation i made.'
									}<br>To view the animation i made, please do so <a href="${req.headers.origin}/movies/${data.id}.mp4">here</a>.</p>`
									transporter.sendMail({
										from: userData.email,
										to: f.friendEmail,
										subject: `Hey, you should check out my new animation i just made. it's called ${videoInfo.title}.`,
										html
									}, (error, info) => {
										if (error) handleError(error)
										else {
											console.log('Email successfully sent! data:');
											console.log(info);
											res.end(JSON.stringify({
												msg: '0Your video has been sent to a friend successfully!'
											}));
										}
									});
									break;
								}
							}
						} catch (e) {
							handleError(e);
						}
					})
					break;
				} case "/api/videoExport/completed": { // converts the video frames into an actual video.
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						if (typeof f.frames == "undefined" || f.frames.length == 0) {
							console.warn("Exporter: Conversion attempted with no frames.");
							res.end(JSON.stringify({ 
								success: false,
								msg: "Frames missing." 
							}));
							return;
						} else if (typeof f.id == "undefined") {
							console.warn("Exporter: Conversion attemped with no movie ID.");
							res.end(JSON.stringify({
								success: false,
								msg: "Movie ID missing." 
							}));
							return;
						}
						console.log("Exporter: Frames sent to server. Writing frames to temp path...");
					
						/* save all the frames */
						const frames = f.frames;
						if (!fs.existsSync(`./previews`)) fs.mkdirSync(`./previews`);
						const base = path.join(__dirname, `../previews/${f.id}`);
						if (!fs.existsSync(base)) fs.mkdirSync(base);
						if (fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", f.id.substring(2)))) return res.end(JSON.stringify({
							success: false,
							msg: "An export for your video already exists. Please delete an existing export for your video."
						}))
						for (let i in frames) {
							const frameData = Buffer.from(frames[i == 1 ? 2 : i], "base64");
							fs.writeFileSync(path.join(base, i + ".png"), frameData);
						}
					
						console.log("Exporter: Saving frames completed. Converting frames to a video...");
						
						/* join them together */
						const chicanery = ffmpeg().input(base + "/%d.png").on("start", (cmd) => {
							console.log("Exporter: Spawned Ffmpeg with command:", cmd);
						}).on("end", () => {
							console.log("Exporter: Video conversion successful. Merging Video...");
							for (const i in frames) {
								fs.unlinkSync(path.join(base, i + ".png"));
							}
							fs.rmdirSync(base);
							/*ffmpeg(path.join(__dirname, `../outro.mp4`)).input(path.join(__dirname, `../previews/${f.id}.mp4`)).on("start", (cmd) => {
								console.log("Exporter: Spawned Ffmpeg with command:", cmd);
							}).on("end", () => {
								console.log("Exporter: Video merge successful.");*/
								res.end(JSON.stringify({
									success: true,
									base64: fs.readFileSync(fUtil.getFileIndex("movie-", ".mp4", f.id.substring(2))).toString("base64")
								}));/*
							}).on("error", (err) => {
								console.error("Exporter: Error merging video:", err);
								res.end(JSON.stringify({
									success: false,
									msg: "Internal Server Error" 
								}));
							}).videoCodec("libx264").audioCodec("aac").mergeToFile(path.join(__dirname, `../`, fUtil.getFileIndex("movie-", ".mp4", f.id.substring(2))))*/
						}).on("error", (err) => {
							console.error("Exporter: Error merging video:", err);
							for (const i in frames) {
								fs.unlinkSync(path.join(base, i + ".png"));
							}
							fs.rmdirSync(base);
							res.end(JSON.stringify({
								success: false,
								msg: "Internal Server Error" 
							}));
						});
						
						/* add the audio ourselves, i really don't wanna make it record it */
						let audios = await parse.extractAudioTimes(fs.readFileSync(fUtil.getFileIndex("movie-", ".xml", f.id.substring(2))));
						let complexFilterString = "";
						let delay = 0;
						audios = audios.sort((a, b) => a.start - b.start);
						for (const i in audios) {
							const audio = audios[i];
							const baseDuration = audio.stop - audio.start;
							const duration = Math.max(baseDuration, audio.trimEnd) - audio.trimStart;
							chicanery.input(audio.filepath);
							chicanery.addInputOption("-t", frameToSec(duration));
							if (audio.trimStart > 0) {
								chicanery.seekInput(frameToSec(audio.trimStart));
							}
							complexFilterString += `[${Number(i) + 1}:a]adelay=${(frameToSec(audio.start) * 1e3) - delay}[audio${i}];`;
							delay += 100;
						}
						if (typeof complexFilterString == "number") chicanery
							.complexFilter(complexFilterString + `${audios.map((_, i) => `[audio${i}]`).join("")}amix=inputs=${audios.length}[a]`)
							.addOutputOptions("-async", "1")
							.videoCodec("libx264")
							.audioCodec("aac")
							.outputOptions("-pix_fmt", "yuv420p")
							.outputOptions("-ac", "1")
							.outputOptions("-map", "0:v")
							.outputOptions("-map", "[a]")
							.outputOptions("-framerate", framerate)
							.outputOptions("-r", framerate)
							.duration(frameToSec(frames.length))
							.output(path.join(__dirname, `../`, fUtil.getFileIndex("movie-", ".mp4", f.id.substr(2))))
							.run();
						else chicanery.videoCodec("libx264").outputOptions("-framerate", framerate).outputOptions("-r", framerate).output(path.join(__dirname, `../`, fUtil.getFileIndex("movie-", ".mp4", f.id.substr(2)))).run();
					});
					break;
				} case "/api/check4ExportedMovieExistance": { // checks for an existing exported video.
					loadPost(req, res).then(data => {
						res.end(JSON.stringify({
							exists: fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2))),
							base64: fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2))) ? fs.readFileSync(
								fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2))
							).toString("base64") : 'AA'
						}))
					})
					break;
				} case "/api/savePreviewXml": { // sends the preview xml to the server
					req.on('end', () => res.end());
					movie.previewer.push(req, url.query.videoId);
					break;
				} case "/api/checkXml4Audio": { // checks for any audio included in the movie xml.
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						const id = f.videoId;
						switch (f.isPreview) {
							case '0': {
								res.end(JSON.stringify({xmlDoesContainAudio: movie.checkXml4Audio(id)}));
								break;
							} case '1': {
								const buffer = fs.readFileSync(`./previews/${id}.xml`);
								const filmXml = ( // creates a proper xml for the movie parser to read
								buffer.slice(buffer.indexOf("<filmxml>") + 9, buffer.indexOf("</filmxml>")).toString("utf8")
								).split("%3C").join("<").split("%22").join('"').split("%20").join(" ").split("%3E").join(">").split("%3D").join("=")
								.split("%21").join("!").split("%5B").join("[").split("%5D").join("]").split("%0A").join("");
								res.end(JSON.stringify({xmlDoesContainAudio: parse.check4XmlAudio(filmXml)}));
								break;
							}
						}
					});
					break;
				} default: return;
			}
			break;
		} default: return;
	}
};
