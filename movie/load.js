const movie = require("./main");
const base = Buffer.alloc(1, 0);
const http = require("http");
const loadPost = require("../misc/post_body");
const fUtil = require("../misc/file");
const formidable = require("formidable");
const tempbuffer = require("../tts/tempBuffer");
const tts = require("../tts/main");
const asset = require("../asset/main");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);
const fs = require("fs");
const parse = require("./parse");
const mp3Duration = require("mp3-duration");
const ncs = require("../ncs/modules/search");
const cloudinary = require("cloudinary").v2;
function getMp3Duration(buffer) {
	return new Promise((res, rej) => {
		mp3Duration(buffer, (e, d) => {
			var dur = d * 1e3;
			if (e || !dur) rej(e || "Unable to retreive file duration");
			else res(dur);
		});
	})
}
const xmlJs = require('xml-js');
function jsonToXml(jsonData, o = {}) {
	const options = movie.assignObjects({
		compact: true,
		ignoreComment: true,
		spaces: 4
	}, [o]);
	return xmlJs.js2xml(jsonData, options);
}
const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const nodezip = require("node-zip");
const JSZip = require("jszip");
const session = require("../misc/session");
const https = require("https");
const framerate = 24;
const frameToSec = (f) => f / framerate;
const nodemailer = require('nodemailer');
const xmldoc = require("xmldoc");
const discord = require("discord.js");
const xml2js = require('xml2js');
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
				case "/api/isTemplatePublished": {
					const templates = JSON.parse(fs.readFileSync('./templates.json'));
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({
						isPublished: templates[url.query.theme] ? true : false
					}));
					break;
				} default: {
					const match = req.url.match(/\/movies\/([^/]+)$/);
					if (!match) return;
					const {data: currentSession} = session.get(req);
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
								movieOwnerId: currentSession.current_uid
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
							break;
						} case "png": {
							if (fs.existsSync(fUtil.getFileIndex("thumb-", ".png", id.substr(2)))) {
								res.setHeader("Content-Type", "image/png");
								res.end(fs.readFileSync(fUtil.getFileIndex("thumb-", ".png", id.substr(2))));
							} else res.end("Not Found");
							break;
						}
					}
					break;
				}
			}
			break;
		} case "POST": {
			switch (url.pathname) {
				case "/api/movie/preview": {
					loadPost(req, res).then(async data => {
						if (data.xml) {
							if (data.action == "save") {
								const mId = await movie.save(data.xml, await movie.getBuffersOnline(data.thumbUrl), Object.assign({
									v: "2010"
								}, JSON.parse(data.body)), false, req);
								if (data.saveAndClose) {
									res.statusCode = 302;
									res.setHeader("Location", `/player?movieId=${mId}`);
									res.end()
								} else res.end('Your movie has been saved successfully!');
							}
							fs.writeFileSync('./previews/template.xml', data.xml)
						}
						res.end();
					})
					break;
				} case "/api/initTemplatePreview": {
					function err(text, data) {
						data.msg = text;
						res.end(JSON.stringify(data));
					}
					loadPost(req, res).then(data => {
						switch (data.code) {
							case "no_uid": return err("You need to have a GoNexus account in order to preview your template", data);
							case "missing_fields": return err(
								"You need to fill out some required fields in order to preview your template", data
							);
							case "success": {
								if (!data.data) return err("Something was successful but had no data returned for some reason", data);
								fs.writeFileSync('./previews/template.json', JSON.stringify(JSON.parse(data.data)));
								res.end(JSON.stringify({
									success: true
								}))
								break;
							}
						}
					})
					break;
				} case "/api/publishTemplate": {
					function err(text, data) {
						data.msg = text;
						res.end(JSON.stringify(data));
					}
					loadPost(req, res).then(data => {
						switch (data.code) {
							case "no_uid": return err("You need to have a GoNexus account in order to publish your template", data);
							case "missing_fields": return err(
								"You need to fill out some required fields in order to publish your template", data
							);
							case "success": {
								if (!data.data) return err("Something was successful but had no data returned for some reason", data);
								const templates = JSON.parse(fs.readFileSync('./templates.json'));
								templates[data.template_id] = JSON.parse(data.data)[data.template_id];
								fs.writeFileSync(`./templates.json`, JSON.stringify(templates, null, "\t"));
								const currentSession = session.get(req);

								res.end(JSON.stringify({
									success: true
								}))
								break;
							}
						}
					})
					break;
				} case "/api/initTemplateCreation": {
					loadPost(req, res).then(data => {
						const f = movie.assignObjects({}, movie.stringArray2Array(data));
						const charArray = movie.addArray2ObjectWithNumbers(f.charArray);
						const sceneArray = movie.addArray2ObjectWithNumbers(f.sceneArray);
						fs.writeFileSync("jyvee.json", JSON.stringify(f, null, "\t"))
						const userInfo = JSON.parse(fs.readFileSync(asset.folder + '/users.json')).users.find(i => i.id == data.template_uid);
						if (!userInfo) return res.end(JSON.stringify({
							code: "no_uid"
						}));
						const required_fields = {
							template_id: true,
							template_name: true,
							template_theme: true,
							template_intro: true,
							template_introSteps: true
						}
						for (const i in required_fields) {
							if (!data[i]) return res.end(JSON.stringify({
								code: "missing_fields"
							}))
						}
						const themes = parse.getThemes();
						const json = {};
						json[data.template_id] = {
							themeName: themes.find(i => i.attr.id == data.template_theme).attr.name,
							customChars_info: {
								cc_theme_id: data.template_customChars_cc_theme_id || "family",
								tags: data.template_customChars_tags
							},
							user: data.template_uid,
							disableFeatures: {},
							nonSelectableCharInfo: {},
							stockCharacters: [],
							creator_html: `This Template is created by <a href="/public_user/${
								userInfo.id
							}" onclick="return confirm('You will lose your work if you leave this page. Are you sure?');">${
								userInfo.name
							}</a>.`,
							title: data.template_name,
							intro: data.template_intro,
							intro_steps: data.template_introSteps,
							templates: []
						}
						if (data.template_customChars_enable != "1") delete json[data.template_id].customChars_Info;
						const currentSession = session.get(req);
						if (fs.existsSync(`./static/qvm/templates/${data.template_id}`)) {
							let json = JSON.parse(fs.readFileSync('./templates.json'));
							if (fs.existsSync('./previews/template.json')) json = JSON.parse(fs.readFileSync('./previews/template.json'));
							if (json[data.template_id].user != data.template_uid) return res.end(JSON.stringify({
								message: "1Sorry, but the template id you are trying to provide was already taken. Please choose a different id."
							}))
						}
						for (var i = 0; i < charArray.length; i++) {
							json[data.template_id].stockCharacters[i] = { 
								cid: data[`step3cid${i + 1}`],
								name: data[`step3name${i + 1}`],
								gender: data[`step3gender${i + 1}`],
								head: data[`step3head${i + 1}`],
								thumb: data[`step3thumb${i + 1}`]
							}
							if (i < 2) json[data.template_id].stockCharacters[i][`char${i + 1}_default`] = true;
						}
						for (var i = 0; i < sceneArray.length; i++) {
							if (!data[`step2title${i + 1}`]) return res.end(JSON.stringify({
								message: `1You need to provide a name for Scene ${i + 1}`
							}))
							if (!data[`step2movie${i + 1}`]) {
								if (!currentSession.data.current_uid) return res.end(JSON.stringify({
									message: `1You need to login to GoNexus in order to continue with template preview.`
								}))
								return res.end(JSON.stringify({
									message: `1You need to select a movie for Scene ${i + 1}`
								}))
							}
							if (!data[`step2desc${i + 1}`]) return res.end(JSON.stringify({
								message: `1You need to provide a description for Scene ${i + 1}`
							}));
							const bgnum = function() {
								const num = i + 1;
								return num.length > 1 ? `0${num}` : num;
							}();
							json[data.template_id].templates.unshift({
								class: data[`step2class${i + 1}`],
								tid: data[`step2tid${i + 1}`],
								thumb: `/movie_thumbs/${data[`step2movie${i + 1}`]}.png`,
								title: data[`step2title${i + 1}`],
								desc: data[`step2desc${i + 1}`],
								"char-thumb-a": `/static/qvm/templates/${data.template_id}/bg/bg${bgnum}_a.jpg`,
								"char-thumb-b": `/static/qvm/templates/${data.template_id}/bg/bg${bgnum}_b.jpg`,
								background: `/static/qvm/templates/${data.template_id}/bg/bg${bgnum}.jpg`
							})
						}
						res.end(JSON.stringify(json))
					})
					break;
				} case "/qvm_micRecord_goapi/saveSound/": {
					loadPost(req, res).then(async f => {
						res.end(await new Promise(resolve => {
							function errXml(e) {
								resolve(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
							} 
							try {
								fs.writeFileSync('./_CACHÉ/recording.ogg', Buffer.from(f.bytes, "base64"));
								const stream = fs.createReadStream('./_CACHÉ/recording.ogg');
								const buffer = ffmpeg(stream).inputFormat('ogg').toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
									errXml(`Encoding Error: ${error.message}`);
								}).pipe();
								const buffers = [];
								buffer.on("data", (b) => buffers.push(b)).on("end", async () => {
									var dur = await getMp3Duration(Buffer.concat(buffers));
									if (!dur) return errXml("Unable to retrieve MP3 Stream");
									const meta = asset.save(Buffer.concat(buffers), {
										type: f.type,
										subtype: f.subtype,
										title: f.title,
										published: f.is_published,
										tags: "",
										duration: dur,
										downloadtype: "progressive",
										ext: "mp3"
									}, Object.assign({
										isTemplate: true
									}, f));
									movie.templateAssets.set(meta);
									resolve(`0<asset><id>${meta.id.split(".")[0]}</id><enc_asset_id>${
										f.recorderId
									}</enc_asset_id><type>${meta.type}</type><subtype>${meta.subtype}</subtype><title>${
										meta.title
									}</title><published>${meta.published}</published><tags></tags><duration>${
										meta.duration
									}</duration><downloadtype>progressive</downloadtype><file>${meta.file.split(".")[0]}</file></asset>`);
								}).on("error", (e) => {
									console.log(e);
									errXml(e);
								});
							} catch(e) {
								console.log(e);
								errXml(e);
							}
						}));
					})
					break;
				} case "/goapi/getSysTemplateAttributes/": {
					loadPost(req, res).then(data => {
						
					})
					break;
				} case "/api/movieVisibility/change": {
					loadPost(req, res).then(data => {
						let xml = (fs.readFileSync(fUtil.getFileIndex("movie-", ".xml", data.id.substr(2)))).toString('utf8');
						if (!xml) return res.end('error');
						const users = JSON.parse(fs.readFileSync(asset.folder + '/users.json'));
						const userInfo = users.users.find(i => i.id == data.movieOwnerId || data.userId);
						if (!userInfo) return res.end('error');
						const movieInfo = userInfo.movies.find(i => i.id == data.id);
						if (!movieInfo) return res.end('error');
						function movieVisibilityChangeInXML(type) {	
							return new Promise(async resolve4 => {
								xml = xml.replace(`published="1"`, `published="0"`);
								xml = xml.replace(`pshare="1"`, `pshare="0"`);
								if (type && type != "draft") xml = xml.replace(`${type}="0"`, `${type}="1"`);
								fs.writeFileSync(fUtil.getFileIndex("movie-", ".xml", data.id.substr(2)), xml);
								const title = xml.slice(
									xml.indexOf("<title>") + 7,
									xml.indexOf("</title>")
								).toString();
								console.log(title);
								const meta = await movie[
									!title.startsWith('<![CDATA[') 
									&& !title.endsWith(']]>') 
									? 'oldMeta' 
									: 'meta'
								](data.id);
								if (!meta) return resolve4('error');
								for (const stuff in meta) {
									if (meta[stuff] != movieInfo[stuff]) {
										movieInfo[stuff] = meta[stuff];
									}
								}
								fs.writeFileSync(asset.folder + '/users.json', JSON.stringify(users, null, "\t"));
								resolve4('stuff');
							})
						}
						switch (data.visibility) {
							case "public": {
								movieVisibilityChangeInXML('published').then(i => {
									console.log(i);
									res.end(i);
								}).catch(e => {
									console.log(e);
									res.end('error');
								});
								break;
							} case "private": {
								movieVisibilityChangeInXML('pshare').then(i => {
									console.log(i);
									res.end(i);
								}).catch(e => {
									console.log(e);
									res.end('error');
								});
								break;
							} default: {
								movieVisibilityChangeInXML('draft').then(i => {
									console.log(i);
									res.end(i);
								}).catch(e => {
									console.log(e);
									res.end('error');
								});
								break;
							} 
						}
					})
					break;
				}
				case "/goapi/startPhoneRecord/": {
					loadPost(req, res).then(data => {
						// the api URL is https://api.myvox.com/ (that does not work so an error will occur)
						res.end('<phoneRecord success="Y"><phone_number></phone_number><ivr_pin></ivr_pin><country>US</country><session_key></session_key></phoneRecord>')
					})
					break;
				} case "/goapi/saveSoundByUrl/": {
					loadPost(req, res).then(data => {
						https.get(data.url, r => {
							const buffers = [];
							r.on("data", b => buffers.push(b)).on("end", () => {
								const buffer = Buffer.concat(buffers);
								const info = {
									type: data.type,
									subtype: data.subtype,
									published: 0,
									title: data.title,
									tags: data.keywords,
									downloadtype: "progressive",
									ext: "mp3"
								}
								mp3Duration(buffer, (e, d) => {
									const dur = info.duration = d * 1e3;
									if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
										e || "Unable to retrieve MP3 stream."
									}</message><text></text></error>`);
									const id = asset.save(buffer, info, data);
									res.end(`0<asset><id>${id}</id><enc_asset_id>${
										id
									}</enc_asset_id><type>${info.type}</type><subtype>${info.subtype}</subtype><title>${
										info.title
									}</title><published>0</published><tags>${info.tags}</tags><duration>${
										dur
									}</duration><downloadtype>${info.downloadtype}</downloadtype><file>${
										id
									}</file></asset>`);
								});
							})
						})
					});
					break;
				} case "/goapi/searchSoundSnap/": {
					loadPost(req, res).then(async data => {
						const musicals = 'regular-instrumental';
						let xml = '0<sounds>';
						for (const version of musicals.split("-")) {
							const results = await ncs.search(
								{
									search: data.keywords,
									version
								}
							);
							for (const info of results) {
								let tags = '';
								for (const tag of info.tags) {
									tags += `${tag.name},`;
								}
								xml += `<sound><title>${info.name} [${
									version
								}]</title><tags>${tags.slice(0, -1)}</tags><link>${info.download[version]}</link></sound>`;
							}
						};
						res.end(xml + '</sounds>');
					});
					break;
				} case "/goapi/getSysTemplates/": {
					loadPost(req, res).then(async data => {
						if (data.type == "movie") try {
							var xml = '<theme id="ugc" moreMovie="0">';
							const zip = nodezip.create();
							const counts = {
								min: data.count * data.page,
								max: parseInt(((data.count * data.page) + data.count).substr(1))
							}
							const files = fs.readdirSync(`./_EXAMPLES`);
							console.log(counts, files);
							for (; counts.min < counts.max; counts.min++) {
								const file = files[counts.min];
								if (!file) continue;
								const meta = await movie.extractMeta(file, `./_EXAMPLES`, 'e');
								xml += `<movie${
									Object.keys(meta).filter(i => i != "tags").map(v => ` ${v}="${meta[v]}"`).join("")
								}><tags>${
									meta.tags
								}</tags></movie>`;
								fUtil.addToZip(zip, file.slice(0, -3) + "png", fs.readFileSync(`./premadeChars/head/123.png`));
							}
							xml += '</theme>';
							console.log(xml);
							fUtil.addToZip(zip, 'desc.xml', xml);
							res.end(Buffer.concat([base, await zip.zip()]));
						} catch (e) {
							console.log(e);
							res.end("1")
						}
					})
					break;
				} case "/api/saveBackground": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						res.setHeader("Content-Type", "application/json");
						const ext = f.Filename.substr(f.Filename.lastIndexOf(".") + 1);
						const meta = asset.save(fs.readFileSync(files.Filedata.filepath), {
							type: "bg",
							subtype: 0,
							title: f.Filename,
							published: 0,
							tags: "",
							ext
						}, f);
						tempbuffer.set(meta.id, fs.readFileSync(files.Filedata.filepath));
						movie.templateAssets.set(meta);
						res.end(JSON.stringify({
							ext,
							assetId: meta.enc_asset_id,
							encAssetId: meta.id
						}))
					});
					break;
				} case "/api/uploadTemplateFile": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						if (!files.import) {
							if (f.template_type == "new") res.end(JSON.stringify({
								message: "1You need to upload your template file to continue initializing your template."
							}))
							else res.end(JSON.stringify({
								code: 'success'
							}));
						} else {
							const file = files.import;
							if (file.originalFilename.endsWith(".zip") && file.mimetype == "application/x-zip-compressed") {
								const zip = nodezip.unzip(fs.readFileSync(file.filepath));
								const firstpath = `./static/qvm/templates/${f.template_id}`;
								if (!fs.existsSync(firstpath)) fs.mkdirSync(firstpath);
								for (const i in zip) {
									if (zip[i].isDir || typeof zip[i] == "function" || i.endsWith("Thumbs.db")) continue;
									let path = firstpath;
									const buffer = await movie.stream2buffer(zip[i].toReadStream());
									if (i.includes("/")) {
										const filename = i.substr(i.lastIndexOf("/") + 1);
										for (const c of i.split("/")) {
											if (c != filename) {
												path += `/${c}`;
												if (!fs.existsSync(path)) fs.mkdirSync(path);
											} else fs.writeFileSync(`${path}/${c}`, buffer);
										}
									} else fs.writeFileSync(`${path}/${i}`, buffer);
								}
								res.end(JSON.stringify({
									code: 'success'
								}))
							} else res.end(JSON.stringify({
								message: "1The template file you uploaded is not a zip file. Please upload your template file zip to continue initializing your template."
							}))
						}
					});
					break;
				}
				case "/goapi/getPointStatus/":
				case "/goapi/buyPremiumAsset/": {
					loadPost(req, res).then(data => {
						try {
							const users = JSON.parse(fs.readFileSync(asset.folder + '/users.json'));
							const userInfo = users.users.find(i => i.id == data.userId);
							res.setHeader("Content-Type", "application/xml");
							if (data.theme_id) https.get(data.storePath.split("<store>").join(`${data.theme_id}/theme.xml`), r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => {
									const json = new xmldoc.XmlDocument(Buffer.concat(buffers));
									const json2 = json.children.filter(i => i.name == "char").find(i => i.attr.aid == data.aid);
									if (
										userInfo.gopoints < json2.attr.sharing
									) return res.end(`1You need at least ${
										json2.attr.sharing - userInfo.gopoints
									} GoPoints in order to get ${json2.attr.name}.`);
									userInfo.gopoints -= json2.attr.sharing;
									if (!userInfo.purchased) userInfo.purchased = [];
									userInfo.purchased.unshift(json2.attr);
									fs.writeFileSync(asset.folder + '/users.json', JSON.stringify(users, null, "\t"));
									res.end(`0<?xml version="1.0" encoding="UTF-8"?><points money="0" sharing="${userInfo.gopoints}" />`);
								})
							})
							else res.end(`0<?xml version="1.0" encoding="UTF-8"?><points money="0" sharing="${userInfo.gopoints}" />`);
						} catch (e) {
							console.log(e);
							res.end(`1${e.toString()}`);
						}
					})
					break;
				} case "/goapi/jpg_download/": {
					loadPost(req, res).then(data => {

					});
					break;
				}
				case "/goapi/tutaction/": {
					loadPost(req, res).then(data => {
						const users = JSON.parse(fs.readFileSync(asset.folder + '/users.json'));
						const userInfo = users.users.find(i => i.id == data.userId);
						userInfo.gopoints += 5;
						fs.writeFileSync(asset.folder + '/users.json', JSON.stringify(users, null, "\t"));
						res.end(`<points sharing="${userInfo.gopoints}" money="0"/>`);
					})
					break;
				} case "/goapi/getInitParams/": {
					loadPost(req, res).then(data => {
						// scrapped because a user cannot see the error message. we will just make the features work in ut 10 instead.
						/*const users = JSON.parse(fs.readFileSync(asset.folder + '/users.json'));
						const userInfo = users.users.find(i => i.id == data.userId);
						if (userInfo.gopoints < 5) return res.end(JSON.stringify({
							result: false,
							message: "You do not have enough GoPoints to peform this action."
						}));
						userInfo.gopoints -= 5;
						fs.writeFileSync(asset.folder + '/users.json', JSON.stringify(users, null, "\t"));*/
						res.end(JSON.stringify({
							result: true,
							ut: 30						
						}));
					})
					break;
				} case "/api/uploadMovie2FlashThemes": {
					new formidable.IncomingForm().parse(req, async (e, f, files) => {
						res.setHeader("Content-Type", "application/json");
						const userInfo = session.get(req);
						if (!userInfo.data?.flashThemesLogin) return res.end(JSON.stringify({
							success: false,
							error: 'Please <a href="javascript:uploadMovieAfterLoginComplete()" onclick="showOverlayOnElement(\'#FlashThemesMovieUploader\', jQuery(\'#FTAccLoginWindowLightbox\'))">login</a> to your FlashThemes account again in order to continue uploading your movie to FlashThemes'
						}));
						const ftInfo = await new Promise((res, rej) => {
							https.get({
								hostname: "flashthemes.net",
								path: "/videomaker/custom/full/",
								headers: {
									cookie: Buffer.from(userInfo.data.flashThemesLogin, 'base64').toString()
								}
							}, r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => {
									const buffer = Buffer.concat(buffers).toString();
									res(JSON.parse(buffer.split("studio_data.flashvars = ")[1].split("        var _ccad = null;")[0]));
								})
							})
						})
						function uploadMovie2FlashThemes(body_zip, thmb, mId) {
							return new Promise(async (res, rej) => {
								const info = {
									body_zip,
									thumbnail_large: thmb,
									thumbnail: thmb,
									save_thumbnail: 1,
									publish_quality: "360p",
								};
								if (mId) info.movieId = mId;
								for (const i in ftInfo) info[i] = ftInfo[i];
								console.log(info);
								https.request({
									method: "POST",
									hostname: "flashthemes.net",
									path: "/goapi/saveMovie/",
									headers: {
										"Content-Type": "application/x-www-form-urlencoded",
										cookie: Buffer.from(userInfo.data.flashThemesLogin, 'base64').toString()
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
											error: buffer.slice(
												buffer.indexOf("<message>"), buffer.indexOf("</message>", buffer.indexOf("<message>"))
											).toString() || "An unknown error occured"
										});
									})
								}).end(new URLSearchParams(info).toString());
							})
						}
						if (files.import) {
							const fileInfo = files.import;
							const b = fs.readFileSync(fileInfo.filepath);
							switch (fileInfo.mimetype) {
								case "application/x-zip-compressed": {
									const zip = await JSZip.loadAsync(b);
									if (!zip.files['movie.xml']) res.end(JSON.stringify({
										success: false,
										error: "The url to the zip file you provided does not have the movie.xml file inside the zip file which is required for FlashThemes to parse your movie properly. Please use a url which leads to a zip file but has the movie.xml file inside."
									}));
									else res.end(JSON.stringify(await uploadMovie2FlashThemes(
										b.toString("base64"), (await movie.genImage()).toString("base64")
									)));
									break;
								} default: return res.end(JSON.stringify({
									success: false,
									error: "The file you selected is not supported"
								}));
							}
						} else if (f.movieId) {
							const filepathxml = fUtil.getFileIndex("movie-", ".xml", f.movieId.substr(f.movieId.lastIndexOf("-") + 1));
							const filepaththumb = fUtil.getFileIndex("thumb-", ".png", f.movieId.substr(f.movieId.lastIndexOf("-") + 1));
							if (!fs.existsSync(filepathxml) || !fs.existsSync(filepaththumb)) res.end(JSON.stringify({
								success: false,
								error: "Your movie could not be uploaded to FlashThemes because one of your movie files are missing from the _SAVED folder in GoNeuxs. Please try uploading a different movie to GoNeuxs."
							}))
							else {
								(async isSuccessful => {
									if (isSuccessful) {
										res.end(JSON.stringify(await uploadMovie2FlashThemes(
											(await movie.loadZip({
												movieId: f.movieId
											}, {
												userId: userInfo.data.current_uid
											})).toString("base64"), (await movie.genImage()).toString("base64")
										)));
									} else res.end(JSON.stringify({
										success: false,
										error: "An unknown error occured when attempting to upload movie assets into flashthemes"
									}))
								})(await movie.uploadMovieAssets2Flashthemes(
									Buffer.from(userInfo.data.flashThemesLogin, "base64").toString(), filepathxml
								));
							}
						} else if (f.movieURL) {
							if (f.movieURL.endsWith(".zip")) {
								const b = await movie.getBuffersOnline(f.movieURL);
								const zip = await JSZip.loadAsync(b);
								if (!zip.files['movie.xml']) res.end(JSON.stringify({
									success: false,
									error: "The url to the zip file you provided does not have the movie.xml file inside the zip file which is required for FlashThemes to parse your movie properly. Please use a url which leads to a zip file but has the movie.xml file inside."
								}));
								else res.end(JSON.stringify(await uploadMovie2FlashThemes(
									b.toString("base64"), (await movie.genImage()).toString("base64")
								)));
							} else if (f.movieURL.endsWith(".xml")) {
								const zip = nodezip.create();
								fUtil.addToZip(zip, 'movie.xml', await movie.getBuffersOnline(f.movieURL));
								res.end(JSON.stringify(await uploadMovie2FlashThemes(
									(await zip.zip()).toString("base64"), (await movie.genImage()).toString("base64")
								)))
							}
						}
					});
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
									if (
										fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix))
									) filepaths.push(fUtil.getFileIndex("movie-autosaved-", ".xml", suffix));
									filepaths.push(fUtil.getFileIndex("thumb-", ".png", suffix));
									if (
										fs.existsSync(fUtil.getFileIndex("movie-", ".mp4", suffix))
									) filepaths.push(fUtil.getFileIndex("movie-", ".mp4", suffix));
									break;
								} default: {
									return res.end(JSON.stringify({
										status: "error",
										msg: `The prefix: ${prefix} does not exist in our database.`
									}))
								}
							}
						}
						parse.deleteTTSFiles(
							fs.readFileSync(filepaths[0]), data.uId, fs.existsSync(
								fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2))
							) ? fs.readFileSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2))) : '1'
						).then(json => {
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
				} case "/api/qvm_script/get": {
					const currentSession = session.get(req);
					const userInfo = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`)).users.find(
						i => i.id == currentSession.data.current_uid
					);
					if (!userInfo) res.end("You need to have a GoNexus account in order to edit a video made in the QVM.");
					else {
						if (!url.query.movieId) res.end("You need to provide a movie id in order to edit in the quick video maker.");
						else {
							const movieInfo = userInfo.movies.find(i => i.id == url.query.movieId);
							if (!movieInfo) res.end('This movie does not exist.');
							else if (!movieInfo.movieIsMadeWithQVM) res.end(
								'This movie was not made with the Quick Video Maker. Please choose a different movie.'
							) 
							else {
								res.setHeader("Content-Type", "application/json")
								res.end(JSON.stringify(movieInfo.qvm_script));
							}
						}
					}
					break;
				} case "/api/saveText2Video": { // save a qvm video (requires a user to be logged in)
					loadPost(req, res).then(async data => {
						const currentSession = session.get(req);
						if (!currentSession.data.current_uid) return res.end(JSON.stringify({
							error: "You need to be logged in to your account in order to save your video."
						}));
						const movieBase = await xml2js.parseStringPromise(fs.readFileSync('./previews/template.xml'));
						switch (data.p_setting) {
							case "public": {
								movieBase.film._attributes.published = 1;
								break;
							} case "private": {
								movieBase.film._attributes.pshare = 1;
								break;
							}
						}
						movieBase.film.meta[0].title[0] = data.title;
						movieBase.film.meta[0].desc[0] = data.desc;
						const mId = data.enc_mid;
						const mIdParts = {
							prefix: mId.substr(0, mId.lastIndexOf("-")),
							suffix: mId.substr(mId.lastIndexOf("-") + 1)
						};
						if (!data.thumbnail) return res.end(JSON.stringify({
							error: 'Please select a thumbnail'
						}));
						const thumb = Buffer.from(data.thumbnail, "base64")
						const thumbpath = fUtil.getFileIndex("thumb-", ".png", mIdParts.suffix);
						const filepath = fUtil.getFileIndex("movie-", ".xml", mIdParts.suffix);
						if (fs.existsSync(filepath)) parse.deleteTTSFiles(fs.readFileSync(filepath), currentSession.data.current_uid);
						fs.writeFileSync(thumbpath, thumb);
						fs.writeFileSync(filepath, jsonToXml(movieBase));
						movie.oldMeta(mId).then(m => {
							m.movieIsMadeWithQVM = true;
							m.qvm_script = movie.addArray2ObjectWithNumbers(movie.assignObjects({}, movie.stringArray2Array(data)));
							m.qvm_script.dialog_methods = movie.dialogMethods.get();
							delete m.qvm_script.thumbnail;
							const user = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`))
							const json = user.users.find(i => i.id == currentSession.data.current_uid);
							for (const meta of movie.templateAssets.get()) {
								fs.writeFileSync(`${asset.folder}/${meta.id}`, tempbuffer.get(meta.id));
								json.assets.unshift(meta);
							}
							const existingMovieInfo = json.movies.find(i => i.id == mId)
							if (!existingMovieInfo) json.movies.unshift(m);
							else Object.assign(existingMovieInfo, m);
							fs.writeFileSync(`${asset.folder}/users.json`, JSON.stringify(user, null, "\t"));
							movie.templateAssets.deleteAll();
							movie.dialogMethods.deleteAll()
							res.end(JSON.stringify({
								url: `/player?movieId=${mId}`
							}));
						}).catch(e => {
							console.log(e);
							res.end(JSON.stringify({
								error: e.toString()
							}));
						})
					});
					break;
				} case "/api/setupText2VideoPreview": {
					if (fs.existsSync('./previews/template.xml')) fs.unlinkSync('./previews/template.xml');
					if (fs.existsSync('./previews/template.zip')) fs.unlinkSync('./previews/template.zip');
					movie.templateAssets.deleteAll();
					loadPost(req, res).then(async data => {
						try {
							const f = movie.addArray2ObjectWithNumbers(movie.assignObjects({}, movie.stringArray2Array(data)));
							f.player_object = {
								ext: "zip",
								filename: "template",
								movieId: "templatePreview",
								siteId: "go",
								is_golite_preview: 1,
								isTemplate: 1,
								autostart: 1,
								isEmbed: 1,
								isWide: 0,
								ut: 23,
								s3base: "/movie_thumbs",
								apiserver: "/",
								storePath: "/static/store/<store>",
								clientThemePath: "/static/<client_theme>",
							}
							f.enc_mid = data.enc_mid || `m-${fUtil.getNextFileId("movie-", ".xml")}`
							const movieBase = await xml2js.parseStringPromise(fs.readFileSync(`./_TEMPLATES/movieBase.xml`));
							const scenes2create = await xml2js.parseStringPromise(
								fs.readFileSync(`./_TEMPLATES/${data.golite_theme}.${data.enc_tid}.xml`)
							);
							const zip = nodezip.create();
							if (data.enc_tid == "0jSKjALMlvjk") {
								const assetsPath = `./_TEMPLATES/${data.golite_theme}.0jSKjALMlvjk.assets`;
								const tpEditor = await xml2js.parseStringPromise(fs.readFileSync(`${assetsPath}/tpeditor.xml`))
								function findCharAid(aid) {
									for (const i in tpEditor.theme) {
										if (!tpEditor.theme[i] || !Array.isArray(tpEditor.theme[i])) continue;
										const info = tpEditor.theme[i].find(i => i._attributes.aid == aid);
										if (!info) continue;
										info.type = i;
										return info;
									}
								}
								for (const scene of scenes2create.film.scene) {
									const bgt = 'customBg';
									const counts = {};
									if (scene.bg[0].file[0].endsWith(bgt)) {
										scene.bg[0].file[0] = scene.bg[0].file[0].replace(bgt, f.opening_closing.opening_props.bg_aid)
									}
									const info = movie.addArray2ObjectWithNumbers(f.bg[f.opening_closing.opening_props.bg_aid]);
									for (const l of info) {
										const aray = [];
										const noStrings = Object.keys(l).filter(
											i => Array.isArray(movie.addArray2ObjectWithNumbers(l[i]))
										)
										for (const d of noStrings) {
											for (const s of movie.addArray2ObjectWithNumbers(l[d])) aray.unshift(s);
										}
										for (const info2 of aray) {
											const info3 = findCharAid(info2.aid);
											if (!info3) continue;
											if (info3.type == "effect") info3.type = "effectAsset";
											scene[info3.type] = scene[info3.type] || [];
											counts[info3.type] = counts[info3.type] || 0
											const xmlInfo = {
												_attributes: {
													index: counts[info3.type] + 1
												}
											};
											const filename = `tpeditor.${info3._attributes.thumb || info3._attributes.id}`;
											const pieces = filename.split(".");
											const ext = pieces.pop();
											pieces[pieces.length - 1] += `.${ext}`;
											const filepath = pieces.join("/");
											pieces.splice(0, 1, "ugc");
											delete info2.zindex;
											delete info2.aid;
											switch (info3.type) {
												case "char": {
													xmlInfo._attributes = {
														index: counts.char + 5,
														id: `AVATOR${counts.char + 5}`,
														raceCode: 0
													}
													pieces.splice(1, 0, info3._attributes.id);
													xmlInfo.action = [
														{
															_attributes: {
																face: info2.face,
																motionface: 1
															},
															_text: pieces.join(".")
														}
													]
													delete info2.face;
													break;
												} case "prop": {
													xmlInfo._attributes.id = `PROP${counts.prop}`;
													break;
												} case "effectAsset": {
													xmlInfo._attributes.id = `EFFECT${counts.effectAsset}`;
													xmlInfo.effect = {
														_attributes: info3._attributes
													}
													break;
												}
											}
											if (info3.type != "char") xmlInfo.file = pieces.join(".");
											if (info3.type != "effectAsset") pieces.splice(1, 0, info3.type);
											else pieces.splice(1, 0, "effect");
											fUtil.addToZip(zip, pieces.join("."), fs.readFileSync(`./static/qvm/swf/${filepath}`))
											for (const i in info2) xmlInfo[i] = info2[i];
											scene[info3.type][counts[info3.type]] = xmlInfo
											counts[info3.type]++;
										}
									}
								}
							}
							movieBase.film.scene = [];
							movieBase.film.sound = scenes2create.film.sound || [];
							if (f.bg?.music) await new Promise((res, rej) => {
								const pieces = f.bg.music.split(".");
								const ext = pieces.pop();
								pieces[pieces.length - 1] += `.${ext}`;
								pieces.splice(1, 0, "sound");
								https.get(`${process.env.STORE_URL2}/${pieces.join("/")}`, d => {
									const buffers = [];
									d.on("data", i => buffers.push(i)).on("end", async () => {
										const buffer = Buffer.concat(buffers);
										const duration = await fUtil.mp3Duration(buffer);
										let stop = Math.round(((Math.round(duration * 132) / 666) / 8.1 - 7) - 8);
										if (stop.toString().startsWith("-")) stop = Number(stop.toString().substr(1))
										pieces.splice(1, 1);
										movieBase.film.sound.unshift({
											_attributes: {
												id: `SOUND0`,
												index: 0,
												track: 0,
												vol: 0.25,
												tts: 0
											},
											sfile: [pieces.join(".")],
											start: [1],
											stop: [stop + 1],
											fadein: [
												{
													_attributes: {
														duration: 0,
														vol: 0
													}
												}
											],
											fadeout: [
												{
													_attributes: {
														duration: 0,
														vol: 0
													}
												}
											]
										});
										res();
									}).on("error", rej);
								}).on("error", rej)
							});
							const charNumbers = movie.assignObjects({}, f.characters);
							const avatarIds = {};
							const templatrSettingsPath = `./_TEMPLATES/${data.golite_theme}.${data.enc_tid}.json`
							const settings = fs.existsSync(templatrSettingsPath) ? JSON.parse(fs.readFileSync(templatrSettingsPath)) : {};
							let soundStartDelay = 0;
							let defaultProp4head = 4;
							function insertChar2Scene(k = [], options = {}) {
								for (const scene of k) {
									const l = movieBase.film.scene.length;
									if (options.elm2delete) delete scene._attributes[options.elm2delete];
									scene._attributes.index = l;
									scene._attributes.id = `SCENE${scene._attributes.index}`;
									soundStartDelay += Number(scene._attributes.adelay);
									if (scene.char) {
										for (const id in charNumbers) {
											if (
												!avatarIds[id] && scene.char[Number(id)- 1]
											) avatarIds[id] = scene.char[Number(id)- 1]._attributes.id 
										}
										for (const char of scene.char) {
											for (const id in charNumbers) {
												let t;
												if (settings.includedChar) {
													if (settings.includedChar != id) t = `ugc.charId`;
													else continue;
												} else t = `ugc.charIdNum${charNumbers[id]}`;
												if (char.action[0]._text.startsWith(t)) {
													if (!avatarIds[id]) avatarIds[id] = char._attributes.id;
													const charId = settings.charFiles2UseForIds ? settings.charFiles2UseForIds[id] : id;
													console.log(charId);
													char.action[0]._text = char.action[0]._text.replace(t, `ugc.${charId}`);
												}
											}
											const pieces = char.action[0]._text.split(".");
											const id = pieces[1];
											const facial = (
												options.useOpeningClosingFacial && options.openingClosingFacialType && charNumbers[id]
											) ? f.opening_closing[options.openingClosingFacialType]?.facial[charNumbers[id]] : 'default';
											if (facial == "default") continue;
											char.head = {
												_attributes: {
													id: `PROP${defaultProp4head}`,
													raceCode: 1
												},
												file: [`ugc.${id}.head.head_${facial}.xml`]
											};
											defaultProp4head += 2;
										}
									}
									if (!options.dontpushstuff2scene) movieBase.film.scene[l] = scene;
								}
							}
							insertChar2Scene(scenes2create.film.scene.filter(i => i._attributes.isPartOfVideoStart != undefined), {
								useOpeningClosingFacial: true,
								openingClosingFacialType: 'opening_characters',
								elm2delete: 'isPartOfVideoStart'
							});
							const firstScenesLengtj = movieBase.film.scene.length;
							let charSceneCount = firstScenesLengtj;
							async function getVoiceMeta(script) {
								const currentSession = session.get(req);
								const userAssets = JSON.parse(fs.readFileSync(`${asset.folder}/users.json`)).users.find(
									i => i.id == currentSession.data.current_uid
								).assets
								if (script.text) {
									movie.dialogMethods.set("tts")
									const info = userAssets.find(i => i.title == `[${script.voice}] ${script.text}`)
									if (!info) {
										const meta = await tts.genVoice4Qvm(script.voice, script.text);
										movie.templateAssets.set(meta);
										return meta;
									}
									return info;
								} else if (script.aid) {
									movie.dialogMethods.set("mic");
									return userAssets.find(
										i => i.enc_asset_id == script.aid
									) || movie.templateAssets.get().find(i => i.enc_asset_id == script.aid);
								}
							}
							movieBase.film.linkage = [];
							const facials = [];
							let charNumCount = 0;
							function getRandomNumber(min, max) {
								return Math.floor(Math.random() * (max - min + 1)) + min;
							}
							let mainSoundCount = 0;
							for (const script of f.script) {
								if (
									script.facial
									&& script.facial[script.char_num]
									&& script.facial[script.char_num] != "default"
								) facials.unshift({
									cid: script.cid,
									expression: script.facial[script.char_num],
									sceneCount: movieBase.film.scene.length
								});
								const meta = await getVoiceMeta(script);
								if (meta) {
									const soundLength = movieBase.film.sound.length;
									const prevSoundInfo = movieBase.film.sound[soundLength - 1];
									const start = prevSoundInfo?._attributes.tts == 1 ? prevSoundInfo.stop[0] + 24 : soundStartDelay;
									let stop = Math.round(((Math.round(meta.duration * 132) / 666) / 8.1 - 7) - 7);
									if (stop.toString().startsWith("-")) stop = Number(stop.toString().substr(1))
									const sceneLength = movieBase.film.scene.length;
									const avatarId = settings.includedChar == script.cid ? settings.includedCharAvatarId : avatarIds[
										script.cid
									];
									movieBase.film.linkage.push(`SOUND${soundLength},SCENE${sceneLength}~~~,~~~${avatarId}`);
									let attr;
									if (
										scenes2create.film._attributes.noCams == "true"
										&& scenes2create.film._attributes.moreThan2Characters == "true"
									) attr = 'charsTalking';
									else if (settings.applyJyveeLikeCameraLogic) {
										attr = `char_${script.char_num}_talking`;
										if (settings.charCamScenes) {
											for (const n of settings.charCamScenes) {
												if (charSceneCount != n.n) continue;
												attr = `char_${script.char_num}_talking_cam`;
											}
										}
										if (settings.maxCharCamSceneNum == charSceneCount) charSceneCount = firstScenesLengtj;
										else charSceneCount++;
									} else attr = `char_${script.char_num}_talking_cam_${
										getRandomNumber(1, Number(scenes2create.film._attributes.totalCamCount))
									}`
									console.log(attr);
									const currentScene = scenes2create.film.scene.filter(i => i._attributes[attr] != undefined);
									const json = movie.assignObjects({}, currentScene);
									json._attributes.adelay = stop + 24;
									if (
										json.char[Number(script.char_num) - 1]
										&& json.char[Number(script.char_num) - 1].head
										&& script.facial[script.char_num] != "default"
									) delete json.char[Number(script.char_num) - 1].head;
									insertChar2Scene([json]);
									movieBase.film.sound[soundLength] = {
										_attributes: {
											id: `SOUND${soundLength}`,
											index: soundLength,
											track: 0,
											vol: 1,
											tts: 1
										},
										sfile: [`ugc.${meta.file}`],
										start: [start],
										stop: [stop + start],
										fadein: [
											{
												_attributes: {
													duration: 0,
													vol: 0
												}
											}
										],
										fadeout: [
											{
												_attributes: {
													duration: 0,
													vol: 0
												}
											}
										],
										ttsdata: [
											{
												type: ["tts"],
												text: [script.text],
												voice: [script.voice]
											}
										]
									};
									if (
										movieBase.film.sound[mainSoundCount]?._attributes.tts != 1
										&& Number(movieBase.film.sound[mainSoundCount].stop[0]) <= (stop + start)
									) {
										const nfo = movieBase.film.sound[mainSoundCount];
										mainSoundCount = soundLength + 1;
										movieBase.film.sound[mainSoundCount] = {
											_attributes: nfo._attributes,
											sfile: nfo.sfile,
											start: [Number(nfo.stop[0]) + 1],
											stop: [Number(nfo.stop[0]) + 1 + Number(nfo.stop[0])],
											fadein: nfo.fadein,
											fadeout: nfo.fadeout
										};
									}
								}
							}
							insertChar2Scene(scenes2create.film.scene.filter(i => i._attributes.isPartOfVideoEnd != undefined), {
								useOpeningClosingFacial: true,
								openingClosingFacialType: 'closing_characters',
								elm2delete: 'isPartOfVideoEnd'
							});
							let xml = jsonToXml(movieBase);
							let pos = xml.indexOf('<scene charsTalking=');
							while (pos > -1) {
								const sceneInfo = xml.substr(pos).split("</scene>")[0];
								const sceneCountBeg = sceneInfo.indexOf(`id="SCENE`) + 9;
								const sceneCountEnd = sceneInfo.indexOf('"', sceneCountBeg)
								const sceneCount = Number(sceneInfo.substring(sceneCountBeg, sceneCountEnd));
								const facialInfo = facials[facials.findIndex(i => i.sceneCount == sceneCount)];
								if (facialInfo && settings.includedChar != facialInfo.cid) {
									const charAvatarId = avatarIds[facialInfo.cid];
									const charInfo = sceneInfo.substr(sceneInfo.indexOf(`<char id="${charAvatarId}"`)).split("</char>")[0];
									xml = xml.split(sceneInfo).join(sceneInfo.split(charInfo).join(charInfo + `<head id="PROP${
										defaultProp4head
									}" raceCode="1"><file>ugc.${facialInfo.cid}.head.head_${facialInfo.expression}.xml</file></head>`))
									defaultProp4head += 2;
								}
								pos = xml.indexOf('<scene charsTalking=', pos + 19);
							}
							const assetsPath = `./_TEMPLATES/${data.golite_theme}.${data.enc_tid}.assets`;
							if (fs.existsSync(assetsPath)) {
								f.player_object.ext = "zip";
								const ugc = fs.existsSync(`${assetsPath}/ugc.xml`) ? await xml2js.parseStringPromise(
									fs.readFileSync(`${assetsPath}/ugc.xml`)
								) : fs.existsSync(`${assetsPath}/tpeditor.xml`) ? await xml2js.parseStringPromise(
									fs.readFileSync(`${assetsPath}/tpeditor.xml`)
								) : {};
								ugc.theme._attributes.id = "ugc";
								ugc.theme._attributes.name = "ugc";
								for (const i in ugc.theme) {
									if (Array.isArray(ugc.theme[i])) for (const info of ugc.theme[i]) {
										movie.templateAssets.set({
											type: i,
											title: info.name,
											subtype: info.subtype,
											duration: info.duration,
											downloadtype: info.downloadtype
										})
									}
								}
								const zip2 = await parse.packMovie(xml, {
									returnObjectZip: true,
									existingObjectZip: zip,
									userId: session.get(req).data?.current_uid || ''
								}, false, movie.templateAssets.set());
								for (const file of fs.readdirSync(assetsPath)) if (!zip2[file]) fUtil.addToZip(
									zip2, file, fs.readFileSync(`${assetsPath}/${file}`)
								)
								const ugc2 = await xml2js.parseStringPromise(zip2['ugc.xml'].buffer);
								if (ugc.theme) fUtil.addToZip(zip2, 'ugc.xml', jsonToXml(movie.assignObjects(ugc2, [ugc])));
								fs.writeFileSync(`./previews/${f.player_object.filename}.zip`, await zip2.zip());
							} else fs.writeFileSync(`./previews/${f.player_object.filename}.zip`, await parse.packMovie(xml, {
								userId: session.get(req).data?.current_uid || '',
								storePath4Parser: req.headers.origin + '/static/tommy/2010/store',
								existingObjectZip: zip
							}, false, movie.templateAssets.get()))
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(f));
						} catch (e) {
							console.log(e);
							res.end(JSON.stringify({
								error: e.toString()
							}))
						}
					});
					break;
				} case "/api/movie/generate": {
					const { z } = require("zod");
					const currentSession = session.get(req);
					loadPost(req, res).then(async data => {
						process.env.OPENAI_API_KEY = data.OpenAIApiKey;
						const openai = new OpenAI();
						function randomCharId() {
							const chars = asset.list('', '', '', [], currentSession.data.current_uid, "char");
							const l = chars.length - 1;
							const ids = [];
							for (const char of chars) ids.push(char.id);
							return ids[Math.floor(Math.random() * l)];
						}
						const aiResult = z.object({
							title: z.string(),
							description: z.string(),
							video_height: z.number({
								description: 350
							}),
							video_width: z.number({
								description: 554
							}),
							sounds: z.array(z.object({
								audio_url: z.string(),
								name: z.string()
							})),
							scenes: z.array(z.object({
								background: z.object({
									name: z.string(),
									image_url: z.string(),
									image_height: z.number({
										description: 350
									}),
									image_width: z.number({
										description: 554
									}),
									fill_image: z.boolean({
										description: true
									})
								}),
								props: z.array(z.object({
									name: z.string(),
									image_url: z.string(),
									x_position: z.number(),
									y_position: z.number()
								})),
								characters: z.array(z.object({
									name: z.string(),
									x_position: z.number(),
									y_position: z.number(),
									action: z.string(),
									facial_expression: z.string(),
									dialog: z.object({
										voice: z.string(),
										text: z.string()
									})
								}))
							}))
						});
						fs.writeFileSync('jyvee.json', JSON.stringify(zodResponseFormat(aiResult), null, "\t"));
						try {
							const completion = await openai.beta.chat.completions.parse({
								model: data.OpenAIModel,
								messages: [
									{ 
										role: "user", 
										content: `Please give me a script for a new video that i'm making called ${data.title}.`
									},
								],
								response_format: zodResponseFormat(aiResult),
							});
							const result = completion.choices[0].message;
							fs.writeFileSync("jyvee.json", JSON.stringify(completion, null, "\t"))
							if (result.refusal) {
								res.setHeader("Content-Type", "application/json");
								res.end(JSON.stringify({
									feedbackText: result.refusal,
									feedbackData: {
										header: `AI Vdeo Generation Error`
									}
								}))
							}
						} catch (e) {
							console.log(e);
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({
								feedbackText: `<a download="error_output.json" href="data:application/json;base64,${
									Buffer.from(JSON.stringify(e, null, "\t")).toString("base64")
								}">Download Error Output<a>`,
								feedbackData: {
									header: e.toString()
								}
							}))
						}
					})
					break;
				} case "/api/openai/models/list": {
					loadPost(req, res).then(data => {
						res.setHeader("Content-Type", "application/json");
						let key = data.OpenAIApiKey;
						if (movie.stringIsArray(key)) {
							const array = JSON.parse(key);
							if (array.length > 1) return res.end(JSON.stringify({
								needs2selectkey: true
							})); 
							else key = array[0]
						}
						https.get('https://api.openai.com/v1/models', {
							headers: {
								authorization: `Bearer ${key}`
							}
						}, r => {
							const buffers = [];
							r.on("data", b => buffers.push(b)).on("end", () => {
								res.end(JSON.stringify(JSON.parse(Buffer.concat(buffers))));
							})
						})
					})
					break;
				} case "/goapi/getMovie/": { // loads a movie using the parse.js file
					loadPost(req, res).then(async data => {
						try {
							res.setHeader("Content-Type", "application/zip");
							if (url.query.movieId != "templatePreview") {
								const b = await movie.loadZip(url.query, data);
								if (!url.query.movieId.startsWith("ft-")) res.end(Buffer.concat([base, b]));
								else res.end(b);
							} else switch (data.ext) {
								case "xml": return res.end(Buffer.concat([
									base, 
									await parse.packMovie(fs.readFileSync(`./previews/${data.filename}.xml`), data, false, movie.templateAssets.get())
								]));
								case "zip": return res.end(Buffer.concat([
									base, 
									fs.readFileSync(`./previews/${data.filename}.zip`)
								]));
							}
						} catch (e) {
							res.setHeader("Content-Type", "text/xml");
							console.log(e);
							res.end(1 + `<error><code>NOTFOUND</code><message></message><text></text></error>`);
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
					https.get('https://dafunk.gonexus.xyz/insideFile?path=/users.json', r => {
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
						const fieldsRequiredGlobaly = [
							"base64",
							"type",
							"id",
							"userData",
							"platform"
						];
						for (const i of fieldsRequiredGlobaly) {
							if (!data[i]) res.end(JSON.stringify({
								msg: "1Missing one or more required fields."
							}))
						}
						const userData = Object.fromEntries(new URLSearchParams(data.userData));
						console.log(userData);
						try {
							const videoInfo = JSON.parse(fs.readFileSync(asset.folder + '/users.json')).users.find(i => i.id == userData.id || userData.uid).movies.find(i => i.id == data.id);
							switch (data.platform) {
								case "dafunk": {
									if (!data.userInfo) res.end(JSON.stringify({
										msg: '1You need to provide your profile URL you got from dafunk.'
									}));
									else https.request({
										method: "POST",
										hostname: "dafunk.gonexus.xyz",
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
									}<br>To view the animation i made, please do so <a href="${
										req.headers.origin
									}/movies/${data.id}.mp4">here</a>.</p>`
									transporter.sendMail({
										from: userData.email,
										to: f.friendEmail,
										subject: `Hey, you should check out my new animation i just made. it's called ${videoInfo.title}.`,
										html
									}, (error, info) => {
										if (error) handleError(error)
										else {
											console.log('Email successfully sent! data:', info);
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
					loadPost(req, res).then(async data => {
						// checks for existant video frames and id before doing any type of video conversion
						if (typeof data.frames == "undefined" || data.frames.length == 0) {
							console.warn("The Exporter attempted conversion with no frames.");
							res.end(JSON.stringify({ msg: "The Exporter attempted conversion with no frames." }));
							return;
						} else if (typeof data.id == "undefined") {
							console.warn("The Exporter attempted conversion with no movie ID.");
							res.end(JSON.stringify({ msg: "The Exporter attempted conversion with no movie ID." }));
							return;
						}
					
						console.log("The Exporter Frames were successfully sent to the server. Writing frames to a temporary path...");
					
						/* saves all the frames */
						const frames = JSON.parse(data.frames);
						const base = `${asset.tempFolder}/TEMP${data.id}`;
						fs.mkdirSync(base);
						for (var i = 0; i < frames.length; i++) {
							const frameData = Buffer.from(frames[i == 1 ? 2 : i], "base64");
							fs.writeFileSync(`${base}/${i}.png`, frameData);
						}
					
						console.log("The Exporter successfully saved all of the video frames. Converting the saved frames into a video...");
						
						/* joins the frames together */
						const chicanery = ffmpeg().input(base + "/%d.png").on("start", (cmd) => {
							console.log("The Exporter Spawned Ffmpeg with the following command:", cmd);
						}).on("end", () => {
							console.log("The Exporter converted your video successfully. Adding the GoNexus Outro to your video...");
							// removes all frames from the temp path
							const outputFilepath = fUtil.getFileIndex("movie-", ".mp4", data.id.substr(2));
							for (const i in frames) fs.unlinkSync(`${base}/${i}.png`);
							fs.rmdirSync(base);
							// sets up cloudinary for video splicing
							cloudinary.config({ 
								cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
								api_key: process.env.CLOUDINARY_API_KEY,
								api_secret: process.env.CLOUDINARY_API_SECRET
							});
							// joins the video and GoNexus outro together
							cloudinary.uploader.upload(`./previews/${data.id}.mp4`, {
								folder: '',
								resource_type: 'video'
							}).then(async (cloudinary_data) => {
								/* 
								cloudinary didn't mention in their video splicing tutorial that 
								both videos needed to be the same size in order for them to be concated into one single video buffer.
								That's all fixed now and the code's here in case any future 
								GoNexus Source Code holders need it out of curiosity. 
								*/
								const videoURL = cloudinary.url(cloudinary_data.public_id, { 
									// generates a video url using transformation effects
									resource_type: "video",
									transformation: [
										{ 
											crop: "fill", 
											width: 706,
											height: 408 
										},
										{
											flags: "splice", 
											overlay: "video:" + process.env.EXPORTED_VIDEO_OUTRO_CLOUDINARY_PUBLIC_ID
										},
										{ 
											crop: "fill", 
											width: 706,
											height: 408 
										},
										{ 
											flags: "layer_apply" 
										},
										{ 
											overlay: process.env.EXPORTED_VIDEO_WATERMARK_CLOUDINARY_PUBLIC_ID
										},
										{ 
											width: 240, 
											height: 28,
											x:10, 
											y:10 
										},
										{ 
											opacity: 80 
										},
										{ 
											flags: "layer_apply", 
											gravity: "south_west"
										},
										{
											flag: "layer_apply" 
										}
									]
								});
								// write the results to the output path
								fs.writeFileSync(outputFilepath, await movie.getBuffersOnline(videoURL));
								console.log("The Exporter added the GoNexus outro your video successfully. Deleting any temp files that have been created during video conversion...");
								// deletes temporary files to save space
								fs.unlinkSync(`./previews/${data.id}.mp4`);
								cloudinary.api.delete_resources(
									[
										cloudinary_data.public_id
									], 
									{ 
										type: 'upload', 
										resource_type: 'video' 
									}
								).then(d => {
									console.log("The Exporter successfully deleted all of the temp files that have been created during video conversion with no errors. Response:", d);
								}).catch(e => {
									console.error("The Exporter failed to delete a file from cloudinary that was used to merge both your movie and outro together with the following error:", e);
								});
								res.end(JSON.stringify({ // end it all
									success: '', 
									base64: fs.readFileSync(outputFilepath, "base64") 
								}));
							});
						}).on("error", (err) => {
							console.error("The Exporter failed to proccess your video with error:", err);
							res.end(JSON.stringify({ msg: err.toString() }));
							// removes all frames from the temp path
							for (const i in frames) fs.unlinkSync(`${base}/${i}.png`);
							fs.rmdirSync(base);
						});
						// adds in audio using their buffers and durations
						let audios = await parse.extractAudioTimes(fs.readFileSync(fUtil.getFileIndex("movie-", ".xml", data.id.substr(2))));
						let complexFilterString = "";
						let delay = 0;
						audios = audios.sort((a, b) => a.start - b.start);
						for (var i = 0; i < audios.length; i++) { 
							// uses the audio start and end times to create a point in the timeline for the audio to kick in
							const audio = audios[i];
							const baseDuration = audio.stop - audio.start;
							const duration = Math.max(baseDuration, audio.trimEnd) - audio.trimStart;
							chicanery.input(audio.filepath);
							chicanery.addInputOption("-t", frameToSec(duration));
							if (audio.trimStart > 0) chicanery.seekInput(frameToSec(audio.trimStart));
							complexFilterString += `[${Number(i) + 1}:a]adelay=${(frameToSec(audio.start) * 1e3) - delay}[audio${i}];`;
							delay += 100;
						}
						if (complexFilterString) chicanery.complexFilter(complexFilterString + `${
							// combines the audio to a complex filter string to add the audio to the timeline
							audios.map((_, i) => `[audio${i}]`).join("")
						}amix=inputs=${audios.length}[a]`).outputOptions("-map", "[a]");
						// creates the final video product using ffmpeg
						chicanery.addOutputOptions("-async", "1").videoCodec("libx264").audioCodec(
							"aac"
						).outputOptions("-pix_fmt", "yuv420p").outputOptions("-ac", "1").outputOptions(
							"-map", "0:v"
						).outputOptions("-framerate", framerate).outputOptions("-r", framerate).duration(frameToSec(frames.length)).output(
							`./previews/${data.id}.mp4`
						).run();
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
