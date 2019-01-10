var config = {
    apiKey: "AIzaSyCHj7h6q2cG8h3yRDvofHiDP3Y4H4wY6t4",
    authDomain: "sgmobilegallery.firebaseapp.com",
    databaseURL: "https://sgmobilegallery.firebaseio.com",
    projectId: "sgmobilegallery",
    storageBucket: "sgmobilegallery.appspot.com",
    messagingSenderId: "65927600297"
};

firebase.initializeApp(config);

var database = firebase.database();

var userIP = 0;

function getIP(json) {
userIP = json.ip;
}


firebase.auth().signInAnonymously().catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error.code, error.message);
});

var uid = 0;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
    } else {
        console.log("Anonymous user is logged out.")
    }
});
