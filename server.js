const env = Object.assign(process.env, require("./env"), require("./config"));
const apiKeys = Object.assign(process.env.API_KEYS, {
	Topmediaai: "7023b52a96aa48ce8bd32e2233ef0cc2",
	FreeConvert: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZ2EiLCJpZCI6IjY0ZTkzOGY3ZWEwMWJhZDg0ZGRiMTg2ZSIsImludGVyZmFjZSI6ImFwaSIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJqYWNraWVjcm9zbWFuQGdtYWlsLmNvbSIsInBlcm1pc3Npb25zIjpbXSwiaWF0IjoxNjkzMDA2MTEwLCJleHAiOjIxNjYzNzAxMTB9.96d6AQ5hwUdpDWIpL0jGDgShkky9NcK_RJAslHjmaRc"
})
const mp3Duration = require("mp3-duration");
const asset = require("./asset/main");
const tts = require("./tts/main");
const http = require("http");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fUtil = require("./misc/file");
const nodezip = require("node-zip");
const loadPost = require("./misc/post_body");
const https = require("https");
const chr = require("./character/redirect");
const pmc = require("./character/premade");
const chl = require("./character/load");
const chs = require("./character/save");
const cht = require("./character/thmb");
const chh = require("./character/head");
const mvu = require("./movie/upload");
const asu = require("./asset/upload");
const swf = require("./static/swf");
const qvm = require("./static/qvm");
const snd = require("./sound/save");
const str = require("./starter/save");
const stl = require("./static/load");
const tmp = require("./static/tmp");
const pre = require("./static/preview");
const stp = require("./static/page");
const asl = require("./asset/load");
const asL = require("./asset/list");
const ast = require("./asset/thmb");
const mvl = require("./movie/load");
const mvL = require("./movie/list");
const mvm = require("./movie/meta");
const mvs = require("./movie/save");
const mvt = require("./movie/thmb");
const ebd = require("./movie/embed");
const thL = require("./theme/list");
const thl = require("./theme/load");
const tsv = require("./tts/voices");
const tsl = require("./tts/load");
const fme = require("./static/frames");
const pse = require("./movie/parse");
const fs = require("fs");
const url = require("url");
const formidable = require("formidable");
const session = require("./misc/session");
const functions = [mvL, qvm, tmp, ebd, pre, snd, fme, str, swf, tsl, pmc, asl, chl, chh, thl, thL, chs, cht, asL, chr, ast, mvm, mvl, mvs, mvt, tsv, asu, mvu, stp, stl];
function stream2Buffer(readStream) {
	return new Promise((res, rej) => {
		let buffers = [];
		readStream.on("data", (c) => buffers.push(c));
		readStream.on("end", () => res(Buffer.concat(buffers)));
	});
}
module.exports = http
	.createServer((req, res) => {
		try {
			if (!fs.existsSync('./_ASSETS/users.json')) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify({
				users: []
			}, null, "\t"));
			if (!fs.existsSync(env.SAVED_FOLDER)) fs.mkdirSync(env.SAVED_FOLDER);
			const parsedUrl = url.parse(req.url, true);
			function missingFilesError() {
				return res.end(JSON.stringify({
					success: false,
					error: "One of the files is missing from your zip file. please upload a zip file with all of the files in tact."
				}));
			}
			function sameFilesError() {
				return res.end(JSON.stringify({
					success: false,
					error: "Some of your files have ids that are already in this server. please upload a different zip file that contains the profile.json file and files with different ids."
				}));
			}
			//pages
			switch (req.method) {
				case "GET": {
					switch (parsedUrl.pathname) {
						case "/api/getTTSVoices": { // gets all of the TTS Voices
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./tts/info.json'))));
							break;
						}
						case "/api/themes/get": { // list's all themes from the themelist.xml file
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(pse.getThemes()));
							break;
						} case "/api/convertUrlQuery2JSON": { // idk
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(parsedUrl.query));
							break;
						} default: break;
					}
					break;
				} case "POST": {
					switch (parsedUrl.pathname) {
						case "/api/updateCustomCSS": {
							loadPost(req, res).then(([data]) => {
								res.setHeader("Content-Type", "application/json");
								try {
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const userInfo = json.users.find(i => i.id == data.uid);
									userInfo.settings.api.customcss = data.newcss;
									fs.writeFileSync("./_ASSETS/users.json", JSON.stringify(json, null, "\t"));
									res.end(JSON.stringify({
										success: true
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e
									}));
								}
							});
							break;
						} case "/api/updateTTSApi": {
							loadPost(req, res).then(([data]) => {
								res.setHeader("Content-Type", "application/json");
								try {
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const userInfo = json.users.find(i => i.id == data.uid);
									userInfo.settings.api.ttstype.value = data.newapi;
									userInfo.settings.api.ttstype.apiserver = data.newapiserver;
									fs.writeFileSync("./_ASSETS/users.json", JSON.stringify(json, null, "\t"));
									res.end(JSON.stringify({
										success: true
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e
									}));
								}
							});
							break;
						} case "/api/checkEmail": {
							loadPost(req, res).then(([data]) => {
								res.setHeader("Content-Type", "application/json");
								if (JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.email == data.email)) res.end(JSON.stringify({
									success: false,
									error: "Your Email Address has already been taken by someone with either a google or flashthemes account"
								}));
								else res.end(JSON.stringify({
									success: true
								}));
							});
							break;
						}
						case "/api/removeSession": {
							loadPost(req, res).then(([data]) => {
								if (session.remove(req, data)) res.end(JSON.stringify({
									success: true
								}));
							});
							break;
						} case "/api/getUserInfoFromSession": { // sends user info from the current session
							res.setHeader("Content-Type", "application/json");
							const currentSession = session.get(req);
							if (currentSession.data.loggedIn && currentSession.data.current_uid) {
								res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == currentSession.data.current_uid)));
							} else res.end(JSON.stringify({}));
							break;
						} case "/api/getSession": { // gets a user's session using their public IP address.
							res.end(JSON.stringify(session.get(req)));
							break;
						} case "/api/addFTAcc": { // add the flashthemes account to the server after all checks are complete.
							loadPost(req, res).then(async ([data]) => {
								res.setHeader("Content-Type", "application/json");
								if (data.code == '0') try {
									function findUserInfo() {
										return new Promise((res, rej) => {
											const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
											let hasUsers = false;
											for (const userInfo of json.users) try {
												hasUsers = true;
												if (userInfo.isFTAcc && userInfo.hash) {
													bcrypt.compare(data.password, userInfo.hash, function(err, result) {
														if (err) res({
															success: false,
															error: err,
															info: "unknown_error"
														});
														else res({
															success: result,
															data: result ? userInfo : {},
															info: "success"
														});
													});
												} else res({
													success: false,
													error: "No FlashThemes Account Has Been Found In The GoNexus DB! Creating DB...",
													info: "ft_acc_not_found"
												});
											} catch (e) {
												rej(e);
											}
											if (!hasUsers) res({
												success: false,
												error: "No FlashThemes Account Has Been Found In The GoNexus DB! Creating DB...",
												info: "ft_acc_not_found"
											});
										});
									}
									const json = await findUserInfo();
									if (!json.success) {
										console.log(data.displayName);
										console.error(new Error(json.error));
										switch (json.info) {
											case "unknown_error": {
												res.end(JSON.stringify({
													success: false,
													error: json.error
												}));
												break;
											} case "ft_acc_not_found": {
												if (!data.displayName) {
													console.warn("Your Display Name is required in order to finish setting up your flashthemes account for GoNexus.");
													res.end(JSON.stringify({
														displayNameRequired: true
													}));
												} else {
													const num = Math.floor(Math.random() * (50 - 1 + 1) + 1);
													const uid = crypto.randomBytes(num).toString('hex');
													console.log(num, uid);
													bcrypt.genSalt(num, (err, salt) => {
														console.log(salt);
														if (err) return res.end(JSON.stringify({
															success: false,
															error: err
														}));
														bcrypt.hash(data.password, salt, (err, hash) => {
															console.log(hash);
															if (err) return res.end(JSON.stringify({
																success: false,
																error: err
															}));
															const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
															if (json.users.find(i => i.email == data.email)) {
																console.error(new Error("Your email address has already been taken by someone who created their account on GoNexus."));
																return res.end(JSON.stringify({
																	success: false,
																	error: "Your email address has already been taken by someone who created their account on GoNexus."
																}))
															}
															json.users.unshift({
																name: data.displayName,
																isFTAcc: true,
																hash,
																id: uid,
																email: data.email,
																movies: [],
																assets: [],
																apiKeys: {
																	Topmediaai: "",
																	FreeConvert: ""
																},
																settings: {
																	api: {
																		ttstype: {
																			apiserver: "https://lazypy.ro/",
																			value: "Acapela"
																		},
																		customcss: ""
																	}
																}
															});
															fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
															if (session.set(req, {
																loggedIn: true,
																current_uid: uid,
																displayName,
																email: data.email
															})) res.end(JSON.stringify({
																success: true
															}));
														});
													});
												};
												break;
											}
										}
									} else if (session.set(req, {
										loggedIn: true,
										current_uid: json.data.id,
										displayName: json.data.name,
										email: json.data.email
									})) {
										res.end(JSON.stringify({
											success: true
										}));
									}
								} catch (e) {
									console.log(e);
								}
							});
							break; // checks flashthemes's server to see if the account info the user entered in exists in their servers. if something went wrong, an error spits out.
						} case "/api/checkFTAcc": {
							loadPost(req, res).then(([data]) => {
								https.request({
									hostname: "flashthemes.net",
									path: "/ajax/doLogin",
									method: "POST",
									headers: { 
										"Content-Type": "application/json"
									}
								}, r => {
									const buffers = [];
									r.on("data", b => buffers.push(b)).on("end", () => {
										res.end(Buffer.concat(buffers).toString("utf8"));
									});
								}).end(JSON.stringify(data));
							});
							break;
						} case "/api/submitAPIKeys": { // sends both the Topmediai and FreeConvert API Keys To The Server
							loadPost(req, res).then(([data]) => {
								if (!data.uid) return res.end(JSON.stringify({
									success: false,
									message: "Please login to your account in order to submit both your Topmediai and FreeConvert API Keys"
								}));
								const usersJson = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
								const userInfo = usersJson.users.find(i => i.id == data.uid);
								const API_KEYS = {
									topMediaAIKey: userInfo.apiKeys.Topmediaai || apiKeys.Topmediaai,
									freeConvertKey: userInfo.apiKeys.FreeConvert || apiKeys.FreeConvert
								};
								function submitFreeConvertKey(dontWrite = false) {
									return new Promise((res, rej) => {
										try {
											userInfo.apiKeys.FreeConvert = data.freeConvertKey;
											if (!dontWrite) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
											res();
										} catch (e) {
											rej(e);
										}
									});
								}
								function submitTopMediaAIKey(dontWrite = false) {
									return new Promise((res, rej) => {
										try {
											https.get({
												hostname: "api.topmediai.com",
												path: "/v1/get_api_key_info",
												headers: {
													accept: 'application/json',
													'x-api-key': data.topMediaAIKey
												}
											}, (r) => {
												const buffers = [];
												r.on("data", b => buffers.push(b)).on("end", () => {
													const json = JSON.parse(Buffer.concat(buffers));
													console.log(json);
													if (json.detail) {
														switch (typeof json.detail) {
															case "string": {
																switch (json.detail) {
																	case "x_api_key is invalid": return rej("Invaild API key for Topmediaai. Please enter a correct API key for Topmediaai.");
																}
																break;
															}
														}
													} else if (json.x_api_key && json.email) {
														if (json.email != userInfo.email) return rej("The api key you typed in for Topmediaai does not belong to you. Please enter in your own api key for Topmediaai.");
														userInfo.apiKeys.Topmediaai = json.x_api_key;
														if (!dontWrite) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
														res();
													}
												}).on("error", rej);
											}).on("error", rej);
										} catch (e) {
											rej(e);
										}
									})
								}
								if (API_KEYS.topMediaAIKey != data.topMediaAIKey) {
									submitTopMediaAIKey().then(() => {
										return res.end(JSON.stringify({
											success: true,
											message: "Your api key for Topmediaai has been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										return res.end(JSON.stringify({
											success: false,
											message: e
										}));
									});
								} else if (API_KEYS.freeConvertKey != data.freeConvertKey) {
									submitFreeConvertKey().then(() => {
										return res.end(JSON.stringify({
											success: true,
											message: "Your api key for freeConvert has been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										return res.end(JSON.stringify({
											success: false,
											message: e
										}));
									});
								}
								submitTopMediaAIKey(true).then(() => {
									submitFreeConvertKey(true).then(() => {
										console.log(userInfo);
										fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(usersJson, null, "\t"));
										res.end(JSON.stringify({
											success: true,
											message: "Both your freeConvert and Topmediaai API keys have been sent in successfully!"
										}))
									}).catch(e => {
										console.log(e);
										res.end(JSON.stringify({
											success: false,
											message: e
										}));
									});
								}).catch(e => {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										message: e
									}));
								});
							})
							break;
						} case "/api/fetchAPIKeys": { // fetches the API keys from the server
							const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == parsedUrl.query.uid);
							res.end(JSON.stringify({
								topMediaAIKey: userInfo ? (userInfo.apiKeys.Topmediaai || apiKeys.Topmediaai) : apiKeys.Topmediaai,
								freeConvertKey: userInfo ? (userInfo.apiKeys.FreeConvert || apiKeys.FreeConvert) : apiKeys.FreeConvert
							}));
							break;
						} case "/api/check4MovieAutosaves": { // checks to see if a movie is autosaved or not.
							loadPost(req, res).then(([data]) => {
								console.log(data, fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2))));
								res.end(JSON.stringify({
									isAutosaved: fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2)))
								}));
							});
							break;
						} case "/api/uploadMyStuff": { // uploads a user profile to the server
							new formidable.IncomingForm().parse(req, async (e, f, files) => {
								if (e) {
									console.log(e);
									return res.end(JSON.stringify({
										success: false,
										error: e
									}));
								}
								console.log(f, files);
								if ((files.import.name || files.import.originalFilename).endsWith(".zip") && files.import.mimetype == "application/zip") try {
									const zip = nodezip.unzip(fs.readFileSync(files.import.path || files.import.filepath));
									console.log(zip);
									if (!zip['profile.json']) return res.end(JSON.stringify({
										success: false,
										error: "Your zip file must contain the profile.json file containing your stuff in it witch has been assigned to the profile.json file. please upload a different zip file."
									}));
									const fakeProfile = {
										name: "John Doe",
										id: "490369038276834906546354",
										email: "johndoecreates@goanimate.com",
										movies: [],
										assets: [],
										apiKeys: {
											Topmediaai: "775690357860759807389",
											FreeConvert: "9538673598094783458348540325739893478692085848745"
										},
										settings: {
											api: {
												ttstype: {
													apiserver: "https://lazypy.ro/",
													value: "Acapela"
												},
												customcss: ""
											}
										}
									}
									const json = JSON.parse(await stream2Buffer(zip['profile.json'].toReadStream()));
									console.log(json);
									for (const i in fakeProfile) if (!json[i]) return res.end(JSON.stringify({
										success: false,
										error: "Your profile.json file does not contain the fields like your name, id, email, movies, and assets. Please upload a different zip file."
									}));
									if (json.id != f.userId) res.end(JSON.stringify({
										success: false,
										error: "You cannot upload someone else's stuff to this server due to sercuity conserns. please upload your own stuff."
									}));
									else {
										const usersFile = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
										const meta = usersFile.users.find(i => i.id == json.id);
										for (let i = 0; i < json.assets.length; i++) {
											const assetInfo = json.assets[i];
											if (meta.assets[i] && meta.assets[i].id == assetInfo.id) return sameFilesError();
											meta.assets.unshift(assetInfo);
											if (assetInfo.id.startsWith("s-")) {
												if (!zip[assetInfo.id + '.xml'] || !zip[assetInfo.id + '.png']) return missingFilesError();
												fs.writeFileSync(fUtil.getFileIndex("starter-", ".xml", assetInfo.id.substr(2)), await stream2Buffer(zip[assetInfo.id + '.xml'].toReadStream()));
												fs.writeFileSync(fUtil.getFileIndex("starter-", ".png", assetInfo.id.substr(2)), await stream2Buffer(zip[assetInfo.id + '.png'].toReadStream()));
											} else {
												if (!zip[assetInfo.file]) return missingFilesError();
												fs.writeFileSync(`./_ASSETS/${assetInfo.file}`, await stream2Buffer(zip[assetInfo.file].toReadStream()));
											}
										}
										for (let i = 0; i < json.movies.length; i++) {
											const movieInfo = json.movies[i];
											if (meta.movies[i] && meta.movies[i].id == movieInfo.id) return sameFilesError();
											meta.movies.unshift(movieInfo);
											if (movieInfo.id.startsWith("m-")) {
												if (!zip[movieInfo.id + '.xml'] || !zip[movieInfo.id + '.png']) return missingFilesError();
												fs.writeFileSync(fUtil.getFileIndex("movie-", ".xml", movieInfo.id.substr(2)), await stream2Buffer(zip[movieInfo.id + '.xml'].toReadStream()));
												fs.writeFileSync(fUtil.getFileIndex("thumb-", ".png", movieInfo.id.substr(2)), await stream2Buffer(zip[movieInfo.id + '.png'].toReadStream()));
											}
										}
										fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(usersFile, null, "\t"));
										res.end(JSON.stringify({
											success: true,
											msg: "Your stuff has successfully been uploaded to the server. If you need to upload any more of your stuff to this server, feel free to do so."
										}));
									}
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e
									}));
								}
								else res.end(JSON.stringify({
									success: false,
									error: "Invalid File Type"
								}));
							});
							break;
						} case "/api/fetchMyStuff": { // fetches the user profile from the server
							loadPost(req, res).then(async ([data]) => {
								try {
									const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == data.uid);
									const zip = nodezip.create();
									fUtil.addToZip(zip, 'profile.json', JSON.stringify(userInfo, null, "\t"));
									for (const assetInfo of userInfo.assets) {
										if (assetInfo.id.startsWith("s-")) {
											fUtil.addToZip(zip, assetInfo.id + '.xml', fs.readFileSync(fUtil.getFileIndex("starter-", ".xml", assetInfo.id.substr(2))));
											fUtil.addToZip(zip, assetInfo.id + '.png', fs.readFileSync(fUtil.getFileIndex("starter-", ".png", assetInfo.id.substr(2))));
										} else fUtil.addToZip(zip, assetInfo.file, fs.readFileSync(`./_ASSETS/${assetInfo.file}`));
									}
									for (const movieInfo of userInfo.movies) {
										if (movieInfo.id.startsWith("m-")) {
											fUtil.addToZip(zip, movieInfo.id + '.xml', fs.readFileSync(fUtil.getFileIndex("movie-", ".xml", movieInfo.id.substr(2))));
											fUtil.addToZip(zip, movieInfo.id + '.png', fs.readFileSync(fUtil.getFileIndex("thumb-", ".png", movieInfo.id.substr(2))));
										}
									}
									fs.writeFileSync(`${env.CACHÉ_FOLDER}/myStuff.zip`, await zip.zip());
									res.end(JSON.stringify({
										success: true,
										fileUrl: '/tmp/myStuff.zip'
									}));
								} catch (e) {
									console.log(e);
									res.end(JSON.stringify({
										success: false,
										error: e
									}));
								}
							});
							break;
						} case "/api/getProjectDownloads": { // lists downloads for this project without the need to upload files. base64 will help just nicely.
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({
								hasProjectDownloads: false,
								projectDownloads: []
							}));
							break;
						} case "/api/getAllUsers": { // fetches all users on this server
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users));
							break;
						} case "/api/submitSiteAccessKey": { // grants a user permision to the site
							loadPost(req, res).then(([data]) => {
								if (!data.access_key) res.end(JSON.stringify({error: "Please enter in an access key."}));
								else if (data.access_key != env.PROJECT_ACCESS_KEY) res.end(JSON.stringify({error: "Invaild Access Key"}));
								else if (
									session.set(
										req, {
											site_access_key_is_correct: true
										}
									)
								) {
									if (data.returnto) res.end(JSON.stringify({success: true, url: data.returnto}));
									else res.end(JSON.stringify({success: true}));
								}
							});
							break;
						} case "/api/redirect": { // idk
							res.statusCode = 302;
							res.setHeader("Location", "/");
							res.end();
							break;
						} case "/api/check4SavedUserInfo": { // checks for some saved user info on the server
							loadPost(req, res).then(([data]) => {
								try {
									const info = {
										name: true,
										id: true,
										email: true
									}
									const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
									const meta = json.users.find(i => i.id == data.uid);
									if (!meta) {
										json.users.unshift({
											name: data.displayName,
											id: data.uid,
											email: data.email,
											movies: [],
											assets: [],
											apiKeys: {
												Topmediaai: "",
												FreeConvert: ""
											},
											settings: {
												api: {
													ttstype: {
														apiserver: "https://lazypy.ro/",
														value: "Acapela"
													},
													customcss: ""
												}
											}
										});
									} else {
										for (const stuff in data) {
											if (info[stuff]) {
												if (data[stuff] != meta[stuff]) {
													meta[stuff] = data[stuff];
												}
											}
										}
									}
									fs.writeFileSync('./_ASSETS/users.json', JSON.stringify(json, null, "\t"));
								} catch (e) {
									console.log(e);
								}
								res.end();
							})
							break;
						} default: break;
					}
					break;
				} default: break;
			}
			functions.find((f) => f(req, res, parsedUrl));
		} catch (x) {
			res.statusCode = 500;
			console.log(x);
			res.end("Internal Server Error");
		}
		console.log(req.method, req.url, '-', res.statusCode);
	}).listen(env.PORT || env.SERVER_PORT, () => {
		if (!fs.existsSync('./_CACHÉ')) fs.mkdirSync('./_CACHÉ');
		fs.readdirSync(env.CACHÉ_FOLDER).forEach(file => fs.unlinkSync(`${env.CACHÉ_FOLDER}/${file}`));
		console.log("GoNexus Has Started.");
	});
