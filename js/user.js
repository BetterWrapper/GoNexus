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
auth.onAuthStateChanged(user => {
    if (user) {
        $.post("/api/check4SavedUserInfo", {
            displayName: user.displayName,
            email: user.email,
            uid: user.uid
        });
        if (displayName != null) auth.currentUser.updateProfile({displayName}).catch(e => {
            console.log(e);
            alert(e.message);
        });
        if (!user.emailVerified) {
            hideElement('signup-container');
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
                case "/yourvideos": {
                    window.location.href = '/';
                    break;
                } case "/": {
                    if (params.get("action")) showElement(`${params.get("action")}-modal`);
                    addText2Element('psw', '<a href="javascript:userLogout()">Logout</a>');
                }
            }
        } else {
            hideElement('signup-modal');
            hideElement('login-modal');
            hideElement('signup-button');
            hideElement('login-button');
            hideElement('psw-reset-modal');
            hideElement('is-guest');
            showElement('is-login');
            showElement('make-a-video-is-login');
            createImgElement('profile-image', user.photoURL, user.displayName);
            addText2Element('user-name', user.displayName)
            switch (window.location.pathname) {
                case "/yourvideos": {
                    $.getJSON(`/movieList?uid=${user.uid}`, (d) => loadRows(d));
                    break;
                } case "/go_full": {
                    $(document).ready(function() {
                        if (enable_full_screen) {
                            if (!false) {
                                $('#studio_container').css('top', '0px');
                            }
                            $('#studio_container').show();
                            $('.site-footer').hide();
                            $('#studioBlock').css('height', '1800px');
            
                            if (false) {
                                checkCopyMovie('javascript:proceedWithFullscreenStudio(\'' + JSON.stringify(user) + '\', \'isJson\')', '');
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
                                studioModule = new StudioModule();
                            }
            
                            $('.ga-importer').prependTo($('#studio_container'));
                        } else {
                            setTimeout(() => ('#studioBlock').flash(studio_data), 1);
                        }
            
                        // Video Tutorial
                        videoTutorial = new VideoTutorial($("#video-tutorial"));
                    })
                    // restore studio when upsell overlay hidden
                    .on('hidden.bs.modal', '#upsell-modal', function(e) {
                        if ($(e.target).attr('id') == 'upsell-modal') {
                            restoreStudio();
                        }
                    })
                    .on('studioApiReady', function() {
                        var api = studioApi($('#studio_holder'));
                        api.bindStudioEvents();
                        studioModule = new StudioModule();
                    })
                    break;
                } case "/player": {
                    flashPlayerVars.userId = user.uid;
                    flashPlayerVars.username = user.displayName;
                    flashPlayerVars.uemail = user.email;
                }
            }
        }
    } else {
        hideElement('logout-link');
        hideElement('make-a-video-is-login');
        hideElement('is-login');
        showElement('signup-button');
        showElement('login-button');
        showElement('is-guest');
        showElement('signup-container');
        hideElement('email-verification-signup');
        showElement('login-container');
        hideElement('email-verification-login');
        addText2Element('psw', 'Forgot <a href="javascript:;" onclick="showElement(\'psw-reset-modal\')">password?</a>');
        switch (window.location.pathname) {
            case "/yourvideos": {
                window.location.href = '/';
                break;
            } case "/": {
                if (params.get("action")) showElement(`${params.get("action")}-modal`);
            }
        }
    }
});
function userSignup(email, password, name) {
    signupComplete = true;
    displayName = name;
    auth.createUserWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        addText2Element('error-message-signup', e.message);
    });
}
function userLogin(email, password) {
    loginComplete = true;
    auth.signInWithEmailAndPassword(email, password).catch(e => {
        console.log(e);
        addText2Element('error-message-login', e.message);
    });
}
function userLogout() {
    auth.signOut().catch(e => {
        console.log(e);
        alert(e.message);
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
function addLink2Element(id, url) {
    if (document.getElementById(id)) document.getElementById(id).href = url;
}
function createImgElement(id, url, text) {
    if (document.getElementById(id)) {
        document.getElementById(id).src = url;
        document.getElementById(id).alt = text;
    }
}
switch (window.location.pathname) {
    case "/user": {
        $.post("/api/getAllUsers", (d) => setTimeout(() => {
            const json = JSON.parse(d);
            const meta = json.find(i => i.id == params.get("id"));
            if (meta) {
                addText2Element('user-name', meta.name);
                addText2Element('user-link', meta.name);
                addLink2Element('user-link', `/user?id=${params.get("id")}`)
                document.title = `${meta.name} On BetterWrapper`;
            }
        }, 1));
        $.getJSON(`/movieList?uid=${params.get("id")}`, (d) => {
            if (params.get("filename") != "user-videos") setTimeout(() => {
                let hasContent = true;
                var I = 0;
                let i = I; 
                I += 6;
                for (; i < I; i++) {
                    if (d[i]) $("#profileVideos").append(`<div class="col-sm-6 col-md-4">
                    <div class="profile-video">
                        <div class="video-container">
                            <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${d[i].id}">
                                <div class="vthumb vthumb-300">
                                    <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${d[i].id}.png" alt="${d[i].title}"/></div></div>
                                </div>
                            </a>
                            <div class="video-desc">
                                <a class="title" href="${window.location.origin}/player?movieId=${d[i].id}" title="${d[i].title}">${d[i].title}</a>
                                <span class="duration">${d[i].durationString}</span>
                                </span>
                            </div>
                        </div>
                    </div></div>`);
                    else hasContent = false;
                }
                if (i == 6) {
                    addLink2Element('more', `${window.location.origin}/user?id=${params.get("id")}&filename=user-videos`);
                    $("#more").show();
                }
                if (!hasContent) addText2Element('profileVideos', '<center>No videos</center>');
            }, 1);
            else setTimeout(() => {
                var C = 0;
                function loadRows() {
                    let c = C; 
                    C += 12;
                    for (; c < C; c++) {
                        if (c > d.length - 1) {
                            $("#load_more").hide();
                            break;
                        }
                        $("#userVideos").append(`<div class="col-sm-6 col-md-4">
                        <div class="profile-video">
                            <div class="video-container">
                                <a class="video-thumbnail" href="${window.location.origin}/player?movieId=${d[c].id}">
                                    <div class="vthumb vthumb-300">
                                        <div class="vthumb-clip"><div class="vthumb-clip-inner"><span class="valign"></span><img src="/movie_thumbs/${d[c].id}.png" alt="${d[c].title}"/></div></div>
                                    </div>
                                </a>
                                <div class="video-desc">
                                    <a class="title" href="${window.location.origin}/player?movieId=${d[c].id}" title="${d[c].title}">${d[c].title}</a>
                                    <span class="duration">${d[c].durationString}</span>
                                    </span>
                                </div>
                            </div>
                        </div></div>`);
                    }
                }
                $("#load_more").click(() => loadRows());
                loadRows();
                addText2Element('video-count', d.length);
            }, 1);
        });
        break;
    }
}
