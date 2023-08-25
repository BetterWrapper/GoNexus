const info = require("./info");
const voices = info.voices;
const qs = require("querystring");
const brotli = require("brotli");
const https = require("https");
const md5 = require("js-md5");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const mp3Duration = require("mp3-duration");

module.exports = {
	genVoice(voiceName, rawText) {
		return new Promise(async (res, rej) => {
			try {
				const voice = voices[voiceName];
				let flags = {};
				const pieces = rawText.split("#%");
				let text = pieces.pop().substring(0, 180);
				for (const rawFlag of pieces) {
					const index = rawFlag.indexOf("=");
					if (index == -1) continue;
					const name = rawFlag.substring(0, index);
					const value = rawFlag.substring(index + 1);
					flags[name] = value;
				}
				if (!voice) rej("The selected voice does not exist.");
				else switch (voice.source.toLowerCase()) {
					case "voiceforge": {
						const q = qs.encode({						
							msg: text,
							voice: voice.arg,
							email: "null"
						});
						
						https.get({
							hostname: "api.voiceforge.com",
							path: `/swift_engine?${q}`,
							headers: { 
								"User-Agent": "just_audio/2.7.0 (Linux;Android 11) ExoPlayerLib/2.15.0",
								"HTTP_X_API_KEY": "8b3f76a8539",
								"Accept-Encoding": "identity",
								"Icy-Metadata": "1",
							}
						}, (r) => {
							const stream = ffmpeg(r).inputFormat('wav').toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
								rej(`Encoding Error: ${error.message}`);
							}).pipe();
							const buffers = [];
							stream.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
						}).on("error", rej);
						break;
					} case "polly": {
						const body = qs.encode({
							msg: text,
							lang: voice.arg,
							source: "ttsmp3"
						});
						https.request({
							hostname: "ttsmp3.com",
							path: "/makemp3_new.php",
							method: "POST",
							headers: { 
								"Content-Length": body.length,
								"Content-type": "application/x-www-form-urlencoded"
							}
						}, (r) => {
							let body = "";
							r.on("data", (c) => body += c).on("end", () => {
								const json = JSON.parse(body);
								if (json.Error == 1) return rej(json.Text);
								https.get(json.URL, (r) => {
									var buffers = [];
									r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
								}).on("error", rej);
							}).on("error", rej);
						}).on("error", rej).end(body);
						break;
					} case "cepstral": {
						let pitch;
						if (flags.pitch) {
							pitch = +flags.pitch;
							pitch /= 100;
							pitch *= 4.6;
							pitch -= 0.4;
							pitch = Math.round(pitch * 10) / 10;
						} else {
							pitch = 1;
						}
						https.get("https://www.cepstral.com/en/demos", async (r) => {
							const cookie = r.headers["set-cookie"];
							const q = qs.encode({
								voiceText: text,
								voice: voice.arg,
								createTime: 666,
								rate: 170,
								pitch: pitch,
								sfx: "none"
							});
	
							https.get(
								{
									hostname: "www.cepstral.com",
									path: `/demos/createAudio.php?${q}`,
									headers: { Cookie: cookie }
								},
								(r) => {
									let body = "";
									r.on("data", (b) => body += b);
									r.on("end", () => {
										const json = JSON.parse(body);
	
										https
											.get(`https://www.cepstral.com${json.mp3_loc}`, (r) => {
												var buffers = [];
												r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
											}).on("error", rej);
									});
									r.on("error", rej);
								}
							).on("error", rej);
						}).on("error", rej);
						break;
					} case "vocalware": {
						var [eid, lid, vid] = voice.arg;
						var cs = md5(`${eid}${lid}${vid}${text}1mp35883747uetivb9tb8108wfj`);
						var q = qs.encode({
							EID: voice.arg[0],
							LID: voice.arg[1],
							VID: voice.arg[2],
							TXT: text,
							EXT: "mp3",
							IS_UTF8: 1,
							ACC: 5883747,
							cache_flag: 3,
							CS: cs,
						});
						https.get({
							host: "cache-a.oddcast.com",
							path: `/tts/gen.php?${q}`,
							headers: {
								Referer: "https://www.oddcast.com/",
								Origin: "https://www.oddcast.com/",
								"User-Agent":
									"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
							},
						}, (r) => {
							var buffers = [];
							r.on("data", (d) => buffers.push(d));
							r.on("end", () => res(Buffer.concat(buffers)));
							r.on("error", rej);
						}).on("error", rej);
						break;
					} case "acapela": {
						let acapelaArray = [];
						for (let c = 0; c < 15; c++) acapelaArray.push(~~(65 + Math.random() * 26));
						const email = `${String.fromCharCode.apply(null, acapelaArray)}@gmail.com`;
	
						let req = https.request(
							{
								hostname: "acapelavoices.acapela-group.com",
								path: "/index/getnonce",
								method: "POST",
								headers: {
									"Content-Type": "application/x-www-form-urlencoded",
								},
							},
							(r) => {
								let buffers = [];
								r.on("data", (b) => buffers.push(b));
								r.on("end", () => {
									const nonce = JSON.parse(Buffer.concat(buffers)).nonce;
									let req = https.request(
										{
											hostname: "acapela-group.com",
											port: "8443",
											path: "/Services/Synthesizer",
											method: "POST",
											headers: {
												"Content-Type": "application/x-www-form-urlencoded",
											},
										},
										(r) => {
											let buffers = [];
											r.on("data", (d) => buffers.push(d));
											r.on("end", () => {
												const html = Buffer.concat(buffers);
												const beg = html.indexOf("&snd_url=") + 9;
												const end = html.indexOf("&", beg);
												const sub = html.subarray(beg, end).toString();
	
												https.get(sub, (r) => {
													var buffers = [];
													r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
												}).on("error", rej);
											});
											r.on("error", rej);
										}
									).on("error", rej);
									req.end(
										qs.encode({
											req_voice: voice.arg,
											cl_pwd: "",
											cl_vers: "1-30",
											req_echo: "ON",
											cl_login: "AcapelaGroup",
											req_comment: `{"nonce":"${nonce}","user":"${email}"}`,
											req_text: text,
											cl_env: "ACAPELA_VOICES",
											prot_vers: 2,
											cl_app: "AcapelaGroup_WebDemo_Android",
										})
									);
								});
							}
						).on("error", rej);
						req.end(
							new URLSearchParams({
								json: `{"googleid":"${email}"`,
							}).toString()
						);
						break;
					} case "readloud": {
						const req = https.request(
							{
								hostname: "101.99.94.14",														
								path: voice.arg,
								method: "POST",
								headers: { 			
									Host: "gonutts.net",					
									"Content-Type": "application/x-www-form-urlencoded"
								}
							},
							(r) => {
								let buffers = [];
								r.on("data", (b) => buffers.push(b));
								r.on("end", () => {
									const html = Buffer.concat(buffers);
									const beg = html.indexOf("/tmp/");
									const end = html.indexOf("mp3", beg) + 3;
									const path = html.subarray(beg, end).toString();
	
									if (path.length > 0) {
										https.get({
											hostname: "101.99.94.14",	
											path: `/${path}`,
											headers: {
												Host: "gonutts.net"
											}
										}, (r) => {
											var buffers = [];
											r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
										}).on("error", rej);
									} else {
										return rej("Could not find voice clip file in response.");
									}
								});
							}
						);
						req.on("error", rej);
						req.end(
							qs.encode({
								but1: text,
								butS: 0,
								butP: 0,
								butPauses: 0,
								but: "Submit",
							})
						);
						break;
					} case "cereproc": {
						https.request({
							hostname: "www.cereproc.com",
							path: "/themes/benchpress/livedemo.php",
							method: "POST",
							headers: {
								"content-type": "text/xml",
								"accept-encoding": "gzip, deflate, br",
								origin: "https://www.cereproc.com",
								referer: "https://www.cereproc.com/en/products/voices",
								"x-requested-with": "XMLHttpRequest",
								cookie: "Drupal.visitor.liveDemo=666",
							},
						}, (r) => {
							var buffers = [];
							r.on("data", (d) => buffers.push(d));
							r.on("end", () => {
								const xml = String.fromCharCode.apply(null, brotli.decompress(Buffer.concat(buffers)));
								const beg = xml.indexOf("https://cerevoice.s3.amazonaws.com/");
								const end = xml.indexOf(".mp3", beg) + 4;
								const loc = xml.substr(beg, end - beg).toString();
								https.get(loc, (r) => {
									var buffers = [];
									r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
								}).on("error", rej);
							});
							r.on("error", rej);
						}).end(`<speakExtended key='666'><voice>${voice.arg}</voice><text>${
							text
						}</text><audioFormat>mp3</audioFormat></speakExtended>`);
						break;
					} default: rej("The source for the selected voice does not exist.");
				}
			} catch (e) {
				rej(e);
			}
		});
	},
	genAIVoice(voiceName, text, emotion) {
		return new Promise(async (res, rej) => {
			try {
				if (emotion == "default") emotion = "string";
				const voiceInfo = await this.getAIVoiceInfo(voiceName);
				console.log(voiceInfo);
				https.request({
					hostname: "api.topmediai.com",
					path: "/v1/text2speech",
					method: "POST",
					headers: {
						accept: 'application/json',
						'x-api-key': '7023b52a96aa48ce8bd32e2233ef0cc2',
						'Content-Type': 'application/json'
					},
				}, (r) => {
					const buffers = [];
					r.on("data", b => buffers.push(b)).on("end", () => {
						const json = JSON.parse(Buffer.concat(buffers));
						console.log(json);
						if (json.status == 200 && json.message == "Success") {
							if (json.data && json.data.oss_url) {
								https.get(json.data.oss_url, (r) => {
									const stream = ffmpeg(r).inputFormat('wav').toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
										rej(`Encoding Error: ${error.message}`);
									}).pipe();
									const buffers = [];
									stream.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
								})
							} else rej("Unable to retreive the ai voice file url")
						} else rej(json.message);
					})
				}).end(
					JSON.stringify({
						text,
						speaker: voiceInfo.speaker,
						emotion
					})
				).on("error", rej);
			} catch (e) {
				rej(e);
			}
		})
	},
	getAIVoices() {
		return new Promise((res, rej) => {
			try {
				https.get({
					hostname: "api.topmediai.com",
					path: `/v1/voices_list`,
					headers: { 
						accept: "application/json",
						"x-api-key": "7023b52a96aa48ce8bd32e2233ef0cc2"
					}
				}, (r) => {
					const buffers = [];
					r.on("data", (b) => buffers.push(b)).on("end", async () => {
						const json = JSON.parse(Buffer.concat(buffers));
						if (json.Voice) try {
							const jsons = {};
							const vJson = {};
							for (let i = 0; i < json.Voice.length; i++) {
								const v = json.Voice[i];
								if (!v.isvip && v.urlname) {
									if (v.Languagename.match(/[a-zA-Z]/) && v.name.includes(" (") && v.name.includes(")") && info.genderPrefixes[v.name.split(" (")[1].split(")")[0]]) {
										if (v.Languagename.includes(" (") && v.Languagename.includes(")") && info.langPrefixes[v.Languagename.split(" (")[0]]) {
											const l = info.langPrefixes[v.Languagename.split(" (")[0]];
											jsons[l] = jsons[l] || [];
											jsons[l].unshift({
												id: v.urlname,
												desc: v.name,
												sex: info.genderPrefixes[v.name.split(" (")[1].split(")")[0]],
												vendor: "Topmediai",
												demo: l != "fi" ? `https://images.topmediai.com/topmediai/assets/overview/text-to-speech/${v.name.split(" ").join("_")}.wav` : "",
												country: (v.Languagename.split(" (")[1].split(")")[0]).length != 2 ? false : v.Languagename.split(" (")[1].split(")")[0],
												lang: l,
												plus: false,
											});
										} else {
											jsons.default = jsons.default || [];
											jsons.default.unshift({
												id: v.urlname,
												desc: v.name,
												sex: info.genderPrefixes[v.name.split(" (")[1].split(")")[0]],
												vendor: "Topmediai",
												demo: "",
												country: false,
												lang: false,
												plus: false,
											});
										}
									} else {
										jsons.default = jsons.default || [];
										jsons.default.unshift({
											id: v.urlname,
											desc: v.name,
											sex: false,
											vendor: "Topmediai",
											demo: "",
											country: false,
											lang: false,
											plus: false,
										});
									}
								}
							} 
							Object.keys(jsons).sort().map((i) => {
								const v = jsons[i],
								l = i != "default" ? info.languages[i] : "More";
								vJson[i] = {
									desc: l,
									options: v
								};
							});
							res(vJson);
						} catch (e) {
							rej(e);
						} else if (json.detail) {
							if (typeof json.detail == "string") rej(json.detail);
							else rej(json.detail[0].msg);
						}
					}).on("error", rej);
				}).on("error", rej);
			} catch (e) {
				rej(e);
			}
		})
	},
	getAIVoiceInfo(voiceName) {
		return new Promise((res, rej) => {
			try {
				https.get({
					hostname: "api.topmediai.com",
					path: `/v1/voices_list`,
					headers: { 
						accept: "application/json",
						"x-api-key": "7023b52a96aa48ce8bd32e2233ef0cc2"
					}
				}, (r) => {
					const buffers = [];
					r.on("data", (b) => buffers.push(b)).on("end", async () => {
						const json = JSON.parse(Buffer.concat(buffers));
						if (json.Voice) try {
							res(json.Voice.find(i => i.urlname == voiceName));
						} catch (e) {
							rej(e);
						} else if (json.detail) {
							if (typeof json.detail == "string") rej(json.detail);
							else rej(json.detail[0].msg);
						}
					}).on("error", rej);
				}).on("error", rej);
			} catch (e) {
				rej(e);
			}
		})
	},
};
