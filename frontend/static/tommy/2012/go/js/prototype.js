    var Prototype = {
        Version: "1.6.0.3",
        Browser: {
            IE: !!(window.attachEvent && navigator.userAgent.indexOf("Opera") === -1),
            Opera: navigator.userAgent.indexOf("Opera") > -1,
            WebKit: navigator.userAgent.indexOf("AppleWebKit/") > -1,
            Gecko: navigator.userAgent.indexOf("Gecko") > -1 && navigator.userAgent.indexOf("KHTML") === -1,
            MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
        },
        BrowserFeatures: {
            XPath: !!document.evaluate,
            SelectorsAPI: !!document.querySelector,
            ElementExtensions: !!window.HTMLElement,
            SpecificElementExtensions: document.createElement("div")["__proto__"] && document.createElement("div")["__proto__"] !== document.createElement("form")["__proto__"]
        },
        ScriptFragment: "<script[^>]*>([\\S\\s]*?)<\/script>",
        JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,
        emptyFunction: function() {},
        K: function(a) {
            return a
        }
    };
    if (Prototype.Browser.MobileSafari) {
        Prototype.BrowserFeatures.SpecificElementExtensions = false
    }
    var Class = {
        create: function() {
            var e = null
              , d = $A(arguments);
            if (Object.isFunction(d[0])) {
                e = d.shift()
            }
            function a() {
                this.initialize.apply(this, arguments)
            }
            Object.extend(a, Class.Methods);
            a.superclass = e;
            a.subclasses = [];
            if (e) {
                var b = function() {};
                b.prototype = e.prototype;
                a.prototype = new b;
                e.subclasses.push(a)
            }
            for (var c = 0; c < d.length; c++) {
                a.addMethods(d[c])
            }
            if (!a.prototype.initialize) {
                a.prototype.initialize = Prototype.emptyFunction
            }
            a.prototype.constructor = a;
            return a
        }
    };
    Class.Methods = {
        addMethods: function(g) {
            var c = this.superclass && this.superclass.prototype;
            var b = Object.keys(g);
            if (!Object.keys({
                toString: true
            }).length) {
                b.push("toString", "valueOf")
            }
            for (var a = 0, d = b.length; a < d; a++) {
                var f = b[a]
                  , e = g[f];
                if (c && Object.isFunction(e) && e.argumentNames().first() == "$super") {
                    var h = e;
                    e = (function(i) {
                        return function() {
                            return c[i].apply(this, arguments)
                        }
                    }
                    )(f).wrap(h);
                    e.valueOf = h.valueOf.bind(h);
                    e.toString = h.toString.bind(h)
                }
                this.prototype[f] = e
            }
            return this
        }
    };
    var Abstract = {};
    Object.extend = function(a, c) {
        for (var b in c) {
            a[b] = c[b]
        }
        return a
    }
    ;
    Object.extend(Object, {
        inspect: function(a) {
            try {
                if (Object.isUndefined(a)) {
                    return "undefined"
                }
                if (a === null) {
                    return "null"
                }
                return a.inspect ? a.inspect() : String(a)
            } catch (b) {
                if (b instanceof RangeError) {
                    return "..."
                }
                throw b
            }
        },
        toJSON: function(a) {
            var c = typeof a;
            switch (c) {
            case "undefined":
            case "function":
            case "unknown":
                return;
            case "boolean":
                return a.toString()
            }
            if (a === null) {
                return "null"
            }
            if (a.toJSON) {
                return a.toJSON()
            }
            if (Object.isElement(a)) {
                return
            }
            var b = [];
            for (var e in a) {
                var d = Object.toJSON(a[e]);
                if (!Object.isUndefined(d)) {
                    b.push(e.toJSON() + ": " + d)
                }
            }
            return "{" + b.join(", ") + "}"
        },
        toQueryString: function(a) {
            return $H(a).toQueryString()
        },
        toHTML: function(a) {
            return a && a.toHTML ? a.toHTML() : String.interpret(a)
        },
        keys: function(a) {
            var b = [];
            for (var c in a) {
                b.push(c)
            }
            return b
        },
        values: function(b) {
            var a = [];
            for (var c in b) {
                a.push(b[c])
            }
            return a
        },
        clone: function(a) {
            return Object.extend({}, a)
        },
        isElement: function(a) {
            return !!(a && a.nodeType == 1)
        },
        isArray: function(a) {
            return a != null && typeof a == "object" && "splice"in a && "join"in a
        },
        isHash: function(a) {
            return a instanceof Hash
        },
        isFunction: function(a) {
            return typeof a == "function"
        },
        isString: function(a) {
            return typeof a == "string"
        },
        isNumber: function(a) {
            return typeof a == "number"
        },
        isUndefined: function(a) {
            return typeof a == "undefined"
        }
    });
    Object.extend(Function.prototype, {
        argumentNames: function() {
            var a = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1].replace(/\s+/g, "").split(",");
            return a.length == 1 && !a[0] ? [] : a
        },
        bind: function() {
            if (arguments.length < 2 && Object.isUndefined(arguments[0])) {
                return this
            }
            var a = this
              , c = $A(arguments)
              , b = c.shift();
            return function() {
                return a.apply(b, c.concat($A(arguments)))
            }
        },
        bindAsEventListener: function() {
            var a = this
              , c = $A(arguments)
              , b = c.shift();
            return function(d) {
                return a.apply(b, [d || window.event].concat(c))
            }
        },
        curry: function() {
            if (!arguments.length) {
                return this
            }
            var a = this
              , b = $A(arguments);
            return function() {
                return a.apply(this, b.concat($A(arguments)))
            }
        },
        delay: function() {
            var a = this
              , b = $A(arguments)
              , c = b.shift() * 1000;
            return window.setTimeout(function() {
                return a.apply(a, b)
            }, c)
        },
        defer: function() {
            var a = [0.01].concat($A(arguments));
            return this.delay.apply(this, a)
        },
        wrap: function(b) {
            var a = this;
            return function() {
                return b.apply(this, [a.bind(this)].concat($A(arguments)))
            }
        },
        methodize: function() {
            if (this._methodized) {
                return this._methodized
            }
            var a = this;
            return this._methodized = function() {
                return a.apply(null, [this].concat($A(arguments)))
            }
        }
    });
    Date.prototype.toJSON = function() {
        return '"' + this.getUTCFullYear() + "-" + (this.getUTCMonth() + 1).toPaddedString(2) + "-" + this.getUTCDate().toPaddedString(2) + "T" + this.getUTCHours().toPaddedString(2) + ":" + this.getUTCMinutes().toPaddedString(2) + ":" + this.getUTCSeconds().toPaddedString(2) + 'Z"'
    }
    ;
    var Try = {
        these: function() {
            var c;
            for (var b = 0, d = arguments.length; b < d; b++) {
                var a = arguments[b];
                try {
                    c = a();
                    break
                } catch (f) {}
            }
            return c
        }
    };
    RegExp.prototype.match = RegExp.prototype.test;
    RegExp.escape = function(a) {
        return String(a).replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")
    }
    ;
    var PeriodicalExecuter = Class.create({
        initialize: function(b, a) {
            this.callback = b;
            this.frequency = a;
            this.currentlyExecuting = false;
            this.registerCallback()
        },
        registerCallback: function() {
            this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000)
        },
        execute: function() {
            this.callback(this)
        },
        stop: function() {
            if (!this.timer) {
                return
            }
            clearInterval(this.timer);
            this.timer = null
        },
        onTimerEvent: function() {
            if (!this.currentlyExecuting) {
                try {
                    this.currentlyExecuting = true;
                    this.execute()
                } finally {
                    this.currentlyExecuting = false
                }
            }
        }
    });
    Object.extend(String, {
        interpret: function(a) {
            return a == null ? "" : String(a)
        },
        specialChar: {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\\": "\\\\"
        }
    });
    Object.extend(String.prototype, {
        gsub: function(e, c) {
            var a = "", d = this, b;
            c = arguments.callee.prepareReplacement(c);
            while (d.length > 0) {
                if (b = d.match(e)) {
                    a += d.slice(0, b.index);
                    a += String.interpret(c(b));
                    d = d.slice(b.index + b[0].length)
                } else {
                    a += d,
                    d = ""
                }
            }
            return a
        },
        sub: function(c, a, b) {
            a = this.gsub.prepareReplacement(a);
            b = Object.isUndefined(b) ? 1 : b;
            return this.gsub(c, function(d) {
                if (--b < 0) {
                    return d[0]
                }
                return a(d)
            })
        },
        scan: function(b, a) {
            this.gsub(b, a);
            return String(this)
        },
        truncate: function(b, a) {
            b = b || 30;
            a = Object.isUndefined(a) ? "..." : a;
            return this.length > b ? this.slice(0, b - a.length) + a : String(this)
        },
        strip: function() {
            return this.replace(/^\s+/, "").replace(/\s+$/, "")
        },
        stripTags: function() {
            return this.replace(/<\/?[^>]+>/gi, "")
        },
        stripScripts: function() {
            return this.replace(new RegExp(Prototype.ScriptFragment,"img"), "")
        },
        extractScripts: function() {
            var b = new RegExp(Prototype.ScriptFragment,"img");
            var a = new RegExp(Prototype.ScriptFragment,"im");
            return (this.match(b) || []).map(function(c) {
                return (c.match(a) || ["", ""])[1]
            })
        },
        evalScripts: function() {
            return this.extractScripts().map(function(script) {
                return eval(script)
            })
        },
        escapeHTML: function() {
            var a = arguments.callee;
            a.text.data = this;
            return a.div.innerHTML
        },
        unescapeHTML: function() {
            var a = new Element("div");
            a.innerHTML = this.stripTags();
            return a.childNodes[0] ? (a.childNodes.length > 1 ? $A(a.childNodes).inject("", function(b, c) {
                return b + c.nodeValue
            }) : a.childNodes[0].nodeValue) : ""
        },
        toQueryParams: function(b) {
            var a = this.strip().match(/([^?#]*)(#.*)?$/);
            if (!a) {
                return {}
            }
            return a[1].split(b || "&").inject({}, function(e, f) {
                if ((f = f.split("="))[0]) {
                    var c = decodeURIComponent(f.shift());
                    var d = f.length > 1 ? f.join("=") : f[0];
                    if (d != undefined) {
                        d = decodeURIComponent(d)
                    }
                    if (c in e) {
                        if (!Object.isArray(e[c])) {
                            e[c] = [e[c]]
                        }
                        e[c].push(d)
                    } else {
                        e[c] = d
                    }
                }
                return e
            })
        },
        toArray: function() {
            return this.split("")
        },
        succ: function() {
            return this.slice(0, this.length - 1) + String.fromCharCode(this.charCodeAt(this.length - 1) + 1)
        },
        times: function(a) {
            return a < 1 ? "" : new Array(a + 1).join(this)
        },
        camelize: function() {
            var d = this.split("-")
              , a = d.length;
            if (a == 1) {
                return d[0]
            }
            var c = this.charAt(0) == "-" ? d[0].charAt(0).toUpperCase() + d[0].substring(1) : d[0];
            for (var b = 1; b < a; b++) {
                c += d[b].charAt(0).toUpperCase() + d[b].substring(1)
            }
            return c
        },
        capitalize: function() {
            return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase()
        },
        underscore: function() {
            return this.gsub(/::/, "/").gsub(/([A-Z]+)([A-Z][a-z])/, "#{1}_#{2}").gsub(/([a-z\d])([A-Z])/, "#{1}_#{2}").gsub(/-/, "_").toLowerCase()
        },
        dasherize: function() {
            return this.gsub(/_/, "-")
        },
        inspect: function(b) {
            var a = this.gsub(/[\x00-\x1f\\]/, function(c) {
                var d = String.specialChar[c[0]];
                return d ? d : "\\u00" + c[0].charCodeAt().toPaddedString(2, 16)
            });
            if (b) {
                return '"' + a.replace(/"/g, '\\"') + '"'
            }
            return "'" + a.replace(/'/g, "\\'") + "'"
        },
        toJSON: function() {
            return this.inspect(true)
        },
        unfilterJSON: function(a) {
            return this.sub(a || Prototype.JSONFilter, "#{1}")
        },
        isJSON: function() {
            var a = this;
            if (a.blank()) {
                return false
            }
            a = this.replace(/\\./g, "@").replace(/"[^"\\\n\r]*"/g, "");
            return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(a)
        },
        evalJSON: function(sanitize) {
            var json = this.unfilterJSON();
            try {
                if (!sanitize || json.isJSON()) {
                    return eval("(" + json + ")")
                }
            } catch (e) {}
            throw new SyntaxError("Badly formed JSON string: " + this.inspect())
        },
        include: function(a) {
            return this.indexOf(a) > -1
        },
        startsWith: function(a) {
            return this.indexOf(a) === 0
        },
        endsWith: function(a) {
            var b = this.length - a.length;
            return b >= 0 && this.lastIndexOf(a) === b
        },
        empty: function() {
            return this == ""
        },
        blank: function() {
            return /^\s*$/.test(this)
        },
        interpolate: function(a, b) {
            return new Template(this,b).evaluate(a)
        }
    });
    if (Prototype.Browser.WebKit || Prototype.Browser.IE) {
        Object.extend(String.prototype, {
            escapeHTML: function() {
                return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            },
            unescapeHTML: function() {
                return this.stripTags().replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            }
        })
    }
    String.prototype.gsub.prepareReplacement = function(b) {
        if (Object.isFunction(b)) {
            return b
        }
        var a = new Template(b);
        return function(c) {
            return a.evaluate(c)
        }
    }
    ;
    String.prototype.parseQuery = String.prototype.toQueryParams;
    Object.extend(String.prototype.escapeHTML, {
        div: document.createElement("div"),
        text: document.createTextNode("")
    });
    String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);
    var Template = Class.create({
        initialize: function(a, b) {
            this.template = a.toString();
            this.pattern = b || Template.Pattern
        },
        evaluate: function(a) {
            if (Object.isFunction(a.toTemplateReplacements)) {
                a = a.toTemplateReplacements()
            }
            return this.template.gsub(this.pattern, function(d) {
                if (a == null) {
                    return ""
                }
                var f = d[1] || "";
                if (f == "\\") {
                    return d[2]
                }
                var b = a
                  , g = d[3];
                var e = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
                d = e.exec(g);
                if (d == null) {
                    return f
                }
                while (d != null) {
                    var c = d[1].startsWith("[") ? d[2].gsub("\\\\]", "]") : d[1];
                    b = b[c];
                    if (null == b || "" == d[3]) {
                        break
                    }
                    g = g.substring("[" == d[3] ? d[1].length : d[0].length);
                    d = e.exec(g)
                }
                return f + String.interpret(b)
            })
        }
    });
    Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
    var $break = {};
    var Enumerable = {
        each: function(c, b) {
            var a = 0;
            try {
                this._each(function(e) {
                    c.call(b, e, a++)
                })
            } catch (d) {
                if (d != $break) {
                    throw d
                }
            }
            return this
        },
        eachSlice: function(d, c, b) {
            var a = -d
              , e = []
              , f = this.toArray();
            if (d < 1) {
                return f
            }
            while ((a += d) < f.length) {
                e.push(f.slice(a, a + d))
            }
            return e.collect(c, b)
        },
        all: function(c, b) {
            c = c || Prototype.K;
            var a = true;
            this.each(function(e, d) {
                a = a && !!c.call(b, e, d);
                if (!a) {
                    throw $break
                }
            });
            return a
        },
        any: function(c, b) {
            c = c || Prototype.K;
            var a = false;
            this.each(function(e, d) {
                if (a = !!c.call(b, e, d)) {
                    throw $break
                }
            });
            return a
        },
        collect: function(c, b) {
            c = c || Prototype.K;
            var a = [];
            this.each(function(e, d) {
                a.push(c.call(b, e, d))
            });
            return a
        },
        detect: function(c, b) {
            var a;
            this.each(function(e, d) {
                if (c.call(b, e, d)) {
                    a = e;
                    throw $break
                }
            });
            return a
        },
        findAll: function(c, b) {
            var a = [];
            this.each(function(e, d) {
                if (c.call(b, e, d)) {
                    a.push(e)
                }
            });
            return a
        },
        grep: function(d, c, b) {
            c = c || Prototype.K;
            var a = [];
            if (Object.isString(d)) {
                d = new RegExp(d)
            }
            this.each(function(f, e) {
                if (d.match(f)) {
                    a.push(c.call(b, f, e))
                }
            });
            return a
        },
        include: function(a) {
            if (Object.isFunction(this.indexOf)) {
                if (this.indexOf(a) != -1) {
                    return true
                }
            }
            var b = false;
            this.each(function(c) {
                if (c == a) {
                    b = true;
                    throw $break
                }
            });
            return b
        },
        inGroupsOf: function(b, a) {
            a = Object.isUndefined(a) ? null : a;
            return this.eachSlice(b, function(c) {
                while (c.length < b) {
                    c.push(a)
                }
                return c
            })
        },
        inject: function(a, c, b) {
            this.each(function(e, d) {
                a = c.call(b, a, e, d)
            });
            return a
        },
        invoke: function(b) {
            var a = $A(arguments).slice(1);
            return this.map(function(c) {
                return c[b].apply(c, a)
            })
        },
        max: function(c, b) {
            c = c || Prototype.K;
            var a;
            this.each(function(e, d) {
                e = c.call(b, e, d);
                if (a == null || e >= a) {
                    a = e
                }
            });
            return a
        },
        min: function(c, b) {
            c = c || Prototype.K;
            var a;
            this.each(function(e, d) {
                e = c.call(b, e, d);
                if (a == null || e < a) {
                    a = e
                }
            });
            return a
        },
        partition: function(d, b) {
            d = d || Prototype.K;
            var c = []
              , a = [];
            this.each(function(f, e) {
                (d.call(b, f, e) ? c : a).push(f)
            });
            return [c, a]
        },
        pluck: function(b) {
            var a = [];
            this.each(function(c) {
                a.push(c[b])
            });
            return a
        },
        reject: function(c, b) {
            var a = [];
            this.each(function(e, d) {
                if (!c.call(b, e, d)) {
                    a.push(e)
                }
            });
            return a
        },
        sortBy: function(b, a) {
            return this.map(function(d, c) {
                return {
                    value: d,
                    criteria: b.call(a, d, c)
                }
            }).sort(function(f, e) {
                var d = f.criteria
                  , c = e.criteria;
                return d < c ? -1 : d > c ? 1 : 0
            }).pluck("value")
        },
        toArray: function() {
            return this.map()
        },
        zip: function() {
            var b = Prototype.K
              , a = $A(arguments);
            if (Object.isFunction(a.last())) {
                b = a.pop()
            }
            var c = [this].concat(a).map($A);
            return this.map(function(e, d) {
                return b(c.pluck(d))
            })
        },
        size: function() {
            return this.toArray().length
        },
        inspect: function() {
            return "#<Enumerable:" + this.toArray().inspect() + ">"
        }
    };
    Object.extend(Enumerable, {
        map: Enumerable.collect,
        find: Enumerable.detect,
        select: Enumerable.findAll,
        filter: Enumerable.findAll,
        member: Enumerable.include,
        entries: Enumerable.toArray,
        every: Enumerable.all,
        some: Enumerable.any
    });
    function $A(c) {
        if (!c) {
            return []
        }
        if (c.toArray) {
            return c.toArray()
        }
        var b = c.length || 0
          , a = new Array(b);
        while (b--) {
            a[b] = c[b]
        }
        return a
    }
    if (Prototype.Browser.WebKit) {
        $A = function(c) {
            if (!c) {
                return []
            }
            if (!(typeof c === "function" && typeof c.length === "number" && typeof c.item === "function") && c.toArray) {
                return c.toArray()
            }
            var b = c.length || 0
              , a = new Array(b);
            while (b--) {
                a[b] = c[b]
            }
            return a
        }
    }
    Array.from = $A;
    Object.extend(Array.prototype, Enumerable);
    if (!Array.prototype._reverse) {
        Array.prototype._reverse = Array.prototype.reverse
    }
    Object.extend(Array.prototype, {
        _each: function(b) {
            for (var a = 0, c = this.length; a < c; a++) {
                b(this[a])
            }
        },
        clear: function() {
            this.length = 0;
            return this
        },
        first: function() {
            return this[0]
        },
        last: function() {
            return this[this.length - 1]
        },
        compact: function() {
            return this.select(function(a) {
                return a != null
            })
        },
        flatten: function() {
            return this.inject([], function(b, a) {
                return b.concat(Object.isArray(a) ? a.flatten() : [a])
            })
        },
        without: function() {
            var a = $A(arguments);
            return this.select(function(b) {
                return !a.include(b)
            })
        },
        reverse: function(a) {
            return (a !== false ? this : this.toArray())._reverse()
        },
        reduce: function() {
            return this.length > 1 ? this : this[0]
        },
        uniq: function(a) {
            return this.inject([], function(d, c, b) {
                if (0 == b || (a ? d.last() != c : !d.include(c))) {
                    d.push(c)
                }
                return d
            })
        },
        intersect: function(a) {
            return this.uniq().findAll(function(b) {
                return a.detect(function(c) {
                    return b === c
                })
            })
        },
        clone: function() {
            return [].concat(this)
        },
        size: function() {
            return this.length
        },
        inspect: function() {
            return "[" + this.map(Object.inspect).join(", ") + "]"
        },
        toJSON: function() {
            var a = [];
            this.each(function(b) {
                var c = Object.toJSON(b);
                if (!Object.isUndefined(c)) {
                    a.push(c)
                }
            });
            return "[" + a.join(", ") + "]"
        }
    });
    if (Object.isFunction(Array.prototype.forEach)) {
        Array.prototype._each = Array.prototype.forEach
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(c, a) {
            a || (a = 0);
            var b = this.length;
            if (a < 0) {
                a = b + a
            }
            for (; a < b; a++) {
                if (this[a] === c) {
                    return a
                }
            }
            return -1
        }
    }
    if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function(b, a) {
            a = isNaN(a) ? this.length : (a < 0 ? this.length + a : a) + 1;
            var c = this.slice(0, a).reverse().indexOf(b);
            return (c < 0) ? c : a - c - 1
        }
    }
    Array.prototype.toArray = Array.prototype.clone;
    function $w(a) {
        if (!Object.isString(a)) {
            return []
        }
        a = a.strip();
        return a ? a.split(/\s+/) : []
    }
    if (Prototype.Browser.Opera) {
        Array.prototype.concat = function() {
            var e = [];
            for (var b = 0, c = this.length; b < c; b++) {
                e.push(this[b])
            }
            for (var b = 0, c = arguments.length; b < c; b++) {
                if (Object.isArray(arguments[b])) {
                    for (var a = 0, d = arguments[b].length; a < d; a++) {
                        e.push(arguments[b][a])
                    }
                } else {
                    e.push(arguments[b])
                }
            }
            return e
        }
    }
    Object.extend(Number.prototype, {
        toColorPart: function() {
            return this.toPaddedString(2, 16)
        },
        succ: function() {
            return this + 1
        },
        times: function(b, a) {
            $R(0, this, true).each(b, a);
            return this
        },
        toPaddedString: function(c, b) {
            var a = this.toString(b || 10);
            return "0".times(c - a.length) + a
        },
        toJSON: function() {
            return isFinite(this) ? this.toString() : "null"
        }
    });
    $w("abs round ceil floor").each(function(a) {
        Number.prototype[a] = Math[a].methodize()
    });
    function $H(a) {
        return new Hash(a)
    }
    var Hash = Class.create(Enumerable, (function() {
        function a(b, c) {
            if (Object.isUndefined(c)) {
                return b
            }
            return b + "=" + encodeURIComponent(String.interpret(c))
        }
        return {
            initialize: function(b) {
                this._object = Object.isHash(b) ? b.toObject() : Object.clone(b)
            },
            _each: function(c) {
                for (var b in this._object) {
                    var d = this._object[b]
                      , e = [b, d];
                    e.key = b;
                    e.value = d;
                    c(e)
                }
            },
            set: function(b, c) {
                return this._object[b] = c
            },
            get: function(b) {
                if (this._object[b] !== Object.prototype[b]) {
                    return this._object[b]
                }
            },
            unset: function(b) {
                var c = this._object[b];
                delete this._object[b];
                return c
            },
            toObject: function() {
                return Object.clone(this._object)
            },
            keys: function() {
                return this.pluck("key")
            },
            values: function() {
                return this.pluck("value")
            },
            index: function(c) {
                var b = this.detect(function(d) {
                    return d.value === c
                });
                return b && b.key
            },
            merge: function(b) {
                return this.clone().update(b)
            },
            update: function(b) {
                return new Hash(b).inject(this, function(c, d) {
                    c.set(d.key, d.value);
                    return c
                })
            },
            toQueryString: function() {
                return this.inject([], function(d, e) {
                    var c = encodeURIComponent(e.key)
                      , b = e.value;
                    if (b && typeof b == "object") {
                        if (Object.isArray(b)) {
                            return d.concat(b.map(a.curry(c)))
                        }
                    } else {
                        d.push(a(c, b))
                    }
                    return d
                }).join("&")
            },
            inspect: function() {
                return "#<Hash:{" + this.map(function(b) {
                    return b.map(Object.inspect).join(": ")
                }).join(", ") + "}>"
            },
            toJSON: function() {
                return Object.toJSON(this.toObject())
            },
            clone: function() {
                return new Hash(this)
            }
        }
    }
    )());
    Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
    Hash.from = $H;
    var ObjectRange = Class.create(Enumerable, {
        initialize: function(c, a, b) {
            this.start = c;
            this.end = a;
            this.exclusive = b
        },
        _each: function(a) {
            var b = this.start;
            while (this.include(b)) {
                a(b);
                b = b.succ()
            }
        },
        include: function(a) {
            if (a < this.start) {
                return false
            }
            if (this.exclusive) {
                return a < this.end
            }
            return a <= this.end
        }
    });
    var $R = function(c, a, b) {
        return new ObjectRange(c,a,b)
    };
    var Ajax = {
        getTransport: function() {
            return Try.these(function() {
                return new XMLHttpRequest()
            }, function() {
                return new ActiveXObject("Msxml2.XMLHTTP")
            }, function() {
                return new ActiveXObject("Microsoft.XMLHTTP")
            }) || false
        },
        activeRequestCount: 0
    };
    Ajax.Responders = {
        responders: [],
        _each: function(a) {
            this.responders._each(a)
        },
        register: function(a) {
            if (!this.include(a)) {
                this.responders.push(a)
            }
        },
        unregister: function(a) {
            this.responders = this.responders.without(a)
        },
        dispatch: function(d, b, c, a) {
            this.each(function(f) {
                if (Object.isFunction(f[d])) {
                    try {
                        f[d].apply(f, [b, c, a])
                    } catch (g) {}
                }
            })
        }
    };
    Object.extend(Ajax.Responders, Enumerable);
    Ajax.Responders.register({
        onCreate: function() {
            Ajax.activeRequestCount++
        },
        onComplete: function() {
            Ajax.activeRequestCount--
        }
    });
    Ajax.Base = Class.create({
        initialize: function(a) {
            this.options = {
                method: "post",
                asynchronous: true,
                contentType: "application/x-www-form-urlencoded",
                encoding: "UTF-8",
                parameters: "",
                evalJSON: true,
                evalJS: true
            };
            Object.extend(this.options, a || {});
            this.options.method = this.options.method.toLowerCase();
            if (Object.isString(this.options.parameters)) {
                this.options.parameters = this.options.parameters.toQueryParams()
            } else {
                if (Object.isHash(this.options.parameters)) {
                    this.options.parameters = this.options.parameters.toObject()
                }
            }
        }
    });
    Ajax.Request = Class.create(Ajax.Base, {
        _complete: false,
        initialize: function($super, b, a) {
            $super(a);
            this.transport = Ajax.getTransport();
            this.request(b)
        },
        request: function(b) {
            this.url = b;
            this.method = this.options.method;
            var d = Object.clone(this.options.parameters);
            if (!["get", "post"].include(this.method)) {
                d._method = this.method;
                this.method = "post"
            }
            this.parameters = d;
            if (d = Object.toQueryString(d)) {
                if (this.method == "get") {
                    this.url += (this.url.include("?") ? "&" : "?") + d
                } else {
                    if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
                        d += "&_="
                    }
                }
            }
            try {
                var a = new Ajax.Response(this);
                if (this.options.onCreate) {
                    this.options.onCreate(a)
                }
                Ajax.Responders.dispatch("onCreate", this, a);
                this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
                if (this.options.asynchronous) {
                    this.respondToReadyState.bind(this).defer(1)
                }
                this.transport.onreadystatechange = this.onStateChange.bind(this);
                this.setRequestHeaders();
                this.body = this.method == "post" ? (this.options.postBody || d) : null;
                this.transport.send(this.body);
                if (!this.options.asynchronous && this.transport.overrideMimeType) {
                    this.onStateChange()
                }
            } catch (c) {
                this.dispatchException(c)
            }
        },
        onStateChange: function() {
            var a = this.transport.readyState;
            if (a > 1 && !((a == 4) && this._complete)) {
                this.respondToReadyState(this.transport.readyState)
            }
        },
        setRequestHeaders: function() {
            var e = {
                "X-Requested-With": "XMLHttpRequest",
                "X-Prototype-Version": Prototype.Version,
                Accept: "text/javascript, text/html, application/xml, text/xml, */*"
            };
            if (this.method == "post") {
                e["Content-type"] = this.options.contentType + (this.options.encoding ? "; charset=" + this.options.encoding : "");
                if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005) {
                    e.Connection = "close"
                }
            }
            if (typeof this.options.requestHeaders == "object") {
                var c = this.options.requestHeaders;
                if (Object.isFunction(c.push)) {
                    for (var b = 0, d = c.length; b < d; b += 2) {
                        e[c[b]] = c[b + 1]
                    }
                } else {
                    $H(c).each(function(f) {
                        e[f.key] = f.value
                    })
                }
            }
            for (var a in e) {
                this.transport.setRequestHeader(a, e[a])
            }
        },
        success: function() {
            var a = this.getStatus();
            return !a || (a >= 200 && a < 300)
        },
        getStatus: function() {
            try {
                return this.transport.status || 0
            } catch (a) {
                return 0
            }
        },
        respondToReadyState: function(a) {
            var c = Ajax.Request.Events[a]
              , b = new Ajax.Response(this);
            if (c == "Complete") {
                try {
                    this._complete = true;
                    (this.options["on" + b.status] || this.options["on" + (this.success() ? "Success" : "Failure")] || Prototype.emptyFunction)(b, b.headerJSON)
                } catch (d) {
                    this.dispatchException(d)
                }
                var f = b.getHeader("Content-type");
                if (this.options.evalJS == "force" || (this.options.evalJS && this.isSameOrigin() && f && f.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i))) {
                    this.evalResponse()
                }
            }
            try {
                (this.options["on" + c] || Prototype.emptyFunction)(b, b.headerJSON);
                Ajax.Responders.dispatch("on" + c, this, b, b.headerJSON)
            } catch (d) {
                this.dispatchException(d)
            }
            if (c == "Complete") {
                this.transport.onreadystatechange = Prototype.emptyFunction
            }
        },
        isSameOrigin: function() {
            var a = this.url.match(/^\s*https?:\/\/[^\/]*/);
            return !a || (a[0] == "#{protocol}//#{domain}#{port}".interpolate({
                protocol: location.protocol,
                domain: document.domain,
                port: location.port ? ":" + location.port : ""
            }))
        },
        getHeader: function(a) {
            try {
                return this.transport.getResponseHeader(a) || null
            } catch (b) {
                return null
            }
        },
        evalResponse: function() {
            try {
                return eval((this.transport.responseText || "").unfilterJSON())
            } catch (e) {
                this.dispatchException(e)
            }
        },
        dispatchException: function(a) {
            (this.options.onException || Prototype.emptyFunction)(this, a);
            Ajax.Responders.dispatch("onException", this, a)
        }
    });
    Ajax.Request.Events = ["Uninitialized", "Loading", "Loaded", "Interactive", "Complete"];
    Ajax.Response = Class.create({
        initialize: function(c) {
            this.request = c;
            var d = this.transport = c.transport
              , a = this.readyState = d.readyState;
            if ((a > 2 && !Prototype.Browser.IE) || a == 4) {
                this.status = this.getStatus();
                this.statusText = this.getStatusText();
                this.responseText = String.interpret(d.responseText);
                this.headerJSON = this._getHeaderJSON()
            }
            if (a == 4) {
                var b = d.responseXML;
                this.responseXML = Object.isUndefined(b) ? null : b;
                this.responseJSON = this._getResponseJSON()
            }
        },
        status: 0,
        statusText: "",
        getStatus: Ajax.Request.prototype.getStatus,
        getStatusText: function() {
            try {
                return this.transport.statusText || ""
            } catch (a) {
                return ""
            }
        },
        getHeader: Ajax.Request.prototype.getHeader,
        getAllHeaders: function() {
            try {
                return this.getAllResponseHeaders()
            } catch (a) {
                return null
            }
        },
        getResponseHeader: function(a) {
            return this.transport.getResponseHeader(a)
        },
        getAllResponseHeaders: function() {
            return this.transport.getAllResponseHeaders()
        },
        _getHeaderJSON: function() {
            var a = this.getHeader("X-JSON");
            if (!a) {
                return null
            }
            a = decodeURIComponent(escape(a));
            try {
                return a.evalJSON(this.request.options.sanitizeJSON || !this.request.isSameOrigin())
            } catch (b) {
                this.request.dispatchException(b)
            }
        },
        _getResponseJSON: function() {
            var a = this.request.options;
            if (!a.evalJSON || (a.evalJSON != "force" && !(this.getHeader("Content-type") || "").include("application/json")) || this.responseText.blank()) {
                return null
            }
            try {
                return this.responseText.evalJSON(a.sanitizeJSON || !this.request.isSameOrigin())
            } catch (b) {
                this.request.dispatchException(b)
            }
        }
    });
    Ajax.Updater = Class.create(Ajax.Request, {
        initialize: function($super, a, c, b) {
            this.container = {
                success: (a.success || a),
                failure: (a.failure || (a.success ? null : a))
            };
            b = Object.clone(b);
            var d = b.onComplete;
            b.onComplete = (function(e, f) {
                this.updateContent(e.responseText);
                if (Object.isFunction(d)) {
                    d(e, f)
                }
            }
            ).bind(this);
            $super(c, b)
        },
        updateContent: function(d) {
            var c = this.container[this.success() ? "success" : "failure"]
              , a = this.options;
            if (!a.evalScripts) {
                d = d.stripScripts()
            }
            if (c = $(c)) {
                if (a.insertion) {
                    if (Object.isString(a.insertion)) {
                        var b = {};
                        b[a.insertion] = d;
                        c.insert(b)
                    } else {
                        a.insertion(c, d)
                    }
                } else {
                    c.update(d)
                }
            }
        }
    });
    Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
        initialize: function($super, a, c, b) {
            $super(b);
            this.onComplete = this.options.onComplete;
            this.frequency = (this.options.frequency || 2);
            this.decay = (this.options.decay || 1);
            this.updater = {};
            this.container = a;
            this.url = c;
            this.start()
        },
        start: function() {
            this.options.onComplete = this.updateComplete.bind(this);
            this.onTimerEvent()
        },
        stop: function() {
            this.updater.options.onComplete = undefined;
            clearTimeout(this.timer);
            (this.onComplete || Prototype.emptyFunction).apply(this, arguments)
        },
        updateComplete: function(a) {
            if (this.options.decay) {
                this.decay = (a.responseText == this.lastText ? this.decay * this.options.decay : 1);
                this.lastText = a.responseText
            }
            this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency)
        },
        onTimerEvent: function() {
            this.updater = new Ajax.Updater(this.container,this.url,this.options)
        }
    });
    function $(b) {
        if (arguments.length > 1) {
            for (var a = 0, d = [], c = arguments.length; a < c; a++) {
                d.push($(arguments[a]))
            }
            return d
        }
        if (Object.isString(b)) {
            b = document.getElementById(b)
        }
        return Element.extend(b)
    }
    if (Prototype.BrowserFeatures.XPath) {
        document._getElementsByXPath = function(f, a) {
            var c = [];
            var e = document.evaluate(f, $(a) || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (var b = 0, d = e.snapshotLength; b < d; b++) {
                c.push(Element.extend(e.snapshotItem(b)))
            }
            return c
        }
    }
    if (!window.Node) {
        var Node = {}
    }
    if (!Node.ELEMENT_NODE) {
        Object.extend(Node, {
            ELEMENT_NODE: 1,
            ATTRIBUTE_NODE: 2,
            TEXT_NODE: 3,
            CDATA_SECTION_NODE: 4,
            ENTITY_REFERENCE_NODE: 5,
            ENTITY_NODE: 6,
            PROCESSING_INSTRUCTION_NODE: 7,
            COMMENT_NODE: 8,
            DOCUMENT_NODE: 9,
            DOCUMENT_TYPE_NODE: 10,
            DOCUMENT_FRAGMENT_NODE: 11,
            NOTATION_NODE: 12
        })
    }
    (function() {
        var a = this.Element;
        this.Element = function(d, c) {
            c = c || {};
            d = d.toLowerCase();
            var b = Element.cache;
            if (Prototype.Browser.IE && c.name) {
                d = "<" + d + ' name="' + c.name + '">';
                delete c.name;
                return Element.writeAttribute(document.createElement(d), c)
            }
            if (!b[d]) {
                b[d] = Element.extend(document.createElement(d))
            }
            return Element.writeAttribute(b[d].cloneNode(false), c)
        }
        ;
        Object.extend(this.Element, a || {});
        if (a) {
            this.Element.prototype = a.prototype
        }
    }
    ).call(window);
    Element.cache = {};
    Element.Methods = {
        visible: function(a) {
            return $(a).style.display != "none"
        },
        toggle: function(a) {
            a = $(a);
            Element[Element.visible(a) ? "hide" : "show"](a);
            return a
        },
        hide: function(a) {
            a = $(a);
            a.style.display = "none";
            return a
        },
        show: function(a) {
            a = $(a);
            a.style.display = "";
            return a
        },
        remove: function(a) {
            a = $(a);
            a.parentNode.removeChild(a);
            return a
        },
        update: function(a, b) {
            a = $(a);
            if (b && b.toElement) {
                b = b.toElement()
            }
            if (Object.isElement(b)) {
                return a.update().insert(b)
            }
            b = Object.toHTML(b);
            a.innerHTML = b.stripScripts();
            b.evalScripts.bind(b).defer();
            return a
        },
        replace: function(b, c) {
            b = $(b);
            if (c && c.toElement) {
                c = c.toElement()
            } else {
                if (!Object.isElement(c)) {
                    c = Object.toHTML(c);
                    var a = b.ownerDocument.createRange();
                    a.selectNode(b);
                    c.evalScripts.bind(c).defer();
                    c = a.createContextualFragment(c.stripScripts())
                }
            }
            b.parentNode.replaceChild(c, b);
            return b
        },
        insert: function(c, e) {
            c = $(c);
            if (Object.isString(e) || Object.isNumber(e) || Object.isElement(e) || (e && (e.toElement || e.toHTML))) {
                e = {
                    bottom: e
                }
            }
            var d, f, b, g;
            for (var a in e) {
                d = e[a];
                a = a.toLowerCase();
                f = Element._insertionTranslations[a];
                if (d && d.toElement) {
                    d = d.toElement()
                }
                if (Object.isElement(d)) {
                    f(c, d);
                    continue
                }
                d = Object.toHTML(d);
                b = ((a == "before" || a == "after") ? c.parentNode : c).tagName.toUpperCase();
                g = Element._getContentFromAnonymousElement(b, d.stripScripts());
                if (a == "top" || a == "after") {
                    g.reverse()
                }
                g.each(f.curry(c));
                d.evalScripts.bind(d).defer()
            }
            return c
        },
        wrap: function(b, c, a) {
            b = $(b);
            if (Object.isElement(c)) {
                $(c).writeAttribute(a || {})
            } else {
                if (Object.isString(c)) {
                    c = new Element(c,a)
                } else {
                    c = new Element("div",c)
                }
            }
            if (b.parentNode) {
                b.parentNode.replaceChild(c, b)
            }
            c.appendChild(b);
            return c
        },
        inspect: function(b) {
            b = $(b);
            var a = "<" + b.tagName.toLowerCase();
            $H({
                id: "id",
                className: "class"
            }).each(function(f) {
                var e = f.first()
                  , c = f.last();
                var d = (b[e] || "").toString();
                if (d) {
                    a += " " + c + "=" + d.inspect(true)
                }
            });
            return a + ">"
        },
        recursivelyCollect: function(a, c) {
            a = $(a);
            var b = [];
            while (a = a[c]) {
                if (a.nodeType == 1) {
                    b.push(Element.extend(a))
                }
            }
            return b
        },
        ancestors: function(a) {
            return $(a).recursivelyCollect("parentNode")
        },
        descendants: function(a) {
            return $(a).select("*")
        },
        firstDescendant: function(a) {
            a = $(a).firstChild;
            while (a && a.nodeType != 1) {
                a = a.nextSibling
            }
            return $(a)
        },
        immediateDescendants: function(a) {
            if (!(a = $(a).firstChild)) {
                return []
            }
            while (a && a.nodeType != 1) {
                a = a.nextSibling
            }
            if (a) {
                return [a].concat($(a).nextSiblings())
            }
            return []
        },
        previousSiblings: function(a) {
            return $(a).recursivelyCollect("previousSibling")
        },
        nextSiblings: function(a) {
            return $(a).recursivelyCollect("nextSibling")
        },
        siblings: function(a) {
            a = $(a);
            return a.previousSiblings().reverse().concat(a.nextSiblings())
        },
        match: function(b, a) {
            if (Object.isString(a)) {
                a = new Selector(a)
            }
            return a.match($(b))
        },
        up: function(b, d, a) {
            b = $(b);
            if (arguments.length == 1) {
                return $(b.parentNode)
            }
            var c = b.ancestors();
            return Object.isNumber(d) ? c[d] : Selector.findElement(c, d, a)
        },
        down: function(b, c, a) {
            b = $(b);
            if (arguments.length == 1) {
                return b.firstDescendant()
            }
            return Object.isNumber(c) ? b.descendants()[c] : Element.select(b, c)[a || 0]
        },
        previous: function(b, d, a) {
            b = $(b);
            if (arguments.length == 1) {
                return $(Selector.handlers.previousElementSibling(b))
            }
            var c = b.previousSiblings();
            return Object.isNumber(d) ? c[d] : Selector.findElement(c, d, a)
        },
        next: function(c, d, b) {
            c = $(c);
            if (arguments.length == 1) {
                return $(Selector.handlers.nextElementSibling(c))
            }
            var a = c.nextSiblings();
            return Object.isNumber(d) ? a[d] : Selector.findElement(a, d, b)
        },
        select: function() {
            var a = $A(arguments)
              , b = $(a.shift());
            return Selector.findChildElements(b, a)
        },
        adjacent: function() {
            var a = $A(arguments)
              , b = $(a.shift());
            return Selector.findChildElements(b.parentNode, a).without(b)
        },
        identify: function(b) {
            b = $(b);
            var c = b.readAttribute("id")
              , a = arguments.callee;
            if (c) {
                return c
            }
            do {
                c = "anonymous_element_" + a.counter++
            } while ($(c));
            b.writeAttribute("id", c);
            return c
        },
        readAttribute: function(c, a) {
            c = $(c);
            if (Prototype.Browser.IE) {
                var b = Element._attributeTranslations.read;
                if (b.values[a]) {
                    return b.values[a](c, a)
                }
                if (b.names[a]) {
                    a = b.names[a]
                }
                if (a.include(":")) {
                    return (!c.attributes || !c.attributes[a]) ? null : c.attributes[a].value
                }
            }
            return c.getAttribute(a)
        },
        writeAttribute: function(e, c, f) {
            e = $(e);
            var b = {}
              , d = Element._attributeTranslations.write;
            if (typeof c == "object") {
                b = c
            } else {
                b[c] = Object.isUndefined(f) ? true : f
            }
            for (var a in b) {
                c = d.names[a] || a;
                f = b[a];
                if (d.values[a]) {
                    c = d.values[a](e, f)
                }
                if (f === false || f === null) {
                    e.removeAttribute(c)
                } else {
                    if (f === true) {
                        e.setAttribute(c, c)
                    } else {
                        e.setAttribute(c, f)
                    }
                }
            }
            return e
        },
        getHeight: function(a) {
            return $(a).getDimensions().height
        },
        getWidth: function(a) {
            return $(a).getDimensions().width
        },
        classNames: function(a) {
            return new Element.ClassNames(a)
        },
        hasClassName: function(a, b) {
            if (!(a = $(a))) {
                return
            }
            var c = a.className;
            return (c.length > 0 && (c == b || new RegExp("(^|\\s)" + b + "(\\s|$)").test(c)))
        },
        addClassName: function(a, b) {
            if (!(a = $(a))) {
                return
            }
            if (!a.hasClassName(b)) {
                a.className += (a.className ? " " : "") + b
            }
            return a
        },
        removeClassName: function(a, b) {
            if (!(a = $(a))) {
                return
            }
            a.className = a.className.replace(new RegExp("(^|\\s+)" + b + "(\\s+|$)"), " ").strip();
            return a
        },
        toggleClassName: function(a, b) {
            if (!(a = $(a))) {
                return
            }
            return a[a.hasClassName(b) ? "removeClassName" : "addClassName"](b)
        },
        cleanWhitespace: function(b) {
            b = $(b);
            var c = b.firstChild;
            while (c) {
                var a = c.nextSibling;
                if (c.nodeType == 3 && !/\S/.test(c.nodeValue)) {
                    b.removeChild(c)
                }
                c = a
            }
            return b
        },
        empty: function(a) {
            return $(a).innerHTML.blank()
        },
        descendantOf: function(b, a) {
            b = $(b),
            a = $(a);
            if (b.compareDocumentPosition) {
                return (b.compareDocumentPosition(a) & 8) === 8
            }
            if (a.contains) {
                return a.contains(b) && a !== b
            }
            while (b = b.parentNode) {
                if (b == a) {
                    return true
                }
            }
            return false
        },
        scrollTo: function(a) {
            a = $(a);
            var b = a.cumulativeOffset();
            window.scrollTo(b[0], b[1]);
            return a
        },
        getStyle: function(b, c) {
            b = $(b);
            c = c == "float" ? "cssFloat" : c.camelize();
            var d = b.style[c];
            if (!d || d == "auto") {
                var a = document.defaultView.getComputedStyle(b, null);
                d = a ? a[c] : null
            }
            if (c == "opacity") {
                return d ? parseFloat(d) : 1
            }
            return d == "auto" ? null : d
        },
        getOpacity: function(a) {
            return $(a).getStyle("opacity")
        },
        setStyle: function(b, c) {
            b = $(b);
            var e = b.style, a;
            if (Object.isString(c)) {
                b.style.cssText += ";" + c;
                return c.include("opacity") ? b.setOpacity(c.match(/opacity:\s*(\d?\.?\d*)/)[1]) : b
            }
            for (var d in c) {
                if (d == "opacity") {
                    b.setOpacity(c[d])
                } else {
                    e[(d == "float" || d == "cssFloat") ? (Object.isUndefined(e.styleFloat) ? "cssFloat" : "styleFloat") : d] = c[d]
                }
            }
            return b
        },
        setOpacity: function(a, b) {
            a = $(a);
            a.style.opacity = (b == 1 || b === "") ? "" : (b < 0.00001) ? 0 : b;
            return a
        },
        getDimensions: function(c) {
            c = $(c);
            var g = c.getStyle("display");
            if (g != "none" && g != null) {
                return {
                    width: c.offsetWidth,
                    height: c.offsetHeight
                }
            }
            var b = c.style;
            var f = b.visibility;
            var d = b.position;
            var a = b.display;
            b.visibility = "hidden";
            b.position = "absolute";
            b.display = "block";
            var h = c.clientWidth;
            var e = c.clientHeight;
            b.display = a;
            b.position = d;
            b.visibility = f;
            return {
                width: h,
                height: e
            }
        },
        makePositioned: function(a) {
            a = $(a);
            var b = Element.getStyle(a, "position");
            if (b == "static" || !b) {
                a._madePositioned = true;
                a.style.position = "relative";
                if (Prototype.Browser.Opera) {
                    a.style.top = 0;
                    a.style.left = 0
                }
            }
            return a
        },
        undoPositioned: function(a) {
            a = $(a);
            if (a._madePositioned) {
                a._madePositioned = undefined;
                a.style.position = a.style.top = a.style.left = a.style.bottom = a.style.right = ""
            }
            return a
        },
        makeClipping: function(a) {
            a = $(a);
            if (a._overflow) {
                return a
            }
            a._overflow = Element.getStyle(a, "overflow") || "auto";
            if (a._overflow !== "hidden") {
                a.style.overflow = "hidden"
            }
            return a
        },
        undoClipping: function(a) {
            a = $(a);
            if (!a._overflow) {
                return a
            }
            a.style.overflow = a._overflow == "auto" ? "" : a._overflow;
            a._overflow = null;
            return a
        },
        cumulativeOffset: function(b) {
            var a = 0
              , c = 0;
            do {
                a += b.offsetTop || 0;
                c += b.offsetLeft || 0;
                b = b.offsetParent
            } while (b);
            return Element._returnOffset(c, a)
        },
        positionedOffset: function(b) {
            var a = 0
              , d = 0;
            do {
                a += b.offsetTop || 0;
                d += b.offsetLeft || 0;
                b = b.offsetParent;
                if (b) {
                    if (b.tagName.toUpperCase() == "BODY") {
                        break
                    }
                    var c = Element.getStyle(b, "position");
                    if (c !== "static") {
                        break
                    }
                }
            } while (b);
            return Element._returnOffset(d, a)
        },
        absolutize: function(b) {
            b = $(b);
            if (b.getStyle("position") == "absolute") {
                return b
            }
            var d = b.positionedOffset();
            var f = d[1];
            var e = d[0];
            var c = b.clientWidth;
            var a = b.clientHeight;
            b._originalLeft = e - parseFloat(b.style.left || 0);
            b._originalTop = f - parseFloat(b.style.top || 0);
            b._originalWidth = b.style.width;
            b._originalHeight = b.style.height;
            b.style.position = "absolute";
            b.style.top = f + "px";
            b.style.left = e + "px";
            b.style.width = c + "px";
            b.style.height = a + "px";
            return b
        },
        relativize: function(a) {
            a = $(a);
            if (a.getStyle("position") == "relative") {
                return a
            }
            a.style.position = "relative";
            var c = parseFloat(a.style.top || 0) - (a._originalTop || 0);
            var b = parseFloat(a.style.left || 0) - (a._originalLeft || 0);
            a.style.top = c + "px";
            a.style.left = b + "px";
            a.style.height = a._originalHeight;
            a.style.width = a._originalWidth;
            return a
        },
        cumulativeScrollOffset: function(b) {
            var a = 0
              , c = 0;
            do {
                a += b.scrollTop || 0;
                c += b.scrollLeft || 0;
                b = b.parentNode
            } while (b);
            return Element._returnOffset(c, a)
        },
        getOffsetParent: function(a) {
            if (a.offsetParent) {
                return $(a.offsetParent)
            }
            if (a == document.body) {
                return $(a)
            }
            while ((a = a.parentNode) && a != document.body) {
                if (Element.getStyle(a, "position") != "static") {
                    return $(a)
                }
            }
            return $(document.body)
        },
        viewportOffset: function(d) {
            var a = 0
              , c = 0;
            var b = d;
            do {
                a += b.offsetTop || 0;
                c += b.offsetLeft || 0;
                if (b.offsetParent == document.body && Element.getStyle(b, "position") == "absolute") {
                    break
                }
            } while (b = b.offsetParent);
            b = d;
            do {
                if (!Prototype.Browser.Opera || (b.tagName && (b.tagName.toUpperCase() == "BODY"))) {
                    a -= b.scrollTop || 0;
                    c -= b.scrollLeft || 0
                }
            } while (b = b.parentNode);
            return Element._returnOffset(c, a)
        },
        clonePosition: function(b, d) {
            var a = Object.extend({
                setLeft: true,
                setTop: true,
                setWidth: true,
                setHeight: true,
                offsetTop: 0,
                offsetLeft: 0
            }, arguments[2] || {});
            d = $(d);
            var e = d.viewportOffset();
            b = $(b);
            var f = [0, 0];
            var c = null;
            if (Element.getStyle(b, "position") == "absolute") {
                c = b.getOffsetParent();
                f = c.viewportOffset()
            }
            if (c == document.body) {
                f[0] -= document.body.offsetLeft;
                f[1] -= document.body.offsetTop
            }
            if (a.setLeft) {
                b.style.left = (e[0] - f[0] + a.offsetLeft) + "px"
            }
            if (a.setTop) {
                b.style.top = (e[1] - f[1] + a.offsetTop) + "px"
            }
            if (a.setWidth) {
                b.style.width = d.offsetWidth + "px"
            }
            if (a.setHeight) {
                b.style.height = d.offsetHeight + "px"
            }
            return b
        }
    };
    Element.Methods.identify.counter = 1;
    Object.extend(Element.Methods, {
        getElementsBySelector: Element.Methods.select,
        childElements: Element.Methods.immediateDescendants
    });
    Element._attributeTranslations = {
        write: {
            names: {
                className: "class",
                htmlFor: "for"
            },
            values: {}
        }
    };
    if (Prototype.Browser.Opera) {
        Element.Methods.getStyle = Element.Methods.getStyle.wrap(function(d, b, c) {
            switch (c) {
            case "left":
            case "top":
            case "right":
            case "bottom":
                if (d(b, "position") === "static") {
                    return null
                }
            case "height":
            case "width":
                if (!Element.visible(b)) {
                    return null
                }
                var e = parseInt(d(b, c), 10);
                if (e !== b["offset" + c.capitalize()]) {
                    return e + "px"
                }
                var a;
                if (c === "height") {
                    a = ["border-top-width", "padding-top", "padding-bottom", "border-bottom-width"]
                } else {
                    a = ["border-left-width", "padding-left", "padding-right", "border-right-width"]
                }
                return a.inject(e, function(f, g) {
                    var h = d(b, g);
                    return h === null ? f : f - parseInt(h, 10)
                }) + "px";
            default:
                return d(b, c)
            }
        });
        Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(function(c, a, b) {
            if (b === "title") {
                return a.title
            }
            return c(a, b)
        })
    } else {
        if (Prototype.Browser.IE) {
            Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(function(c, b) {
                b = $(b);
                try {
                    b.offsetParent
                } catch (f) {
                    return $(document.body)
                }
                var a = b.getStyle("position");
                if (a !== "static") {
                    return c(b)
                }
                b.setStyle({
                    position: "relative"
                });
                var d = c(b);
                b.setStyle({
                    position: a
                });
                return d
            });
            $w("positionedOffset viewportOffset").each(function(a) {
                Element.Methods[a] = Element.Methods[a].wrap(function(f, c) {
                    c = $(c);
                    try {
                        c.offsetParent
                    } catch (h) {
                        return Element._returnOffset(0, 0)
                    }
                    var b = c.getStyle("position");
                    if (b !== "static") {
                        return f(c)
                    }
                    var d = c.getOffsetParent();
                    if (d && d.getStyle("position") === "fixed") {
                        d.setStyle({
                            zoom: 1
                        })
                    }
                    c.setStyle({
                        position: "relative"
                    });
                    var g = f(c);
                    c.setStyle({
                        position: b
                    });
                    return g
                })
            });
            Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(function(b, a) {
                try {
                    a.offsetParent
                } catch (c) {
                    return Element._returnOffset(0, 0)
                }
                return b(a)
            });
            Element.Methods.getStyle = function(a, b) {
                a = $(a);
                b = (b == "float" || b == "cssFloat") ? "styleFloat" : b.camelize();
                var c = a.style[b];
                if (!c && a.currentStyle) {
                    c = a.currentStyle[b]
                }
                if (b == "opacity") {
                    if (c = (a.getStyle("filter") || "").match(/alpha\(opacity=(.*)\)/)) {
                        if (c[1]) {
                            return parseFloat(c[1]) / 100
                        }
                    }
                    return 1
                }
                if (c == "auto") {
                    if ((b == "width" || b == "height") && (a.getStyle("display") != "none")) {
                        return a["offset" + b.capitalize()] + "px"
                    }
                    return null
                }
                return c
            }
            ;
            Element.Methods.setOpacity = function(b, e) {
                function f(g) {
                    return g.replace(/alpha\([^\)]*\)/gi, "")
                }
                b = $(b);
                var a = b.currentStyle;
                if ((a && !a.hasLayout) || (!a && b.style.zoom == "normal")) {
                    b.style.zoom = 1
                }
                var d = b.getStyle("filter")
                  , c = b.style;
                if (e == 1 || e === "") {
                    (d = f(d)) ? c.filter = d : c.removeAttribute("filter");
                    return b
                } else {
                    if (e < 0.00001) {
                        e = 0
                    }
                }
                c.filter = f(d) + "alpha(opacity=" + (e * 100) + ")";
                return b
            }
            ;
            Element._attributeTranslations = {
                read: {
                    names: {
                        "class": "className",
                        "for": "htmlFor"
                    },
                    values: {
                        _getAttr: function(a, b) {
                            return a.getAttribute(b, 2)
                        },
                        _getAttrNode: function(a, c) {
                            var b = a.getAttributeNode(c);
                            return b ? b.value : ""
                        },
                        _getEv: function(a, b) {
                            b = a.getAttribute(b);
                            return b ? b.toString().slice(23, -2) : null
                        },
                        _flag: function(a, b) {
                            return $(a).hasAttribute(b) ? b : null
                        },
                        style: function(a) {
                            return a.style.cssText.toLowerCase()
                        },
                        title: function(a) {
                            return a.title
                        }
                    }
                }
            };
            Element._attributeTranslations.write = {
                names: Object.extend({
                    cellpadding: "cellPadding",
                    cellspacing: "cellSpacing"
                }, Element._attributeTranslations.read.names),
                values: {
                    checked: function(a, b) {
                        a.checked = !!b
                    },
                    style: function(a, b) {
                        a.style.cssText = b ? b : ""
                    }
                }
            };
            Element._attributeTranslations.has = {};
            $w("colSpan rowSpan vAlign dateTime accessKey tabIndex encType maxLength readOnly longDesc frameBorder").each(function(a) {
                Element._attributeTranslations.write.names[a.toLowerCase()] = a;
                Element._attributeTranslations.has[a.toLowerCase()] = a
            });
            (function(a) {
                Object.extend(a, {
                    href: a._getAttr,
                    src: a._getAttr,
                    type: a._getAttr,
                    action: a._getAttrNode,
                    disabled: a._flag,
                    checked: a._flag,
                    readonly: a._flag,
                    multiple: a._flag,
                    onload: a._getEv,
                    onunload: a._getEv,
                    onclick: a._getEv,
                    ondblclick: a._getEv,
                    onmousedown: a._getEv,
                    onmouseup: a._getEv,
                    onmouseover: a._getEv,
                    onmousemove: a._getEv,
                    onmouseout: a._getEv,
                    onfocus: a._getEv,
                    onblur: a._getEv,
                    onkeypress: a._getEv,
                    onkeydown: a._getEv,
                    onkeyup: a._getEv,
                    onsubmit: a._getEv,
                    onreset: a._getEv,
                    onselect: a._getEv,
                    onchange: a._getEv
                })
            }
            )(Element._attributeTranslations.read.values)
        } else {
            if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
                Element.Methods.setOpacity = function(a, b) {
                    a = $(a);
                    a.style.opacity = (b == 1) ? 0.999999 : (b === "") ? "" : (b < 0.00001) ? 0 : b;
                    return a
                }
            } else {
                if (Prototype.Browser.WebKit) {
                    Element.Methods.setOpacity = function(a, b) {
                        a = $(a);
                        a.style.opacity = (b == 1 || b === "") ? "" : (b < 0.00001) ? 0 : b;
                        if (b == 1) {
                            if (a.tagName.toUpperCase() == "IMG" && a.width) {
                                a.width++;
                                a.width--
                            } else {
                                try {
                                    var d = document.createTextNode(" ");
                                    a.appendChild(d);
                                    a.removeChild(d)
                                } catch (c) {}
                            }
                        }
                        return a
                    }
                    ;
                    Element.Methods.cumulativeOffset = function(b) {
                        var a = 0
                          , c = 0;
                        do {
                            a += b.offsetTop || 0;
                            c += b.offsetLeft || 0;
                            if (b.offsetParent == document.body) {
                                if (Element.getStyle(b, "position") == "absolute") {
                                    break
                                }
                            }
                            b = b.offsetParent
                        } while (b);
                        return Element._returnOffset(c, a)
                    }
                }
            }
        }
    }
    if (Prototype.Browser.IE || Prototype.Browser.Opera) {
        Element.Methods.update = function(b, c) {
            b = $(b);
            if (c && c.toElement) {
                c = c.toElement()
            }
            if (Object.isElement(c)) {
                return b.update().insert(c)
            }
            c = Object.toHTML(c);
            var a = b.tagName.toUpperCase();
            if (a in Element._insertionTranslations.tags) {
                $A(b.childNodes).each(function(d) {
                    b.removeChild(d)
                });
                Element._getContentFromAnonymousElement(a, c.stripScripts()).each(function(d) {
                    b.appendChild(d)
                })
            } else {
                b.innerHTML = c.stripScripts()
            }
            c.evalScripts.bind(c).defer();
            return b
        }
    }
    if ("outerHTML"in document.createElement("div")) {
        Element.Methods.replace = function(c, e) {
            c = $(c);
            if (e && e.toElement) {
                e = e.toElement()
            }
            if (Object.isElement(e)) {
                c.parentNode.replaceChild(e, c);
                return c
            }
            e = Object.toHTML(e);
            var d = c.parentNode
              , b = d.tagName.toUpperCase();
            if (Element._insertionTranslations.tags[b]) {
                var f = c.next();
                var a = Element._getContentFromAnonymousElement(b, e.stripScripts());
                d.removeChild(c);
                if (f) {
                    a.each(function(g) {
                        d.insertBefore(g, f)
                    })
                } else {
                    a.each(function(g) {
                        d.appendChild(g)
                    })
                }
            } else {
                c.outerHTML = e.stripScripts()
            }
            e.evalScripts.bind(e).defer();
            return c
        }
    }
    Element._returnOffset = function(b, c) {
        var a = [b, c];
        a.left = b;
        a.top = c;
        return a
    }
    ;
    Element._getContentFromAnonymousElement = function(c, b) {
        var d = new Element("div")
          , a = Element._insertionTranslations.tags[c];
        if (a) {
            d.innerHTML = a[0] + b + a[1];
            a[2].times(function() {
                d = d.firstChild
            })
        } else {
            d.innerHTML = b
        }
        return $A(d.childNodes)
    }
    ;
    Element._insertionTranslations = {
        before: function(a, b) {
            a.parentNode.insertBefore(b, a)
        },
        top: function(a, b) {
            a.insertBefore(b, a.firstChild)
        },
        bottom: function(a, b) {
            a.appendChild(b)
        },
        after: function(a, b) {
            a.parentNode.insertBefore(b, a.nextSibling)
        },
        tags: {
            TABLE: ["<table>", "</table>", 1],
            TBODY: ["<table><tbody>", "</tbody></table>", 2],
            TR: ["<table><tbody><tr>", "</tr></tbody></table>", 3],
            TD: ["<table><tbody><tr><td>", "</td></tr></tbody></table>", 4],
            SELECT: ["<select>", "</select>", 1]
        }
    };
    (function() {
        Object.extend(this.tags, {
            THEAD: this.tags.TBODY,
            TFOOT: this.tags.TBODY,
            TH: this.tags.TD
        })
    }
    ).call(Element._insertionTranslations);
    Element.Methods.Simulated = {
        hasAttribute: function(a, c) {
            c = Element._attributeTranslations.has[c] || c;
            var b = $(a).getAttributeNode(c);
            return !!(b && b.specified)
        }
    };
    Element.Methods.ByTag = {};
    Object.extend(Element, Element.Methods);
    if (!Prototype.BrowserFeatures.ElementExtensions && document.createElement("div")["__proto__"]) {
        window.HTMLElement = {};
        window.HTMLElement.prototype = document.createElement("div")["__proto__"];
        Prototype.BrowserFeatures.ElementExtensions = true
    }
    Element.extend = (function() {
        if (Prototype.BrowserFeatures.SpecificElementExtensions) {
            return Prototype.K
        }
        var a = {}
          , b = Element.Methods.ByTag;
        var c = Object.extend(function(f) {
            if (!f || f._extendedByPrototype || f.nodeType != 1 || f == window) {
                return f
            }
            var d = Object.clone(a), e = f.tagName.toUpperCase(), h, g;
            if (b[e]) {
                Object.extend(d, b[e])
            }
            for (h in d) {
                g = d[h];
                if (Object.isFunction(g) && !(h in f)) {
                    f[h] = g.methodize()
                }
            }
            f._extendedByPrototype = Prototype.emptyFunction;
            return f
        }, {
            refresh: function() {
                if (!Prototype.BrowserFeatures.ElementExtensions) {
                    Object.extend(a, Element.Methods);
                    Object.extend(a, Element.Methods.Simulated)
                }
            }
        });
        c.refresh();
        return c
    }
    )();
    Element.hasAttribute = function(a, b) {
        if (a.hasAttribute) {
            return a.hasAttribute(b)
        }
        return Element.Methods.Simulated.hasAttribute(a, b)
    }
    ;
    Element.addMethods = function(c) {
        var h = Prototype.BrowserFeatures
          , d = Element.Methods.ByTag;
        if (!c) {
            Object.extend(Form, Form.Methods);
            Object.extend(Form.Element, Form.Element.Methods);
            Object.extend(Element.Methods.ByTag, {
                FORM: Object.clone(Form.Methods),
                INPUT: Object.clone(Form.Element.Methods),
                SELECT: Object.clone(Form.Element.Methods),
                TEXTAREA: Object.clone(Form.Element.Methods)
            })
        }
        if (arguments.length == 2) {
            var b = c;
            c = arguments[1]
        }
        if (!b) {
            Object.extend(Element.Methods, c || {})
        } else {
            if (Object.isArray(b)) {
                b.each(g)
            } else {
                g(b)
            }
        }
        function g(j) {
            j = j.toUpperCase();
            if (!Element.Methods.ByTag[j]) {
                Element.Methods.ByTag[j] = {}
            }
            Object.extend(Element.Methods.ByTag[j], c)
        }
        function a(l, k, j) {
            j = j || false;
            for (var n in l) {
                var m = l[n];
                if (!Object.isFunction(m)) {
                    continue
                }
                if (!j || !(n in k)) {
                    k[n] = m.methodize()
                }
            }
        }
        function e(l) {
            var j;
            var k = {
                OPTGROUP: "OptGroup",
                TEXTAREA: "TextArea",
                P: "Paragraph",
                FIELDSET: "FieldSet",
                UL: "UList",
                OL: "OList",
                DL: "DList",
                DIR: "Directory",
                H1: "Heading",
                H2: "Heading",
                H3: "Heading",
                H4: "Heading",
                H5: "Heading",
                H6: "Heading",
                Q: "Quote",
                INS: "Mod",
                DEL: "Mod",
                A: "Anchor",
                IMG: "Image",
                CAPTION: "TableCaption",
                COL: "TableCol",
                COLGROUP: "TableCol",
                THEAD: "TableSection",
                TFOOT: "TableSection",
                TBODY: "TableSection",
                TR: "TableRow",
                TH: "TableCell",
                TD: "TableCell",
                FRAMESET: "FrameSet",
                IFRAME: "IFrame"
            };
            if (k[l]) {
                j = "HTML" + k[l] + "Element"
            }
            if (window[j]) {
                return window[j]
            }
            j = "HTML" + l + "Element";
            if (window[j]) {
                return window[j]
            }
            j = "HTML" + l.capitalize() + "Element";
            if (window[j]) {
                return window[j]
            }
            window[j] = {};
            window[j].prototype = document.createElement(l)["__proto__"];
            return window[j]
        }
        if (h.ElementExtensions) {
            a(Element.Methods, HTMLElement.prototype);
            a(Element.Methods.Simulated, HTMLElement.prototype, true)
        }
        if (h.SpecificElementExtensions) {
            for (var i in Element.Methods.ByTag) {
                var f = e(i);
                if (Object.isUndefined(f)) {
                    continue
                }
                a(d[i], f.prototype)
            }
        }
        Object.extend(Element, Element.Methods);
        delete Element.ByTag;
        if (Element.extend.refresh) {
            Element.extend.refresh()
        }
        Element.cache = {}
    }
    ;
    document.viewport = {
        getDimensions: function() {
            var a = {}
              , b = Prototype.Browser;
            $w("width height").each(function(e) {
                var c = e.capitalize();
                if (b.WebKit && !document.evaluate) {
                    a[e] = self["inner" + c]
                } else {
                    if (b.Opera && parseFloat(window.opera.version()) < 9.5) {
                        a[e] = document.body["client" + c]
                    } else {
                        a[e] = document.documentElement["client" + c]
                    }
                }
            });
            return a
        },
        getWidth: function() {
            return this.getDimensions().width
        },
        getHeight: function() {
            return this.getDimensions().height
        },
        getScrollOffsets: function() {
            return Element._returnOffset(window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop)
        }
    };
    var Selector = Class.create({
        initialize: function(a) {
            this.expression = a.strip();
            if (this.shouldUseSelectorsAPI()) {
                this.mode = "selectorsAPI"
            } else {
                if (this.shouldUseXPath()) {
                    this.mode = "xpath";
                    this.compileXPathMatcher()
                } else {
                    this.mode = "normal";
                    this.compileMatcher()
                }
            }
        },
        shouldUseXPath: function() {
            if (!Prototype.BrowserFeatures.XPath) {
                return false
            }
            var a = this.expression;
            if (Prototype.Browser.WebKit && (a.include("-of-type") || a.include(":empty"))) {
                return false
            }
            if ((/(\[[\w-]*?:|:checked)/).test(a)) {
                return false
            }
            return true
        },
        shouldUseSelectorsAPI: function() {
            if (!Prototype.BrowserFeatures.SelectorsAPI) {
                return false
            }
            if (!Selector._div) {
                Selector._div = new Element("div")
            }
            try {
                Selector._div.querySelector(this.expression)
            } catch (a) {
                return false
            }
            return true
        },
        compileMatcher: function() {
            var e = this.expression, ps = Selector.patterns, h = Selector.handlers, c = Selector.criteria, le, p, m;
            if (Selector._cache[e]) {
                this.matcher = Selector._cache[e];
                return
            }
            this.matcher = ["this.matcher = function(root) {", "var r = root, h = Selector.handlers, c = false, n;"];
            while (e && le != e && (/\S/).test(e)) {
                le = e;
                for (var i in ps) {
                    p = ps[i];
                    if (m = e.match(p)) {
                        this.matcher.push(Object.isFunction(c[i]) ? c[i](m) : new Template(c[i]).evaluate(m));
                        e = e.replace(m[0], "");
                        break
                    }
                }
            }
            this.matcher.push("return h.unique(n);\n}");
            eval(this.matcher.join("\n"));
            Selector._cache[this.expression] = this.matcher
        },
        compileXPathMatcher: function() {
            var f = this.expression, g = Selector.patterns, b = Selector.xpath, d, a;
            if (Selector._cache[f]) {
                this.xpath = Selector._cache[f];
                return
            }
            this.matcher = [".//*"];
            while (f && d != f && (/\S/).test(f)) {
                d = f;
                for (var c in g) {
                    if (a = f.match(g[c])) {
                        this.matcher.push(Object.isFunction(b[c]) ? b[c](a) : new Template(b[c]).evaluate(a));
                        f = f.replace(a[0], "");
                        break
                    }
                }
            }
            this.xpath = this.matcher.join("");
            Selector._cache[this.expression] = this.xpath
        },
        findElements: function(a) {
            a = a || document;
            var c = this.expression, b;
            switch (this.mode) {
            case "selectorsAPI":
                if (a !== document) {
                    var d = a.id
                      , f = $(a).identify();
                    c = "#" + f + " " + c
                }
                b = $A(a.querySelectorAll(c)).map(Element.extend);
                a.id = d;
                return b;
            case "xpath":
                return document._getElementsByXPath(this.xpath, a);
            default:
                return this.matcher(a)
            }
        },
        match: function(j) {
            this.tokens = [];
            var o = this.expression
              , a = Selector.patterns
              , f = Selector.assertions;
            var b, d, g;
            while (o && b !== o && (/\S/).test(o)) {
                b = o;
                for (var k in a) {
                    d = a[k];
                    if (g = o.match(d)) {
                        if (f[k]) {
                            this.tokens.push([k, Object.clone(g)]);
                            o = o.replace(g[0], "")
                        } else {
                            return this.findElements(document).include(j)
                        }
                    }
                }
            }
            var n = true, c, l;
            for (var k = 0, h; h = this.tokens[k]; k++) {
                c = h[0],
                l = h[1];
                if (!Selector.assertions[c](j, l)) {
                    n = false;
                    break
                }
            }
            return n
        },
        toString: function() {
            return this.expression
        },
        inspect: function() {
            return "#<Selector:" + this.expression.inspect() + ">"
        }
    });
    Object.extend(Selector, {
        _cache: {},
        xpath: {
            descendant: "//*",
            child: "/*",
            adjacent: "/following-sibling::*[1]",
            laterSibling: "/following-sibling::*",
            tagName: function(a) {
                if (a[1] == "*") {
                    return ""
                }
                return "[local-name()='" + a[1].toLowerCase() + "' or local-name()='" + a[1].toUpperCase() + "']"
            },
            className: "[contains(concat(' ', @class, ' '), ' #{1} ')]",
            id: "[@id='#{1}']",
            attrPresence: function(a) {
                a[1] = a[1].toLowerCase();
                return new Template("[@#{1}]").evaluate(a)
            },
            attr: function(a) {
                a[1] = a[1].toLowerCase();
                a[3] = a[5] || a[6];
                return new Template(Selector.xpath.operators[a[2]]).evaluate(a)
            },
            pseudo: function(a) {
                var b = Selector.xpath.pseudos[a[1]];
                if (!b) {
                    return ""
                }
                if (Object.isFunction(b)) {
                    return b(a)
                }
                return new Template(Selector.xpath.pseudos[a[1]]).evaluate(a)
            },
            operators: {
                "=": "[@#{1}='#{3}']",
                "!=": "[@#{1}!='#{3}']",
                "^=": "[starts-with(@#{1}, '#{3}')]",
                "$=": "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
                "*=": "[contains(@#{1}, '#{3}')]",
                "~=": "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
                "|=": "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
            },
            pseudos: {
                "first-child": "[not(preceding-sibling::*)]",
                "last-child": "[not(following-sibling::*)]",
                "only-child": "[not(preceding-sibling::* or following-sibling::*)]",
                empty: "[count(*) = 0 and (count(text()) = 0)]",
                checked: "[@checked]",
                disabled: "[(@disabled) and (@type!='hidden')]",
                enabled: "[not(@disabled) and (@type!='hidden')]",
                not: function(b) {
                    var j = b[6], h = Selector.patterns, a = Selector.xpath, f, c;
                    var g = [];
                    while (j && f != j && (/\S/).test(j)) {
                        f = j;
                        for (var d in h) {
                            if (b = j.match(h[d])) {
                                c = Object.isFunction(a[d]) ? a[d](b) : new Template(a[d]).evaluate(b);
                                g.push("(" + c.substring(1, c.length - 1) + ")");
                                j = j.replace(b[0], "");
                                break
                            }
                        }
                    }
                    return "[not(" + g.join(" and ") + ")]"
                },
                "nth-child": function(a) {
                    return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", a)
                },
                "nth-last-child": function(a) {
                    return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", a)
                },
                "nth-of-type": function(a) {
                    return Selector.xpath.pseudos.nth("position() ", a)
                },
                "nth-last-of-type": function(a) {
                    return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", a)
                },
                "first-of-type": function(a) {
                    a[6] = "1";
                    return Selector.xpath.pseudos["nth-of-type"](a)
                },
                "last-of-type": function(a) {
                    a[6] = "1";
                    return Selector.xpath.pseudos["nth-last-of-type"](a)
                },
                "only-of-type": function(a) {
                    var b = Selector.xpath.pseudos;
                    return b["first-of-type"](a) + b["last-of-type"](a)
                },
                nth: function(g, e) {
                    var h, i = e[6], d;
                    if (i == "even") {
                        i = "2n+0"
                    }
                    if (i == "odd") {
                        i = "2n+1"
                    }
                    if (h = i.match(/^(\d+)$/)) {
                        return "[" + g + "= " + h[1] + "]"
                    }
                    if (h = i.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
                        if (h[1] == "-") {
                            h[1] = -1
                        }
                        var f = h[1] ? Number(h[1]) : 1;
                        var c = h[2] ? Number(h[2]) : 0;
                        d = "[((#{fragment} - #{b}) mod #{a} = 0) and ((#{fragment} - #{b}) div #{a} >= 0)]";
                        return new Template(d).evaluate({
                            fragment: g,
                            a: f,
                            b: c
                        })
                    }
                }
            }
        },
        criteria: {
            tagName: 'n = h.tagName(n, r, "#{1}", c);      c = false;',
            className: 'n = h.className(n, r, "#{1}", c);    c = false;',
            id: 'n = h.id(n, r, "#{1}", c);           c = false;',
            attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
            attr: function(a) {
                a[3] = (a[5] || a[6]);
                return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(a)
            },
            pseudo: function(a) {
                if (a[6]) {
                    a[6] = a[6].replace(/"/g, '\\"')
                }
                return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(a)
            },
            descendant: 'c = "descendant";',
            child: 'c = "child";',
            adjacent: 'c = "adjacent";',
            laterSibling: 'c = "laterSibling";'
        },
        patterns: {
            laterSibling: /^\s*~\s*/,
            child: /^\s*>\s*/,
            adjacent: /^\s*\+\s*/,
            descendant: /^\s/,
            tagName: /^\s*(\*|[\w\-]+)(\b|$)?/,
            id: /^#([\w\-\*]+)(\b|$)/,
            className: /^\.([\w\-\*]+)(\b|$)/,
            pseudo: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
            attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
            attr: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
        },
        assertions: {
            tagName: function(a, b) {
                return b[1].toUpperCase() == a.tagName.toUpperCase()
            },
            className: function(a, b) {
                return Element.hasClassName(a, b[1])
            },
            id: function(a, b) {
                return a.id === b[1]
            },
            attrPresence: function(a, b) {
                return Element.hasAttribute(a, b[1])
            },
            attr: function(b, c) {
                var a = Element.readAttribute(b, c[1]);
                return a && Selector.operators[c[2]](a, c[5] || c[6])
            }
        },
        handlers: {
            concat: function(d, c) {
                for (var e = 0, f; f = c[e]; e++) {
                    d.push(f)
                }
                return d
            },
            mark: function(a) {
                var d = Prototype.emptyFunction;
                for (var b = 0, c; c = a[b]; b++) {
                    c._countedByPrototype = d
                }
                return a
            },
            unmark: function(a) {
                for (var b = 0, c; c = a[b]; b++) {
                    c._countedByPrototype = undefined
                }
                return a
            },
            index: function(a, d, g) {
                a._countedByPrototype = Prototype.emptyFunction;
                if (d) {
                    for (var b = a.childNodes, e = b.length - 1, c = 1; e >= 0; e--) {
                        var f = b[e];
                        if (f.nodeType == 1 && (!g || f._countedByPrototype)) {
                            f.nodeIndex = c++
                        }
                    }
                } else {
                    for (var e = 0, c = 1, b = a.childNodes; f = b[e]; e++) {
                        if (f.nodeType == 1 && (!g || f._countedByPrototype)) {
                            f.nodeIndex = c++
                        }
                    }
                }
            },
            unique: function(b) {
                if (b.length == 0) {
                    return b
                }
                var d = [], e;
                for (var c = 0, a = b.length; c < a; c++) {
                    if (!(e = b[c])._countedByPrototype) {
                        e._countedByPrototype = Prototype.emptyFunction;
                        d.push(Element.extend(e))
                    }
                }
                return Selector.handlers.unmark(d)
            },
            descendant: function(a) {
                var d = Selector.handlers;
                for (var c = 0, b = [], e; e = a[c]; c++) {
                    d.concat(b, e.getElementsByTagName("*"))
                }
                return b
            },
            child: function(a) {
                var e = Selector.handlers;
                for (var d = 0, c = [], f; f = a[d]; d++) {
                    for (var b = 0, g; g = f.childNodes[b]; b++) {
                        if (g.nodeType == 1 && g.tagName != "!") {
                            c.push(g)
                        }
                    }
                }
                return c
            },
            adjacent: function(a) {
                for (var c = 0, b = [], e; e = a[c]; c++) {
                    var d = this.nextElementSibling(e);
                    if (d) {
                        b.push(d)
                    }
                }
                return b
            },
            laterSibling: function(a) {
                var d = Selector.handlers;
                for (var c = 0, b = [], e; e = a[c]; c++) {
                    d.concat(b, Element.nextSiblings(e))
                }
                return b
            },
            nextElementSibling: function(a) {
                while (a = a.nextSibling) {
                    if (a.nodeType == 1) {
                        return a
                    }
                }
                return null
            },
            previousElementSibling: function(a) {
                while (a = a.previousSibling) {
                    if (a.nodeType == 1) {
                        return a
                    }
                }
                return null
            },
            tagName: function(a, j, c, b) {
                var k = c.toUpperCase();
                var e = []
                  , g = Selector.handlers;
                if (a) {
                    if (b) {
                        if (b == "descendant") {
                            for (var f = 0, d; d = a[f]; f++) {
                                g.concat(e, d.getElementsByTagName(c))
                            }
                            return e
                        } else {
                            a = this[b](a)
                        }
                        if (c == "*") {
                            return a
                        }
                    }
                    for (var f = 0, d; d = a[f]; f++) {
                        if (d.tagName.toUpperCase() === k) {
                            e.push(d)
                        }
                    }
                    return e
                } else {
                    return j.getElementsByTagName(c)
                }
            },
            id: function(b, a, j, f) {
                var g = $(j)
                  , d = Selector.handlers;
                if (!g) {
                    return []
                }
                if (!b && a == document) {
                    return [g]
                }
                if (b) {
                    if (f) {
                        if (f == "child") {
                            for (var c = 0, e; e = b[c]; c++) {
                                if (g.parentNode == e) {
                                    return [g]
                                }
                            }
                        } else {
                            if (f == "descendant") {
                                for (var c = 0, e; e = b[c]; c++) {
                                    if (Element.descendantOf(g, e)) {
                                        return [g]
                                    }
                                }
                            } else {
                                if (f == "adjacent") {
                                    for (var c = 0, e; e = b[c]; c++) {
                                        if (Selector.handlers.previousElementSibling(g) == e) {
                                            return [g]
                                        }
                                    }
                                } else {
                                    b = d[f](b)
                                }
                            }
                        }
                    }
                    for (var c = 0, e; e = b[c]; c++) {
                        if (e == g) {
                            return [g]
                        }
                    }
                    return []
                }
                return (g && Element.descendantOf(g, a)) ? [g] : []
            },
            className: function(b, a, c, d) {
                if (b && d) {
                    b = this[d](b)
                }
                return Selector.handlers.byClassName(b, a, c)
            },
            byClassName: function(c, b, f) {
                if (!c) {
                    c = Selector.handlers.descendant([b])
                }
                var h = " " + f + " ";
                for (var e = 0, d = [], g, a; g = c[e]; e++) {
                    a = g.className;
                    if (a.length == 0) {
                        continue
                    }
                    if (a == f || (" " + a + " ").include(h)) {
                        d.push(g)
                    }
                }
                return d
            },
            attrPresence: function(c, b, a, g) {
                if (!c) {
                    c = b.getElementsByTagName("*")
                }
                if (c && g) {
                    c = this[g](c)
                }
                var e = [];
                for (var d = 0, f; f = c[d]; d++) {
                    if (Element.hasAttribute(f, a)) {
                        e.push(f)
                    }
                }
                return e
            },
            attr: function(a, j, h, k, c, b) {
                if (!a) {
                    a = j.getElementsByTagName("*")
                }
                if (a && b) {
                    a = this[b](a)
                }
                var l = Selector.operators[c]
                  , f = [];
                for (var e = 0, d; d = a[e]; e++) {
                    var g = Element.readAttribute(d, h);
                    if (g === null) {
                        continue
                    }
                    if (l(g, k)) {
                        f.push(d)
                    }
                }
                return f
            },
            pseudo: function(b, c, e, a, d) {
                if (b && d) {
                    b = this[d](b)
                }
                if (!b) {
                    b = a.getElementsByTagName("*")
                }
                return Selector.pseudos[c](b, e, a)
            }
        },
        pseudos: {
            "first-child": function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (Selector.handlers.previousElementSibling(e)) {
                        continue
                    }
                    c.push(e)
                }
                return c
            },
            "last-child": function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (Selector.handlers.nextElementSibling(e)) {
                        continue
                    }
                    c.push(e)
                }
                return c
            },
            "only-child": function(b, g, a) {
                var e = Selector.handlers;
                for (var d = 0, c = [], f; f = b[d]; d++) {
                    if (!e.previousElementSibling(f) && !e.nextElementSibling(f)) {
                        c.push(f)
                    }
                }
                return c
            },
            "nth-child": function(b, c, a) {
                return Selector.pseudos.nth(b, c, a)
            },
            "nth-last-child": function(b, c, a) {
                return Selector.pseudos.nth(b, c, a, true)
            },
            "nth-of-type": function(b, c, a) {
                return Selector.pseudos.nth(b, c, a, false, true)
            },
            "nth-last-of-type": function(b, c, a) {
                return Selector.pseudos.nth(b, c, a, true, true)
            },
            "first-of-type": function(b, c, a) {
                return Selector.pseudos.nth(b, "1", a, false, true)
            },
            "last-of-type": function(b, c, a) {
                return Selector.pseudos.nth(b, "1", a, true, true)
            },
            "only-of-type": function(b, d, a) {
                var c = Selector.pseudos;
                return c["last-of-type"](c["first-of-type"](b, d, a), d, a)
            },
            getIndices: function(d, c, e) {
                if (d == 0) {
                    return c > 0 ? [c] : []
                }
                return $R(1, e).inject([], function(a, b) {
                    if (0 == (b - c) % d && (b - c) / d >= 0) {
                        a.push(b)
                    }
                    return a
                })
            },
            nth: function(c, s, u, r, e) {
                if (c.length == 0) {
                    return []
                }
                if (s == "even") {
                    s = "2n+0"
                }
                if (s == "odd") {
                    s = "2n+1"
                }
                var q = Selector.handlers, p = [], d = [], g;
                q.mark(c);
                for (var o = 0, f; f = c[o]; o++) {
                    if (!f.parentNode._countedByPrototype) {
                        q.index(f.parentNode, r, e);
                        d.push(f.parentNode)
                    }
                }
                if (s.match(/^\d+$/)) {
                    s = Number(s);
                    for (var o = 0, f; f = c[o]; o++) {
                        if (f.nodeIndex == s) {
                            p.push(f)
                        }
                    }
                } else {
                    if (g = s.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
                        if (g[1] == "-") {
                            g[1] = -1
                        }
                        var v = g[1] ? Number(g[1]) : 1;
                        var t = g[2] ? Number(g[2]) : 0;
                        var w = Selector.pseudos.getIndices(v, t, c.length);
                        for (var o = 0, f, k = w.length; f = c[o]; o++) {
                            for (var n = 0; n < k; n++) {
                                if (f.nodeIndex == w[n]) {
                                    p.push(f)
                                }
                            }
                        }
                    }
                }
                q.unmark(c);
                q.unmark(d);
                return p
            },
            empty: function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (e.tagName == "!" || e.firstChild) {
                        continue
                    }
                    c.push(e)
                }
                return c
            },
            not: function(a, d, k) {
                var g = Selector.handlers, l, c;
                var j = new Selector(d).findElements(k);
                g.mark(j);
                for (var f = 0, e = [], b; b = a[f]; f++) {
                    if (!b._countedByPrototype) {
                        e.push(b)
                    }
                }
                g.unmark(j);
                return e
            },
            enabled: function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (!e.disabled && (!e.type || e.type !== "hidden")) {
                        c.push(e)
                    }
                }
                return c
            },
            disabled: function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (e.disabled) {
                        c.push(e)
                    }
                }
                return c
            },
            checked: function(b, f, a) {
                for (var d = 0, c = [], e; e = b[d]; d++) {
                    if (e.checked) {
                        c.push(e)
                    }
                }
                return c
            }
        },
        operators: {
            "=": function(b, a) {
                return b == a
            },
            "!=": function(b, a) {
                return b != a
            },
            "^=": function(b, a) {
                return b == a || b && b.startsWith(a)
            },
            "$=": function(b, a) {
                return b == a || b && b.endsWith(a)
            },
            "*=": function(b, a) {
                return b == a || b && b.include(a)
            },
            "$=": function(b, a) {
                return b.endsWith(a)
            },
            "*=": function(b, a) {
                return b.include(a)
            },
            "~=": function(b, a) {
                return (" " + b + " ").include(" " + a + " ")
            },
            "|=": function(b, a) {
                return ("-" + (b || "").toUpperCase() + "-").include("-" + (a || "").toUpperCase() + "-")
            }
        },
        split: function(b) {
            var a = [];
            b.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(c) {
                a.push(c[1].strip())
            });
            return a
        },
        matchElements: function(f, g) {
            var e = $$(g)
              , d = Selector.handlers;
            d.mark(e);
            for (var c = 0, b = [], a; a = f[c]; c++) {
                if (a._countedByPrototype) {
                    b.push(a)
                }
            }
            d.unmark(e);
            return b
        },
        findElement: function(b, c, a) {
            if (Object.isNumber(c)) {
                a = c;
                c = false
            }
            return Selector.matchElements(b, c || "*")[a || 0]
        },
        findChildElements: function(e, g) {
            g = Selector.split(g.join(","));
            var d = []
              , f = Selector.handlers;
            for (var c = 0, b = g.length, a; c < b; c++) {
                a = new Selector(g[c].strip());
                f.concat(d, a.findElements(e))
            }
            return (b > 1) ? f.unique(d) : d
        }
    });
    if (Prototype.Browser.IE) {
        Object.extend(Selector.handlers, {
            concat: function(d, c) {
                for (var e = 0, f; f = c[e]; e++) {
                    if (f.tagName !== "!") {
                        d.push(f)
                    }
                }
                return d
            },
            unmark: function(a) {
                for (var b = 0, c; c = a[b]; b++) {
                    c.removeAttribute("_countedByPrototype")
                }
                return a
            }
        })
    }
    function $$() {
        return Selector.findChildElements(document, $A(arguments))
    }
    var Form = {
        reset: function(a) {
            $(a).reset();
            return a
        },
        serializeElements: function(g, b) {
            if (typeof b != "object") {
                b = {
                    hash: !!b
                }
            } else {
                if (Object.isUndefined(b.hash)) {
                    b.hash = true
                }
            }
            var c, f, a = false, e = b.submit;
            var d = g.inject({}, function(h, i) {
                if (!i.disabled && i.name) {
                    c = i.name;
                    f = $(i).getValue();
                    if (f != null && i.type != "file" && (i.type != "submit" || (!a && e !== false && (!e || c == e) && (a = true)))) {
                        if (c in h) {
                            if (!Object.isArray(h[c])) {
                                h[c] = [h[c]]
                            }
                            h[c].push(f)
                        } else {
                            h[c] = f
                        }
                    }
                }
                return h
            });
            return b.hash ? d : Object.toQueryString(d)
        }
    };
    Form.Methods = {
        serialize: function(b, a) {
            return Form.serializeElements(Form.getElements(b), a)
        },
        getElements: function(a) {
            return $A($(a).getElementsByTagName("*")).inject([], function(b, c) {
                if (Form.Element.Serializers[c.tagName.toLowerCase()]) {
                    b.push(Element.extend(c))
                }
                return b
            })
        },
        getInputs: function(g, c, d) {
            g = $(g);
            var a = g.getElementsByTagName("input");
            if (!c && !d) {
                return $A(a).map(Element.extend)
            }
            for (var e = 0, h = [], f = a.length; e < f; e++) {
                var b = a[e];
                if ((c && b.type != c) || (d && b.name != d)) {
                    continue
                }
                h.push(Element.extend(b))
            }
            return h
        },
        disable: function(a) {
            a = $(a);
            Form.getElements(a).invoke("disable");
            return a
        },
        enable: function(a) {
            a = $(a);
            Form.getElements(a).invoke("enable");
            return a
        },
        findFirstElement: function(b) {
            var c = $(b).getElements().findAll(function(d) {
                return "hidden" != d.type && !d.disabled
            });
            var a = c.findAll(function(d) {
                return d.hasAttribute("tabIndex") && d.tabIndex >= 0
            }).sortBy(function(d) {
                return d.tabIndex
            }).first();
            return a ? a : c.find(function(d) {
                return ["input", "select", "textarea"].include(d.tagName.toLowerCase())
            })
        },
        focusFirstElement: function(a) {
            a = $(a);
            a.findFirstElement().activate();
            return a
        },
        request: function(b, a) {
            b = $(b),
            a = Object.clone(a || {});
            var d = a.parameters
              , c = b.readAttribute("action") || "";
            if (c.blank()) {
                c = window.location.href
            }
            a.parameters = b.serialize(true);
            if (d) {
                if (Object.isString(d)) {
                    d = d.toQueryParams()
                }
                Object.extend(a.parameters, d)
            }
            if (b.hasAttribute("method") && !a.method) {
                a.method = b.method
            }
            return new Ajax.Request(c,a)
        }
    };
    Form.Element = {
        focus: function(a) {
            $(a).focus();
            return a
        },
        select: function(a) {
            $(a).select();
            return a
        }
    };
    Form.Element.Methods = {
        serialize: function(a) {
            a = $(a);
            if (!a.disabled && a.name) {
                var b = a.getValue();
                if (b != undefined) {
                    var c = {};
                    c[a.name] = b;
                    return Object.toQueryString(c)
                }
            }
            return ""
        },
        getValue: function(a) {
            a = $(a);
            var b = a.tagName.toLowerCase();
            return Form.Element.Serializers[b](a)
        },
        setValue: function(a, b) {
            a = $(a);
            var c = a.tagName.toLowerCase();
            Form.Element.Serializers[c](a, b);
            return a
        },
        clear: function(a) {
            $(a).value = "";
            return a
        },
        present: function(a) {
            return $(a).value != ""
        },
        activate: function(a) {
            a = $(a);
            try {
                a.focus();
                if (a.select && (a.tagName.toLowerCase() != "input" || !["button", "reset", "submit"].include(a.type))) {
                    a.select()
                }
            } catch (b) {}
            return a
        },
        disable: function(a) {
            a = $(a);
            a.disabled = true;
            return a
        },
        enable: function(a) {
            a = $(a);
            a.disabled = false;
            return a
        }
    };
    var Field = Form.Element;
    var $F = Form.Element.Methods.getValue;
    Form.Element.Serializers = {
        input: function(a, b) {
            switch (a.type.toLowerCase()) {
            case "checkbox":
            case "radio":
                return Form.Element.Serializers.inputSelector(a, b);
            default:
                return Form.Element.Serializers.textarea(a, b)
            }
        },
        inputSelector: function(a, b) {
            if (Object.isUndefined(b)) {
                return a.checked ? a.value : null
            } else {
                a.checked = !!b
            }
        },
        textarea: function(a, b) {
            if (Object.isUndefined(b)) {
                return a.value
            } else {
                a.value = b
            }
        },
        select: function(c, f) {
            if (Object.isUndefined(f)) {
                return this[c.type == "select-one" ? "selectOne" : "selectMany"](c)
            } else {
                var b, d, g = !Object.isArray(f);
                for (var a = 0, e = c.length; a < e; a++) {
                    b = c.options[a];
                    d = this.optionValue(b);
                    if (g) {
                        if (d == f) {
                            b.selected = true;
                            return
                        }
                    } else {
                        b.selected = f.include(d)
                    }
                }
            }
        },
        selectOne: function(b) {
            var a = b.selectedIndex;
            return a >= 0 ? this.optionValue(b.options[a]) : null
        },
        selectMany: function(d) {
            var a, e = d.length;
            if (!e) {
                return null
            }
            for (var c = 0, a = []; c < e; c++) {
                var b = d.options[c];
                if (b.selected) {
                    a.push(this.optionValue(b))
                }
            }
            return a
        },
        optionValue: function(a) {
            return Element.extend(a).hasAttribute("value") ? a.value : a.text
        }
    };
    Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
        initialize: function($super, a, b, c) {
            $super(c, b);
            this.element = $(a);
            this.lastValue = this.getValue()
        },
        execute: function() {
            var a = this.getValue();
            if (Object.isString(this.lastValue) && Object.isString(a) ? this.lastValue != a : String(this.lastValue) != String(a)) {
                this.callback(this.element, a);
                this.lastValue = a
            }
        }
    });
    Form.Element.Observer = Class.create(Abstract.TimedObserver, {
        getValue: function() {
            return Form.Element.getValue(this.element)
        }
    });
    Form.Observer = Class.create(Abstract.TimedObserver, {
        getValue: function() {
            return Form.serialize(this.element)
        }
    });
    Abstract.EventObserver = Class.create({
        initialize: function(a, b) {
            this.element = $(a);
            this.callback = b;
            this.lastValue = this.getValue();
            if (this.element.tagName.toLowerCase() == "form") {
                this.registerFormCallbacks()
            } else {
                this.registerCallback(this.element)
            }
        },
        onElementEvent: function() {
            var a = this.getValue();
            if (this.lastValue != a) {
                this.callback(this.element, a);
                this.lastValue = a
            }
        },
        registerFormCallbacks: function() {
            Form.getElements(this.element).each(this.registerCallback, this)
        },
        registerCallback: function(a) {
            if (a.type) {
                switch (a.type.toLowerCase()) {
                case "checkbox":
                case "radio":
                    Event.observe(a, "click", this.onElementEvent.bind(this));
                    break;
                default:
                    Event.observe(a, "change", this.onElementEvent.bind(this));
                    break
                }
            }
        }
    });
    Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
        getValue: function() {
            return Form.Element.getValue(this.element)
        }
    });
    Form.EventObserver = Class.create(Abstract.EventObserver, {
        getValue: function() {
            return Form.serialize(this.element)
        }
    });
    if (!window.Event) {
        var Event = {}
    }
    Object.extend(Event, {
        KEY_BACKSPACE: 8,
        KEY_TAB: 9,
        KEY_RETURN: 13,
        KEY_ESC: 27,
        KEY_LEFT: 37,
        KEY_UP: 38,
        KEY_RIGHT: 39,
        KEY_DOWN: 40,
        KEY_DELETE: 46,
        KEY_HOME: 36,
        KEY_END: 35,
        KEY_PAGEUP: 33,
        KEY_PAGEDOWN: 34,
        KEY_INSERT: 45,
        cache: {},
        relatedTarget: function(b) {
            var a;
            switch (b.type) {
            case "mouseover":
                a = b.fromElement;
                break;
            case "mouseout":
                a = b.toElement;
                break;
            default:
                return null
            }
            return Element.extend(a)
        }
    });
    Event.Methods = (function() {
        var a;
        if (Prototype.Browser.IE) {
            var b = {
                0: 1,
                1: 4,
                2: 2
            };
            a = function(d, c) {
                return d.button == b[c]
            }
        } else {
            if (Prototype.Browser.WebKit) {
                a = function(d, c) {
                    switch (c) {
                    case 0:
                        return d.which == 1 && !d.metaKey;
                    case 1:
                        return d.which == 1 && d.metaKey;
                    default:
                        return false
                    }
                }
            } else {
                a = function(d, c) {
                    return d.which ? (d.which === c + 1) : (d.button === c)
                }
            }
        }
        return {
            isLeftClick: function(c) {
                return a(c, 0)
            },
            isMiddleClick: function(c) {
                return a(c, 1)
            },
            isRightClick: function(c) {
                return a(c, 2)
            },
            element: function(e) {
                e = Event.extend(e);
                var d = e.target
                  , c = e.type
                  , f = e.currentTarget;
                if (f && f.tagName) {
                    if (c === "load" || c === "error" || (c === "click" && f.tagName.toLowerCase() === "input" && f.type === "radio")) {
                        d = f
                    }
                }
                if (d.nodeType == Node.TEXT_NODE) {
                    d = d.parentNode
                }
                return Element.extend(d)
            },
            findElement: function(d, f) {
                var c = Event.element(d);
                if (!f) {
                    return c
                }
                var e = [c].concat(c.ancestors());
                return Selector.findElement(e, f, 0)
            },
            pointer: function(e) {
                var d = document.documentElement
                  , c = document.body || {
                    scrollLeft: 0,
                    scrollTop: 0
                };
                return {
                    x: e.pageX || (e.clientX + (d.scrollLeft || c.scrollLeft) - (d.clientLeft || 0)),
                    y: e.pageY || (e.clientY + (d.scrollTop || c.scrollTop) - (d.clientTop || 0))
                }
            },
            pointerX: function(c) {
                return Event.pointer(c).x
            },
            pointerY: function(c) {
                return Event.pointer(c).y
            },
            stop: function(c) {
                Event.extend(c);
                c.preventDefault();
                c.stopPropagation();
                c.stopped = true
            }
        }
    }
    )();
    Event.extend = (function() {
        var a = Object.keys(Event.Methods).inject({}, function(b, c) {
            b[c] = Event.Methods[c].methodize();
            return b
        });
        if (Prototype.Browser.IE) {
            Object.extend(a, {
                stopPropagation: function() {
                    this.cancelBubble = true
                },
                preventDefault: function() {
                    this.returnValue = false
                },
                inspect: function() {
                    return "[object Event]"
                }
            });
            return function(b) {
                if (!b) {
                    return false
                }
                if (b._extendedByPrototype) {
                    return b
                }
                b._extendedByPrototype = Prototype.emptyFunction;
                var c = Event.pointer(b);
                Object.extend(b, {
                    target: b.srcElement,
                    relatedTarget: Event.relatedTarget(b),
                    pageX: c.x,
                    pageY: c.y
                });
                return Object.extend(b, a)
            }
        } else {
            Event.prototype = Event.prototype || document.createEvent("HTMLEvents")["__proto__"];
            Object.extend(Event.prototype, a);
            return Prototype.K
        }
    }
    )();
    Object.extend(Event, (function() {
        var b = Event.cache;
        function c(j) {
            if (j._prototypeEventID) {
                return j._prototypeEventID[0]
            }
            arguments.callee.id = arguments.callee.id || 1;
            return j._prototypeEventID = [++arguments.callee.id]
        }
        function g(j) {
            if (j && j.include(":")) {
                return "dataavailable"
            }
            return j
        }
        function a(j) {
            return b[j] = b[j] || {}
        }
        function f(l, j) {
            var k = a(l);
            return k[j] = k[j] || []
        }
        function h(k, j, l) {
            var o = c(k);
            var n = f(o, j);
            if (n.pluck("handler").include(l)) {
                return false
            }
            var m = function(p) {
                if (!Event || !Event.extend || (p.eventName && p.eventName != j)) {
                    return false
                }
                Event.extend(p);
                l.call(k, p)
            };
            m.handler = l;
            n.push(m);
            return m
        }
        function i(m, j, k) {
            var l = f(m, j);
            return l.find(function(n) {
                return n.handler == k
            })
        }
        function d(m, j, k) {
            var l = a(m);
            if (!l[j]) {
                return false
            }
            l[j] = l[j].without(i(m, j, k))
        }
        function e() {
            for (var k in b) {
                for (var j in b[k]) {
                    b[k][j] = null
                }
            }
        }
        if (window.attachEvent) {
            window.attachEvent("onunload", e)
        }
        if (Prototype.Browser.WebKit) {
            window.addEventListener("unload", Prototype.emptyFunction, false)
        }
        return {
            observe: function(l, j, m) {
                l = $(l);
                var k = g(j);
                var n = h(l, j, m);
                if (!n) {
                    return l
                }
                if (l.addEventListener) {
                    l.addEventListener(k, n, false)
                } else {
                    l.attachEvent("on" + k, n)
                }
                return l
            },
            stopObserving: function(l, j, m) {
                l = $(l);
                var o = c(l)
                  , k = g(j);
                if (!m && j) {
                    f(o, j).each(function(p) {
                        l.stopObserving(j, p.handler)
                    });
                    return l
                } else {
                    if (!j) {
                        Object.keys(a(o)).each(function(p) {
                            l.stopObserving(p)
                        });
                        return l
                    }
                }
                var n = i(o, j, m);
                if (!n) {
                    return l
                }
                if (l.removeEventListener) {
                    l.removeEventListener(k, n, false)
                } else {
                    l.detachEvent("on" + k, n)
                }
                d(o, j, m);
                return l
            },
            fire: function(l, k, j) {
                l = $(l);
                if (l == document && document.createEvent && !l.dispatchEvent) {
                    l = document.documentElement
                }
                var m;
                if (document.createEvent) {
                    m = document.createEvent("HTMLEvents");
                    m.initEvent("dataavailable", true, true)
                } else {
                    m = document.createEventObject();
                    m.eventType = "ondataavailable"
                }
                m.eventName = k;
                m.memo = j || {};
                if (document.createEvent) {
                    l.dispatchEvent(m)
                } else {
                    l.fireEvent(m.eventType, m)
                }
                return Event.extend(m)
            }
        }
    }
    )());
    Object.extend(Event, Event.Methods);
    Element.addMethods({
        fire: Event.fire,
        observe: Event.observe,
        stopObserving: Event.stopObserving
    });
    Object.extend(document, {
        fire: Element.Methods.fire.methodize(),
        observe: Element.Methods.observe.methodize(),
        stopObserving: Element.Methods.stopObserving.methodize(),
        loaded: false
    });
    (function() {
        var b;
        function a() {
            if (document.loaded) {
                return
            }
            if (b) {
                window.clearInterval(b)
            }
            document.fire("dom:loaded");
            document.loaded = true
        }
        if (document.addEventListener) {
            if (Prototype.Browser.WebKit) {
                b = window.setInterval(function() {
                    if (/loaded|complete/.test(document.readyState)) {
                        a()
                    }
                }, 0);
                Event.observe(window, "load", a)
            } else {
                document.addEventListener("DOMContentLoaded", a, false)
            }
        } else {
            document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
            $("__onDOMContentLoaded").onreadystatechange = function() {
                if (this.readyState == "complete") {
                    this.onreadystatechange = null;
                    a()
                }
            }
        }
    }
    )();
    Hash.toQueryString = Object.toQueryString;
    var Toggle = {
        display: Element.toggle
    };
    Element.Methods.childOf = Element.Methods.descendantOf;
    var Insertion = {
        Before: function(a, b) {
            return Element.insert(a, {
                before: b
            })
        },
        Top: function(a, b) {
            return Element.insert(a, {
                top: b
            })
        },
        Bottom: function(a, b) {
            return Element.insert(a, {
                bottom: b
            })
        },
        After: function(a, b) {
            return Element.insert(a, {
                after: b
            })
        }
    };
    var $continue = new Error('"throw $continue" is deprecated, use "return" instead');
    var Position = {
        includeScrollOffsets: false,
        prepare: function() {
            this.deltaX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
            this.deltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
        },
        within: function(b, a, c) {
            if (this.includeScrollOffsets) {
                return this.withinIncludingScrolloffsets(b, a, c)
            }
            this.xcomp = a;
            this.ycomp = c;
            this.offset = Element.cumulativeOffset(b);
            return (c >= this.offset[1] && c < this.offset[1] + b.offsetHeight && a >= this.offset[0] && a < this.offset[0] + b.offsetWidth)
        },
        withinIncludingScrolloffsets: function(b, a, d) {
            var c = Element.cumulativeScrollOffset(b);
            this.xcomp = a + c[0] - this.deltaX;
            this.ycomp = d + c[1] - this.deltaY;
            this.offset = Element.cumulativeOffset(b);
            return (this.ycomp >= this.offset[1] && this.ycomp < this.offset[1] + b.offsetHeight && this.xcomp >= this.offset[0] && this.xcomp < this.offset[0] + b.offsetWidth)
        },
        overlap: function(b, a) {
            if (!b) {
                return 0
            }
            if (b == "vertical") {
                return ((this.offset[1] + a.offsetHeight) - this.ycomp) / a.offsetHeight
            }
            if (b == "horizontal") {
                return ((this.offset[0] + a.offsetWidth) - this.xcomp) / a.offsetWidth
            }
        },
        cumulativeOffset: Element.Methods.cumulativeOffset,
        positionedOffset: Element.Methods.positionedOffset,
        absolutize: function(a) {
            Position.prepare();
            return Element.absolutize(a)
        },
        relativize: function(a) {
            Position.prepare();
            return Element.relativize(a)
        },
        realOffset: Element.Methods.cumulativeScrollOffset,
        offsetParent: Element.Methods.getOffsetParent,
        page: Element.Methods.viewportOffset,
        clone: function(b, c, a) {
            a = a || {};
            return Element.clonePosition(c, b, a)
        }
    };
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function(b) {
            function a(c) {
                return c.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + c + " ')]"
            }
            b.getElementsByClassName = Prototype.BrowserFeatures.XPath ? function(c, e) {
                e = e.toString().strip();
                var d = /\s/.test(e) ? $w(e).map(a).join("") : a(e);
                return d ? document._getElementsByXPath(".//*" + d, c) : []
            }
            : function(e, f) {
                f = f.toString().strip();
                var g = []
                  , h = (/\s/.test(f) ? $w(f) : null);
                if (!h && !f) {
                    return g
                }
                var c = $(e).getElementsByTagName("*");
                f = " " + f + " ";
                for (var d = 0, k, j; k = c[d]; d++) {
                    if (k.className && (j = " " + k.className + " ") && (j.include(f) || (h && h.all(function(i) {
                        return !i.toString().blank() && j.include(" " + i + " ")
                    })))) {
                        g.push(Element.extend(k))
                    }
                }
                return g
            }
            ;
            return function(d, c) {
                return $(c || document.body).getElementsByClassName(d)
            }
        }(Element.Methods)
    }
    Element.ClassNames = Class.create();
    Element.ClassNames.prototype = {
        initialize: function(a) {
            this.element = $(a)
        },
        _each: function(a) {
            this.element.className.split(/\s+/).select(function(b) {
                return b.length > 0
            })._each(a)
        },
        set: function(a) {
            this.element.className = a
        },
        add: function(a) {
            if (this.include(a)) {
                return
            }
            this.set($A(this).concat(a).join(" "))
        },
        remove: function(a) {
            if (!this.include(a)) {
                return
            }
            this.set($A(this).without(a).join(" "))
        },
        toString: function() {
            return $A(this).join(" ")
        }
    };
    Object.extend(Element.ClassNames.prototype, Enumerable);
    Element.addMethods();