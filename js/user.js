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
function createImgElement(id, url, text) {
    if (document.getElementById(id)) {
        document.getElementById(id).src = url;
        document.getElementById(id).alt = text;
    }
}
