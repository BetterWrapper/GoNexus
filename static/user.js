const ejs = require('ejs');
const fs = require("fs");

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/public_user")) return;
    ejs.renderFile(`./views/user.ejs`, JSON.parse(fs.readFileSync('./_ASSETS/users.json')).users.find(
        i => i.id == url.pathname.substr(url.pathname.lastIndexOf("/") + 1)
    ) || {}, function(err, str){
		if (err) {
			console.log(err);
			res.end(err.toString());
		} else {
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
			res.end(str);
		}
	});
}