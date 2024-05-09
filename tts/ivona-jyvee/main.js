const https = require("https");
const fs = require("fs");
module.exports = {
    mp3BufferFunction: "sayMP3",
    domain: 'ivona-classic.replit.app',
    async test() {
        return fs.readFileSync('./tts/ivona-jyvee/voiceTestPage.html');
    },
    async devPage() {
        return fs.readFileSync('./tts/ivona-jyvee/devPage.html');
    },
    async get() {
        return fs.readFileSync('./tts/ivona-jyvee/voices.json');
    },
    say(v, text) {
        return new Promise(res => {
            const params = new URLSearchParams({
                rtr: 2,
                t2r: Buffer.from(text).toString("base64"),
                v2r: Buffer.from(v).toString("base64"),
                lang: 'us'
            }).toString();
            console.log(params);
            https.request({
                method: 'POST',
                hostname: this.domain,
                path: '/voicetest.php',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, r => {
                let body = '';
                r.on("data", b => body += b).on("end", () => res(body));
            }).end(params);
        })
    },
    sayMP3(v, text) {
        return new Promise(async res => {
            const params = new URLSearchParams({
                rtr: 1,
                t2r: Buffer.from(text).toString("base64"),
                v2r: Buffer.from(v).toString("base64"),
                lang: 'us'
            }).toString();
            console.log(params);
            https.get(`https://${this.domain}/voicetest.php?${params}`, r => {
                const buffers = [];
                r.on("data", b => buffers.push(b)).on("end", () => res(Buffer.concat(buffers)));
            })
        })
    },
    async sayEmb(v, text) { 
        return `<html>
                    <head>
                        <title>Ivona Classic | Embed</title>
                        <meta property="og:title" content="Listen to it" />
                        <meta property="og:image" content="https://raw.githubusercontent.com/discowd-nitro/media-files/main/media/huh.gif">
                        <meta property="og:type" content="video.other">
                        <meta property="og:video:height" content="480">
                        <meta property="og:video:width" content="640">
                        <meta property="og:audio" content="/api/local_voices/ivona-jyvee/sayMP3?v=${v}&text=${text}"/>
                    </head>
                </html>`;
    }
}