/**
 * Account System For BetterWrapper
 * Firebase is required in order to run this file.
 * This JS file uses firebase. you may learn more at https://firebase.google.com/
 */
const auth = firebase.auth();
auth.onAuthStateChanged(user => {
  // action it does when the user is logged in.
});
function userSignup(email, password) {
  auth.createUserWithEmailAndPassword(email, password).then(() => {
    // action it does when the user is signed up.
  }).catch(e => {
    console.log(e);
    // action it does when an error occurs and the error is logged to the console.
  });
}
function userLogin(email, password) {
  auth.signInWithEmailAndPassword(email, password).then(() => {
    // action it does when the user is logged in.
  }).catch(e => {
    console.log(e);
    // action it does when an error occurs and the error is logged to the console.
  });
}
