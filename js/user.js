/**
 * Account System For BetterWrapper.
 * Firebase is required in order to run this file.
 * This JS file uses firebase. you may learn more at https://firebase.google.com/
 */
const params = new URLSearchParams(window.location.search);
const auth = firebase.auth();
let signupComplete = false;
let loginComplete = false;
let displayName = null;
let userData = '';
auth.onAuthStateChanged(user => {
    if (user) {
        if (displayName != null) auth.currentUser.updateProfile({displayName}).catch(e => {
            console.log(e);
            alert(e.message);
        });
        if (!user.emailVerified) {
            jQuery.post(`/api/fetchAPIKeys`, (d) => {
                console.log(d);
                const json = JSON.parse(d);
                addVal2Element('freeconvert-key', json.freeConvertKey);
                addVal2Element('topmediaai-key', json.topMediaAIKey);
            });
            jQuery("#signup-processing").modal('hide');
            showElement('email-verification-signup');
            hideElement('login-container');
            showElement('logout-link');
            showElement('email-verification-login');
            if (signupComplete || loginComplete) {
                signupComplete = false;
                loginComplete = false;
                auth.currentUser.sendEmailVerification().catch(e => {
                    console.log(e);
                    alert(e.message);
                });
            }
            switch (window.location.pathname) {
                case "/dashboard":
                case "/videos":
                case "/forgotpassword":
                case "/create":
                case "/cc_browser": 
                case "/cc": 
                case "/account":
                case "/go_full": 
                case "/movies": {
                    window.location.href = '/';
                    break;
                } case "/quickvideo": {
                    jQuery("#login_bar").not("[login]").show();
                    break;
                }
                case "/public_signup":
                case "/login": {
                    switch (window.location.pathname) {
                        case "/public_signup": {
                            $("#signup-container").hide();
                            $("#signup-processing").hide();
                            break;
                        } case "/login": {
                            $("#login-container").hide();
                            break;
                        }
                    }
                    $("#email-verification-container").show();
                    break;
                }
            }
        } else loggedIn(user);
    } else logout('auto');
});
function logout(t) {
    jQuery.post("/api/getSession", d => {
        const json = JSON.parse(d);
        if (json.data && json.data.loggedIn && json.data.current_uid) {
            if (t != 'auto') jQuery.post('/api/removeSession', {
                current_uid: json.data.current_uid,
                type: 'current_uid'
            }, d => {
                if (JSON.parse(d).success) {
                    jQuery.post(`/api/fetchAPIKeys`, (d) => {
                        const json = JSON.parse(d);
                        addVal2Element('freeconvert-key', json.freeConvertKey);
                        addVal2Element('topmediaai-key', json.topMediaAIKey);
                    });
                    hideElement('isLogin');
                    showElement('signup-button');
                    showElement('login-button');
                    switch (window.location.pathname) {
                        case "/dashboard":
                        case "/videos":
                        case "/account":
                        case "/cc_browser": 
                        case "/create":
                        case "/cc": 
                        case "/go_full": 
                        case "/movies": {
                            window.location.href = '/';
                            break;
                        } case "/quickvideo": {
                            jQuery("#login_bar").not("[email-verification]").show();
                            break;
                        }
                    }
                }
            });
            else jQuery.post('/api/getUserInfoFromSession', loggedIn);
        } else {
            jQuery.post(`/api/fetchAPIKeys`, (d) => {
                const json = JSON.parse(d);
                addVal2Element('freeconvert-key', json.freeConvertKey);
                addVal2Element('topmediaai-key', json.topMediaAIKey);
            });
            hideElement('isLogin');
            showElement('signup-button');
            showElement('login-button');
            switch (window.location.pathname) {
                case "/dashboard":
                case "/videos":
                case "/account":
                case "/cc_browser": 
                case "/create":
                case "/cc": 
                case "/go_full": 
                case "/movies": {
                    window.location.href = '/';
                    break;
                } case "/quickvideo": {
                    jQuery("#login_bar").not("[email-verification]").show();
                    break;
                }
            }
        }
    });
}
function loggedIn(user) {
    jQuery.post(`/api/getUserSWFFiles?userId=${user.uid || user.id}`, files => {
        for (const file of files) {
            $("#FlashGamePlayer_swfFilesDropdown").show();
            $("#FlashGamePlayer_swfFilesAll").append(`<li><a href="javascript:FlashGameSetup('${file.url}');">${file.id}</a></li>`);
        }
    })
    userData = user;
    jQuery.post("/api/check4SavedUserInfo", {
        displayName: user.displayName || user.name,
        email: user.email,
        uid: user.uid || user.id
    }, () => {
        jQuery.post(`/api/fetchAPIKeys?uid=${user.uid || user.id}`, (d) => {
            console.log(d);
            const json = JSON.parse(d);
            addVal2Element('freeconvert-key', json.freeConvertKey);
            addVal2Element('topmediaai-key', json.topMediaAIKey);
        });
    });
    hideElement('signup-button');
    hideElement('login-button');
    showElement('isLogin');
    showElement('exploreTab');
    showElement('iconsLol');
    switch (window.location.pathname) {
        case "/account": {
            loadSettings(user);
            break;
        }
        case "/dashboard": {
            jQuery.getJSON(`/movieList?uid=${user.uid || user.id}`, (meta) => {
                json = meta;
                $("#loadMore").text('load more');
                $("#loadFTUserFeeds").text('load more');
                $("#loadFTUserFeeds_all").text('load all of the flashthemes user feed');
                loadLatestVideos();
                loadFTUserFeeds();
            })
            break;
        } case "/movies": {
            jQuery.getJSON(`/movieList?uid=${user.uid || user.id}`, (meta) => {
                document.getElementsByClassName("count-all")[0].innerHTML = meta.length;
                if (meta.length < 1) {
                    jQuery("#myvideos").hide();
                    jQuery("#novideos").show();
                    jQuery("#allvideos").hide();
                } else for (const tbl of meta) {
                    videoCounts.all++
                    const date = tbl.date.split("T")[0];
                    const usDate = `${date.split("-")[1]}/${date.split("-")[2]}/${date.split("-")[0]}`;
                    jQuery("#allvideos").append(`<tr><td><img src="/movie_thumbs/${tbl.id}.png"></td><td><div>${tbl.title}</div><div>${
                        tbl.desc
                    }</div><div>${
                        tbl.durationString
                    }</div></td><td>${usDate}</td><td><a href="javascript:movieRedirect('/player?movieId=${tbl.id}', '${
                        tbl.id
                    }')"></a><a href="javascript:movieRedirect('/go_full?movieId=${tbl.id}', '${tbl.id}')"></a><a href="javascript:movieRedirect('/movies/${
                        tbl.id
                    }.zip', '${tbl.id}')"></a><a onclick="deleteMovie('${
                        tbl.id
                    }')"></a></td></tr>`);
                }
            })
            break;
        } case "/quickvideo": {
            GoLite.showSelectCCOverlay = function(y) {
                jQuery.post("/api/getAIVoices", {
                    uid: user.uid || user.id
                }, d => {
                    var w = GoLite.getCharacters();
                    var z = new SelectCCDialog(jQuery(".snippets .selectccoverlay").clone(), y, GoLite.getFunc('(c >= 2)'), d);
                    z.setDefaultCharacterById(w[y].data("cid"));
                    z.setDefaultVoice(w[y].data("voice"));
                    z.show()
                });
            };
            GoLite.showSelectVoiceOverlay = function(y) {
                jQuery.post("/api/getAIVoices", {
                    uid: user.uid || user.id
                }, d => {
                    var w = GoLite.getCharacters();
                    var z = new SelectVoiceDialog(jQuery(".snippets .selectvoiceoverlay").clone(), y, GoLite.getFunc('(c >= 2)'), d);
                    z.setDefaultVoice(w[y].data("voice"));
                    z.show()
                });
            };
            VoiceCatalog = {
                lookupVoiceInfo(voice_id) {
                    jQuery.post("/api/getAIVoices", {
                        uid: user.uid || user.id
                    }, lang_model => {
                        console.log(lang_model);
                        for (var langId in lang_model) {
                            const voiceInfo = lang_model[langId].options.find(i => i.id == voice_id);
                            if (voiceInfo) {
                                return {
                                    desc: voiceInfo.desc,
                                    sex: voiceInfo.sex,
                                    plus: voiceInfo.plus,
                                    locale: { 
                                        id: langId, 
                                        lang: voiceInfo.lang, 
                                        country: voiceInfo.country, 
                                        desc: lang_model[langId].desc 
                                    }
                                };
                            }
                        }
                        return null;
                    });
                },
                getDefaultVoice() {
                    jQuery.post("/api/getAIVoices", {
                        uid: user.uid || user.id
                    }, lang_model => {
                        console.log(lang_model);
                        for (var langId in lang_model) {
                            for (var i = 0; i < lang_model[langId].options.length; i++) {
                                if (typeof lang_model[langId].options[i].id === 'string') return lang_model[langId].options[i].id;
                            }
                        }
                        return null;
                    });
                }
            };
            break;
        } case "/go_full": {
            $(document).ready(function() {
                if (enable_full_screen) {
        
                    if (!true) {
                        $('#studio_container').css('top', '0px');
                    }
                    $('#studio_container').show();
                    $('.site-footer').hide();
                    $('#studioBlock').css('height', '1800px');
        
                    if (false) {
                        checkCopyMovie(`javascript:proceedWithFullscreenStudio('${JSON.stringify(user)}', 'isJson')`, '');
                    } else if (false) {
                        checkEditMovie('');
                    } else {
                        proceedWithFullscreenStudio(user);
                    }
        
                    $(window).on('resize', function() {
                        ajust_studio();
                    });
                    $(window).on('studio_resized', function() {
                        if (show_cc_ad) {
                            _ccad.refreshThumbs();
                        }
                    });
        
                    if (studioApiReady) {
                        var api = studioApi($('#studio_holder'));
                        api.bindStudioEvents();
                    }
                    $('.ga-importer').prependTo($('#studio_container'));
                } else setTimeout(() => {
                    $('#studioBlock').flash(studio_data);
                }, 1);
                // Video Tutorial
                videoTutorial = new VideoTutorial($("#video-tutorial"));
            })
            // restore studio when upsell overlay hidden
            .on('hidden', '#upsell-modal', function(e) {
                if ($(e.target).attr('id') == 'upsell-modal') {
                    restoreStudio();
                }
            })
            .on('studioApiReady', function() {
                var api = studioApi($('#studio_holder'));
                api.bindStudioEvents();
            })
            break;
        } case "/player": {
            break;
        } case "/user": {
            loadUserContent(user);
            break;
        }
        case "/forgotpassword":
        case "/login":
        case "/public_signup": {
            location.href = '/dashboard';
            break;
        }
        case "/cc_browser": 
        case "/cc":  {
            loadCC(user);
            break;
        }
    }
}
function userSignup(email, password, name) {
    signupComplete = true;
    displayName = name;
    auth.createUserWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        $("#signup-processing").hide();
        $("#error-message").text(e.message);
    });
}
function userLogin(email, password) {
    loginComplete = true;
    auth.signInWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        processing = false;
        formErrorMessage(e.message);
        $('#btn-login').text(buttonText);
    });
}
function userLogout() {
    jQuery.post("/api/getSession", d => {
        const json = JSON.parse(d);
        if (json.data && json.data.loggedIn && json.data.current_uid) logout();
        else {
            auth.signOut().then(logout).catch(e => {
                console.log(e);
                alert(e.message);
            });
        }
    });
}
function hideElement(id) {
    if (document.getElementById(id)) document.getElementById(id).style.display='none';
}
function showElement(id) {
    if (document.getElementById(id)) document.getElementById(id).style.display='block';
}
function addText2Element(id, text) {
    if (document.getElementById(id)) document.getElementById(id).innerHTML = text;
}
function addVal2Element(id, text) {
    if (document.getElementById(id)) document.getElementById(id).value = text;
}
function addLink2Element(id, url) {
    if (document.getElementById(id)) document.getElementById(id).href = url;
}
function createImgElement(id, url, text) {
    if (document.getElementById(id)) {
        document.getElementById(id).src = url;
        document.getElementById(id).alt = text;
    }
}
function loadUserContent(userData) {
    if (window.location.pathname == "/user") {
        $.post("/api/getAllUsers", (d) => {
            const json = JSON.parse(d);
            const meta = json.find(i => i.id == params.get("id"));
            if (meta) {
                addText2Element('user-name', meta.name);
                addText2Element('user-link', meta.name);
                addLink2Element('user-link', `/user?id=${params.get("id")}`)
                document.title = `${meta.name} On BetterWrapper`;
                $.getJSON(`/movieList?uid=${params.get("id")}`, (d) => {
                    let json;
                    if (userData && params.get("id") == userData.uid) json = d;
                    else json = d.filter(i => i.published == "1");
                    if (!params.get("filename") || params.get("filename") != "user-videos") {
                        let htmls = "";
                        for (let i = 0; i < 7; i++) {
                            if (json[i]) htmls += `<div class="col-sm-6 col-md-4"><div class="profile-video"><div class="video-container">
                            <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${json[i].id}">
                                <div class="vthumb vthumb-300">
                                    <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${json[i].id}.png" alt="${json[i].title}"/></div></div>
                                </div>
                            </a>
                            <div class="video-desc">
                                <a class="title" href="${window.location.origin}/player?movieId=${json[i].id}" title="${json[i].title}">${json[i].title}</a>
                                <span class="duration">${json[i].durationString}</span>
                                </span>
                            </div></div></div></div>`;
                            else if (i == 7) {
                                addLink2Element('more', `${window.location.origin}/user?id=${params.get("id")}&filename=user-videos`);
                                $("#more").show();
                            }
                        }
                        $("#profileVideos").html(htmls);
                        if (json.length == 0) addText2Element('profileVideos', '<center>No Videos</center>');
                    } else {
                        var C = 0;
                        function loadRows() {
                            let c = C; 
                            C += 12;
                            for (; c < C; c++) {
                                if (c > json.length - 1) {
                                    $("#load_more").hide();
                                    break;
                                }
                                $("#userVideos").append(`<div class="col-sm-6 col-md-4"><div class="profile-video"><div class="video-container">
                                <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${json[c].id}">
                                    <div class="vthumb vthumb-300">
                                        <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${json[c].id}.png" alt="${json[c].title}"/></div></div>
                                    </div>
                                </a>
                                <div class="video-desc">
                                    <a class="title" href="${window.location.origin}/player?movieId=${json[c].id}" title="${json[c].title}">${json[c].title}</a>
                                    <span class="duration">${json[c].durationString}</span>
                                    </span>
                                </div></div></div></div>`);
                            }
                        }
                        $("#load_more").click(() => loadRows());
                        loadRows();
                        addText2Element('video-count', json.length);
                    }
                });
            }
        });
    }
}
function downloadMyStuff() {
    try {
        $("#stuff-downloading-overlay").modal({
            keyboard: false, 
            backdrop: "static"
        });
        $.post('/api/fetchMyStuff', {
            displayName: userData.displayName,
            uid: userData.uid,
            email: userData.email
        }, (d) => {
            const json = JSON.parse(d);
            if (json.success) {
                $("#stuff-downloading-overlay").modal('hide');
                window.location.href = json.fileUrl;
            } else displayFeedback(1 + json.error);
        });
    } catch (e) {
        console.log(e);
        displayFeedback(1 + e);
    }
}
function uploadMyStuff() {
    try {
        $("#stuff-uploading-overlay").modal({
            keyboard: false, 
            backdrop: "static"
        });
        var b = new FormData();
        b.append("import", document.getElementById('stuff-upload').files[0]);
        b.append("userId", userData.uid);
        $.ajax({
            url: "/api/uploadMyStuff",
            method: "POST",
            data: b,
            processData: false,
            contentType: false,
            dataType: "json"
        }).done((d) => {
            $("#stuff-uploading-overlay").modal('hide');
            if (d.success) {
                displayFeedback(0 + d.msg);
                switch (window.location.pathname) {
                    case "/movies": {
                        refreshMovieList();
                        break;
                    }
                }
            } else displayFeedback(1 + d.error);
        });
    } catch (e) {
        console.log(e);
        displayFeedback(1 + e);
    }
}