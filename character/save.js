const loadPost = require("../misc/post_body");
const character = require("./main");
const http = require("http");
const fs = require("fs");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method == "POST")
		switch (url.pathname) {
			case "/goapi/saveCCCharacter/":
				loadPost(req, res).then(([data]) => character.save(Buffer.from(data.body)).then((id) => {
					console.log(data);
					var thumb = Buffer.from(data.thumbdata, "base64");
					var head = Buffer.from(data.imagedata, "base64");
					character.saveThumb(thumb, id);
					character.saveHead(head, id);
					const userFile = JSON.parse(fs.readFileSync(`./_ASSETS/users.json`));
					const json = userFile.users.find(i => i.id == data.userId);
					json.assets.unshift({
						id,
						enc_asset_id: id,
						file: id + ".xml",
						head_url: `/char_heads/${id}.png`,
						thumb_url: `/char_thumbs/${id}.png`,
						type: "char",
						subtype: 0,
						title: "Untitled",
						published: 0,
						tags: "",
						themeId: data.themeId
					});
					fs.writeFileSync(`./_ASSETS/users.json`, JSON.stringify(userFile, null, "\t"));
					res.end(`0${id}`);
				}).catch(e => {
					console.log(e);
					res.end(`10`);
				}));
				return true;

			case "/goapi/saveCCThumbs/":
				loadPost(req, res).then(([data]) => {
					var id = data.assetId;
					var thumb = Buffer.from(data.thumbdata, "base64");
					character.saveThumb(thumb, id);
					res.end(`0${id}`);
				});
				return true;
		}
	return;
};
