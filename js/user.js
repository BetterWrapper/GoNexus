/**
 * Account System For BetterWrapper.
 * Firebase is required in order to run this file.
 * This JS file uses firebase. you may learn more at https://firebase.google.com/
 */
const auth = firebase.auth();
let signupComplete = false;
let loginComplete = false;
auth.onAuthStateChanged(user => {
    if (user) {
        if (!user.emailVerified) {
            hideElement('signup-container');
            showElement('email-verification-signup');
            hideElement('login-container');
            showElement('email-verification-login');
            hideElement('psw');
            if (signupComplete || loginComplete) {
                signupComplete = false;
                loginComplete = false;
                auth.currentUser.sendEmailVerification().catch(e => {
                    console.log(e);
                    alert(e.message);
                });
            }
        } else {
            hideElement('signup-modal');
            hideElement('login-modal');
            hideElement('psw-reset-modal');
            hideElement('is-guest');
            showElement('is-login');
            switch (window.location.pathname) {
                case "/html/list.html": {
                    $.getJSON(`/movieList?uid=${user.uid}`, (d) => loadRows(d));
                    break;
                }
            }
        }
    } else switch (window.location.pathname) {
        case "/": {
            hideElement('is-login');
            showElement('is-guest');
            break;
        } default: {
            window.location.href = '/';
            break;
        }
    }
});
function userSignup(email, password) {
    signupComplete = true;
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
