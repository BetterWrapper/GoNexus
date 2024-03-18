const https = require("https");
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
const fetch = require("node-fetch");
const md5 = require("js-md5");
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
function getLangPre(langName) {
	for (const lang in langs) {
		if (langs[lang] == langName) return lang;
	}
}
const session = require("../misc/session");
const fUtil = require("../misc/file");
const oldvoices = require("./oldvoices.json");
module.exports = {
	getVoiceInfo(voiceName) {
		try {
			return JSON.parse(fs.readFileSync('./tts/voices.json'))[voiceName];
		} catch (e) {
			return e
		}
	},
	genVoice(data) {
		return new Promise(async (res, rej) => {
			try {
				const {
					voice: voiceName, 
					text, 
					userId: uid
				} = data;
				if (data.studio == "2010") switch (oldvoices[voiceName.toLowerCase()].source) {
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
							fUtil.convertToMp3(r, "wav").then(r => {
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
							},
							(r) => {
								var buffers = [];
								r.on("data", (d) => buffers.push(d));
								r.on("end", () => res(Buffer.concat(buffers)));
								r.on("error", rej);
							}
						);
						break;
					}
				}
				else {
					const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
						i => i.id == uid
					);
					const voice = this.getVoiceInfo(voiceName);
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
			} catch (e) {
				rej(e);
			}
		});
	}
};
