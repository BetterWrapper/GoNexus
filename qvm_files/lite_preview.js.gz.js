var VoiceCatalog = {
    fallback_langModel: {"en":{"desc":"English","options":[{"id":"joey","desc":"Joey","sex":"M","demo":"","lang":"en","country":"US","plus":false},{"id":"kendra","desc":"Kendra","sex":"F","demo":"","lang":"en","country":"US","plus":false},{"id":"kimberly","desc":"Kimberly","sex":"F","demo":"","lang":"en","country":"US","plus":false},{"id":"salli","desc":"Salli","sex":"F","demo":"","lang":"en","country":"US","plus":false},{"id":"ivy","desc":"Ivy","sex":"F","demo":"","lang":"en","country":"US","plus":false},{"id":"amy","desc":"Amy","sex":"F","demo":"","lang":"en","country":"GB","plus":false},{"id":"brian","desc":"Brian","sex":"M","demo":"","lang":"en","country":"GB","plus":false},{"id":"emma","desc":"Emma","sex":"F","demo":"","lang":"en","country":"GB","plus":false},{"id":"joanna","desc":"Joanna","sex":"F","demo":"","lang":"en","country":"US","plus":false},{"id":"justin","desc":"Justin","sex":"M","demo":"","lang":"en","country":"US","plus":false},{"id":"russell","desc":"Russell","sex":"M","demo":"","lang":"en","country":"AU","plus":false},{"id":"nicole","desc":"Nicole","sex":"F","demo":"","lang":"en","country":"AU","plus":false},{"id":"geraint","desc":"Geraint","sex":"M","demo":"","lang":"en","country":"GB","plus":false},{"id":"raveena","desc":"Raveena","sex":"F","demo":"","lang":"en","country":"IN","plus":false}]},"es":{"desc":"Spanish","options":[{"id":"miguel","desc":"Miguel","sex":"M","demo":"","lang":"es","country":"US","plus":false},{"id":"penelope","desc":"Pen\u00e9lope","sex":"F","demo":"","lang":"es","country":"US","plus":false},{"id":"enrique","desc":"Enrique","sex":"M","demo":"","lang":"es","country":"ES","plus":false},{"id":"conchita","desc":"Conchita","sex":"F","demo":"","lang":"es","country":"ES","plus":false}]},"pt":{"desc":"Portuguese","options":[{"id":"ines","desc":"In\u00eas","sex":"F","demo":"","lang":"pt","country":"PT","plus":false},{"id":"cristiano","desc":"Cristiano","sex":"M","demo":"","lang":"pt","country":"PT","plus":false},{"id":"vitoria","desc":"Vit\u00f3ria","sex":"F","demo":"","lang":"pt","country":"BR","plus":false},{"id":"ricardo","desc":"Ricardo","sex":"M","demo":"","lang":"pt","country":"BR","plus":false}]},"default":{"desc":"More","options":[{"id":"mads","desc":"Mads","sex":"M","demo":"","lang":"da","country":"DK","plus":false},{"id":"naja","desc":"Naja","sex":"F","demo":"","lang":"da","country":"DK","plus":false},{"id":"mizuki","desc":"Mizuki","sex":"F","demo":"","lang":"ja","country":"JP","plus":false},{"id":"filiz","desc":"Filiz","sex":"F","demo":"","lang":"tr","country":"TR","plus":false},{"id":"astrid","desc":"Astrid","sex":"F","demo":"","lang":"sv","country":"SE","plus":false},{"id":"maxim","desc":"Maxim","sex":"M","demo":"","lang":"ru","country":"RU","plus":false},{"id":"tatyana","desc":"Tatyana","sex":"F","demo":"","lang":"ru","country":"RU","plus":false},{"id":"carmen","desc":"Carmen","sex":"F","demo":"","lang":"ro","country":"RO","plus":false},{"id":"maja","desc":"Maja","sex":"F","demo":"","lang":"pl","country":"PL","plus":false},{"id":"jan","desc":"Jan","sex":"M","demo":"","lang":"pl","country":"PL","plus":false},{"id":"ewa","desc":"Ewa","sex":"F","demo":"","lang":"pl","country":"PL","plus":false},{"id":"jacek","desc":"Jacek","sex":"M","demo":"","lang":"pl","country":"PL","plus":false},{"id":"ruben","desc":"Ruben","sex":"M","demo":"","lang":"nl","country":"NL","plus":false},{"id":"lotte","desc":"Lotte","sex":"F","demo":"","lang":"nl","country":"NL","plus":false},{"id":"liv","desc":"Liv","sex":"F","demo":"","lang":"no","country":false,"plus":false},{"id":"giorgio","desc":"Giorgio","sex":"M","demo":"","lang":"it","country":"IT","plus":false},{"id":"carla","desc":"Carla","sex":"F","demo":"","lang":"it","country":"IT","plus":false},{"id":"mathieu","desc":"Mathieu","sex":"M","demo":"","lang":"fr","country":"FR","plus":false},{"id":"celine","desc":"C\u00e9line","sex":"F","demo":"","lang":"fr","country":"FR","plus":false},{"id":"chantal","desc":"Chantal","sex":"F","demo":"","lang":"fr","country":"CA","plus":false},{"id":"hans","desc":"Hans","sex":"M","demo":"","lang":"de","country":"DE","plus":false},{"id":"marlene","desc":"Marlene","sex":"F","demo":"","lang":"de","country":"DE","plus":false}]}},
    apiPath: "/api/getTTSVoices4QVM",
    getModel() {
        return this.lang_model || this.fallback_langModel
    }
};
jQuery.ajax({
    url: VoiceCatalog.apiPath,
    type: 'POST',
    success(data) {
        VoiceCatalog.lang_model = data;
    }
});
    function ItemSelector(B) {
        var C = 0
          , D = 0;
        var A;
        (function() {
            var E = null;
            A = {
                dirty: function(F) {
                    if (F) {
                        E = null
                    }
                },
                all: function() {
                    return (E ? E : (E = B.find(".item")))
                }
            }
        }
        )();
        B.find(".item").each(function(E) {
            if (jQuery(this).hasClass("selected")) {
                C = E
            }
            D++
        });
        B.find(".select_button").click(function(F) {
            F.preventDefault();
            A.all().hide();
            if (jQuery(this).hasClass("next")) {
                if (++C == D) {
                    C = 0
                }
            } else {
                if (--C == -1) {
                    C = D - 1
                }
            }
            var E = A.all().eq(C);
            E.show();
            B.trigger("change", [C, E])
        });
        return {
            current: function() {
                return C
            },
            getItem: function() {
                return A.all().eq(C)
            },
            getItems: function() {
                return A.all()
            },
            gotoByOffset: function(F) {
                if (F >= 0 && F < D) {
                    C = F;
                    A.all().hide();
                    var E = A.all().eq(C);
                    E.show();
                    B.trigger("change", [C, E])
                }
            },
            addItem: function(E) {
                A.dirty(true);
                ++D
            }
        }
    }
    var VoiceRecorder;
    if (VoiceRecorder == undefined) {
        VoiceRecorder = function(A) {
            this.init(A)
        }
    }
    VoiceRecorder.prototype.init = function(A) {
        try {
            this.settings = jQuery.extend({
                loadHandler: null,
                processCompleteHandler: null,
                reRecordHandler: null,
                focusHandler: null
            }, VoiceRecorder.defaultSettings, A);
            this.recorderId = "voice_recorder_" + VoiceRecorder.counter++;
            VoiceRecorder.instances[this.recorderId] = this;
            this.load({})
        } catch (B) {
            delete VoiceRecorder.instances[this.recorderId];
            throw B
        }
    }
    ;
    VoiceRecorder.prototype.destory = function() {
        try {
            var A = document.getElementById(this.recorderId);
            if (A) {
                try {
                    A.parentNode.removeChild(A)
                } catch (B) {}
            }
            window[this.recorderId] = null;
            VoiceRecorder.instances[this.recorderId] = null;
            delete VoiceRecorder.instances[this.recorderId];
            if (VoiceRecorder.recording == this.recorderId) {
                VoiceRecorder.recording = false
            }
            this.recorderId = null;
            this.settings = null;
            return true
        } catch (B) {
            return false
        }
    }
    ;
    VoiceRecorder.prototype.load = function(A) {
        if (typeof this.settings.loadHandler == "function") {
            A = jQuery.extend({}, A, {
                recorderId: this.recorderId,
                tlang: ((typeof I18N_LANG != "undefined") ? I18N_LANG : "en_US")
            });
            this.settings.loadHandler.apply(this, [A])
        }
    }
    ;
    VoiceRecorder.prototype.processComplete = function(A) {
        VoiceRecorder.recording = false;
        if (typeof this.settings.processCompleteHandler == "function") {
            this.settings.processCompleteHandler.apply(this, [A])
        }
    }
    ;
    VoiceRecorder.prototype.processError = function() {
        VoiceRecorder.recording = false
    }
    ;
    VoiceRecorder.prototype.reRecord = function() {
        if (typeof this.settings.reRecordHandler == "function") {
            this.settings.reRecordHandler.apply(this)
        }
    }
    ;
    VoiceRecorder.prototype.focus = function() {
        if (typeof this.settings.focusHandler == "function") {
            this.settings.focusHandler.apply(this)
        }
    }
    ;
    VoiceRecorder.prototype.showSettings = function() {
        this.setHeight(205)
    }
    ;
    VoiceRecorder.prototype.doneSettings = function() {
        this.setHeight(48)
    }
    ;
    VoiceRecorder.prototype.startRecord = function() {
        if (VoiceRecorder.recording) {
            return false
        }
        VoiceRecorder.recording = this.recorderId;
        return true
    }
    ;
    VoiceRecorder.prototype.setHeight = function(A) {
        if (jQuery.browser.mozilla) {
            jQuery(document.getElementById(this.recorderId).parentNode).height(A)
        } else {
            jQuery(document.getElementById(this.recorderId).parentNode).animate({
                height: A + "px"
            }, 300)
        }
    }
    ;
    VoiceRecorder.counter = 0;
    VoiceRecorder.instances = {};
    VoiceRecorder.recording = false;
    VoiceRecorder.defaultSettings = {
        swf: "",
        flashvars: {
            apiserver: "/qvm_micRecord_",
            appCode: "go",
            u_info: ""
        }
    };
    (function(A) {
        A.fn.scriptDialog = function() {
            var B = GoLite.settings.dialigMaxLength;
            return this.each(function() {
                var L = A(this);
                var N = L.find(".dialog_input");
                var C = L.find(".counter");
                var E;
                var D = new VoiceLanguageDisplay(L.find(".langarea"));
                L.bind("updatevoice", function(Q, P) {
                    D.updateByVoiceId(P)
                });
                function J(R) {
                    R.preventDefault();
                    var P = GoLite.getCharacters();
                    var Q = parseInt(L.data("charId"));
                    if (P.length == 1) {
                        Q = 0
                    } else {
                        Q = (Q == 0) ? 1 : 0
                    }
                    L.find(".char_thumb > img").attr("src", P[Q].data("thumb"));
                    L.data("charId", Q);
                    if (L.data("method") == "tts") {
                        L.removeData("aid")
                    }
                    L.trigger("updatevoice", [P[Q].data("voice")]);
                    L.next(".fake").trigger("switchCharacter")
                }
                if (L.hasClass("fake")) {
                    L.find(".char_thumb > img").click(function(P) {
                        N.focus()
                    });
                    N.bind("focus", function(P) {
                        GoLite.insertDialog({
                            charId: L.data("charId")
                        });
                        A(document).trigger("insert.scriptDialog");
                        J(P);
                        var Q = A("#dialogs");
                        if (Q.length) {
                            Q.scrollTop(Q[0].scrollHeight)
                        }
                    });
                    L.bind("switchCharacter", J);
                    return
                }
                function H() {
                    N = null;
                    C = null;
                    if (E) {
                        E.destory();
                        E = null
                    }
                    L.remove();
                    L = null
                }
                N.bind("keypress keyup change paste focus", function(Q) {
                    if (Q.type == "keypress") {
                        if (Q.which == 13) {
                            Q.preventDefault();
                            L.next().find(".dialog_input").focus();
                            N.trigger("blur")
                        }
                        return
                    }
                    var P = B - N.val().length;
                    if (P < 0) {
                        N.val(N.val().substring(0, B));
                        P = 0
                    }
                    C.html(GT.strargs(GT.gettext("%1 characters remaining"), [P]))
                });
                N.bind("focus", function(P) {
                    I();
                    if (L.data("method") == "tts") {
                        C.show()
                    }
                });
                N.bind("blur", function(P) {
                    C.hide()
                });
                N.bind("change", function(P) {
                    L.removeData("aid");
                    GoLite.noticifyChange()
                });
                L.find(".box").click(I);
                L.find(".dialog_delete").click(function(Q) {
                    Q.preventDefault();
                    Q.stopPropagation();
                    if (L.siblings(":not(.fake)").length == 0) {
                        return
                    }
                    var P = L.next(":not(.fake)");
                    if (!P.length) {
                        P = L.prev()
                    }
                    if (P.data("method") == "tts") {
                        P.find(".dialog_input").focus()
                    } else {
                        P.siblings().removeClass("focus");
                        P.addClass("focus")
                    }
                    H();
                    A(document).trigger("delete.scriptDialog")
                });
                L.find(".dialog_insert").click(function(Q) {
                    Q.preventDefault();
                    Q.stopPropagation();
                    var P = {
                        after: L,
                        charId: L.data("charId")
                    };
                    if (L.data("facial")) {
                        P.facial = L.data("facial")
                    }
                    GoLite.insertDialog(P);
                    A(document).trigger("insert.scriptDialog")
                });
                L.find(".char_thumb > img, .switch, .dialog_switch").click(function(P) {
                    L.siblings().removeClass("focus");
                    L.addClass("focus");
                    J(P);
                    GoLite.noticifyChange()
                });
                L.find(".dialog_input_wrapper").inFieldLabels();
                if (L.find(".dialog_facial").length) {
                    var M = L.find(".dialog_facial");
                    L.bind("updateFacial", function(R, P, Q) {
                        if (L.data("facial") != P) {
                            M.attr("class", "dialog_facial " + P).find(".value").text(Q);
                            L.data("facial", P);
                            GoLite.noticifyChange()
                        }
                    });
                    M.click(function(P) {
                        P.preventDefault();
                        facialExpression.show(L)
                    })
                }
                L.data("method", "tts");
                L.find(".dialog_input_control a").click(function(S) {
                    S.preventDefault();
                    var R = A(this);
                    if (R.data("method") == "mic" && GoLite.getUserState() == 0) {
                        showNotice(GT.gettext("Please publish your template to enable Voice Recording"));
                        return
                    }
                    if (R.data("method") != L.data("method")) {
                        var P = true;
                        switch (L.data("method")) {
                        case "tts":
                            if (N.val().length == 0) {
                                P = false
                            }
                            break;
                        case "mic":
                            if (!L.data("aid")) {
                                P = false
                            }
                            break
                        }
                        if (P) {
                            var Q = A("#dialog_input_change_confirm").clone().find(".alert").click(function(T) {
                                L.data("method", R.data("method"));
                                R.siblings().removeClass("on").end().addClass("on");
                                K()
                            }).end();
                            showOverlay(Q);
                            return
                        }
                    }
                    L.data("method", R.data("method"));
                    R.siblings().removeClass("on").end().addClass("on");
                    K()
                });
                function K() {
                    var P = N.parents(".dialog_input_wrapper");
                    P.hide();
                    if (P.size() <= 0) {
                        N.hide()
                    }
                    N.val("");
                    C.hide();
                    if (E) {
                        E.destory();
                        E = null;
                        L.find(".voice_recorder").hide()
                    }
                    L.removeData("aid");
                    switch (L.data("method")) {
                    case "tts":
                        P.show();
                        if (P.size() <= 0) {
                            N.show()
                        }
                        N.val("").focus();
                        break;
                    case "mic":
                        E = new VoiceRecorder({
                            loadHandler: F,
                            processCompleteHandler: G,
                            reRecordHandler: O,
                            focusHandler: I
                        });
                        break;
                    default:
                        break
                    }
                    GoLite.noticifyChange()
                }
                function F(P) {
                    P = A.extend({}, this.settings.flashvars, P);
                    L.find(".voice_recorder").show().height(48).flash({
                        id: this.recorderId,
                        swf: this.settings.swf,
                        height: "100%",
                        width: 538,
                        bgcolor: "#ffffff",
                        scale: "exactfit",
                        allowScriptAccess: "always",
                        allowFullScreen: "true",
                        wmode: "transparent",
                        hasVersion: "10.0.12",
                        flashvars: P
                    })
                }
                function G(P) {
                    L.data("aid", P);
                    GoLite.noticifyChange()
                }
                function O() {
                    L.removeData("aid");
                    GoLite.noticifyChange()
                }
                function I() {
                    L.siblings().removeClass("focus");
                    L.addClass("focus")
                }
            })
        }
    }
    )(jQuery);
    var facialExpression = (function(D) {
        var B = false, E, C = {};
        var A = {
            init: function(F) {
                if (B) {
                    return
                }
                B = true;
                D.extend(C, F);
                D("#expression_list a").click(function(H) {
                    H.preventDefault();
                    var G = D(this);
                    if (G.hasClass("selected")) {
                        return
                    }
                    D("#expression_list a").removeClass("selected");
                    G.addClass("selected");
                    D("#facial_expression_selected").val(G.data("facial"))
                });
                D("#facial_expression_submit").click(function(H) {
                    H.preventDefault();
                    var G = D("#expression_list a.selected");
                    E.trigger("updateFacial", [G.data("facial"), G.text()]);
                    E.find(".dialog_input").focus();
                    D.unblockUI()
                })
            },
            initialized: function() {
                return B
            },
            name: function(F) {
                return (C[F]) ? C[F] : ""
            },
            show: function(G) {
                var F = G.data("facial") || "default";
                if (G) {
                    E = G
                }
                D("#expression_list").find("a.selected").removeClass("selected").end().find("a." + F).addClass("selected");
                showOverlay(D("#facial_expression"))
            }
        };
        return A
    }
    )(jQuery);
    var photoArray = [];
    function updatePhotoArray() {
        try {
            photoArray = [];
            var A = document.getElementById("Player");
            if (A && typeof A.getPhotoArray == "function") {
                photoArray = A.getPhotoArray()
            }
        } catch (B) {
            console.log(B);
        }
    }
    function sendPhotoArray() {
        return photoArray
    }
    var GoLite = (function(E) {
        var R = 30, P = 10, B, T, A = [], U = null, O = false, S = false, V = "", D = false, C = 0, J = 1, Q = false, I = false;
        function F() {
            var W = {};
            if (B) {
                W.enc_mid = B
            }
            W.enc_tid = T.data("tid");
            if (U) {
                W.opening_closing = U
            } else {
                W.opening_closing = {
                    opening: "",
                    closing: ""
                }
            }
            W.characters = [];
            E.each(A, function(Y, Z) {
                var X = {};
                X[Z.data("cid")] = Y + 1;
                W.characters.push(X)
            });
            W.script = GoLite.getScripts();
            if (I) {
                W.opening_closing.opening_characters = {};
                W.opening_closing.opening_characters.facial = E.extend({}, W.script[0].facial);
                for (x in W.opening_closing.opening_characters.facial) {
                    W.opening_closing.opening_characters.facial[x] = "default"
                }
                W.opening_closing.closing_characters = {};
                W.opening_closing.closing_characters.facial = E.extend({}, W.script[(W.script.length - 1)].facial)
            }
            return W
        }
        function H(X, W) {
            var Y = 384;
            if (W.isWide) {
                Y = 339
            }
            E("#" + X).flash({
                id: "Player",
                swf: GoLite.settings.player.swf,
                height: Y,
                width: 550,
                bgcolor: "#000000",
                quality: "high",
                scale: "exactfit",
                allowScriptAccess: "always",
                allowFullScreen: "true",
                wmode: "transparent",
                hasVersion: "10.0.12",
                flashvars: W
            })
        }
        function K(X, W) {
            var W = W || {};
            E("#" + X).flash({
                id: "thumbnailChooser",
                swf: GoLite.settings.thumbnailChooser.swf,
                height: 170,
                width: 295,
                quality: "high",
                scale: "exactfit",
                allowScriptAccess: "always",
                allowFullScreen: "true",
                wmode: "transparent",
                hasVersion: "10.0.12",
                flashvars: W
            })
        }
        function G() {
            var Z = false
              , Y = false
              , W = false
              , X = Q;
            if (C == 1 && T.data("plus")) {
                Y = true;
                psHook = "golite_template.site"
            }
            if (C == 1 && (A[0].data("plus") || A[1].data("plus"))) {
                W = true;
                psHook = "golite_character.site"
            }
            if (C == 1 && J > P) {
                Z = true;
                psHook = "golite_dialog.site"
            }
            Q = Y || W || Z;
            E("#step1 .btn_next, #step2 .btn_next, #step3 .btn_next").toggle(!Q);
            E("#step1 .upgrade, #step2 .upgrade, #step3 .upgrade").toggle(Q);
            if (Q != X) {
                setTimeout("jQuery(document).trigger('GoLite.stateChange', [''])", 10)
            }
        }
        function M(X, W) {
            S = true;
            V = W;
            if ("save" == W) {
                updatePhotoArray()
            }
            E("#step4 .inside > div").css("display", "none");
            if ("loading" == W) {
                E("#step4 .loading").css("display", "block")
            } else {
                if ("preview" == W) {
                    E("#step4 .preview").css("display", "block");
                    E("#step4 .previous_step").css("display", "block");
                } else {
                    if ("save" == W) {
                        E("#step4 .save").fadeIn();
                        E("#step4 .previous_step").css("display", "none");
                        E("#movie_title").focus();
                        K("thumb_chooser_container", {
                            templateThumbnail: T.data("thumb")
                        });
                    } else {
                        if ("upgrade" == W) {
                            E("#step4 .upgrade").show()
                        } else {
                            S = false;
                            if (C == 0) {
                                E("#step4 .anonymous").css("display", "block")
                            } else {
                                if (Q) {
                                    E("#step4 .upgrade").css("display", "block")
                                } else {
                                    E("#step4 .generate").css("display", "block")
                                }
                            }
                        }
                    }
                }
            }
        }
        function N() {
            var Z = {
                en_US: {
                    M: ["eric", "oc_simon"],
                    F: ["oc_kate", "oc_julie"]
                },
                es_ES: {
                    M: ["oc_juan", "oc_jorge"],
                    F: ["oc_carmen", "oc_leonor"]
                }
            };
            var W = "en_US";
            if (typeof Z[I18N_LANG] != "undefined") {
                W = I18N_LANG
            }
            var Y = {
                M: 0,
                F: 0
            };
            for (var a = 0; a < A.length; a++) {
                if (A[a].data("voice")) {
                    continue
                }
                var b = A[a].data("gender");
                var X = Y[b]++;
                A[a].data("voice", Z[W][b][X])
            }
        }
        var L = [];
        return {
            settings: {
                dialigMaxLength: 180
            },
            init: function(c) {
                if (D) {
                    return
                }
                D = true;
                C = c;
                var Z = new ItemSelector(E("#templates"));
                T = Z.getItem();
                E("#template_name").html(T.attr("title"));
                E("#template_desc").html(T.data("desc"));
                E("#templates").bind("change", function(h, f, g) {
                    T = g;
                    E("#template_name").html(g.attr("title"));
                    E("#template_desc").html(g.data("desc"));
                    E("#character1_title img").attr("src", g.data("char-thumb-a"));
                    E("#character2_title img").attr("src", g.data("char-thumb-b"));
                    G();
                    E("#dialogs .dialog").removeData("sorder");
                    GoLite.noticifyChange()
                });
                if (golite_theme == "talkingpicz") {
                    function X(e) {
                        E("#chars_" + e + " > div").each(function(f, g) {
                            A[f] = E(g)
                        });
                        N();
                        E("#dialogs .dialog").each(function(h, j) {
                            var g = E(j);
                            var f = parseInt(g.data("charId"));
                            g.find(".char_thumb > img").attr("src", A[f].data("thumb"));
                            g.trigger("updatevoice", [A[f].data("voice")]);
                            g.removeData("aid")
                        })
                    }
                    E("#templates").bind("change", function(h, f, g) {
                        X(g.data("tid"))
                    });
                    X(T.data("tid"))
                } else {
                    var b = {
                        findCharacterPosById: function(e) {
                            var f = -1;
                            this.getItems().each(function(g, h) {
                                if (jQuery(h).data("cid") == e) {
                                    f = g
                                }
                            });
                            return f
                        }
                    };
                    var W = jQuery.extend(new ItemSelector(E("#character1")), b);
                    var d = jQuery.extend(new ItemSelector(E("#character2")), b);
                    L.push(W, d);
                    var a = W.getItem();
                    E("#character1").parent().find(".name").html(a.data("name"));
                    A[0] = a;
                    var Y = d.getItem();
                    E("#character2").parent().find(".name").html(Y.data("name"));
                    A[1] = Y;
                    N();
                    E("#character1, #character2").bind("change", function(j, g, h) {
                        E(this).parent().find(".name").html(h.data("name"));
                        var f = (E(this).attr("id") == "character1") ? 0 : 1;
                        A[f] = h;
                        G();
                        N();
                        E("#dialogs .dialog").each(function(k, l) {
                            var e = E(l);
                            if (e.data("charId") == f) {
                                e.find(".char_thumb > img").attr("src", h.data("thumb"));
                                e.trigger("updatevoice", [h.data("voice")]);
                                e.removeData("aid")
                            }
                            (golite_theme == "wildlife") && e.removeData("sorder")
                        });
                        GoLite.noticifyChange()
                    })
                }
                if (E("#facial_expression").length) {
                    I = true
                }
                E(document).ready(function() {
                    if (C < 2) {
                        E("#templates .plus-label").before(E(".snippets .plus-cover").clone())
                    }
                    if (C == 2) {
                        E(".plus-character").html(E(".snippets .plus-char-txt").clone())
                    }
                    var e = GoLite.getCharacters();
                    E("#dialogs .dialog").each(function(g, h) {
                        var f = parseInt(E(this).data("charId"));
                        E(this).trigger("updatevoice", [e[f].data("voice")])
                    });
                    E("#dialogs .dialog_input_message").find(".basic").toggle(C < 2).end().find(".plus").toggle(C == 2);
                    E("#dialogs .upsell, #step4 .upsell").toggle(C < 2);
                    E(document).bind("delete.scriptDialog insert.scriptDialog", function(h) {
                        var f = R;
                        var g = E("#dialogs .num");
                        g.each(function(j) {
                            E(this).html((j + 1))
                        });
                        J = g.length;
                        G();
                        E("#dialogs .fake").toggle(g.length < f).toggleClass("highlight", (C < 2 && J >= P));
                        GoLite.noticifyChange()
                    });
                    E(document).bind("GoLite.stateChange", M)
                })
            },
            getTemplate: function() {
                return T
            },
            getCharacters: function() {
                return A
            },
            getScripts: function() {
                var Z = E("#dialogs .dialog:not(.fake)")
                  , Y = "talk"
                  , W = []
                  , a = {}
                  , X = {};
                if (I) {
                    E.each(A, function(b) {
                        X[(b + 1)] = "default"
                    })
                }
                Z.each(function(e, k) {
                    var h = E(k);
                    var b = parseInt(h.data("charId"));
                    var g = A[b];
                    if (!g) {
                        return
                    }
                    text = E.trim(h.find(".dialog_input").val());
                    var j = {
                        type: Y,
                        cid: g.data("cid"),
                        voice: g.data("voice"),
                        text: text,
                        char_num: b + 1
                    };
                    var c = h.data("aid");
                    if (c) {
                        j.aid = c
                    } else {
                        j.aid = ""
                    }
                    var f = h.data("sorder");
                    if (f) {
                        j.sorder = f
                    } else {
                        j.order = ""
                    }
                    if (I) {
                        j.facial = {};
                        var d = h.data("facial");
                        if (d) {
                            j.facial[b + 1] = d
                        }
                        j.facial = E.extend({}, X, j.facial)
                    }
                    W.push(j)
                });
                return W
            },
            insertDialog: function(W) {
                var W = W || {};
                var X = {
                    charId: 0,
                    focus: true
                };
                E.extend(X, W);
                if (E("#dialogs .dialog:not(.fake)").length >= R) {
                    return
                }
                var a = A[X.charId];
                var Z = E("#dialogTmpl").tmpl({
                    thumbURL: a.data("thumb"),
                    hasFacial: I
                });
                Z.data("charId", X.charId).scriptDialog();
                Z.trigger("updatevoice", a.data("voice"));
                if (X.facial) {
                    Z.trigger("updateFacial", [X.facial, facialExpression.name(X.facial)])
                } else {
                    if (I) {
                        Z.trigger("updateFacial", ["default", facialExpression.name("default")]);
                        var b = E("#dialogs .fake").prev();
                        while (b.length) {
                            if (b.data("charId") == Z.data("charId")) {
                                var Y = b.data("facial");
                                Z.trigger("updateFacial", [Y, facialExpression.name(Y)]);
                                break
                            }
                            b = b.prev()
                        }
                    }
                }
                if (X.after) {
                    Z.insertAfter(X.after)
                } else {
                    Z.insertBefore("#dialogs .fake")
                }
                if (X.focus) {
                    Z.find(".dialog_input").focus()
                }
            },
            preview: function() {
                if (O || C == 0 || Q || /^(preview|save)$/.test(V)) {
                    return
                }
                var W = F();
                E(document).trigger("GoLite.stateChange", ["loading"]);
                E.ajaxSetup({
                    error: function(X, Z, Y) {
                        O = false;
                        E(document).trigger("GoLite.stateChange", [""]);
                    }
                });
                O = true;
                E.post("/ajax/previewText2Video", W, function(X) {
                    O = false;
                    if (X.error) {
                        showNotice(X.error, true);
                        E(document).trigger("GoLite.stateChange", [""]);
                        return
                    }
                    B = X.enc_mid;
                    U = X.opening_closing;
                    var Y = E("#dialogs .dialog:not(.fake)");
                    E.each(X.script, function(b, Z) {
                        var a = Y.eq(b);
                        a.data("aid", Z.aid).data("sorder", Z.sorder)
                    });
                    H("player_container", X.player_object);
                    E(document).trigger("GoLite.stateChange", ["preview"])
                }, "json");
                E.ajaxSetup({
                    error: null
                })
            },
            save: function(b) {
                if (O) {
                    return
                }
                var b = b || {};
                var e = {};
                E.extend(e, b);
                var d = E("#movie_title");
                var a = E.trim(d.val());
                if (a == d.attr("placeholder")) {
                    a = ""
                }
                if (a.length == 0) {
                    E("#movie_title").focus();
                    showNotice(GT.gettext("Please enter a movie title"), true);
                    return
                }
                var c = E("#movie_description");
                var Z = E.trim(c.val());
                if (Z == c.attr("placeholder")) {
                    Z = ""
                }
                var W = null;
                try {
                    W = document.getElementById("thumbnailChooser").getThumbnail();
                    if (W.length) {
                        W = W[0]
                    }
                } catch (Y) {}
                var X = {
                    enc_mid: B,
                    tag: "",
                    title: a,
                    desc: Z
                };
                if (W) {
                    X.thumbnail = W
                }
                if (e.youtubePublish) {
                    X.youtube_publish = e.youtubePublish
                }
                if (e.publish_quality) {
                    X.publish_quality = e.publish_quality
                }
                E.ajaxSetup({
                    error: function(f, h, g) {
                        O = false;
                        E(document).trigger("GoLite.stateChange", [""]);
                    }
                });
                O = true;
                showOverlay(E("#publishing"));
                E.post("/ajax/saveText2Video", X, function(f) {
                    O = false;
                    if (f.error) {
                        E.unblockUI();
                        showNotice(f.error, true);
                        return
                    }
                    window.location = f.url
                }, "json");
                E.ajaxSetup({
                    error: null
                })
            },
            noticifyChange: function() {
                if (S) {
                    E(document).trigger("GoLite.stateChange", [""])
                }
            },
            getUserState: function() {
                return C
            },
            updateUserState: function(W) {
                E.get("/api/isTemplatePublished", Object.fromEntries(new URLSearchParams(window.location.search)), function(X) {
                    C = X.isPublished ? 2 : 0;
                    E("#dialogs .dialog_input_message").find(".basic").toggle(C < 2).end().find(".plus").toggle(C == 2);
                    E("#dialogs .upsell, #step4 .upsell").toggle(C < 2);
                    G();
                    if (W && typeof W == "function") {
                        W(C)
                    }
                }, "json")
            },
            showSelectCCOverlay: function(X) {
                var W = GoLite.getCharacters();
                var Y = new SelectCCDialog(jQuery(".snippets .selectccoverlay").clone(),X,(C >= 2));
                Y.setDefaultCharacterById(W[X].data("cid"));
                Y.setDefaultVoice(W[X].data("voice"));
                Y.show()
            },
            showSelectVoiceOverlay: function(X) {
                var W = GoLite.getCharacters();
                var Y = new SelectVoiceDialog(jQuery(".snippets .selectvoiceoverlay").clone(),X,(C >= 2));
                Y.setDefaultVoice(W[X].data("voice"));
                Y.show()
            },
            addCC: function(W, X) {
                E.each(L, function(a, Z) {
                    var Y = Z.findCharacterPosById(W.id);
                    if (Y < 0) {
                        Z.addItem(W);
                        Y = Z.getItems().length - 1
                    }
                    if (X != null && a == X) {
                        L[a].gotoByOffset(Y)
                    }
                })
            },
            getWatermarks: function() {
                B && getWatermarks(B)
            }
        }
    }
    )(jQuery);
    function blockUICenterX() {
        $block = jQuery(".blockUI.blockMsg");
        $block.css("left", (jQuery(window).width() - $block.width()) / 2 + jQuery(window).scrollLeft() + "px")
    }
    function showOverlay(C, A) {
        var A = A || {};
        var B = {
            padding: 0,
            margin: 0,
            width: "auto",
            top: "120px",
            left: "29%",
            textAlign: "center",
            color: "#000",
            border: "none",
            backgroundColor: "transparent",
            cursor: "auto"
        };
        jQuery.extend(B, A);
        jQuery.blockUI({
            message: C,
            css: B,
            overlayCSS: {
                cursor: "auto"
            }
        });
        blockUICenterX()
    }
    function showNotice(C, A) {
        A = typeof (A) != "undefined" ? A : false;
        var B = jQuery('<div class="growlUI"></div>');
        B.toggleClass("error", A);
        B.append("<h1>Notification</h1>");
        B.append("<h2>" + C + "</h2>");
        jQuery.blockUI({
            message: B,
            fadeIn: 700,
            fadeOut: 700,
            centerY: false,
            timeout: 5000,
            showOverlay: false,
            css: {
                width: "350px",
                top: "10px",
                left: "",
                right: "10px",
                textAlign: "left",
                border: "none",
                padding: "15px",
                backgroundColor: "#000",
                "-webkit-border-radius": "10px",
                "-moz-border-radius": "10px",
                "border-radius": "10px",
                opacity: 0.8,
                color: "#fff"
            }
        })
    }
    var psWin = null
      , psHook = "";
    function popUpgrade(B) {
        if (psWin && !psWin.closed) {
            psWin.focus()
        } else {
            var A = "https://web.archive.org/web/20120624180351/https://goanimate.com/plussignup/?ui=popup";
            if (view_name == "youtube") {
                A = "https://web.archive.org/web/20120624180351/http://goanimate.com/plusfeatures/?ui=popup&app=youtube"
            }
            if (B) {
                A += "&hook=" + B
            } else {
                if (psHook) {
                    A += "&hook=" + psHook
                }
            }
            showOverlay(jQuery("#upgrade"));
            psWin = window.open(A, "gapayment", "height=800,width=1000,directories=no,menubar=no,scrollbars=yes,status=no,toolbar=no")
        }
    }
    function showPublish() {
        if (view_name == "youtube") {
            if (jQuery("#publish").length == 0) {
                jQuery.get("/ajax/publishForm", function(A) {
                    jQuery("body").append(A);
                    showOverlay(jQuery("#publish"))
                })
            } else {
                showOverlay(jQuery("#publish"))
            }
            if (typeof pageTracker != "undefined" && pageTracker) {
                pageTracker._trackPageview("/pageTracker/ajax/overlay/publish/true")
            }
            return
        }
    }
    function customCharSignup() {
        psHook = "golite_customcharacter.site";
        popUpgrade()
    }
    function SelectCCDialog(G, A, C) {
        var D = VoiceCatalog.getModel();
        var F = new VoiceSelectionWidget(jQuery(".voiceselectorwidget", G),D,C);
        var B = new CCBrowserSimple(jQuery(".ccbrowsercontainer", G),customCC_model);
        var E = function() {
            if (F.getSelectedVoice() == null) {
                window.alert(GT.gettext("Please select a voice for the character"));
                return
            }
            if (B.getSelectedCc() == null) {
                window.alert(GT.gettext("Please select a character"));
                return
            }
            var N = GoLite.getCharacters();
            var H = N[A].data("voice") != F.getSelectedVoice();
            var O = B.getSelectedCc();
            var L = jQuery("div.character div.items").find(".item").filter(function() {
                return jQuery(this).data("cid") == O.id
            });
            var M = F.getSelectedVoice();
            if (L.size() <= 0) {
                var K = jQuery(".snippets div.item").clone();
                K.data("cid", O.id).data("voice", M).data("thumb", O.head_url);
                jQuery("img", K).attr("src", O.thumb_url);
                K.appendTo("div.character div.items")
            } else {
                jQuery.each(L, function() {
                    jQuery(this).data("voice", M)
                })
            }
            GoLite.addCC(O, A);
            if (H) {
                var I = N[A].data("cid");
                var J = [];
                jQuery.each(N, function(P) {
                    if (jQuery(this).data("cid") == I) {
                        J.push(P)
                    }
                });
                jQuery(".dialog").each(function(P, Q) {
                    if (jQuery(Q).data("method") == "tts" && jQuery.inArray(jQuery(Q).data("charId"), J) >= 0) {
                        jQuery(Q).removeData("aid")
                    }
                });
                if (J.length > 0) {
                    GoLite.noticifyChange()
                }
            }
            jQuery.unblockUI()
        };
        if (typeof pageTracker != "undefined" && pageTracker) {
            pageTracker._trackPageview("/pageTracker/golite/selectccdialog")
        }
        return {
            setDefaultCharacterById: function(H) {
                B.setSelectedCcById(H)
            },
            setDefaultVoice: function(H) {
                F.selectVoiceById(H)
            },
            show: function() {
                jQuery("#voiceselect_confirm", G).click(E);
                jQuery("#voiceselect_plusupgrade", G).click(function() {
                    popUpgrade("golite_customvoice.site")
                });
                showOverlay(G, {
                    top: -Math.round(screen.width / screen.height)
                });
                F.onChange(function(J) {
                    var H = J.data("voice-info");
                    var I = (!H.plus || C);
                    (jQuery("#voiceselect_confirm", G))[I ? "show" : "hide"]();
                    (jQuery("#voiceselect_plusupgrade", G))[I ? "hide" : "show"]()
                });
                jQuery(".voiceselectorwidget", G).trigger("display", [])
            }
        }
    }
    function SelectVoiceDialog(F, A, B) {
        var C = VoiceCatalog.getModel();
        var E = new VoiceSelectionWidget(jQuery(".voiceselectorwidget", F),C,B);
        var D = function() {
            if (E.getSelectedVoice() == null) {
                window.alert(GT.gettext("Please select a voice for the character"));
                return
            }
            var L = GoLite.getCharacters();
            var G = L[A].data("voice") != E.getSelectedVoice();
            var J = jQuery(L).filter(function() {
                return jQuery(this).data("cid") == L[A].data("cid")
            });
            var K = E.getSelectedVoice();
            if (G) {
                jQuery.each(J, function() {
                    jQuery(this).data("voice", K)
                });
                var H = L[A].data("cid");
                var I = [];
                jQuery.each(L, function(M) {
                    if (jQuery(this).data("cid") == H) {
                        I.push(M)
                    }
                });
                jQuery(".dialog").each(function(M, N) {
                    if (jQuery(N).data("method") == "tts" && jQuery.inArray(jQuery(N).data("charId"), I) >= 0) {
                        jQuery(N).trigger("updatevoice", [K]).removeData("aid")
                    }
                });
                if (I.length > 0) {
                    GoLite.noticifyChange()
                }
            }
            jQuery.unblockUI()
        };
        if (typeof pageTracker != "undefined" && pageTracker) {
            pageTracker._trackPageview("/pageTracker/golite/selectvoicedialog")
        }
        return {
            setDefaultVoice: function(G) {
                E.selectVoiceById(G)
            },
            show: function() {
                jQuery("#voiceselectonly_confirm", F).click(D);
                jQuery("#voiceselectonly_plusupgrade", F).click(function() {
                    popUpgrade("golite_customvoice.site")
                });
                showOverlay(F);
                E.onChange(function(I) {
                    var G = I.data("voice-info");
                    var H = (!G.plus || B);
                    (jQuery("#voiceselectonly_confirm", F))[H ? "show" : "hide"]();
                    (jQuery("#voiceselectonly_plusupgrade", F))[H ? "hide" : "show"]()
                });
                jQuery(".voiceselectorwidget", F).trigger("display", [])
            }
        }
    }
    var VoiceLanguageDisplay = function(B) {
        var A = null;
        B.click(function() {
            GoLite.showSelectVoiceOverlay(B.parents(".dialog").data("charId"))
        });
        var C = {
            updateByVoiceId: function(D) {
                var F;
                const lang_model = VoiceCatalog.getModel();
                for (const langId in lang_model) {
                    const i = lang_model[langId]['options'].find(i => i.id == D);
                    if (i) F = {
                        gender: i.sex,
                        locale: { 
                            id: langId, 
                            lang: i.lang, 
                            country: i.country, 
                            desc: lang_model[langId].desc 
                        }
                    };
                }
                while (F) {
                    if ((A && A.gender) != F.gender || (A && A.locale) != F.locale) {
                        A = F;
                        B.find(".gender").removeClass().addClass("gender " + F.gender);
                        B.find(".lang").removeClass().addClass("lang " + (F.locale.country || ("lg_" + F.locale.lang)))
                    }
                    break;
                }
            }
        };
        return C
    };
    (function(A) {
        A.InFieldLabels = function(C, E, B) {
            var D = this;
            D.$label = A(C);
            D.$field = A(E);
            D.$label.data("InFieldLabels", D);
            D.showing = true;
            D.init = function() {
                D.options = A.extend({}, A.InFieldLabels.defaultOptions, B);
                if (D.$field.val() != "") {
                    D.$label.hide();
                    D.showing = false
                }
                D.$label.click(function() {
                    D.$field.focus()
                });
                D.$field.focus(function() {
                    D.fadeOnFocus()
                }).blur(function() {
                    D.checkForEmpty(true)
                }).bind("keydown.infieldlabel", function(F) {
                    D.hideOnChange(F)
                }).change(function(F) {
                    D.checkForEmpty()
                }).bind("onPropertyChange", function() {
                    D.checkForEmpty()
                })
            }
            ;
            D.fadeOnFocus = function() {
                if (D.showing) {
                    D.setOpacity(D.options.fadeOpacity)
                }
            }
            ;
            D.setOpacity = function(F) {
                D.$label.stop().animate({
                    opacity: F
                }, D.options.fadeDuration);
                D.showing = (F > 0)
            }
            ;
            D.checkForEmpty = function(F) {
                if (D.$field.val() == "") {
                    D.prepForShow();
                    D.setOpacity(F ? 1 : D.options.fadeOpacity)
                } else {
                    D.setOpacity(0)
                }
            }
            ;
            D.prepForShow = function(F) {
                if (!D.showing) {
                    D.$label.css({
                        opacity: 0
                    }).show();
                    D.$field.bind("keydown.infieldlabel", function(G) {
                        D.hideOnChange(G)
                    })
                }
            }
            ;
            D.hideOnChange = function(F) {
                if ((F.keyCode == 16) || (F.keyCode == 9)) {
                    return
                }
                if (D.showing) {
                    D.$label.hide();
                    D.showing = false
                }
                D.$field.unbind("keydown.infieldlabel")
            }
            ;
            D.init()
        }
        ;
        A.InFieldLabels.defaultOptions = {
            fadeOpacity: 0.5,
            fadeDuration: 300
        };
        A.fn.inFieldLabels = function(B) {
            return this.each(function() {
                var C = A(this).find(".label");
                if (!C.length) {
                    return
                }
                var D = A(this).find("input[type='text'],input[type='password'],textarea");
                if (D.length == 0) {
                    return
                }
                (new A.InFieldLabels(C[0],D[0],B))
            })
        }
    }
    )(jQuery);