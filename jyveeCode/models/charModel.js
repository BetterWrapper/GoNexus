/**
 * character api
 */
// modules
const fs = require("fs");
const path = require("path");
const xmlJs = require('xml-js');

module.exports = {
	/**
	 * Parses a ugc character, used in older builds and for comm stuff
	 * @param {string} id
	 * @returns {string}
	 */
	parseUgcChar(id) {
		console.log(id);
		let xnl = fs.readFileSync(path.join(__dirname, "../../frontend", "/static/store/Comm", "theme.xml")).toString();
		function jsonToXml(jsonData) {
			const options = {
				compact: true,
				ignoreComment: true,
				spaces: 4
			};
			return xmlJs.js2xml(jsonData, options);
		}
		let meta = "";
		let result = xmlJs.xml2json(xnl, { compact: true, spaces: 4 });
		const data = JSON.parse(result);
		let hasmatch = false;
		for (let i = 0; i < data.theme.char.length; i++) {
			num = i;
			console.log(data.theme.char[i]._attributes.id);
			if (data.theme.char[i]._attributes.id == id) {
				hasmatch = true;
				meta = jsonToXml({char: data.theme.char[i]});
			}
		}
		if (hasmatch) {
			console.log(meta);
			return meta;
		}
	},
	/**
	 * Converts an object to a metadata XML.
	 * @param {any[]} v 
	 * @returns {string}
	 */
	meta2colourXml(v) {
		let xml;
		if (v._attributes.oc === undefined && !v._attributes.targetComponent) xml = `<color r="${v._attributes.r}">${v._text}</color>`;
		else if (v._attributes.targetComponent === undefined) xml = `<color r="${v._attributes.r}" oc="${v._attributes.oc}">${v._text}</color>`;	
		else xml = `<color r="${v._attributes.r}" targetComponent="${v._attributes.targetComponent}">${v._text}</color>`;	
		return xml;
	}
}