/**
 * qvm generation jyvee edition (meant for certain templates)
 */
// modules
const xmlJs = require('xml-js');
const xml2js = require('xml2js');
// export functions
module.exports = {
	xmlToJson(xmlString) {
		return new Promise((resolve, reject) => {
			const parser = new xml2js.Parser();
			parser.parseString(xmlString, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	},
	jsonToXml(jsonData, o = {}) {
		const options = Object.assign({
			compact: true,
			ignoreComment: true,
			spaces: 4
		}, o);
		return xmlJs.js2xml(jsonData, options);
	}
}
