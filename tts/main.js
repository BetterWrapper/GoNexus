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
function getLangPre(langName) {
	for (const lang in langs) {
		if (langs[lang] == langName) return lang;
	}
}
const session = require("../misc/session");
module.exports = {
	getVoiceInfo(voiceName) {
		try {
			return JSON.parse(fs.readFileSync('./tts/voices.json'))[voiceName];
		} catch (e) {
			return e
		}
	},
	genVoice(voiceName, text, uid) {
		return new Promise(async (res, rej) => {
			try {
				const json = JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(i => i.id == uid);
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
								r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
							})
						}
					}).on("error", rej);
				}).end(body).on("error", rej);
			} catch (e) {
				rej(e);
			}
		});
	}
};
