const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    const pathname = url.pathname.split("//").join("/");
    if (req.method != "GET" || !pathname.startsWith("/static")) return;
    if (url.query.v) https.get(`https://file.garden/ZP0Nfnn29AiCnZv5/static/${
        url.query.v + pathname.split("/static")[1]
    }`, (r) => {
        const buffers = [];
        r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
    }).on("error", console.error);
    if (pathname.startsWith("/static/store")) https.get(`https://goanimate-wrapper.github.io/GoAnimate-Assets/store/3a981f5cb2739137${
        pathname.split("/static/store")[1]
    }`, (r) => {
        const buffers = [];
        r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
    }).on("error", console.error);
    else if (pathname.startsWith("/static/animation")) https.get(`https://goanimate-wrapper.github.io/GoAnimate-Assets/animation/414827163ad4eb60${
        pathname.split("/static/animation")[1]
    }`, (r) => {
        const buffers = [];
        r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
    }).on("error", console.error);
    else if (pathname.startsWith("/static/tommy")) https.get(`https://file.garden/ZP0Nfnn29AiCnZv5/static/${
        pathname.split("/static/tommy")[1]
    }`, (r) => {
        const buffers = [];
        r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
    }).on("error", console.error);
    else https.get(`https://goanimate-wrapper.github.io/GoAnimate-Assets/static/ad44370a650793d9${
        pathname.split("/static")[1]
    }`, (r) => {
        const buffers = [];
        r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
    }).on("error", console.error);
    return true;
}