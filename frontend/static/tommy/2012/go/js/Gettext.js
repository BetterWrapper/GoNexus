    Gettext = function(c) {
        this.domain = "messages";
        this.locale_data = undefined;
        var b = ["domain", "locale_data"];
        if (this.isValidObject(c)) {
            for (var d in c) {
                for (var a = 0; a < b.length; a++) {
                    if (d == b[a]) {
                        if (this.isValidObject(c[d])) {
                            this[d] = c[d]
                        }
                    }
                }
            }
        }
        this.try_load_lang();
        return this
    }
    ;
    Gettext.context_glue = "\004";
    Gettext._locale_data = {};
    Gettext.prototype.try_load_lang = function() {
        if (typeof (this.locale_data) != "undefined") {
            var d = this.locale_data;
            this.locale_data = undefined;
            this.parse_locale_data(d);
            if (typeof (Gettext._locale_data[this.domain]) == "undefined") {
                throw new Error("Error: Gettext 'locale_data' does not contain the domain '" + this.domain + "'")
            }
        }
        var b = this.get_lang_refs();
        if (typeof (b) == "object" && b.length > 0) {
            for (var a = 0; a < b.length; a++) {
                var c = b[a];
                if (c.type == "application/json") {
                    if (!this.try_load_lang_json(c.href)) {
                        throw new Error("Error: Gettext 'try_load_lang_json' failed. Unable to exec xmlhttprequest for link [" + c.href + "]")
                    }
                } else {
                    if (c.type == "application/x-po") {
                        if (!this.try_load_lang_po(c.href)) {
                            throw new Error("Error: Gettext 'try_load_lang_po' failed. Unable to exec xmlhttprequest for link [" + c.href + "]")
                        }
                    } else {
                        throw new Error("TODO: link type [" + c.type + "] found, and support is planned, but not implemented at this time.")
                    }
                }
            }
        }
    }
    ;
    Gettext.prototype.parse_locale_data = function(f) {
        if (typeof (Gettext._locale_data) == "undefined") {
            Gettext._locale_data = {}
        }
        for (var e in f) {
            if ((!f.hasOwnProperty(e)) || (!this.isValidObject(f[e]))) {
                continue
            }
            var b = false;
            for (var a in f[e]) {
                b = true;
                break
            }
            if (!b) {
                continue
            }
            var g = f[e];
            if (e == "") {
                e = "messages"
            }
            if (!this.isValidObject(Gettext._locale_data[e])) {
                Gettext._locale_data[e] = {}
            }
            if (!this.isValidObject(Gettext._locale_data[e].head)) {
                Gettext._locale_data[e].head = {}
            }
            if (!this.isValidObject(Gettext._locale_data[e].msgs)) {
                Gettext._locale_data[e].msgs = {}
            }
            for (var n in g) {
                if (n == "") {
                    var j = g[n];
                    for (var m in j) {
                        var i = m.toLowerCase();
                        Gettext._locale_data[e].head[i] = j[m]
                    }
                } else {
                    Gettext._locale_data[e].msgs[n] = g[n]
                }
            }
        }
        for (var e in Gettext._locale_data) {
            if (this.isValidObject(Gettext._locale_data[e].head["plural-forms"]) && typeof (Gettext._locale_data[e].head.plural_func) == "undefined") {
                var l = Gettext._locale_data[e].head["plural-forms"];
                var d = new RegExp("^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_()])+)","m");
                if (d.test(l)) {
                    var k = Gettext._locale_data[e].head["plural-forms"];
                    if (!/;\s*$/.test(k)) {
                        k = k.concat(";")
                    }
                    var c = "var plural; var nplurals; " + k + ' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) };';
                    Gettext._locale_data[e].head.plural_func = new Function("n",c)
                } else {
                    throw new Error("Syntax error in language file. Plural-Forms header is invalid [" + l + "]")
                }
            } else {
                if (typeof (Gettext._locale_data[e].head.plural_func) == "undefined") {
                    Gettext._locale_data[e].head.plural_func = function(o) {
                        var h = (o != 1) ? 1 : 0;
                        return {
                            nplural: 2,
                            plural: h
                        }
                    }
                }
            }
        }
        return
    }
    ;
    Gettext.prototype.try_load_lang_po = function(b) {
        var d = this.sjax(b);
        if (!d) {
            return
        }
        var c = this.uri_basename(b);
        var a = this.parse_po(d);
        var e = {};
        if (a) {
            if (!a[""]) {
                a[""] = {}
            }
            if (!a[""]["domain"]) {
                a[""]["domain"] = c
            }
            c = a[""]["domain"];
            e[c] = a;
            this.parse_locale_data(e)
        }
        return 1
    }
    ;
    Gettext.prototype.uri_basename = function(b) {
        var c;
        if (c = b.match(/^(.*\/)?(.*)/)) {
            var a;
            if (a = c[2].match(/^(.*)\..+$/)) {
                return a[1]
            } else {
                return c[2]
            }
        } else {
            return ""
        }
    }
    ;
    Gettext.prototype.parse_po = function(q) {
        var e = {};
        var l = {};
        var j = "";
        var g = [];
        var a = q.split("\n");
        for (var n = 0; n < a.length; n++) {
            a[n] = a[n].replace(/(\n|\r)+$/, "");
            var f;
            if (/^$/.test(a[n])) {
                if (typeof (l.msgid) != "undefined") {
                    var p = (typeof (l.msgctxt) != "undefined" && l.msgctxt.length) ? l.msgctxt + Gettext.context_glue + l.msgid : l.msgid;
                    var m = (typeof (l.msgid_plural) != "undefined" && l.msgid_plural.length) ? l.msgid_plural : null;
                    var c = [];
                    for (var k in l) {
                        var f;
                        if (f = k.match(/^msgstr_(\d+)/)) {
                            c[parseInt(f[1])] = l[k]
                        }
                    }
                    c.unshift(m);
                    if (c.length > 1) {
                        e[p] = c
                    }
                    l = {};
                    j = ""
                }
            } else {
                if (/^#/.test(a[n])) {
                    continue
                } else {
                    if (f = a[n].match(/^msgctxt\s+(.*)/)) {
                        j = "msgctxt";
                        l[j] = this.parse_po_dequote(f[1])
                    } else {
                        if (f = a[n].match(/^msgid\s+(.*)/)) {
                            j = "msgid";
                            l[j] = this.parse_po_dequote(f[1])
                        } else {
                            if (f = a[n].match(/^msgid_plural\s+(.*)/)) {
                                j = "msgid_plural";
                                l[j] = this.parse_po_dequote(f[1])
                            } else {
                                if (f = a[n].match(/^msgstr\s+(.*)/)) {
                                    j = "msgstr_0";
                                    l[j] = this.parse_po_dequote(f[1])
                                } else {
                                    if (f = a[n].match(/^msgstr\[0\]\s+(.*)/)) {
                                        j = "msgstr_0";
                                        l[j] = this.parse_po_dequote(f[1])
                                    } else {
                                        if (f = a[n].match(/^msgstr\[(\d+)\]\s+(.*)/)) {
                                            j = "msgstr_" + f[1];
                                            l[j] = this.parse_po_dequote(f[2])
                                        } else {
                                            if (/^"/.test(a[n])) {
                                                l[j] += this.parse_po_dequote(a[n])
                                            } else {
                                                g.push("Strange line [" + n + "] : " + a[n])
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (typeof (l.msgid) != "undefined") {
            var p = (typeof (l.msgctxt) != "undefined" && l.msgctxt.length) ? l.msgctxt + Gettext.context_glue + l.msgid : l.msgid;
            var m = (typeof (l.msgid_plural) != "undefined" && l.msgid_plural.length) ? l.msgid_plural : null;
            var c = [];
            for (var k in l) {
                var f;
                if (f = k.match(/^msgstr_(\d+)/)) {
                    c[parseInt(f[1])] = l[k]
                }
            }
            c.unshift(m);
            if (c.length > 1) {
                e[p] = c
            }
            l = {};
            j = ""
        }
        if (e[""] && e[""][1]) {
            var b = {};
            var o = e[""][1].split(/\\n/);
            for (var n = 0; n < o.length; n++) {
                if (!o.length) {
                    continue
                }
                var d = o[n].indexOf(":", 0);
                if (d != -1) {
                    var r = o[n].substring(0, d);
                    var s = o[n].substring(d + 1);
                    var h = r.toLowerCase();
                    if (b[h] && b[h].length) {
                        g.push("SKIPPING DUPLICATE HEADER LINE: " + o[n])
                    } else {
                        if (/#-#-#-#-#/.test(h)) {
                            g.push("SKIPPING ERROR MARKER IN HEADER: " + o[n])
                        } else {
                            s = s.replace(/^\s+/, "");
                            b[h] = s
                        }
                    }
                } else {
                    g.push("PROBLEM LINE IN HEADER: " + o[n]);
                    b[o[n]] = ""
                }
            }
            e[""] = b
        } else {
            e[""] = {}
        }
        return e
    }
    ;
    Gettext.prototype.parse_po_dequote = function(b) {
        var a;
        if (a = b.match(/^"(.*)"/)) {
            b = a[1]
        }
        b = b.replace(/\\"/, "");
        return b
    }
    ;
    Gettext.prototype.try_load_lang_json = function(a) {
        var b = this.sjax(a);
        if (!b) {
            return
        }
        var c = this.JSON(b);
        this.parse_locale_data(c);
        return 1
    }
    ;
    Gettext.prototype.get_lang_refs = function() {
        var c = new Array();
        var a = document.getElementsByTagName("link");
        for (var b = 0; b < a.length; b++) {
            if (a[b].rel == "gettext" && a[b].href) {
                if (typeof (a[b].type) == "undefined" || a[b].type == "") {
                    if (/\.json$/i.test(a[b].href)) {
                        a[b].type = "application/json"
                    } else {
                        if (/\.js$/i.test(a[b].href)) {
                            a[b].type = "application/json"
                        } else {
                            if (/\.po$/i.test(a[b].href)) {
                                a[b].type = "application/x-po"
                            } else {
                                if (/\.mo$/i.test(a[b].href)) {
                                    a[b].type = "application/x-mo"
                                } else {
                                    throw new Error("LINK tag with rel=gettext found, but the type and extension are unrecognized.")
                                }
                            }
                        }
                    }
                }
                a[b].type = a[b].type.toLowerCase();
                if (a[b].type == "application/json") {
                    a[b].type = "application/json"
                } else {
                    if (a[b].type == "text/javascript") {
                        a[b].type = "application/json"
                    } else {
                        if (a[b].type == "application/x-po") {
                            a[b].type = "application/x-po"
                        } else {
                            if (a[b].type == "application/x-mo") {
                                a[b].type = "application/x-mo"
                            } else {
                                throw new Error("LINK tag with rel=gettext found, but the type attribute [" + a[b].type + "] is unrecognized.")
                            }
                        }
                    }
                }
                c.push(a[b])
            }
        }
        return c
    }
    ;
    Gettext.prototype.textdomain = function(a) {
        if (a && a.length) {
            this.domain = a
        }
        return this.domain
    }
    ;
    Gettext.prototype.gettext = function(c) {
        var e;
        var a;
        var d;
        var b;
        return this.dcnpgettext(null, e, c, a, d, b)
    }
    ;
    Gettext.prototype.dgettext = function(d, c) {
        var f;
        var a;
        var e;
        var b;
        return this.dcnpgettext(d, f, c, a, e, b)
    }
    ;
    Gettext.prototype.dcgettext = function(d, c, b) {
        var f;
        var a;
        var e;
        return this.dcnpgettext(d, f, c, a, e, b)
    }
    ;
    Gettext.prototype.ngettext = function(c, a, e) {
        var d;
        var b;
        return this.dcnpgettext(null, d, c, a, e, b)
    }
    ;
    Gettext.prototype.dngettext = function(d, c, a, f) {
        var e;
        var b;
        return this.dcnpgettext(d, e, c, a, f, b)
    }
    ;
    Gettext.prototype.dcngettext = function(d, c, a, f, b) {
        var e;
        return this.dcnpgettext(d, e, c, a, f, b, b)
    }
    ;
    Gettext.prototype.pgettext = function(e, c) {
        var a;
        var d;
        var b;
        return this.dcnpgettext(null, e, c, a, d, b)
    }
    ;
    Gettext.prototype.dpgettext = function(d, f, c) {
        var a;
        var e;
        var b;
        return this.dcnpgettext(d, f, c, a, e, b)
    }
    ;
    Gettext.prototype.dcpgettext = function(d, f, c, b) {
        var a;
        var e;
        return this.dcnpgettext(d, f, c, a, e, b)
    }
    ;
    Gettext.prototype.npgettext = function(e, c, a, d) {
        var b;
        return this.dcnpgettext(null, e, c, a, d, b)
    }
    ;
    Gettext.prototype.dnpgettext = function(d, f, c, a, e) {
        var b;
        return this.dcnpgettext(d, f, c, a, e, b)
    }
    ;
    Gettext.prototype.dcnpgettext = function(y, e, x, s, l, o) {
        if (!this.isValidObject(x)) {
            return ""
        }
        var g = this.isValidObject(s);
        var u = this.isValidObject(e) ? e + Gettext.context_glue + x : x;
        var a = this.isValidObject(y) ? y : this.isValidObject(this.domain) ? this.domain : "messages";
        var w = "LC_MESSAGES";
        var o = 5;
        var m = new Array();
        if (typeof (Gettext._locale_data) != "undefined" && this.isValidObject(Gettext._locale_data[a])) {
            m.push(Gettext._locale_data[a])
        } else {
            if (typeof (Gettext._locale_data) != "undefined") {
                for (var v in Gettext._locale_data) {
                    m.push(Gettext._locale_data[v])
                }
            }
        }
        var b = [];
        var f = false;
        var k;
        if (m.length) {
            for (var t = 0; t < m.length; t++) {
                var r = m[t];
                if (this.isValidObject(r.msgs[u])) {
                    for (var q = 0; q < r.msgs[u].length; q++) {
                        b[q] = r.msgs[u][q]
                    }
                    b.shift();
                    k = r;
                    f = true;
                    if (b.length > 0 && b[0].length != 0) {
                        break
                    }
                }
            }
        }
        if (b.length == 0 || b[0].length == 0) {
            b = [x, s]
        }
        var d = b[0];
        if (g) {
            var h;
            if (f && this.isValidObject(k.head.plural_func)) {
                var c = k.head.plural_func(l);
                if (!c.plural) {
                    c.plural = 0
                }
                if (!c.nplural) {
                    c.nplural = 0
                }
                if (c.nplural <= c.plural) {
                    c.plural = 0
                }
                h = c.plural
            } else {
                h = (l != 1) ? 1 : 0
            }
            if (this.isValidObject(b[h])) {
                d = b[h]
            }
        }
        return d
    }
    ;
    Gettext.strargs = function(g, c) {
        if (null == c || "undefined" == typeof (c)) {
            c = []
        } else {
            if (c.constructor != Array) {
                c = [c]
            }
        }
        var f = "";
        while (true) {
            var d = g.indexOf("%");
            var a;
            if (d == -1) {
                f += g;
                break
            }
            f += g.substr(0, d);
            if (g.substr(d, 2) == "%%") {
                f += "%";
                g = g.substr((d + 2))
            } else {
                if (a = g.substr(d).match(/^%(\d+)/)) {
                    var e = parseInt(a[1]);
                    var b = a[1].length;
                    if (e > 0 && c[e - 1] != null && typeof (c[e - 1]) != "undefined") {
                        f += c[e - 1]
                    }
                    g = g.substr((d + 1 + b))
                } else {
                    f += "%";
                    g = g.substr((d + 1))
                }
            }
        }
        return f
    }
    ;
    Gettext.prototype.strargs = function(b, a) {
        return Gettext.strargs(b, a)
    }
    ;
    Gettext.prototype.isArray = function(a) {
        return this.isValidObject(a) && a.constructor == Array
    }
    ;
    Gettext.prototype.isValidObject = function(a) {
        if (null == a) {
            return false
        } else {
            if ("undefined" == typeof (a)) {
                return false
            } else {
                return true
            }
        }
    }
    ;
    Gettext.prototype.sjax = function(d) {
        var c;
        if (window.XMLHttpRequest) {
            c = new XMLHttpRequest()
        } else {
            if (navigator.userAgent.toLowerCase().indexOf("msie 5") != -1) {
                c = new ActiveXObject("Microsoft.XMLHTTP")
            } else {
                c = new ActiveXObject("Msxml2.XMLHTTP")
            }
        }
        if (!c) {
            throw new Error("Your browser doesn't do Ajax. Unable to support external language files.")
        }
        c.open("GET", d, false);
        try {
            c.send(null)
        } catch (f) {
            return
        }
        var a = c.status;
        if (a == 200 || a == 0) {
            return c.responseText
        } else {
            var b = c.statusText + " (Error " + c.status + ")";
            if (c.responseText.length) {
                b += "\n" + c.responseText
            }
            alert(b);
            return
        }
    }
    ;
    Gettext.prototype.JSON = function(data) {
        return eval("(" + data + ")")
    }
    ;