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
    var C = 0, E = 0;
    var A;
    (function() {
        var F = null;
        A = {
            dirty: function(G) {
                if (G) {
                    F = null
                }
            },
            all: function() {
                return (F ? F : (F = B.find(".item")))
            }
        }
    }
    )();
    var D = {
        current: function() {
            return C
        },
        getItem: function() {
            return A.all().eq(C)
        },
        getItems: function() {
            return A.all()
        },
        gotoByOffset: function(G) {
            if (G >= 0 && G < E) {
                C = G;
                A.all().hide();
                var F = A.all().eq(C);
                F.show();
                B.trigger("change", [C, F])
            }
        },
        addItem: function(F) {
            A.dirty(true);
            ++E
        },
        nav: function(G) {
            A.all().hide().removeClass("selected");
            if (G == "next") {
                if (++C == E) {
                    C = 0
                }
            } else {
                if (--C == -1) {
                    C = E - 1
                }
            }
            var F = A.all().eq(C);
            F.show().addClass("selected");
            B.trigger("change", [C, F])
        },
        navCheck: function(F) {
            return true
        }
    };
    B.find(".item").each(function(F) {
        if (jQuery(this).hasClass("selected")) {
            C = F
        }
        E++
    });
    B.find(".select_button").click(function(G) {
        G.preventDefault();
        var F = jQuery(this).hasClass("next") ? "next" : "prev";
        if (D.navCheck(F)) {
            D.nav(F)
        }
    });
    return D
}
function ItemSelectorWithHost(B) {
    var D = ItemSelector.call(this, B);
    var C = null, A = D.getItems();
    A.each(function(F, H) {
        var G = 0, I = 0;
        var E = jQuery(this).find(".host");
        E.each(function(J) {
            if (jQuery(this).hasClass("selected")) {
                G = J
            }
            I++
        });
        jQuery(H).find(".control_button").click(function(K) {
            K.preventDefault();
            E.hide().removeClass("selected");
            if (jQuery(this).hasClass("next")) {
                if (++G == I) {
                    G = 0
                }
            } else {
                if (--G == -1) {
                    G = I - 1
                }
            }
            var J = E.eq(G);
            J.show().addClass("selected");
            C = J;
            B.trigger("changeHost", [G, J])
        });
        if (jQuery(H).hasClass("selected")) {
            C = E.eq(G)
        }
        B.bind("change", function(J) {
            if (jQuery(H).hasClass("selected")) {
                C = E.eq(G);
                B.trigger("changeHost", [G, C])
            }
        })
    });
    D.getHost = function() {
        return C
    };
    return D
}
class VoiceRecorder {
    constructor(A) {
        this.counter = 0;
        this.instances = {};
        this.recording = false;
        this.defaultSettings = {
            swf: "/static/qvm/MyMicRecorder.swf",
            flashvars: {
                apiserver: "/qvm_micReocrd_",
                appCode: "go",
                clientThemePath: "/static/tommy/2012/<client_theme>"
            }
        };
        this.init(A);
    }
    init(A) {
        try {
            this.settings = jQuery.extend({
                loadHandler: null,
                processCompleteHandler: null,
                reRecordHandler: null,
                focusHandler: null
            }, this.defaultSettings, A);
            this.recorderId = "voice_recorder_" + this.counter++;
            this.instances[this.recorderId] = this;
            this.load({});
        } catch (B) {
            delete this.instances[this.recorderId];
            throw B;
        }
    }
    destory() {
        try {
            var A = document.getElementById(this.recorderId);
            if (A) {
                try {
                    A.parentNode.removeChild(A);
                } catch (B) { }
            }
            window[this.recorderId] = null;
            this.instances[this.recorderId] = null;
            delete this.instances[this.recorderId];
            if (this.recording == this.recorderId) {
                this.recording = false;
            }
            this.recorderId = null;
            this.settings = null;
            return true;
        } catch (B) {
            return false;
        }
    }
    load(A) {
        if (typeof this.settings.loadHandler == "function") {
            A = jQuery.extend({}, A, {
                recorderId: this.recorderId,
                tlang: ((typeof I18N_LANG != "undefined") ? I18N_LANG : "en_US")
            });
            this.settings.loadHandler.apply(this, [A]);
        }
    }
    processComplete(A) {
        this.recording = false;
        if (typeof this.settings.processCompleteHandler == "function") {
            this.settings.processCompleteHandler.apply(this, [A]);
        }
    }
    processError() {
        this.recording = false;
    }
    reRecord() {
        if (typeof this.settings.reRecordHandler == "function") {
            this.settings.reRecordHandler.apply(this);
        }
    }
    focus() {
        if (typeof this.settings.focusHandler == "function") {
            this.settings.focusHandler.apply(this);
        }
    }
    showSettings() {
        this.setHeight(205);
    }
    doneSettings() {
        this.setHeight(48);
    }
    startRecord() {
        if (this.recording) {
            return false;
        }
        this.recording = this.recorderId;
        return true;
    }
    setHeight(A) {
        if (jQuery.browser.mozilla) {
            jQuery(document.getElementById(this.recorderId).parentNode).height(A);
        } else {
            jQuery(document.getElementById(this.recorderId).parentNode).animate({
                height: A + "px"
            }, 300);
        }
    }
}
(function(A) {
    A.fn.scriptDialog = function() {
        var B = GoLite.settings.dialigMaxLength;
        return this.each(function() {
            var M = A(this);
            var O = M.find(".dialog_input");
            var C = M.find(".counter");
            var E;
            var D = new VoiceLanguageDisplay(M.find(".langarea"));
            M.bind("updatevoice", function(R, Q) {
                if (Q) {
                    D.updateByVoiceId(Q)
                }
            });
            function J(S) {
                S.preventDefault();
                var Q = GoLite.getCharacters();
                var R = parseInt(M.data("charId"));
                if (Q.length == 1) {
                    R = 0
                } else {
                    R++;
                    if (R >= Q.length) {
                        R = 0
                    }
                    while (Q[R].data("invisible")) {
                        R++;
                        if (R >= Q.length) {
                            R = 0
                        }
                    }
                }
                M.find(".char_thumb > img").attr("src", Q[R].data("thumb"));
                M.data("charId", R);
                if (M.data("method") == "tts") {
                    M.removeData("aid")
                }
                M.trigger("updatevoice", [Q[R].data("voice")]);
                M.next(".fake").trigger("switchCharacter")
            }
            if (M.hasClass("fake")) {
                M.find(".char_thumb > img").click(function(Q) {
                    O.focus()
                });
                O.bind("focus", function(Q) {
                    GoLite.insertDialog({
                        charId: M.data("charId")
                    });
                    A(document).trigger("insert.scriptDialog");
                    J(Q);
                    var R = A("#dialogs");
                    if (R.length) {
                        R.scrollTop(R[0].scrollHeight)
                    }
                });
                M.bind("switchCharacter", J);
                return
            }
            function H() {
                O = null;
                C = null;
                if (E) {
                    E.destory();
                    E = null
                }
                M.remove();
                M = null
            }
            O.bind("keypress keyup change paste focus", function(R) {
                if (R.type == "keypress") {
                    if (R.which == 13) {
                        R.preventDefault();
                        M.next().find(".dialog_input").focus();
                        O.trigger("blur")
                    }
                    return
                }
                var Q = B - O.val().length;
                if (Q < 0) {
                    O.val(O.val().substring(0, B));
                    Q = 0
                }
                C.html(GT.strargs(GT.gettext("%1 characters remaining"), [Q]))
            });
            O.bind("focus", function(Q) {
                I();
                if (M.data("method") == "tts") {
                    C.show()
                }
            });
            O.bind("blur", function(Q) {
                C.hide()
            });
            O.bind("change", function(Q) {
                M.removeData("aid");
                GoLite.noticifyChange()
            });
            M.find(".box").click(I);
            M.find(".dialog_delete").click(function(R) {
                R.preventDefault();
                R.stopPropagation();
                if (M.siblings(":not(.fake)").length == 0) {
                    return
                }
                var Q = M.next(":not(.fake)");
                if (!Q.length) {
                    Q = M.prev()
                }
                if (Q.data("method") == "tts") {
                    Q.find(".dialog_input").focus()
                } else {
                    Q.siblings().removeClass("focus");
                    Q.addClass("focus")
                }
                H();
                A(document).trigger("delete.scriptDialog")
            });
            M.bind("destory.scriptDialog", function(Q) {
                H()
            });
            M.find(".dialog_insert").click(function(R) {
                R.preventDefault();
                R.stopPropagation();
                var Q = {
                    after: M,
                    charId: M.data("charId")
                };
                if (M.data("facial")) {
                    Q.facial = M.data("facial")
                }
                GoLite.insertDialog(Q);
                A(document).trigger("insert.scriptDialog")
            });
            M.find(".switch, .dialog_switch").click(function(Q) {
                Q.preventDefault();
                K()
            });
            M.find(".char_thumb > img").click(function(Q) {
                Q.preventDefault();
                M.siblings().removeClass("focus");
                M.addClass("focus");
                K()
            });
            M.find(".dialog_input_wrapper").inFieldLabels();
            if (M.find(".dialog_facial").length) {
                var N = M.find(".dialog_facial");
                M.bind("updateFacial", function(S, Q, R) {
                    if (M.data("facial") != Q) {
                        N.attr("class", "dialog_facial " + Q).find(".value").text(R);
                        M.data("facial", Q);
                        GoLite.noticifyChange()
                    }
                });
                N.click(function(Q) {
                    Q.preventDefault();
                    facialExpression.show(M)
                })
            }
            M.data("method", "tts");
            M.find(".dialog_input_control a").click(function(T) {
                T.preventDefault();
                var S = A(this);
                if (S.data("method") == "mic" && GoLite.getUserState() == 0) {
                    showNotice(GT.gettext("Please login to enable Voice Recording"));
                    return
                }
                if (S.data("method") != M.data("method")) {
                    var Q = true;
                    switch (M.data("method")) {
                    case "tts":
                        if (O.val().length == 0) {
                            Q = false
                        }
                        break;
                    case "mic":
                        if (!M.data("aid")) {
                            Q = false
                        }
                        break
                    }
                    if (Q) {
                        var R = A("#dialog_input_change_confirm").clone().find(".alert").click(function(U) {
                            M.data("method", S.data("method"));
                            S.siblings().removeClass("on").end().addClass("on");
                            L()
                        }).end();
                        showOverlay(R);
                        return
                    }
                }
                M.data("method", S.data("method"));
                S.siblings().removeClass("on").end().addClass("on");
                L()
            });
            function L() {
                var Q = O.parents(".dialog_input_wrapper");
                Q.hide();
                if (Q.size() <= 0) {
                    O.hide()
                }
                O.val("");
                C.hide();
                if (E) {
                    E.destory();
                    E = null;
                    M.find(".voice_recorder").hide()
                }
                M.removeData("aid");
                switch (M.data("method")) {
                case "tts":
                    Q.show();
                    if (Q.size() <= 0) {
                        O.show()
                    }
                    O.val("").focus();
                    break;
                case "mic":
                    E = new VoiceRecorder({
                        loadHandler: F,
                        processCompleteHandler: G,
                        reRecordHandler: P,
                        focusHandler: I
                    });
                    break;
                default:
                    break
                }
                GoLite.noticifyChange()
            }
            function F(Q) {
                Q = A.extend({}, this.settings.flashvars, Q);
                M.find(".voice_recorder").show().height(48).flash({
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
                    flashvars: Q
                })
            }
            function G(Q) {
                M.data("aid", Q);
                GoLite.noticifyChange()
            }
            function P() {
                M.removeData("aid");
                GoLite.noticifyChange()
            }
            function I() {
                M.siblings().removeClass("focus");
                M.addClass("focus")
            }
            function K() {
                M.find(".character_box").remove();
                var Q = GoLite.getCharacters();
                var R = parseInt(M.data("charId"));
                var U = A('<div class="character_box"></div>');
                var T = A('<a title="Cancel" class="close_btn">&#215;</a>');
                for (var S = 0; S < Q.length; S++) {
                    if (Q[S].data("invisible")) {
                        continue
                    }
                    A('<a class="character"></a>').append(A("<img />", {
                        src: Q[S].data("thumb")
                    })).toggleClass("on", (S == R)).data("charId", S).data("cid", Q[S].data("cid")).appendTo(U)
                }
                T.appendTo(U).click(function(V) {
                    V.preventDefault();
                    U.remove();
                    U = null
                });
                A(".character", U).click(function(Y) {
                    Y.preventDefault();
                    var X = A(this);
                    var V = GoLite.getCharacters();
                    if (!X.hasClass("on")) {
                        var W = X.data("charId");
                        M.find(".char_thumb > img").attr("src", V[W].data("thumb"));
                        M.data("charId", W).data("cid", X.data("cid"));
                        if (M.data("method") == "tts") {
                            M.removeData("aid")
                        }
                        M.trigger("updatevoice", [V[W].data("voice")]);
                        M.next(".fake").data("charId", W++).trigger("switchCharacter");
                        GoLite.noticifyChange()
                    }
                    O.focus();
                    U.remove();
                    U = null
                });
                U.appendTo(M).hide().fadeIn()
            }
        })
    }
})(jQuery);
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
})(jQuery);
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
    var S = 30, Q = 10, B, U, A = [], L = null, V = null, P = false, T = false, W = "", D = false, C = 0, K = 1, R = false, J = false;
    function G() {
        var X = {
            characters: [],
            enc_tid: U.data("tid"),
            script: GoLite.getScripts(),
            golite_theme
        };
        if (B) X.enc_mid = B
        if (V) X.opening_closing = V
        else X.opening_closing = {}
        E.each(A, function(Z, a) {
            var Y = {};
            Y[a.data("cid").replace(".", ":")] = Z + 1;
            X.characters.push(Y)
        });
        if (J) {
            X.opening_closing.opening_characters = {
                facial: X.script[0].facial
            };
            X.opening_closing.closing_characters = {
                facial: X.script[(X.script.length - 1)].facial
            };
        }
        return X
    }
    function I(Y, X) {
        E("#" + Y).flash({
            id: "Player",
            swf: GoLite.settings.player.swf,
            height: 384,
            width: 550,
            bgcolor: "#000000",
            quality: "high",
            scale: "exactfit",
            allowScriptAccess: "always",
            allowFullScreen: "true",
            wmode: "transparent",
            hasVersion: "10.0.12",
            flashvars: X
        })
    }
    function M(Y, X) {
        var X = X || {};
        E("#" + Y).flash({
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
            flashvars: X
        })
    }
    function H() {
        var a = false, Z = false, X = false, Y = R;
        if (C == 1 && K > Q) {
            a = true;
            psHook = "golite_dialog.site"
        }
        R = Z || X || a;
        E("#step3 .btn_next").toggle(!R);
        E("#step3 .upgrade").toggle(R);
        if (R != Y) {
            setTimeout("jQuery(document).trigger('GoLite.stateChange', [''])", 10)
        }
    }
    function N(Y, X) {
        T = true;
        W = X;
        if ("save" == X) {
            updatePhotoArray()
        }
        E("#step4 .inside > div").css("display", "none");
        if ("loading" == X) {
            E("#step4 .loading").css("display", "block")
        } else {
            if ("preview" == X) {
                E("#step4 .preview").css("display", "block");
                E("#step4 .previous_step").css("display", "block");
            } else {
                if ("save" == X) {
                    E("#step4 .save").fadeIn();
                    E("#step4 .previous_step").css("display", "none");
                    E("#movie_title").focus();
                    M("thumb_chooser_container", {
                        templateThumbnail: U.data("thumb")
                    });
                } else {
                    if ("upgrade" == X) {
                        E("#step4 .upgrade").show()
                    } else {
                        T = false;
                        if (C == 0) {
                            E("#step4 .anonymous").css("display", "block")
                        } else {
                            if (R) {
                                E("#step4 .upgrade").css("display", "block")
                            } else {
                                if (A.length < 2) {
                                    E("#step4 .no_characters").css("display", "block")
                                } else {
                                    E("#step4 .generate").css("display", "block")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    function F() {
        E("#dialogs .dialog").each(function(Z, a) {
            var Y = E(a);
            var X = parseInt(Y.data("charId"));
            if (!A[X]) {
                X = 0;
                Y.data("charId", 0)
            } else {
                if (A[X].data("invisible")) {
                    X++;
                    Y.data("charId", X);
                    if (!A[X]) {
                        return
                    }
                }
            }
            Y.find(".char_thumb > img").attr("src", A[X].data("thumb")).end().data("cid", A[X].data("cid"));
            if (Y.data("method") == "tts") {
                Y.removeData("aid")
            }
            Y.trigger("updatevoice", [A[X].data("voice")])
        })
    }
    function O() {
        var X = {
            M: ["eric", "paul", "joey", "dave", "steven"],
            F: ["kate", "julie", "kimberly", "allison", "jennifer", "kendra", "susan"]
        };
        for (var Y = 0; Y < A.length; Y++) {
            if (A[Y].data("voice")) {
                continue
            }
            var Z = A[Y].data("gender");
            A[Y].data("voice", X[Z][Y])
        }
    }
    return {
        settings: {
            dialigMaxLength: 180
        },
        auth: firebase.auth(),
                params(stuff) {
            return new URLSearchParams(stuff);
        },
        userLogin(form, callback) {
            const json = Object.fromEntries(this.params(form));
            console.log(json);
            this.auth.signInWithEmailAndPassword(json.email, json.password).then(callback).catch(callback);
        },
        init: function(Z) {
            if (D) {
                return
            }
            D = true;
            C = Z;
            var Y = {
                navCheck: function(d) {
                    if (a.getItems().length == 0) {
                        return true
                    }
                    var c = this;
                    var b = E("#switch-template").clone().find(".alert").click(function(f) {
                        c.nav(d)
                    }).end();
                    showOverlay(b);
                    return false
                }
            };
            var X = jQuery.extend(new ItemSelectorWithHost(E("#templates")), Y);
            U = X.getItem();
            E("#template_name").html(U.attr("title"));
            E("#template_desc").html(U.data("desc"));
            E("#templates").bind("change", function(d, b, c) {
                U = c;
                E("#template_name").html(c.attr("title"));
                E("#template_desc").html(c.data("desc"));
                H();
                a.reset({
                    limit: U.data("charLimit")
                });
                E("#dialogs .dialog").removeData("sorder");
                GoLite.resetDialogs();
                GoLite.noticifyChange()
            });
            L = X.getHost();
            E("#dialogs .dialog:not(.fake)").filter(function() {
                return E(this).data("charId") == 0
            }).data("cid", L.data("cid"));
            A[0] = L;
            F();
            E("#templates").bind("changeHost", function(d, b, c) {
                if (L) {
                    L.data("voice", "")
                }
                L = c;
                A[0] = L;
                a.setHost(L);
                E("#dialogs .dialog:not(.fake)").filter(function() {
                    return E(this).data("charId") == 0
                }).data("cid", L.data("cid"));
                O();
                F();
                T = true;
                GoLite.noticifyChange()
            });
            var a = new DragDropCharacters({
                reset: function() {
                    A = [];
                    A.push(L);
                    this.setHost(L);
                    T = true;
                    GoLite.noticifyChange()
                },
                change: function() {
                    var d = this.getItems();
                    A = [];
                    A.push(L);
                    E("#dialogs, #step3 .footer").show();
                    E(".no_characters").hide();
                    for (var c = 0; c < d.length; c++) {
                        A.push(d[c])
                    }
                    O();
                    var b = E("#dialogs .dialog.fake");
                    b.data("charId", b.prev().data("charId")).trigger("switchCharacter");
                    F();
                    T = true;
                    GoLite.noticifyChange()
                },
                remove: function(f) {
                    var d = this.getItems();
                    var c = [], e = false;
                    A = [];
                    A.push(L);
                    c.push(L.data("cid"));
                    for (var b = 0; b < d.length; b++) {
                        A.push(d[b]);
                        c.push(d[b].data("cid"))
                    }
                    E("#dialogs .dialog:not(.fake)").each(function() {
                        var h = E(this);
                        var g = h.data("charId");
                        var j = h.data("cid");
                        var i = E.inArray(j, c);
                        if (i == -1) {
                            h.trigger("destory");
                            e = true
                        } else {
                            h.data("charId", i)
                        }
                    });
                    if (E("#dialogs .dialog:not(.fake)").length == 0) {
                        GoLite.resetDialogs();
                        GoLite.noticifyChange()
                    } else {
                        if (e) {
                            E(document).trigger("delete.scriptDialog")
                        }
                        F();
                        if (d.length == 0) {
                            E("#dialogs, #step3 .footer").hide();
                            E(".no_characters").show()
                        }
                        T = true;
                        GoLite.noticifyChange()
                    }
                }
            });
            a.confirmRemoveItem = function(b) {
                var d = b.data("item");
                var e = d.data("cid");
                if (!e) {
                    return true
                }
                if (E("#dialogs .dialog:not(.fake)").filter(function() {
                    return e == E(this).data("cid")
                }).length) {
                    var c = E("#remove-character").clone().find(".alert").click(function(f) {
                        a.removeItem(b, true)
                    }).end();
                    showOverlay(c);
                    return false
                }
                return true
            };
            a.setHost(L);
            if (E("#facial_expression").length) {
                J = true
            }
            E(document).ready(function() {
                if (C < 2) {
                    E("#templates .plus-label").before(E(".snippets .plus-cover").clone())
                }
                if (C == 2) {
                    E(".plus-character").html(E(".snippets .plus-char-txt").clone())
                }
                E("#dialogs .dialog_input_message").find(".basic").toggle(C < 2).end().find(".plus").toggle(C == 2);
                E("#dialogs .upsell, #step4 .upsell").toggle(C < 2);
                E(document).bind("delete.scriptDialog insert.scriptDialog", function(d) {
                    var b = S;
                    var c = E("#dialogs .num");
                    c.each(function(e) {
                        E(this).html((e + 1))
                    });
                    K = c.length;
                    H();
                    E("#dialogs .fake").toggle(c.length < b).toggleClass("highlight", (C < 2 && K >= Q));
                    GoLite.noticifyChange()
                });
                E(document).bind("GoLite.stateChange", N)
            })
        },
        getTemplate: function() {
            return U
        },
        getCharacters: function() {
            return A
        },
        getScripts: function() {
            var a = E("#dialogs .dialog:not(.fake)")
                , Z = "talk"
                , X = []
                , b = {}
                , Y = {};
            if (J) {
                E.each(A, function(c) {
                    Y[(c + 1)] = "default"
                })
            }
            a.each(function(f, l) {
                var j = E(l);
                var c = parseInt(j.data("charId"));
                var h = A[c];
                if (!h) {
                    return
                }
                text = E.trim(j.find(".dialog_input").val());
                var k = {
                    type: Z,
                    cid: h.data("cid"),
                    voice: h.data("voice"),
                    text: text,
                    char_num: c + 1
                };
                var d = j.data("aid");
                if (d) {
                    k.aid = d
                } else {
                    k.aid = ""
                }
                var g = j.data("sorder");
                if (g) {
                    k.sorder = g
                } else {
                    k.order = ""
                }
                if (J) {
                    k.facial = {};
                    var e = j.data("facial");
                    if (e) {
                        k.facial[c + 1] = e
                    }
                    k.facial = E.extend({}, Y, k.facial)
                }
                X.push(k)
            });
            return X
        },
        insertDialog: function(X) {
            var X = X || {};
            var Y = {
                charId: 0,
                focus: true,
                focusClass: false
            };
            E.extend(Y, X);
            if (E("#dialogs .dialog:not(.fake)").length >= S) {
                return
            }
            var b = A[Y.charId];
            var a = E("#dialogTmpl").tmpl({
                thumbURL: b.data("thumb"),
                hasFacial: J
            });
            a.data("charId", Y.charId).data("cid", b.data("cid")).scriptDialog();
            a.trigger("updatevoice", b.data("voice"));
            if (Y.facial) {
                a.trigger("updateFacial", [Y.facial, facialExpression.name(Y.facial)])
            } else {
                if (J) {
                    a.trigger("updateFacial", ["default", facialExpression.name("default")]);
                    var c = E("#dialogs .fake").prev();
                    while (c.length) {
                        if (c.data("charId") == a.data("charId")) {
                            var Z = c.data("facial");
                            a.trigger("updateFacial", [Z, facialExpression.name(Z)]);
                            break
                        }
                        c = c.prev()
                    }
                }
            }
            if (Y.after) {
                a.insertAfter(Y.after)
            } else {
                a.insertBefore("#dialogs .fake")
            }
            if (Y.focus) {
                a.find(".dialog_input").focus()
            }
            if (Y.focusClass) {
                a.addClass("focus")
            }
        },
        resetDialogs: function() {
            var X = E("#dialogs .dialog:not(.fake)").trigger("destory.scriptDialog");
            GoLite.insertDialog({
                focus: false,
                focusClass: true
            });
            E(document).trigger("delete.scriptDialog");
            E("#dialogs, #step3 .footer").hide();
            E(".no_characters").show()
        },
        preview: function() {
            if (P || C == 0 || R || A.length < 2 || /^(preview|save)$/.test(W)) {
                return
            }
            var X = G();
            E(document).trigger("GoLite.stateChange", ["loading"]);
            E.ajaxSetup({
                error: function(Y, a, Z) {
                    P = false;
                    E(document).trigger("GoLite.stateChange", [""]);
                }
            });
            P = true;
            E.post("/api/setupText2VideoPreview", X, function(Y) {
                P = false;
                if (Y.error) {
                    showNotice(Y.error, true);
                    E(document).trigger("GoLite.stateChange", [""]);
                    return
                }
                B = Y.enc_mid;
                if (golite_theme != "politics") {
                    V = Y.opening_closing
                }
                var Z = E("#dialogs .dialog:not(.fake)");
                E.each(Y.script, function(c, a) {
                    var b = Z.eq(c);
                    b.data("aid", a.aid).data("sorder", a.sorder)
                });
                I("player_container", Y.player_object);
                E(document).trigger("GoLite.stateChange", ["preview"])
            }, "json");
            E.ajaxSetup({
                error: null
            })
        },
        save: function(c) {
            if (P) {
                return
            }
            var c = c || {};
            var f = {};
            E.extend(f, c);
            var e = E("#movie_title");
            var b = E.trim(e.val());
            if (b == e.attr("placeholder")) {
                b = ""
            }
            if (b.length == 0) {
                E("#movie_title").focus();
                showNotice(GT.gettext("Please enter a movie title"), true);
                return
            }
            var d = E("#movie_description");
            var a = E.trim(d.val());
            if (a == d.attr("placeholder")) {
                a = ""
            }
            var X = null;
            try {
                X = document.getElementById("thumbnailChooser").getThumbnail();
                if (X.length) {
                    X = X[0]
                }
            } catch (Z) {}
            var Y = {
                enc_mid: B,
                noEdit: true,
                title: b,
                desc: a
            };
            if (X) {
                Y.thumbnail = X
            }
            if (f.youtubePublish) {
                Y.youtube_publish = f.youtubePublish
            }
            if (f.publish_quality) {
                Y.publish_quality = f.publish_quality
            }
            if (f.youtubeExportOverlay) {
                Y.youtubeExportOverlay = f.youtubeExportOverlay
            }
            E.ajaxSetup({
                error: function(g, i, h) {
                    P = false;
                    E(document).trigger("GoLite.stateChange", [""]);
                }
            });
            P = true;
            showOverlay(E("#publishing"));
            E.post("/api/saveText2Video", Y, function(g) {
                P = false;
                if (g.error) {
                    E.unblockUI();
                    showNotice(g.error, true);
                    return
                }
                window.location = g.url
            }, "json");
            E.ajaxSetup({
                error: null
            })
        },
        noticifyChange: function() {
            if (T) {
                E(document).trigger("GoLite.stateChange", [""])
            }
        },
        getUserState: function() {
            return C
        },
        getUser(callback) {
            function returnCallback(K) {
                if (callback && typeof callback == "function") return callback(K);
                return K
            }
            this.auth.onAuthStateChanged(user => {
                if (user) returnCallback(user);
                else jQuery.post("/api/getSession", d => {
                    if (d.data.current_uid) returnCallback(d.data);
                })
            })
        },
        updateUserState: function(X) {
            this.getUser(function(Y) {
                if (Y) {
                    if (Y.emailVerified) {
                        C = 2;
                        E("#templates .plus-cover").remove();
                        E(".plus-character").html(E(".snippets .plus-char-txt").clone())
                    }
                    this.userData = Y;
                }
                E("#dialogs .dialog_input_message").find(".basic").toggle(C < 2).end().find(".plus").toggle(C == 2);
                E("#dialogs .upsell, #step4 .upsell").toggle(C < 2);
                H();
                if (X && typeof X == "function") {
                    X(C)
                }
            })
        },
        showSelectVoiceOverlay: function(Y) {
            var X = GoLite.getCharacters();
            var Z = new SelectVoiceDialog(jQuery(".snippets .selectvoiceoverlay").clone(),Y,(C >= 2));
            Z.setDefaultVoice(X[Y].data("voice"));
            Z.show()
        },
        getWatermarks: function() {
            B && getWatermarks(B)
        }
    }
})(jQuery);
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
var psWin = null, psHook = "";
function popUpgrade(B) {
    if (psWin && !psWin.closed) {
        psWin.focus()
    } else {
        var A = "https://web.archive.org/web/20120118212735/https://goanimate.com/plussignup/?ui=popup";
        if (view_name == "youtube") {
            A = "https://web.archive.org/web/20120118212735/http://goanimate.com/plusfeatures/?ui=popup&app=youtube"
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
            jQuery("#voiceselectonly_plusupgrade", F).click(popUpgrade);
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
        updateByVoiceId: function(d) {
            var f;
            const lang_model = VoiceCatalog.getModel();
            for (const langId in lang_model) {
                const i = lang_model[langId]['options'].find(i => i.id == d);
                if (i) f = {
                    gender: i.sex,
                    locale: { 
                        id: langId, 
                        lang: i.lang, 
                        country: i.country, 
                        desc: lang_model[langId].desc 
                    }
                };
            }
            const interval = setInterval(() => {
                if (f) {
                    if ((A && A.gender) != f.gender || (A && A.locale) != f.locale) {
                        A = f;
                        B.find(".gender").removeClass().addClass("gender " + f.gender);
                        B.find(".lang").removeClass().addClass("lang " + (f.locale.country || ("lg_" + f.locale.lang)))
                    }
                    clearInterval(interval);
                }
            }, 1000)
        }
    };
    return C
};
(function(A) {
    class B {
        constructor(C) {
            this.options = A.extend({
                limit: 4,
                reset: null,
                change: null,
                remove: null
            }, B.defaults, C);
            this.init();
        }
        init() {
            this.count = 0;
            this.accept = A(".character_list a").not(".dummy");
            var C = this;
            this.accept.draggable({
                containment: "#step2",
                opacity: 0.6,
                helper: "clone",
                zIndex: 100
            }).click(function (D) {
                D.preventDefault();
                C.addItem(A(this));
            });
            this.$selected_characters = A("#selected_characters");
            this.$selected_characters.droppable({
                accept: ".character_list > a:not(.on)",
                greedy: true,
                activeClass: "highlight",
                hoverClass: "drophover",
                drop: function (E, D) {
                    C.addItem(D.draggable);
                }
            });
            this.host = null;
            A("#character_selector .list_title").click(function (D) {
                D.preventDefault();
                var E = A(this).parent();
                if (E.hasClass("selected")) {
                    return;
                }
                E.addClass("selected").siblings().removeClass("selected");
            });
        }
        reset(C) {
            this.count = 0;
            this.host = null;
            A.extend(this.options, C);
            A("#character_nums").html(this.count + "/" + this.options.limit);
            this.accept.removeClass("on").draggable("enable");
            this.$selected_characters.empty().append(A(".snippets .dummy").clone());
            for (var D = 0; D < this.options.limit - 1; D++) {
                this.$selected_characters.append('<div class="placeholder"></div>');
            }
            if (typeof this.options.reset == "function") {
                this.options.reset.apply(this);
            }
        }
        disableItem(C) {
            C.addClass("on");
            C.draggable("disable");
        }
        enableItem(C) {
            C.removeClass("on");
            C.draggable("enable");
        }
        getItemByCid(D) {
            var C = this.accept.filter(function () {
                return A(this).data("cid") == D;
            });
            if (C.length) {
                return C.eq(0);
            } else {
                return null;
            }
        }
        setHost(D) {
            if (this.host) {
                if (this.host.data("cid") == D.data("cid")) {
                    return;
                }
                this.enableItem(this.host);
            }
            if (D.data("invisible")) {
                return;
            }
            var C = this.getItemByCid(D.data("cid"));
            if (C) {
                this.disableItem(C);
            }
            this.host = C;
        }
        addItem(D) {
            if (!D.data("cid") || this.count >= this.options.limit || D.hasClass("on")) {
                return;
            }
            var E = this;
            D.addClass("on");
            D.draggable("disable");
            var F = A(".snippets .character").clone().prepend(A("<img />", {
                src: D.data("avatar")
            }));
            F.droppable({
                accept: ".character_list > a:not(.on)",
                greedy: true,
                hoverClass: "drophover",
                drop: function (H, G) {
                    E.replaceItem(A(this), G.draggable);
                }
            });
            F.find(".remove").click(function (G) {
                G.preventDefault();
                E.removeItem(F);
            });
            F.insertBefore(this.$selected_characters.find(".dummy")).fadeIn();
            F.data("item", D);
            var C = this.$selected_characters.find(".placeholder:last");
            if (C.length) {
                C.remove();
            } else {
                this.$selected_characters.find(".dummy").hide();
            }
            A("#character_nums").html(++this.count + "/" + this.options.limit);
            if (typeof this.options.change == "function") {
                this.options.change.apply(this);
            }
        }
        replaceItem(C, E) {
            E.addClass("on");
            E.draggable("disable");
            var D = C.data("item");
            D.removeClass("on");
            D.data("voice", "");
            D.draggable("enable");
            C.data("item", E).find("img").attr("src", E.data("avatar"));
            if (typeof this.options.change == "function") {
                this.options.change.apply(this);
            }
        }
        removeItem(C, E) {
            if (typeof E == "undefined") {
                E = false;
            }
            var D = C.data("item");
            var F = D.data("cid");
            if (!E && !this.confirmRemoveItem(C)) {
                return;
            }
            D.removeClass("on");
            D.data("voice", "");
            D.draggable("enable");
            C.removeData("item");
            C.remove();
            A("#character_nums").html(--this.count + "/" + this.options.limit);
            if (this.count >= this.options.limit - 1) {
                this.$selected_characters.find(".dummy").show();
            } else {
                this.$selected_characters.append('<div class="placeholder"></div>');
            }
            if (typeof this.options.remove == "function") {
                this.options.remove.apply(this, [F]);
            }
        }
        confirmRemoveItem(C) {
            return true;
        }
        getItems() {
            var C = [];
            this.$selected_characters.find(".character").each(function () {
                C.push(A(this).data("item"));
            });
            return C;
        }
    }
    B.defaults = {};
    window.DragDropCharacters = B
})(jQuery);
(function() {
    var A = [];
    window.preLoadImages = function() {
        var D = arguments.length;
        for (var C = D; C--; ) {
            var B = document.createElement("img");
            B.src = arguments[C];
            A.push(B)
        }
    }
})();
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
        };
        D.fadeOnFocus = function() {
            if (D.showing) {
                D.setOpacity(D.options.fadeOpacity)
            }
        };
        D.setOpacity = function(F) {
            D.$label.stop().animate({
                opacity: F
            }, D.options.fadeDuration);
            D.showing = (F > 0)
        };
        D.checkForEmpty = function(F) {
            if (D.$field.val() == "") {
                D.prepForShow();
                D.setOpacity(F ? 1 : D.options.fadeOpacity)
            } else {
                D.setOpacity(0)
            }
        };
        D.prepForShow = function(F) {
            if (!D.showing) {
                D.$label.css({
                    opacity: 0
                }).show();
                D.$field.bind("keydown.infieldlabel", function(G) {
                    D.hideOnChange(G)
                })
            }
        };
        D.hideOnChange = function(F) {
            if ((F.keyCode == 16) || (F.keyCode == 9)) {
                return
            }
            if (D.showing) {
                D.$label.hide();
                D.showing = false
            }
            D.$field.unbind("keydown.infieldlabel")
        };
        D.init()
    };
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
})(jQuery);