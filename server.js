const env = Object.assign(process.env, require("./env"), require("./config"));
const fUtil = require("./misc/file");
const nodezip = require("node-zip");
const loadPost = require("./misc/post_body");
const http = require("http");
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
const functions = [mvL, qvm, tmp, ebd, pre, snd, fme, str, swf, pmc, asl, chl, chh, thl, thL, chs, cht, asL, tsl, chr, ast, mvm, mvl, mvs, mvt, tsv, asu, mvu, stp, stl];
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
						case "/api/getTTSVoices": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./tts/info.json'))));
							break;
						}
						case "/api/themes/get": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(pse.getThemes()));
							break;
						} case "/api/convertUrlQuery2JSON": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(parsedUrl.query));
							break;
						} default: break;
					}
					break;
				} case "POST": {
					switch (parsedUrl.pathname) {
						case "/api/check4MovieAutosaves": {
							loadPost(req, res).then(([data]) => {
								console.log(data, fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2))));
								res.end(JSON.stringify({
									isAutosaved: fs.existsSync(fUtil.getFileIndex("movie-autosaved-", ".xml", data.mId.substr(2)))
								}));
							});
							break;
						} case "/api/uploadMyStuff": {
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
										assets: []
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
						} case "/api/fetchMyStuff": {
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
						} case "/api/getProjectDownloads": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({
								hasProjectDownloads: false,
								projectDownloads: []
							}));
							break;
						} case "/api/getAllUsers": {
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users));
							break;
						} case "/api/submitSiteAccessKey": {
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
						} case "/api/redirect": {
							res.statusCode = 302;
							res.setHeader("Location", "/");
							res.end();
							break;
						} case "/api/getAllUsers": {
							res.end(JSON.stringify(JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users));
							break;
						} case "/api/check4SavedUserInfo": {
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
											assets: []
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
		fs.readdirSync(env.CACHÉ_FOLDER).forEach(file => fs.unlinkSync(`${env.CACHÉ_FOLDER}/${file}`));
		console.log("GoNexus Has Started.");
	});
