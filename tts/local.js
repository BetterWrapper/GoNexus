module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/api/local_voices")) return;
    try {
        const tts = require(`./${url.pathname.split("/")[3]}/main`);
        tts[url.pathname.split("/")[4].split(".")[0]](url.query.v, url.query.text).then(buf => {
            res.end(buf);
        }).catch(e => {
            console.log(e);
            res.end(e.toString())
        })
    } catch (e) {
        console.log(e);
        res.end('Not Found');
    }
    return true;
}