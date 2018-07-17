//////////////////////////
// Necessary JS Files
/////////////////////////
loadJSFile('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', jQueryAdded);
loadJSFile('js/paymentservices.js', paymentServicesAdded);
loadJSFile('js/chargeservices.js', chargeServicesAdded);
loadJSFile('js/digest.js', digestAdded);
loadJSFile('js/mobile-detect.js', mobileDetectAdded);
loadJSFile('js/hmac-sha256.js', hmacAdded);

//////////////////////////
//Callbacks after JS Files
//////////////////////////

function googleScriptAdded() {
    document.head.append(addJSFile("js/googleSignIn.js"));
}

function jQueryAdded() {
    
}

function paymentServicesAdded() {
    
}

function chargeServicesAdded() {
    
}

function digestAdded() {
    
}

function mobileDetectAdded() {
    var mobileDetect = new MobileDetect(window.navigator.userAgent);
    TRANSACTION.deviceType = (mobileDetect.mobile() ? 1 : 0);
    
}

function hmacAdded() {
    loadJSFile('js/enc-base64-min.js', encAdded);
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
                            '<img src="images/facebook.png" alt=""/>' +
                            '<i>Sign Up with Facebook</i>' +
                    '</button>' +
                    '<button id="custom_google_btn" class="span2">' +
                            '<img src="images/google-logo.png" alt=""/>' +
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
        '<img src="images/spinner_green_dot.gif" width="50" height="50" /> </div>';

document.head.append(addCSSFile('css/merchant-button-special.css'));
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
document.head.append(addJSFile("js/facebookSignIn.js"));

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
    serverId      : null,
    merchantId    : null,
    merchantName  : null,

    init  :  function(serverId, merchantId, merchantName) {
        VRAY.serverId = serverId;
        VRAY.merchantId = merchantId;
        VRAY.merchantName = merchantName;

        // Define App Server and Merchant Id & name
        APPSERVER.vrayHost.setDomainURL(VRAY.serverId);
        MERCHANT.configure(VRAY.merchantId, VRAY.merchantId);
    }
};

var VRAY_PAYFORM = {
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

    /**
     *
     * @param myVId
     * @param phoneNumber
     * @param streetAddr
     * @param city
     * @param state
     * @param zipCode
     * @param shippingAddr
     */
    init : function(myVId, phoneNumber, streetAddr, city, state, zipCode, shippingAddr) {
        VRAY_PAYFORM.myVId = myVId;
        VRAY_PAYFORM.phoneNumber = phoneNumber;
        VRAY_PAYFORM.streetAddr = streetAddr;
        VRAY_PAYFORM.city = city;
        VRAY_PAYFORM.state = state;
        VRAY_PAYFORM.zipCode = zipCode;
        VRAY_PAYFORM.shippingAddr = shippingAddr;
    },

    definePayment : function() {
        event.preventDefault();  // Stop automatic submits form

        CARDHOLDER.configure(
            VRAY_PAYFORM.getMyVId(),
            VRAY_PAYFORM.getMyVId(),
            VRAY_PAYFORM.getPhoneNumber(),
            VRAY_PAYFORM.getShippingAddr() 
        );

        // Payment Request:
        TRANSACTION.init();
        TRANSACTION.deviceType = parseInt(VRAY_PAYFORM.getDeviceType());
        TRANSACTION.loginStatus = parseInt(VRAY_PAYFORM.getLoginStatus());

        //var amount = document.forms["paymentForm"]["amount"].value;
        var amount = VRAY_PAYFORM.getTotalAmount();
        var purchaseItems = "Item#1, Item#2, Item#3, ...";
        var purchaseOrder = PAYMENT.create(amount, purchaseItems);
        var hmac = calculateHMAC(purchaseOrder);
        PAYMENT.authorizationRequest(hmac);
    },

    /**
     *
     * @param deviceType
     */
    setDeviceType : function(deviceType) {
        VRAY_PAYFORM.deviceType = deviceType;
    },

    /**
     *
     * @param loginStatus
     */
    setLoginStatus : function(loginStatus) {
        VRAY_PAYFORM.loginStatus = loginStatus;
    },

    /**
     *
     * @param totalAmount
     */
    setTotalAmount : function(totalAmount) {
        VRAY_PAYFORM.totalAmount = totalAmount;
    },


    getMyVId : function() {
        return VRAY_PAYFORM.myVId;
    },

    getPhoneNumber : function () {
        return VRAY_PAYFORM.phoneNumber;
    },

    getStreetAddr : function () {
        return VRAY_PAYFORM.streetAddr;
    },

    getCity : function () {
        return VRAY_PAYFORM.city;
    },

    getZipCode : function () {
        return VRAY_PAYFORM.zipCode;
    },

    getShippingAddr : function () {
        return VRAY_PAYFORM.shippingAddr;
    },

    getDeviceType : function() {
        return VRAY_PAYFORM.deviceType;
    },

    getLoginStatus : function () {
        return VRAY_PAYFORM.loginStatus;
    },

    getTotalAmount : function () {
        return VRAY_PAYFORM.totalAmount;
    }
};
