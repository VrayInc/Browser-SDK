//////////////////////////
// Necessary JS Files
/////////////////////////
loadJSFile('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', jQueryAdded);
loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/paymentservices.js', paymentServicesAdded);
loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/chargeservices.js', chargeServicesAdded);
loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/digest.js', digestAdded);
loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/mobile-detect.js', mobileDetectAdded);
loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/hmac-sha256.js', hmacAdded);

//////////////////////////
//Callbacks after JS Files
//////////////////////////

function googleScriptAdded() {
    loadJSFile("https://rawgit.com/VrayInc/Browser-SDK/master/js/googleSignIn.js", googleSignInAdded);
}

function googleSignInAdded() {
    
}

function facebookSignInAdded() {
    
}

function jQueryAdded() {
    
}

function paymentServicesAdded() {
    
}

function chargeServicesAdded() {
    
}

function digestAdded() {
    
}

var mobileDetect = null;
function mobileDetectAdded() {
    mobileDetect = new MobileDetect(window.navigator.userAgent);
}

function hmacAdded() {
    loadJSFile('https://rawgit.com/VrayInc/Browser-SDK/master/js/enc-base64-min.js', encAdded);
}

function encAdded() {
    
}

////////////////////////////
// Signup Modals
///////////////////////////
var signupModalString =
    '<div id="signupModal" class="modal">' +
        '<div class="modal-content">' +
            '<span class="close" onclick="closeModal();">&times;</span>' +
            '<div class="forms-wrap w-container">' +
                '<div class="account-checkout">' +
                    '<button class="span" onClick="continueWithFacebook();">' +
                            '<img src="https://raw.githubusercontent.com/VrayInc/Browser-SDK/master/images/facebook.png" alt=""/>' +
                            '<i>Sign Up with Facebook</i>' +
                    '</button>' +
                    '<button id="custom_google_btn" class="span2">' +
                            '<img src="https://raw.githubusercontent.com/VrayInc/Browser-SDK/master/images/google-logo.png" alt=""/>' +
                            '<i>Sign Up with Google</i>' +
                    '</button>' +
                    '<button class="security-span" onClick="securityPopup();">' +
                        '<i>Sign Up with Security Question</i>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

var securityQuestionModalString =
    '<div id="securitySignupModal" class="modal">' +
        '<div class="modal-content">' +
        '<span class="close" onclick="closeSecurityModal();">&times;</span>' +
            '<div class="forms-wrap w-container security-forms-wrap">' +
                '<div class="w-form">' +
                    '<div id="security-signup" class="form-col-1 w-col">' +
                        '<label for="securityQuestion">Security Question:</label>' +
                        '<select class="w-select" id="securityQuestion">' +
                            '<option value=1> What was the name of your elementary school? </option>' +
                            '<option value=2> What was the name of your first pet? </option>' +
                            '<option value=3> What is the city of your birth? </option>' +
                            '<option value=4> What is the title of your favorite movie? </option>' +
                            '<option value=5> What was the model of your first car? </option>' +
                            '<option value=6> What street name did you grow up on? </option>' +
                            '<option value=7> What city did you get married in?</option>' +
                            '<option value=8> How old were you when you got your first job? </option>' +
                        '</select><br>' +
                        '<label for="securityAnswer">Security Answer:</label>' +
                        '<input class="w-input" id="securityAnswer" type="text"/><br>' +
                        '<div class="signupButton">' +
                            '<input style="height: 40px; font-size: 1em;" type="button"' +
                            'id="signupSecurityQ" value="SIGNUP" onclick="signupWithSecurityQ();"' +
                            'class="green-button w-button" onsubmit="return false"/>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';


var spinnerString =
    '<div id="mobilepay" class="processor"></div>' +
    '<div id="waitForAuthorization" class="pay-with-mobile-spinner">' +
        '<img src="https://raw.githubusercontent.com/VrayInc/Browser-SDK/master/images/spinner_green_dot.gif" width="50" height="50" /> </div>';

document.head.append(addCSSFile('https://rawgit.com/VrayInc/Browser-SDK/master/css/merchant-button-special.css'));
document.body.append(addDiv(spinnerString));
document.body.append(addDiv(signupModalString));
document.body.append(addDiv(securityQuestionModalString));

//////////////////////////////////
// Load Google's external script
/////////////////////////////////
loadJSFile("https://apis.google.com/js/api:client.js", googleScriptAdded);

///////////////////////////////////
// Facebook Sign In Requirements
//////////////////////////////////
loadJSFile("https://rawgit.com/VrayInc/Browser-SDK/master/js/facebookSignIn.js", facebookSignInAdded);

//////////////////////////////////////
// Helper functions
//////////////////////////////////////
function addJSFile(filepath) {
    var script=document.createElement('script');
    script.setAttribute("type","text/javascript");
    script.setAttribute("src", filepath);
    return script;
}

function addCSSFile(filepath) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = filepath;
    return link;
}

function addJSInline(source) {
    var script=document.createElement('script');
    var text = document.createTextNode(source);
    script.appendChild(text);
    return script;
}

function addDiv(divText) {
    var div = document.createElement('div');
    div.innerHTML = divText;
    return div;
}

function loadJSFile(filepath, callback) {
    var jScript = document.createElement("script");
    jScript.type = "text/javascript";
    if (jScript.readyState){
        jScript.onreadystatechange = function() {
            if (jScript.readyState === "loaded" || jScript.readyState === "complete") {
                jScript.onreadystatechange = null;
                callback();
            }
        }
    }
    else {
        jScript.onload = function(){
            callback();
        };
    }
    jScript.src = filepath;
    document.getElementsByTagName("body")[0].appendChild(jScript);
}

//////////////////////////////////////
// Older code
//////////////////////////////////////
var modal = document.getElementById('signupModal');
var securityModal = document.getElementById('securitySignupModal');

function closeModal() {
    modal.style.display = "none";
    UIUtils.hideSpinner();
}

function closeSecurityModal() {
    securityModal.style.display = "none";
}

function signupWithSecurityQ() {
    // Stop automatic submits the form
    event.preventDefault();  // Stop automatic submits form

    var securityQID = document.getElementById("securityQuestion").value;
    var securityAnswer = document.getElementById("securityAnswer").value;

    if(securityAnswer) {
        var signupRequest = CARDHOLDER.setSecurityQA(securityQID, securityAnswer);
        var hmac = calculateHMAC(signupRequest);
        SIGNUP.configureSecurityQRequest(hmac);

        // Clear the signup modal
        var modal = document.getElementById('signupModal');
        modal.style.display = "none";
        var modal = document.getElementById('securitySignupModal');
        modal.style.display = "none";
        UIUtils.showSpinner();
    }
}

function securityPopup() {
    var securityModal = document.getElementById('securitySignupModal');
    securityModal.style.display = "block";
}

/**
 * continueWithFacebook()
 * If the user clicks the "Sign Up with Facebook," this function will be activated to
 * help the user signining up with facebook identification.
 */
function continueWithFacebook() {
    
    if(CARDHOLDER.signinAccessToken === null ) {
        FB.login(function (response) {
            if(response.status == 'connected') {
                if (response.authResponse) {
                    facebookAPI();
                }
            }
            else {
                console.log("ERROR - Facebook login failed.");
            }
        });
    }
    else {
        FB.getLoginStatus(function (response) {
            if (response.authResponse) {
                if (response.status === 'connected') {
                    facebookAPI();
                }
                else {
                    window.alert("ERROR - Facebook login failed.");
                }
            }
        });
    }
}

/**
 * facebookAPI()
 * This function helps to get the id number from facebook API.
 * And make a user object with id, email, and phone number.
 */
function facebookAPI(){
    FB.api('/me?fields=id', function (response) {
        if (response && !response.error) {
            console.log(response);
            //Make a Facebook User
            collectFacebookUser(response.id);
        }
    });
}

/**
 * pushToServer()
 * This functions helps to add user to the server.
 * Especially with facebook ID and google ID.
 */
function pushToServer(){
    if( GOOOGLEUSER.getFlag() == 1 || FACEBOOKUSER.getFlag() == 1){
        if(GOOOGLEUSER.getFlag() == 1){
            SIGNUP.configure3rdPartySigninRequest(2, GOOOGLEUSER.getId());
        }
        else {
            SIGNUP.configure3rdPartySigninRequest(1, FACEBOOKUSER.getId());
        }
    }
    else{
        console.log("Can't push the user to the server")
    }
}

function launchPayment() 
{
    var tid = TRANSACTION.id;
    var merchant = MERCHANT.name;
    var amount = TRANSACTION.amount;
    var url = "https://www.vraymerchant.com/payment.html?tid=" + tid + "&name=" + merchant + "&amt=" + 
              amount + "&mac=" + "";

    // TODO - MAC calculation is done at the server backend w/ Key
    var key = "79aa2cd255bda022e5e0d095eaeea9442800c1fa3c74c85b2a6db2e1f988f952";
    var hmac = CryptoJS.HmacSHA256(url, key);
    var hmacBase64 = CryptoJS.enc.Base64.stringify(hmac);   
    TRANSACTION.MAC = hmacBase64;
    window.location = url+hmacBase64;
}

function calculateHMAC(message) 
{
    // TODO - Move to Merchant Store Server w/ Key
    var mac = new Digest.HMAC_SHA256();        
    mac.setKey(APPSERVER.vrayHost.getMACKey());         
    mac.update(message);
    return mac.finalize();  
}

////////////////////////////
// Functions for User
///////////////////////////
var VRAY = {
    merchantId  : null,
    serverId    : null,
    merchantName: null,
    
    myVId         : null,
    phoneNumber   : null,
    streetAddr    : null,
    city          : null,
    state         : null,
    zipCode       : null,
    shippingAddr  : null,
    deviceType    : 0,
    loginStatus   : 0,
    totalAmount   : 0,

    init  :  function(merchantId) {
        VRAY.serverId = "https://vraystaging.azurewebsites.net";
        VRAY.merchantId = merchantId;
        VRAY.merchantName = merchantId;

        // Define App Server and Merchant Id & name
        APPSERVER.vrayHost.setDomainURL(VRAY.serverId);
        MERCHANT.configure(VRAY.merchantId, VRAY.merchantName);
    },

    setupPayment : function(myVId, phoneNumber, streetAddr, city, state, zipCode, totalAmount, loginStatus) {
        VRAY.myVId = myVId;
        VRAY.phoneNumber = phoneNumber;
        VRAY.streetAddr = streetAddr;
        VRAY.city = city;
        VRAY.state = state;
        VRAY.zipCode = zipCode;
        VRAY.shippingAddr = [VRAY.streetAddr, VRAY.city, VRAY.state, VRAY.zipCode];
        VRAY.totalAmount = totalAmount;
        VRAY.loginStatus = loginStatus;
    },

    pay : function() {
        event.preventDefault();  // Stop automatic form submission
        
        if(!VRAY.serverId || !VRAY.merchantId || !VRAY.merchantName || !VRAY.myVId || !VRAY.phoneNumber ||
           !VRAY.streetAddr || !VRAY.city || !VRAY.state || !VRAY.zipCode || !VRAY.shippingAddr ||
           VRAY.totalAmount === 0) {
            
            console.log("Payment information missing!");
            return;
        }

        CARDHOLDER.configure(
            VRAY.getMyVId(),
            VRAY.getMyVId(),
            VRAY.getPhoneNumber(),
            VRAY.getShippingAddr() 
        );

        // Payment Request:
        TRANSACTION.init();
        TRANSACTION.deviceType = (mobileDetect.mobile() ? 1 : 0);
        TRANSACTION.loginStatus = parseInt(VRAY.getLoginStatus());

        //var amount = document.forms["paymentForm"]["amount"].value;
        var amount = VRAY.getTotalAmount();
        var purchaseItems = "Item#1, Item#2, Item#3, ...";
        var purchaseOrder = PAYMENT.create(amount, purchaseItems);
        var hmac = calculateHMAC(purchaseOrder);
        PAYMENT.authorizationRequest(hmac);
    },

    setDeviceType : function(deviceType) {
        VRAY.deviceType = deviceType;
    },

    setLoginStatus : function(loginStatus) {
        VRAY.loginStatus = loginStatus;
    },

    setTotalAmount : function(totalAmount) {
        VRAY.totalAmount = totalAmount;
    },


    getMyVId : function() {
        return VRAY.myVId;
    },

    getPhoneNumber : function () {
        return VRAY.phoneNumber;
    },

    getStreetAddr : function () {
        return VRAY.streetAddr;
    },

    getCity : function () {
        return VRAY.city;
    },

    getZipCode : function () {
        return VRAY.zipCode;
    },

    getShippingAddr : function () {
        return VRAY.shippingAddr;
    },

    getDeviceType : function() {
        return VRAY.deviceType;
    },

    getLoginStatus : function () {
        return VRAY.loginStatus;
    },

    getTotalAmount : function () {
        return VRAY.totalAmount;
    }
};
