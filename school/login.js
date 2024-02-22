const fs = require("fs");
const ejs = require('ejs');
module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/school")) return;
    for (const userInfo of JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users) {
        if (userInfo.school && userInfo.school.id == url.pathname.split("/")[2]) {
            ejs.renderFile(`./views/schoolLogin.ejs`, userInfo.school, function(err, str) {
                if (err) {
                    console.log(err);
                    res.end('Not Found');
                } else res.end(str);
            });
        }
    }
}