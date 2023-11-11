module.exports = function (req, res) {
	return new Promise((resolve, rej) => {
		const buffers = [];
		req.on("data", (v) => buffers.push(v)).on("end", () => {
			const json = Object.fromEntries(new URLSearchParams(Buffer.concat(buffers).toString()));
			console.log(json);
			resolve(json);
		});
	});
};
