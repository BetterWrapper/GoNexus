const https = require("https");
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const fetch = require("node-fetch");
const fs = require("fs");
const genderPrefixes = {
	Male: "M",
	Female: "F"
}
const langs = {
	"hi": "Hindi",
	"ku": "Kurdish",
	"az": "Azeri",
	"ur": "Urdu",
	"th": "Thai",
	"el": "Greek",
	"fi": "Suomi",
	"ar": "Arabic",
	"de": "German",
	"fr": "French",
	"da": "Danish",
	"en": "English",
	"es": "Spanish",
	"ca": "Catalan",
	"ru": "Russian",
	"it": "Italian",
	"tr": "Turkish",
	"zh": "Chinese",
	"ja": "Japanese",
	"ro": "Romanian",
	"no": "Norwegian",
	"va": "Valencian",
	"pt": "Portuguese",
	"eo": "Esperanto",
	"gl": "Galician",
	"sv": "Swedish",
	"ko": "Korean",
	"pl": "Polish",
	"nl": "Dutch",
	"cy": "Welsh",
	"id": "Indonesian",
	"fo": "Faroese",
	"is": "Icelandic",
	"gd": "Scottish Gaelic",
	"cs": "Czech"
}
const voices = {};
function getLangPre(langName) {
	for (const lang in langs) {
		if (langs[lang] == langName) return lang;
	}
}

module.exports = {
	sendVoiceInfo(voiceName, data) {
		voices[voiceName] = data;
	},
	getVoiceInfo(voiceName) {
		return voices[voiceName];
	},
	genVoice(voiceName, text) {
		return new Promise(async (res, rej) => {
			try {
				const voice = this.getVoiceInfo(voiceName);
				const body = new URLSearchParams({
					service: "Acapela",
					voice: voice.vid,
					text
				}).toString();
				https.request({
					hostname: "lazypy.ro",
					path: "/tts/request_tts.php",
					method: "POST",
					headers: { 
						"Content-type": "application/x-www-form-urlencoded"
					}
				}, r => {
					const buffers = [];
					r.on("data", b => buffers.push(b)).on("end", () => {
						const json = JSON.parse(Buffer.concat(buffers));
						if (json.success && json.audio_url) {
							https.get(json.audio_url, r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
							})
						}
					}).on("error", rej);
				}).end(body).on("error", rej);
			} catch (e) {
				rej(e);
			}
		});
	},
	async checkAIVoiceServer(data) {
		try {
			await this.genAIVoice("Barbara(Female)", "test", data.uid);
			return "NoErrors";
		} catch (e) {
			console.log(e);
			return "ContainsErrors"
		}
	},
	genAIVoice(voiceName, text, userId) {
		return new Promise(async (res, rej) => {
			try {
				const userInfo = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == userId);
				const voiceInfo = await this.getAIVoiceInfo(voiceName);
				console.log(voiceInfo, userInfo);
				https.request({
					hostname: "api.topmediai.com",
					path: "/v1/text2speech",
					method: "POST",
					headers: {
						accept: 'application/json',
						'x-api-key': userInfo.apiKeys.Topmediaai || process.env.API_KEYS.Topmediaai,
						'Content-Type': 'application/json'
					}
				}, r => {
					const buffers = [];
					r.on("data", b => buffers.push(b)).on("end", () => {
						const json = JSON.parse(Buffer.concat(buffers));
						console.log(json);
						if (json.status == 200 && json.message == "Success") {
							function altConvert(url) {
								return new Promise(async (res, rej) => {
									const newFileName = url.substr(url.lastIndexOf("/") + 1).split("wav").join("mp3");
									const taskIds = [];
									async function checkTask(obj) {
										const res = await fetch(obj.links.self, {
											method: "GET",
											headers: {
												'Content-Type': 'application/json',
												Accept: 'application/json',
												Authorization: `Bearer ${userInfo.apiKeys.FreeConvert || process.env.API_KEYS.FreeConvert}`
											}
										});
										return await res.json();
									}
									https.request({
										hostname: "api.freeconvert.com",
										path: "/v1/process/import/url",
										method: "POST",
										headers: {
											'Content-Type': 'application/json',
											Accept: 'application/json',
											Authorization: `Bearer ${userInfo.apiKeys.FreeConvert || process.env.API_KEYS.FreeConvert}`
										}
									}, r => {
										const buffers = [];
										r.on("data", b => buffers.push(b)).on("end", async () => {
											const json = JSON.parse(Buffer.concat(buffers));
											console.log(json);
											if (!json.links && json.errors && json.errors[0] && json.errors[0].message) return rej(json.errors[0].message);
											let json2 = await checkTask(json);
											while (json2.status != "completed") json2 = await checkTask(json);
											console.log(json2);
											taskIds.push(json2.id);
											https.request({
												hostname: "api.freeconvert.com",
												path: "/v1/process/convert",
												method: "POST",
												headers: {
													'Content-Type': 'application/json',
													Accept: 'application/json',
													Authorization: `Bearer ${userInfo.apiKeys.FreeConvert || process.env.API_KEYS.FreeConvert}`
												}
											}, r => {
												const buffers = [];
												r.on("data", b => buffers.push(b)).on("end", async () => {
													const json = JSON.parse(Buffer.concat(buffers));
													console.log(json);
													if (!json.links && json.errors && json.errors[0] && json.errors[0].message) return rej(json.errors[0].message);
													let json2 = await checkTask(json);
													while (json2.status != "completed") json2 = await checkTask(json);
													console.log(json2);
													taskIds.push(json2.id);
													https.request({
														hostname: "api.freeconvert.com",
														path: "/v1/process/export/url",
														method: "POST",
														headers: {
															'Content-Type': 'application/json',
															Accept: 'application/json',
															Authorization: `Bearer ${userInfo.apiKeys.FreeConvert || process.env.API_KEYS.FreeConvert}`
														}
													}, r => {
														const buffers = [];
														r.on("data", b => buffers.push(b)).on("end", async () => {
															const json = JSON.parse(Buffer.concat(buffers));
															console.log(json);
															let json2 = await checkTask(json);
															while (json2.status != "completed") json2 = await checkTask(json);
															console.log(json2);
															https.get(json2.result.url, r => {
																const buffers = [];
																r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
															}).on("error", rej);
														}).on("error", rej);
													}).end(JSON.stringify({
														input: taskIds,
														filename: newFileName,
														archive_multiple_files: true
													})).on("error", rej);
												}).on("error", rej);
											}).end(JSON.stringify({
												input: json2.id,
												input_format: "wav",
												output_format: "mp3",
												options: {}
											})).on("error", rej);
										}).on("error", rej);
									}).end(JSON.stringify({
										url: url,
										filename: url.substr(url.lastIndexOf("/") + 1)
									})).on("error", rej);
								});
							}
							if (json.data && json.data.oss_url) {
								altConvert(json.data.oss_url).then(res).catch(e => {
									console.log(e);
									https.get(json.data.oss_url, r => {
										const stream = ffmpeg(r).inputFormat('wav').toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
											rej(`Encoding Error: ${error.message}`);
										}).pipe();
										const buffers = [];
										stream.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", rej);
									}).on("error", rej);
								});
							} else rej("Unable to retreive the ai voice file url")
						} else rej(json.message);
					}).on("error", rej);
				}).end(
					JSON.stringify({
						text,
						speaker: voiceInfo.speaker
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
				}, r => {
					const buffers = [];
					r.on("data", (b) => buffers.push(b)).on("end", async () => {
						const json = JSON.parse(Buffer.concat(buffers));
						if (json.Voice) try {
							const jsons = {};
							const vJson = {};
							for (let i = 0; i < json.Voice.length; i++) {
								const v = json.Voice[i];
								if (v.urlname) {
									if (v.Languagename.match(/[a-zA-Z]/) && v.name.includes(" (") && v.name.includes(")") && genderPrefixes[v.name.split(" (")[1].split(")")[0]]) {
										if (v.Languagename.includes(" (") && v.Languagename.includes(")") && getLangPre(v.Languagename.split(" (")[0])) {
											const l = getLangPre(v.Languagename.split(" (")[0]);
											jsons[l] = jsons[l] || [];
											jsons[l].unshift({
												id: v.urlname,
												desc: v.name,
												sex: genderPrefixes[v.name.split(" (")[1].split(")")[0]],
												vendor: "Topmediai",
												demo: l != "fi" ? `https://images.topmediai.com/topmediai/assets/overview/text-to-speech/${v.name.split(" ").join("_")}.wav` : "",
												country: (v.Languagename.split(" (")[1].split(")")[0]).length != 2 ? false : v.Languagename.split(" (")[1].split(")")[0],
												lang: l,
												plus: !v.isvip ? false : true,
											});
										} else {
											jsons.default = jsons.default || [];
											jsons.default.unshift({
												id: v.urlname,
												desc: v.name,
												sex: genderPrefixes[v.name.split(" (")[1].split(")")[0]],
												vendor: "Topmediai",
												demo: "",
												country: false,
												lang: false,
												plus: !v.isvip ? false : true,
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
											plus: !v.isvip ? false : true,
										});
									}
								}
							} 
							Object.keys(jsons).sort().map((i) => {
								const v = jsons[i],
								l = i != "default" ? langs[i] : "More";
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
				}, r => {
					const buffers = [];
					r.on("data", (b) => buffers.push(b)).on("end", async () => {
						const json = JSON.parse(Buffer.concat(buffers));
						if (json.Voice) {
							let json2 = json.Voice.find(i => i.urlname == voiceName)
							if (!json2) json2 = json.Voice.find(i => i.name == voiceName);
							res(json2);
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
