const https = require("https");
const fs = require("fs");
const fetch = require("node-fetch");

module.exports = {
    mp3BufferFunction: "sayMP3",
    baseurl: "https://edit-api-sg.capcut.com/lv/v1",
    async genToken() {
        const headers = new fetch.Headers();
        headers.append('Appvr', '5.8.0');
        headers.append('Device-Time', new Date().getTime());
        headers.append('Origin', 'https://www.capcut.com');
        headers.append('Pf', '7');
        headers.append('Sign', "bb31accdf1b6897d70e774a8f28ab21e");
        headers.append('Sign-Ver', '1');
        headers.append('User-Agent', "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36");
    
        try {
            const res = await fetch(this.baseurl + "/common/tts/token", {
                method: 'POST',
                headers
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            logger.error("can't get token");
            return null;
        }
    },
    say(text, type, pitch, speed, volume, isStream) {
        return new Promise(async (res, rej) => {
            if (text === undefined) {
                rej("Bad Request");
                return;
            }
            if (type === undefined) {
                type = '0';
            }
            if (pitch === undefined) {
                pitch = '10';
            }
            if (speed === undefined) {
                speed = '10';
            }
            if (volume === undefined) {
                volume = '10';
            }
            var tokenRes = await this.genToken();
            if (tokenRes.errmsg == "success") {
                if (isStream) {
                    const audioStream = this.createAudioStream(tokenRes.data,
                        text,
                        Number.parseInt(type),
                        Number.parseInt(pitch),
                        Number.parseInt(speed),
                        Number.parseInt(volume)
                    );
                    if (!audioStream) {
                        rej("can't get stream");
                        return;
                    }
                    const buffers = [];
                    audioStream.on('data', (data)=>{
                        buffers.push(data);
                    }).on('end', ()=>{
                        res(Buffer.concat(buffers));
                    });
                    return;
                } else {
                    const audioBuffer = await this.getAudioBuffer(tokenRes.data,
                        text,
                        Number.parseInt(type),
                        Number.parseInt(pitch),
                        Number.parseInt(speed),
                        Number.parseInt(volume)
                    );
                    if (!audioBuffer) {
                        rej("can't get buffer");
                        return;
                    }
                    res(audioBuffer);
                }
            } else rej("Unable to generate a user token");
        })
    },
    sayMP3(v, text) {
        return new Promise(async res => {
            res(await this.say(text, v))
        })
    },
}