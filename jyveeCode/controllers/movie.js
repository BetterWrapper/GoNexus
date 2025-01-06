/**
 * qvm generation jyvee edition (made for specific templates)
 */
// modules
const fs = require("fs");
// stuff
const Movie = require("../models/movie");
const movie = require("../../movie/main");
const tempbuffer = require("../../tts/tempBuffer");
const tts = require("../../tts/main");
const fUtil = require("../../misc/file");
const loadPost = require("../../misc/post_body");
function guyResponse(guy, res, data, req, extraData) {
	console.log(guy.success);
	if (guy.success == true) {
		const obj = movie.addArray2ObjectWithNumbers(movie.assignObjects({}, movie.stringArray2Array(data)));
		res.end(JSON.stringify(movie.assignObjects({
			player_object: {
				ext: "xml",
				filename: "qvm",
				movieId: "templatePreview",
				siteId: "go",
				is_golite_preview: 1,
				isTemplate: 1,
				autostart: 1,
				isEmbed: 1,
				appCode: "go",
				apiserver: req.headers.origin + "/",
				storePath: req.headers.origin + "/static/store/<store>"
			},
			enc_mid: data.enc_mid || `m-${fUtil.getNextFileId("movie-", ".xml")}`,
			opening_closing: {
				fileInfo: {
					name: "qvm",
					ext: "xml"
				}
			},
			playerYearOptions: extraData.playerYearOptions,
			hasPlayerYearOptions: extraData.hasPlayerYearOptions
		}, [obj])));
	} else res.end(JSON.stringify({
		error: guy.message
	}));
}
module.exports = (req, res, url) => {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/ajax/previewText2Video": {
			if (fs.existsSync('./previews/qvm.xml')) fs.unlinkSync('./previews/qvm.xml');
			loadPost(req, res).then(async f => {
				//HOLY SHIT REWRITING THIS WITH THE RIGHT RESPONSE
				const qvm_theme = f.golite_theme;
				const expressions = [];
				const cam = [];
				const charorder = [];
				const charids = []
				const texts = [];
				const mcids = [];
				const template = f.enc_tid;
				const templateInfo = JSON.parse(fs.readFileSync(`./templates.json`))[qvm_theme] || {};
				let scriptscene = 0;
				const voicez = [];
				let focuschar = "";
				for (const data in f) { // characters & script timings
					if (data.includes(`characters[`)) {
						console.log(data.indexOf("]"));
						let start = data.indexOf("]");
						console.log(data.slice(start + 2, -1));
						charids.push(data.slice(start + 2, -1));
					}
					if (data.includes(`script[${scriptscene}]`)) scriptscene++;
					if (data.includes(`script[`)) {
						if (data.includes(`text`)) {
							console.log(f[data]);
							if (f[data].toString().includes("#1 -")) {
								console.log("INCLUDED THE CAMERA!!!!")
								console.log(f[data].toString().substring(4));
								texts.push(f[data].toString().substring(4));
								// These only matter for certain qvms (Talking picz)
								cam.push("out");
							}
							else {
								texts.push(f[data]);
								// These only matter for certain qvms (Talking picz)
								cam.push("normal");
							}
						}
						if (data.includes(`aid`)) {
							console.log(f[data]);
							mcids.push(f[data]);
						}
						if (data.includes(`char_num`)) {
							console.log(f[data]);
							focuschar = f[data];
							charorder.push(f[data]);
						}
						if (data.includes(`facial`) && data.includes("l][" + focuschar)) {
							console.log(f[data]);
							expressions.push(f[data]);
						}
						if (data.includes(`voice`)) {
							console.log(f[data]);
							voicez.push(f[data]);
						}
					}
				}
				console.log(mcids);
				//Important!!!
				let char1id = charids[1];
				let char2id = charids[0];
				if (templateInfo.nonSelectableCharInfo.name != undefined) char2id = charids[1];
				let sound = 0;
				const scenetimes = [];
				let sum = 0;
				let duration;
				const ttsid = [];
				let di;
				let ouri = 0;
				await gentts();
				//Had to rewrite this because it kept cutting out clips
				async function gentts() {
					let i = ouri;
					if (mcids[i] == "") try {
						console.log("page:", i);
						if (!texts[i]) res.end(JSON.stringify({
							error: `Please enter some text for dialog ${i + 1}.`
						}));
						tts.genVoice4Qvm(voicez[i], texts[i]).then(body => {
							try {
								movie.templateAssets.set(body);
								const di = body.id;
								setTimeout(async () => {
									const buffer = tempbuffer.get(di);
									const duration = await fUtil.mp3Duration(buffer);
									if (duration.toString().includes(".")) {
										const round = Math.round(duration);
										let seconds = round / 1000;
										console.log("This is rounding:" + seconds);
										scenetimes.push(seconds + 1);
									} else {
										let seconds = duration / 1000;
										console.log(seconds);
										scenetimes.push(seconds + 1);
									}
									console.log("Id:" + di);
									ttsid.push(di);
									let helper = ttsid.toString();
									while (!ttsid.toString().includes(di)) {
										if (!helper.includes(di)) {
											ttsid.push(di);
											console.log("Keep pushing till its there");
										}
									}
									ouri++;
									if (i == texts.length - 1) Movie.genxml(
										qvm_theme, char1id, char2id, expressions, charorder, cam, ttsid, scenetimes, template
									).then(guy => guyResponse(guy, res, f, req, {
										hasPlayerYearOptions: templateInfo.playerYearOptions ? Object.keys(
											templateInfo.playerYearOptions
										).length > 1 : false,
										playerYearOptions: templateInfo.playerYearOptions
									}));
									else await gentts();
								}, 200);
							} catch (e) {
								console.log(e);
								res.end(JSON.stringify({
									error: e.toString()
								}));
							}
						}).catch((e) => {
							console.log(e);
							res.end(JSON.stringify({
								error: e.toString()
							}));
						})
					} catch (e) {
						console.log(e);
						res.end(JSON.stringify({
							error: e.toString()
						}));
					} else try {
						ttsid.push(mcids[i] + ".mp3");
						let helper = ttsid.toString();
						while (!ttsid.toString().includes(mcids[i])) {
							if (!helper.includes(mcids[i])) {
								ttsid.push(mcids[i] + ".mp3");
								console.log("Keep pushing till its there");
							}
						}
						const micbuffer = tempbuffer.get(mcids[i] + ".mp3");
						const duration = await fUtil.mp3Duration(micbuffer);
						if (duration.toString().includes(".")) {
							const round = Math.round(duration);
							let seconds = round / 1000;
							console.log("This is rounding:" + seconds);
							scenetimes.push(seconds + 1);
						} else {
							let seconds = duration / 1000;
							console.log(seconds);
							scenetimes.push(seconds + 1);
						}
						ouri++;
						if (i == texts.length - 1) Movie.genxml(
							qvm_theme, char1id, char2id, expressions, charorder, cam, ttsid, scenetimes, template
						).then(guy => guyResponse(guy, res, f, req, {
							hasPlayerYearOptions: templateInfo.playerYearOptions ? Object.keys(
								templateInfo.playerYearOptions
							).length > 1 : false,
							playerYearOptions: templateInfo.playerYearOptions
						}));
						else await gentts();
					} catch (e) {
						console.log(e);
						res.end(JSON.stringify({
							error: e.toString()
						}));
					}
				}
			})
			break;
		} default: return;
	}
	return true;
}
