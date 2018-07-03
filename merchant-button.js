var signupModalString =
    '<div id="signupModal" class="modal">' +
        '<div class="modal-content">' +
            '<span class="close" onclick="closeModal();">&times;</span>' +
            '<div class="forms-wrap w-container">' +
                '<div class="account-checkout">' +
                    '<button class="span" onClick="signupWithFacebook();">' +
                        '<img src="images/facebook.png" alt=""/>' +
                        '<i>Sign Up with Facebook</i>' +
                    '</button>' +
                    '<button id="customBtn" class="span2">' +
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
        '<img src="images/spinner_green_dot.gif" width="50" height="50" />' +
    '</div>';

var merchantButtonSpecialCSS = '<link href="css/merchant-button-special.css" rel="stylesheet" type="text/css">';

$('head').append(merchantButtonSpecialCSS);

$('body').append(spinnerString);
$('body').append(signupModalString);
$('body').append(securityQuestionModalString);


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

function signupWithFacebook() {

    if (CARDHOLDER.signinAccessToken === null)
    {
        FB.login(function(response)
            {
                if (response.authResponse)
                {
                    if (response.status === 'connected')
                    {
                        SIGNUP.configure3rdPartySigninRequest(1, response.authResponse.accessToken);

                        // Get the modal
                        var modal = document.getElementById('securityQModal');
                        modal.style.display = "none";
                        $("#securityQModal").dialog( "close" );
                    } else
                    {
                        window.alert("ERROR - Facebook login failed.");
                    }
                }
            },
            {scope: 'email,public_profile', return_scopes: true});
    }
    else {
        FB.getLoginStatus(function(response) {

            if (response.authResponse)
            {
                if (response.status === 'connected')
                {
                    SIGNUP.configure3rdPartySigninRequest(1, response.authResponse.accessToken);

                    // Get the modal
                    var modal = document.getElementById('securityQModal');
                    modal.style.display = "none";
                    $("#securityQModal").dialog( "close" );
                }
                else {
                    window.alert("ERROR - Facebook login failed.");
                }
            }
        });
    }
}

function securityPopup() {
    var securityModal = document.getElementById('securitySignupModal');
    securityModal.style.display = "block";
}

/* Submit form assuming IDs have been set as per the documentation */
function submitVRAYPay() {

    event.preventDefault();  // Stop automatic submits form

    ////////////////////////////////////////////////////////////////////
    // Application Servers Configuration:
    //
    var paymentServerURL = document.forms["paymentForm"]["serverId"].value;
    APPSERVER.vrayHost.setDomainURL(paymentServerURL);

    ////////////////////////////////////////////////////////////////////
    // Merchant Server Configuration:
    //
    var merchantId = document.forms["paymentForm"]["merchantId"].value;
    var merchantName = document.forms["paymentForm"]["merchantId"].value;
    MERCHANT.configure(merchantId, merchantName);

    ////////////////////////////////////////////////////////////////////
    // Cardholder Information:
    //
    var vId          = document.forms["paymentForm"]["myVId"].value;
    var phoneNumber  = document.forms["paymentForm"]["phoneNumber"].value;
    var streetAddr   = document.forms["paymentForm"]["streetAddr"].value;
    var city         = document.forms["paymentForm"]["city"].value;
    var state        = document.forms["paymentForm"]["state"].value;
    var zipCode      = document.forms["paymentForm"]["zipCode"].value;
    var shippingAddr = [streetAddr, city, state, zipCode];
    CARDHOLDER.configure(vId, vId, phoneNumber, shippingAddr);

    ////////////////////////////////////////////////////////////////////
    // Payment Request:
    //
    TRANSACTION.init();
    var amount       = document.forms["paymentForm"]["amount"].value;
    var purchaseItems = "Item#1, Item#2, Item#3, ...";
    var purchaseOrder = PAYMENT.create(amount, purchaseItems);
    var hmac = calculateHMAC(purchaseOrder);
    PAYMENT.authorizationRequest(hmac);
};

/* Submit form with parameters */
function submitVRAYPayWithOptions(merchantId, merchantName, vId, vName, phoneNumber,
                                  streetAddr, city, state, zipCode, amount, purchaseItems) {

    event.preventDefault();  // Stop automatic submits form

    ////////////////////////////////////////////////////////////////////
    // Application Servers Configuration:
    //
    var paymentServerURL = document.forms["paymentForm"]["serverId"].value;
    APPSERVER.vrayHost.setDomainURL(paymentServerURL);

    ////////////////////////////////////////////////////////////////////
    // Merchant Server Configuration:
    //
    MERCHANT.configure(merchantId, merchantName);

    ////////////////////////////////////////////////////////////////////
    // Cardholder Information:
    //
    var shippingAddr = [streetAddr, city, state, zipCode];
    CARDHOLDER.configure(vId, vId, phoneNumber, shippingAddr);

    ////////////////////////////////////////////////////////////////////
    // Payment Request:
    //
    TRANSACTION.init();
    var purchaseOrder = PAYMENT.create(amount, purchaseItems);
    var hmac = calculateHMAC(purchaseOrder);
    PAYMENT.authorizationRequest(hmac);
}
