const https = require("https");
const fUtil = require("../../misc/file");
module.exports = {
    mp3BufferFunction: "say",
    baseurl: "https://capcut-tts.onrender.com",
    say(type, text) {
        return new Promise(async (res, rej) => {
            if (text === undefined || type === undefined) {
                rej("Bad Request");
                return;
            }
            https.get(`${this.baseurl}/v1/synthesize?text=${text}&type=${type}&method=stream`, r => {
                fUtil.convertStreamAudio(r, 'wav', 'mp3').then(d => {
                    const buffers = [];
                    d.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
                })
            })
        })
    }
}