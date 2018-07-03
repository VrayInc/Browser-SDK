/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

////////////////////////////////////////////////////////////////////////////////
//  Application Servers Instances (Assigned Statically or Dyanmically)
//
var APPSERVER = {
  
    merchantHost : {
        // TODO: move into persistence database.
        //apiKey      : 'sk_test_mPKkiU0DeFqUJKO37eb6E6Vq',  
        apiKey      : 'sk_live_o4skyZonaBSOBf0k3Xyn5At3',
        domainName  : 'VRAY Live',
        domainURL   : 'https://www.vraymerchant.com',
        
        getAPIKey : function() {
            return APPSERVER.merchantHost.apiKey;
        },
        
        getDomainName : function () {
            return APPSERVER.merchantHost.domainName;
        },
        
        getURL : function () {
            return APPSERVER.merchantHost.domainURL;
        },
 
        setAPIKey : function(key) {
            APPSERVER.merchantHost.apiKey = key;
        },
        
        setName : function (name) {
            APPSERVER.merchantHost.domainName = name;
        },
        
        setURL : function (url) {
            APPSERVER.merchantHost.domainURL = url;
        }
    },
    
    paymentGWHost : {
        // TODO: move into persistence database.
        //apiKey          : 'sk_test_mPKkiU0DeFqUJKO37eb6E6Vq',  
        apiKey          : 'sk_live_o4skyZonaBSOBf0k3Xyn5At3',  
        domainName      : 'Stripe',
        domainURL       : 'https://stripe.com',
        
        getAPIKey : function() {
            return APPSERVER.paymentGWHost.apiKey;
        },
        
        getDomainName : function () {
            return APPSERVER.paymentGWHost.domainName;
        },
        
        getURL : function () {
            return APPSERVER.paymentGWHost.domainURL;
        },
 
        setAPIKey : function(key) {
            APPSERVER.paymentGWHost.apiKey = key;
        },
        
        setName : function (name) {
            APPSERVER.paymentGWHost.domainName = name;
        },
        
        setURL : function (url) {
            APPSERVER.paymentGWHost.domainURL = url;
        }
    },
    
    vrayHost : { 
        // TODO: move into persistence database.
        //apiKey      : 'sk_test_mPKkiU0DeFqUJKO37eb6E6Vq',  
        apiKey      : 'sk_live_o4skyZonaBSOBf0k3Xyn5At3',  
        domainName  : 'VRAY Host',
        domainURL   : 'https://vraystaging.azurewebsites.net',
        macKey      : '79aa2cd255bda022e5e0d095eaeea9442800c1fa3c74c85b2a6db2e1f988f952',
            
        getAPIKey: function() {
            return APPSERVER.vrayHost.apiKey;
        },
        
        getDomainName : function() {
            return APPSERVER.vrayHost.domainName;
        },
        
        getDomainURL : function () {
            return APPSERVER.vrayHost.domainURL;
        },
                
        getMACKey : function() {
            return APPSERVER.vrayHost.macKey;
        },

        setAPIKey : function(key) {
            APPSERVER.vrayHost.apiKey = key; 
        },
        
        setDomainName : function(name) {
            APPSERVER.vrayHost.domainName= name; 
        },
        
        setDomainURL : function(url) {
            APPSERVER.vrayHost.domainURL = url; 
        },
        
        setMACKey : function(key) {
            APPSERVER.vrayHost.macKey = key;
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Cardholder Info & Configuration
//
var CARDHOLDER = {
    
    id                  : null,
    name                : null,
    phone               : null,
    phoneCode           : null,
    securityQId         : 0,
    securityAnswer      : null,
    signinAccessToken   : null,
    signinType          : 0,
    shippingAddress     : [null], // street, city, zip, country
    
    configure : function (id, name, phone, shippingAddress) {
        // Billing customer information
        CARDHOLDER.id        = id;
        CARDHOLDER.name      = name;
        CARDHOLDER.phone     = phone;
        CARDHOLDER.shippingAddress   = shippingAddress;
    },
    
    setSecurityQA : function (securityQId, securityAnswer) {
        
        // CARD Holder Info
        CARDHOLDER.securityQId = parseInt(securityQId);
        CARDHOLDER.securityAnswer = securityAnswer;
        
        // Payment Authorization Request
	var configureSecurityQReq = {
            "msgId"              : MESSAGE.id.BrowserConfigureSecurityQReq,
            "vid"                : CARDHOLDER.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "securityQid"        : CARDHOLDER.securityQId,
            "securityA"          : CARDHOLDER.securityAnswer,
            "messageAuthenticationCode": ""           
        };
        
        return JSON.stringify(configureSecurityQReq).toString();
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Merchant Info & Configuration
//
var MERCHANT = {
 
    id          : 'merchant.com.vray.vpay',
    name        : 'VRAY',
    capability  : 1,
    macKey      : "79aa2cd255bda022e5e0d095eaeea9442800c1fa3c74c85b2a6db2e1f988f952",
       
    configure : function (id, name) {
        
        MERCHANT.id = id;
        MERCHANT.name = name;
    },
    
    getID : function() {
        return MERCHANT.id;
    },
    
    getKey : function() {
        return MERCHANT.macKey;
    },

    getName : function() {
        return MERCHANT.name;
    },
    
    setID : function(id) {
        MERCHANT.id = id; 
    },
   
    setKey : function(key) {
        MERCHANT.macKey = key;
    },
    
    setName : function(name) {
        MERCHANT.id = name; 
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Messaging Services
//
var MESSAGE = {

    id : {
        // On-line Payment Messages (Browser, Server, Mobile App)
        PaymentRequest                  : 1,
        PaymentResponse                 : 2,
        VidRequest                      : 3,
        VidResponse                     : 4,
        CodeCommand                     : 5,
        CodeIndication                  : 6,
        TokenRequest                    : 7,
        TokenResponse                   : 8,
        AuthorizationRequest            : 9,
        AuthorizationResponse           : 10,
        ErrorIndication                 : 11,
        CodeSMSCommand                  : 12,
        SignupRequest                   : 13,
        SignupReponse                   : 14,
        PhoneVerificationRequest        : 15,
        PhoneVerificationReponse        : 16,
        ConfigureNotificationRequest    : 17,
        ConfigureNotificationResponse   : 18,
        CodeResponse                    : 19,
        SecurityQuestionRequest         : 20,
        SecurityQuestionResponse        : 21,
        ConfigureSecurityQResponse      : 23,
        
        // BROWSWER On-line Payment (Tablet/Mobile Browser, Server, Mobile Broswer),
        BrowserVerificationRequest      : 24,   // PC       --->    VServer
        BrowserVerificationResponse     : 25,   // PC       <---    VServer
        BrowserCodeIndication           : 26,   // PC       --->    VServer
        BrowserTokenIndication          : 27,   // PC       <---    Mobile
        BrowserPaymentIndication        : 28,   // PC       <---    VServer
        BrowserConfigureSecurityQReq    : 29,
        BrowserConfigureSecurityQResp   : 30,
        BroswerRetrievePaymentInfo      : 31,   // Mobile   --->    VServer
        
        // 3rd Party Sign-in/Sign-up
        Configure3rdPartySigninRequest  : 32,    
        Configure3rdPartySigninResponse : 33,
        ThirdPartySigninRequest         : 34,
        ThirdPartySigninResponse        : 35,
        PhoneVerificationRequestAck     : 36
    }
};

////////////////////////////////////////////////////////////////////////////////
// Payment Processing Services.
//
var PAYMENT = {
    
    signupCalled : false,
    
    authorizationRequest : function (hmac) {

        UIUtils.showSpinner();

        // Payment Authorization Request
	    var paymentReqParam = {
            "msgId"             : MESSAGE.id.PaymentRequest,
            "tid"               : TRANSACTION.id,
            "ttime"             : TRANSACTION.date,
            "vid"               : CARDHOLDER.id,
            "shippingInfo"      : CARDHOLDER.shippingAddress,
            "amount"            : TRANSACTION.amount,
            "countryCode"       : TRANSACTION.countryCode,
            "currencyCode"      : TRANSACTION.currencyCode,
            "merchantIdentifier": MERCHANT.id,
            "merchantName"      : MERCHANT.name,
            "lineItems"         : TRANSACTION.lineItems,
            "messageAuthenticationCode": UTILS.ab2hexText(hmac)            
        };
       
        var paymentReqParamText =  JSON.stringify(paymentReqParam).toString();
        TRANSACTION.paymentRequest = paymentReqParamText;
        
        if(UTILS.debug.enabled()) {
            window.alert("Payment authorization request: \n\n" + paymentReqParamText + "\n\n");
        }
        
        // Start T1 Timer
        window.setTimeout(TRANSACTION.t1Timer, TRANSACTION.t1Timeout);



        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL()+ "/api/payments/payrequest",
            contentType : "application/json",
            data        : paymentReqParamText,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null) {
                    
                    window.alert("ERROR:  Invalid payment authorization respond.\n");
                    return;
                }
                
                // Clear the T1 transaction timer
                window.clearTimeout(TRANSACTION.t1Timer); 
                
                var messageId = paymentRespond.msgId;
                switch (messageId) {
                    
                    case MESSAGE.id.PaymentResponse :
                        PAYMENT.authorizationResponse(paymentRespond);
                        break;
                        
                    case MESSAGE.id.CodeCommand :
                        PAYMENT.codeCheckChallenge(paymentRespond);
                        break;
                        
                    case MESSAGE.id.SecurityQuestionRequest:
                        PAYMENT.secretQuestionChallenge(paymentRespond);
                        break;
                        
                    case MESSAGE.id.VidRequest :
                        PAYMENT.vidResponse(paymentRespond);
                        break;
                        
                    default :
                        PAYMENT.completed();
                        window.alert("ERROR - Unknown/Unexpected Message ID = " + messageId.toString());
                        break;  
                }
            },
            error: function(){
                PAYMENT.completed();
            }
        });
    },
    
    authorizationResponse : function (paymentResponse) {

        // Validate message
        if ((paymentResponse === undefined) || (paymentResponse === null) ||
            (paymentResponse.tid === undefined) || (paymentResponse.tid === null) ||
            (paymentResponse.token === undefined) || (paymentResponse.token === null) ||
            (paymentResponse.status === undefined) || (paymentResponse.status === null) ||
            (paymentResponse.msgId !== 2)) {
        
            window.alert("ERROR - Unexpected payment response parameters:\n\n" +
                         JSON.stringify(paymentResponse).toString());
            PAYMENT.completed();
            return;
        }
        
        var tid = parseInt(paymentResponse.tid);
        if (tid === Number(TRANSACTION.id)) {
            
            if (paymentResponse.status === STATUS.code.SUCCESS)  {   
                
                var ccToken = paymentResponse.token;
            
                if(UTILS.debug.enabled()) {
                    window.alert("Payment authorization accepted.\n\n" +
                         "Credit Card Token = " + ccToken);
                }     
                // Charging payment via credit card token
                doChargePayment(ccToken, TRANSACTION.amount, MERCHANT.name);
            } 
            else if (paymentResponse.status === STATUS.code.VIDFailure) {
                
                //var url = "signup.html?email=" + CARDHOLDER.id + "&mobile=" + CARDHOLDER.phone;
                //window.open(url, 'Security Q&A', "height=600,width=800");
                //var signupModal = document.getElementById("signupModal");
                //$(signupModal).modal({backdrop: true});
                UIUtils.hideSpinner();
                if (confirm(CARDHOLDER.id + ' has not been registered.  Would you like to signup?')) {
                //    var url = "vraysignup.html?name=" + CARDHOLDER.name + "&email=" + CARDHOLDER.id + "&mobile=" + CARDHOLDER.phone;
                //    window.open(url, 'Signup');
                    var modal = document.getElementById('signupModal');
                    modal.style.display = "block";
                } else {
                    modal.style.display = "none";
                }
            }
            else {
                window.alert ("Payment authorization rejected with status = " + 
                                paymentResponse.status.toString() + " - " +
                                UTILS.statusText(paymentResponse.status));
            }
        }
        else {
            window.alert ("ERROR - Invalid transaction ID: " + paymentResponse.tid);
        }
        
        PAYMENT.completed()
    },
    
    codeCheckChallenge  : function (codeCommand) {
             
        // Sanity Check
        if ((codeCommand === null) || (codeCommand === undefined) ||
            (codeCommand.tid === null) || (codeCommand.tid === undefined) ||
            (codeCommand.code === null) || (codeCommand.code === undefined) ||
            (codeCommand.msgId !== 5)) {
		
            window.alert("ERROR - Invalid code check parameters");
            return;
        }
        
        var tid = parseInt(codeCommand.tid);
        if (tid !== Number(TRANSACTION.id)) {
            window.alert ("ERROR - Invalid transaction ID: " + codeCommand.tid);  
            return;
        }
        
        // Prompt user to enter the code check on corresponding merchant app 
        window.alert("Security verification is required for the following reason:\n" + 
              "\t 1. New shipping address.\n" + 
              "\t 2. Puchase made from an unknow device.\n" +
              "\t 3. Failed to answer the security question. \n\n" +
              "Locate the code check feature on " + MERCHANT.name + 
              " mobile app to enter the security code:\n" +  codeCommand.code.toString());
	
        // Restart T1 Timer to allow user x2 timeout to enter the code
        TRANSACTION.t1Timer = window.setInterval(UTILS.timerHandler, 
                                                      TRANSACTION.t1Timeout.toString());    
                                                      
	// Send Code Command Verify 
	var codeCommandVerify = 
	{
            "msgId" : 19,
            "tid"   : codeCommand.tid,
            "status": 0
        };	
        
	$.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/codersp",
            contentType : "application/json",
            data        : JSON.stringify(codeCommandVerify),
            timeout     : TRANSACTION.t1Timeout,
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
              
                // Clear the transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);
                
                // Sanity check                  
                if ((result === null) || (result === undefined)) {
                    
                    window.alert("ERROR - Unexpected code command respond.\n");
                    return;
                }
                
                var codeVerify = JSON.parse(result);
                if(codeVerify.msgId === 2) {
                    
                    PAYMENT.authorizationResponse(JSON.parse(result));
                }
                else {
                    window.alert ("ERROR - Unexpected message ID = " + codeVerify.msgId.toString());
                    PAYMENT.completed();
                }
            }, // success()	
            error       : function() {
                window.alert ("ERROR - Code command respond.");
                PAYMENT.completed();
            }
        });
    }, 
    
    completed : function() {
        
        // Accounting Info
        var today = new Date();
        TRANSACTION.endTime = today.getTime();
         
        // MERCHANT Configuration
        MERCHANT.id = "";
        MERCHANT.name = "";
        
        // Billing customer information
        CARDHOLDER.id        = null;
        CARDHOLDER.name      = null;
        CARDHOLDER.phone     = null;
        CARDHOLDER.billingAddress   = null;
        CARDHOLDER.shippingAddress   = null;
        CARDHOLDER.signinAccessToken = null;
        
        // Transaction info
        TRANSACTION.id = 0; 
        TRANSACTION.idRetry = 0;
        TRANSACTION.amount = 0.0;  
        TRANSACTION.lineItems = null;
        TRANSACTION.date = null;
        TRANSACTION.startTime = 0;
        TRANSACTION.endTime = 0;
        TRANSACTION.paymentRetry = 0;
        TRANSACTION.paymentRequest = null;

        // Payment Session Timer
        window.clearTimeout(TRANSACTION.t1Timer);
        TRANSACTION.t1Timer = null;
    },
    
    create : function(amount, items) {
        
        // Sanity Check
        if ((amount === null) || (amount === undefined)) {
            window.alert("ERROR - Invalid or Expired payment authorization request.\n");
            return;
        }

        // Create new transaction                
        var today = new Date();
        TRANSACTION.date = today.toString(); 
        TRANSACTION.startTime = today.getTime();
        TRANSACTION.id = Math.floor(Math.random() * (9223372036854775807 - 11 + 1)) + 11;  // postive # 0 - 7FFF,FFFF,FFFF,FFFF
        TRANSACTION.amount = amount;  
        TRANSACTION.lineItems = items;
                                            
        // Payment Authorization Request
	    var paymentReqParam = {
            "msgId"             : MESSAGE.id.PaymentRequest,
            "tid"               : TRANSACTION.id,
            "ttime"             : TRANSACTION.date,
            "vid"               : CARDHOLDER.id,
            "shippingInfo"      : CARDHOLDER.shippingAddress,
            "amount"            : TRANSACTION.amount,
            "countryCode"       : TRANSACTION.countryCode,
            "currencyCode"      : TRANSACTION.currencyCode,
            "merchantIdentifier": MERCHANT.id,
            "merchantName"      : MERCHANT.name,
            "lineItems"         : TRANSACTION.lineItems,
            "messageAuthenticationCode": ""            
        };
       
        return JSON.stringify(paymentReqParam).toString();
    },
    
    createToken : function (token, code, status) {
       
        if(token === null) {
            window.alert("ERROR - Invalid Payment Token.\n");
            PAYMENT.completed();
            return;
        }
        
        var paymentInfo = {
            "msgId"              : MESSAGE.id.BrowserTokenIndication,
            "tid"                : TRANSACTION.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "token"              : token,
            "status"             : status,
            "authorizationCode"  : code,
            "messageAuthenticationCode" : ""
        };
        
        var  paymentInfoText =  JSON.stringify(paymentInfo).toString();
        var  hmac = calculateHMAC(paymentInfoText);
        paymentInfo.messageAuthenticationCode = UTILS.ab2hexText(hmac);
        paymentInfoText =  JSON.stringify(paymentInfo).toString();
        
        return paymentInfoText;
    },
    
    createAndSubmitToken : function (token, code, status) {
       
        if(token === null) {
            window.alert("ERROR - Invalid Payment Token.\n");
            PAYMENT.completed();
            return;
        }
        
        var paymentInfo = {
            "msgId"              : MESSAGE.id.BrowserTokenIndication,
            "tid"                : TRANSACTION.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "token"              : token,
            "status"             : status,
            "authorizationCode"  : code,
            "messageAuthenticationCode" : ""
        };
        
        var  paymentInfoText =  JSON.stringify(paymentInfo).toString();
        var  hmac = calculateHMAC(paymentInfoText);
        paymentInfo.messageAuthenticationCode = UTILS.ab2hexText(hmac);
        paymentInfoText =  JSON.stringify(paymentInfo).toString();
          
        if(UTILS.debug.enabled()) {
            window.alert("Submit token: = " + paymentInfoText + "\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/BrowserTokenIndication",
            contentType : "application/json",
            data        : paymentInfoText,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function() {
                    
                PAYMENT.completed();
            },
            error: function(){
                
                window.alert("ERROR - Token not accepted.\n");
                PAYMENT.completed();  
            }
        });
    },
    
    isValidTransaction : function (tid) {
        var valid = false;
       
        if(!tid) {
            return false;
        }
        
        var getPaymentInfo = {
            "msgId"             : MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid"               : tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/BrowserPaymentInfo",
            contentType : "application/json",
            data        : getPaymentInfoText,
            timeout     : TRANSACTION.t15Timeout, 
            dataType    : "text",
            async       : false,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                if(!result) {
                    return valid;
                }
                
                var paymentInfoRespond = JSON.parse(result);
                if (!paymentInfoRespond) { 
                    return valid;
                }
                            
                if ((paymentInfoRespond.msgId === MESSAGE.id.BrowserPaymentIndication) ||
                    (paymentInfoRespond.tid === tid)){  // Payment Authorization Response
                   valid = true;
                }
                
                return valid;
            },
            error: function(){
                return valid;
            }
        });
        
        return valid;
    },
    
    provision: function(paymentInfo) {
        
        CARDHOLDER.id = paymentInfo.vid;
        
        MERCHANT.id= paymentInfo.merchantIdentifier;
        MERCHANT.name = paymentInfo.merchantName;
        MERCHANT.capability = paymentInfo.merchantCapabilities;
        
        TRANSACTION.id = paymentInfo.tid;
        TRANSACTION.amount = paymentInfo.amount;
        TRANSACTION.countryCode = paymentInfo.countryCode;
        TRANSACTION.currencyCode = paymentInfo.currencyCode;
        TRANSACTION.startTime = paymentInfo.ttime;
        TRANSACTION.lineItems = paymentInfo.lineItems;
        TRANSACTION.tokenType = paymentInfo.paymentMethodTokenizationType;
        TRANSACTION.publicKey = paymentInfo.publicKey;
    },
    
    reAuthorizationRequest : function () {
        
        if(UTILS.debug.enabled()) {
            window.alert("Resending payment authorization request: \n\n");
        }
       
        // Retart T1 Timer
        window.clearTimeout(TRANSACTION.t1Timer);
        window.setTimeout(TRANSACTION.t1Timer, TRANSACTION.t1Timeout);
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/payrequest",
            contentType : "application/json",
            data        : TRANSACTION.paymentRequest,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null) {
                    
                    window.alert("ERROR:  Invalid payment authorization respond.\n");
                    return;
                }
                
                // Clear the transaction timer
                window.clearTimeout(TRANSACTION.t1Timer); 
                
                var messageId = paymentRespond.msgId;               
                if (messageId === MESSAGE.id.PaymentResponse) {  // Payment Authorization Response
                    
                    PAYMENT.authorizationResponse(paymentRespond);
                }
                else if (messageId === MESSAGE.id.CodeCommand) { // Security Code Check Challenge
                    
                    PAYMENT.codeCheckChallenge(paymentRespond);
                }
                else if (messageId === MESSAGE.id.SecurityQuestionRequest) { // Security Question Challenge
                    
                    PAYMENT.secretQuestionChallenge(paymentRespond);
                } 
                else {
                    PAYMENT.completed();
                    window.alert("ERROR - Unknown/Unexpected Message ID = " + messageId.toString());
                }
            },
            error: function(result){
                
                PAYMENT.completed();
                window.alert("ERROR:  Bad Re-Authorization result: \n" + result.status.toLocaleString());
            }
        });
    },
    
    retrieveToken : function (tid) {
        
        if(!tid) {
            window.alert("ERROR - Invalid transaction ID.\n");
            PAYMENT.completed();
            return;
        }
        
        var getPaymentInfo = {
            "msgId"             : MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid"               : tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/BrowserPaymentInfo",
            contentType : "application/json",
            data        : getPaymentInfoText,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                if((result === null) || (result === undefined) || (result === "")) {
                    
                    window.alert("ERROR - Invalid browser payment info.\n");
                    PAYMENT.completed();
                    return;
                }
                
                var paymentInfoRespond = JSON.parse(result);
                if (paymentInfoRespond === null) {
                         
                    window.alert("ERROR - Invalid browser payment info respond.\n");
                    PAYMENT.completed();
                    return;
                }
                
                var messageId = paymentInfoRespond.msgId;               
                if (messageId === MESSAGE.id.BrowserPaymentIndication) {  // Payment Authorization Response
                    
                    PAYMENT.provision(paymentInfoRespond);
                    
                    var token = document.getElementById('newtoken').innerHTML;
                    PAYMENT.createAndSubmitToken(token, 1, 0);
                }
                else {
                    PAYMENT.completed();
                    window.alert("ERROR - Unknown/Unexpected Message ID = " + messageId.toString());
                }
            },
            error: function(result){
                
                PAYMENT.completed();
                window.alert("ERROR - Payment Info Response result = \n" + result.toString());
            }
        });
    },
    
    secretQuestionChallenge : function (secret) {
    
        // Sanity Check
        if ((secret === null) || (secret === undefined) || 
            (secret.tid === null) || (secret.tid === undefined) || 
            (secret.vid === null) || (secret.vid === undefined) ||
            (secret.securityQ === null) || (secret.securityQ === undefined) || 
            (secret.msgId !== MESSAGE.id.SecurityQuestionRequest)) {
                            
            window.alert("ERROR - Invalid secret question challenge parameters.\n" +
                         JSON.stringify(secret).toString());
            return;
        }
            
        var tid = parseInt(secret.tid);
        if (tid !== Number(TRANSACTION.id)) {
            
            window.alert ("ERROR - Invalid transaction ID: " + secret.tid);  
            return;
        }
        
        var secretQuestion = secret.securityQ.toString();
        var secretAnswer = "";

        if(SIGNUP.signUpDone) {
            secretAnswer = CARDHOLDER.securityAnswer;
        }
        else {
            secretAnswer = window.prompt("Please answer the following security question:\n\n" + secretQuestion,
                                         "answer");
        }
	
        if (secretAnswer !== null) {
            
            // Restart T1 Timer
            TRANSACTION.t1Timer = window.setInterval(UTILS.timerHandler, 
                                                     TRANSACTION.t1Timeout.toString());
        
            var verifyAnswer = 
            {
            "msgId"     : 21,
            "tid"       : secret.tid,
            "vid"       : secret.vid,
            "securityA" : secretAnswer
            };
                        
            $.ajax({
                type        : "POST",
                url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/SecurityQuestionAnswer",
                contentType : "application/json",
                data        : JSON.stringify(verifyAnswer).toString(),
                timeout     : TRANSACTION.t1Timeout,
                dataType    : "text",
                async       : true,
                xhrFields   : { withCredentials: true },
                success     : function(result) {
			
                // Clear the transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);
                
                if ((result === null) || (result === undefined)) {
                    window.alert("ERROR - Unexpected secret answer result.");
                    return;
                }
                
                var securityAnswerRsp = JSON.parse(result);
                if(securityAnswerRsp !== null)   {
                
                    var messageId = securityAnswerRsp.msgId;
                    if (messageId === MESSAGE.id.PaymentResponse) {
                    
                        PAYMENT.authorizationResponse(securityAnswerRsp);
                    } // success()	
                    else if (messageId === MESSAGE.id.CodeCommand){
                    
                        PAYMENT.codeCheckChallenge(securityAnswerRsp);
                    }
                    else if (messageId === MESSAGE.id.SecurityQuestionRequest) {
                
                        PAYMENT.secretQuestionChallenge(securityAnswerRsp);
                    }
                    else {
                        window.alert("ERROR - Unknown message ID.");
                    }
                }
                else {
                    window.alert("ERROR - Invalid secret answer verification response.");
                }
            },   
            error   : function() {
                
                alert ("ERROR - Unable to verify security answer.");
                PAYMENT.completed();
            }});
        }
        else {
            PAYMENT.completed();
        }
    }, 
    
    vidResponse : function (vidRequest) {
    
        // Sanity Check
        if ((vidRequest === null) || (vidRequest === undefined) || 
            (vidRequest.tid === null) || (vidRequest.tid === undefined) ||
            (vidRequest.status === null) || (vidRequest.status === undefined)) {
                            
            window.alert("ERROR - Invalid secret question challenge parameters.\n" +
                         JSON.stringify(vidRequest).toString());
            return;
        }
            
        var tid = parseInt(vidRequest.tid);
        if (tid !== Number(TRANSACTION.id)) {
            
            window.alert ("ERROR - Invalid transaction ID: " + vidRequest.tid);  
            return;
        }
        
        var vid = CARDHOLDER.id;
        if (TRANSACTION.idRetry < TRANSACTION.idRetryMAX) {
            if (vidRequest.status === STATUS.code.VIDNotFound) {
                UIUtils.hideSpinner();
                var modal = document.getElementById('signupModal');
                if((modal.style.display === "") || (modal.style.display === "none")) {
                    PAYMENT.signupCalled = true;
                    if (confirm(CARDHOLDER.id + ' has not been registered. Would you like to signup?')) {
                        modal.style.display = "block";
                    } else {
                        modal.style.display = "none";
                    }
                }
            }
            else if (vidRequest.status === STATUS.code.VIDBlocked){

                vid = window.prompt("The " + vid + " has been blocked.\n\n" + 
                                    "Please use different email: \n\n");
                
                CARDHOLDER.id = vid;
            }
            else {
                window.alert ("ERROR - unknown login failure.\n");
                PAYMENT.completed();
                return;
            }
        
            TRANSACTION.idRetry += 1;

            // Restart T1 Timer
            TRANSACTION.t1Timer = window.setInterval(UTILS.timerHandler, 
                                                             TRANSACTION.t1Timeout.toString());
            var idResponse = 
            {
                "msgId"     : MESSAGE.id.VidResponse,
                "tid"       : tid,
                "vid"       : vid
            };

            $.ajax({
                type        : "POST",
                url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/VidRetry",
                contentType : "application/json",
                data        : JSON.stringify(idResponse).toString(),
                timeout     : TRANSACTION.t1Timeout,
                dataType    : "text",
                async       : true,
                xhrFields   : { withCredentials: true },
                success     : function(result) {

                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null) {

                    window.alert("ERROR:  Invalid payment authorization respond.\n");
                    return;
                }

                // Clear the T1 transaction timer
                window.clearTimeout(TRANSACTION.t1Timer); 

                var messageId = paymentRespond.msgId;
                switch (messageId) {

                    case MESSAGE.id.PaymentResponse :
                        PAYMENT.authorizationResponse(paymentRespond);
                        break;

                    case MESSAGE.id.CodeCommand :
                        PAYMENT.codeCheckChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.SecurityQuestionRequest:
                        PAYMENT.secretQuestionChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.VidRequest :
                        PAYMENT.vidResponse(paymentRespond);
                        break;

                    default :
                        PAYMENT.completed();
                        window.alert("ERROR - Unexpected Message ID = " + messageId.toString());
                        break;  
                }
            },   
            error   : function() {

                window.alert ("ERROR - Vid retry failed.\n");
                PAYMENT.completed();
            }});
        } // MAX Retry
        else {
            //var url = "signup.html?email=" + CARDHOLDER.id + "&mobile=" + CARDHOLDER.phone;
            //SIGNUP.popupWindow = window.open(url, 'Security Q&A', "height=600,width=1000");   
            //var signupModal = document.getElementById("signupModal");
            //$(signupModal).modal({backdrop: true});
            UIUtils.hideSpinner();
            if((modal.style.display === "") || (modal.style.display === "none")) {
                if(!PAYMENT.signupCalled) {
                    if (confirm(CARDHOLDER.id + ' has not been registered. Would you like to signup?')) {
                        modal.style.display = "block";
                    } else {
                        modal.style.display = "none";
                    }
                }
                else{
                    PAYMENT.signupCalled = false;
                }

            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Registration & Signup Services.
//
var SIGNUP = {
   
    popupWindow : null,

    signUpDone : false,
    
    configureSecurityQRequest : function (hmac) {
        
        // Payment Authorization Request
	    var configureSecurityQReq = {
            "msgId"              : MESSAGE.id.BrowserConfigureSecurityQReq,
            "vid"                : CARDHOLDER.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "securityQid"        : CARDHOLDER.securityQId,
            "securityA"          : CARDHOLDER.securityAnswer,
            "messageAuthenticationCode": UTILS.ab2hexText(hmac)            
        };
       
        var  configureSecurityQText =  JSON.stringify(configureSecurityQReq).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Broswer Security Question Configure Request: \n\n" + configureSecurityQText + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/accounts/BrowserConfigureSecurityQuestion",
            contentType : "application/json",
            data        : configureSecurityQText,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                
                // Clear the T1 transaction timer
                window.clearTimeout(TRANSACTION.t1Timer); 
                
                var configureSecurityQResp = JSON.parse(result);
                
                if ((configureSecurityQResp === null) || (configureSecurityQResp === undefined) ||
                    (configureSecurityQResp.msgId !== MESSAGE.id.BrowserConfigureSecurityQResp)) {
                    
                    window.alert("ERROR:  Invalid configure security question respond.\n");   
                    PAYMENT.completed();    
                    return;
                }
                
                if ((configureSecurityQResp.vid === CARDHOLDER.id) &&
                    (configureSecurityQResp.status === STATUS.code.SUCCESS)) { 
                
                    SIGNUP.phoneVerificationRequest();
                }
                else {
                    window.alert("ERROR: Signup vid = " + configureSecurityQResp.vid);
                         
                    PAYMENT.completed();    
                }               
            },
            error: function(){
                PAYMENT.completed();
            }
        });
    },
    
    configure3rdPartySigninRequest : function (signinType, accessToken) {
        
        // Payment Authorization Request
        CARDHOLDER.signinType = parseInt(signinType);
        CARDHOLDER.signinAccessToken = accessToken;
        
	var signinRequest = {
            "msgId"              : MESSAGE.id.Configure3rdPartySigninRequest,
            "vid"                : CARDHOLDER.id,
            "signinType"         : CARDHOLDER.signinType,
            "userAccessToken"    : accessToken,
            "convertFlag"        : ((signinType === 1) ? 1:0),
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""
        };
        
        var  signinRequestText =  JSON.stringify(signinRequest).toString();
        var  hmac = calculateHMAC(signinRequestText);
        signinRequest.messageAuthenticationCode = UTILS.ab2hexText(hmac);
        signinRequestText =  JSON.stringify(signinRequest).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Configure 3rd Party Sign-in: \n\n" + signinRequestText + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "api/ThirdParty/ConfigureSignin",
            contentType : "application/json",
            data        : signinRequestText,
            timeout     : TRANSACTION.t14Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                var signinResp = JSON.parse(result);
                if ((signinResp === null) || (signinResp === undefined) ||
                    (signinResp.msgId !== MESSAGE.id.Configure3rdPartySigninResponse)) {
                    
                    window.alert("ERROR:  Invalid configure 3rd party sign-in response.\n");   
                    PAYMENT.completed();    
                    return;
                }
                
                // TODO:  Remove the status == 1, invalid MAC status
                if ((signinResp.vid === CARDHOLDER.id) && 
                    (signinResp.status === STATUS.code.SUCCESS)) { 
                
                    SIGNUP.phoneVerificationRequest();
                }
                else {
                    window.alert("ERROR: Sign-in failed with status = " + signinResp.status);
                }               
            },
            error: function(result){
                window.alert("ERROR:  Configure 3rd Party Sign-in failed w/ status = " + result.status);
                PAYMENT.completed();
            }
        });
    },
    
    phoneVerificationRequest : function () {
        
        // Payment Authorization Request
	var phoneVerificationReq = {
            "msgId"         : MESSAGE.id.BrowserVerificationRequest,
            "phoneNumber"   : CARDHOLDER.phone,
            "emailAddress"  : CARDHOLDER.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""     
        };
        
        var  phoneVerificationText =  JSON.stringify(phoneVerificationReq).toString();
        var  hmac = calculateHMAC(phoneVerificationText);
        phoneVerificationReq.messageAuthenticationCode = UTILS.ab2hexText(hmac);
        phoneVerificationText =  JSON.stringify(phoneVerificationReq).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Broswer Phone Verification Request: \n\n" + phoneVerificationText + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/accounts/BrowserPhoneVerification",
            contentType : "application/json",
            data        : phoneVerificationText,
            timeout     : TRANSACTION.t15Timeout,
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                          
                if((result === null) || (result === undefined) || (result === "")) {
                    
                   window.alert("ERROR:  Phone Verification Failed.\n");
                   PAYMENT.completed();
                }
                
                var phoneVerificationResp = JSON.parse(result);
                
                if ((phoneVerificationResp === null) || (phoneVerificationResp === undefined) ||
                    (phoneVerificationResp.msgId !== MESSAGE.id.BrowserVerificationResponse)) {
                    
                    window.alert("ERROR:  Invalid phone verification respond.\n");   
                    PAYMENT.completed();    
                    return;
                }
                
                if((phoneVerificationResp.msgId !== MESSAGE.id.BrowserVerificationResponse) &&
                   (phoneVerificationResp.status === STATUS.code.SUCCESS)) {
                    
                    
                    window.alert("Sign-up successfully completed.");
                    
                    if(SIGNUP.popupWindow !== null) {
                        SIGNUP.popupWindow.close();
                    }

                    if(!SIGNUP.signUpDone) {
                        SIGNUP.signUpDone = true;
                        $('#pay-with-mobile-button').click();
                    }
                }
                else {
                    window.alert("ERROR - Signup phone verification = " + phoneVerificationResp.phoneNumber +  
                                 " failed w/ status = " + phoneVerificationResp.status);
                         
                    PAYMENT.completed();    
                }               
            },
            error: function(){
                
                var smsCode = window.prompt("Enter verification code sent to mobile#: " + CARDHOLDER.phone);
                CARDHOLDER.phoneCode = smsCode;
                SIGNUP.phoneVerificationIndication();
            }
        });
        
        window.alert("For security purpose, a 6-digit verification code will be send to: " + CARDHOLDER.phone + " ?\n");
    },
    
    phoneVerificationIndication : function () {
        
        // Payment Authorization Request
	var phoneVerificationIndication = {
            "msgId"              : MESSAGE.id.BrowserCodeIndication,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "rxCode"             : CARDHOLDER.phoneCode,
            "phoneNumber"        : CARDHOLDER.phone,
            "messageAuthenticationCode": ""     
        };
        
        var  phoneIndicationText =  JSON.stringify(phoneVerificationIndication).toString();
        var  hmac = calculateHMAC(phoneIndicationText);
        phoneVerificationIndication.messageAuthenticationCode = UTILS.ab2hexText(hmac);
        phoneIndicationText =  JSON.stringify(phoneVerificationIndication).toString();
        
        if(UTILS.debug.enabled()) {
            window.alert("Broswer Phone Code Verification: \n\n" + phoneIndicationText + "\n\n");
        }
        
        $.ajax({
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/accounts/BrowserCodeIndication",
            contentType : "application/json",
            data        : phoneIndicationText,
            timeout     : TRANSACTION.t15Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) {
                    
                var phoneVerificationResp = JSON.parse(result);
                
                if ((phoneVerificationResp === null) || (phoneVerificationResp === undefined) ||
                    (phoneVerificationResp.msgId !== MESSAGE.id.BrowserVerificationResponse)) {
                    
                    window.alert("ERROR - Invalid configure security question respond.\n");   
                    PAYMENT.completed();    
                    return;
                }
                
                // TODO:  Remove the status == 1, invalid MAC status
                if ((phoneVerificationResp.phoneNumber === CARDHOLDER.phone) && 
                    (phoneVerificationResp.status === STATUS.code.SUCCESS)) { 
                
                    window.alert("Sign-up successfully completed.");
                    
                    if(SIGNUP.popupWindow !== null) {
                        SIGNUP.popupWindow.close();
                    }

                    if(!SIGNUP.signUpDone) {
                        SIGNUP.signUpDone = true;
                        $('#pay-with-mobile-button').click();
                    }
                }
                else {
                    window.alert("ERROR - Invalid Verification Code.");
                    
                    var smsCode = window.prompt("Re-enter verification send to mobile#: " + CARDHOLDER.phone);
                    CARDHOLDER.phoneCode = smsCode;
                    SIGNUP.phoneVerificationIndication();
                }               
            },
            error: function(){
                window.alert("ERROR - Security Code Verification Failed.");
                PAYMENT.completed();
                
                if(SIGNUP.popupWindow !== null) {
                        SIGNUP.popupWindow.close();
                }
            }
        });
    }
};

////////////////////////////////////////////////////////////////////////////////
//  States and Status Code.
//
var STATUS = {

    code : {
        //
	SUCCESS : 0,
        //
        VIDFailure              : 1,
        CodeFailure             : 2,
        MerchantIDFailure       : 3,
        TokenFailure            : 4,
        UserTimeout             : 4,
        MobileFailure           : 5,
        MACVerificationFailure  : 6, 
        MobileSDKFailure        : 7,
        //
	VIDBlocked              : 11,
	VIDNotFound             : 12,
        //
        UNKNOWN : -1
   }
};

////////////////////////////////////////////////////////////////////////////////
//  Payment Session Transaction Info
//
var TRANSACTION =  {
        id              : 0,
        idRetry         : 0,
        idRetryMAX      : 1,
        amount          : 0.0,
        currencyCode    : null,
        countryCode     : null,
        t1Timer         : null,
        t1Timeout       : 300000, // msec
        t14Timeout      : 20000,
        t15Timeout      : 5000,
        startTime       : 0,
        endTime         : 0,
        paymentRetry    : 0,
        paymentRetryMAX : 2,
        date            : null,
        paymentRequest  : null,
        lineItems       : null,
        token           : "",
        tokenType       : "",
        publicKey       : "",
        MAC             : "",
                    
        duration        : function () { return (Number(TRANSACTION.endTime) - 
                                                Number(TRANSACTION.startTime));},
        init : function() {
            
            // Transaction info
            TRANSACTION.id = 0; 
            TRANSACTION.idRetry = 0;
            TRANSACTION.amount = 0.0;  
            TRANSACTION.lineItems = null;
            TRANSACTION.date = null;
            TRANSACTION.startTime = 0;
            TRANSACTION.endTime = 0;
            TRANSACTION.paymentRetry = 0;
            TRANSACTION.paymentRequest = null;

            TRANSACTION.currencyCode = "usd";
            TRANSACTION.countryCode = "US";
        }
};

////////////////////////////////////////////////////////////////////////////////
//  Utilities & Helper Services.
//
var UTILS = {
    
    ab2hexText : function (buffer) {
        
        var x = new DataView(buffer);
        var hexText = "";
                    
        for (var i=0; i < x.byteLength; i++) {
                        
            var y = x.getUint8(i).toString(16);
            var z = "0x" + y;
            var value = parseInt(z);
                        
            if( value < 16) {
                hexText  += "0";
            }
            hexText += y;
        }
        return hexText;
    },
    
    debug : {
        flag    : false,
        set     : function(state) {this.flag = state;},
        enabled : function() {return this.flag;}
    },
    
    statusText : function (status) {
                               
        switch(status) {
            case 0:
                return "OK";
            case 1:
                return "Invalid VID.";
            case 2 :
                return "Code Check Failure.";
            case 3 :
                return "Invalid Merchant ID or Unmatched MAC.";
            case 4 :
                return "User Timeout or Unable to get CC Token.";
            default:
                return "Unknown status.";	               
        }
    },
    
    timerHandler : function() {
        
        if(UTILS.debug.enabled()) {
            
            window.alert("ERROR - T1 Timer Expired.\n" + 
                             "Retry payment authorization request...\n");
        }
            
        if ((CARDHOLDER.id !== null) && (TRANSACTION.id !== 0)) {
            
            if(TRANSACTION.paymentRetry < TRANSACTION.paymentRetryMAX) {
                
                // Re-submit the payment request
                PAYMENT.reAuthorizationRequest();   
                                         
                TRANSACTION.paymentRetry++;
            }
            else {     
                if(UTILS.debug.enabled()) {
                    
                    window.alert("ERROR - Exceeded max retry of payment authorization request.\n");
                }
                PAYMENT.completed();
            }
        }
    },
    
    validPhoneNumber : function (inputtxt)  {  
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;  
        if(inputtxt.value.match(phoneno)) {
            return true;  
        }
        else {  
            alert("Invalid phone#: " + inputtxt.toString());  
            return false;  
        }  
    } 
};

//////////////////////////////////////////////////////////
// UI changes for payment transactions
/////////////////////////////////////////////////////////
var UIUtils = {

    showSpinner : function () {
        $("#waitForAuthorization").css("display", "block");
        document.getElementById('mobilepay').innerHTML='Please authorize payment from your mobile device...';
    },

    hideSpinner : function () {
        $("#waitForAuthorization").css("display", "none");
        document.getElementById('mobilepay').innerHTML='';
    }
}
