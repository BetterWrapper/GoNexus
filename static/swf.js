const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    if (req.method != "GET" || !url.pathname.startsWith("/static")) return;
    if (!url.pathname.includes("/2011/")) {
        if (url.pathname.includes("/animation/")) {
            res.setHeader("Content-Type", "application/x-shockwave-flash");
            https.get(`https://goanimate-wrapper.github.io/GoAnimate-Assets/animation/414827163ad4eb60/${url.pathname.substr(url.pathname.lastIndexOf("/") + 1)}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else if (url.pathname.includes("/go/") || url.pathname.includes("/client_theme/")) {
            https.get(`https://josephanimate2021.github.io/static/ad44370a650793d9${url.pathname.split("/static")[1]}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else if (url.pathname.includes("/store/")) {
            https.get(`https://goanimate-wrapper.github.io/GoAnimate-Assets/store/3a981f5cb2739137${url.pathname.split("/static/store")[1]}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else res.end(fs.readFileSync(`.${url.pathname}`));
    } else {
        if (url.pathname.includes("/animation/")) {
            res.setHeader("Content-Type", "application/x-shockwave-flash");
            https.get(`https://file.garden/ZP0Nfnn29AiCnZv5/${url.pathname.substr(url.pathname.lastIndexOf("/") + 1)}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else if (url.pathname.includes("/go/") || url.pathname.includes("/client_theme/")) {
            https.get(`https://file.garden/ZP0Nfnn29AiCnZv5/2011${url.pathname.split("/static/2011")[1].split("silver").join(url.query.themeColor)}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else if (url.pathname.includes("/store/")) {
            https.get(`https://ourmetallicdisplaymanager.joseph-animate.repl.co/static/store${url.pathname.split("/static/2011/store")[1]}`, (r) => {
                const buffers = [];
                r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
            }).on("error", console.error);
        } else res.end(fs.readFileSync(`.${url.pathname}`));
    }
    return true;
}