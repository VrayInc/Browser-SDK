/**
 * This is for GOOGLEUSER object
 * @type {{id: undefined, email: undefined, mobile: undefined, flag: number, configure: GOOOGLEUSER.configure, getId: (function(): (undefined|*)), getEmail: (function(): (undefined|*)), getMobile: (function(): (undefined|*)), getFlag: (function(): (number|*)), setId: GOOOGLEUSER.setId, setEmail: GOOOGLEUSER.setEmail, setMobile: GOOOGLEUSER.setMobile, setFlag: GOOOGLEUSER.setFlag}}
 */
var GOOOGLEUSER = {
    id : undefined,
    email : undefined,
    mobile : undefined,
    flag : 0,

    configure: function(id, email, mobile) {
        GOOOGLEUSER.id = id;
        GOOOGLEUSER.email = email;
        GOOOGLEUSER.mobile = mobile;
        GOOOGLEUSER.flag = 1;
    },

    getId : function() {
        return GOOOGLEUSER.id;
    },

    getEmail : function() {
        return GOOOGLEUSER.email;
    },

    getMobile : function() {
        return GOOOGLEUSER.mobile;
    },

    getFlag : function() {
        return GOOOGLEUSER.flag;
    },

    setId : function(id) {
        GOOOGLEUSER.id = id;
    },

    setEmail : function(email) {
        GOOOGLEUSER.email = email;
    },

    setMobile : function(mobile) {
        GOOOGLEUSER.mobile = mobile;
    },

    setFlag : function(flag) {
        GOOOGLEUSER.flag = flag;
    }
};


/**
 * Calls startAuth after Sign in V2 finishes setting up.
 */
var appStart = function() {
    gapi.load('auth2', initSigninV2);
};

/**
 * Initializes Signin v2 and sets up listeners.
 */
var initSigninV2 = function() {

    auth2 = gapi.auth2.init({
        client_id: '916985966852-ashk834rjgbtomdb6tj9c7kl867kfei0.apps.googleusercontent.com',
        scope: 'profile'
    });

    //Attach the click Handler
    var clickOptions = new gapi.auth2.SigninOptionsBuilder();
    clickOptions.setScope('profile');
    auth2.attachClickHandler(document.getElementById('custom_google_btn'), clickOptions, 
                             signInSuccess, signInFailure);
};


/**
 * Retrieves the current user and signed in states from the GoogleAuth
 * object.
 */
var signInSuccess = function() {
    googleUser = auth2.currentUser.get();
    console.log(googleUser);
    collectGoogleUser(googleUser.getBasicProfile().getId());
};

var signInFailure = function() {
    console.log("Sign In Failed");
}

/**
 * This file is to make a Google user class with id, email, and mobile-phone number
 */
function collectGoogleUser(userId){

    // Get the emailAddress and phone number from the info that user put-in.
    var emailAddress = document.getElementById('myVId').value;
    var phoneNumber = document.getElementById('phoneNumber').value;

    // Make a google user as a class
    GOOOGLEUSER.configure(userId, emailAddress, phoneNumber);

    console.log(GOOOGLEUSER.getId());
    console.log(GOOOGLEUSER.getEmail());
    console.log(GOOOGLEUSER.getMobile());

    pushToServer();
}

//appStart();
