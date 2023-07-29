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
                case "/movies": {
                    window.location.href = '/';
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
        } else {
            hideElement('signup-button');
            hideElement('login-button');
            showElement('isLogin');
            switch (window.location.pathname) {
                case "/":
                case "/movies": {
                    sendUserData(user);
                    jQuery.get(`/movieList?uid=${user.uid}`, (meta) => {
                        document.getElementsByClassName("count-all")[0].innerHTML = meta.length;
                        if (meta == []) {
                            jQuery("#myvideos").hide();
                            jQuery("#novideos").show();
                            jQuery("#allvideos").hide();
                        } else for (const tbl of meta) {
                            const date = tbl.date.split("T")[0];
                            const usDate = `${date.split("-")[1]}/${date.split("-")[2]}/${date.split("-")[0]}`;
                            jQuery("#allvideos").append(`<tr><td><img src="/movie_thumbs/${tbl.id}.png"></td><td><div>${tbl.title}</div><div>${
                                tbl.durationString
                            }</div></div></td><td>${usDate}</td><td><a href="/player?movieId=${tbl.id}"></a><a href="/go_full?movieId=${
                                tbl.id
                            }"></a><a href="/movies/${
                                tbl.id
                            }.zip"></a><a onclick="deleteMovie('${
                                tbl.id
                            }')"></a></td></tr>`);
                        }
                    })
                    break;
                } case "/go_full": {
                    break;
                } case "/player": {
                    break;
                } case "/user": {
                    loadUserContent(user);
                    break;
                }
                case "/login":
                case "/public_signup": {
                    location.href = '/movies';
                    break;
                }
            }
        }
    } else {
        hideElement('isLogin');
        showElement('signup-button');
        showElement('login-button');
        switch (window.location.pathname) {
            case "/movies": {
                window.location.href = '/';
                break;
            }
        }
    }
});
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