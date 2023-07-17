const formidable = require("formidable");
const asset = require("../asset/main");
const http = require("http");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const mp3Duration = require("mp3-duration");
const fs = require("fs");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveSound/") return;
    new formidable.IncomingForm().parse(req, async (e, f, files) => {
        let response;
        if (f.bytes) await new Promise(resolve => {
            fs.writeFileSync('./_CACHÉ/recording.ogg', Buffer.from(f.bytes, "base64"));
            const stream = fs.createReadStream('./_CACHÉ/recording.ogg');
            const buffer = ffmpeg(stream).inputFormat('ogg').audioQuality(96).toFormat("mp3").on('error', error => console.log(`Encoding Error: ${
                error.message
            }`)).pipe();
            const buffers = [];
            buffer.on("data", (b) => buffers.push(b)).on("end", () => mp3Duration(Buffer.concat(buffers), (e, d) => {
				var dur = d * 1e3;
				if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
                    e || "Unable to retrieve MP3 Stream"
                }</message><text></text></error>`);
				const id = asset.save(Buffer.concat(buffers), {
                    type: "sound",
                    subtype: "voiceover",
                    title: f.title,
                    published: 0,
                    tags: "",
                    duration: dur,
                    downloadtype: "progressive",
                    ext: "mp3"
                }, f);
                response = `<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>voiceover</subtype><title>${f.title}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`;
                resolve();
			})).on("error", console.error);
		});
        else {
            console.log(files);
        }
        res.end(0 + response);
	});
	return true;
};