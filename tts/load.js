const loadPost = require("../misc/post_body");
const mp3Duration = require("mp3-duration");
const asset = require("../asset/main");
const tts = require("./main");
const http = require("http");
const oldvoices = require("./oldvoices");
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/convertTextToSoundAsset/") return;
	loadPost(req, res).then(async data => {
		if (data.movieId && data.movieId.startsWith("ft-")) {
			res.end(1 + `<error><code>ERR_ASSET_404</code><message>Because you are using a video that has been imported from FlashThemes, you cannot generate TTS voices to this video at the moment as this video is right now using the FlashThemes servers to get all of the assets provided in this video. Please save your video as a normal one in order to get some LVM features back.</message><text></text></error>`);
		} else try {
			const buffer = await tts.genVoice(data);
			let voice;
			if (data.studio == "2010") voice = oldvoices[data.voice.toLowerCase()];
			else voice = tts.getVoiceInfo(data.voice);
			mp3Duration(buffer, (e, d) => {
				var dur = d * 1e3;
				if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
					e || "Unable to retrieve MP3 stream."
				}</message><text></text></error>`);
				const title = `[${voice.name}] ${data.text}`;
				const id = asset.save(buffer, {
					type: "sound",
					subtype: "tts",
					title,
					published: 0,
					tags: "",
					duration: dur,
					downloadtype: "progressive",
					ext: "mp3"
				}, data);
				if (!data.studio) res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${
					title
				}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${
					id
				}</file></asset></response>`);
				else res.end(`0<asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${
					title
				}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${
					id
				}</file></asset>`);
			});
		} catch (e) {
			console.log(e);
			res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
		}
	});
	return true;
};
