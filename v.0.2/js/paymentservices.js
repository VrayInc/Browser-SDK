/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

////////////////////////////////////////////////////////////////////////////////
//  Application Servers Instances (Assigned Statically or Dyanmically)
//
var APPSERVER = 
{
    merchantHost:
    {
        domainName: 'VRAY Live',
        domainURL: 'https://www.vraymerchant.com',

        getDomainName: function()
        {
            return APPSERVER.merchantHost.domainName;
        },

        getURL: function()
        {
            return APPSERVER.merchantHost.domainURL;
        },

        setName: function(name)
        {
            APPSERVER.merchantHost.domainName = name;
        },

        setURL: function(url)
        {
            APPSERVER.merchantHost.domainURL = url;
        }
    },

    paymentGWHost:
    {
        domainName: 'Stripe',
        domainURL: 'https://stripe.com',

        getDomainName: function()
        {
            return APPSERVER.paymentGWHost.domainName;
        },

        getURL: function()
        {
            return APPSERVER.paymentGWHost.domainURL;
        },

        setName: function(name)
        {
            APPSERVER.paymentGWHost.domainName = name;
        },

        setURL: function(url)
        {
            APPSERVER.paymentGWHost.domainURL = url;
        }
    },

    vrayHost:
    {
        domainName: 'VRAY Host',
        domainURL: 'https://vraystagingportal.azurewebsites.net',

        getDomainName: function()
        {
            return APPSERVER.vrayHost.domainName;
        },

        getDomainURL: function()
        {
            return APPSERVER.vrayHost.domainURL;
        },

        getMACKey: function()
        {
            return APPSERVER.vrayHost.macKey;
        },

        setDomainName: function(name)
        {
            APPSERVER.vrayHost.domainName = name;
        },

        setDomainURL: function(url)
        {
            APPSERVER.vrayHost.domainURL = url;
        },

        setMACKey: function(key)
        {
            APPSERVER.vrayHost.macKey = key;
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Cardholder Info & Configuration
//
var CARDHOLDER = 
{
    id                  : null,  // VID = eMail
    name                : null,
    phone               : null,
    phoneCode           : null,
    securityQId         : 0,
    securityAnswer      : null,
    signinAccessToken   : null,
    signinType          : 0,
    shippingAddress     : [null], // street, city, zip, country
    
    configure : function (id, name, phone, shippingAddress) 
    {
        // Billing customer information
        CARDHOLDER.id = id;
        CARDHOLDER.name = name;
        CARDHOLDER.phone = phone;
        CARDHOLDER.shippingAddress = shippingAddress;
    },
    
    setSecurityQA : function (securityQId, securityAnswer) 
    {
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
var MERCHANT = 
{
    id: 'merchant.com.vray.vpay',
    name: 'VRAY',
    capability: 1,
    macKey: "79aa2cd255bda022e5e0d095eaeea9442800c1fa3c74c85b2a6db2e1f988f952",

    configure: function(id, name)
    {
        MERCHANT.id = id;
        MERCHANT.name = name;
    },

    getID: function()
    {
        return MERCHANT.id;
    },

    getKey: function()
    {
        return MERCHANT.macKey;
    },

    getName: function()
    {
        return MERCHANT.name;
    },

    setID: function(id)
    {
        MERCHANT.id = id;
    },

    setKey: function(key)
    {
        MERCHANT.macKey = key;
    },

    setName: function(name)
    {
        MERCHANT.name = name;
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Messaging Services
//
var MESSAGE = 
{
    id:
    {
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
        Configure3rdPartySigninRequest     : 32,    
        Configure3rdPartySigninResponse    : 33,
        ThirdPartySigninRequest            : 34,
        ThirdPartySigninResponse           : 35,
        BrowserSignupCompleteIndication    : 36,
        StartPaymentInfoRetrieveIndication : 37,
        PaymentRequestContinueIndication   : 38
    }
};

////////////////////////////////////////////////////////////////////////////////
// Payment Processing Services.
//
var PAYMENT = 
{
    signupCalled: false,

    authorizationRequest: function(hmac)
    {

        UIUtils.showSpinner();

        // Payment Authorization Request
	var paymentReqParam = {
            "msgId"             : MESSAGE.id.PaymentRequest,
            "tid"               : TRANSACTION.id,
            "ttime"             : TRANSACTION.date,
            "vid"               : CARDHOLDER.id,
            "deviceType"        : TRANSACTION.deviceType,
            "loginStatus"       : TRANSACTION.loginStatus,
            "phoneNumber"       : CARDHOLDER.phone,
            "shippingInfo"      : CARDHOLDER.shippingAddress,
            "amount"            : TRANSACTION.amount,
            "countryCode"       : TRANSACTION.countryCode,
            "currencyCode"      : TRANSACTION.currencyCode,
            "merchantIdentifier": MERCHANT.id,
            "merchantName"      : MERCHANT.name,
            "lineItems"         : TRANSACTION.lineItems,
            "messageAuthenticationCode": UTILS.ab2hexText(hmac)            
        };
       
        var  paymentReqParamText =  JSON.stringify(paymentReqParam).toString();
        TRANSACTION.paymentRequest = paymentReqParamText;

        if (UTILS.debug.enabled())
        {
            window.alert("Payment authorization request: \n\n" + paymentReqParamText + "\n\n");
        }
        
        if(!UTILS.validVid(paymentReqParam.vid)){
            window.alert("Emaill Address is invalid\n");
        }else {
        // Start T1 Timer
        window.setTimeout(TRANSACTION.t1Timer, TRANSACTION.t1Timeout);

        $.ajax(
        {
            type: "POST",
            url: APPSERVER.vrayHost.getDomainURL() + "/api/payments/payrequest",
            contentType: "application/json",
            data: paymentReqParamText,
            timeout: TRANSACTION.t1Timeout,
            dataType: "text",
            async: true,
            xhrFields:
            {
                withCredentials: true
            },
            success: function(result)
            {
                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null)
                {
                    UTILS.errorDetected("ERROR:  Invalid payment authorization respond.\n");
                    return;
                }

                var tid = parseInt(paymentRespond.tid);
                if (tid !== Number(TRANSACTION.id))
                {
                    UTILS.errorDetected("ERROR:  Invalid transaction ID in payment authorization respond.\n");
                    return;
                }

                // Clear the T1 transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);

                var messageId = paymentRespond.msgId;
                switch (messageId)
                {
                    case MESSAGE.id.PaymentResponse:
                        PAYMENT.authorizationResponse(paymentRespond);
                        break;

                    case MESSAGE.id.CodeCommand:
                        PAYMENT.codeCheckChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.SecurityQuestionRequest:
                        PAYMENT.secretQuestionChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.VidRequest:
                        PAYMENT.vidResponse(paymentRespond);
                        break;

                    case MESSAGE.id.StartPaymentInfoRetrieveIndication:
                        PAYMENT.launchPaymentMethod(paymentRespond);
                        break;

                    default:
                        PAYMENT.completed();
                        UTILS.errorDetected("ERROR - Unknown/Unexpected Message ID = " + messageId.toString());
                        break;  
                }
            },
            error: function()
            {
                PAYMENT.completed();
            }
        });
        }
    },

    authorizationResponse: function(paymentResponse)
    {
        // Validate message
        if ((paymentResponse === undefined) || (paymentResponse === null) ||
            (paymentResponse.tid === undefined) || (paymentResponse.tid === null) ||
            (paymentResponse.token === undefined) || (paymentResponse.token === null) ||
            (paymentResponse.status === undefined) || (paymentResponse.status === null) ||
            (paymentResponse.msgId !== 2)) {
        
            UTILS.errorDetected("ERROR - Unexpected payment response parameters:\n\n" +
                         JSON.stringify(paymentResponse).toString());
            PAYMENT.completed();
            return;
        }

        var tid = parseInt(paymentResponse.tid);
        if (tid !== Number(TRANSACTION.id))
        {
            UTILS.errorDetected("ERROR - Invalid transaction ID: " + paymentResponse.tid);
            return;
        }
        
        if (paymentResponse.status === STATUS.code.SUCCESS)
        {
            var ccToken = paymentResponse.token;

            if(UTILS.debug.enabled()) 
            {
                console.log("Payment authorization accepted.\n\n" + "Credit Card Token = " + ccToken);
            }     

            // Charging payment via token
            doChargePayment(ccToken, TRANSACTION.amount, MERCHANT.name);
        }
        else if ((paymentResponse.status === STATUS.code.VIDFailure) || 
                 (paymentResponse.status === STATUS.code.PhoneVerificationTrigger))
        {
            SIGNUP.phoneVerificationRequest();
            return;
        }
        else if (paymentResponse.status === STATUS.code.InvalidPhoneNumber)
        {
            var newPhone = window.prompt("A different mobile# had been associated with " + CARDHOLDER.id +  ".\n\n" +
                                         "Please enter the mobile# associated with " + CARDHOLDER.id +  ".\n");
            CARDHOLDER.id = newPhone;
            SIGNUP.phoneVerificationRequest();
            return;
        }
        else if (paymentResponse.status === STATUS.code.Cancel) 
        {
            window.alert("User cancelled the payment.");
        }
        else 
        {
            UTILS.errorDetected("Payment authorization request failed with status = " + 
                            paymentResponse.status.toString() + " - " +
                            UTILS.statusText(paymentResponse.status));
        }
       
        PAYMENT.completed();
        return;
    },

    codeCheckChallenge: function(codeCommand)
    {
        // Sanity Check
        if ((codeCommand === null) || (codeCommand === undefined) ||
            (codeCommand.tid === null) || (codeCommand.tid === undefined) ||
            (codeCommand.code === null) || (codeCommand.code === undefined) ||
            (codeCommand.msgId !== 5)) {
            UTILS.errorDetected("ERROR - Invalid code check parameters");
            return;
        }

        var tid = parseInt(codeCommand.tid);
        if (tid !== Number(TRANSACTION.id)) {
            
            UTILS.errorDetected("ERROR - Invalid transaction ID: " + codeCommand.tid);
            return;
        }

        // Prompt user to enter the code check on corresponding merchant app 
        window.alert("Security verification is required for the following reason:\n" +
            "\t 1. New shipping address.\n" +
            "\t 2. Puchase made from an unknow device.\n" +
            "\t 3. Failed to answer the security question. \n\n" +
            "Locate the code check feature on " + MERCHANT.name +
            " mobile app to enter the security code:\n" + codeCommand.code.toString());

        // Restart T1 Timer to allow user x2 timeout to enter the code
        TRANSACTION.t1Timer = window.setInterval(UTILS.timerHandler, TRANSACTION.t1Timeout);

        // Send Code Command Verify 
        var codeCommandVerify = {
            "msgId": 19,
            "tid": codeCommand.tid,
            "status": 0
        };

        $.ajax(
        {
            type: "POST",
            url: APPSERVER.vrayHost.getDomainURL() + "/api/payments/codersp",
            contentType: "application/json",
            data: JSON.stringify(codeCommandVerify),
            timeout: TRANSACTION.t1Timeout,
            dataType: "text",
            async: true,
            xhrFields:
            {
                withCredentials: true
            },
            success: function(result)
            {
                // Clear the transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);

                // Sanity check                  
                if ((result === null) || (result === undefined)) {
                    UTILS.errorDetected("ERROR - Unexpected code command respond.\n");

                    return;
                }

                var codeVerify = JSON.parse(result);
                if (codeVerify.msgId === 2)
                {
                    PAYMENT.authorizationResponse(JSON.parse(result));
                }
                else {
                    UTILS.errorDetected("ERROR - Code Command got unexpected message ID = " + codeVerify.msgId.toString());
                    PAYMENT.completed();
                }
            }, // success()	
            error       : function() {
                UTILS.errorDetected("ERROR - Code command respond.");
                PAYMENT.completed();
            }
        });
    },

    completed: function()
    {
        UIUtils.hideSpinner();

        // MERCHANT Configuration
        //MERCHANT.id = "";
        //MERCHANT.name = "";

        // Billing customer information
        //CARDHOLDER.id = null;
        //CARDHOLDER.name = null;
        //CARDHOLDER.phone = null;
        //CARDHOLDER.billingAddress = null;
        //CARDHOLDER.shippingAddress = null;
        //CARDHOLDER.signinAccessToken = null;

		SIGNUP.phoneVerificationCounter = 0;
		
        // Transaction info
        var today = new Date();
        TRANSACTION.endTime = today.getTime();
        TRANSACTION.id = 0;
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

    create: function(amount, items)
    {
        // Sanity Check
        if ((amount === null) || (amount === undefined)) {
            UTILS.errorDetected("ERROR - Invalid or Expired payment authorization request.\n");
            return;
        }

        // Create new transaction                
        var today = new Date();
        TRANSACTION.date = today.toString();
        TRANSACTION.startTime = today.getTime();
        TRANSACTION.amount = amount;
        TRANSACTION.lineItems = items;
        TRANSACTION.id = Math.floor(Math.random() * (9223372036854775807 - 11 + 1)) + 11; // postive # 0 - 7FFF,FFFF,FFFF,FFFF

        var paymentReqParam = {
            "msgId": MESSAGE.id.PaymentRequest,
            "tid": TRANSACTION.id,
            "ttime": TRANSACTION.date,
            "vid": CARDHOLDER.id,
            "deviceType": TRANSACTION.deviceType,
            "loginStatus": TRANSACTION.loginStatus,
            "phoneNumber": CARDHOLDER.phone,
            "shippingInfo": CARDHOLDER.shippingAddress,
            "amount": TRANSACTION.amount,
            "countryCode": TRANSACTION.countryCode,
            "currencyCode": TRANSACTION.currencyCode,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "lineItems": TRANSACTION.lineItems,
            "messageAuthenticationCode": ""
        };

        return JSON.stringify(paymentReqParam).toString();
    },

    createToken: function(token, code, status)
    {
        if(token === null) {
            UTILS.errorDetected("ERROR - Invalid Payment Token.\n");
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

        var paymentInfoText = JSON.stringify(paymentInfo).toString();
        paymentInfoText = UTILS.prepForHMAC(paymentInfoText);
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com", // for hmac
            data        : paymentInfoText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                paymentInfo.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                paymentInfoText = JSON.stringify(paymentInfo).toString();
                return paymentInfoText;
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");
                PAYMENT.completed();
            }
        });
    },

    createAndSubmitToken: function(token, code, status)
    {
        if(token === null) {
            UTILS.errorDetected("ERROR - Invalid Payment Token.\n");
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

        var paymentInfoText = JSON.stringify(paymentInfo).toString();
        paymentInfoText = UTILS.prepForHMAC(paymentInfoText);
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com", // for hmac
            data        : paymentInfoText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                paymentInfo.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                paymentInfoText = JSON.stringify(paymentInfo).toString();
                
                if(UTILS.debug.enabled()) {
                    console.log("Submit token: = " + paymentInfoText + "\n");
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
                        UTILS.errorDetected("ERROR - Token not accepted.\n");
                        PAYMENT.completed();  
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");
                PAYMENT.completed();
            }
        });
    },

    getPaymentInfo: function(tid)
    {
        var valid = false;
       
        if(!tid) {
            UTILS.errorDetected("ERROR - Invalid transaction ID.\n");
            PAYMENT.completed();
            return valid;
        }

        var getPaymentInfo = {
            "msgId": MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid": tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
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
                    
                if(!result) 
                {
                    UTILS.errorDetected("ERROR - Invalid browser payment info.\n");
                    PAYMENT.completed();
                    return valid;
                }

                var paymentInfoRespond = JSON.parse(result);
                if (!paymentInfoRespond) 
                {   
                    UTILS.errorDetected("ERROR - Invalid browser payment info respond.\n");
                    PAYMENT.completed();
                    return valid;
                }

                var messageId = paymentInfoRespond.msgId;
                if (messageId === MESSAGE.id.BrowserPaymentIndication)
                { // Payment Authorization Response

                    PAYMENT.provision(paymentInfoRespond);
                    valid = true;
                }

                return valid;
            },
            error: function()
            {
                return valid;
            }
        });

        return valid;
    },

    launchPaymentMethod: function(payment)
    {
        // Check for mobile device type?
        var mobileDetect = new MobileDetect(window.navigator.userAgent);
        TRANSACTION.deviceType = (mobileDetect.mobile() ? 1 : 0);
        if(TRANSACTION.deviceType !== 1) 
        {
            console.log("INFO - Did not launch payment method for non-mobile device.");
            return;
        }

        var tid = parseInt(payment.tid);
        if (tid !== Number(TRANSACTION.id))
        {
            UTILS.errorDetected("ERROR - launchPaymentMethod() got invalid transaction ID:" + tid);
            return;
        }
        
        launchPayment();
        return;
    },

    provision(paymentInfo)
    {
        CARDHOLDER.id = paymentInfo.vid;

        MERCHANT.id = paymentInfo.merchantIdentifier;
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

    reauthorizationRequest: function()
    {
        if(UTILS.debug.enabled()) {
            console.log("Resending payment authorization request: \n\n");
        }

        // Retart T1 Timer
        window.clearTimeout(TRANSACTION.t1Timer);
        window.setTimeout(TRANSACTION.t1Timer, TRANSACTION.t1Timeout);
        
        $.ajax(
        {
            type        : "POST",
            url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/payrequest",
            contentType : "application/json",
            data        : TRANSACTION.paymentRequest,
            timeout     : TRANSACTION.t1Timeout, 
            dataType    : "text",
            async       : true,
            xhrFields   : { withCredentials: true },
            success     : function(result) 
            {
                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null) {
                    UTILS.errorDetected("ERROR:  Invalid payment authorization respond.\n");
                    return;
                }

                // Clear the transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);

                var messageId = paymentRespond.msgId;
                if (messageId === MESSAGE.id.PaymentResponse)
                { // Payment Authorization Response
                    PAYMENT.authorizationResponse(paymentRespond);
                }
                else if (messageId === MESSAGE.id.CodeCommand)
                { // Security Code Check Challenge
                    PAYMENT.codeCheckChallenge(paymentRespond);
                }
                else if (messageId === MESSAGE.id.SecurityQuestionRequest)
                { // Security Question Challenge
                    PAYMENT.secretQuestionChallenge(paymentRespond);
                }
                else
                {
                    PAYMENT.completed();
                    UTILS.errorDetected("ERROR - Unknown/Unexpected Message ID = " + messageId.toString());
                }
            },
            error: function(result)
            {
                PAYMENT.completed();
                UTILS.errorDetected("ERROR:  Bad Re-Authorization result: \n" + result.status.toLocaleString());
            }
        });
    },

    requestContinue: function()
    {
	var paymentRequestContinue = {
            "msgId"              : MESSAGE.id.PaymentRequestContinueIndication,
            "tid"                : TRANSACTION.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""
        };
        
        var paymentRequestContinueText = JSON.stringify(paymentRequestContinue).toString();
        paymentRequestContinueText = UTILS.prepForHMAC(paymentRequestContinueText); 
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com", // for hmac
            data        : paymentRequestContinueText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                paymentRequestContinue.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                paymentRequestContinueText =  JSON.stringify(paymentRequestContinue).toString();

                if(UTILS.debug.enabled()) {
                    console.log("Payment Request Continue Indication \n\n" + paymentRequestContinueText + "\n\n");
                }

                $.ajax({
                    type        : "POST",
                    url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/PaymentRequestContinueIndication",
                    contentType : "application/json",
                    data        : paymentRequestContinueText,
                    timeout     : 0, 
                    dataType    : "text",
                    async       : true,
                    xhrFields   : { withCredentials: true },
                    success     : function() {         
                        return;
                    },
                    error: function()
                    {
                        return;
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");
                PAYMENT.completed();
            }
        });
    },

    retrieveToken: function(tid)
    {
        if(!tid) {
            UTILS.errorDetected("ERROR - Invalid transaction ID.\n");
            PAYMENT.completed();
            return;
        }

        var getPaymentInfo = {
            "msgId": MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid": tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
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
                    
                    UTILS.errorDetected("ERROR - Invalid browser payment info.\n");
                    PAYMENT.completed();
                    return;
                }

                var paymentInfoRespond = JSON.parse(result);
                if (paymentInfoRespond === null) {
                         
                    UTILS.errorDetected("ERROR - Invalid browser payment info respond.\n");
                    PAYMENT.completed();
                    return;
                }

                var messageId = paymentInfoRespond.msgId;
                if (messageId === MESSAGE.id.BrowserPaymentIndication)
                { // Payment Authorization Response

                    PAYMENT.provision(paymentInfoRespond);

                    var token = document.getElementById('newtoken').innerHTML;
                    PAYMENT.createAndSubmitToken(token, 1, 0);
                }
                else
                {
                    PAYMENT.completed();
                    UTILS.errorDetected("ERROR - Receive unexpected message ID = " + messageId.toString());
                }
            },
            error: function(result)
            {

                PAYMENT.completed();
                UTILS.errorDetecteds("ERROR - Payment Info Response result = \n" + result.toString());
            }
        });
    },

    retrieveFakeToken: function(tid)
    {
        if(!tid) {
            UTILS.errorDetected("ERROR - Invalid transaction ID.\n");
            PAYMENT.completed();
            return;
        }

        var getPaymentInfo = {
            "msgId": MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid": tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
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
                    
                    UTILS.errorDetected("ERROR - Invalid browser payment info.\n");
                    PAYMENT.completed();
                    return;
                }

                var paymentInfoRespond = JSON.parse(result);
                if (paymentInfoRespond === null) {
                         
                    UTILS.errorDetected("ERROR - Invalid browser payment info respond.\n");
                    PAYMENT.completed();
                    return;
                }

                var messageId = paymentInfoRespond.msgId;
                if (messageId === MESSAGE.id.BrowserPaymentIndication)
                { // Payment Authorization Response

                    PAYMENT.provision(paymentInfoRespond);

                    var token = document.getElementById('newtoken').innerHTML;
                    PAYMENT.createAndSubmitToken(token, 1, Status.code.Cancel);
                }
                else
                {
                    PAYMENT.completed();
                    UTILS.errorDetected("ERROR - Receive unexpected message ID = " + messageId.toString());
                }
            },
            error: function(result)
            {

                PAYMENT.completed();
                UTILS.errorDetecteds("ERROR - Payment Info Response result = \n" + result.toString());
            }
        });
    },
    
    retrieveFailureToken: function(tid)
    {
        if(!tid) {
            UTILS.errorDetected("ERROR - Invalid transaction ID.\n");
            PAYMENT.completed();
            return;
        }

        var getPaymentInfo = {
            "msgId": MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid": tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
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
                    
                    UTILS.errorDetected("ERROR - Invalid browser payment info.\n");
                    PAYMENT.completed();
                    return;
                }

                var paymentInfoRespond = JSON.parse(result);
                if (paymentInfoRespond === null) {
                         
                    UTILS.errorDetected("ERROR - Invalid browser payment info respond.\n");
                    PAYMENT.completed();
                    return;
                }

                var messageId = paymentInfoRespond.msgId;
                if (messageId === MESSAGE.id.BrowserPaymentIndication)
                { // Payment Authorization Response

                    PAYMENT.provision(paymentInfoRespond);

                    var token = document.getElementById('newtoken').innerHTML;
                    PAYMENT.createAndSubmitToken(token, 1, Status.code.TokenFailure);
                }
                else
                {
                    PAYMENT.completed();
                    UTILS.errorDetected("ERROR - Receive unexpected message ID = " + messageId.toString());
                }
            },
            error: function(result)
            {

                PAYMENT.completed();
                UTILS.errorDetecteds("ERROR - Payment Info Response result = \n" + result.toString());
            }
        });
    },
    
    secretQuestionChallenge: function(secret)
    {
        // Sanity Check
        if ((secret === null) || (secret === undefined) ||
            (secret.tid === null) || (secret.tid === undefined) ||
            (secret.vid === null) || (secret.vid === undefined) ||
            (secret.securityQ === null) || (secret.securityQ === undefined) || 
            (secret.msgId !== MESSAGE.id.SecurityQuestionRequest)) {
                            
            UTILS.errorDetected("ERROR - Invalid secret question challenge parameters.\n" +
                                JSON.stringify(secret).toString());
            return;
        }

        var tid = parseInt(secret.tid);
        if (tid !== Number(TRANSACTION.id)) {
            
            UTILS.errorDetected("ERROR - Invalid transaction ID: " + secret.tid);  
            return;
        }

        var secretQuestion = secret.securityQ.toString();
        var secretAnswer = "";

        if (SIGNUP.signUpDone)
        {
            secretAnswer = CARDHOLDER.securityAnswer;
        }
        else
        {
            secretAnswer = window.prompt("Please answer the following security question:\n\n" + secretQuestion,
                "answer");
        }

        if (secretAnswer !== null)
        {
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
                success     : function(result) 
                {
                    // Clear the transaction timer
                    window.clearTimeout(TRANSACTION.t1Timer);

                    if ((result === null) || (result === undefined)) {
                        UTILS.errorDetected("ERROR - Unexpected secret answer result.");
                        return;
                    }

                    var securityAnswerRsp = JSON.parse(result);
                    if(securityAnswerRsp !== null)   
                    {
                        var messageId = securityAnswerRsp.msgId;
                        if (messageId === MESSAGE.id.PaymentResponse) {

                            PAYMENT.authorizationResponse(securityAnswerRsp);
                        } // success()	
                        else if (messageId === MESSAGE.id.CodeCommand){

                            PAYMENT.codeCheckChallenge(securityAnswerRsp);
                        }
                        else if (messageId === MESSAGE.id.SecurityQuestionRequest)
                        {
                            PAYMENT.secretQuestionChallenge(securityAnswerRsp);
                        }
                        else if (messageId === MESSAGE.id.StartPaymentInfoRetrieveIndication)
                        {
                            PAYMENT.launchPaymentMethod(securityAnswerRsp);
                        }
                        else
                        {
                            UTILS.errorDetected("ERROR - unexpected message ID:" + messageId);
                        }
                    }
                    else {
                        UTILS.errorDetected("ERROR - unexpected message ID:" + messageId);
                    }
                },
                error: function()
                {
                    alert("ERROR - Unable to verify security answer.");
                    PAYMENT.completed();
                }
            });
        }
        else
        {
            PAYMENT.completed();
        }
    },

    validateTransaction: function(tid)
    {
        var valid = false;

        if (!tid)
        {
            return false;
        }

        var getPaymentInfo = {
            "msgId": MESSAGE.id.BroswerRetrievePaymentInfo,
            "tid": tid
        };
       
        var  getPaymentInfoText =  JSON.stringify(getPaymentInfo).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Retrieving payment information for transaction = " + tid.toString() + "\n\n");
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
            success     : function(result) 
            {
                if(!result) 
                {
                    return valid;
                }
                
                var paymentInfoRespond = JSON.parse(result);
                if (!paymentInfoRespond) 
                { 
                    return valid;
                }
                            
                if (paymentInfoRespond.msgId === MESSAGE.id.BrowserPaymentIndication) 
                {
					valid = true;
					PAYMENT.provision(paymentInfoRespond);
					PAYMENT.requestContinue(); 
                }
                
                return valid;
            },
            error: function(){
                return valid;
            }
        });
        
        return valid;
    },

    vidResponse: function(vidRequest)
    {
        // Sanity Check
        if ((vidRequest === null) || (vidRequest === undefined) ||
            (vidRequest.tid === null) || (vidRequest.tid === undefined) ||
            (vidRequest.status === null) || (vidRequest.status === undefined)) {
                            
            UTILS.errorDetected("ERROR - Invalid secret question challenge parameters.\n" +
                                 JSON.stringify(vidRequest).toString());
            return;
        }

        var tid = parseInt(vidRequest.tid);
        if (tid !== Number(TRANSACTION.id)) {
            
            UTILS.errorDetected("ERROR - Invalid transaction ID: " + vidRequest.tid);  
            return;
        }

        var vid = CARDHOLDER.id;
        
        if (vidRequest.status === STATUS.code.VIDNotFound)
        {
            UIUtils.hideSpinner();
        }
        else if (vidRequest.status === STATUS.code.VIDBlocked)
        {
            vid = window.prompt("The " + vid + " has been blocked.\n\n" +
                "Please use different email: \n\n");
            CARDHOLDER.id = vid;
        }
        else if (vidRequest.status === STATUS.code.AnotherVID)
        {
            window.alert("Another email, " + vidRequest.anotherEmail + ", had been associated with mobile# " + CARDHOLDER.phone + "\n\n" +
                "Click OK to continue.\n\n");
            vid = vidRequest.anotherEmail;
            CARDHOLDER.id = vid;
        }
        else
        {
            UTILS.errorDetected("ERROR - Unknown login failure.\n");
            PAYMENT.completed();
            return;
        }

        // Restart T1 Timer
        TRANSACTION.t1Timer = window.setInterval(UTILS.timerHandler, TRANSACTION.t1Timeout);
        var idResponse = {
            "msgId": MESSAGE.id.VidResponse,
            "tid": tid,
            "vid": vid
        };

        $.ajax(
        {
            type: "POST",
            url: APPSERVER.vrayHost.getDomainURL() + "/api/payments/VidRetry",
            contentType: "application/json",
            data: JSON.stringify(idResponse).toString(),
            timeout: TRANSACTION.t1Timeout,
            dataType: "text",
            async: true,
            xhrFields:
            {
                withCredentials: true
            },
            success: function(result)
            {
                var paymentRespond = JSON.parse(result);
                if (paymentRespond === null) {

                    UTILS.errorDetected("ERROR:  Invalid vid retry respond.\n");
                    return;
                }

                // Clear the T1 transaction timer
                window.clearTimeout(TRANSACTION.t1Timer);

                var messageId = paymentRespond.msgId;
                switch (messageId)
                {
                    case MESSAGE.id.PaymentResponse:
                        PAYMENT.authorizationResponse(paymentRespond);
                        break;

                    case MESSAGE.id.CodeCommand:
                        PAYMENT.codeCheckChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.SecurityQuestionRequest:
                        PAYMENT.secretQuestionChallenge(paymentRespond);
                        break;

                    case MESSAGE.id.VidRequest:
                        PAYMENT.vidResponse(paymentRespond);
                        break;

                    default:
                        PAYMENT.completed();
                        UTILS.errorDetected("ERROR - Unexpected Message ID = " + messageId.toString());
                        break;  
                }
            },   
            error   : function() {

                UTILS.errorDetected("ERROR - Vid retry failed.\n");
                PAYMENT.completed();
            }
        });
    }
};

////////////////////////////////////////////////////////////////////////////////
//  Registration & Singup Services.
///////////////////////////////////////////////////////////////////////////////
var SIGNUP = 
{
    popupWindow: null,

    signUpDone: false,

    phoneVerificationCounter : 0,
	
    browserSignupComplete: function()
    {
	var signupComplete = {
            "msgId"              : MESSAGE.id.BrowserSignupCompleteIndication,
            "tid"                : TRANSACTION.id,
            "vid"                : CARDHOLDER.id,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var signupCompleteText = JSON.stringify(signupComplete).toString();
        signupCompleteText = UTILS.prepForHMAC(signupCompleteText); 
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : signupCompleteText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                signupComplete.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                signupCompleteText =  JSON.stringify(signupComplete).toString();

                if(UTILS.debug.enabled()) {
                    console.log("Browser Signup Completed Indication \n\n" + signupCompleteText + "\n\n");
                }

                $.ajax({
                    type        : "POST",
                    url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/BrowserSignupCompleteIndication",
                    contentType : "application/json",
                    data        : signupCompleteText,
                    timeout     : TRANSACTION.t1Timeout, 
                    dataType    : "text",
                    async       : true,
                    xhrFields   : { withCredentials: true },
                    success     : function(result) { 

                        // From 9, step 150b. Start Payment Info Indication(tid, vid)
                        var startPaymentInfoRetrieveInd = JSON.parse(result);
                        if (!startPaymentInfoRetrieveInd)
                        {
                            UTILS.errorDetected("ERROR - Unexpected start payment info indication.\n");  
                            PAYMENT.completed();    
                            return;
                        }

                        if (startPaymentInfoRetrieveInd.msgId === MESSAGE.id.StartPaymentInfoRetrieveIndication)
                        {
                            PAYMENT.launchPaymentMethod(startPaymentInfoRetrieveInd);
                        }
                        else if (startPaymentInfoRetrieveInd.msgId === MESSAGE.id.PaymentResponse)
                        {
                            PAYMENT.authorizationResponse(startPaymentInfoRetrieveInd);
                        }
                        else {
                            UTILS.errorDetected("ERROR - Unexpected browser signup complete response.\n");  
                            PAYMENT.completed();    
                        }
                    },
                    error: function()
                    {
                        UTILS.errorDetected("ERROR - Unexpected browser signup complete indication.\n");  
                        PAYMENT.completed();    
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");  
                PAYMENT.completed();    
            }
        });
    },

    configureSecurityQRequest: function(hmac)
    {
        // Configure Security Request
        var configureSecurityQReq = {
            "msgId": MESSAGE.id.BrowserConfigureSecurityQReq,
            "vid": CARDHOLDER.id,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "securityQid": CARDHOLDER.securityQId,
            "securityA": CARDHOLDER.securityAnswer,
            "messageAuthenticationCode": UTILS.ab2hexText(hmac)
        };
       
        var  configureSecurityQText =  JSON.stringify(configureSecurityQReq).toString();
        
        if(UTILS.debug.enabled()) {
            console.log("Broswer Security Question Configure Request: \n\n" + configureSecurityQText + "\n\n");
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
                    
                    UTILS.errorDetected("ERROR:  Invalid configure security question respond.\n");   
                    PAYMENT.completed();    
                    return;
                }

                if ((configureSecurityQResp.vid === CARDHOLDER.id) &&
                    (configureSecurityQResp.status === STATUS.code.SUCCESS))
                {
                    SIGNUP.phoneVerificationRequest();
                }
                else {
                    UTILS.errorDetected("ERROR: Signup vid = " + configureSecurityQResp.vid);
                         
                    PAYMENT.completed();    
                }               
            },
            error: function()
            {
                PAYMENT.completed();
            }
        });
    },

    configure3rdPartySigninRequest: function(signinType, accessToken)
    {

        // Payment Authorization Request
        CARDHOLDER.signinType = parseInt(signinType);
        CARDHOLDER.signinAccessToken = accessToken;

        var signinRequest = {
            "msgId": MESSAGE.id.Configure3rdPartySigninRequest,
            "vid": CARDHOLDER.id,
            "signinType": CARDHOLDER.signinType,
            "userAccessToken": accessToken,
            "convertFlag": ((signinType === 1) ? 1 : 0),
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var signinRequestText = JSON.stringify(signinRequest).toString();
        signinRequestText = UTILS.prepForHMAC(signinRequestText); 
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : signinRequestText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                signinRequest.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                signinRequestText =  JSON.stringify(signinRequest).toString();

                if(UTILS.debug.enabled()) {
                    console.log("Configure 3rd Party Sign-in: \n\n" + signinRequestText + "\n\n");
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
                        if ((signinResp === null) || (signinResp === undefined) ||WWW
                            (signinResp.msgId !== MESSAGE.id.Configure3rdPartySigninResponse)) {

                            UTILS.errorDetected("ERROR:  Invalid configure 3rd party sign-in response.\n");   
                            PAYMENT.completed();    
                            return;
                        }

                        // TODO:  Remove the status == 1, invalid MAC status
                        if ((signinResp.vid === CARDHOLDER.id) &&
                            (signinResp.status === STATUS.code.SUCCESS))
                        {

                            SIGNUP.phoneVerificationRequest();
                        }
                        else {
                            UTILS.errorDetected("ERROR: Sign-in failed with status = " + signinResp.status);
                        }               
                    },
                    error: function(result){
                        UTILS.errorDetected("ERROR:  Configure 3rd Party Sign-in failed w/ status = " + result.status);
                        PAYMENT.completed();
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");  
                PAYMENT.completed();   
            }
        });
    },

    phoneVerificationRequest: function()
    {
        // Phone Verification Request
        var phoneVerificationReq = {
            "msgId": MESSAGE.id.BrowserVerificationRequest,
            "phoneNumber": CARDHOLDER.phone,
            "emailAddress": CARDHOLDER.id,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var phoneVerificationText = JSON.stringify(phoneVerificationReq).toString();
        phoneVerificationText = UTILS.prepForHMAC(phoneVerificationText);
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : phoneVerificationText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                phoneVerificationReq.messageAuthenticationCode = UTILS.ab2hexText(hmac);       
                phoneVerificationText = JSON.stringify(phoneVerificationReq).toString();

                if (UTILS.debug.enabled())
                {
                    console.log("Broswer Phone Verification Request: \n\n" + phoneVerificationText + "\n\n");
                }

                $.ajax(
                {
                    type: "POST",
                    url: APPSERVER.vrayHost.getDomainURL() + "/api/accounts/BrowserPhoneVerification",
                    contentType: "application/json",
                    data: phoneVerificationText,
                    timeout: TRANSACTION.t15Timeout,
                    dataType: "text",
                    async: true,
                    xhrFields:
                    {
                        withCredentials: true
                    },
                    success: function(result)
                    {  
                        if ((result === null) || (result === undefined) || (result === ""))
                        {
                            UTILS.errorDetected("ERROR:  Phone Verification Failed.\n");
                            PAYMENT.completed();
                        }

                        var phoneVerificationResp = JSON.parse(result);

                        if ((phoneVerificationResp === null) || (phoneVerificationResp === undefined) ||
                            (phoneVerificationResp.msgId !== MESSAGE.id.BrowserVerificationResponse)) {

                            UTILS.errorDetected("ERROR:  Invalid phone verification respond.\n");   
                            PAYMENT.completed();    
                            return;
                        }

                        if (phoneVerificationResp.status === STATUS.code.SUCCESS)
                        {
                            SIGNUP.browserSignupComplete();
                        }
                        else if (phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber)
                        {
                            var newPhone = window.prompt("A different mobile# had been associated with " + CARDHOLDER.id +  ".\n\n" +
                                                         "Please enter the mobile# associated with " + CARDHOLDER.id +  ".\n");
                            CARDHOLDER.id = newPhone;
                            SIGNUP.phoneVerificationRequest();
                            return;
                        }
                        else if(phoneVerificationResp.status === STATUS.code.PhoneNumberVerificationFailure) {

                            if(SIGNUP.phoneVerificationCounter < 2) {

                                    SIGNUP.phoneVerificationCounter += 1;

                                    var smsCode = window.prompt("Re-enter the 6-digit verification code sent to mobile#: " + CARDHOLDER.phone);
                                    CARDHOLDER.phoneCode = smsCode;
                                    SIGNUP.phoneVerificationIndication();
                            }
                            else {
                                    window.alert("Phone verification failed.\n");
                                    PAYMENT.completed();
                            }
                        }
                        else if(phoneVerificationResp.status === STATUS.code.NumberAlreadyRegistered) {
                                window.alert("Phone already registered.\n" + 
                                                         "Please check your mobile phone for payment notification.");
                        }

                        else if(phoneVerificationResp.status === STATUS.code.BrowserCodeCheck) {
                                UTILS.errorDetected("ERROR - Unsupported browser code check.");
                                PAYMENT.completed();
                        }
                        else
                        {
                            UTILS.errorDetected("ERROR - Signup phone verification = " + phoneVerificationResp.phoneNumber +
                                " failed w/ status = " + phoneVerificationResp.status);

                            PAYMENT.completed();
                        }
                    },
                    error: function()
                    {
                        CARDHOLDER.phoneCode = window.prompt("Enter the 6-digit verification code sent to mobile#: " + CARDHOLDER.phone);
                        SIGNUP.phoneVerificationIndication();
                    }
                });

                window.alert("For security purpose, a 6-digit verification code will be sent to mobile#: " + CARDHOLDER.phone + "\n");
    
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");  
                PAYMENT.completed();   
            }
        });
    },

    phoneVerificationIndication: function()
    { 
        var phoneVerificationIndication = {
            "msgId": MESSAGE.id.BrowserCodeIndication,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "rxCode": CARDHOLDER.phoneCode,
            "phoneNumber": CARDHOLDER.phone,
			"emailAddress": CARDHOLDER.id,
            "messageAuthenticationCode": ""
        };

        var phoneIndicationText = JSON.stringify(phoneVerificationIndication).toString();
        phoneIndicationText = UTILS.prepForHMAC(phoneIndicationText);
         $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com", // for hmac
            data        : phoneIndicationText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                phoneVerificationIndication.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                phoneIndicationText =  JSON.stringify(phoneVerificationIndication).toString();

                if(UTILS.debug.enabled()) {
                    console.log("Broswer Phone Code Verification: \n\n" + phoneIndicationText + "\n\n");
                }

                $.ajax(
                {
                    type: "POST",
                    url: APPSERVER.vrayHost.getDomainURL() + "/api/accounts/BrowserCodeIndication",
                    contentType: "application/json",
                    data: phoneIndicationText,
                    timeout: TRANSACTION.t15Timeout,
                    dataType: "text",
                    async: true,
                    xhrFields:
                    {
                        withCredentials: true
                    },
                    success: function(result)
                    {
                        var phoneVerificationResp = JSON.parse(result);

                        if ((phoneVerificationResp === null) || (phoneVerificationResp === undefined) ||
                            (phoneVerificationResp.msgId !== MESSAGE.id.BrowserVerificationResponse))
                        {
                            UTILS.errorDetected("ERROR - Invalid configure security question respond.\n");  
                            PAYMENT.completed();    
                            return;
                        }

                        if(phoneVerificationResp.status === STATUS.code.SUCCESS)
                        {
                            window.alert("Phone verification completed.\n" + 
                                         "Please check your mobile phone for payment notification.");

                            SIGNUP.browserSignupComplete();
                        }
                        else if (phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber)
                        {
                            var newPhone = window.prompt("A different mobile# had been associated with " + CARDHOLDER.id +  ".\n\n" +
                                                         "Please enter the mobile# associated with " + CARDHOLDER.id +  ".\n");
                            CARDHOLDER.id = newPhone;
                            SIGNUP.phoneVerificationRequest();
                            return;
                        }
                        else if(phoneVerificationResp.status === STATUS.code.PhoneNumberVerificationFailure) {

                            if(SIGNUP.phoneVerificationCounter < 2) {

                                    SIGNUP.phoneVerificationCounter += 1;

                                    var smsCode = window.prompt("Re-enter the 6-digit verification code sent to mobile#: " + CARDHOLDER.phone);
                                    CARDHOLDER.phoneCode = smsCode;
                                    SIGNUP.phoneVerificationIndication();
                            }
                            else {
                                    window.alert("Phone verification failed.\n");
                                    PAYMENT.completed();
                            }
                        }
                        else if(phoneVerificationResp.status === STATUS.code.NumberAlreadyRegistered) {
                                window.alert("Phone already registered.\n" + 
                                                         "Please check your mobile phone for payment notification.");
                        }

                        else if(phoneVerificationResp.status === STATUS.code.BrowserCodeCheck) {
                                UTILS.errorDetected("ERROR - Unsupported browser code check.");
                                PAYMENT.completed();
                        }
                        else
                        {
                            UTILS.errorDetected("ERROR - Unknown phone verification status.");
							PAYMENT.completed();
                        }
                    },
                    error: function(){
                        UTILS.errorDetected("ERROR - Security code verification failed.");
                        PAYMENT.completed();
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");  
                PAYMENT.completed();   
            }
        });
    }
};

////////////////////////////////////////////////////////////////////////////////
//  States and Status Code.
//
var STATUS = 
{
    code:
    {
        //
	SUCCESS 		: 0,
        //
        VIDFailure              : 1,
        CodeFailure             : 2,
        MerchantIDFailure       : 3,
        TokenFailure            : 4,
        UserTimeout             : 4,
        MobileFailure           : 5,
        MACVerificationFailure  : 6, 
        MobileSDKFailure        : 7,
        Cancel                  : 8,
        InvalidPhoneNumber      : 9,
        PhoneVerificationTrigger: 10,
        //
	    VIDBlocked              : 11,
	    VIDNotFound             : 12,
        AnotherVID              : 13,
        //
	    PhoneNumberVerificationFailure : 22, 
	    NumberAlreadyRegistered: 23,
	    InvalidPhoneNumber: 24,
	    BrowserCodeCheck: 25,

        UNKNOWN : -1
   }
};

////////////////////////////////////////////////////////////////////////////////
//  Payment Session Transaction Info
//
var TRANSACTION =  
{
        amount          : 0.0,
        currencyCode    : null,
        countryCode     : null,
        date            : null,
        deviceType      : 0,     // Desktop/Laptop = 0, Mobile Phone/Tablet = 1
        endTime         : 0,
        id              : 0,
        idRetry         : 0,
        idRetryMAX      : 1,
        lineItems       : null,
        loginStatus     : 1,     // Logged into merchant account = NO = 1
        t1Timer         : null,
        t1Timeout       : 300000, // msec
        t14Timeout      : 20000,
        t15Timeout      : 5000,
        paymentRetry    : 0,
        paymentRetryMAX : 2,
        paymentRequest  : null,
        publicKey       : "",
        startTime       : 0,
        token           : "",
        tokenType       : "",
        //
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
var UTILS = 
{
    ab2hexText : function (buffer) {
        return buffer;
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
                return "Invalid ID.";
            case 2:
                return "Incorrect Code Check.";
            case 3:
                return "Invalid Merchant ID.";
            case 4:
                return "Transaction Timed Out.";
            case 5:
                return "Mobile App Failure.";
            case 6:
                return "Browser SDK Unmatched MAC failure.";
            case 7:   
                return "Mobile SDK Unmatched MAC failure.";
            case 8:
                return "User cancelled payment request.";
            case 9:
                return "Invalid phone number.";
            case 10:
                return "Phone verification process initiated.";
            case 11:
                return "VID got blocked.";
            case 12:
                return "VID not found.";
            case 13:
                return "Another VID is used for the same mobile#.";
            default:
                return status.toString() + " - Unknown";
        }
    },
    
    timerHandler : function() 
    {
        if(UTILS.debug.enabled()) {
            
            UTILS.errorDetected("ERROR - T1 Timer Expired.\n" + 
                                "Retry payment authorization request...\n");
        }

        if ((CARDHOLDER.id !== null) && (TRANSACTION.id !== 0))
        {

            if (TRANSACTION.paymentRetry < TRANSACTION.paymentRetryMAX)
            {

                // Re-submit the payment request
                PAYMENT.reauthorizationRequest();

                TRANSACTION.paymentRetry++;
            }
            else {     
                if(UTILS.debug.enabled()) {
                    
                    UTILS.errorDetected("ERROR - Exceeded max retry of payment authorization request.\n");
                }
                PAYMENT.completed();
            }
        }
    },

    validPhoneNumber: function(inputtxt)
    {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (inputtxt.value.match(phoneno))
        {
            return true;
        }
        else {  
            UTILS.errorDetected("Invalid phone#: " + inputtxt.toString());  
            return false;  
        }  
    },

    validVid: function(inputtxt)
    {
        var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
        return re.test(input);
    },
    
    errorDetected: function(error) {
        if(UTILS.debug.enabled()) {
            CALLBACK.call(error);
        }
        else {
            CALLBACK.call("Payment failed");
        }
    },

    prepForHMAC: function(message, cond) {
        payVal = (cond) ? "yes" : "no";
        var obj = {
            "val" : message,
            "pay" : payVal,
            "merchantId" : MERCHANT.id       
        };
        return JSON.stringify(obj); 
    }
};

//////////////////////////////////////////////////////////
// UI changes for payment transactions
/////////////////////////////////////////////////////////
var UIUtils = {
    showSpinner : function () {
        document.getElementById('waitForAuthorization').style.display = "block";
        document.getElementById('mobilepay').innerHTML='Please authorize payment from your mobile device...';
    },

    hideSpinner : function () {
        document.getElementById('waitForAuthorization').style.display = "none";
        document.getElementById('mobilepay').innerHTML='';
    }
};

/////////////////////////////////////////////////////////
// CALLBACK once payment is done
////////////////////////////////////////////////////////
var CALLBACK = 
{
    callback: null,
    
    call: function(error) {
        if(!CALLBACK.callback) {
            console.log("Invalid callback function!");
        }
        else {
            CALLBACK.callback(error);
        }
    }
};
