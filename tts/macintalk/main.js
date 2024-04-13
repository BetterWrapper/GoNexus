const https = require("https");

module.exports = {
    mp3BufferFunction: "sayMP3",
    baseUrl: 'https://b4af-2600-6c5e-b7f-ae30-b44c-1887-201a-6d4d.ngrok-free.app',
    say(v, text) {
        return new Promise(res => {
            https.get(`${this.baseUrl}/say?v=${v}&text=${text}`, (r) => {
                let buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res(`data:audio/mpeg;base64,${
                    Buffer.concat(buffers).toString("base64")
                }`)).on("error", () => res("HI"));
            });
        })
    },
    sayMP3(v, text) {
        return new Promise(res => {
            https.get(`${this.baseUrl}/say?v=${v}&text=${text}`, (r) => {
                let buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.concat(buffers))).on("error", () => res("HI"));
            });
        })
    },
    sayEmb(v, text) { 
        return new Promise(res => {
            https.get(`${this.baseUrl}/say?v=${v}&text=${text}`, (r) => {
                let buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res(Buffer.from(`<html>
                    <head>
                        <title>MacInTalk | Embed</title>
                        <meta property="og:title" content="Listen to it" />
                        <meta property="og:image" content="https://raw.githubusercontent.com/discowd-nitro/media-files/main/media/huh.gif">
                        <meta property="og:type" content="video.other">
                        <meta property="og:video:height" content="480">
                        <meta property="og:video:width" content="640">
                        <meta property="og:audio" content="/api/local_voices/macinialk/sayMP3?v=${v}&text=${text}"/>
                    </head>
                </html>`))).on("error", () => res("HI"));
            });
        })
    }
}