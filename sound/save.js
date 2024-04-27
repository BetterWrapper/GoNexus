const formidable = require("formidable");
const asset = require("../asset/main");
const http = require("http");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const mp3Duration = require("mp3-duration");
const fs = require("fs");
function stream2Buffer(stream) {
    return new Promise((res, rej) => {
        try {
            const buffers = [];
            stream.on("data", (b) => buffers.push(b)).on("end", () => {
                res(Buffer.concat(buffers));
            }).on("error", rej);
        } catch (e) {
            rej(e);
        }
    })
}
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveSound/") return;
	new formidable.IncomingForm().parse(req, async (e, f, files) => {
        let response;
        console.log(e, f, files);
        if (f.bytes) {
            await new Promise(resolve => { 
                try {
                    fs.writeFileSync('./_CACHÉ/recording.ogg', Buffer.from(f.bytes, "base64"));
                    const stream = fs.createReadStream('./_CACHÉ/recording.ogg');
                    const buffer = ffmpeg(stream).inputFormat('ogg').toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
                        rej(`Encoding Error: ${error.message}`);
                    }).pipe();
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
                        response = `<asset><id>${id}</id><enc_asset_id>${
                            id
                        }</enc_asset_id><type>sound</type><subtype>voiceover</subtype><title>${
                            f.title
                        }</title><published>0</published><tags></tags><duration>${
                            dur
                        }</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset>`;
                        resolve();
                    })).on("error", (e) => {
                        console.log(e);
                        res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
                    });
                } catch(e) {
                    console.log(e);
                    res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
                }
            });
        } else {
            await new Promise(async resolve => {
                try {
                    const {filepath, path} = files.Filedata;
                    const name = f.Filename || files.Filedata.name || files.Filedata.originalFilename;
                    const ext = name.substr(name.lastIndexOf(".") + 1);
                    const info = {
                        type: f.type || "sound",
                        subtype: f.subtype || "voiceover",
                        title: f.title || name,
                        published: 0,
                        tags: f.keywords || "",
                        downloadtype: "progressive",
                        ext: "mp3"
                    }
                    let buffer;
                    if (ext != "mp3") {
                        const stream = ffmpeg(
                            fs.createReadStream(filepath || path)
                        ).inputFormat(ext).toFormat("mp3").audioBitrate(4.4e4).on('error', (error) => {
                            rej(`Encoding Error: ${error.message}`);
                        }).pipe();
                        buffer = await stream2Buffer(stream);
                    } else {
                        buffer = fs.readFileSync(filepath || path);
                    }
                    mp3Duration(buffer, (e, d) => {
                        const dur = info.duration = d * 1e3;
                        if (e || !dur) return res.end(1 + `<error><code>ERR_ASSET_404</code><message>${
                            e || "Unable to retrieve MP3 Stream"
                        }</message><text></text></error>`);
                        const id = asset.save(buffer, info, f);
                        response = `<asset><id>${id}</id><enc_asset_id>${
                            id
                        }</enc_asset_id><type>${info.type}</type><subtype>${info.subtype}</subtype><title>${
                            info.title}
                        }</title><published>${info.published}</published><tags>${info.tags}</tags><duration>${
                            dur
                        }</duration><downloadtype>${info.downloadtype}</downloadtype><file>${id}</file></asset>`;
                        resolve();
                    });
                } catch (e) {
                    console.log(e);
                    res.end(1 + `<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
                }
            });
        }
        res.end(0 + f.file == "old_full_2013.swf" || parseInt(f.v) <= 2012 ? response : `<response>${
            response
        }</response>`);
	});
	return true;
};
