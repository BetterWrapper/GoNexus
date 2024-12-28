const https = require("https");
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const asset = require("../asset/main");
const brotli = require("brotli");
const md5 = require("js-md5");
const fs = require("fs");
const genderPrefixes = {
	Male: "M",
	Female: "F"
}
const mp3Duration = require("mp3-duration");
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
function getLangPre(langName) {
	for (const lang in langs) {
		if (langs[lang] == langName) return lang;
	}
}
const userVoices = {};
const session = require("../misc/session");
const fUtil = require("../misc/file");
const oldvoices = require("./oldvoices.json");
module.exports = {
	tempSaveUserVoice(uid, voices) {
		userVoices[uid] = voices;
	},
	getVoiceInfo(voiceName, uid) {
		try {
			return userVoices[uid][voiceName];
		} catch (e) {
			return e
		}
	},
	genVoice4Qvm(voiceName, text, noSave = false) {
		return new Promise(async (res, rej) => {
			const voices = require(`./qvmvoices`).voices;
			const voice = voices[voiceName];
			let flags = {};
			if (!voice) return rej(`The voiceName ${voiceName} does not exist.`);
			async function saveAsset(stream) {
				function c() {
					return new Promise((res, rej) => {
						const buffers = [];
						stream.on("data", b => buffers.push(b)).on("end", () => {
							try {
								const buffer = Buffer.concat(buffers);
								mp3Duration(buffer, (e, d) => {
									const dur = d * 1e3;
									if (e || !dur) return rej(e || "Unable to retrieve MP3 stream.");
									res(noSave ? buffer : asset.save(buffer, {
										type: "sound",
										subtype: "tts",
										published: 0,
										title: `[${voice.desc}] ${text}`,
										tags: "",
										duration: dur,
										downloadtype: "progressive",
										ext: "mp3"
									}, {
										isTemplate: true
									}))
								});
							} catch (e) {
								rej(e);
							}
						}).on("error", rej);
					});
				}
				c().then(res).catch(rej);
			}
			try {
				switch (voice.source) {
					case "polly": {
						const body = new URLSearchParams({
							msg: text,
							lang: voice.arg,
							source: "ttsmp3"
						}).toString();
	
						const req = https.request(
							{
								hostname: "ttsmp3.com",
								path: "/makemp3_new.php",
								method: "POST",
								headers: { 
									"Content-Length": body.length,
									"Content-type": "application/x-www-form-urlencoded"
								}
							},
							(r) => {
								let body = "";
								r.on("data", (c) => body += c);
								r.on("end", () => {
									const json = JSON.parse(body);
									if (json.Error == 1) {
										return rej(json.Text);
									}
	
									https
										.get(json.URL, saveAsset)
										.on("error", rej);
								});
								r.on("error", rej);
							}
						)
						req.on("error", rej);
						req.end(body);
						break;
					}
	
					case "nuance": {
						const q = new URLSearchParams({
							voice_name: voice.arg,
							speak_text: text,
						}).toString();
	
						https
							.get(`https://voicedemo.codefactoryglobal.com/generate_audio.asp?${q}`, saveAsset)
							.on("error", rej);
						break;
					}
	
					case "cepstral": {
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
							const q = new URLSearchParams({
								voiceText: text,
								voice: voice.arg,
								createTime: 666,
								rate: 170,
								pitch: pitch,
								sfx: "none"
							}).toString();

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
										console.log(json);
										if (!json.error) https.get(`https://www.cepstral.com${json.mp3_loc}`, saveAsset).on("error", rej);
										else rej(json.error_message)
									});
									r.on("error", rej);
								}
							).on("error", rej);
						}).on("error", rej);
						break;
					}
	
					case "voiceforge": {
						const q = new URLSearchParams({						
							msg: text,
							voice: voice.arg,
							email: "null"
						}).toString();
						
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
							fUtil.convertStreamAudio(r, "wav", "mp3").then(saveAsset).catch(rej);
						}).on("error", rej);
						break;
					}
					case "vocalware": {
						var [eid, lid, vid] = voice.arg;
						var cs = md5(`${eid}${lid}${vid}${text}1mp35883747uetivb9tb8108wfj`);
						var q = new URLSearchParams({
							EID: voice.arg[0],
							LID: voice.arg[1],
							VID: voice.arg[2],
							TXT: text,
							EXT: "mp3",
							IS_UTF8: 1,
							ACC: 5883747,
							cache_flag: 3,
							CS: cs,
						}).toString();
						https.get(
							{
								host: "cache-a.oddcast.com",
								path: `/tts/gen.php?${q}`,
								headers: {
									Referer: "https://www.oddcast.com/",
									Origin: "https://www.oddcast.com/",
									"User-Agent":
										"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
								},
							}, saveAsset
						).on("error", rej);
						break;
					}
					case "acapela": {
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
	
												https
													.get(sub, saveAsset)
													.on("error", rej);
											});
											r.on("error", rej);
										}
									).on("error", rej);
									req.end(
										new URLSearchParams({
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
										}).toString()
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
					}
	
					case "svox": {
						const q = new URLSearchParams({
							apikey: "e3a4477c01b482ea5acc6ed03b1f419f",
							action: "convert",
							format: "mp3",
							voice: voice.arg,
							speed: 0,
							text,
							version: "0.2.99",
						}).toString();
	
						https
							.get(`https://api.ispeech.org/api/rest?${q}`, saveAsset)
							.on("error", rej);
						break;
					}
					case "readloud": {
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
										}, saveAsset).on("error", rej);
									} else {
										return rej("Could not find voice clip file in response.");
									}
								});
							}
						);
						req.on("error", rej);
						req.end(
							new URLSearchParams({
								but1: text,
								butS: 0,
								butP: 0,
								butPauses: 0,
								but: "Submit",
							}).toString()
						);
						break;
					}
					case "cereproc": {
						const query = new URLSearchParams({
							voice: voice.arg,
							audio_format: "mp3"
						})
						const req = https.request({
							hostname: "api.cerevoice.com",
							path: `/v2/demo?${query}`,
							method: "POST",
							headers: {
								"content-type": "audio/mp3",
								"accept-encoding": "gzip, deflate, br",
								origin: "https://www.cereproc.com",
								referer: "https://www.cereproc.com/"
							},
						}, saveAsset);
						req.end(`<text>${text}</text>`);
						break;
					}
				}
			} catch (e) {
				rej(e)
			}
		});
	},
	genVoice(data) {
		return new Promise(async (res, rej) => {
			try {
				const {
					voice: voiceName, 
					text, 
					userId: uid
				} = data;
				if (data.v == "2010") switch (oldvoices[voiceName.toLowerCase()].source) {
					case "voiceforge": {
						const q = new URLSearchParams({						
							msg: text,
							voice: oldvoices[voiceName.toLowerCase()].arg,
							email: "null"
						}).toString();
						
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
							fUtil.convertStreamAudio(r, "wav", "swf").then(r => {
								const buffers = [];
								r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
							}).catch(rej);
						}).on("error", rej);
						break;
					} case "vocalware": {
						var [eid, lid, vid] = oldvoices[voiceName.toLowerCase()].arg;
						var cs = md5(`${eid}${lid}${vid}${text}1mp35883747uetivb9tb8108wfj`);
						var q = new URLSearchParams({
							EID: oldvoices[voiceName.toLowerCase()].arg[0],
							LID: oldvoices[voiceName.toLowerCase()].arg[1],
							VID: oldvoices[voiceName.toLowerCase()].arg[2],
							TXT: text,
							EXT: "wav",
							IS_UTF8: 1,
							ACC: 5883747,
							cache_flag: 3,
							CS: cs,
						}).toString();
						https.get(
							{
								host: "cache-a.oddcast.com",
								path: `/tts/gen.php?${q}`,
								headers: {
									Referer: "https://www.oddcast.com/",
									Origin: "https://www.oddcast.com/",
									"User-Agent":
										"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
								},
							},
							(r) => {
								fUtil.convertStreamAudio(r, "wav", "swf").then(r => {
									const buffers = [];
									r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
								}).catch(rej);
							}
						);
						break;
					}
				}
				else {
					const voice = this.getVoiceInfo(voiceName, data.userId);
					console.log(voice);
					if (voice.isLocal && voice.provider) {
						const tts = require(`./${voice.provider}/main`);
						const buffer = await tts[tts.mp3BufferFunction](voice.vid, text);
						typeof buffer == "string" ? rej(buffer) : res(buffer);
					} else {
						const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
							i => i.id == uid
						);
						const body = new URLSearchParams({
							service: json.settings.api.ttstype.value.split("+").join(" "),
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
										r.on("data", b => buffers.push(b)).on("end", () => res(
											Buffer.concat(buffers)
										));
									})
								}
							}).on("error", rej);
						}).end(body).on("error", rej);
					}
				}
			} catch (e) {
				rej(e);
			}
		});
	}
};
