const ejs = require('ejs');

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/ajax/getEmbedOverlay")) return;
    const mId = url.pathname.substr(url.pathname.lastIndexOf("/") + 1)
    if (mId.startsWith("m-")) {
        ejs.renderFile(`./views/modals/embedModal.ejs`, {
            videoUrl: `${req.headers.referer}&isEmbed=true`
        }, function(err, str) {
            if (err) {
                console.log(err);
                res.end('Not Found');
            } else {
                res.setHeader("Content-Type", "text/html; charset=UTF-8");
                res.end(str);
            }
        });
    }
    return true;
}