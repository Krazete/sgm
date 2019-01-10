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
