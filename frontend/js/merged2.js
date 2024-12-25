    //****************************************
    //****** IVONA JavaScript Packages *******
    //**** Date: Wed Jul 27 00:52:27 2011 ****
    //****************************************

    //*********** Name: jquery.js ************ 

    /*
     * jQuery JavaScript Library v1.3.2
     * http://jquery.com/
     *
     * Copyright (c) 2009 John Resig
     * Dual licensed under the MIT and GPL licenses.
     * http://docs.jquery.com/License
     *
     * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
     * Revision: 6246
     */
    (function() {
        var l = this,
            g, y = l.jQuery,
            p = l.$,
            o = l.jQuery = l.$ = function(E, F) {
                return new o.fn.init(E, F)
            },
            D = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
            f = /^.[^:#\[\.,]*$/;
        o.fn = o.prototype = {
            init: function(E, H) {
                E = E || document;
                if (E.nodeType) {
                    this[0] = E;
                    this.length = 1;
                    this.context = E;
                    return this
                }
                if (typeof E === "string") {
                    var G = D.exec(E);
                    if (G && (G[1] || !H)) {
                        if (G[1]) {
                            E = o.clean([G[1]], H)
                        } else {
                            var I = document.getElementById(G[3]);
                            if (I && I.id != G[3]) {
                                return o().find(E)
                            }
                            var F = o(I || []);
                            F.context = document;
                            F.selector = E;
                            return F
                        }
                    } else {
                        return o(H).find(E)
                    }
                } else {
                    if (o.isFunction(E)) {
                        return o(document).ready(E)
                    }
                }
                if (E.selector && E.context) {
                    this.selector = E.selector;
                    this.context = E.context
                }
                return this.setArray(o.isArray(E) ? E : o.makeArray(E))
            },
            selector: "",
            jquery: "1.3.2",
            size: function() {
                return this.length
            },
            get: function(E) {
                return E === g ? Array.prototype.slice.call(this) : this[E]
            },
            pushStack: function(F, H, E) {
                var G = o(F);
                G.prevObject = this;
                G.context = this.context;
                if (H === "find") {
                    G.selector = this.selector + (this.selector ? " " : "") + E
                } else {
                    if (H) {
                        G.selector = this.selector + "." + H + "(" + E + ")"
                    }
                }
                return G
            },
            setArray: function(E) {
                this.length = 0;
                Array.prototype.push.apply(this, E);
                return this
            },
            each: function(F, E) {
                return o.each(this, F, E)
            },
            index: function(E) {
                return o.inArray(E && E.jquery ? E[0] : E, this)
            },
            attr: function(F, H, G) {
                var E = F;
                if (typeof F === "string") {
                    if (H === g) {
                        return this[0] && o[G || "attr"](this[0], F)
                    } else {
                        E = {};
                        E[F] = H
                    }
                }
                return this.each(function(I) {
                    for (F in E) {
                        o.attr(G ? this.style : this, F, o.prop(this, E[F], G, I, F))
                    }
                })
            },
            css: function(E, F) {
                if ((E == "width" || E == "height") && parseFloat(F) < 0) {
                    F = g
                }
                return this.attr(E, F, "curCSS")
            },
            text: function(F) {
                if (typeof F !== "object" && F != null) {
                    return this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(F))
                }
                var E = "";
                o.each(F || this, function() {
                    o.each(this.childNodes, function() {
                        if (this.nodeType != 8) {
                            E += this.nodeType != 1 ? this.nodeValue : o.fn.text([this])
                        }
                    })
                });
                return E
            },
            wrapAll: function(E) {
                if (this[0]) {
                    var F = o(E, this[0].ownerDocument).clone();
                    if (this[0].parentNode) {
                        F.insertBefore(this[0])
                    }
                    F.map(function() {
                        var G = this;
                        while (G.firstChild) {
                            G = G.firstChild
                        }
                        return G
                    }).append(this)
                }
                return this
            },
            wrapInner: function(E) {
                return this.each(function() {
                    o(this).contents().wrapAll(E)
                })
            },
            wrap: function(E) {
                return this.each(function() {
                    o(this).wrapAll(E)
                })
            },
            append: function() {
                return this.domManip(arguments, true, function(E) {
                    if (this.nodeType == 1) {
                        this.appendChild(E)
                    }
                })
            },
            prepend: function() {
                return this.domManip(arguments, true, function(E) {
                    if (this.nodeType == 1) {
                        this.insertBefore(E, this.firstChild)
                    }
                })
            },
            before: function() {
                return this.domManip(arguments, false, function(E) {
                    this.parentNode.insertBefore(E, this)
                })
            },
            after: function() {
                return this.domManip(arguments, false, function(E) {
                    this.parentNode.insertBefore(E, this.nextSibling)
                })
            },
            end: function() {
                return this.prevObject || o([])
            },
            push: [].push,
            sort: [].sort,
            splice: [].splice,
            find: function(E) {
                if (this.length === 1) {
                    var F = this.pushStack([], "find", E);
                    F.length = 0;
                    o.find(E, this[0], F);
                    return F
                } else {
                    return this.pushStack(o.unique(o.map(this, function(G) {
                        return o.find(E, G)
                    })), "find", E)
                }
            },
            clone: function(G) {
                var E = this.map(function() {
                    if (!o.support.noCloneEvent && !o.isXMLDoc(this)) {
                        var I = this.outerHTML;
                        if (!I) {
                            var J = this.ownerDocument.createElement("div");
                            J.appendChild(this.cloneNode(true));
                            I = J.innerHTML
                        }
                        return o.clean([I.replace(/ jQuery\d+="(?:\d+|null)"/g, "").replace(/^\s*/, "")])[0]
                    } else {
                        return this.cloneNode(true)
                    }
                });
                if (G === true) {
                    var H = this.find("*").andSelf(),
                        F = 0;
                    E.find("*").andSelf().each(function() {
                        if (this.nodeName !== H[F].nodeName) {
                            return
                        }
                        var I = o.data(H[F], "events");
                        for (var K in I) {
                            for (var J in I[K]) {
                                o.event.add(this, K, I[K][J], I[K][J].data)
                            }
                        }
                        F++
                    })
                }
                return E
            },
            filter: function(E) {
                return this.pushStack(o.isFunction(E) && o.grep(this, function(G, F) {
                    return E.call(G, F)
                }) || o.multiFilter(E, o.grep(this, function(F) {
                    return F.nodeType === 1
                })), "filter", E)
            },
            closest: function(E) {
                var G = o.expr.match.POS.test(E) ? o(E) : null,
                    F = 0;
                return this.map(function() {
                    var H = this;
                    while (H && H.ownerDocument) {
                        if (G ? G.index(H) > -1 : o(H).is(E)) {
                            o.data(H, "closest", F);
                            return H
                        }
                        H = H.parentNode;
                        F++
                    }
                })
            },
            not: function(E) {
                if (typeof E === "string") {
                    if (f.test(E)) {
                        return this.pushStack(o.multiFilter(E, this, true), "not", E)
                    } else {
                        E = o.multiFilter(E, this)
                    }
                }
                var F = E.length && E[E.length - 1] !== g && !E.nodeType;
                return this.filter(function() {
                    return F ? o.inArray(this, E) < 0 : this != E
                })
            },
            add: function(E) {
                return this.pushStack(o.unique(o.merge(this.get(), typeof E === "string" ? o(E) : o.makeArray(E))))
            },
            is: function(E) {
                return !!E && o.multiFilter(E, this).length > 0
            },
            hasClass: function(E) {
                return !!E && this.is("." + E)
            },
            val: function(K) {
                if (K === g) {
                    var E = this[0];
                    if (E) {
                        if (o.nodeName(E, "option")) {
                            return (E.attributes.value || {}).specified ? E.value : E.text
                        }
                        if (o.nodeName(E, "select")) {
                            var I = E.selectedIndex,
                                L = [],
                                M = E.options,
                                H = E.type == "select-one";
                            if (I < 0) {
                                return null
                            }
                            for (var F = H ? I : 0, J = H ? I + 1 : M.length; F < J; F++) {
                                var G = M[F];
                                if (G.selected) {
                                    K = o(G).val();
                                    if (H) {
                                        return K
                                    }
                                    L.push(K)
                                }
                            }
                            return L
                        }
                        return (E.value || "").replace(/\r/g, "")
                    }
                    return g
                }
                if (typeof K === "number") {
                    K += ""
                }
                return this.each(function() {
                    if (this.nodeType != 1) {
                        return
                    }
                    if (o.isArray(K) && /radio|checkbox/.test(this.type)) {
                        this.checked = (o.inArray(this.value, K) >= 0 || o.inArray(this.name, K) >= 0)
                    } else {
                        if (o.nodeName(this, "select")) {
                            var N = o.makeArray(K);
                            o("option", this).each(function() {
                                this.selected = (o.inArray(this.value, N) >= 0 || o.inArray(this.text, N) >= 0)
                            });
                            if (!N.length) {
                                this.selectedIndex = -1
                            }
                        } else {
                            this.value = K
                        }
                    }
                })
            },
            html: function(E) {
                return E === g ? (this[0] ? this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g, "") : null) : this.empty().append(E)
            },
            replaceWith: function(E) {
                return this.after(E).remove()
            },
            eq: function(E) {
                return this.slice(E, +E + 1)
            },
            slice: function() {
                return this.pushStack(Array.prototype.slice.apply(this, arguments), "slice", Array.prototype.slice.call(arguments).join(","))
            },
            map: function(E) {
                return this.pushStack(o.map(this, function(G, F) {
                    return E.call(G, F, G)
                }))
            },
            andSelf: function() {
                return this.add(this.prevObject)
            },
            domManip: function(J, M, L) {
                if (this[0]) {
                    var I = (this[0].ownerDocument || this[0]).createDocumentFragment(),
                        F = o.clean(J, (this[0].ownerDocument || this[0]), I),
                        H = I.firstChild;
                    if (H) {
                        for (var G = 0, E = this.length; G < E; G++) {
                            L.call(K(this[G], H), this.length > 1 || G > 0 ? I.cloneNode(true) : I)
                        }
                    }
                    if (F) {
                        o.each(F, z)
                    }
                }
                return this;

                function K(N, O) {
                    return M && o.nodeName(N, "table") && o.nodeName(O, "tr") ? (N.getElementsByTagName("tbody")[0] || N.appendChild(N.ownerDocument.createElement("tbody"))) : N
                }
            }
        };
        o.fn.init.prototype = o.fn;

        function z(E, F) {
            if (F.src) {
                o.ajax({
                    url: F.src,
                    async: false,
                    dataType: "script"
                })
            } else {
                o.globalEval(F.text || F.textContent || F.innerHTML || "")
            }
            if (F.parentNode) {
                F.parentNode.removeChild(F)
            }
        }

        function e() {
            return +new Date
        }
        o.extend = o.fn.extend = function() {
            var J = arguments[0] || {},
                H = 1,
                I = arguments.length,
                E = false,
                G;
            if (typeof J === "boolean") {
                E = J;
                J = arguments[1] || {};
                H = 2
            }
            if (typeof J !== "object" && !o.isFunction(J)) {
                J = {}
            }
            if (I == H) {
                J = this;
                --H
            }
            for (; H < I; H++) {
                if ((G = arguments[H]) != null) {
                    for (var F in G) {
                        var K = J[F],
                            L = G[F];
                        if (J === L) {
                            continue
                        }
                        if (E && L && typeof L === "object" && !L.nodeType) {
                            J[F] = o.extend(E, K || (L.length != null ? [] : {}), L)
                        } else {
                            if (L !== g) {
                                J[F] = L
                            }
                        }
                    }
                }
            }
            return J
        };
        var b = /z-?index|font-?weight|opacity|zoom|line-?height/i,
            q = document.defaultView || {},
            s = Object.prototype.toString;
        o.extend({
            noConflict: function(E) {
                l.$ = p;
                if (E) {
                    l.jQuery = y
                }
                return o
            },
            isFunction: function(E) {
                return s.call(E) === "[object Function]"
            },
            isArray: function(E) {
                return s.call(E) === "[object Array]"
            },
            isXMLDoc: function(E) {
                return E.nodeType === 9 && E.documentElement.nodeName !== "HTML" || !!E.ownerDocument && o.isXMLDoc(E.ownerDocument)
            },
            globalEval: function(G) {
                if (G && /\S/.test(G)) {
                    var F = document.getElementsByTagName("head")[0] || document.documentElement,
                        E = document.createElement("script");
                    E.type = "text/javascript";
                    if (o.support.scriptEval) {
                        E.appendChild(document.createTextNode(G))
                    } else {
                        E.text = G
                    }
                    F.insertBefore(E, F.firstChild);
                    F.removeChild(E)
                }
            },
            nodeName: function(F, E) {
                return F.nodeName && F.nodeName.toUpperCase() == E.toUpperCase()
            },
            each: function(G, K, F) {
                var E, H = 0,
                    I = G.length;
                if (F) {
                    if (I === g) {
                        for (E in G) {
                            if (K.apply(G[E], F) === false) {
                                break
                            }
                        }
                    } else {
                        for (; H < I;) {
                            if (K.apply(G[H++], F) === false) {
                                break
                            }
                        }
                    }
                } else {
                    if (I === g) {
                        for (E in G) {
                            if (K.call(G[E], E, G[E]) === false) {
                                break
                            }
                        }
                    } else {
                        for (var J = G[0]; H < I && K.call(J, H, J) !== false; J = G[++H]) {}
                    }
                }
                return G
            },
            prop: function(H, I, G, F, E) {
                if (o.isFunction(I)) {
                    I = I.call(H, F)
                }
                return typeof I === "number" && G == "curCSS" && !b.test(E) ? I + "px" : I
            },
            className: {
                add: function(E, F) {
                    o.each((F || "").split(/\s+/), function(G, H) {
                        if (E.nodeType == 1 && !o.className.has(E.className, H)) {
                            E.className += (E.className ? " " : "") + H
                        }
                    })
                },
                remove: function(E, F) {
                    if (E.nodeType == 1) {
                        E.className = F !== g ? o.grep(E.className.split(/\s+/), function(G) {
                            return !o.className.has(F, G)
                        }).join(" ") : ""
                    }
                },
                has: function(F, E) {
                    return F && o.inArray(E, (F.className || F).toString().split(/\s+/)) > -1
                }
            },
            swap: function(H, G, I) {
                var E = {};
                for (var F in G) {
                    E[F] = H.style[F];
                    H.style[F] = G[F]
                }
                I.call(H);
                for (var F in G) {
                    H.style[F] = E[F]
                }
            },
            css: function(H, F, J, E) {
                if (F == "width" || F == "height") {
                    var L, G = {
                            position: "absolute",
                            visibility: "hidden",
                            display: "block"
                        },
                        K = F == "width" ? ["Left", "Right"] : ["Top", "Bottom"];

                    function I() {
                        L = F == "width" ? H.offsetWidth : H.offsetHeight;
                        if (E === "border") {
                            return
                        }
                        o.each(K, function() {
                            if (!E) {
                                L -= parseFloat(o.curCSS(H, "padding" + this, true)) || 0
                            }
                            if (E === "margin") {
                                L += parseFloat(o.curCSS(H, "margin" + this, true)) || 0
                            } else {
                                L -= parseFloat(o.curCSS(H, "border" + this + "Width", true)) || 0
                            }
                        })
                    }
                    if (H.offsetWidth !== 0) {
                        I()
                    } else {
                        o.swap(H, G, I)
                    }
                    return Math.max(0, Math.round(L))
                }
                return o.curCSS(H, F, J)
            },
            curCSS: function(I, F, G) {
                var L, E = I.style;
                if (F == "opacity" && !o.support.opacity) {
                    L = o.attr(E, "opacity");
                    return L == "" ? "1" : L
                }
                if (F.match(/float/i)) {
                    F = w
                }
                if (!G && E && E[F]) {
                    L = E[F]
                } else {
                    if (q.getComputedStyle) {
                        if (F.match(/float/i)) {
                            F = "float"
                        }
                        F = F.replace(/([A-Z])/g, "-$1").toLowerCase();
                        var M = q.getComputedStyle(I, null);
                        if (M) {
                            L = M.getPropertyValue(F)
                        }
                        if (F == "opacity" && L == "") {
                            L = "1"
                        }
                    } else {
                        if (I.currentStyle) {
                            var J = F.replace(/\-(\w)/g, function(N, O) {
                                return O.toUpperCase()
                            });
                            L = I.currentStyle[F] || I.currentStyle[J];
                            if (!/^\d+(px)?$/i.test(L) && /^\d/.test(L)) {
                                var H = E.left,
                                    K = I.runtimeStyle.left;
                                I.runtimeStyle.left = I.currentStyle.left;
                                E.left = L || 0;
                                L = E.pixelLeft + "px";
                                E.left = H;
                                I.runtimeStyle.left = K
                            }
                        }
                    }
                }
                return L
            },
            clean: function(F, K, I) {
                K = K || document;
                if (typeof K.createElement === "undefined") {
                    K = K.ownerDocument || K[0] && K[0].ownerDocument || document
                }
                if (!I && F.length === 1 && typeof F[0] === "string") {
                    var H = /^<(\w+)\s*\/?>$/.exec(F[0]);
                    if (H) {
                        return [K.createElement(H[1])]
                    }
                }
                var G = [],
                    E = [],
                    L = K.createElement("div");
                o.each(F, function(P, S) {
                    if (typeof S === "number") {
                        S += ""
                    }
                    if (!S) {
                        return
                    }
                    if (typeof S === "string") {
                        S = S.replace(/(<(\w+)[^>]*?)\/>/g, function(U, V, T) {
                            return T.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? U : V + "></" + T + ">"
                        });
                        var O = S.replace(/^\s+/, "").substring(0, 10).toLowerCase();
                        var Q = !O.indexOf("<opt") && [1, "<select multiple='multiple'>", "</select>"] || !O.indexOf("<leg") && [1, "<fieldset>", "</fieldset>"] || O.match(/^<(thead|tbody|tfoot|colg|cap)/) && [1, "<table>", "</table>"] || !O.indexOf("<tr") && [2, "<table><tbody>", "</tbody></table>"] || (!O.indexOf("<td") || !O.indexOf("<th")) && [3, "<table><tbody><tr>", "</tr></tbody></table>"] || !O.indexOf("<col") && [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"] || !o.support.htmlSerialize && [1, "div<div>", "</div>"] || [0, "", ""];
                        L.innerHTML = Q[1] + S + Q[2];
                        while (Q[0]--) {
                            L = L.lastChild
                        }
                        if (!o.support.tbody) {
                            var R = /<tbody/i.test(S),
                                N = !O.indexOf("<table") && !R ? L.firstChild && L.firstChild.childNodes : Q[1] == "<table>" && !R ? L.childNodes : [];
                            for (var M = N.length - 1; M >= 0; --M) {
                                if (o.nodeName(N[M], "tbody") && !N[M].childNodes.length) {
                                    N[M].parentNode.removeChild(N[M])
                                }
                            }
                        }
                        if (!o.support.leadingWhitespace && /^\s/.test(S)) {
                            L.insertBefore(K.createTextNode(S.match(/^\s*/)[0]), L.firstChild)
                        }
                        S = o.makeArray(L.childNodes)
                    }
                    if (S.nodeType) {
                        G.push(S)
                    } else {
                        G = o.merge(G, S)
                    }
                });
                if (I) {
                    for (var J = 0; G[J]; J++) {
                        if (o.nodeName(G[J], "script") && (!G[J].type || G[J].type.toLowerCase() === "text/javascript")) {
                            E.push(G[J].parentNode ? G[J].parentNode.removeChild(G[J]) : G[J])
                        } else {
                            if (G[J].nodeType === 1) {
                                G.splice.apply(G, [J + 1, 0].concat(o.makeArray(G[J].getElementsByTagName("script"))))
                            }
                            I.appendChild(G[J])
                        }
                    }
                    return E
                }
                return G
            },
            attr: function(J, G, K) {
                if (!J || J.nodeType == 3 || J.nodeType == 8) {
                    return g
                }
                var H = !o.isXMLDoc(J),
                    L = K !== g;
                G = H && o.props[G] || G;
                if (J.tagName) {
                    var F = /href|src|style/.test(G);
                    if (G == "selected" && J.parentNode) {
                        J.parentNode.selectedIndex
                    }
                    if (G in J && H && !F) {
                        if (L) {
                            if (G == "type" && o.nodeName(J, "input") && J.parentNode) {
                                throw "type property can't be changed"
                            }
                            J[G] = K
                        }
                        if (o.nodeName(J, "form") && J.getAttributeNode(G)) {
                            return J.getAttributeNode(G).nodeValue
                        }
                        if (G == "tabIndex") {
                            var I = J.getAttributeNode("tabIndex");
                            return I && I.specified ? I.value : J.nodeName.match(/(button|input|object|select|textarea)/i) ? 0 : J.nodeName.match(/^(a|area)$/i) && J.href ? 0 : g
                        }
                        return J[G]
                    }
                    if (!o.support.style && H && G == "style") {
                        return o.attr(J.style, "cssText", K)
                    }
                    if (L) {
                        J.setAttribute(G, "" + K)
                    }
                    var E = !o.support.hrefNormalized && H && F ? J.getAttribute(G, 2) : J.getAttribute(G);
                    return E === null ? g : E
                }
                if (!o.support.opacity && G == "opacity") {
                    if (L) {
                        J.zoom = 1;
                        J.filter = (J.filter || "").replace(/alpha\([^)]*\)/, "") + (parseInt(K) + "" == "NaN" ? "" : "alpha(opacity=" + K * 100 + ")")
                    }
                    return J.filter && J.filter.indexOf("opacity=") >= 0 ? (parseFloat(J.filter.match(/opacity=([^)]*)/)[1]) / 100) + "" : ""
                }
                G = G.replace(/-([a-z])/ig, function(M, N) {
                    return N.toUpperCase()
                });
                if (L) {
                    J[G] = K
                }
                return J[G]
            },
            trim: function(E) {
                return (E || "").replace(/^\s+|\s+$/g, "")
            },
            makeArray: function(G) {
                var E = [];
                if (G != null) {
                    var F = G.length;
                    if (F == null || typeof G === "string" || o.isFunction(G) || G.setInterval) {
                        E[0] = G
                    } else {
                        while (F) {
                            E[--F] = G[F]
                        }
                    }
                }
                return E
            },
            inArray: function(G, H) {
                for (var E = 0, F = H.length; E < F; E++) {
                    if (H[E] === G) {
                        return E
                    }
                }
                return -1
            },
            merge: function(H, E) {
                var F = 0,
                    G, I = H.length;
                if (!o.support.getAll) {
                    while ((G = E[F++]) != null) {
                        if (G.nodeType != 8) {
                            H[I++] = G
                        }
                    }
                } else {
                    while ((G = E[F++]) != null) {
                        H[I++] = G
                    }
                }
                return H
            },
            unique: function(K) {
                var F = [],
                    E = {};
                try {
                    for (var G = 0, H = K.length; G < H; G++) {
                        var J = o.data(K[G]);
                        if (!E[J]) {
                            E[J] = true;
                            F.push(K[G])
                        }
                    }
                } catch (I) {
                    F = K
                }
                return F
            },
            grep: function(F, J, E) {
                var G = [];
                for (var H = 0, I = F.length; H < I; H++) {
                    if (!E != !J(F[H], H)) {
                        G.push(F[H])
                    }
                }
                return G
            },
            map: function(E, J) {
                var F = [];
                for (var G = 0, H = E.length; G < H; G++) {
                    var I = J(E[G], G);
                    if (I != null) {
                        F[F.length] = I
                    }
                }
                return F.concat.apply([], F)
            }
        });
        var C = navigator.userAgent.toLowerCase();
        o.browser = {
            version: (C.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, "0"])[1],
            safari: /webkit/.test(C),
            opera: /opera/.test(C),
            msie: /msie/.test(C) && !/opera/.test(C),
            mozilla: /mozilla/.test(C) && !/(compatible|webkit)/.test(C)
        };
        o.each({
            parent: function(E) {
                return E.parentNode
            },
            parents: function(E) {
                return o.dir(E, "parentNode")
            },
            next: function(E) {
                return o.nth(E, 2, "nextSibling")
            },
            prev: function(E) {
                return o.nth(E, 2, "previousSibling")
            },
            nextAll: function(E) {
                return o.dir(E, "nextSibling")
            },
            prevAll: function(E) {
                return o.dir(E, "previousSibling")
            },
            siblings: function(E) {
                return o.sibling(E.parentNode.firstChild, E)
            },
            children: function(E) {
                return o.sibling(E.firstChild)
            },
            contents: function(E) {
                return o.nodeName(E, "iframe") ? E.contentDocument || E.contentWindow.document : o.makeArray(E.childNodes)
            }
        }, function(E, F) {
            o.fn[E] = function(G) {
                var H = o.map(this, F);
                if (G && typeof G == "string") {
                    H = o.multiFilter(G, H)
                }
                return this.pushStack(o.unique(H), E, G)
            }
        });
        o.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(E, F) {
            o.fn[E] = function(G) {
                var J = [],
                    L = o(G);
                for (var K = 0, H = L.length; K < H; K++) {
                    var I = (K > 0 ? this.clone(true) : this).get();
                    o.fn[F].apply(o(L[K]), I);
                    J = J.concat(I)
                }
                return this.pushStack(J, E, G)
            }
        });
        o.each({
            removeAttr: function(E) {
                o.attr(this, E, "");
                if (this.nodeType == 1) {
                    this.removeAttribute(E)
                }
            },
            addClass: function(E) {
                o.className.add(this, E)
            },
            removeClass: function(E) {
                o.className.remove(this, E)
            },
            toggleClass: function(F, E) {
                if (typeof E !== "boolean") {
                    E = !o.className.has(this, F)
                }
                o.className[E ? "add" : "remove"](this, F)
            },
            remove: function(E) {
                if (!E || o.filter(E, [this]).length) {
                    o("*", this).add([this]).each(function() {
                        o.event.remove(this);
                        o.removeData(this)
                    });
                    if (this.parentNode) {
                        this.parentNode.removeChild(this)
                    }
                }
            },
            empty: function() {
                o(this).children().remove();
                while (this.firstChild) {
                    this.removeChild(this.firstChild)
                }
            }
        }, function(E, F) {
            o.fn[E] = function() {
                return this.each(F, arguments)
            }
        });

        function j(E, F) {
            return E[0] && parseInt(o.curCSS(E[0], F, true), 10) || 0
        }
        var h = "jQuery" + e(),
            v = 0,
            A = {};
        o.extend({
            cache: {},
            data: function(F, E, G) {
                F = F == l ? A : F;
                var H = F[h];
                if (!H) {
                    H = F[h] = ++v
                }
                if (E && !o.cache[H]) {
                    o.cache[H] = {}
                }
                if (G !== g) {
                    o.cache[H][E] = G
                }
                return E ? o.cache[H][E] : H
            },
            removeData: function(F, E) {
                F = F == l ? A : F;
                var H = F[h];
                if (E) {
                    if (o.cache[H]) {
                        delete o.cache[H][E];
                        E = "";
                        for (E in o.cache[H]) {
                            break
                        }
                        if (!E) {
                            o.removeData(F)
                        }
                    }
                } else {
                    try {
                        delete F[h]
                    } catch (G) {
                        if (F.removeAttribute) {
                            F.removeAttribute(h)
                        }
                    }
                    delete o.cache[H]
                }
            },
            queue: function(F, E, H) {
                if (F) {
                    E = (E || "fx") + "queue";
                    var G = o.data(F, E);
                    if (!G || o.isArray(H)) {
                        G = o.data(F, E, o.makeArray(H))
                    } else {
                        if (H) {
                            G.push(H)
                        }
                    }
                }
                return G
            },
            dequeue: function(H, G) {
                var E = o.queue(H, G),
                    F = E.shift();
                if (!G || G === "fx") {
                    F = E[0]
                }
                if (F !== g) {
                    F.call(H)
                }
            }
        });
        o.fn.extend({
            data: function(E, G) {
                var H = E.split(".");
                H[1] = H[1] ? "." + H[1] : "";
                if (G === g) {
                    var F = this.triggerHandler("getData" + H[1] + "!", [H[0]]);
                    if (F === g && this.length) {
                        F = o.data(this[0], E)
                    }
                    return F === g && H[1] ? this.data(H[0]) : F
                } else {
                    return this.trigger("setData" + H[1] + "!", [H[0], G]).each(function() {
                        o.data(this, E, G)
                    })
                }
            },
            removeData: function(E) {
                return this.each(function() {
                    o.removeData(this, E)
                })
            },
            queue: function(E, F) {
                if (typeof E !== "string") {
                    F = E;
                    E = "fx"
                }
                if (F === g) {
                    return o.queue(this[0], E)
                }
                return this.each(function() {
                    var G = o.queue(this, E, F);
                    if (E == "fx" && G.length == 1) {
                        G[0].call(this)
                    }
                })
            },
            dequeue: function(E) {
                return this.each(function() {
                    o.dequeue(this, E)
                })
            }
        });
        /*
         * Sizzle CSS Selector Engine - v0.9.3
         *  Copyright 2009, The Dojo Foundation
         *  Released under the MIT, BSD, and GPL Licenses.
         *  More information: http://sizzlejs.com/
         */
        (function() {
            var R = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
                L = 0,
                H = Object.prototype.toString;
            var F = function(Y, U, ab, ac) {
                ab = ab || [];
                U = U || document;
                if (U.nodeType !== 1 && U.nodeType !== 9) {
                    return []
                }
                if (!Y || typeof Y !== "string") {
                    return ab
                }
                var Z = [],
                    W, af, ai, T, ad, V, X = true;
                R.lastIndex = 0;
                while ((W = R.exec(Y)) !== null) {
                    Z.push(W[1]);
                    if (W[2]) {
                        V = RegExp.rightContext;
                        break
                    }
                }
                if (Z.length > 1 && M.exec(Y)) {
                    if (Z.length === 2 && I.relative[Z[0]]) {
                        af = J(Z[0] + Z[1], U)
                    } else {
                        af = I.relative[Z[0]] ? [U] : F(Z.shift(), U);
                        while (Z.length) {
                            Y = Z.shift();
                            if (I.relative[Y]) {
                                Y += Z.shift()
                            }
                            af = J(Y, af)
                        }
                    }
                } else {
                    var ae = ac ? {
                        expr: Z.pop(),
                        set: E(ac)
                    } : F.find(Z.pop(), Z.length === 1 && U.parentNode ? U.parentNode : U, Q(U));
                    af = F.filter(ae.expr, ae.set);
                    if (Z.length > 0) {
                        ai = E(af)
                    } else {
                        X = false
                    }
                    while (Z.length) {
                        var ah = Z.pop(),
                            ag = ah;
                        if (!I.relative[ah]) {
                            ah = ""
                        } else {
                            ag = Z.pop()
                        }
                        if (ag == null) {
                            ag = U
                        }
                        I.relative[ah](ai, ag, Q(U))
                    }
                }
                if (!ai) {
                    ai = af
                }
                if (!ai) {
                    throw "Syntax error, unrecognized expression: " + (ah || Y)
                }
                if (H.call(ai) === "[object Array]") {
                    if (!X) {
                        ab.push.apply(ab, ai)
                    } else {
                        if (U.nodeType === 1) {
                            for (var aa = 0; ai[aa] != null; aa++) {
                                if (ai[aa] && (ai[aa] === true || ai[aa].nodeType === 1 && K(U, ai[aa]))) {
                                    ab.push(af[aa])
                                }
                            }
                        } else {
                            for (var aa = 0; ai[aa] != null; aa++) {
                                if (ai[aa] && ai[aa].nodeType === 1) {
                                    ab.push(af[aa])
                                }
                            }
                        }
                    }
                } else {
                    E(ai, ab)
                }
                if (V) {
                    F(V, U, ab, ac);
                    if (G) {
                        hasDuplicate = false;
                        ab.sort(G);
                        if (hasDuplicate) {
                            for (var aa = 1; aa < ab.length; aa++) {
                                if (ab[aa] === ab[aa - 1]) {
                                    ab.splice(aa--, 1)
                                }
                            }
                        }
                    }
                }
                return ab
            };
            F.matches = function(T, U) {
                return F(T, null, null, U)
            };
            F.find = function(aa, T, ab) {
                var Z, X;
                if (!aa) {
                    return []
                }
                for (var W = 0, V = I.order.length; W < V; W++) {
                    var Y = I.order[W],
                        X;
                    if ((X = I.match[Y].exec(aa))) {
                        var U = RegExp.leftContext;
                        if (U.substr(U.length - 1) !== "\\") {
                            X[1] = (X[1] || "").replace(/\\/g, "");
                            Z = I.find[Y](X, T, ab);
                            if (Z != null) {
                                aa = aa.replace(I.match[Y], "");
                                break
                            }
                        }
                    }
                }
                if (!Z) {
                    Z = T.getElementsByTagName("*")
                }
                return {
                    set: Z,
                    expr: aa
                }
            };
            F.filter = function(ad, ac, ag, W) {
                var V = ad,
                    ai = [],
                    aa = ac,
                    Y, T, Z = ac && ac[0] && Q(ac[0]);
                while (ad && ac.length) {
                    for (var ab in I.filter) {
                        if ((Y = I.match[ab].exec(ad)) != null) {
                            var U = I.filter[ab],
                                ah, af;
                            T = false;
                            if (aa == ai) {
                                ai = []
                            }
                            if (I.preFilter[ab]) {
                                Y = I.preFilter[ab](Y, aa, ag, ai, W, Z);
                                if (!Y) {
                                    T = ah = true
                                } else {
                                    if (Y === true) {
                                        continue
                                    }
                                }
                            }
                            if (Y) {
                                for (var X = 0;
                                    (af = aa[X]) != null; X++) {
                                    if (af) {
                                        ah = U(af, Y, X, aa);
                                        var ae = W ^ !!ah;
                                        if (ag && ah != null) {
                                            if (ae) {
                                                T = true
                                            } else {
                                                aa[X] = false
                                            }
                                        } else {
                                            if (ae) {
                                                ai.push(af);
                                                T = true
                                            }
                                        }
                                    }
                                }
                            }
                            if (ah !== g) {
                                if (!ag) {
                                    aa = ai
                                }
                                ad = ad.replace(I.match[ab], "");
                                if (!T) {
                                    return []
                                }
                                break
                            }
                        }
                    }
                    if (ad == V) {
                        if (T == null) {
                            throw "Syntax error, unrecognized expression: " + ad
                        } else {
                            break
                        }
                    }
                    V = ad
                }
                return aa
            };
            var I = F.selectors = {
                order: ["ID", "NAME", "TAG"],
                match: {
                    ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
                    CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
                    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
                    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
                    TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
                    CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
                    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
                    PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
                },
                attrMap: {
                    "class": "className",
                    "for": "htmlFor"
                },
                attrHandle: {
                    href: function(T) {
                        return T.getAttribute("href")
                    }
                },
                relative: {
                    "+": function(aa, T, Z) {
                        var X = typeof T === "string",
                            ab = X && !/\W/.test(T),
                            Y = X && !ab;
                        if (ab && !Z) {
                            T = T.toUpperCase()
                        }
                        for (var W = 0, V = aa.length, U; W < V; W++) {
                            if ((U = aa[W])) {
                                while ((U = U.previousSibling) && U.nodeType !== 1) {}
                                aa[W] = Y || U && U.nodeName === T ? U || false : U === T
                            }
                        }
                        if (Y) {
                            F.filter(T, aa, true)
                        }
                    },
                    ">": function(Z, U, aa) {
                        var X = typeof U === "string";
                        if (X && !/\W/.test(U)) {
                            U = aa ? U : U.toUpperCase();
                            for (var V = 0, T = Z.length; V < T; V++) {
                                var Y = Z[V];
                                if (Y) {
                                    var W = Y.parentNode;
                                    Z[V] = W.nodeName === U ? W : false
                                }
                            }
                        } else {
                            for (var V = 0, T = Z.length; V < T; V++) {
                                var Y = Z[V];
                                if (Y) {
                                    Z[V] = X ? Y.parentNode : Y.parentNode === U
                                }
                            }
                            if (X) {
                                F.filter(U, Z, true)
                            }
                        }
                    },
                    "": function(W, U, Y) {
                        var V = L++,
                            T = S;
                        if (!U.match(/\W/)) {
                            var X = U = Y ? U : U.toUpperCase();
                            T = P
                        }
                        T("parentNode", U, V, W, X, Y)
                    },
                    "~": function(W, U, Y) {
                        var V = L++,
                            T = S;
                        if (typeof U === "string" && !U.match(/\W/)) {
                            var X = U = Y ? U : U.toUpperCase();
                            T = P
                        }
                        T("previousSibling", U, V, W, X, Y)
                    }
                },
                find: {
                    ID: function(U, V, W) {
                        if (typeof V.getElementById !== "undefined" && !W) {
                            var T = V.getElementById(U[1]);
                            return T ? [T] : []
                        }
                    },
                    NAME: function(V, Y, Z) {
                        if (typeof Y.getElementsByName !== "undefined") {
                            var U = [],
                                X = Y.getElementsByName(V[1]);
                            for (var W = 0, T = X.length; W < T; W++) {
                                if (X[W].getAttribute("name") === V[1]) {
                                    U.push(X[W])
                                }
                            }
                            return U.length === 0 ? null : U
                        }
                    },
                    TAG: function(T, U) {
                        return U.getElementsByTagName(T[1])
                    }
                },
                preFilter: {
                    CLASS: function(W, U, V, T, Z, aa) {
                        W = " " + W[1].replace(/\\/g, "") + " ";
                        if (aa) {
                            return W
                        }
                        for (var X = 0, Y;
                            (Y = U[X]) != null; X++) {
                            if (Y) {
                                if (Z ^ (Y.className && (" " + Y.className + " ").indexOf(W) >= 0)) {
                                    if (!V) {
                                        T.push(Y)
                                    }
                                } else {
                                    if (V) {
                                        U[X] = false
                                    }
                                }
                            }
                        }
                        return false
                    },
                    ID: function(T) {
                        return T[1].replace(/\\/g, "")
                    },
                    TAG: function(U, T) {
                        for (var V = 0; T[V] === false; V++) {}
                        return T[V] && Q(T[V]) ? U[1] : U[1].toUpperCase()
                    },
                    CHILD: function(T) {
                        if (T[1] == "nth") {
                            var U = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(T[2] == "even" && "2n" || T[2] == "odd" && "2n+1" || !/\D/.test(T[2]) && "0n+" + T[2] || T[2]);
                            T[2] = (U[1] + (U[2] || 1)) - 0;
                            T[3] = U[3] - 0
                        }
                        T[0] = L++;
                        return T
                    },
                    ATTR: function(X, U, V, T, Y, Z) {
                        var W = X[1].replace(/\\/g, "");
                        if (!Z && I.attrMap[W]) {
                            X[1] = I.attrMap[W]
                        }
                        if (X[2] === "~=") {
                            X[4] = " " + X[4] + " "
                        }
                        return X
                    },
                    PSEUDO: function(X, U, V, T, Y) {
                        if (X[1] === "not") {
                            if (X[3].match(R).length > 1 || /^\w/.test(X[3])) {
                                X[3] = F(X[3], null, null, U)
                            } else {
                                var W = F.filter(X[3], U, V, true ^ Y);
                                if (!V) {
                                    T.push.apply(T, W)
                                }
                                return false
                            }
                        } else {
                            if (I.match.POS.test(X[0]) || I.match.CHILD.test(X[0])) {
                                return true
                            }
                        }
                        return X
                    },
                    POS: function(T) {
                        T.unshift(true);
                        return T
                    }
                },
                filters: {
                    enabled: function(T) {
                        return T.disabled === false && T.type !== "hidden"
                    },
                    disabled: function(T) {
                        return T.disabled === true
                    },
                    checked: function(T) {
                        return T.checked === true
                    },
                    selected: function(T) {
                        T.parentNode.selectedIndex;
                        return T.selected === true
                    },
                    parent: function(T) {
                        return !!T.firstChild
                    },
                    empty: function(T) {
                        return !T.firstChild
                    },
                    has: function(V, U, T) {
                        return !!F(T[3], V).length
                    },
                    header: function(T) {
                        return /h\d/i.test(T.nodeName)
                    },
                    text: function(T) {
                        return "text" === T.type
                    },
                    radio: function(T) {
                        return "radio" === T.type
                    },
                    checkbox: function(T) {
                        return "checkbox" === T.type
                    },
                    file: function(T) {
                        return "file" === T.type
                    },
                    password: function(T) {
                        return "password" === T.type
                    },
                    submit: function(T) {
                        return "submit" === T.type
                    },
                    image: function(T) {
                        return "image" === T.type
                    },
                    reset: function(T) {
                        return "reset" === T.type
                    },
                    button: function(T) {
                        return "button" === T.type || T.nodeName.toUpperCase() === "BUTTON"
                    },
                    input: function(T) {
                        return /input|select|textarea|button/i.test(T.nodeName)
                    }
                },
                setFilters: {
                    first: function(U, T) {
                        return T === 0
                    },
                    last: function(V, U, T, W) {
                        return U === W.length - 1
                    },
                    even: function(U, T) {
                        return T % 2 === 0
                    },
                    odd: function(U, T) {
                        return T % 2 === 1
                    },
                    lt: function(V, U, T) {
                        return U < T[3] - 0
                    },
                    gt: function(V, U, T) {
                        return U > T[3] - 0
                    },
                    nth: function(V, U, T) {
                        return T[3] - 0 == U
                    },
                    eq: function(V, U, T) {
                        return T[3] - 0 == U
                    }
                },
                filter: {
                    PSEUDO: function(Z, V, W, aa) {
                        var U = V[1],
                            X = I.filters[U];
                        if (X) {
                            return X(Z, W, V, aa)
                        } else {
                            if (U === "contains") {
                                return (Z.textContent || Z.innerText || "").indexOf(V[3]) >= 0
                            } else {
                                if (U === "not") {
                                    var Y = V[3];
                                    for (var W = 0, T = Y.length; W < T; W++) {
                                        if (Y[W] === Z) {
                                            return false
                                        }
                                    }
                                    return true
                                }
                            }
                        }
                    },
                    CHILD: function(T, W) {
                        var Z = W[1],
                            U = T;
                        switch (Z) {
                            case "only":
                            case "first":
                                while (U = U.previousSibling) {
                                    if (U.nodeType === 1) {
                                        return false
                                    }
                                }
                                if (Z == "first") {
                                    return true
                                }
                                U = T;
                            case "last":
                                while (U = U.nextSibling) {
                                    if (U.nodeType === 1) {
                                        return false
                                    }
                                }
                                return true;
                            case "nth":
                                var V = W[2],
                                    ac = W[3];
                                if (V == 1 && ac == 0) {
                                    return true
                                }
                                var Y = W[0],
                                    ab = T.parentNode;
                                if (ab && (ab.sizcache !== Y || !T.nodeIndex)) {
                                    var X = 0;
                                    for (U = ab.firstChild; U; U = U.nextSibling) {
                                        if (U.nodeType === 1) {
                                            U.nodeIndex = ++X
                                        }
                                    }
                                    ab.sizcache = Y
                                }
                                var aa = T.nodeIndex - ac;
                                if (V == 0) {
                                    return aa == 0
                                } else {
                                    return (aa % V == 0 && aa / V >= 0)
                                }
                        }
                    },
                    ID: function(U, T) {
                        return U.nodeType === 1 && U.getAttribute("id") === T
                    },
                    TAG: function(U, T) {
                        return (T === "*" && U.nodeType === 1) || U.nodeName === T
                    },
                    CLASS: function(U, T) {
                        return (" " + (U.className || U.getAttribute("class")) + " ").indexOf(T) > -1
                    },
                    ATTR: function(Y, W) {
                        var V = W[1],
                            T = I.attrHandle[V] ? I.attrHandle[V](Y) : Y[V] != null ? Y[V] : Y.getAttribute(V),
                            Z = T + "",
                            X = W[2],
                            U = W[4];
                        return T == null ? X === "!=" : X === "=" ? Z === U : X === "*=" ? Z.indexOf(U) >= 0 : X === "~=" ? (" " + Z + " ").indexOf(U) >= 0 : !U ? Z && T !== false : X === "!=" ? Z != U : X === "^=" ? Z.indexOf(U) === 0 : X === "$=" ? Z.substr(Z.length - U.length) === U : X === "|=" ? Z === U || Z.substr(0, U.length + 1) === U + "-" : false
                    },
                    POS: function(X, U, V, Y) {
                        var T = U[2],
                            W = I.setFilters[T];
                        if (W) {
                            return W(X, V, U, Y)
                        }
                    }
                }
            };
            var M = I.match.POS;
            for (var O in I.match) {
                I.match[O] = RegExp(I.match[O].source + /(?![^\[]*\])(?![^\(]*\))/.source)
            }
            var E = function(U, T) {
                U = Array.prototype.slice.call(U);
                if (T) {
                    T.push.apply(T, U);
                    return T
                }
                return U
            };
            try {
                Array.prototype.slice.call(document.documentElement.childNodes)
            } catch (N) {
                E = function(X, W) {
                    var U = W || [];
                    if (H.call(X) === "[object Array]") {
                        Array.prototype.push.apply(U, X)
                    } else {
                        if (typeof X.length === "number") {
                            for (var V = 0, T = X.length; V < T; V++) {
                                U.push(X[V])
                            }
                        } else {
                            for (var V = 0; X[V]; V++) {
                                U.push(X[V])
                            }
                        }
                    }
                    return U
                }
            }
            var G;
            if (document.documentElement.compareDocumentPosition) {
                G = function(U, T) {
                    var V = U.compareDocumentPosition(T) & 4 ? -1 : U === T ? 0 : 1;
                    if (V === 0) {
                        hasDuplicate = true
                    }
                    return V
                }
            } else {
                if ("sourceIndex" in document.documentElement) {
                    G = function(U, T) {
                        var V = U.sourceIndex - T.sourceIndex;
                        if (V === 0) {
                            hasDuplicate = true
                        }
                        return V
                    }
                } else {
                    if (document.createRange) {
                        G = function(W, U) {
                            var V = W.ownerDocument.createRange(),
                                T = U.ownerDocument.createRange();
                            V.selectNode(W);
                            V.collapse(true);
                            T.selectNode(U);
                            T.collapse(true);
                            var X = V.compareBoundaryPoints(Range.START_TO_END, T);
                            if (X === 0) {
                                hasDuplicate = true
                            }
                            return X
                        }
                    }
                }
            }(function() {
                var U = document.createElement("form"),
                    V = "script" + (new Date).getTime();
                U.innerHTML = "<input name='" + V + "'/>";
                var T = document.documentElement;
                T.insertBefore(U, T.firstChild);
                if (!!document.getElementById(V)) {
                    I.find.ID = function(X, Y, Z) {
                        if (typeof Y.getElementById !== "undefined" && !Z) {
                            var W = Y.getElementById(X[1]);
                            return W ? W.id === X[1] || typeof W.getAttributeNode !== "undefined" && W.getAttributeNode("id").nodeValue === X[1] ? [W] : g : []
                        }
                    };
                    I.filter.ID = function(Y, W) {
                        var X = typeof Y.getAttributeNode !== "undefined" && Y.getAttributeNode("id");
                        return Y.nodeType === 1 && X && X.nodeValue === W
                    }
                }
                T.removeChild(U)
            })();
            (function() {
                var T = document.createElement("div");
                T.appendChild(document.createComment(""));
                if (T.getElementsByTagName("*").length > 0) {
                    I.find.TAG = function(U, Y) {
                        var X = Y.getElementsByTagName(U[1]);
                        if (U[1] === "*") {
                            var W = [];
                            for (var V = 0; X[V]; V++) {
                                if (X[V].nodeType === 1) {
                                    W.push(X[V])
                                }
                            }
                            X = W
                        }
                        return X
                    }
                }
                T.innerHTML = "<a href='#'></a>";
                if (T.firstChild && typeof T.firstChild.getAttribute !== "undefined" && T.firstChild.getAttribute("href") !== "#") {
                    I.attrHandle.href = function(U) {
                        return U.getAttribute("href", 2)
                    }
                }
            })();
            if (document.querySelectorAll) {
                (function() {
                    var T = F,
                        U = document.createElement("div");
                    U.innerHTML = "<p class='TEST'></p>";
                    if (U.querySelectorAll && U.querySelectorAll(".TEST").length === 0) {
                        return
                    }
                    F = function(Y, X, V, W) {
                        X = X || document;
                        if (!W && X.nodeType === 9 && !Q(X)) {
                            try {
                                return E(X.querySelectorAll(Y), V)
                            } catch (Z) {}
                        }
                        return T(Y, X, V, W)
                    };
                    F.find = T.find;
                    F.filter = T.filter;
                    F.selectors = T.selectors;
                    F.matches = T.matches
                })()
            }
            if (document.getElementsByClassName && document.documentElement.getElementsByClassName) {
                (function() {
                    var T = document.createElement("div");
                    T.innerHTML = "<div class='test e'></div><div class='test'></div>";
                    if (T.getElementsByClassName("e").length === 0) {
                        return
                    }
                    T.lastChild.className = "e";
                    if (T.getElementsByClassName("e").length === 1) {
                        return
                    }
                    I.order.splice(1, 0, "CLASS");
                    I.find.CLASS = function(U, V, W) {
                        if (typeof V.getElementsByClassName !== "undefined" && !W) {
                            return V.getElementsByClassName(U[1])
                        }
                    }
                })()
            }

            function P(U, Z, Y, ad, aa, ac) {
                var ab = U == "previousSibling" && !ac;
                for (var W = 0, V = ad.length; W < V; W++) {
                    var T = ad[W];
                    if (T) {
                        if (ab && T.nodeType === 1) {
                            T.sizcache = Y;
                            T.sizset = W
                        }
                        T = T[U];
                        var X = false;
                        while (T) {
                            if (T.sizcache === Y) {
                                X = ad[T.sizset];
                                break
                            }
                            if (T.nodeType === 1 && !ac) {
                                T.sizcache = Y;
                                T.sizset = W
                            }
                            if (T.nodeName === Z) {
                                X = T;
                                break
                            }
                            T = T[U]
                        }
                        ad[W] = X
                    }
                }
            }

            function S(U, Z, Y, ad, aa, ac) {
                var ab = U == "previousSibling" && !ac;
                for (var W = 0, V = ad.length; W < V; W++) {
                    var T = ad[W];
                    if (T) {
                        if (ab && T.nodeType === 1) {
                            T.sizcache = Y;
                            T.sizset = W
                        }
                        T = T[U];
                        var X = false;
                        while (T) {
                            if (T.sizcache === Y) {
                                X = ad[T.sizset];
                                break
                            }
                            if (T.nodeType === 1) {
                                if (!ac) {
                                    T.sizcache = Y;
                                    T.sizset = W
                                }
                                if (typeof Z !== "string") {
                                    if (T === Z) {
                                        X = true;
                                        break
                                    }
                                } else {
                                    if (F.filter(Z, [T]).length > 0) {
                                        X = T;
                                        break
                                    }
                                }
                            }
                            T = T[U]
                        }
                        ad[W] = X
                    }
                }
            }
            var K = document.compareDocumentPosition ? function(U, T) {
                return U.compareDocumentPosition(T) & 16
            } : function(U, T) {
                return U !== T && (U.contains ? U.contains(T) : true)
            };
            var Q = function(T) {
                return T.nodeType === 9 && T.documentElement.nodeName !== "HTML" || !!T.ownerDocument && Q(T.ownerDocument)
            };
            var J = function(T, aa) {
                var W = [],
                    X = "",
                    Y, V = aa.nodeType ? [aa] : aa;
                while ((Y = I.match.PSEUDO.exec(T))) {
                    X += Y[0];
                    T = T.replace(I.match.PSEUDO, "")
                }
                T = I.relative[T] ? T + "*" : T;
                for (var Z = 0, U = V.length; Z < U; Z++) {
                    F(T, V[Z], W)
                }
                return F.filter(X, W)
            };
            o.find = F;
            o.filter = F.filter;
            o.expr = F.selectors;
            o.expr[":"] = o.expr.filters;
            F.selectors.filters.hidden = function(T) {
                return T.offsetWidth === 0 || T.offsetHeight === 0
            };
            F.selectors.filters.visible = function(T) {
                return T.offsetWidth > 0 || T.offsetHeight > 0
            };
            F.selectors.filters.animated = function(T) {
                return o.grep(o.timers, function(U) {
                    return T === U.elem
                }).length
            };
            o.multiFilter = function(V, T, U) {
                if (U) {
                    V = ":not(" + V + ")"
                }
                return F.matches(V, T)
            };
            o.dir = function(V, U) {
                var T = [],
                    W = V[U];
                while (W && W != document) {
                    if (W.nodeType == 1) {
                        T.push(W)
                    }
                    W = W[U]
                }
                return T
            };
            o.nth = function(X, T, V, W) {
                T = T || 1;
                var U = 0;
                for (; X; X = X[V]) {
                    if (X.nodeType == 1 && ++U == T) {
                        break
                    }
                }
                return X
            };
            o.sibling = function(V, U) {
                var T = [];
                for (; V; V = V.nextSibling) {
                    if (V.nodeType == 1 && V != U) {
                        T.push(V)
                    }
                }
                return T
            };
            return;
            l.Sizzle = F
        })();
        o.event = {
            add: function(I, F, H, K) {
                if (I.nodeType == 3 || I.nodeType == 8) {
                    return
                }
                if (I.setInterval && I != l) {
                    I = l
                }
                if (!H.guid) {
                    H.guid = this.guid++
                }
                if (K !== g) {
                    var G = H;
                    H = this.proxy(G);
                    H.data = K
                }
                var E = o.data(I, "events") || o.data(I, "events", {}),
                    J = o.data(I, "handle") || o.data(I, "handle", function() {
                        return typeof o !== "undefined" && !o.event.triggered ? o.event.handle.apply(arguments.callee.elem, arguments) : g
                    });
                J.elem = I;
                o.each(F.split(/\s+/), function(M, N) {
                    var O = N.split(".");
                    N = O.shift();
                    H.type = O.slice().sort().join(".");
                    var L = E[N];
                    if (o.event.specialAll[N]) {
                        o.event.specialAll[N].setup.call(I, K, O)
                    }
                    if (!L) {
                        L = E[N] = {};
                        if (!o.event.special[N] || o.event.special[N].setup.call(I, K, O) === false) {
                            if (I.addEventListener) {
                                I.addEventListener(N, J, false)
                            } else {
                                if (I.attachEvent) {
                                    I.attachEvent("on" + N, J)
                                }
                            }
                        }
                    }
                    L[H.guid] = H;
                    o.event.global[N] = true
                });
                I = null
            },
            guid: 1,
            global: {},
            remove: function(K, H, J) {
                if (K.nodeType == 3 || K.nodeType == 8) {
                    return
                }
                var G = o.data(K, "events"),
                    F, E;
                if (G) {
                    if (H === g || (typeof H === "string" && H.charAt(0) == ".")) {
                        for (var I in G) {
                            this.remove(K, I + (H || ""))
                        }
                    } else {
                        if (H.type) {
                            J = H.handler;
                            H = H.type
                        }
                        o.each(H.split(/\s+/), function(M, O) {
                            var Q = O.split(".");
                            O = Q.shift();
                            var N = RegExp("(^|\\.)" + Q.slice().sort().join(".*\\.") + "(\\.|$)");
                            if (G[O]) {
                                if (J) {
                                    delete G[O][J.guid]
                                } else {
                                    for (var P in G[O]) {
                                        if (N.test(G[O][P].type)) {
                                            delete G[O][P]
                                        }
                                    }
                                }
                                if (o.event.specialAll[O]) {
                                    o.event.specialAll[O].teardown.call(K, Q)
                                }
                                for (F in G[O]) {
                                    break
                                }
                                if (!F) {
                                    if (!o.event.special[O] || o.event.special[O].teardown.call(K, Q) === false) {
                                        if (K.removeEventListener) {
                                            K.removeEventListener(O, o.data(K, "handle"), false)
                                        } else {
                                            if (K.detachEvent) {
                                                K.detachEvent("on" + O, o.data(K, "handle"))
                                            }
                                        }
                                    }
                                    F = null;
                                    delete G[O]
                                }
                            }
                        })
                    }
                    for (F in G) {
                        break
                    }
                    if (!F) {
                        var L = o.data(K, "handle");
                        if (L) {
                            L.elem = null
                        }
                        o.removeData(K, "events");
                        o.removeData(K, "handle")
                    }
                }
            },
            trigger: function(I, K, H, E) {
                var G = I.type || I;
                if (!E) {
                    I = typeof I === "object" ? I[h] ? I : o.extend(o.Event(G), I) : o.Event(G);
                    if (G.indexOf("!") >= 0) {
                        I.type = G = G.slice(0, -1);
                        I.exclusive = true
                    }
                    if (!H) {
                        I.stopPropagation();
                        if (this.global[G]) {
                            o.each(o.cache, function() {
                                if (this.events && this.events[G]) {
                                    o.event.trigger(I, K, this.handle.elem)
                                }
                            })
                        }
                    }
                    if (!H || H.nodeType == 3 || H.nodeType == 8) {
                        return g
                    }
                    I.result = g;
                    I.target = H;
                    K = o.makeArray(K);
                    K.unshift(I)
                }
                I.currentTarget = H;
                var J = o.data(H, "handle");
                if (J) {
                    J.apply(H, K)
                }
                if ((!H[G] || (o.nodeName(H, "a") && G == "click")) && H["on" + G] && H["on" + G].apply(H, K) === false) {
                    I.result = false
                }
                if (!E && H[G] && !I.isDefaultPrevented() && !(o.nodeName(H, "a") && G == "click")) {
                    this.triggered = true;
                    try {
                        H[G]()
                    } catch (L) {}
                }
                this.triggered = false;
                if (!I.isPropagationStopped()) {
                    var F = H.parentNode || H.ownerDocument;
                    if (F) {
                        o.event.trigger(I, K, F, true)
                    }
                }
            },
            handle: function(K) {
                var J, E;
                K = arguments[0] = o.event.fix(K || l.event);
                K.currentTarget = this;
                var L = K.type.split(".");
                K.type = L.shift();
                J = !L.length && !K.exclusive;
                var I = RegExp("(^|\\.)" + L.slice().sort().join(".*\\.") + "(\\.|$)");
                E = (o.data(this, "events") || {})[K.type];
                for (var G in E) {
                    var H = E[G];
                    if (J || I.test(H.type)) {
                        K.handler = H;
                        K.data = H.data;
                        var F = H.apply(this, arguments);
                        if (F !== g) {
                            K.result = F;
                            if (F === false) {
                                K.preventDefault();
                                K.stopPropagation()
                            }
                        }
                        if (K.isImmediatePropagationStopped()) {
                            break
                        }
                    }
                }
            },
            props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
            fix: function(H) {
                if (H[h]) {
                    return H
                }
                var F = H;
                H = o.Event(F);
                for (var G = this.props.length, J; G;) {
                    J = this.props[--G];
                    H[J] = F[J]
                }
                if (!H.target) {
                    H.target = H.srcElement || document
                }
                if (H.target.nodeType == 3) {
                    H.target = H.target.parentNode
                }
                if (!H.relatedTarget && H.fromElement) {
                    H.relatedTarget = H.fromElement == H.target ? H.toElement : H.fromElement
                }
                if (H.pageX == null && H.clientX != null) {
                    var I = document.documentElement,
                        E = document.body;
                    H.pageX = H.clientX + (I && I.scrollLeft || E && E.scrollLeft || 0) - (I.clientLeft || 0);
                    H.pageY = H.clientY + (I && I.scrollTop || E && E.scrollTop || 0) - (I.clientTop || 0)
                }
                if (!H.which && ((H.charCode || H.charCode === 0) ? H.charCode : H.keyCode)) {
                    H.which = H.charCode || H.keyCode
                }
                if (!H.metaKey && H.ctrlKey) {
                    H.metaKey = H.ctrlKey
                }
                if (!H.which && H.button) {
                    H.which = (H.button & 1 ? 1 : (H.button & 2 ? 3 : (H.button & 4 ? 2 : 0)))
                }
                return H
            },
            proxy: function(F, E) {
                E = E || function() {
                    return F.apply(this, arguments)
                };
                E.guid = F.guid = F.guid || E.guid || this.guid++;
                return E
            },
            special: {
                ready: {
                    setup: B,
                    teardown: function() {}
                }
            },
            specialAll: {
                live: {
                    setup: function(E, F) {
                        o.event.add(this, F[0], c)
                    },
                    teardown: function(G) {
                        if (G.length) {
                            var E = 0,
                                F = RegExp("(^|\\.)" + G[0] + "(\\.|$)");
                            o.each((o.data(this, "events").live || {}), function() {
                                if (F.test(this.type)) {
                                    E++
                                }
                            });
                            if (E < 1) {
                                o.event.remove(this, G[0], c)
                            }
                        }
                    }
                }
            }
        };
        o.Event = function(E) {
            if (!this.preventDefault) {
                return new o.Event(E)
            }
            if (E && E.type) {
                this.originalEvent = E;
                this.type = E.type
            } else {
                this.type = E
            }
            this.timeStamp = e();
            this[h] = true
        };

        function k() {
            return false
        }

        function u() {
            return true
        }
        o.Event.prototype = {
            preventDefault: function() {
                this.isDefaultPrevented = u;
                var E = this.originalEvent;
                if (!E) {
                    return
                }
                if (E.preventDefault) {
                    E.preventDefault()
                }
                E.returnValue = false
            },
            stopPropagation: function() {
                this.isPropagationStopped = u;
                var E = this.originalEvent;
                if (!E) {
                    return
                }
                if (E.stopPropagation) {
                    E.stopPropagation()
                }
                E.cancelBubble = true
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = u;
                this.stopPropagation()
            },
            isDefaultPrevented: k,
            isPropagationStopped: k,
            isImmediatePropagationStopped: k
        };
        var a = function(F) {
            var E = F.relatedTarget;
            while (E && E != this) {
                try {
                    E = E.parentNode
                } catch (G) {
                    E = this
                }
            }
            if (E != this) {
                F.type = F.data;
                o.event.handle.apply(this, arguments)
            }
        };
        o.each({
            mouseover: "mouseenter",
            mouseout: "mouseleave"
        }, function(F, E) {
            o.event.special[E] = {
                setup: function() {
                    o.event.add(this, F, a, E)
                },
                teardown: function() {
                    o.event.remove(this, F, a)
                }
            }
        });
        o.fn.extend({
            bind: function(F, G, E) {
                return F == "unload" ? this.one(F, G, E) : this.each(function() {
                    o.event.add(this, F, E || G, E && G)
                })
            },
            one: function(G, H, F) {
                var E = o.event.proxy(F || H, function(I) {
                    o(this).unbind(I, E);
                    return (F || H).apply(this, arguments)
                });
                return this.each(function() {
                    o.event.add(this, G, E, F && H)
                })
            },
            unbind: function(F, E) {
                return this.each(function() {
                    o.event.remove(this, F, E)
                })
            },
            trigger: function(E, F) {
                return this.each(function() {
                    o.event.trigger(E, F, this)
                })
            },
            triggerHandler: function(E, G) {
                if (this[0]) {
                    var F = o.Event(E);
                    F.preventDefault();
                    F.stopPropagation();
                    o.event.trigger(F, G, this[0]);
                    return F.result
                }
            },
            toggle: function(G) {
                var E = arguments,
                    F = 1;
                while (F < E.length) {
                    o.event.proxy(G, E[F++])
                }
                return this.click(o.event.proxy(G, function(H) {
                    this.lastToggle = (this.lastToggle || 0) % F;
                    H.preventDefault();
                    return E[this.lastToggle++].apply(this, arguments) || false
                }))
            },
            hover: function(E, F) {
                return this.mouseenter(E).mouseleave(F)
            },
            ready: function(E) {
                B();
                if (o.isReady) {
                    E.call(document, o)
                } else {
                    o.readyList.push(E)
                }
                return this
            },
            live: function(G, F) {
                var E = o.event.proxy(F);
                E.guid += this.selector + G;
                o(document).bind(i(G, this.selector), this.selector, E);
                return this
            },
            die: function(F, E) {
                o(document).unbind(i(F, this.selector), E ? {
                    guid: E.guid + this.selector + F
                } : null);
                return this
            }
        });

        function c(H) {
            var E = RegExp("(^|\\.)" + H.type + "(\\.|$)"),
                G = true,
                F = [];
            o.each(o.data(this, "events").live || [], function(I, J) {
                if (E.test(J.type)) {
                    var K = o(H.target).closest(J.data)[0];
                    if (K) {
                        F.push({
                            elem: K,
                            fn: J
                        })
                    }
                }
            });
            F.sort(function(J, I) {
                return o.data(J.elem, "closest") - o.data(I.elem, "closest")
            });
            o.each(F, function() {
                if (this.fn.call(this.elem, H, this.fn.data) === false) {
                    return (G = false)
                }
            });
            return G
        }

        function i(F, E) {
            return ["live", F, E.replace(/\./g, "`").replace(/ /g, "|")].join(".")
        }
        o.extend({
            isReady: false,
            readyList: [],
            ready: function() {
                if (!o.isReady) {
                    o.isReady = true;
                    if (o.readyList) {
                        o.each(o.readyList, function() {
                            this.call(document, o)
                        });
                        o.readyList = null
                    }
                    o(document).triggerHandler("ready")
                }
            }
        });
        var x = false;

        function B() {
            if (x) {
                return
            }
            x = true;
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function() {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    o.ready()
                }, false)
            } else {
                if (document.attachEvent) {
                    document.attachEvent("onreadystatechange", function() {
                        if (document.readyState === "complete") {
                            document.detachEvent("onreadystatechange", arguments.callee);
                            o.ready()
                        }
                    });
                    if (document.documentElement.doScroll && l == l.top) {
                        (function() {
                            if (o.isReady) {
                                return
                            }
                            try {
                                document.documentElement.doScroll("left")
                            } catch (E) {
                                setTimeout(arguments.callee, 0);
                                return
                            }
                            o.ready()
                        })()
                    }
                }
            }
            o.event.add(l, "load", o.ready)
        }
        o.each(("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error").split(","), function(F, E) {
            o.fn[E] = function(G) {
                return G ? this.bind(E, G) : this.trigger(E)
            }
        });
        o(l).bind("unload", function() {
            for (var E in o.cache) {
                if (E != 1 && o.cache[E].handle) {
                    o.event.remove(o.cache[E].handle.elem)
                }
            }
        });
        (function() {
            o.support = {};
            var F = document.documentElement,
                G = document.createElement("script"),
                K = document.createElement("div"),
                J = "script" + (new Date).getTime();
            K.style.display = "none";
            K.innerHTML = '   <link/><table></table><a href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select><object><param/></object>';
            var H = K.getElementsByTagName("*"),
                E = K.getElementsByTagName("a")[0];
            if (!H || !H.length || !E) {
                return
            }
            o.support = {
                leadingWhitespace: K.firstChild.nodeType == 3,
                tbody: !K.getElementsByTagName("tbody").length,
                objectAll: !!K.getElementsByTagName("object")[0].getElementsByTagName("*").length,
                htmlSerialize: !!K.getElementsByTagName("link").length,
                style: /red/.test(E.getAttribute("style")),
                hrefNormalized: E.getAttribute("href") === "/a",
                opacity: E.style.opacity === "0.5",
                cssFloat: !!E.style.cssFloat,
                scriptEval: false,
                noCloneEvent: true,
                boxModel: null
            };
            G.type = "text/javascript";
            try {
                G.appendChild(document.createTextNode("window." + J + "=1;"))
            } catch (I) {}
            F.insertBefore(G, F.firstChild);
            if (l[J]) {
                o.support.scriptEval = true;
                delete l[J]
            }
            F.removeChild(G);
            if (K.attachEvent && K.fireEvent) {
                K.attachEvent("onclick", function() {
                    o.support.noCloneEvent = false;
                    K.detachEvent("onclick", arguments.callee)
                });
                K.cloneNode(true).fireEvent("onclick")
            }
            o(function() {
                var L = document.createElement("div");
                L.style.width = L.style.paddingLeft = "1px";
                document.body.appendChild(L);
                o.boxModel = o.support.boxModel = L.offsetWidth === 2;
                document.body.removeChild(L).style.display = "none"
            })
        })();
        var w = o.support.cssFloat ? "cssFloat" : "styleFloat";
        o.props = {
            "for": "htmlFor",
            "class": "className",
            "float": w,
            cssFloat: w,
            styleFloat: w,
            readonly: "readOnly",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            rowspan: "rowSpan",
            tabindex: "tabIndex"
        };
        o.fn.extend({
            _load: o.fn.load,
            load: function(G, J, K) {
                if (typeof G !== "string") {
                    return this._load(G)
                }
                var I = G.indexOf(" ");
                if (I >= 0) {
                    var E = G.slice(I, G.length);
                    G = G.slice(0, I)
                }
                var H = "GET";
                if (J) {
                    if (o.isFunction(J)) {
                        K = J;
                        J = null
                    } else {
                        if (typeof J === "object") {
                            J = o.param(J);
                            H = "POST"
                        }
                    }
                }
                var F = this;
                o.ajax({
                    url: G,
                    type: H,
                    dataType: "html",
                    data: J,
                    complete: function(M, L) {
                        if (L == "success" || L == "notmodified") {
                            F.html(E ? o("<div/>").append(M.responseText.replace(/<script(.|\s)*?\/script>/g, "")).find(E) : M.responseText)
                        }
                        if (K) {
                            F.each(K, [M.responseText, L, M])
                        }
                    }
                });
                return this
            },
            serialize: function() {
                return o.param(this.serializeArray())
            },
            serializeArray: function() {
                return this.map(function() {
                    return this.elements ? o.makeArray(this.elements) : this
                }).filter(function() {
                    return this.name && !this.disabled && (this.checked || /select|textarea/i.test(this.nodeName) || /text|hidden|password|search/i.test(this.type))
                }).map(function(E, F) {
                    var G = o(this).val();
                    return G == null ? null : o.isArray(G) ? o.map(G, function(I, H) {
                        return {
                            name: F.name,
                            value: I
                        }
                    }) : {
                        name: F.name,
                        value: G
                    }
                }).get()
            }
        });
        o.each("ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","), function(E, F) {
            o.fn[F] = function(G) {
                return this.bind(F, G)
            }
        });
        var r = e();
        o.extend({
            get: function(E, G, H, F) {
                if (o.isFunction(G)) {
                    H = G;
                    G = null
                }
                return o.ajax({
                    type: "GET",
                    url: E,
                    data: G,
                    success: H,
                    dataType: F
                })
            },
            getScript: function(E, F) {
                return o.get(E, null, F, "script")
            },
            getJSON: function(E, F, G) {
                return o.get(E, F, G, "json")
            },
            post: function(E, G, H, F) {
                if (o.isFunction(G)) {
                    H = G;
                    G = {}
                }
                return o.ajax({
                    type: "POST",
                    url: E,
                    data: G,
                    success: H,
                    dataType: F
                })
            },
            ajaxSetup: function(E) {
                o.extend(o.ajaxSettings, E)
            },
            ajaxSettings: {
                url: location.href,
                global: true,
                type: "GET",
                contentType: "application/x-www-form-urlencoded",
                processData: true,
                async: true,
                xhr: function() {
                    return l.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest()
                },
                accepts: {
                    xml: "application/xml, text/xml",
                    html: "text/html",
                    script: "text/javascript, application/javascript",
                    json: "application/json, text/javascript",
                    text: "text/plain",
                    _default: "*/*"
                }
            },
            lastModified: {},
            ajax: function(M) {
                M = o.extend(true, M, o.extend(true, {}, o.ajaxSettings, M));
                var W, F = /=\?(&|$)/g,
                    R, V, G = M.type.toUpperCase();
                if (M.data && M.processData && typeof M.data !== "string") {
                    M.data = o.param(M.data)
                }
                if (M.dataType == "jsonp") {
                    if (G == "GET") {
                        if (!M.url.match(F)) {
                            M.url += (M.url.match(/\?/) ? "&" : "?") + (M.jsonp || "callback") + "=?"
                        }
                    } else {
                        if (!M.data || !M.data.match(F)) {
                            M.data = (M.data ? M.data + "&" : "") + (M.jsonp || "callback") + "=?"
                        }
                    }
                    M.dataType = "json"
                }
                if (M.dataType == "json" && (M.data && M.data.match(F) || M.url.match(F))) {
                    W = "jsonp" + r++;
                    if (M.data) {
                        M.data = (M.data + "").replace(F, "=" + W + "$1")
                    }
                    M.url = M.url.replace(F, "=" + W + "$1");
                    M.dataType = "script";
                    l[W] = function(X) {
                        V = X;
                        I();
                        L();
                        l[W] = g;
                        try {
                            delete l[W]
                        } catch (Y) {}
                        if (H) {
                            H.removeChild(T)
                        }
                    }
                }
                if (M.dataType == "script" && M.cache == null) {
                    M.cache = false
                }
                if (M.cache === false && G == "GET") {
                    var E = e();
                    var U = M.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + E + "$2");
                    M.url = U + ((U == M.url) ? (M.url.match(/\?/) ? "&" : "?") + "_=" + E : "")
                }
                if (M.data && G == "GET") {
                    M.url += (M.url.match(/\?/) ? "&" : "?") + M.data;
                    M.data = null
                }
                if (M.global && !o.active++) {
                    o.event.trigger("ajaxStart")
                }
                var Q = /^(\w+:)?\/\/([^\/?#]+)/.exec(M.url);
                if (M.dataType == "script" && G == "GET" && Q && (Q[1] && Q[1] != location.protocol || Q[2] != location.host)) {
                    var H = document.getElementsByTagName("head")[0];
                    var T = document.createElement("script");
                    T.src = M.url;
                    if (M.scriptCharset) {
                        T.charset = M.scriptCharset
                    }
                    if (!W) {
                        var O = false;
                        T.onload = T.onreadystatechange = function() {
                            if (!O && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                                O = true;
                                I();
                                L();
                                T.onload = T.onreadystatechange = null;
                                H.removeChild(T)
                            }
                        }
                    }
                    H.appendChild(T);
                    return g
                }
                var K = false;
                var J = M.xhr();
                if (M.username) {
                    J.open(G, M.url, M.async, M.username, M.password)
                } else {
                    J.open(G, M.url, M.async)
                }
                try {
                    if (M.data) {
                        J.setRequestHeader("Content-Type", M.contentType)
                    }
                    if (M.ifModified) {
                        J.setRequestHeader("If-Modified-Since", o.lastModified[M.url] || "Thu, 01 Jan 1970 00:00:00 GMT")
                    }
                    J.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    J.setRequestHeader("Accept", M.dataType && M.accepts[M.dataType] ? M.accepts[M.dataType] + ", */*" : M.accepts._default)
                } catch (S) {}
                if (M.beforeSend && M.beforeSend(J, M) === false) {
                    if (M.global && !--o.active) {
                        o.event.trigger("ajaxStop")
                    }
                    J.abort();
                    return false
                }
                if (M.global) {
                    o.event.trigger("ajaxSend", [J, M])
                }
                var N = function(X) {
                    if (J.readyState == 0) {
                        if (P) {
                            clearInterval(P);
                            P = null;
                            if (M.global && !--o.active) {
                                o.event.trigger("ajaxStop")
                            }
                        }
                    } else {
                        if (!K && J && (J.readyState == 4 || X == "timeout")) {
                            K = true;
                            if (P) {
                                clearInterval(P);
                                P = null
                            }
                            R = X == "timeout" ? "timeout" : !o.httpSuccess(J) ? "error" : M.ifModified && o.httpNotModified(J, M.url) ? "notmodified" : "success";
                            if (R == "success") {
                                try {
                                    V = o.httpData(J, M.dataType, M)
                                } catch (Z) {
                                    R = "parsererror"
                                }
                            }
                            if (R == "success") {
                                var Y;
                                try {
                                    Y = J.getResponseHeader("Last-Modified")
                                } catch (Z) {}
                                if (M.ifModified && Y) {
                                    o.lastModified[M.url] = Y
                                }
                                if (!W) {
                                    I()
                                }
                            } else {
                                o.handleError(M, J, R)
                            }
                            L();
                            if (X) {
                                J.abort()
                            }
                            if (M.async) {
                                J = null
                            }
                        }
                    }
                };
                if (M.async) {
                    var P = setInterval(N, 13);
                    if (M.timeout > 0) {
                        setTimeout(function() {
                            if (J && !K) {
                                N("timeout")
                            }
                        }, M.timeout)
                    }
                }
                try {
                    J.send(M.data)
                } catch (S) {
                    o.handleError(M, J, null, S)
                }
                if (!M.async) {
                    N()
                }

                function I() {
                    if (M.success) {
                        M.success(V, R)
                    }
                    if (M.global) {
                        o.event.trigger("ajaxSuccess", [J, M])
                    }
                }

                function L() {
                    if (M.complete) {
                        M.complete(J, R)
                    }
                    if (M.global) {
                        o.event.trigger("ajaxComplete", [J, M])
                    }
                    if (M.global && !--o.active) {
                        o.event.trigger("ajaxStop")
                    }
                }
                return J
            },
            handleError: function(F, H, E, G) {
                if (F.error) {
                    F.error(H, E, G)
                }
                if (F.global) {
                    o.event.trigger("ajaxError", [H, F, G])
                }
            },
            active: 0,
            httpSuccess: function(F) {
                try {
                    return !F.status && location.protocol == "file:" || (F.status >= 200 && F.status < 300) || F.status == 304 || F.status == 1223
                } catch (E) {}
                return false
            },
            httpNotModified: function(G, E) {
                try {
                    var H = G.getResponseHeader("Last-Modified");
                    return G.status == 304 || H == o.lastModified[E]
                } catch (F) {}
                return false
            },
            httpData: function(J, H, G) {
                var F = J.getResponseHeader("content-type"),
                    E = H == "xml" || !H && F && F.indexOf("xml") >= 0,
                    I = E ? J.responseXML : J.responseText;
                if (E && I.documentElement.tagName == "parsererror") {
                    throw "parsererror"
                }
                if (G && G.dataFilter) {
                    I = G.dataFilter(I, H)
                }
                if (typeof I === "string") {
                    if (H == "script") {
                        o.globalEval(I)
                    }
                    if (H == "json") {
                        I = l["eval"]("(" + I + ")")
                    }
                }
                return I
            },
            param: function(E) {
                var G = [];

                function H(I, J) {
                    G[G.length] = encodeURIComponent(I) + "=" + encodeURIComponent(J)
                }
                if (o.isArray(E) || E.jquery) {
                    o.each(E, function() {
                        H(this.name, this.value)
                    })
                } else {
                    for (var F in E) {
                        if (o.isArray(E[F])) {
                            o.each(E[F], function() {
                                H(F, this)
                            })
                        } else {
                            H(F, o.isFunction(E[F]) ? E[F]() : E[F])
                        }
                    }
                }
                return G.join("&").replace(/%20/g, "+")
            }
        });
        var m = {},
            n, d = [
                ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
                ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
                ["opacity"]
            ];

        function t(F, E) {
            var G = {};
            o.each(d.concat.apply([], d.slice(0, E)), function() {
                G[this] = F
            });
            return G
        }
        o.fn.extend({
            show: function(J, L) {
                if (J) {
                    return this.animate(t("show", 3), J, L)
                } else {
                    for (var H = 0, F = this.length; H < F; H++) {
                        var E = o.data(this[H], "olddisplay");
                        this[H].style.display = E || "";
                        if (o.css(this[H], "display") === "none") {
                            var G = this[H].tagName,
                                K;
                            if (m[G]) {
                                K = m[G]
                            } else {
                                var I = o("<" + G + " />").appendTo("body");
                                K = I.css("display");
                                if (K === "none") {
                                    K = "block"
                                }
                                I.remove();
                                m[G] = K
                            }
                            o.data(this[H], "olddisplay", K)
                        }
                    }
                    for (var H = 0, F = this.length; H < F; H++) {
                        this[H].style.display = o.data(this[H], "olddisplay") || ""
                    }
                    return this
                }
            },
            hide: function(H, I) {
                if (H) {
                    return this.animate(t("hide", 3), H, I)
                } else {
                    for (var G = 0, F = this.length; G < F; G++) {
                        var E = o.data(this[G], "olddisplay");
                        if (!E && E !== "none") {
                            o.data(this[G], "olddisplay", o.css(this[G], "display"))
                        }
                    }
                    for (var G = 0, F = this.length; G < F; G++) {
                        this[G].style.display = "none"
                    }
                    return this
                }
            },
            _toggle: o.fn.toggle,
            toggle: function(G, F) {
                var E = typeof G === "boolean";
                return o.isFunction(G) && o.isFunction(F) ? this._toggle.apply(this, arguments) : G == null || E ? this.each(function() {
                    var H = E ? G : o(this).is(":hidden");
                    o(this)[H ? "show" : "hide"]()
                }) : this.animate(t("toggle", 3), G, F)
            },
            fadeTo: function(E, G, F) {
                return this.animate({
                    opacity: G
                }, E, F)
            },
            animate: function(I, F, H, G) {
                var E = o.speed(F, H, G);
                return this[E.queue === false ? "each" : "queue"](function() {
                    var K = o.extend({}, E),
                        M, L = this.nodeType == 1 && o(this).is(":hidden"),
                        J = this;
                    for (M in I) {
                        if (I[M] == "hide" && L || I[M] == "show" && !L) {
                            return K.complete.call(this)
                        }
                        if ((M == "height" || M == "width") && this.style) {
                            K.display = o.css(this, "display");
                            K.overflow = this.style.overflow
                        }
                    }
                    if (K.overflow != null) {
                        this.style.overflow = "hidden"
                    }
                    K.curAnim = o.extend({}, I);
                    o.each(I, function(O, S) {
                        var R = new o.fx(J, K, O);
                        if (/toggle|show|hide/.test(S)) {
                            R[S == "toggle" ? L ? "show" : "hide" : S](I)
                        } else {
                            var Q = S.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
                                T = R.cur(true) || 0;
                            if (Q) {
                                var N = parseFloat(Q[2]),
                                    P = Q[3] || "px";
                                if (P != "px") {
                                    J.style[O] = (N || 1) + P;
                                    T = ((N || 1) / R.cur(true)) * T;
                                    J.style[O] = T + P
                                }
                                if (Q[1]) {
                                    N = ((Q[1] == "-=" ? -1 : 1) * N) + T
                                }
                                R.custom(T, N, P)
                            } else {
                                R.custom(T, S, "")
                            }
                        }
                    });
                    return true
                })
            },
            stop: function(F, E) {
                var G = o.timers;
                if (F) {
                    this.queue([])
                }
                this.each(function() {
                    for (var H = G.length - 1; H >= 0; H--) {
                        if (G[H].elem == this) {
                            if (E) {
                                G[H](true)
                            }
                            G.splice(H, 1)
                        }
                    }
                });
                if (!E) {
                    this.dequeue()
                }
                return this
            }
        });
        o.each({
            slideDown: t("show", 1),
            slideUp: t("hide", 1),
            slideToggle: t("toggle", 1),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            }
        }, function(E, F) {
            o.fn[E] = function(G, H) {
                return this.animate(F, G, H)
            }
        });
        o.extend({
            speed: function(G, H, F) {
                var E = typeof G === "object" ? G : {
                    complete: F || !F && H || o.isFunction(G) && G,
                    duration: G,
                    easing: F && H || H && !o.isFunction(H) && H
                };
                E.duration = o.fx.off ? 0 : typeof E.duration === "number" ? E.duration : o.fx.speeds[E.duration] || o.fx.speeds._default;
                E.old = E.complete;
                E.complete = function() {
                    if (E.queue !== false) {
                        o(this).dequeue()
                    }
                    if (o.isFunction(E.old)) {
                        E.old.call(this)
                    }
                };
                return E
            },
            easing: {
                linear: function(G, H, E, F) {
                    return E + F * G
                },
                swing: function(G, H, E, F) {
                    return ((-Math.cos(G * Math.PI) / 2) + 0.5) * F + E
                }
            },
            timers: [],
            fx: function(F, E, G) {
                this.options = E;
                this.elem = F;
                this.prop = G;
                if (!E.orig) {
                    E.orig = {}
                }
            }
        });
        o.fx.prototype = {
            update: function() {
                if (this.options.step) {
                    this.options.step.call(this.elem, this.now, this)
                }(o.fx.step[this.prop] || o.fx.step._default)(this);
                if ((this.prop == "height" || this.prop == "width") && this.elem.style) {
                    this.elem.style.display = "block"
                }
            },
            cur: function(F) {
                if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
                    return this.elem[this.prop]
                }
                var E = parseFloat(o.css(this.elem, this.prop, F));
                return E && E > -10000 ? E : parseFloat(o.curCSS(this.elem, this.prop)) || 0
            },
            custom: function(I, H, G) {
                this.startTime = e();
                this.start = I;
                this.end = H;
                this.unit = G || this.unit || "px";
                this.now = this.start;
                this.pos = this.state = 0;
                var E = this;

                function F(J) {
                    return E.step(J)
                }
                F.elem = this.elem;
                if (F() && o.timers.push(F) && !n) {
                    n = setInterval(function() {
                        var K = o.timers;
                        for (var J = 0; J < K.length; J++) {
                            if (!K[J]()) {
                                K.splice(J--, 1)
                            }
                        }
                        if (!K.length) {
                            clearInterval(n);
                            n = g
                        }
                    }, 13)
                }
            },
            show: function() {
                this.options.orig[this.prop] = o.attr(this.elem.style, this.prop);
                this.options.show = true;
                this.custom(this.prop == "width" || this.prop == "height" ? 1 : 0, this.cur());
                o(this.elem).show()
            },
            hide: function() {
                this.options.orig[this.prop] = o.attr(this.elem.style, this.prop);
                this.options.hide = true;
                this.custom(this.cur(), 0)
            },
            step: function(H) {
                var G = e();
                if (H || G >= this.options.duration + this.startTime) {
                    this.now = this.end;
                    this.pos = this.state = 1;
                    this.update();
                    this.options.curAnim[this.prop] = true;
                    var E = true;
                    for (var F in this.options.curAnim) {
                        if (this.options.curAnim[F] !== true) {
                            E = false
                        }
                    }
                    if (E) {
                        if (this.options.display != null) {
                            this.elem.style.overflow = this.options.overflow;
                            this.elem.style.display = this.options.display;
                            if (o.css(this.elem, "display") == "none") {
                                this.elem.style.display = "block"
                            }
                        }
                        if (this.options.hide) {
                            o(this.elem).hide()
                        }
                        if (this.options.hide || this.options.show) {
                            for (var I in this.options.curAnim) {
                                o.attr(this.elem.style, I, this.options.orig[I])
                            }
                        }
                        this.options.complete.call(this.elem)
                    }
                    return false
                } else {
                    var J = G - this.startTime;
                    this.state = J / this.options.duration;
                    this.pos = o.easing[this.options.easing || (o.easing.swing ? "swing" : "linear")](this.state, J, 0, 1, this.options.duration);
                    this.now = this.start + ((this.end - this.start) * this.pos);
                    this.update()
                }
                return true
            }
        };
        o.extend(o.fx, {
            speeds: {
                slow: 600,
                fast: 200,
                _default: 400
            },
            step: {
                opacity: function(E) {
                    o.attr(E.elem.style, "opacity", E.now)
                },
                _default: function(E) {
                    if (E.elem.style && E.elem.style[E.prop] != null) {
                        E.elem.style[E.prop] = E.now + E.unit
                    } else {
                        E.elem[E.prop] = E.now
                    }
                }
            }
        });
        if (document.documentElement.getBoundingClientRect) {
            o.fn.offset = function() {
                if (!this[0]) {
                    return {
                        top: 0,
                        left: 0
                    }
                }
                if (this[0] === this[0].ownerDocument.body) {
                    return o.offset.bodyOffset(this[0])
                }
                var G = this[0].getBoundingClientRect(),
                    J = this[0].ownerDocument,
                    F = J.body,
                    E = J.documentElement,
                    L = E.clientTop || F.clientTop || 0,
                    K = E.clientLeft || F.clientLeft || 0,
                    I = G.top + (self.pageYOffset || o.boxModel && E.scrollTop || F.scrollTop) - L,
                    H = G.left + (self.pageXOffset || o.boxModel && E.scrollLeft || F.scrollLeft) - K;
                return {
                    top: I,
                    left: H
                }
            }
        } else {
            o.fn.offset = function() {
                if (!this[0]) {
                    return {
                        top: 0,
                        left: 0
                    }
                }
                if (this[0] === this[0].ownerDocument.body) {
                    return o.offset.bodyOffset(this[0])
                }
                o.offset.initialized || o.offset.initialize();
                var J = this[0],
                    G = J.offsetParent,
                    F = J,
                    O = J.ownerDocument,
                    M, H = O.documentElement,
                    K = O.body,
                    L = O.defaultView,
                    E = L.getComputedStyle(J, null),
                    N = J.offsetTop,
                    I = J.offsetLeft;
                while ((J = J.parentNode) && J !== K && J !== H) {
                    M = L.getComputedStyle(J, null);
                    N -= J.scrollTop, I -= J.scrollLeft;
                    if (J === G) {
                        N += J.offsetTop, I += J.offsetLeft;
                        if (o.offset.doesNotAddBorder && !(o.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(J.tagName))) {
                            N += parseInt(M.borderTopWidth, 10) || 0, I += parseInt(M.borderLeftWidth, 10) || 0
                        }
                        F = G, G = J.offsetParent
                    }
                    if (o.offset.subtractsBorderForOverflowNotVisible && M.overflow !== "visible") {
                        N += parseInt(M.borderTopWidth, 10) || 0, I += parseInt(M.borderLeftWidth, 10) || 0
                    }
                    E = M
                }
                if (E.position === "relative" || E.position === "static") {
                    N += K.offsetTop, I += K.offsetLeft
                }
                if (E.position === "fixed") {
                    N += Math.max(H.scrollTop, K.scrollTop), I += Math.max(H.scrollLeft, K.scrollLeft)
                }
                return {
                    top: N,
                    left: I
                }
            }
        }
        o.offset = {
            initialize: function() {
                if (this.initialized) {
                    return
                }
                var L = document.body,
                    F = document.createElement("div"),
                    H, G, N, I, M, E, J = L.style.marginTop,
                    K = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';
                M = {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    margin: 0,
                    border: 0,
                    width: "1px",
                    height: "1px",
                    visibility: "hidden"
                };
                for (E in M) {
                    F.style[E] = M[E]
                }
                F.innerHTML = K;
                L.insertBefore(F, L.firstChild);
                H = F.firstChild, G = H.firstChild, I = H.nextSibling.firstChild.firstChild;
                this.doesNotAddBorder = (G.offsetTop !== 5);
                this.doesAddBorderForTableAndCells = (I.offsetTop === 5);
                H.style.overflow = "hidden", H.style.position = "relative";
                this.subtractsBorderForOverflowNotVisible = (G.offsetTop === -5);
                L.style.marginTop = "1px";
                this.doesNotIncludeMarginInBodyOffset = (L.offsetTop === 0);
                L.style.marginTop = J;
                L.removeChild(F);
                this.initialized = true
            },
            bodyOffset: function(E) {
                o.offset.initialized || o.offset.initialize();
                var G = E.offsetTop,
                    F = E.offsetLeft;
                if (o.offset.doesNotIncludeMarginInBodyOffset) {
                    G += parseInt(o.curCSS(E, "marginTop", true), 10) || 0, F += parseInt(o.curCSS(E, "marginLeft", true), 10) || 0
                }
                return {
                    top: G,
                    left: F
                }
            }
        };
        o.fn.extend({
            position: function() {
                var I = 0,
                    H = 0,
                    F;
                if (this[0]) {
                    var G = this.offsetParent(),
                        J = this.offset(),
                        E = /^body|html$/i.test(G[0].tagName) ? {
                            top: 0,
                            left: 0
                        } : G.offset();
                    J.top -= j(this, "marginTop");
                    J.left -= j(this, "marginLeft");
                    E.top += j(G, "borderTopWidth");
                    E.left += j(G, "borderLeftWidth");
                    F = {
                        top: J.top - E.top,
                        left: J.left - E.left
                    }
                }
                return F
            },
            offsetParent: function() {
                var E = this[0].offsetParent || document.body;
                while (E && (!/^body|html$/i.test(E.tagName) && o.css(E, "position") == "static")) {
                    E = E.offsetParent
                }
                return o(E)
            }
        });
        o.each(["Left", "Top"], function(F, E) {
            var G = "scroll" + E;
            o.fn[G] = function(H) {
                if (!this[0]) {
                    return null
                }
                return H !== g ? this.each(function() {
                    this == l || this == document ? l.scrollTo(!F ? H : o(l).scrollLeft(), F ? H : o(l).scrollTop()) : this[G] = H
                }) : this[0] == l || this[0] == document ? self[F ? "pageYOffset" : "pageXOffset"] || o.boxModel && document.documentElement[G] || document.body[G] : this[0][G]
            }
        });
        o.each(["Height", "Width"], function(I, G) {
            var E = I ? "Left" : "Top",
                H = I ? "Right" : "Bottom",
                F = G.toLowerCase();
            o.fn["inner" + G] = function() {
                return this[0] ? o.css(this[0], F, false, "padding") : null
            };
            o.fn["outer" + G] = function(K) {
                return this[0] ? o.css(this[0], F, false, K ? "margin" : "border") : null
            };
            var J = G.toLowerCase();
            o.fn[J] = function(K) {
                return this[0] == l ? document.compatMode == "CSS1Compat" && document.documentElement["client" + G] || document.body["client" + G] : this[0] == document ? Math.max(document.documentElement["client" + G], document.body["scroll" + G], document.documentElement["scroll" + G], document.body["offset" + G], document.documentElement["offset" + G]) : K === g ? (this.length ? o.css(this[0], J) : null) : this.css(J, typeof K === "string" ? K : K + "px")
            }
        })
    })();

    //************* Name: jqf.js ************* 

    (function($) {
        $.fn.ajaxSubmit = function(options) {
            if (!this.length) {
                log('ajaxSubmit: skipping submit process - no element selected');
                return this;
            }
            if (typeof options == 'function')
                options = {
                    success: options
                };
            options = $.extend({
                url: this.attr('action') || window.location.toString(),
                type: this.attr('method') || 'GET'
            }, options || {});
            var veto = {};
            this.trigger('form-pre-serialize', [this, options, veto]);
            if (veto.veto) {
                log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
                return this;
            }
            var a = this.formToArray(options.semantic);
            if (options.data) {
                options.extraData = options.data;
                for (var n in options.data)
                    a.push({
                        name: n,
                        value: options.data[n]
                    });
            }
            if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
                log('ajaxSubmit: submit aborted via beforeSubmit callback');
                return this;
            }
            this.trigger('form-submit-validate', [a, this, options, veto]);
            if (veto.veto) {
                log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
                return this;
            }
            var q = $.param(a);
            if (options.type.toUpperCase() == 'GET') {
                options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
                options.data = null;
            } else
                options.data = q;
            var $form = this,
                callbacks = [];
            if (options.resetForm) callbacks.push(function() {
                $form.resetForm();
            });
            if (options.clearForm) callbacks.push(function() {
                $form.clearForm();
            });
            if (!options.dataType && options.target) {
                var oldSuccess = options.success || function() {};
                callbacks.push(function(data) {
                    $(options.target).html(data).each(oldSuccess, arguments);
                });
            } else if (options.success)
                callbacks.push(options.success);
            options.success = function(data, status) {
                for (var i = 0, max = callbacks.length; i < max; i++)
                    callbacks[i](data, status, $form);
            };
            var files = $('input:file', this).fieldValue();
            var found = false;
            for (var j = 0; j < files.length; j++)
                if (files[j])
                    found = true;
            if (options.iframe || found) {
                if ($.browser.safari && options.closeKeepAlive)
                    $.get(options.closeKeepAlive, fileUpload);
                else
                    fileUpload();
            } else
                $.ajax(options);
            this.trigger('form-submit-notify', [this, options]);
            return this;

            function fileUpload() {
                var form = $form[0];
                if ($(':input[name=submit]', form).length) {
                    alert('Error: Form elements must not be named "submit".');
                    return;
                }
                var opts = $.extend({}, $.ajaxSettings, options);
                var id = 'jqFormIO' + (new Date().getTime());
                var $io = $('<iframe id="' + id + '" name="' + id + '" />');
                var io = $io[0];
                if ($.browser.msie || $.browser.opera)
                    io.src = 'javascript:false;document.write("");';
                $io.css({
                    position: 'absolute',
                    top: '-1000px',
                    left: '-1000px'
                });
                var xhr = {
                    responseText: null,
                    responseXML: null,
                    status: 0,
                    statusText: 'n/a',
                    getAllResponseHeaders: function() {},
                    getResponseHeader: function() {},
                    setRequestHeader: function() {}
                };
                var g = opts.global;
                if (g && !$.active++) $.event.trigger("ajaxStart");
                if (g) $.event.trigger("ajaxSend", [xhr, opts]);
                var cbInvoked = 0;
                var timedOut = 0;
                var sub = form.clk;
                if (sub) {
                    var n = sub.name;
                    if (n && !sub.disabled) {
                        options.extraData = options.extraData || {};
                        options.extraData[n] = sub.value;
                        if (sub.type == "image") {
                            options.extraData[name + '.x'] = form.clk_x;
                            options.extraData[name + '.y'] = form.clk_y;
                        }
                    }
                }
                setTimeout(function() {
                    var t = $form.attr('target'),
                        a = $form.attr('action');
                    $form.attr({
                        target: id,
                        encoding: 'multipart/form-data',
                        enctype: 'multipart/form-data',
                        method: 'POST',
                        action: opts.url
                    });
                    if (opts.timeout)
                        setTimeout(function() {
                            timedOut = true;
                            cb();
                        }, opts.timeout);
                    var extraInputs = [];
                    try {
                        if (options.extraData)
                            for (var n in options.extraData)
                                extraInputs.push($('<input type="hidden" name="' + n + '" value="' + options.extraData[n] + '" />').appendTo(form)[0]);
                        $io.appendTo('body');
                        io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
                        form.submit();
                    } finally {
                        $form.attr('action', a);
                        t ? $form.attr('target', t) : $form.removeAttr('target');
                        $(extraInputs).remove();
                    }
                }, 10);

                function cb() {
                    if (cbInvoked++) return;
                    io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);
                    var operaHack = 0;
                    var ok = true;
                    try {
                        if (timedOut) throw 'timeout';
                        var data, doc;
                        doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
                        if (doc.body == null && !operaHack && $.browser.opera) {
                            operaHack = 1;
                            cbInvoked--;
                            setTimeout(cb, 100);
                            return;
                        }
                        xhr.responseText = doc.body ? doc.body.innerHTML : null;
                        xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                        xhr.getResponseHeader = function(header) {
                            var headers = {
                                'content-type': opts.dataType
                            };
                            return headers[header];
                        };
                        if (opts.dataType == 'json' || opts.dataType == 'script') {
                            var ta = doc.getElementsByTagName('textarea')[0];
                            xhr.responseText = ta ? ta.value : xhr.responseText;
                        } else if (opts.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
                            xhr.responseXML = toXml(xhr.responseText);
                        }
                        data = $.httpData(xhr, opts.dataType);
                    } catch (e) {
                        ok = false;
                        $.handleError(opts, xhr, 'error', e);
                    }
                    if (ok) {
                        opts.success(data, 'success');
                        if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
                    }
                    if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
                    if (g && !--$.active) $.event.trigger("ajaxStop");
                    if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');
                    setTimeout(function() {
                        $io.remove();
                        xhr.responseXML = null;
                    }, 100);
                };

                function toXml(s, doc) {
                    if (window.ActiveXObject) {
                        doc = new ActiveXObject('Microsoft.XMLDOM');
                        doc.async = 'false';
                        doc.loadXML(s);
                    } else
                        doc = (new DOMParser()).parseFromString(s, 'text/xml');
                    return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
                };
            };
        };
        $.fn.ajaxForm = function(options) {
            return this.ajaxFormUnbind().bind('submit.form-plugin', function() {
                $(this).ajaxSubmit(options);
                return false;
            }).each(function() {
                $(":submit,input:image", this).bind('click.form-plugin', function(e) {
                    var $form = this.form;
                    $form.clk = this;
                    if (this.type == 'image') {
                        if (e.offsetX != undefined) {
                            $form.clk_x = e.offsetX;
                            $form.clk_y = e.offsetY;
                        } else if (typeof $.fn.offset == 'function') {
                            var offset = $(this).offset();
                            $form.clk_x = e.pageX - offset.left;
                            $form.clk_y = e.pageY - offset.top;
                        } else {
                            $form.clk_x = e.pageX - this.offsetLeft;
                            $form.clk_y = e.pageY - this.offsetTop;
                        }
                    }
                    setTimeout(function() {
                        $form.clk = $form.clk_x = $form.clk_y = null;
                    }, 10);
                });
            });
        };
        $.fn.ajaxFormUnbind = function() {
            this.unbind('submit.form-plugin');
            return this.each(function() {
                $(":submit,input:image", this).unbind('click.form-plugin');
            });
        };
        $.fn.formToArray = function(semantic) {
            var a = [];
            if (this.length == 0) return a;
            var form = this[0];
            var els = semantic ? form.getElementsByTagName('*') : form.elements;
            if (!els) return a;
            for (var i = 0, max = els.length; i < max; i++) {
                var el = els[i];
                var n = el.name;
                if (!n) continue;
                if (semantic && form.clk && el.type == "image") {
                    if (!el.disabled && form.clk == el)
                        a.push({
                            name: n + '.x',
                            value: form.clk_x
                        }, {
                            name: n + '.y',
                            value: form.clk_y
                        });
                    continue;
                }
                var v = $.fieldValue(el, true);
                if (v && v.constructor == Array) {
                    for (var j = 0, jmax = v.length; j < jmax; j++)
                        a.push({
                            name: n,
                            value: v[j]
                        });
                } else if (v !== null && typeof v != 'undefined')
                    a.push({
                        name: n,
                        value: v
                    });
            }
            if (!semantic && form.clk) {
                var inputs = form.getElementsByTagName("input");
                for (var i = 0, max = inputs.length; i < max; i++) {
                    var input = inputs[i];
                    var n = input.name;
                    if (n && !input.disabled && input.type == "image" && form.clk == input)
                        a.push({
                            name: n + '.x',
                            value: form.clk_x
                        }, {
                            name: n + '.y',
                            value: form.clk_y
                        });
                }
            }
            return a;
        };
        $.fn.formSerialize = function(semantic) {
            return $.param(this.formToArray(semantic));
        };
        $.fn.fieldSerialize = function(successful) {
            var a = [];
            this.each(function() {
                var n = this.name;
                if (!n) return;
                var v = $.fieldValue(this, successful);
                if (v && v.constructor == Array) {
                    for (var i = 0, max = v.length; i < max; i++)
                        a.push({
                            name: n,
                            value: v[i]
                        });
                } else if (v !== null && typeof v != 'undefined')
                    a.push({
                        name: this.name,
                        value: v
                    });
            });
            return $.param(a);
        };
        $.fn.fieldValue = function(successful) {
            for (var val = [], i = 0, max = this.length; i < max; i++) {
                var el = this[i];
                var v = $.fieldValue(el, successful);
                if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
                    continue;
                v.constructor == Array ? $.merge(val, v) : val.push(v);
            }
            return val;
        };
        $.fieldValue = function(el, successful) {
            var n = el.name,
                t = el.type,
                tag = el.tagName.toLowerCase();
            if (typeof successful == 'undefined') successful = true;
            if (successful && (!n || el.disabled || t == 'reset' || t == 'button' || (t == 'checkbox' || t == 'radio') && !el.checked || (t == 'submit' || t == 'image') && el.form && el.form.clk != el || tag == 'select' && el.selectedIndex == -1))
                return null;
            if (tag == 'select') {
                var index = el.selectedIndex;
                if (index < 0) return null;
                var a = [],
                    ops = el.options;
                var one = (t == 'select-one');
                var max = (one ? index + 1 : ops.length);
                for (var i = (one ? index : 0); i < max; i++) {
                    var op = ops[i];
                    if (op.selected) {
                        var v = $.browser.msie && !(op.attributes['value'].specified) ? op.text : op.value;
                        if (one) return v;
                        a.push(v);
                    }
                }
                return a;
            }
            return el.value;
        };
        $.fn.clearForm = function() {
            return this.each(function() {
                $('input,select,textarea', this).clearFields();
            });
        };
        $.fn.clearFields = $.fn.clearInputs = function() {
            return this.each(function() {
                var t = this.type,
                    tag = this.tagName.toLowerCase();
                if (t == 'text' || t == 'password' || tag == 'textarea')
                    this.value = '';
                else if (t == 'checkbox' || t == 'radio')
                    this.checked = false;
                else if (tag == 'select')
                    this.selectedIndex = -1;
            });
        };
        $.fn.resetForm = function() {
            return this.each(function() {
                if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
                    this.reset();
            });
        };
        $.fn.enable = function(b) {
            if (b == undefined) b = true;
            return this.each(function() {
                this.disabled = !b
            });
        };
        $.fn.select = function(select) {
            if (select == undefined) select = true;
            return this.each(function() {
                var t = this.type;
                if (t == 'checkbox' || t == 'radio')
                    this.checked = select;
                else if (this.tagName.toLowerCase() == 'option') {
                    var $sel = $(this).parent('select');
                    if (select && $sel[0] && $sel[0].type == 'select-one') {
                        $sel.find('option').select(false);
                    }
                    this.selected = select;
                }
            });
        };

        function log() {
            if ($.fn.ajaxSubmit.debug && window.console && window.console.log)
                window.console.log('[jquery.form] ' + Array.prototype.join.call(arguments, ''));
        };
    })(jQuery);

    //*********** Name: base64.js ************ 

    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.",
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },
        _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        _utf8_decode: function(utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    };

    //********* Name: hoverIntent.js ********* 

    (function($) {
        $.fn.hoverIntent = function(f, g) {
            var cfg = {
                sensitivity: 7,
                interval: 100,
                timeout: 0
            };
            cfg = $.extend(cfg, g ? {
                over: f,
                out: g
            } : f);
            var cX, cY, pX, pY;
            var track = function(ev) {
                cX = ev.pageX;
                cY = ev.pageY;
            };
            var compare = function(ev, ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                    $(ob).unbind("mousemove", track);
                    ob.hoverIntent_s = 1;
                    return cfg.over.apply(ob, [ev]);
                } else {
                    pX = cX;
                    pY = cY;
                    ob.hoverIntent_t = setTimeout(function() {
                        compare(ev, ob);
                    }, cfg.interval);
                }
            };
            var delay = function(ev, ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                ob.hoverIntent_s = 0;
                return cfg.out.apply(ob, [ev]);
            };
            var handleHover = function(e) {
                var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
                while (p && p != this) {
                    try {
                        p = p.parentNode;
                    } catch (e) {
                        p = this;
                    }
                }
                if (p == this) {
                    return false;
                }
                var ev = jQuery.extend({}, e);
                var ob = this;
                if (ob.hoverIntent_t) {
                    ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                }
                if (e.type == "mouseover") {
                    pX = ev.pageX;
                    pY = ev.pageY;
                    $(ob).bind("mousemove", track);
                    if (ob.hoverIntent_s != 1) {
                        ob.hoverIntent_t = setTimeout(function() {
                            compare(ev, ob);
                        }, cfg.interval);
                    }
                } else {
                    $(ob).unbind("mousemove", track);
                    if (ob.hoverIntent_s == 1) {
                        ob.hoverIntent_t = setTimeout(function() {
                            delay(ev, ob);
                        }, cfg.timeout);
                    }
                }
            };
            return this.mouseover(handleHover).mouseout(handleHover);
        };
    })(jQuery);

    //********** Name: superfish.js ********** 

    ;
    (function($) {
        $.fn.superfish = function(op) {
            var sf = $.fn.superfish,
                c = sf.c,
                $arrow = $(['<span class="', c.arrowClass, '"> &#187;</span>'].join('')),
                over = function() {
                    var $$ = $(this),
                        menu = getMenu($$);
                    clearTimeout(menu.sfTimer);
                    $$.showSuperfishUl().siblings().hideSuperfishUl();
                },
                out = function() {
                    var $$ = $(this),
                        menu = getMenu($$),
                        o = sf.op;
                    clearTimeout(menu.sfTimer);
                    menu.sfTimer = setTimeout(function() {
                        o.retainPath = ($.inArray($$[0], o.$path) > -1);
                        $$.hideSuperfishUl();
                        if (o.$path.length && $$.parents(['li.', o.hoverClass].join('')).length < 1) {
                            over.call(o.$path);
                        }
                    }, o.delay);
                },
                getMenu = function($menu) {
                    var menu = $menu.parents(['ul.', c.menuClass, ':first'].join(''))[0];
                    sf.op = sf.o[menu.serial];
                    return menu;
                },
                addArrow = function($a) {
                    $a.addClass(c.anchorClass).append($arrow.clone());
                };
            return this.each(function() {
                var s = this.serial = sf.o.length;
                var o = $.extend({}, sf.defaults, op);
                o.$path = $('li.' + o.pathClass, this).slice(0, o.pathLevels).each(function() {
                    $(this).addClass([o.hoverClass, c.bcClass].join(' ')).filter('li:has(ul)').removeClass(o.pathClass);
                });
                sf.o[s] = sf.op = o;
                $('li:has(ul)', this)[($.fn.hoverIntent && !o.disableHI) ? 'hoverIntent' : 'hover'](over, out).each(function() {
                    if (o.autoArrows) addArrow($('>a:first-child', this));
                }).not('.' + c.bcClass).hideSuperfishUl();
                var $a = $('a', this);
                $a.each(function(i) {
                    var $li = $a.eq(i).parents('li');
                    $a.eq(i).focus(function() {
                        over.call($li);
                    }).blur(function() {
                        out.call($li);
                    });
                });
                o.onInit.call(this);
            }).each(function() {
                var menuClasses = [c.menuClass];
                if (sf.op.dropShadows && !($.browser.msie && $.browser.version < 7)) menuClasses.push(c.shadowClass);
                $(this).addClass(menuClasses.join(' '));
            });
        };
        var sf = $.fn.superfish;
        sf.o = [];
        sf.op = {};
        sf.IE7fix = function() {
            var o = sf.op;
            if ($.browser.msie && $.browser.version > 6 && o.dropShadows && o.animation.opacity != undefined)
                this.toggleClass(sf.c.shadowClass + '-off');
        };
        sf.c = {
            bcClass: 'sf-breadcrumb',
            menuClass: 'sf-js-enabled',
            anchorClass: 'sf-with-ul',
            arrowClass: 'sf-sub-indicator',
            shadowClass: 'sf-shadow'
        };
        sf.defaults = {
            hoverClass: 'sfHover',
            pathClass: 'overideThisToUse',
            pathLevels: 1,
            delay: 800,
            animation: {
                opacity: 'show'
            },
            speed: 'normal',
            autoArrows: true,
            dropShadows: true,
            disableHI: false,
            onInit: function() {},
            onBeforeShow: function() {},
            onShow: function() {},
            onHide: function() {}
        };
        $.fn.extend({
            hideSuperfishUl: function() {
                var o = sf.op,
                    not = (o.retainPath === true) ? o.$path : '';
                o.retainPath = false;
                var $ul = $(['li.', o.hoverClass].join(''), this).add(this).not(not).removeClass(o.hoverClass).find('>ul').hide().css('visibility', 'hidden');
                o.onHide.call($ul);
                return this;
            },
            showSuperfishUl: function() {
                var o = sf.op,
                    sh = sf.c.shadowClass + '-off',
                    $ul = this.addClass(o.hoverClass).find('>ul:hidden').css('visibility', 'visible').css('z-index', "30000000");
                sf.IE7fix.call($ul);
                o.onBeforeShow.call($ul);
                $ul.animate(o.animation, o.speed, function() {
                    sf.IE7fix.call($ul);
                    o.onShow.call($ul);
                });
                return this;
            }
        });
    })(jQuery);

    //********** Name: swfobject.js ********** 

    /*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
    	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
    */
    var swfobject = function() {
        var D = "undefined",
            r = "object",
            S = "Shockwave Flash",
            W = "ShockwaveFlash.ShockwaveFlash",
            q = "application/x-shockwave-flash",
            R = "SWFObjectExprInst",
            x = "onreadystatechange",
            O = window,
            j = document,
            t = navigator,
            T = false,
            U = [h],
            o = [],
            N = [],
            I = [],
            l, Q, E, B, J = false,
            a = false,
            n, G, m = true,
            M = function() {
                var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D,
                    ah = t.userAgent.toLowerCase(),
                    Y = t.platform.toLowerCase(),
                    ae = Y ? /win/.test(Y) : /win/.test(ah),
                    ac = Y ? /mac/.test(Y) : /mac/.test(ah),
                    af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                    X = !+"\v1",
                    ag = [0, 0, 0],
                    ab = null;
                if (typeof t.plugins != D && typeof t.plugins[S] == r) {
                    ab = t.plugins[S].description;
                    if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                        T = true;
                        X = false;
                        ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                        ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                        ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                        ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                    }
                } else {
                    if (typeof O.ActiveXObject != D) {
                        try {
                            var ad = new ActiveXObject(W);
                            if (ad) {
                                ab = ad.GetVariable("$version");
                                if (ab) {
                                    X = true;
                                    ab = ab.split(" ")[1].split(",");
                                    ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                                }
                            }
                        } catch (Z) {}
                    }
                }
                return {
                    w3: aa,
                    pv: ag,
                    wk: af,
                    ie: X,
                    win: ae,
                    mac: ac
                }
            }(),
            k = function() {
                if (!M.w3) {
                    return
                }
                if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
                    f()
                }
                if (!J) {
                    if (typeof j.addEventListener != D) {
                        j.addEventListener("DOMContentLoaded", f, false)
                    }
                    if (M.ie && M.win) {
                        j.attachEvent(x, function() {
                            if (j.readyState == "complete") {
                                j.detachEvent(x, arguments.callee);
                                f()
                            }
                        });
                        if (O == top) {
                            (function() {
                                if (J) {
                                    return
                                }
                                try {
                                    j.documentElement.doScroll("left")
                                } catch (X) {
                                    setTimeout(arguments.callee, 0);
                                    return
                                }
                                f()
                            })()
                        }
                    }
                    if (M.wk) {
                        (function() {
                            if (J) {
                                return
                            }
                            if (!/loaded|complete/.test(j.readyState)) {
                                setTimeout(arguments.callee, 0);
                                return
                            }
                            f()
                        })()
                    }
                    s(f)
                }
            }();

        function f() {
            if (J) {
                return
            }
            try {
                var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
                Z.parentNode.removeChild(Z)
            } catch (aa) {
                return
            }
            J = true;
            var X = U.length;
            for (var Y = 0; Y < X; Y++) {
                U[Y]()
            }
        }

        function K(X) {
            if (J) {
                X()
            } else {
                U[U.length] = X
            }
        }

        function s(Y) {
            if (typeof O.addEventListener != D) {
                O.addEventListener("load", Y, false)
            } else {
                if (typeof j.addEventListener != D) {
                    j.addEventListener("load", Y, false)
                } else {
                    if (typeof O.attachEvent != D) {
                        i(O, "onload", Y)
                    } else {
                        if (typeof O.onload == "function") {
                            var X = O.onload;
                            O.onload = function() {
                                X();
                                Y()
                            }
                        } else {
                            O.onload = Y
                        }
                    }
                }
            }
        }

        function h() {
            if (T) {
                V()
            } else {
                H()
            }
        }

        function V() {
            var X = j.getElementsByTagName("body")[0];
            var aa = C(r);
            aa.setAttribute("type", q);
            var Z = X.appendChild(aa);
            if (Z) {
                var Y = 0;
                (function() {
                    if (typeof Z.GetVariable != D) {
                        var ab = Z.GetVariable("$version");
                        if (ab) {
                            ab = ab.split(" ")[1].split(",");
                            M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                        }
                    } else {
                        if (Y < 10) {
                            Y++;
                            setTimeout(arguments.callee, 10);
                            return
                        }
                    }
                    X.removeChild(aa);
                    Z = null;
                    H()
                })()
            } else {
                H()
            }
        }

        function H() {
            var ag = o.length;
            if (ag > 0) {
                for (var af = 0; af < ag; af++) {
                    var Y = o[af].id;
                    var ab = o[af].callbackFn;
                    var aa = {
                        success: false,
                        id: Y
                    };
                    if (M.pv[0] > 0) {
                        var ae = c(Y);
                        if (ae) {
                            if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                                w(Y, true);
                                if (ab) {
                                    aa.success = true;
                                    aa.ref = z(Y);
                                    ab(aa)
                                }
                            } else {
                                if (o[af].expressInstall && A()) {
                                    var ai = {};
                                    ai.data = o[af].expressInstall;
                                    ai.width = ae.getAttribute("width") || "0";
                                    ai.height = ae.getAttribute("height") || "0";
                                    if (ae.getAttribute("class")) {
                                        ai.styleclass = ae.getAttribute("class")
                                    }
                                    if (ae.getAttribute("align")) {
                                        ai.align = ae.getAttribute("align")
                                    }
                                    var ah = {};
                                    var X = ae.getElementsByTagName("param");
                                    var ac = X.length;
                                    for (var ad = 0; ad < ac; ad++) {
                                        if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                            ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                        }
                                    }
                                    P(ai, ah, Y, ab)
                                } else {
                                    p(ae);
                                    if (ab) {
                                        ab(aa)
                                    }
                                }
                            }
                        }
                    } else {
                        w(Y, true);
                        if (ab) {
                            var Z = z(Y);
                            if (Z && typeof Z.SetVariable != D) {
                                aa.success = true;
                                aa.ref = Z
                            }
                            ab(aa)
                        }
                    }
                }
            }
        }

        function z(aa) {
            var X = null;
            var Y = c(aa);
            if (Y && Y.nodeName == "OBJECT") {
                if (typeof Y.SetVariable != D) {
                    X = Y
                } else {
                    var Z = Y.getElementsByTagName(r)[0];
                    if (Z) {
                        X = Z
                    }
                }
            }
            return X
        }

        function A() {
            return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
        }

        function P(aa, ab, X, Z) {
            a = true;
            E = Z || null;
            B = {
                success: false,
                id: X
            };
            var ae = c(X);
            if (ae) {
                if (ae.nodeName == "OBJECT") {
                    l = g(ae);
                    Q = null
                } else {
                    l = ae;
                    Q = X
                }
                aa.id = R;
                if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                    aa.width = "310"
                }
                if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                    aa.height = "137"
                }
                j.title = j.title.slice(0, 47) + " - Flash Player Installation";
                var ad = M.ie && M.win ? "ActiveX" : "PlugIn",
                    ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
                if (typeof ab.flashvars != D) {
                    ab.flashvars += "&" + ac
                } else {
                    ab.flashvars = ac
                }
                if (M.ie && M.win && ae.readyState != 4) {
                    var Y = C("div");
                    X += "SWFObjectNew";
                    Y.setAttribute("id", X);
                    ae.parentNode.insertBefore(Y, ae);
                    ae.style.display = "none";
                    (function() {
                        if (ae.readyState == 4) {
                            ae.parentNode.removeChild(ae)
                        } else {
                            setTimeout(arguments.callee, 10)
                        }
                    })()
                }
                u(aa, ab, X)
            }
        }

        function p(Y) {
            if (M.ie && M.win && Y.readyState != 4) {
                var X = C("div");
                Y.parentNode.insertBefore(X, Y);
                X.parentNode.replaceChild(g(Y), X);
                Y.style.display = "none";
                (function() {
                    if (Y.readyState == 4) {
                        Y.parentNode.removeChild(Y)
                    } else {
                        setTimeout(arguments.callee, 10)
                    }
                })()
            } else {
                Y.parentNode.replaceChild(g(Y), Y)
            }
        }

        function g(ab) {
            var aa = C("div");
            if (M.win && M.ie) {
                aa.innerHTML = ab.innerHTML
            } else {
                var Y = ab.getElementsByTagName(r)[0];
                if (Y) {
                    var ad = Y.childNodes;
                    if (ad) {
                        var X = ad.length;
                        for (var Z = 0; Z < X; Z++) {
                            if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                                aa.appendChild(ad[Z].cloneNode(true))
                            }
                        }
                    }
                }
            }
            return aa
        }

        function u(ai, ag, Y) {
            var X, aa = c(Y);
            if (M.wk && M.wk < 312) {
                return X
            }
            if (aa) {
                if (typeof ai.id == D) {
                    ai.id = Y
                }
                if (M.ie && M.win) {
                    var ah = "";
                    for (var ae in ai) {
                        if (ai[ae] != Object.prototype[ae]) {
                            if (ae.toLowerCase() == "data") {
                                ag.movie = ai[ae]
                            } else {
                                if (ae.toLowerCase() == "styleclass") {
                                    ah += ' class="' + ai[ae] + '"'
                                } else {
                                    if (ae.toLowerCase() != "classid") {
                                        ah += " " + ae + '="' + ai[ae] + '"'
                                    }
                                }
                            }
                        }
                    }
                    var af = "";
                    for (var ad in ag) {
                        if (ag[ad] != Object.prototype[ad]) {
                            af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                        }
                    }
                    aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                    N[N.length] = ai.id;
                    X = c(ai.id)
                } else {
                    var Z = C(r);
                    Z.setAttribute("type", q);
                    for (var ac in ai) {
                        if (ai[ac] != Object.prototype[ac]) {
                            if (ac.toLowerCase() == "styleclass") {
                                Z.setAttribute("class", ai[ac])
                            } else {
                                if (ac.toLowerCase() != "classid") {
                                    Z.setAttribute(ac, ai[ac])
                                }
                            }
                        }
                    }
                    for (var ab in ag) {
                        if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                            e(Z, ab, ag[ab])
                        }
                    }
                    aa.parentNode.replaceChild(Z, aa);
                    X = Z
                }
            }
            return X
        }

        function e(Z, X, Y) {
            var aa = C("param");
            aa.setAttribute("name", X);
            aa.setAttribute("value", Y);
            Z.appendChild(aa)
        }

        function y(Y) {
            var X = c(Y);
            if (X && X.nodeName == "OBJECT") {
                if (M.ie && M.win) {
                    X.style.display = "none";
                    (function() {
                        if (X.readyState == 4) {
                            b(Y)
                        } else {
                            setTimeout(arguments.callee, 10)
                        }
                    })()
                } else {
                    X.parentNode.removeChild(X)
                }
            }
        }

        function b(Z) {
            var Y = c(Z);
            if (Y) {
                for (var X in Y) {
                    if (typeof Y[X] == "function") {
                        Y[X] = null
                    }
                }
                Y.parentNode.removeChild(Y)
            }
        }

        function c(Z) {
            var X = null;
            try {
                X = j.getElementById(Z)
            } catch (Y) {}
            return X
        }

        function C(X) {
            return j.createElement(X)
        }

        function i(Z, X, Y) {
            Z.attachEvent(X, Y);
            I[I.length] = [Z, X, Y]
        }

        function F(Z) {
            var Y = M.pv,
                X = Z.split(".");
            X[0] = parseInt(X[0], 10);
            X[1] = parseInt(X[1], 10) || 0;
            X[2] = parseInt(X[2], 10) || 0;
            return (Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
        }

        function v(ac, Y, ad, ab) {
            if (M.ie && M.mac) {
                return
            }
            var aa = j.getElementsByTagName("head")[0];
            if (!aa) {
                return
            }
            var X = (ad && typeof ad == "string") ? ad : "screen";
            if (ab) {
                n = null;
                G = null
            }
            if (!n || G != X) {
                var Z = C("style");
                Z.setAttribute("type", "text/css");
                Z.setAttribute("media", X);
                n = aa.appendChild(Z);
                if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                    n = j.styleSheets[j.styleSheets.length - 1]
                }
                G = X
            }
            if (M.ie && M.win) {
                if (n && typeof n.addRule == r) {
                    n.addRule(ac, Y)
                }
            } else {
                if (n && typeof j.createTextNode != D) {
                    n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
                }
            }
        }

        function w(Z, X) {
            if (!m) {
                return
            }
            var Y = X ? "visible" : "hidden";
            if (J && c(Z)) {
                c(Z).style.visibility = Y
            } else {
                v("#" + Z, "visibility:" + Y)
            }
        }

        function L(Y) {
            var Z = /[\\\"<>\.;]/;
            var X = Z.exec(Y) != null;
            return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
        }
        var d = function() {
            if (M.ie && M.win) {
                window.attachEvent("onunload", function() {
                    var ac = I.length;
                    for (var ab = 0; ab < ac; ab++) {
                        I[ab][0].detachEvent(I[ab][1], I[ab][2])
                    }
                    var Z = N.length;
                    for (var aa = 0; aa < Z; aa++) {
                        y(N[aa])
                    }
                    for (var Y in M) {
                        M[Y] = null
                    }
                    M = null;
                    for (var X in swfobject) {
                        swfobject[X] = null
                    }
                    swfobject = null
                })
            }
        }();
        return {
            registerObject: function(ab, X, aa, Z) {
                if (M.w3 && ab && X) {
                    var Y = {};
                    Y.id = ab;
                    Y.swfVersion = X;
                    Y.expressInstall = aa;
                    Y.callbackFn = Z;
                    o[o.length] = Y;
                    w(ab, false)
                } else {
                    if (Z) {
                        Z({
                            success: false,
                            id: ab
                        })
                    }
                }
            },
            getObjectById: function(X) {
                if (M.w3) {
                    return z(X)
                }
            },
            embedSWF: function(ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
                var X = {
                    success: false,
                    id: ah
                };
                if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
                    w(ah, false);
                    K(function() {
                        ae += "";
                        ag += "";
                        var aj = {};
                        if (af && typeof af === r) {
                            for (var al in af) {
                                aj[al] = af[al]
                            }
                        }
                        aj.data = ab;
                        aj.width = ae;
                        aj.height = ag;
                        var am = {};
                        if (ad && typeof ad === r) {
                            for (var ak in ad) {
                                am[ak] = ad[ak]
                            }
                        }
                        if (Z && typeof Z === r) {
                            for (var ai in Z) {
                                if (typeof am.flashvars != D) {
                                    am.flashvars += "&" + ai + "=" + Z[ai]
                                } else {
                                    am.flashvars = ai + "=" + Z[ai]
                                }
                            }
                        }
                        if (F(Y)) {
                            var an = u(aj, am, ah);
                            if (aj.id == ah) {
                                w(ah, true)
                            }
                            X.success = true;
                            X.ref = an
                        } else {
                            if (aa && A()) {
                                aj.data = aa;
                                P(aj, am, ah, ac);
                                return
                            } else {
                                w(ah, true)
                            }
                        }
                        if (ac) {
                            ac(X)
                        }
                    })
                } else {
                    if (ac) {
                        ac(X)
                    }
                }
            },
            switchOffAutoHideShow: function() {
                m = false
            },
            ua: M,
            getFlashPlayerVersion: function() {
                return {
                    major: M.pv[0],
                    minor: M.pv[1],
                    release: M.pv[2]
                }
            },
            hasFlashPlayerVersion: F,
            createSWF: function(Z, Y, X) {
                if (M.w3) {
                    return u(Z, Y, X)
                } else {
                    return undefined
                }
            },
            showExpressInstall: function(Z, aa, X, Y) {
                if (M.w3 && A()) {
                    P(Z, aa, X, Y)
                }
            },
            removeSWF: function(X) {
                if (M.w3) {
                    y(X)
                }
            },
            createCSS: function(aa, Z, Y, X) {
                if (M.w3) {
                    v(aa, Z, Y, X)
                }
            },
            addDomLoadEvent: K,
            addLoadEvent: s,
            getQueryParamValue: function(aa) {
                var Z = j.location.search || j.location.hash;
                if (Z) {
                    if (/\?/.test(Z)) {
                        Z = Z.split("?")[1]
                    }
                    if (aa == null) {
                        return L(Z)
                    }
                    var Y = Z.split("&");
                    for (var X = 0; X < Y.length; X++) {
                        if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                            return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                        }
                    }
                }
                return ""
            },
            expressInstallCallback: function() {
                if (a) {
                    var X = c(R);
                    if (X && l) {
                        X.parentNode.replaceChild(l, X);
                        if (Q) {
                            w(Q, true);
                            if (M.ie && M.win) {
                                l.style.display = "block"
                            }
                        }
                        if (E) {
                            E(B)
                        }
                    }
                    a = false
                }
            }
        }
    }();

    //************ Name: func.js ************* 

    var MODAL_SPEED = 'fast';
    var CREDITS_MULTIPLIER = 100000;
    var jsVersion = 1.0;
    var uagent = navigator.userAgent.toLowerCase();
    var uappver = navigator.appVersion.toLowerCase();
    var isIE = (uappver.indexOf("msie") != -1) ? true : false;
    var isIE6 = (uappver.indexOf("msie 6") != -1) || (uappver.indexOf("msie 5") != -1) ? true : false;
    var isWin = (uappver.indexOf("win") != -1) ? true : false;
    var isFirefox = (uagent.indexOf("firefox") != -1) ? true : false;
    var isFirefox2 = (uagent.indexOf("firefox/2") != -1) ? true : false;
    var isSymbian = (uagent.indexOf("symbianos") != -1) ? true : false;
    var isKonqueror = (uagent.indexOf("konqueror") != -1) ? true : false;
    var isWMobile = (uagent.indexOf("mini") != -1) || (uagent.indexOf("mobi") != -1) || (uappver.indexOf("phone") != -1) || (uagent.indexOf("htc") != -1) || (uappver.indexOf("mobile") != -1) ? true : false;
    var isAMobile = (uagent.indexOf("iphone") != -1) || (uagent.indexOf("ipad") != -1) || (uappver.indexOf("ipod") != -1) ? true : false;
    var isOpera = (uagent.indexOf("opera") != -1 && !isWMobile) ? true : false;
    var isFlash = swfobject.hasFlashPlayerVersion("10") && swfobject.getFlashPlayerVersion().release != 999 && !isKonqueror ? true : false;

    function isWebkit() {
        if (swfobject.ua.wk != false) return true;
        else return false;
    }

    function isMobile() {
        if (isAMobile || isWMobile || isSymbian) return true;
        else return false;
    }

    function track(category, action, label, value) {
        try {
            if (!value) pageTracker._trackEvent(category, action, label);
            else pageTracker._trackEvent(category, action, label, value);
        } catch (e) {}
    }

    function getFlashMovie(movieName) {
        if (window.document[movieName]) {
            return window.document[movieName];
        }
        if (navigator.appName.indexOf("Microsoft Internet") == -1) {
            if (document.embeds && document.embeds[movieName])
                return document.embeds[movieName];
        } else {
            return document.getElementById(movieName);
        }
    }

    function sendRecordingForm() {
        var form = document.getElementById('ivonaform');
        form.action = "online/editor.php";
        form.io_text.value = form.tresc.value;
        form.io_voice.value = getVoice();
        form.submit();
    }

    function showCharLength() {
        var form = document.getElementById('ivonaform');
        return form.tresc.value.length;
    }

    function getShopPid(vid) {
        return voices[vid]['pid'] + '_1';
    }

    function sendSubmit(id) {
        obj = '#' + id;
        jQuery(obj).submit();
    }

    function backRedir(addr) {
        window.location = addr;
        return true;
    }

    function goToLogin(loginURL) {
        window.location = loginURL;
    }

    function ajaxCall(hash, withHistory) {
        withHistory = false;
        if (withHistory == undefined)
            withHistory = true;
        if (withHistory) {
            jQuery.history.load(hash);
        } else
            jQuery.ajax({
                data: hash
            });
    }

    function ebookDown(ebook_id, file_name) {
        jQuery.ajax({
            url: "/ebook.php",
            data: ({
                ebook: ebook_id,
                file: file_name,
                add_ebook: "1"
            }),
            type: "POST",
            success: function(msg) {
                return true;
            }
        });
    }

    function sModalConfirm(message, callback, topval) {
        if (topval == undefined) {
            topval = '15%';
        }
        jQuery('#modConfirm').modal({
            containerCss: {
                height: '266px',
                width: '542px',
                border: '0px',
                top: topval
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                    });
                });
            },
            onShow: function(dialog) {
                dialog.data.find('.message').append(message);
                dialog.data.find('.yes').click(function() {
                    if (jQuery.isFunction(callback)) {
                        callback.apply();
                    }
                    dialog.data.fadeOut(MODAL_SPEED, function() {
                        dialog.container.slideUp(MODAL_SPEED, function() {
                            dialog.overlay.fadeOut(MODAL_SPEED, function() {
                                jQuery.modal.close();
                            });
                        });
                    });
                });
            },
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function sModalError(message, topval) {
        if (topval == undefined) {
            topval = '15%';
        }
        jQuery('#modError').modal({
            containerCss: {
                height: '155px',
                width: '385px',
                border: '0px',
                top: topval
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                    });
                });
            },
            onShow: function(dialog) {
                dialog.data.find('.message').append(message);
            },
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function sModalOk(message, topval) {
        if (topval == undefined) {
            topval = '15%';
        }
        jQuery('#modOk').modal({
            containerCss: {
                height: '155px',
                width: '385px',
                border: '0px',
                top: topval
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                    });
                });
            },
            onShow: function(dialog) {
                dialog.data.find('.message').append(message);
            },
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function voicePopup(message) {
        jQuery('#voicePopup').modal({
            containerCss: {
                height: '155px',
                width: '385px',
                border: '0px',
                top: "0px"
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                    });
                });
            },
            onShow: function(dialog) {
                dialog.data.find('.message').append(message);
            },
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function goBack() {
        history.go(-1);
    }

    function htmlspecialchars(str) {
        if (typeof(str) == "string") {
            str = str.replace(/&/g, "&amp;");
            str = str.replace(/"/g, "&quot;");
            str = str.replace(/'/g, "&#039;");
            str = str.replace(/</g, "&lt;");
            str = str.replace(/>/g, "&gt;");
        }
        return str;
    }

    function dhtmlspecialchars(str) {
        if (typeof(str) == "string") {
            str = str.replace(/&gt;/ig, ">");
            str = str.replace(/&lt;/ig, "<");
            str = str.replace(/&#039;/g, "'");
            str = str.replace(/&quot;/ig, '"');
            str = str.replace(/&amp;/ig, '&');
        }
        return str;
    }

    function validator(string) {
        if (string == undefined)
            return false;
        return true;
    }

    function getCenterWindows(idpopup) {
        var IE = (document.all && !window.opera) ? true : false;
        var tempsX = 0;
        var tempsY = 0;
        var tempoX = 0;
        var tempoY = 0;
        var centerX = 0;
        var centerY = 0;
        if (IE) {
            tempoX = document.documentElement.clientWidth;
            tempoY = document.documentElement.clientHeight;
            tempsX = document.documentElement.scrollLeft;
            tempsY = document.documentElement.scrollTop;
        } else {
            tempoX = window.innerWidth;
            tempoY = window.innerHeight;
            tempsX = window.pageXOffset;
            tempsY = window.pageYOffset;
        }
        centerX = Math.round(tempoX / 2) + tempsX - (Math.round(jQuery('#' + idpopup).attr("offsetWidth") / 2));
        centerY = Math.round(tempoY / 2) + tempsY - (Math.round(jQuery('#' + idpopup).attr("offsetHeight") / 2));
        return new Array(centerX, centerY);
    }

    function makePrice(currency, price) {
        if ('PLN' == currency) {
            return ' ' + (String(price)).replace(/\./, ",") + ' zł';
        } else if ('EUR' == currency) {
            return ' &#8364;' + price;
        } else {
            return ' $' + price;
        }
        return;
    }

    function promo() {
        jQuery.post("/se.php", {}, function(data) {}, "text");
        setTimeout("promo()", 1200000);
    }

    function ib() {
        if (document.location.href.indexOf("beta.ivona.com") != -1) {
            $('#pageTop').css('background', '#dd3')
        }
    }

    function externalLinks() {
        if (!document.getElementsByTagName) return;
        var anchors = document.getElementsByTagName("a");
        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            if (anchor.getAttribute("href") && anchor.getAttribute("rel") == "nofollow")
                anchor.target = "_blank";
        }
    }
    var iManager = {
        start: function() {
            var f = {};
            var a = {
                id: "iMan",
                name: "iMan"
            };
            var p = {
                quality: "autohigh",
                swliveconnect: "true",
                allowscriptaccess: "always"
            };
            document.write("<div id=\"" + "iMan" + "\"></div>");
            if (isFlash) {
                swfobject.embedSWF(STATIC_HOST_COM + "/flash/iManager.swf", "iMan", "10", "10", "9.0.0", STATIC_HOST_COM + "/flash/expressInstall.swf", f, p, a);
            }
        },
        enc: function(l) {
            try {
                return getFlashMovie("iMan").getHash(l);
            } catch (e) {
                alert(e)
            }
        }
    };
    $(document).ready(function() {
        externalLinks();
        ib();
        $(".accessHelp").focus(function() {
            $(this).css("top", "55px")
        });
        $(".accessHelp").blur(function() {
            $(this).css("top", "-55px")
        });
        $("#stNav").bind("click", function() {
            $("#navBegin").focus();
            $(this).blur()
        });
        $("#stContent").bind("click", function() {
            $("#navEnd").focus();
            $(this).blur()
        });
        $(".mbtn").mouseover(function() {
            $(".mbtn .spriteClass").hide()
        });
        $(".accCont").mouseover(function() {
            $(".accCont .spriteClass").hide()
        });
    });
    jQuery(function() {
        jQuery("ul.sf-menu").superfish({
            hoverClass: 'sfHover',
            pathLevels: 1,
            delay: 1000,
            animation: {
                opacity: 'show'
            },
            speed: 'normal',
            autoArrows: false,
            dropShadows: false,
            disableHI: true,
            onBeforeShow: function() {
                $('.sfHover').removeClass('sfHover')
            }
        });
    });

    function setCookie(c_name, value, expiredays, domain) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/" + ((domain == null) ? "" : ";domain=" + domain);
    }

    function eraseCookie(c_name, domain) {
        setCookie(c_name, "", -1, domain);
    }

    function newsletter_send(lang, configArr) {
        var emailFormat = /^[-\w](\.?[-\w])*@[-\w](\.?[-\w])*\.[a-z]{2,4}$/i;
        var email = jQuery('#' + configArr["emailModalFieldId"]).attr('value');
        if (email == '') {
            jQuery('#' + configArr["emailModalFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText1"]);
            return false;
        }
        if (email.length < 6 || email.length > 80 || !emailFormat.test(email)) {
            jQuery('#' + configArr["emailModalFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText2"]);
            return false;
        }
        var email_confirm = jQuery('#' + configArr["emailModalConfirmFieldId"]).attr('value');
        if (email != email_confirm) {
            jQuery('#' + configArr["emailModalConfirmFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText3"]);
            return false;
        }
        var hf = 2 * email.charCodeAt(3) + email.charCodeAt(1) + 4 * email.charCodeAt(6) - 5;
        jQuery('#' + configArr["crcFieldNameId"]).attr("value", hf);
        response = jQuery.ajax({
            url: configArr["url"],
            global: false,
            type: "GET",
            data: ({
                p1: email,
                p2: hf,
                a: 'SUBSCRIBE',
                l: lang,
                ap: configArr["newsletterSource"]
            }),
            dataType: "text",
            async: false,
            success: function(msg) {}
        }).responseText;
        var oldFormValue = jQuery('#' + configArr["responseFieldId"]).html();
        console.log(response);
        if (response == 'OK') {
            newsletter_switch_box(configArr["boxOKId"], configArr);
        } else if (response == 'ERR_EMAIL_EXISTS') {
            newsletter_switch_box(configArr["boxExistsId"], configArr);
        } else {
            newsletter_switch_box(configArr["boxErrorId"], configArr);
        }
        return true;
    }

    function newsletter_switch_box(id, configArr) {
        jQuery('#' + configArr["boxFormId"]).hide();
        jQuery('#' + configArr["boxOKId"]).hide();
        jQuery('#' + configArr["boxExistsId"]).hide();
        jQuery('#' + configArr["boxErrorId"]).hide();
        jQuery('#' + id).show();
    }

    function newsletter_modal(configArr) {
        var oElement = jQuery('#' + configArr["subscribeFieldId"])[0];
        var topval = 0;
        var leftval = 0;
        while (oElement != null) {
            topval += oElement.offsetTop;
            leftval += oElement.offsetLeft;
            oElement = oElement.offsetParent;
        }
        topval = topval - 136;
        leftval = leftval - 5;
        var email = jQuery('#' + configArr["emailFieldId"]).attr('value');
        jQuery('#' + configArr["emailModalFieldId"]).attr('value', email);
        jQuery('#newsletter_modal').modal({
            containerCss: {
                height: '60px',
                width: '360px',
                border: '0px',
                top: topval,
                left: leftval
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                        jQuery('#' + configArr["emailModalConfirmFieldId"]).focus();
                    });
                });
            },
            onShow: function(dialog) {},
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function trial_send(lang, configArr) {
        var emailFormat = /^[-\w](\.?[-\w])*@[-\w](\.?[-\w])*\.[a-z]{2,4}$/i;
        var email = jQuery('#' + configArr["emailModalFieldId"]).attr('value');
        if (email == '') {
            jQuery('#' + configArr["emailModalFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText1"]);
            return false;
        }
        if (email.length < 6 || email.length > 80 || !emailFormat.test(email)) {
            jQuery('#' + configArr["emailModalFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText2"]);
            return false;
        }
        var email_confirm = jQuery('#' + configArr["emailModalConfirmFieldId"]).attr('value');
        if (email != email_confirm) {
            jQuery('#' + configArr["emailModalConfirmFieldId"]).focus();
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText3"]);
            return false;
        }
        var mrc = jQuery("input[name=trial_modal_checkbox]:checked").length;
        if (mrc == 0) {
            jQuery('#' + configArr["modalErrorId"]).html(configArr["validationText4"]);
            return false;
        }
        var hf = 3 * email.charCodeAt(2) + 2 * email.charCodeAt(3) + 4 * email.charCodeAt(5) - 3;
        jQuery('#' + configArr["crcFieldNameId"]).attr("value", hf);
        response = jQuery.ajax({
            url: configArr["url"],
            global: false,
            type: "GET",
            data: ({
                p1: email,
                p2: hf,
                a: 'SUBSCRIBE',
                p3: configArr["installer"],
                l: lang,
                ap: configArr["newsletterSource"]
            }),
            dataType: "text",
            async: false,
            success: function(msg) {}
        }).responseText;
        var oldFormValue = jQuery('#' + configArr["responseFieldId"]).html();
        if (response == 'OK') {
            trial_switch_box(configArr["boxOKId"], configArr);
        } else if (response == 'ERR_EMAIL_EXISTS') {
            trial_switch_box(configArr["boxExistsId"], configArr);
        } else {
            trial_switch_box(configArr["boxErrorId"], configArr);
        }
        return true;
    }

    function trial_switch_box(id, configArr) {
        jQuery('#' + configArr["boxFormId"]).hide();
        jQuery('#' + configArr["boxOKId"]).hide();
        jQuery('#' + configArr["boxExistsId"]).hide();
        jQuery('#' + configArr["boxErrorId"]).hide();
        jQuery('#' + id).show();
    }

    function trial_modal(configArr, position) {
        if (position == 1) {
            var baseElemName = configArr["subscribeFieldId"];
            var vpos = -136;
            var hpos = 100;
        } else if (position == 2) {
            var baseElemName = configArr["subscribeField2Id"];
            var vpos = -136;
            var hpos = 200;
        } else {
            return false;
        }
        var oElement = jQuery('#' + baseElemName)[0];
        var topval = 0;
        var leftval = 0;
        while (oElement != null) {
            topval += oElement.offsetTop;
            leftval += oElement.offsetLeft;
            oElement = oElement.offsetParent;
        }
        topval = topval + vpos;
        leftval = leftval + hpos;
        jQuery('#trial_modal').modal({
            containerCss: {
                height: '80px',
                width: '450px',
                border: '0px',
                top: topval,
                left: leftval
            },
            overlay: (20),
            onOpen: function(dialog) {
                dialog.overlay.fadeIn(MODAL_SPEED, function() {
                    dialog.container.slideDown(MODAL_SPEED, function() {
                        dialog.data.fadeIn(MODAL_SPEED);
                        dialog.container.css('position', 'absolute');
                        jQuery('#' + configArr["emailModalFieldId"]).focus();
                    });
                });
            },
            onShow: function(dialog) {},
            onClose: function(dialog) {
                dialog.data.fadeOut(MODAL_SPEED, function() {
                    dialog.container.slideUp(MODAL_SPEED, function() {
                        dialog.overlay.fadeOut(MODAL_SPEED, function() {
                            jQuery.modal.close();
                        });
                    });
                });
            }
        });
    }

    function inputText(a, b, c) {
        $(document).ready(function() {
            if ($(a).val() == "") {
                $(a).val(b).addClass(c);
            }
            $(a).blur(function() {
                if ($(a).val() == "") {
                    $(a).val(b).addClass(c);
                }
            });
            $(a).focus(function() {
                if ($(a).val() == b) {
                    $(a).val("").removeClass(c);
                }
            });
        });
    }

    //****** Name: jquery.checkgroup.js ****** 

    (function($) {
        $.fn.checkgroup = function(options) {
            settings = $.extend({
                groupSelector: null,
                groupName: 'group_name',
                enabledOnly: false,
                onComplete: null,
                onChange: null
            }, options || {});
            var ctrl_box = this;
            var grp_slctr = (settings.groupSelector == null) ? 'input[name=' + settings.groupName + ']' : settings.groupSelector;
            var _onComplete = settings.onComplete;
            var _onChange = settings.onChange;
            if (settings.enabledOnly) {
                grp_slctr += ':enabled';
            }
            ctrl_box.click(function(e) {
                var chk_val = (e.target.checked);
                var boxes = Array();
                var $i = 0;
                $(grp_slctr).each(function() {
                    if (this.checked != chk_val) {
                        boxes[$i] = this;
                        this.checked = chk_val;
                        if (typeof _onChange == "function") {
                            _onChange(this);
                        }
                        $i++;
                    }
                });
                ctrl_box.attr('checked', chk_val);
                if (typeof _onComplete == "function") {
                    _onComplete(boxes);
                }
            });
            $(grp_slctr).click(function() {
                if (!this.checked) {
                    ctrl_box.attr('checked', false);
                } else {
                    if ($(grp_slctr).size() == $(grp_slctr + ':checked').size()) {
                        ctrl_box.attr('checked', 'checked');
                    }
                }
            });
            return this;
        };
    })(jQuery);

    //***** Name: jquery.simplemodal.js ****** 

    eval(function(p, a, c, k, e, d) {
        e = function(c) {
            return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
        };
        if (!''.replace(/^/, String)) {
            while (c--) d[e(c)] = k[c] || e(c);
            k = [function(e) {
                return d[e]
            }];
            e = function() {
                return '\\w+'
            };
            c = 1;
        };
        while (c--)
            if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        return p;
    }('(6($){$.8=6(3,f){b $.8.x.R(3,f)};$.8.d=6(){$.8.x.d(P)};$.1o.8=6(f){b $.8.x.R(1,f)};$.8.10={c:1n,11:\'12\',14:{},S:\'T\',V:{},d:P,W:\'1q\',r:\'1u\',I:i,H:q,B:q,L:q};$.8.x={4:q,2:{},R:6(3,f){5(1.2.3){b i}1.4=$.t({},$.8.10,f);5(u 3==\'1v\'){3=3 1t C?3:$(3);5(3.N().N().1s()>0){1.2.z=3.N();5(!1.4.I){1.2.1i=3.1r(P)}}}9 5(u 3==\'1x\'||u 3==\'1m\'){3=$(\'<F>\').1l(3)}9{5(X){X.1p(\'1w 1G: 1K 3 1J: \'+u 3)}b i}1.2.3=3.D(\'1y\');3=q;1.Y();1.1b();5($.K(1.4.B)){1.4.B.M(1,[1.2])}b 1},Y:6(){1.2.c=$(\'<F>\').13(\'15\',1.4.11).D(\'12\').h($.t(1.4.14,{1e:1.4.c/s,y:\'s%\',k:\'s%\',p:\'U\',1c:0,1d:0,Q:1H})).n().m(\'j\');1.2.l=$(\'<F>\').13(\'15\',1.4.S).D(\'T\').h($.t(1.4.V,{p:\'U\',Q:1C})).1j(1.4.d?\'<a 1D="16 \'+1.4.r+\'" 1F="\'+1.4.W+\'"></a>\':\'\').n().m(\'j\');5($.Z.1E&&($.Z.1I<7)){1.17()}1.2.l.1j(1.2.3.n())},1f:6(){E 8=1;$(\'.\'+1.4.r).G(6(e){e.19();8.d()});$(v).1z(\'18\',6(e){5(1A==e.1B){e.19();C(\'.16\').G()}})},1h:6(){$(\'.\'+1.4.r).1g(\'G\');$(v).1g(\'18\')},17:6(){E J=$(v.j).y()+\'1a\';E O=$(v.j).k()+\'1a\';1.2.c.h({p:\'A\',y:J,k:O});1.2.l.h({p:\'A\'});1.2.g=$(\'<g 1L="1O:i;">\').h($.t(1.4.1N,{1e:0,p:\'A\',y:J,k:O,Q:1M,k:\'s%\',1d:0,1c:0})).n().m(\'j\')},1b:6(){5(1.2.g){1.2.g.w()}5($.K(1.4.H)){1.4.H.M(1,[1.2])}9{1.2.c.w();1.2.l.w();1.2.3.w()}1.1f()},d:6(1k){5(!1.2.3){b i}5($.K(1.4.L)&&!1k){1.4.L.M(1,[1.2])}9{5(1.2.z){5(1.4.I){1.2.3.n().m(1.2.z)}9{1.2.3.o();1.2.1i.m(1.2.z)}}9{1.2.3.o()}1.2.l.o();1.2.c.o();5(1.2.g){1.2.g.o()}1.2={}}1.1h()}}})(C);', 62, 113, '|this|dialog|data|opts|if|function||modal|else||return|overlay|close||options|iframe|css|false|body|width|container|appendTo|hide|remove|position|null|closeClass|100|extend|typeof|document|show|impl|height|parentNode|absolute|onShow|jQuery|addClass|var|div|click|onOpen|persist|wHeight|isFunction|onClose|apply|parent|wWidth|true|zIndex|init|containerId|modalContainer|fixed|containerCss|closeTitle|console|create|browser|defaults|overlayId|modalOverlay|attr|overlayCss|id|modalCloseImg|fixIE|keydown|preventDefault|px|open|left|top|opacity|bindEvents|unbind|unbindEvents|original|append|external|html|number|50|fn|log|Close|clone|size|instanceof|modalClose|object|SimpleModal|string|modalData|bind|27|keyCode|3100|class|msie|title|Error|3000|version|type|Unsupported|src|1000|iframeCss|javascript'.split('|'), 0, {}));


    //******* Name: jquery.taconite.js ******* 

    (function($) {
        $.taconite = function(xml) {
            processDoc(xml);
        };
        $.taconite.debug = 0;
        $.taconite.version = '3.03';
        $.taconite.defaults = {
            cdataWrap: 'div'
        };
        if (typeof $.fn.replace == 'undefined')
            $.fn.replace = function(a) {
                return this.after(a).remove();
            };
        if (typeof $.fn.replaceContent == 'undefined')
            $.fn.replaceContent = function(a) {
                return this.empty().append(a);
            };
        $.expr[':'].taconiteTag = 'a.taconiteTag';
        $.taconite._httpData = $.httpData;
        $.httpData = $.taconite.detect = function(xhr, type) {
            var ct = xhr.getResponseHeader('content-type');
            if ($.taconite.debug) {
                log('[AJAX response] content-type: ', ct, ';  status: ', xhr.status, ' ', xhr.statusText, ';  has responseXML: ', xhr.responseXML != null);
                log('type: ' + type);
                log('responseXML: ' + xhr.responseXML);
            }
            var data = $.taconite._httpData(xhr, type);
            if (data && data.documentElement) {
                var root = data.documentElement.tagName;
                log('XML document root: ', root);
                if (root == 'taconite') {
                    log('taconite command document detected');
                    $.taconite(data);
                }
            } else {
                log('jQuery core httpData returned: ' + data);
                log('httpData: response is not XML (or not "valid" XML)');
            }
            return data;
        };
        $.taconite.enableAutoDetection = function(b) {
            $.httpData = b ? $.taconite.detect : $.taconite._httpData;
        };
        var logCount = 0;

        function log() {
            if (!$.taconite.debug || !window.console || !window.console.log) return;
            if (!logCount++)
                log('Plugin Version: ' + $.taconite.version);
            window.console.log('[taconite] ' + [].join.call(arguments, ''));
        };

        function processDoc(xml) {
            var status = true,
                ex;
            try {
                $.event.trigger('taconite-begin-notify', [xml])
                status = go(xml);
            } catch (e) {
                status = ex = e;
            }
            $.event.trigger('taconite-complete-notify', [xml, !!status, status === true ? null : status]);
            if (ex) throw ex;
        };

        function go(xml) {
            var trimHash = {
                wrap: 1
            };
            if (typeof xml == 'string')
                xml = convert(xml);
            if (!xml || !xml.documentElement) {
                log('$.taconite invoked without valid document; nothing to process');
                return false;
            }
            try {
                var t = new Date().getTime();
                process(xml.documentElement.childNodes);
                $.taconite.lastTime = (new Date().getTime()) - t;
                log('time to process response: ' + $.taconite.lastTime + 'ms');
            } catch (e) {
                if (window.console && window.console.error)
                    window.console.error('[taconite] ERROR processing document: ' + e);
                throw e;
            }
            return true;

            function convert(s) {
                var doc;
                log('attempting string to document conversion');
                try {
                    if ($.browser.msie) {
                        doc = $("<xml>")[0];
                        doc.async = 'false';
                        doc.loadXML(s);
                    } else {
                        var parser = new DOMParser();
                        doc = parser.parseFromString(s, 'text/xml');
                    }
                } catch (e) {
                    if (window.console && window.console.error)
                        window.console.error('[taconite] ERROR parsing XML string for conversion: ' + e);
                    throw e;
                }
                var ok = doc && doc.documentElement && doc.documentElement.tagName != 'parsererror';
                log('conversion ', ok ? 'successful!' : 'FAILED');
                return doc;
            };

            function process(commands) {
                var doPostProcess = 0;
                for (var i = 0; i < commands.length; i++) {
                    if (commands[i].nodeType != 1)
                        continue;
                    var cmdNode = commands[i],
                        cmd = cmdNode.tagName;
                    if (cmd == 'eval') {
                        var js = (cmdNode.firstChild ? cmdNode.firstChild.nodeValue : null);
                        log('invoking "eval" command: ', js);
                        if (js) $.globalEval(js);
                        continue;
                    }
                    var q = cmdNode.getAttribute('select');
                    var jq = $(q);
                    if (!jq[0]) {
                        log('No matching targets for selector: ', q);
                        continue;
                    }
                    var cdataWrap = cmdNode.getAttribute('cdataWrap') || $.taconite.defaults.cdataWrap;
                    var a = [];
                    if (cmdNode.childNodes.length > 0) {
                        doPostProcess = 1;
                        for (var j = 0, els = []; j < cmdNode.childNodes.length; j++)
                            els[j] = createNode(cmdNode.childNodes[j]);
                        a.push(trimHash[cmd] ? cleanse(els) : els);
                    }
                    var n = cmdNode.getAttribute('name');
                    var v = cmdNode.getAttribute('value');
                    if (n !== null) a.push(n);
                    if (v !== null) a.push(v);
                    for (var j = 1; true; j++) {
                        v = cmdNode.getAttribute('arg' + j);
                        if (v === null)
                            break;
                        a.push(v);
                    }
                    if ($.taconite.debug) {
                        var arg = els ? '...' : a.join(',');
                        log("invoking command: $('", q, "').", cmd, '(' + arg + ')');
                    }
                    jq[cmd].apply(jq, a);
                }
                if (doPostProcess)
                    postProcess();

                function postProcess() {
                    if ($.browser.mozilla) return;
                    $('select:taconiteTag').each(function() {
                        var sel = this;
                        $('option:taconiteTag', this).each(function() {
                            this.setAttribute('selected', 'selected');
                            this.taconiteTag = null;
                            if (sel.type == 'select-one') {
                                var idx = $('option', sel).index(this);
                                sel.selectedIndex = idx;
                            }
                        });
                        this.taconiteTag = null;
                    });
                };

                function cleanse(els) {
                    for (var i = 0, a = []; i < els.length; i++)
                        if (els[i].nodeType == 1) a.push(els[i]);
                    return a;
                };

                function createNode(node) {
                    var type = node.nodeType;
                    if (type == 1) return createElement(node);
                    if (type == 3) return fixTextNode(node.nodeValue);
                    if (type == 4) return handleCDATA(node.nodeValue);
                    return null;
                };

                function handleCDATA(s) {
                    var el = document.createElement(cdataWrap);
                    el.innerHTML = s;
                    return el;
                };

                function fixTextNode(s) {
                    if ($.browser.msie) s = s.replace(/\n/g, '\r').replace(/\s+/g, ' ');
                    return document.createTextNode(s);
                };

                function createElement(node) {
                    var e, tag = node.tagName.toLowerCase();
                    if ($.browser.msie) {
                        var type = node.getAttribute('type');
                        if (tag == 'table' || type == 'radio' || type == 'checkbox' || tag == 'button' || (tag == 'select' && node.getAttribute('multiple'))) {
                            e = document.createElement('<' + tag + ' ' + copyAttrs(null, node, true) + '>');
                        }
                    }
                    if (!e) {
                        e = document.createElement(tag);
                        copyAttrs(e, node, tag == 'option' && $.browser.safari);
                    }
                    if ($.browser.msie && tag == 'td') {
                        var colspan = node.getAttribute('colspan');
                        if (colspan) e.colSpan = parseInt(colspan);
                    }
                    if ($.browser.msie && !e.canHaveChildren) {
                        if (node.childNodes.length > 0)
                            e.text = node.text;
                    } else {
                        for (var i = 0, max = node.childNodes.length; i < max; i++) {
                            var child = createNode(node.childNodes[i]);
                            if (child) e.appendChild(child);
                        }
                    }
                    if (!$.browser.mozilla) {
                        if (tag == 'select' || (tag == 'option' && node.getAttribute('selected')))
                            e.taconiteTag = 1;
                    }
                    return e;
                };

                function copyAttrs(dest, src, inline) {
                    for (var i = 0, attr = ''; i < src.attributes.length; i++) {
                        var a = src.attributes[i],
                            n = $.trim(a.name),
                            v = $.trim(a.value);
                        if (inline) attr += (n + '="' + v + '" ');
                        else if (n == 'style') {
                            dest.style.cssText = v;
                            dest.setAttribute(n, v);
                        } else $.attr(dest, n, v);
                    }
                    return attr;
                };
            };
        };
    })(jQuery);

    //*********** Name: speaker.js *********** 

    var speaker = function() {
        var W = window,
            D = document,
            N = navigator,
            regex = {
                empty: /^[\s\n\r\t]*$/gi,
                getIndex: /[^0-9]+/g
            },
            nop = 0,
            data = [],
            errors = [],
            appStatus = 0,
            current = 0,
            useHtmlAudio = false,
            panelName, fldivName, flObjName = '',
            appName = 'speaker',
            opt = {
                appHost: '',
                parentID: null,
                flashPath: "/static/ivona/speaker.swf",
                stopHTML: '<span class="speaker speakerStop"></span>',
                playHTML: '<span class="speaker speakerPlay"></span>',
                accPlay: 'Listen: ',
                accStop: 'Stop: ',
                accOpen: '<span style="position:fixed;top:-9999px;left:1px;width:1px;height:1px" >',
                accClose: '</span>',
                onLoadEvent: function() {},
                panelClass: 'abs speakerPanelClass'
            };

        function configure(k) {
            if (!k) k = opt;
            else {
                for (var dfo in opt) {
                    if (isSet(k[dfo])) opt[dfo] = k[dfo];
                }
            }
        }

        function isSet(a) {
            if (typeof a != 'undefined') return true;
            else return false;
        }

        function isString(a) {
            if ((typeof a).toLowerCase() == 'string') return true;
            else return false;
        }

        function isObject(a) {
            if ((typeof a).toLowerCase() == 'object') return true;
            else return false;
        }

        function buildLinks(a) {
            a.title = a.title || '';
            if (!isOperaMini) {
                a.linkPlay = (isSet(a.playHTML) ? a.playHTML : opt['playHTML']) + opt['accOpen'] + opt['accPlay'] + a.title + opt['accClose'];
                a.linkStop = (isSet(a.stopHTML) ? a.stopHTML : opt['stopHTML']) + opt['accOpen'] + opt['accStop'] + a.title + opt['accClose'];
            } else {
                a.linkPlay = (isSet(a.playHTML) ? a.playHTML : opt['playHTML']);
                a.linkStop = (isSet(a.stopHTML) ? a.stopHTML : opt['stopHTML']);
            }
        }

        function create(a, b, c) {
            if (a.indexOf('http%3A') != -1 || a.indexOf('https%3A') != -1) a = unescape(a);
            nop++;
            var playerDefaultOptions = {
                playCallback: null,
                stopCallback: null,
                soundEnded: function() {},
                parentID: null
            }
            var options;
            if (isString(b)) {
                c = c || {}
                options = $.extend(true, playerDefaultOptions, c);
                options.title = b;
            } else if (isObject(b)) {
                options = $.extend(true, playerDefaultOptions, b);
            }
            options.url = a;
            options.linkID = appName + '_playLink' + nop;
            options.isPlaying = 0;
            data[nop] = {};
            $.extend(true, data[nop], options);
            buildLinks(data[nop]);
            var playerHTML = '' + '<span id="' + appName + '_playerNo' + nop + '" class="accCont" style="position:relative"> ' + '<a id="' + data[nop].linkID + '" style="position:relative" ' + 'href="' + (noFlashAndHtmlAudio ? a : 'javascript:void null') + '" >' +
                data[nop].linkPlay + '</a>' + '</span>';
            if (data[nop].parentID != null) {
                $("#" + data[nop].parentID).html(playerHTML)
            } else {
                document.write(playerHTML);
            }
            if (useHtmlAudio) {
                var myau = data[nop].html5audio = document.createElement('audio');
                myau.id = "speakerAudioObj_" + nop;
                if (!regex.empty.test(a)) {
                    myau.setAttribute('src', a);
                    myau.load();
                }
                _html_addListeners(myau);
                $("#" + appName + '_playerNo' + nop).append(myau);
            } else {
                data[nop].html5audio = false;
            }
            if ($.isFunction(data[nop].playCallback)) {
                $("#" + data[nop].linkID).bind("click", function() {
                    speaker.data[getPlayerIndex(this.id)].playCallback();
                });
            } else {
                $("#" + data[nop].linkID).bind("click", function() {
                    speaker.play(getPlayerIndex(this.id));
                });
            }
            return nop;
        }

        function getPlayerIndex(id) {
            return parseInt(id.replace(regex.getIndex, ''));
        }

        function _ui_updateStopped(a) {
            $("#" + data[a].linkID).html(data[a]['linkPlay']);
            $("#" + data[a].linkID).unbind("click");
            if ($.isFunction(data[a].playCallback)) {
                $("#" + data[a].linkID).bind("click", function() {
                    speaker.data[getPlayerIndex(this.id)].playCallback();
                });
            } else {
                $("#" + data[a].linkID).bind("click", function() {
                    speaker.play(getPlayerIndex(this.id));
                });
            }
            data[a].isPlaying = 0;
        }

        function _ui_updatePlaying(a) {
            $('#' + appName + '_playLink' + a).html(data[a].linkStop);
            $("#" + data[a].linkID).unbind("click");
            if ($.isFunction(data[a].stopCallback)) {
                $("#" + data[a].linkID).bind("click", function() {
                    speaker.data[getPlayerIndex(this.id)].stopCallback();
                });
            } else {
                $("#" + data[a].linkID).bind("click", function() {
                    speaker.stop(getPlayerIndex(this.id));
                });
            }
            data[a].isPlaying = 1;
        }

        function play(b) {
            for (var i = 1; i < data.length; i++) {
                if (i != b) {
                    _html_stop(i);
                    _ui_updateStopped(i);
                } else {
                    if (useHtmlAudio) {
                        _html_play(i);
                        _ui_updatePlaying(i);
                    } else {
                        _flash_loadAudio(data[i].url, b);
                        _ui_updatePlaying(i);
                    }
                }
            }
            current = b;
        }

        function stop(b) {
            if (useHtmlAudio) {
                _html_stop(b);
                _ui_updateStopped(b);
                if ($.isFunction(data[b]['soundEnded'])) data[b]['soundEnded']();
            } else {
                _flash_stopAudio();
                for (var a = 1; a < data.length; a++) {
                    _ui_updateStopped(a);
                }
            }
            current = 0;
        }

        function _html_play(a) {
            _html_getAudioAtIndex(a).play();
        }

        function _html_pause(a) {
            var au = _html_getAudioAtIndex(a)
            au.pause();
        }

        function _html_stop(a) {
            var au = _html_getAudioAtIndex(a)
            if (data[a].isPlaying && !!(_html_getAudioAtIndex(a))) {
                try {
                    au.pause();
                    au.currentTime = 0;
                    if (au.currentTime != 0) {
                        au.src = au.src;
                    }
                } catch (e) {
                    au.src = au.src;
                }
            }
        }

        function debug(a) {
            alert(a);
        }

        function _html_getAudioAtIndex(a) {
            return data[a]['html5audio'];
        }

        function _html_getIndexFromEvent(e) {
            return (getPlayerIndex(e.target.id))
        }

        function _html_getAudioFromEvent(e) {
            var i = _html_getIndexFromEvent(e);
            return data[i]['html5audio'];
        }

        function _html_addListeners(a) {
            var f = function(x, y) {
                a.addEventListener(x, y, false)
            };
            f("timeupdate", function(event) {});
            f("progress", function(event) {});
            f("durationchange", function(event) {});
            f("play", function(event) {});
            f("playing", function(event) {});
            f("pause", function(event) {});
            f("waiting", function(event) {});
            f("canplay", function(event) {});
            f("seeking", function(event) {});
            f("seeked", function(event) {});
            f("suspend", function(event) {});
            f("ended", function(event) {
                var i = _html_getIndexFromEvent(event)
                _html_stop(i);
                speaker.soundEnded(i);
            });
            f("error", function(event) {});
        }

        function _flash_loadAudio(a, b) {
            getFlash(flObjName).loadAudio(a, b);
            opt.onLoadEvent();
        }

        function _flash_stopAudio() {
            getFlash(flObjName).stopAudio();
        }

        function getFlash(mN) {
            if (D.getElementById(mN) && D.getElementById(mN) != 'undefined') return D.getElementById(mN);
            else {
                if (window.document[mN] && window.document[mN] != 'undefined') return window.document[mN];
                if (!isIE && D.embeds && document.embeds[mN] != 'undefined') return D.embeds[mN];
            }
            return null;
        }

        function ua(v) {
            if (navigator.userAgent.toLowerCase().indexOf(v) != -1) return true;
            else return false;
        }

        function uav(v) {
            if (navigator.appVersion.toLowerCase().indexOf(v) != -1) return true;
            else return false;
        }

        function detectHTML5Audio() {
            var a = document.createElement('audio');
            var mp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
            var aac = !!(a.canPlayType && a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));
            var wav = !!(a.canPlayType && a.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
            var ogg = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
            return mp3;
        }

        function detectFlash() {
            var a = false,
                n = navigator,
                nP = n.plugins,
                obj, type, types, AX = W.ActiveXObject;
            if (nP && nP.length) {
                type = 'application/x-shockwave-flash';
                types = n.mimeTypes;
                if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
                    a = true;
                }
            } else if (isSet(AX)) {
                try {
                    obj = new AX('ShockwaveFlash.ShockwaveFlash');
                } catch (e) {}
                a = (!!obj);
            }
            return !!(a);
        };
        (function() {
            isIE = uav("msie");
            isOpera = ua("opera") ? true : false;
            isOperaMini = (ua("opera") && ua("mini")) ? true : false;
            isWK = ua("applewebkit");
            isAndroid = uav("android");
            isFlash = detectFlash();
            isHTML5 = detectHTML5Audio();
            useHtmlAudio = (!isFlash || isWK || isAndroid) && isHTML5;
            noFlashAndHtmlAudio = (!isFlash && !useHtmlAudio);
            if (isFlash) {
                try {
                    if (typeof $ == 'undefined') {
                        throw new Error("Speaker requires jQuery as window.$");
                    }
                    if (typeof swfobject == 'undefined') {
                        throw new Error("Speaker requires swfObject as window.swfobject");
                    }
                } catch (e) {
                    alert(e);
                    return {};
                }
            }
        })();
        if (typeof SpeakerAsyncInit != 'function' && typeof SpeakerAsyncCommands == 'undefined') {
            $(D).ready(function() {
                speakerOnDomLoadFunction();
            });
        } else {
            try {
                setTimeout(function() {
                    speakerOnDomLoadFunction();
                }, 500)
            } catch (e) {}
        }

        function speakerOnDomLoadFunction() {
            panelName = appName + "Panel";
            fldivName = appName + "FlDiv";
            flObjName = appName + "FlObj";
            var body = document.body;
            var panel = document.createElement("div");
            var fldiv = document.createElement("div");
            panel.id = panelName;
            panel.className = opt.panelClass;
            fldiv.id = fldivName;
            fldiv.className = "k ";
            panel.appendChild(fldiv);
            body.appendChild(panel);
            if (!useHtmlAudio && isFlash) {
                var flashvars = {};
                var attributes = {
                    id: flObjName,
                    name: flObjName
                };
                var params = {
                    quality: "low",
                    swliveconnect: "true",
                    allowscriptaccess: "always"
                };
                if (swfobject.hasFlashPlayerVersion("10")) {
                    isFlash = 1;
                    swfobject.embedSWF(opt['appHost'] + opt['flashPath'], fldivName, "1", "1", "10.0.0", '', flashvars, params, attributes);
                } else {
                    isFlash = 0;
                }
            }
        }
        return {
            create: function(a, b, c) {
                return create(a, b, c)
            },
            stop: function(a) {
                stop(a)
            },
            play: function(a) {
                play(a)
            },
            config: function(k, v) {
                configure(k, v)
            },
            update: function(a, b, c) {
                if (!isSet(data[a])) return;
                if (!regex.empty.test(b)) {
                    data[a]['url'] = b;
                    if (useHtmlAudio) {
                        audio = _html_getAudioAtIndex(a);
                        $(audio).attr('src', b);
                    }
                    if (noFlashAndHtmlAudio) {
                        $("#" + data[a]['linkID']).attr("href", b);
                    }
                }
                if (isSet(c)) {
                    $.extend(true, data[a], c);
                    if (isSet(c.playHTML) || isSet(c.stopHTML)) {
                        buildLinks(data[a]);
                        if (data[a]['isPlaying']) {
                            $('#' + appName + '_playLink' + a).html(data[a]['linkStop']);
                        } else {
                            $('#' + appName + '_playLink' + a).html(data[a]['linkPlay']);
                        }
                    }
                    if (isSet(c.shouldPlay) && c.shouldPlay == true) {
                        play(a);
                    } else {
                        stop(a);
                    }
                }
            },
            soundEnded: function(a) {
                a = a || current;
                _ui_updateStopped(a);
                if ($.isFunction(data[a]['soundEnded'])) data[a]['soundEnded']();
            },
            data: data
        }
    }();
    if (typeof window.SpeakerAsyncInit == 'function') {
        SpeakerAsyncInit();
    }

    //** Name: webreader/webreader2.min.js *** 

    /** 
     *
     * IVONA Webreader Javascript Liblary
     * Copyright: IVONA Webreader Sp.z o.o.
     * Build: Wed Jul 27 00:16:38 2011
     * License: http://ivona.com/static/pdf/webreader_en.pdf
     *
     **/
    if (typeof Webreader == "undefined") {
        var Webreader = function() {
            var D = document,
                W = window,
                N = navigator,
                version = "2.5.0",
                dArr = [],
                c6 = 0,
                _1 = 0,
                _2 = 0,
                c9 = 100,
                c8 = false,
                kP = false,
                MR = Math.round,
                MF = Math.floor,
                blankFunction = function() {};
            var b5 = ['top:-30px', 'font-size:8px', 'height:8px', 'left:0px', 'position:absolute'],
                playerDefaults = {
                    shadow: 0,
                    pLang: 'en',
                    bgColor: '0xFFFFFF',
                    btnColor: '0x666666',
                    borColor: '0xCCCCCC',
                    alpha: 100,
                    playerMode: 0,
                    autoembed: 0,
                    autoplay: 0,
                    scrollMode: 0,
                    sDownload: 1,
                    onValidate: blankFunction
                },
                defaults = {
                    standardButton: null,
                    noFlashButton: null,
                    performValidation: true,
                    wrHost: (("https:" == D.location.protocol) ? "https://web.archive.org/web/20110902054751/https://secure.ivona.com" : "https://web.archive.org/web/20110902054751/http://player.ivona.com/www"),
                    wrSwf: 'WebreaderBase.swf?ver=' + version,
                    hiLC: "D09DEF0B2",
                    embedFlash: function(a, b, c, d, e, f, g, h, i) {
                        swfOb.embedSWF(a, b, c, d, e, f, g, h, i)
                    },
                    onRollUp: blankFunction,
                    onRollOut: blankFunction
                };
            var swfOb = function() {
                var OBJECT = "object",
                    i4 = "Shockwave Flash",
                    i2 = "ShockwaveFlash.ShockwaveFlash",
                    i3 = "application/x-shockwave-flash",
                    h7 = [],
                    c3, c2;
                var ua = function() {
                    var w3cdom = d3(D.getElementById) && d3(D.getElementsByTagName) && d3(D.createElement),
                        u = N.userAgent.toLowerCase(),
                        p = N.platform.toLowerCase(),
                        windows = p ? /win/.test(p) : /win/.test(u),
                        mac = p ? /mac/.test(p) : /mac/.test(u),
                        webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                        ie = !+"\v1",
                        playerVersion = [0, 0, 0],
                        d = null;
                    if (d3(N.plugins) && typeof N.plugins[i4] == OBJECT) {
                        d = N.plugins[i4].description;
                        if (d && !(d3(N.mimeTypes) && N.mimeTypes[i3] && !N.mimeTypes[i3].enabledPlugin)) {
                            plugin = true;
                            ie = false;
                            d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                            playerVersion = [parseInt(d.replace(/^(.*)\..*$/, "$1"), 10), parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10), (/[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0)];
                        }
                    } else if (d3(W.ActiveXObject)) {
                        try {
                            var a = new ActiveXObject(i2);
                            if (a) {
                                d = a.GetVariable("$version");
                                if (d) {
                                    ie = true;
                                    d = d.split(" ")[1].split(",");
                                    playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                                }
                            }
                        } catch (e) {}
                    }
                    return {
                        w3: w3cdom,
                        pv: playerVersion,
                        wk: webkit,
                        ie: ie,
                        win: windows,
                        mac: mac
                    };
                }();

                function addLoadEvent(fn) {
                    if (d3(W.addEventListener)) {
                        W.addEventListener("load", fn, false);
                    } else if (d3(D.addEventListener)) {
                        D.addEventListener("load", fn, false);
                    } else if (d3(W.attachEvent)) {
                        addListener(W, "onload", fn);
                    } else if (typeof W.onload == "function") {
                        var fnOld = W.onload;
                        W.onload = function() {
                            fnOld();
                            fn();
                        };
                    } else {
                        W.onload = fn;
                    }
                }

                function createSWF(attObj, parObj, id) {
                    var r, el = b1(id);
                    if (ua.wk && ua.wk < 312) {
                        return r;
                    }
                    if (el) {
                        if (!d3(attObj.id)) {
                            attObj.id = id;
                        }
                        if (ua.ie && ua.win) {
                            var att = "";
                            for (var i in attObj) {
                                if (attObj[i] != Object.prototype[i]) {
                                    if (i.toLowerCase() == "data") parObj.movie = attObj[i];
                                    else if (i.toLowerCase() == "styleclass") att += ' class="' + attObj[i] + '"';
                                    else if (i.toLowerCase() != "classid") att += ' ' + i + '="' + attObj[i] + '"';
                                }
                            }
                            var par = "";
                            for (var j in parObj) {
                                if (parObj[j] != Object.prototype[j]) par += '<param name="' + j + '" value="' + parObj[j] + '" />';
                            }
                            el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
                            r = b1(attObj.id);
                        } else {
                            var o = b0(OBJECT);
                            o.setAttribute("type", i3);
                            for (var m in attObj) {
                                if (attObj[m] != Object.prototype[m]) {
                                    if (m.toLowerCase() == "styleclass") {
                                        o.setAttribute("class", attObj[m]);
                                    } else if (m.toLowerCase() != "classid") {
                                        o.setAttribute(m, attObj[m]);
                                    }
                                }
                            }
                            for (var n in parObj) {
                                if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") {
                                    h8(o, n, parObj[n]);
                                }
                            }
                            el.parentNode.replaceChild(o, el);
                            r = o;
                        }
                    }
                    return r;
                }

                function h8(a, b, c) {
                    var p = b0("param");
                    p.setAttribute("name", b);
                    p.setAttribute("value", c);
                    a.appendChild(p);
                }

                function addListener(a, b, c) {
                    a.attachEvent(b, c);
                    h7.push([a, b, c]);
                }

                function h9(rv) {
                    var pv = ua.pv,
                        v = rv.split(".");
                    v[0] = parseInt(v[0], 10);
                    v[1] = parseInt(v[1], 10) || 0;
                    v[2] = parseInt(v[2], 10) || 0;
                    return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
                }

                function createCSS(sel, decl, media, d) {
                    if (d5 && e6) {
                        return;
                    }
                    var h = b2("head")[0];
                    if (!h) {
                        return
                    }
                    var m = (!!media && isStr(media)) ? media : "screen";
                    if (d) {
                        c3 = null;
                        c2 = null;
                    }
                    if (!c3 || c2 != m) {
                        var s = b0("style");
                        s.setAttribute("type", "text/css");
                        s.setAttribute("media", m);
                        c3 = h.appendChild(s);
                        if (ua.ie && e7 && d3(D.styleSheets) && D.styleSheets.length > 0) {
                            c3 = D.styleSheets[D.styleSheets.length - 1];
                        }
                        c2 = m;
                    }
                    if (ua.ie && ua.win) {
                        if (d3(c3) && !!(c3.addRule)) {
                            try {
                                c3.addRule(sel, decl);
                            } catch (e) {}
                        }
                    } else {
                        if (c3 && d3(D.createTextNode)) {
                            c3.appendChild(D.createTextNode(sel + " {" + decl + "}"));
                        }
                    }
                }

                function h5(id, isVisible) {
                    var v = isVisible ? "visible" : "hidden";
                    createCSS("#" + id, "visibility:" + v);
                }
                return {
                    embedSWF: function(swfUrlStr, h6, widthStr, heightStr, swfVersionStr, i0, h3, parObj, attObj, i1) {
                        var callbackObj = {
                            success: false,
                            id: h6
                        };
                        if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && h6 && widthStr && heightStr && swfVersionStr) {
                            h5(h6, false);
                            widthStr += "";
                            heightStr += "";
                            var att = f6({}, attObj);
                            att.data = swfUrlStr;
                            att.width = widthStr;
                            att.height = heightStr;
                            var par = f6({}, parObj);
                            if (h3 && typeof h3 === OBJECT) {
                                for (var k in h3) {
                                    if (d3(par.flashvars)) {
                                        par.flashvars += "&" + k + "=" + h3[k];
                                    } else {
                                        par.flashvars = k + "=" + h3[k];
                                    }
                                }
                            }
                            if (h9(swfVersionStr)) {
                                var obj = createSWF(att, par, h6);
                                if (att.id == h6) {
                                    h5(h6, true);
                                }
                                callbackObj.success = true;
                                callbackObj.ref = obj;
                            } else {
                                return;
                            }
                        }
                    },
                    ua: ua,
                    getFPV: function() {
                        return {
                            major: ua.pv[0],
                            minor: ua.pv[1],
                            release: ua.pv[2]
                        };
                    },
                    hasFPV: h9,
                    createCSS: function(a, b, c, d) {
                        if (ua.w3) {
                            createCSS(a, b, c, d);
                        }
                    },
                    addLoadEvent: addLoadEvent
                };
            }();

            function f4(did, fv, h, w) {
                a2 = (d3(fv.tabIndex) && fv.tabIndex > -1 ? 'tabIndex="' + fv.tabIndex + '"' : '');
                if (defaults.standardButton != null) {
                    a4 = defaults.standardButtonl
                } else {
                    a4 = a5(did, fv, h, w, true);
                }
                return '' + '<span id="' + did + '_container" >' + '<a id="' + did + '_link" ' + a2 + ' style="display:none;" href="javascript:Webreader.read(' + (c6 - 1) + ');" target="_self" >' + a4 + '</a>' + (d8 || e1 || d5 || d9 ? '<span id="' + did + '_playPauseContainer"></span>' : '') + '</span>';
            }

            function a5(did, fv, h, w, makePlayText) {
                a1 = h - 6;
                _9 = a1;
                a0 = MR(h / 2);
                _8 = MR(h / 6);
                a3 = !d6 ? fv.bgColor.substr(2, 8) + ' url(' + defaults.wrHost + '/static/images/gradients/' + (a8(fv.bgColor) ? 'wrlight.png' : 'wrdark.png') + ') 0px 0px' : fv.bgColor.substr(2, 8);
                var _5 = ['float:' + (fv.scrollMode == 1 ? 'right' : 'left'), 'background:#' + a3, 'height:' + a1 + 'px', 'border:1px solid #' + fv.borColor.substr(2, 8), 'padding:0px', 'margin:0px', 'text-align:center', 'text-decoration:none', 'vertical-align:top', 'text-decoration:none', 'color:#' + fv.btnColor.substr(2, 8), 'font-family:Arial', 'font-weight:bold', 'font-size:' + a0 + 'px', 'line-height:' + _9 + 'px', 'cursor:pointer', '-moz-border-radius:' + _8 + 'px', '-webkit-border-radius:' + _8 + 'px', 'border-radius:' + _8 + 'px', 'outline:none', 'vertical-align:top'];
                var _6 = ['width:' + MR(w / 2) + 'px', 'float:left', 'text-decoration:none', 'padding: 0px ' + MR(h / 2) + 'px 0px ' + MR(h / 3) + 'px', 'margin:0px', 'line-height:' + (_9) + 'px'];
                var _7 = ['float:left', 'text-decoration:none', 'padding:0px 6px 0px 0px', 'line-height:' + (_9) + 'px', 'font-size:' + MR(a0 * 1.2) + 'px'];
                if (e8) {
                    _7.push('margin-top:-' + MF(a1 / 10) + 'px');
                }
                var _4 = ['position:fixed', 'top:-9999px', 'height:1px', 'width:1px', 'overflow:hidden'];
                return '' + '<span id="' + did + '_stbutton" style="' + a6(_5) + '" >' + '<span id="' + did + '_text" style="' + a6(_6) + '">' + (makePlayText ? '<span style="' + a6(_7) + '">' + (e8 ? '&#9654' : '&#9658') + '</span>' : '') + (makePlayText ? f9(fv.pLang) : "Stop") + '<span id="' + did + '_accessibility" style="' + a6(_4) + '"> ' + f8(fv.pLang) + '</span>' + '</span>' + '</span>';
            }

            function a6(a) {
                var o = '';
                for (var i = 0; i < a.length; i++) {
                    o += a[i] + ' !important;';
                }
                return o;
            }

            function a7(o, typ, fn, bub) {
                if (!isFunction(typ.indexOf)) return;
                if (typ.indexOf(" ") != -1) {
                    var s = typ.split(" ");
                    typ = s.shift();
                    if (s.length > 0) {
                        for (var c in s) {
                            arguments.callee(o, s[c], fn, bub);
                        }
                    }
                }
                if (o.addEventListener) o.addEventListener(typ, fn, (d3(bub) ? bub : false));
                else if (o.attachEvent) o.attachEvent("on" + typ, fn);
                else try {
                    o["on" + typ] = fn
                } catch (e) {}
            }

            function c7(obj, scut, fn, g3) {
                if (!d3(g3)) g3 = false;
                var g4 = {
                    space: 32,
                    enter: 13,
                    left: 37,
                    right: 39,
                    num0: [48, 96, 0],
                    num1: [49, 97, 11],
                    num2: [50, 98, 22],
                    num3: [51, 99, 33],
                    num4: [52, 100, 44],
                    num5: [53, 101, 55],
                    num6: [54, 102, 66],
                    num7: [55, 103, 77],
                    num8: [56, 104, 88],
                    num9: [57, 105, 100]
                };
                a7(obj, "keydown", function(e) {
                    c8 = false;
                    if (d8) return;
                    if (e6 && (e.altKey || e.keyCode == 160 || e.keyCode == 18)) c8 = true;
                    if (!e6 && (e.ctrlKey || e.keyCode == 17)) c8 = true;
                    if (e.keyCode == g4['space'] && (c8 || (e1 && e.ctrlKey))) {
                        pDef(e);
                    }
                });
                a7(obj, "keyup", function(e) {
                    if (e6 && (e.altKey || e.keyCode == 18)) setTimeout(function() {
                        c8 = false
                    }, 100);
                    if (!e6 && (e.ctrlKey || e.keyCode == 17)) setTimeout(function() {
                        c8 = false
                    }, 100);
                    if (g3 && !c8) return;
                    if (d8 && (e.keyCode == g4['enter'] || e.keyCode == g4['space'])) return;
                    if (scut.indexOf('num') == -1) {
                        if (e.keyCode == g4[scut]) {
                            try {
                                fn.call()
                            } catch (e) {}
                        }
                    } else {
                        if (e.keyCode == g4[scut][0] || e.keyCode == g4[scut][1]) {
                            c9 = g4[scut][2];
                            try {
                                fn.call()
                            } catch (e) {}
                        }
                    }
                    if (d5) c8 = false;
                    kP = true;
                    pDef(e);
                });
                if (!d8) {
                    a7(obj, "keypress keyup keydown", function(e) {
                        fixE(e);
                        if (e.target.className == defaults.hiLC && (e.keyCode == g4['enter'] || e.keyCode == g4['space'])) {
                            pDef(e);
                        }
                        if (c8 && kP && e.keyCode == g4['space']) pDef(e);
                    });
                } else {
                    if (g3) {
                        a7(obj, "keypress", function(e) {
                            if (e6 && !(e.altKey || e.keyCode == 18 || e.keyCode == 160)) return;
                            if (!e6 && !(e.ctrlKey || e.keyCode == 17 || e.keyCode == 160)) return;
                            if ((e.keyCode == g4['space'] || e.keyCode == 160) && kP) {
                                try {
                                    fn.call()
                                } catch (e) {}
                            }
                            kP = false;
                        });
                        a7(obj, "keyup keydown", function(e) {
                            kP = true;
                        });
                    }
                    if (!g3) {
                        a7(obj, 'keypress', function(e) {
                            if ((e.keyCode == g4['enter'] || e.keyCode == g4['space'])) {
                                if ((e.keyCode == g4['enter'] || e.keyCode == g4['space']) && kP) {
                                    try {
                                        fn.call()
                                    } catch (e) {}
                                    kP = false;
                                }
                                if ((e.keyCode == g4['enter'] || e.keyCode == g4['space'])) {
                                    pDef(e);
                                }
                            }
                        });
                        a7(obj, 'keydown keyup', function(e) {
                            if ((e.keyCode == g4['enter'] || e.keyCode == g4['space'])) {
                                kP = true;
                                pDef(e);
                            }
                        });
                    }
                }
            }

            function fixE(e) {
                if (!e) e = window.event;
                if (!e.target) {
                    e.target = e.srcElement;
                }
            }

            function pDef(e) {
                e.returnValue = false;
                try {
                    e.preventDefault()
                } catch (e) {}
                try {
                    e.stopPropagation()
                } catch (e) {}
            }

            function f6(a, b) {
                for (var v in b) {
                    a[v] = b[v];
                }
                return a;
            }

            function d1(w, b9) {
                var finalFlashvars = f6({}, dArr[w][0]);
                dArr[w][7] = true;
                delete finalFlashvars.onValidate;
                finalFlashvars.forcePlay = (b9 ? 1 : 0);
                var d2 = b1(dArr[w][3] + '_link');
                if (d8) {
                    var _3 = d2.tabIndex;
                }
                d2.parentNode.removeChild(d2);
                setTimeout(function() {
                    defaults.embedFlash(defaults.wrHost + "/static/flash/" + defaults.wrSwf, dArr[w][3] + '_container', dArr[w][4], dArr[w][5], "10.0.0", "", finalFlashvars, {
                        swliveconnect: "true",
                        allowfullscreen: "false",
                        allowscriptaccess: "always",
                        allownetworking: "all",
                        quality: "best",
                        scale: "exactFit",
                        seamlesstabbing: "false",
                        align: "t",
                        wmode: "transparent"
                    }, dArr[w][2])
                });
                if (d8) {
                    setTimeout(function() {
                        f0("#" + dArr[w][3], "display:inline-block");
                    }, 500)
                }
                f0("#ivona_" + dArr[w][3] + ":focus", "outline:none !important");
                if (d8 || e1 || d9 || d5) {
                    var c4 = b0('a');
                    var b8 = dArr[w][3] + '_playPauseLink';
                    with(c4) {
                        id = b8;
                        href = "https://web.archive.org/web/20110902054751/http://ivona.com/webreader.php";
                        target = "_self";
                        className = defaults.hiLC;
                        if (d8) {
                            tabIndex = _3;
                        }
                        innerHTML = f9(dArr[w][0]['pLang']) + " " + f8(dArr[w][0]['pLang']);
                    }
                    f0('#' + b8 + ':focus', "outline:none !important");
                    f0('#' + b8, "position:absolute;top:2px;" + (dArr[w][0].scrollMode == 1 ? 'right:3px;' : 'left:3px;') + "z-index:0;font-size:8px;width:5px;overflow:hidden;height:1px;" + f1('FFFFFF', 0));
                    b1(dArr[w][3]).appendChild(c4);
                    if (!isMOB) {
                        c7(c4, 'space', function() {
                            play(dArr[w][8])
                        });
                        setTimeout(function() {
                            c7(c4, 'enter', function() {
                                play(dArr[w][8])
                            })
                        }, 300);
                        c7(c4, 'left', function() {
                            backward(dArr[w][8])
                        });
                        c7(c4, 'right', function() {
                            forward(dArr[w][8])
                        });
                        for (var si = 0; si <= 9; si++) {
                            c7(c4, 'num' + parseInt(si), function(e) {
                                setVolume(dArr[w][8], c9)
                            });
                        }
                    }
                    try {
                        c4['onfocus'] = function() {
                            try {
                                f2(dArr[w][8]).d0()
                            } catch (e) {}
                        };
                        c4['onblur'] = function() {
                            try {
                                f2(dArr[w][8]).blurWebreader()
                            } catch (e) {}
                        };
                    } catch (e) {}
                    _1 = w;
                    if (dArr[w][0].autoembed != 1) setTimeout(function() {
                        Webreader.focusWR(w)
                    }, 1000);
                }
            }

            function g5(i) {
                return dArr[i][9];
            }

            function g6(id) {
                return parseInt(id.replace(/[^0-9]+/g, ''));
            }

            function g7(e) {
                return g6(e.target.id);
            }

            function g8(e) {
                var i = g7(e);
                return dArr[i][9];
            }

            function g9(i, b) {
                var linkID = dArr[i][3] + "_link";
                var g2 = b1(linkID);
                g2.innerHTML = a5(dArr[i][3], dArr[i][0], dArr[i][5], dArr[i][4], !!b);
                g2.setAttribute('href', "javascript:Webreader." + (!!b ? 'read(' + i + ')' : 'stop(' + i + ')'));
            }

            function h0(a, b) {
                var f = function(x, y) {
                    a.addEventListener(x, y, false);
                };
                f("play", function(event) {
                    var i = g7(event);
                    g9(i, false);
                });
                f("pause", function(event) {
                    var i = g7(event);
                    g9(i, true);
                });
                f("ended", function(event) {
                    var i = g7(event);
                    g9(i, true);
                });
            }

            function h1(w) {
                if (!e4) return false;
                var myau = b0('audio');
                myau.id = "wr_htmlaudio" + w;
                return myau;
            }

            function h2(w, b9) {
                var a = unescape(dArr[w][0].soundUrl);
                var ha = g5(w);
                ha.setAttribute('src', a);
                ha.load();
                ha.play();
                h0(ha, w);
            }

            function read(w) {
                if (d4) {
                    if (dArr[w][7] == false) {
                        d1(w, true);
                    } else {
                        play(w);
                    }
                } else if (e4) {
                    a9(function(k) {
                        try {
                            dArr[k][9].pause()
                        } catch (e) {}
                    });
                    h2(w, true);
                } else {
                    W.location = unescape(dArr[w][0].soundUrl);
                }
                d0(w);
            }

            function create(fv, h) {
                c6++;
                var did = "flashplayer_" + c6;
                if (d3(fv.parentId)) did = fv.parentId;
                var h4 = "ivona_" + did;
                var wrc = c6 - 1;
                var WR_a = {
                    id: h4,
                    name: "ivonaWebreader",
                    onclick: "Webreader.focusWR(" + wrc + ");",
                    tabIndex: "-1"
                };
                if (d5) WR_a['onfocus'] = "Webreader.focusWR(" + wrc + ")";
                fv.wrId = wrc;
                var nfv = f6({}, fv);
                if (d3(nfv.clipColor)) delete nfv.clipColor;
                if (fv.alpha < 20) fv.alpha = 20;
                if (h < 23) h = 23;
                var w = (h * 8) - 25;
                var nAr = [];
                nAr[0] = nfv;
                nAr[1] = null;
                nAr[2] = WR_a;
                nAr[3] = did;
                nAr[4] = w;
                nAr[5] = h;
                nAr[6] = f4(did, fv, h, w);
                nAr[7] = false;
                nAr[8] = h4;
                nAr[9] = h1(wrc);
                dArr[wrc] = nAr;
                try {
                    b1(did).innerHTML = dArr[wrc][6];
                } catch (e) {
                    return
                }
                f0("#" + did, 'width:' + w + 'px;height:' + h + 'px;display:block;text-align:' + (fv.scrollMode == 1 ? 'right' : 'left') + ';position:relative !important');
                if (d5) f0("#" + did + "_stbutton", f1(fv.borColor.toString().replace(/(0x)/gi, ''), fv.alpha, 0));
                if (fv.shadow == '1') f0("#" + did + "_stbutton", f1(fv.borColor.substr(2, 8), fv.alpha));
                else f0("#" + did + "_stbutton", f1(-1, fv.alpha));
                f0("#" + did + "_stbutton:hover", 'background-position:0px -100px !important;');
                f0("#" + did + "_stbutton:focus", f1('007DB3', fv.alpha));
                f0("#" + did + "_stbutton:active", f1('007DB3', fv.alpha));
                if (d3(W._oldWebreaderOption)) {
                    f0("#ivona_" + did, 'display:block;position:relative;');
                    f0("#" + did + "_container", 'display:block;position:relative;');
                } else {
                    f0("#ivona_" + did, 'display:inline-block;position:absolute;top:0px;left:0px;z-index:1000;');
                    f0("#" + did + "_container", 'float:' + (fv.scrollMode == 1 ? 'right' : 'left'));
                }
                f0("#" + did + "_accessibility", f1('FFFFFF', 0));
                if (d6) {
                    f0("#" + did + "_accessibility", 'display:none');
                }
                return wrc;
            }

            function f1(sc, av, ies) {
                sd = (sc < 0 ? 0 : 1);
                if (!d3(ies)) ies = 2;
                if (e1 || d8 || e3 || e2) {
                    o = (sd ? '-webkit-box-shadow: 0px 1px 2px #' + sc + ';box-shadow: 0px 1px 2px #' + sc + ';' : '') + '-webkit-opacity:' + (av / 100) + ';opacity:' + (av / 100) + ';';
                } else if (d9) {
                    o = (sd ? '-moz-box-shadow: 0px 1px 2px #' + sc + ';' : '') + 'opacity:' + (av / 100) + ';opacity:' + (av / 100) + ';';
                } else if (d5 && !d7) {
                    o = 'filter:progid:' + (sd ? 'DXImageTransform.Microsoft.Shadow(Strength=' + ies + ', Direction=160, Color=\'#' + sc + '\')' : '') + ' \n alpha(opacity=' + av + ');' + '-ms-filter:"progid:' + (sd ? 'DXImageTransform.Microsoft.Shadow(Strength=' + ies + ', Direction=160, Color=\'#' + sc + '\')' : '') + ' \n alpha(opacity=' + av + ');"' + 'outline:none !important;';
                } else if (d7) {
                    o = (sd ? 'box-shadow: 0px 1px 2px #' + sc + ';' : '') + 'opacity:' + (av / 100) + ';filter:alpha(opacity=' + av + ');';
                } else {
                    o = ';';
                }
                return o;
            }

            function f9(l) {
                var a;
                if (l == 'pl') a = 'Ods' + (d8 ? "&#322;" : 'ł') + 'uchaj';
                else if (l == 'ro') a = 'Ascult' + (d8 ? '&#259;' : 'ă');
                else if (l == 'de') a = 'Vorlesen';
                else if (l == 'es') a = 'Lee';
                else if (l == 'fr') a = 'Ecoute';
                else if (l == 'cy') a = 'Gwrando';
                else a = 'Listen';
                return a;
            }

            function f8(l) {
                var a;
                var p = 'IVONA  Webreader. ';
                if (l == 'pl') a = p + 'Wciśnij Enter by rozpocząć odtwarzanie';
                else if (l == 'ro') a = p + 'Apas' + (d8 ? '&#259;' : 'ă') + ' Enter pentru a porni redarea';
                else if (l == 'de') a = p + 'Klicken Sie Enter, damit der Text vorgelesen wird';
                else if (l == 'es') a = p + 'Clic en Enter para leer el texto';
                else if (l == 'es') a = p + '';
                else if (l == 'cy') a = p + 'Pwyswch Enter i ddechrau darllen';
                else a = p + 'Press Enter to begin reading';
                return a;
            }

            function a8(a) {
                var r = a >> 16 & 0xFF;
                var g = a >> 8 & 0xFF;
                var b = a & 0xFF;
                return (((r * 299) + (g * 587) + (b * 114)) / 1000) > 120 ? false : true;
            }

            function f2(a) {
                if (typeof a == 'number' && d3(dArr[a][8])) a = dArr[a][8];
                if (b1(a) && d3(b1(a))) return b1(a);
                else {
                    if (W.document[a] && d3(W.document[a])) return W.document[a];
                    if (!d5 && D.embeds && D.embeds[a] != 'undefined') return D.embeds[a];
                }
                return null;
            }

            function d0(a) {
                if (d4) {
                    var pL = b1(dArr[a][3] + '_playPauseLink');
                    if (!pL || !d3(dArr[a])) return;
                    pL.focus();
                    _1 = a;
                } else if (e4) {
                    var pL = b1(dArr[a][3] + '_link');
                    if (!pL || !d3(dArr[a])) return;
                    pL.focus();
                    _1 = a;
                }
            }

            function play(wr) {
                if (d4) {
                    try {
                        f2(wr).toggleWebreaderPlay();
                    } catch (e) {}
                } else if (e4) {
                    var a = g5(parseInt(wr));
                    if (!!a) {
                        a.play()
                    }
                }
            }

            function stop(wr) {
                if (d4) {
                    try {
                        f2(wr).stopWebreader()
                    } catch (e) {}
                } else if (e4) {
                    var a = g5(parseInt(wr));
                    if (!!a) {
                        a.pause()
                    }
                }
            }

            function forward(wr) {
                if (d4) {
                    try {
                        f2(wr).jumpForward();
                    } catch (e) {}
                }
            }

            function backward(wr) {
                if (d4) {
                    try {
                        f2(wr).jumpBackward();
                    } catch (e) {}
                }
            }

            function setVolume(wr, v) {
                if (d4) {
                    try {
                        f2(wr).setVolumeLevel(v)
                    } catch (e) {}
                }
            }

            function changeColors(wr, cArr) {
                if (typeof wr == 'number') var ind = wr;
                else var ind = f7(wr) - 1;
                var ta = ['bgColor', 'btnColor', 'borColor'];
                for (var i = 0; i < ta.length; i++) {
                    if (!d3(cArr[i])) cArr[i] = dArr[ind][0][ta[i]];
                    cArr[i] = "" + cArr[i].replace(/^0x/gi, '').replace("#", '');
                }
                if (dArr[ind][7] != true) {
                    l = b1(dArr[ind][3] + '_stbutton'), t = b1(dArr[ind][3] + '_text');
                    t.style.color = "#" + cArr[1];
                    l.style.backgroundColor = "#" + cArr[0];
                    l.style.border = '1px solid #' + (cArr[2]);
                    if (dArr[ind][0].shadow != 0) {
                        f0("#" + dArr[ind][3] + "_stbutton", f1(cArr[2], 100));
                    }
                    for (var i = 0; i < ta.length; i++) {
                        dArr[ind][0][ta[i]] = "0x" + cArr[i];
                    }
                    dArr[ind][0].bgColor = "0x" + cArr[0];
                    dArr[ind][0].btnColor = "0x" + cArr[1];
                    dArr[ind][0].borColor = "0x" + cArr[2];
                } else {
                    var ob = f2(ind);
                    ob.changeWebreaderBackground("0x" + cArr[0]);
                    ob.changeWebreaderControls("0x" + cArr[1]);
                    ob.changeWebreaderBorder("0x" + cArr[2]);
                }
            }

            function stopAll(wr) {
                for (var i = 0; i < dArr.length; i++) {
                    if (a = f2(i)) {
                        a.stopWebreader();
                        a.blurWebreader();
                    }
                }
            }

            function a9(a) {
                for (var i = 0, length = dArr.length >>> 0; i < length; i++) {
                    a(i)
                }
            }

            function domLoad() {
                try {
                    inspectWebpage();
                } catch (e) {}
                if (d8) {
                    var hti = c5();
                    a9(function(k) {
                        hti++;
                        b1(dArr[k][3] + "_link").tabIndex = hti;
                    });
                }
                if (!dArr[0]) return;
                if (defaults.performValidation && isWebreaderUrl(dArr[0][0].soundUrl)) {
                    var ga = b0('script');
                    with(ga) {
                        type = 'text/javascript';
                        async = true;
                        src = unescape(dArr[0][0].soundUrl + escape("&check=1"));
                    }
                    var s = b2('script')[0];
                    s.parentNode.insertBefore(ga, s);
                } else {
                    validate('begin', 1);
                }
            }

            function c5() {
                var allEls = b2("*");
                for (var al = 0; al < allEls.length; al++) {
                    if (allEls[al].tabIndex && allEls[al].tabIndex > 0) {
                        if (allEls[al].tabIndex > _2) {
                            _2 = allEls[al].tabIndex;
                        }
                    }
                }
                return _2;
            }

            function f7(s) {
                return parseInt(s.replace(/[^0-9]+/g, ''));
            }

            function validate(id, check) {
                if (id == 'begin') {
                    a9(function(k) {
                        validate(k, check)
                    });
                    return;
                }
                var wrId = dArr[id][3];
                switch (parseInt(check)) {
                    case 0:
                        f0('#' + wrId + '', "display:none !important;");
                        return;
                        break;
                    case 1:
                        f0('#' + wrId + '_link', 'display:' + (!e0 ? 'inline-block' : 'block') + ' !important;');
                        if (isFunction(dArr[id][0].onValidate)) {
                            dArr[id][0].onValidate()
                        }
                        break;
                    case 2:
                        f0('#' + wrId + '_link', 'display:' + (!e0 ? 'inline-block' : 'block') + ' !important;');
                        if (isFunction(dArr[id][0].onValidate)) {
                            dArr[id][0].onValidate()
                        }
                        dArr[id][0]['sDownload'] = 0;
                        break;
                }
                if (!d3(arguments.callee.g1)) {
                    try {
                        var c0 = D.body.children[0];
                        var c1 = b0('h1');
                        var ahid = 'WRaccessHelper';
                        with(c1) {
                            className = ahid;
                            innerHTML = '<a href="javascript:Webreader.read(0);" target="_self" >' + f8(dArr[0][0].pLang) + '</a>';
                        }
                        D.body.insertBefore(c1, c0);
                        f0("." + ahid, a6(b5));
                    } catch (e) {}
                    c7(D, 'space', function() {
                        Webreader.read(id);
                    }, true);
                    arguments.callee.g1 = 1;
                }
                var b9 = false;
                if (!d3(arguments.callee.aPl) && dArr[id][0]['autoplay'] == 1) {
                    b9 = true;
                    arguments.callee.aPl = true;
                }
                if (d3(dArr[id][0]['autoembed']) && dArr[id][0]['autoembed'] == 1) {
                    if (d4) {
                        d1(id, b9);
                    }
                }
            }

            function f3(a) {
                var b7 = unescape(a);
                if (b7.indexOf('?') != -1) {
                    try {
                        var b3 = [];
                        b6 = b7.split("?");
                        props = b6[1].split("&");
                        b4 = [];
                        for (c = 0; c < props.length; c++) {
                            var b = props[c].split("=");
                            b4[b[0]] = b[1];
                            b3.push([b[0], b[1]]);
                        }
                        if (d3(b4['i']) && isStr(b4['i'])) {
                            var g0 = 'https://web.archive.org/web/20110902054751/http://www.iwebreader.com/gate/?' || 'https://web.archive.org/web/20110902054751/http://www.ivona.com/online/fileWebRead.php?';
                            for (p = 0; p < b3.length; p++) {
                                g0 += b3[p][0] + "=" + b3[p][1] + ((p != b3.length - 1) ? '&' : '');
                            }
                            return escape(g0);
                        } else {
                            return a;
                        }
                    } catch (e) {
                        return a;
                    }
                } else {
                    return a;
                }
            }

            function uag(v) {
                if (N.userAgent.toLowerCase().indexOf(v) != -1) return true;
                else return false;
            }

            function uav(v) {
                if (N.appVersion.toLowerCase().indexOf(v) != -1) return true;
                else return false;
            }

            function upv(v) {
                if (N.platform.toLowerCase().indexOf(v) != -1) return true;
                else return false;
            }

            function f0(a, b) {
                swfOb.createCSS(a, b, "screen, print", false);
            }

            function d3(e) {
                if (typeof e != "undefined") return true;
                return false
            }

            function isStr(a) {
                if (typeof a == 'string') return true;
                return false
            }

            function isFunction(a) {
                if (typeof a == 'function') return true;
                return false
            }

            function parseColor(a) {
                if (typeof a == 'number') {
                    a = "0x" + a.toString(16);
                } else if (typeof a == 'string') {
                    a = "0x" + a.replace(/^0x/gi, '').replace("#", '');
                }
                return a;
            }

            function b0(a) {
                return D.createElement(a);
            }

            function b1(a) {
                var el = null;
                try {
                    el = D.getElementById(a);
                } catch (e) {}
                return el;
            }

            function b2(a) {
                return D.getElementsByTagName(a);
            }

            function isWebreaderUrl(a) {
                var reArr = [/(filewebread.php)/gi, /(\/gate\b)/gi];
                for (var i = 0; i < reArr.length; i++) {
                    var r = reArr[i];
                    if (r.test(unescape(a))) {
                        return true;
                    }
                }
                return false;
            }

            function f5() {
                var a = b0('audio');
                var mp3 = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
                return mp3;
            }(function() {
                isSY = uag("symbianos");
                e3 = (uag("mini") || uag("mobi") || uav("phone") || uag("htc") || uav("mobile")) ? true : false;
                e2 = (uag("iphone") || uag("ipad") || uav("ipod")) ? true : false;
                d5 = !!(!+"\v1");
                d6 = uav("msie 6") || uav("msie 5") ? true : false;
                d7 = uav("msie 9") ? true : false;
                d9 = uag("firefox");
                e0 = uag("firefox/2");
                d8 = (uag("opera") && !e3) ? true : false;
                e1 = uag("applewebkit");
                isKQ = uag("konqueror");
                isMOB = (e2 || e3 || isSY) ? true : false;
                e6 = upv("mac");
                e8 = upv("linux");
                e7 = upv("win");
                e5 = uav("android");
                d4 = swfOb.hasFPV("10") && swfOb.getFPV().release != 999 && !isKQ ? true : false;
                e9 = f5();
                e4 = (e1 || e5) && e9;
            })();
            if (typeof WebreaderAsyncInit != 'function' && typeof WebreaderAsyncCommands == 'undefined') {
                swfOb.addLoadEvent(domLoad);
            } else {
                try {
                    setTimeout(function() {
                        domLoad()
                    }, 500)
                } catch (e) {}
            }
            return {
                getFlash: function(a) {
                    return f2(a);
                },
                getVersion: function() {
                    return version;
                },
                stopAll: function() {
                    stopAll();
                },
                play: function(a) {
                    play(a)
                },
                stop: function(a) {
                    stop(a)
                },
                setVolume: function(a) {
                    setVolume(a)
                },
                backward: function(a) {
                    backward(a)
                },
                forward: function(a) {
                    forward(a)
                },
                focusWR: function(a) {
                    d0(a)
                },
                read: function(a) {
                    read(a)
                },
                changeColors: function(a, b) {
                    changeColors(a, b)
                },
                validate: function(a, b) {
                    validate(a, b)
                },
                onRollOut: function(a) {
                    defaults.onRollOut.call();
                },
                onRollUp: function(a) {
                    defaults.onRollUp.call();
                },
                create: function(a, b) {
                    if (d3(a.bgColor)) a.bgColor = parseColor(a.bgColor);
                    if (d3(a.btnColor)) a.btnColor = parseColor(a.btnColor);
                    if (d3(a.borColor)) a.borColor = parseColor(a.borColor);
                    if (d3(a.lang)) a.pLang = a.lang;
                    if (d3(a.download)) a.sDownload = a.download;
                    a = f6(playerDefaults, a);
                    if (!d3(a.soundUrl) || !isStr(a.soundUrl) || a.soundUrl.length == 0) {
                        throw new Error('iWebreader: Incorrect soundUrl');
                        return;
                    }
                    a.soundUrl = f3(a.soundUrl);
                    if (d3(a.checkIt)) delete a.checkIt;
                    if (d6 || (d3(W._oldWebreaderOption))) a.autoembed = 1;
                    if (isMOB) a.autoembed = 0;
                    return create(a, b);
                },
                config: function(a) {
                    defaults = f6(defaults, a)
                },
                dArr: dArr,
                data: dArr
            };
        }();
        var WR_getFlash = Webreader.getFlash;
        var WR_stopAll = Webreader.stopAll;
        var WR_play = Webreader.play;
        var WR_stop = Webreader.stop;
        var WR_dataArray = Webreader.dArr;
        var readWebpageContent = Webreader.read;
    }
    if (typeof WebreaderAutoCreate == 'undefined') {
        Webreader.create(flashvars, h);
    }
    if (typeof WebreaderAsyncInit == 'function') {
        WebreaderAsyncInit();
    }
    if (typeof WebreaderAsyncCommands != 'undefined') {
        for (var i = 0; i < WebreaderAsyncCommands.length; i++) {
            WebreaderAsyncCommands[i]();
        }
    }