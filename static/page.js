const fUtil = require("../misc/file");
const fs = require("fs");
const http = require("http");
const ejs = require('ejs');
const { existsSync } = require("fs");
const { join } = require("path");

function toAttrString(table) {
	return typeof table == "object"
		? Object.keys(table)
				.filter((key) => table[key] !== null)
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`)
				.join("&")
		: table.replace(/"/g, '\\"');
}
function toParamString(table) {
	return Object.keys(table)
		.map((key) => `<param name="${key}" value="${toAttrString(table[key])}">`)
		.join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs)
		.map((key) => `${key}="${attrs[key].replace(/"/g, '\\"')}"`)
		.join(" ")}>${toParamString(params)}</object>`;
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET") return;
	const query = url.query;

	var attrs, params, title, filename;
	switch (url.pathname) {
		case "/cc": {
			title = "Character Creator";
			filename = "cc";
			attrs = {
				data: process.env.SWF_URL + "/cc.swf", // data: 'cc.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "business",
					ut: 60,
					bs: "default",
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc.swf", // 'http://localhost/cc.swf'
			};
			break;
		}

		case "/": {
			filename = "home";
			break;
		}

		case "/yourvideos": {
			filename = "list";
			break;
		}

		case "/user": {
			const json = JSON.parse(fs.readFileSync('./users.json'));
			if (json.users.find(i => i.id == url.query.id)) {
				if (url.query.filename == "user-videos") filename = "user-videos";
				else filename = "user";
			} else filename = "profile-error";
			break;
		}

		case "/cc_browser": {
			title = "CC Browser";
			filename = "cc_browser";
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "family",
					ut: 60,
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
					lid: 13,
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		}

		case "/go_full": {
			let presave = query.movieId && query.movieId.startsWith("m") ? query.movieId: `m-${fUtil.getNextFileId("movie-", ".xml")}`;
			title = "Video Editor";
			filename = "studio";
			attrs = {
				data: process.env.SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					presaveId: presave,
					loadas: 0,
					asId: "",
					originalId: "",
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					animationPath: process.env.SWF_URL + "/",
					numContact: "0",
					ut: 23,
					ve: false,
					isEmbed: 0,
					nextUrl: "/api/redirect",
					bgload: process.env.SWF_URL + "/go_full.swf",
					lid: "13",
					ctc: "go",
					themeColor: "silver",
					tlang: "en_US",
					siteId: "13",
					templateshow: "false",
					forceshow: "false",
					appCode: "go",
					lang: "en",
					tmcc: 4048901,
					fb_app_url: "/",
					upl: 1,
					hb: "1",
					pts: "1",
					msg_index: "",
					ad: 0,
					has_asset_bg: 1,
					has_asset_char: 0,
					initcb: "studioLoaded",
					retut: 0,
					featured_categories: null,
					st: "",
					uisa: 0,
					u_info: "OjI6elg5SnZCOUEyTHZiY2lhZGRXTm9Nd0ljVWhNbEpGaXJFdkpEdkltdEp6RWhrQ0VIbXZIVTBjRTlhUGZKMjJoVHVTUE5vZk1XYnFtSE1vZG5TeldyQVJNcDFmUFB2NDVtR0FTSlZZ",
					tm: "FIN",
					tray: "custom",
					isWide: 1,
					newusr: 1,
					goteam_draft_only: 0
				},
				allowScriptAccess: "always",
			};
			break;
		}

		case "/player": {
			const path = fUtil.getFileIndex("movie-", ".xml", url.query.movieId.substr(url.query.movieId.lastIndexOf("-") + 1));
			if (url.query.movieId.startsWith("m-") && existsSync(path)) filename = "player";
			else filename = "video-error";
			title = "Player";
			attrs = {
				data: process.env.SWF_URL + "/player.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					movieLid: "0",
					ut: "23",
					numContact: "",
					apiserver: "/",
					playcount: 1,
					ctc: "go",
					tlang: "en_US",
					autostart: "0",
					appCode: "go",
					is_slideshow: "0",
					originalId: "0Y7-ebJ36Ip4",
					is_emessage: "0",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					animationPath: process.env.SWF_URL + "/",
					isEmbed: !url.query.isEmbed ? "0" : "1",
					refuser: null,
					utm_source: null,
					uid: null,
					isTemplate: "0",
					showButtons: "1",
					chain_mids: "",
					averageRating: 5,
					ratingCount: "1",
					fb_app_url: "/",
					ad: 1,
					endStyle: 0,
					isWide: "1",
					pwm: 1,
					initcb: "flashPlayerLoaded",
					showshare: false
				},

				allowScriptAccess: "always",
				allowFullScreen: "true",
			};
			if (url.query.isEmbed) {
				if (url.query.movieId.startsWith("m-") && existsSync(path)) {
					for (const user of JSON.parse(fs.readFileSync('./users.json')).users) {
						const json = user.movies.find(i => i.id == url.query.movieId);
						if (json) {
							params.flashvars.movieOwner = user.name.split(" ").join("+");
							params.flashvars.movieOwnerId = user.id;
							params.flashvars.movieTitle = json.title.split(" ").join("+");
							params.flashvars.movieDesc = json.desc.split(" ").join("+");
							params.flashvars.duration = json.duration;
							params.flashvars.isPublished = json.published;
							params.flashvars.is_private_shared = json.publishStatus == "private" ? "1" : "0";
						}
					}
					filename = url.query.filename == "player-embed-h5" ? "player-embed-h5" : "player-embed-legacy";
				} else {
					filename = "player-embed-error";
				}
			}
			break;
		}

		default:
			return;
	}
	Object.assign(params ? params.flashvars : {}, query);
	ejs.renderFile(`./views/${filename}.ejs`, {
		title,
		attrs,
		params,
		flashvarsString: new URLSearchParams(params ? params.flashvars : {}).toString(),
		object: toObjectString,
		paramString: toParamString
	}, function(err, str){
		if (err) {
			console.log(err);
			res.end('Not Found');
		} else {
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
			res.end(str);
		}
	});
	return true;
};
