const https = require("https");
const fs = require("fs");

module.exports = (req, res, url) => {
    const pathname = url.pathname.split("//").join("/");
    if (req.method != "GET" || !pathname.startsWith("/static")) return;
    function get(u) {
        console.log(u);
        https.get(u, (r) => {
            const buffers = [];
            r.on("data", (b) => buffers.push(b)).on("end", () => res.end(Buffer.concat(buffers))).on("error", console.error);
        });
        return true;
    }
    function vQuery(u) {
        const mimeTypes = {
            js: {
                name: "text",
                value: "javascript"
            },
            css: {
                name: "text",
                value: "css"
            }
        }
        const mimeType = mimeTypes[pathname.substr(pathname.lastIndexOf(".") + 1)];
        if (mimeType) res.setHeader("Content-Type", `${mimeType.name}/${mimeType.value}`);
        const v = !pathname.startsWith("/static/tommy") ? ('/' + url.query.v + pathname.split("/static")[1]) : pathname.split(
            `/static/tommy`
        )[1];
        if (url.query.v || pathname.startsWith("/static/tommy")) return fs.existsSync(`./static${v}`) ? res.end(fs.readFileSync(`./static${
            v
        }`)) : get(`https://file.garden/ZP0Nfnn29AiCnZv5/static${v}`);
        return fs.existsSync(`.${pathname}`) ? res.end(fs.readFileSync(`.${pathname}`)) : get(u);
    }
    if (pathname.startsWith("/static/store")) return vQuery(`https://goanimate-wrapper.github.io/GoAnimate-Assets/store/3a981f5cb2739137${
        pathname.split("/static/store")[1]
    }`);
    if (pathname.startsWith("/static/tommy")) return vQuery(`https://file.garden/ZP0Nfnn29AiCnZv5/static${
        pathname.split("/static/tommy")[1]
    }`);
    if (pathname.startsWith("/static/animation")) return vQuery(`https://goanimate-wrapper.github.io/GoAnimate-Assets/animation/414827163ad4eb60${
        pathname.split("/static/animation")[1]
    }`);
    return vQuery(`https://goanimate-wrapper.github.io/GoAnimate-Assets/static/ad44370a650793d9${
        pathname.split("/static")[1]
    }`);
}