const fUtil = require("../misc/file");
const { getThemes } = require("../movie/parse");
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
function fetchCharOrder(themeId, pathname) {
	const json = {};
	for (const themes of getThemes()) {
		if (themeId == themes.attr.cc_theme_id) {
			switch (pathname) {
				case "/cc": {
					json.html = `<li><a href="/cc_browser?themeId=${themeId}">${themes.attr.name} Characters</a></li><li class="active">Create a new character</li>`;
					break;
				} case "/cc_browser": {
					json.html = `<li class="active">${themes.attr.name} Characters</li>`;
					json.msg = `Browse characters already available in the ${themes.attr.name} theme and use them as a starting point to create new custom characters.`;
					break;
				}
			}
		}
	}
	return json;
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

	var attrs, params, title, filename, charOrder = '';
	switch (url.pathname) {
		case "/cc": {
			title = "Character Creator";
			filename = "cc";
			charOrder = fetchCharOrder(url.query.themeId || "family", "/cc");
			attrs = {
				data: process.env.SWF_URL + "/cc.swf", // data: 'cc.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "960",
				height: "600",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					themeId: "family",
					ut: 60,
					bs: "adam",
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

		case "/public_index": {
			filename = "index";
			break;
		}

		case "/public_signup": {
			filename = "signup";
			break;
		}

		case "/videomaker": {
			filename = "create";
			break;
		}

		case "/quickvideo": {
			const quickvideoThemeids = {
				everydaylife: true,
				basketball: true
			};
			if (quickvideoThemeids[url.query.filename]) filename = url.query.filename;
			else return res.end('This theme has not been added to the server. Current Theme: ' + url.query.filename);
			break;
		}

		case "/login": {
			filename = "login";
			break;
		}

		case "/movies": {
			filename = "list";
			break;
		}

		case "/cc_browser": {
			title = "CC Browser";
			filename = "cc";
			charOrder = fetchCharOrder(url.query.themeId || "family", "/cc_browser");
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "ccbrowser",
				width: "960",
				height: "1200",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
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
			else {
				res.statusCode = 302;
				res.setHeader("Location", "/");
				res.end();
			}
			title = "Player";
			params = {
				id: "Player",
				swf: process.env.SWF_URL + "/player.swf",
				height: 349,
				width: 620,
				bgcolor: "#000000",
				scale: "exactfit",
				allowScriptAccess: "always",
				allowFullScreen: "true",
				wmode: "opaque",
				hasVersion: "10.3",
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
			};
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
		charOrder,
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
