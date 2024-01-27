// variables
const fs = require("fs");
const loadPost = require("../misc/post_body");
// peform function
module.exports = (req, res, url) => {
    if ( // only peform this function when an api path below is being called.
        req.method != "POST" || (
            !url.pathname.startsWith("/api/school")
            && !url.pathname.endsWith("/get")
        )
    ) return;
    loadPost(req, res).then(data => {
        const type = url.pathname.split("/")[3];
        const users = JSON.parse(fs.readFileSync('./_ASSETS/users.json'));
        const userInfo = users.users.find(i => i.id == data.uid);
        res.end(JSON.stringify(userInfo?.school[type]));
    });
    return true;
}