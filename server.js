const env = Object.assign(process.env, require("./env"), require("./config"));
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

const functions = [mvL, qvm, ebd, pre, snd, fme, str, swf, pmc, asl, chl, chh, thl, thL, chs, cht, asL, tsl, chr, ast, mvm, mvl, mvs, mvt, tsv, asu, mvu, stp, stl];

module.exports = http
	.createServer((req, res) => {
		try {
			if (!fs.existsSync('./_ASSETS/users.json')) fs.writeFileSync('./_ASSETS/users.json', JSON.stringify({
				users: []
			}, null, "\t"));
			if (!fs.existsSync('./_SAVED')) fs.mkdirSync('./_SAVED');
			const parsedUrl = url.parse(req.url, true);
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
						case "/api/submitSiteAccessKey": {
							loadPost(req, res).then(([data]) => {
								console.log(data);
							})
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
	})
	.listen(env.PORT || env.SERVER_PORT, console.error);
