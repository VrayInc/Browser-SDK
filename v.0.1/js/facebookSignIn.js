/**
 * This is for Facebook usr object
 * @type {{id: undefined, email: undefined, mobile: undefined, flag: number, configure: FACEBOOKUSER.configure, getId: (function(): (undefined|*)), getEmail: (function(): (undefined|*)), getMobile: (function(): (undefined|*)), getFlag: (function(): (number|*)), setId: FACEBOOKUSER.setId, setEmail: FACEBOOKUSER.setEmail, setMobile: FACEBOOKUSER.setMobile, setFlag: FACEBOOKUSER.setFlag}}
 */
var FACEBOOKUSER = {
    id : undefined,
    email : undefined,
    mobile : undefined,
    flag : 0,

    configure: function(id, email, mobile) {
        FACEBOOKUSER.id = id;
        FACEBOOKUSER.email = email;
        FACEBOOKUSER.mobile = mobile;
        FACEBOOKUSER.flag = 1;
    },

    getId : function() {
        return FACEBOOKUSER.id;
    },

    getEmail : function() {
        return FACEBOOKUSER.email;
    },

    getMobile : function() {
        return FACEBOOKUSER.mobile;
    },

    getFlag : function() {
        return FACEBOOKUSER.flag;
    },

    setId : function(id) {
        FACEBOOKUSER.id = id;
    },

    setEmail : function(email) {
        FACEBOOKUSER.email = email;
    },

    setMobile : function(mobile) {
        FACEBOOKUSER.mobile = mobile;
    },

    setFlag : function(flag) {
        FACEBOOKUSER.flag = flag;
    }
};

window.fbAsyncInit = function() {
    FB.init({
        appId      : '1948225005195861',
        cookie     : true,
        xfbml      : true,
        version    : 'v3.0'
    });
    /*FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });*/
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


/**
 * This file is to make a Facebook user class with id, email, and mobile-phone number
 * @param userId
 */
function collectFacebookUser(userId){
    var emailAddress = document.getElementById('myVId').value;
    var phoneNumber = document.getElementById('phoneNumber').value;

    // Make a google user as a class
    FACEBOOKUSER.configure(userId, emailAddress, phoneNumber);

    console.log(FACEBOOKUSER.getId());
    console.log(FACEBOOKUSER.getEmail());
    console.log(FACEBOOKUSER.getMobile());

    pushToServer();
}


