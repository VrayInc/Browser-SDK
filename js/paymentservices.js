/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

////////////////////////////////////////////////////////////////////////////////
//  Application Servers Instances (Assigned Statically or Dyanmically)
//
console.log("APP INIT");
var APPSERVER = 
{
    merchantHost:
    {
        domainName: 'VRAYLive',
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
        domainName: 'VRAYHost',
        domainURL: 'https://vraystagingportal.azurewebsites.net',

        getDomainName: function()
        {
            return APPSERVER.vrayHost.domainName;
        },

        getDomainURL: function()
        {
            return APPSERVER.vrayHost.domainURL;
        },

        setDomainName: function(name)
        {
            APPSERVER.vrayHost.domainName = name;
        },

        setDomainURL: function(url)
        {
            APPSERVER.vrayHost.domainURL = url;
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
    shippingAddress     : [null], // address: street, city, zip, country
    shippingHistory     : [[null, null, null, null], [null, null, null, null]], // shipping 
    shippingHistoryCallBack :
    {
        callback: null,

        call: function(result) 
        {
            if(!CARDHOLDER.shippingHistoryCallBack.callback) {
                console.log("Invalid shipping history callback function.");
            }
            else {
                CARDHOLDER.shippingHistoryCallBack.callback(result);
            }
        }
    },
    
    configure : function (vid, name, mobile, shippingAddress) 
    {
        // Billing customer information
        CARDHOLDER.id = vid;
        CARDHOLDER.name = name;
        CARDHOLDER.phone = mobile;
        CARDHOLDER.shippingAddress = shippingAddress;
    },
    
    emailChange: function(anotherVid)
    {
        var emailChangeReq = {
            "msgId"              : MESSAGE.id.PrePaymentRequest,
            "tid"                : TRANSACTION.id,
            "oldVid"             : anotherVid,
            "newVid"             : CARDHOLDER.id,
            "phoneNumber"        : CARDHOLDER.phone,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var emailChangeReqText = JSON.stringify(emailChangeReq).toString();
        prePaymentText = UTILS.prepForHMAC(emailChangeReqText); 
        
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : prePaymentText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                
                emailChangeReq.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                emailChangeReqText =  JSON.stringify(emailChangeReq).toString();

                if(UTILS.debug.enabled()) {
                    console.log("Email Change Request: " + prePaymentText + "\n\n");
                }

                $.ajax({
                    type        : "POST",
                    url         : APPSERVER.vrayHost.getDomainURL() + "/api/accounts/EmailChange",
                    contentType : "application/json",
                    data        : emailChangeReqText,
                    timeout     : TRANSACTION.t1Timeout, 
                    dataType    : "text",
                    async       : true,
                    xhrFields   : { withCredentials: true },
                    success     : function(result) { 

                        // From 9, step 150b. Start Payment Info Indication(tid, vid)
                        var emailChangeResp = JSON.parse(result);
                        if (!emailChangeResp)
                        {
                            UTILS.errorDetected("ERROR - Unexpected email change response.\n" + emailChangeResp.toString());  
                            PAYMENT.completed();    
                            return;
                        }

                        if (emailChangeResp.msgId !== MESSAGE.id.EmailChangeResponse)
                        {
                            UTILS.errorDetected("ERROR - Unexpected email change response.\n" + emailChangeResp.toString());   
                            return;
                        }
                        
                        if(emailChangeResp.status === STATUS.code.SUCCESS) 
                        {
                            UTILS.errorDetected("INFO - Email Change completed.");  
                        }
                        else if ((emailChangeResp.status === STATUS.code.MACVerificationFailure) ||
                                 (emailChangeResp.status === STATUS.code.VIDFailure))
                        {
                            UTILS.errorDetected("ERROR - Email Change failed: " + emailChangeResp.status.toString());  
           
                        }
                        else {
                            UTILS.errorDetected("ERROR - Email Change failed w/ unknown reason: "); 
                        }
                    },
                    error: function()
                    {
                        UTILS.errorDetected("ERROR - Unexpected email change response.\n");  
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");    
            }
        });
    },
    
    getShippingHistory(vid, mobile, historyCallBack)
    {   
        if(!vid || !mobile || !historyCallBack) 
        {
            UTILS.errorDetected("ERROR - Invalid parameters for getShippingHistory(email, mobile, callback)");              
            return; 
        }
            
        CARDHOLDER.shippingHistoryCallBack.callback = historyCallBack;
        
        CARDHOLDER.prePaymentRequest(vid, mobile);  
    },
    
    prePaymentRequest : function(vid, mobile)
    {
        if(!vid || !mobile) {
            UTILS.errorDetected("ERROR - Unexpected vid or mobile for pre-payment request.\n");    
            return;
        }
        
        CARDHOLDER.id = vid;
        CARDHOLDER.phone = mobile;
        
        var today = new Date();
        TRANSACTION.date = today.toString();
        TRANSACTION.startTime = today.getTime();
        TRANSACTION.id = Math.floor(Math.random() * (9223372036854775807 - 11 + 1)) + 11; // postive # 0 - 7FFF,FFFF,FFFF,FFFF

    var prePayment = {
            "msgId"              : MESSAGE.id.PrePaymentRequest,
            "tid"                : TRANSACTION.id,
            "vid"                : vid,
            "phoneNumber"        : mobile,
            "merchantIdentifier" : MERCHANT.id,
            "merchantName"       : MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var prePaymentText = JSON.stringify(prePayment).toString();
        prePaymentText = UTILS.prepForHMAC(prePaymentText); 
        
        var hmacPromise = new Promise(function(resolve1, reject1) 
        {
            $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : prePaymentText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                prePayment.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                prePaymentText =  JSON.stringify(prePayment).toString();

                if(UTILS.debug.enabled()) {
                    console.log("HMAC for Pre-Payment Request: " + prePaymentText + "\n\n");
                }
                resolve1(hmac);
            },
            error: function(){
                UTILS.errorDetected("Couldn't calculate HMAC!");  
                reject1("Couldn't calculate HMAC!");
            }
            });  // ajax hmac   
        });
        
        hmacPromise.then( 
            function (hmac) 
            {
                prePayment.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                prePaymentText =  JSON.stringify(prePayment).toString();
                
                var  prepaymentPromise = new Promise(function(resolve2, reject2) 
                {
                
                $.ajax({
                type        : "POST",
                url         : APPSERVER.vrayHost.getDomainURL() + "/api/payments/PrePayment",
                contentType : "application/json",
                data        : prePaymentText,
                timeout     : TRANSACTION.t1Timeout, 
                dataType    : "text",
                async       : true,
                xhrFields   : { withCredentials: true },
                success     : function(result) 
                { 
                    // From 9, step 150b. Start Payment Info Indication(tid, vid)
                    var prePaymentResp = JSON.parse(result);
                    if (!prePaymentResp)
                    {
                        UTILS.errorDetected("ERROR - Unexpected pre-payment result.\n");    
                    }

                    if (prePaymentResp.msgId !== MESSAGE.id.PrePaymentResponse)
                    {
                        UTILS.errorDetected("ERROR - Unexpected pre-payment response: " + prePaymentResp.toString());  
                    }

                    if ((prePaymentResp.status === STATUS.code.SUCCESS) ||
                        (prePaymentResp.status === STATUS.code.AnotherVID))
                    {
                        if(!prePaymentResp.shippingInfos) {
                            CARDHOLDER.shippingHistory = null;
                        }
                        else {
                            CARDHOLDER.shippingHistory = prePaymentResp.shippingInfos;
                        }

                        if(prePaymentResp.anotherEmail !== null)
                        {
                            //304 :  Replace the old VID with old one.
                            CARDHOLDER.emailChange(prePaymentResp.anotherEmail);
                        }
                    }
                    else if(prePaymentResp.status === STATUS.code.VIDFailure) 
                    {
                         CARDHOLDER.shippingHistory = null;  // 1st time user
                    }
                    else if (prePaymentResp.status === STATUS.code.MACVerificationFailure) 
                    {
                        UTILS.errorDetected("ERROR - Pre-payment failure: " + prePaymentResp.toString());  
                    }
                    else
                    { 
                        UTILS.errorDetected("ERROR - Unexpected pre-payment response: " + prePaymentResp.toString());  
                    }    

                    resolve2(prePaymentResp.shippingInfos);
                },
                error: function()
                {
                    UTILS.errorDetected("ERROR - Unexpected pre-payment response.\n");  
                    reject2("Unexpected pre-payment response");
                }});  // ajax pre-payment
            }); // prepaymetPromise

            prepaymentPromise.then (
                function (result) {
                    CARDHOLDER.shippingHistoryCallBack.call(result);
                },
                function (error) {
                    UTILS.errorDetected("Couldn't get shipping history" + error.toLocaleString()); 
                    reject2(error);
                }
              );
            },
            function(err) {
                UTILS.errorDetected("Failed to get shipping address: " + err.toString()); 
            }
        );
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

    configure: function(id, name, serverType)
    {
        MERCHANT.id = id;
        MERCHANT.name = name;
        
        //
        // TODO:  Query the VRAY Server for host for each Merchant ID (configuration in Merchant Portal)
        //
        var DEVELOPMENT_SERVER = "https://vraydevportal.azurewebsites.net";
        var STAGING_SERVER = "https://vraystagingportal.azurewebsites.net";
        var PRODUCTION_SERVER = "https://vrayproduction.azurewebsites.net";
                                               
        var hostServerURL = DEVELOPMENT_SERVER;
        
        // switch (id) 
        // {
        //     case "magentostore.vraymerchant.com" :
        //     case "shopifystore.vraymerchant.com" :
        //     case "test.vraymerchant.com" :
        //         hostServerURL = DEVELOPMENT_SERVER;
        //         break;
        //     case "mulletsocks.vraymerchant.com" :
        //         hostServerURL = PRODUCTION_SERVER;
        //         break;
        //     case "vraytest.vraymerchant.com" :
        //         hostServerURL = STAGING_SERVER;
        //         break; 
        //     default:
        //         hostServerURL = DEVELOPMENT_SERVER;
        //         break;
        // }
        switch (serverType)
        {
            case vServerType.Dev:
                 hostServerURL = DEVELOPMENT_SERVER;
                  break;
            case vServerType.Staging:
                hostServerURL = STAGING_SERVER;
                break;
            case vServerType.Production:
                hostServerURL = PRODUCTION_SERVER;
                break;
            default:
                 hostServerURL = DEVELOPMENT_SERVER;
                 break;

        }
        
        APPSERVER.vrayHost.setDomainURL(hostServerURL);
    },

    getID: function()
    {
        return MERCHANT.id;
    },

    getName: function()
    {
        return MERCHANT.name;
    },

    setID: function(id)
    {
        MERCHANT.id = id;
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
        PaymentRequestContinueIndication   : 38,
        PrePaymentRequest                  : 39,
        PrePaymentResponse                 : 40,
        SecurityCodeDisplayRequest         : 41,
        SecurityCodeIndication             : 42,
        OptimalBrowserPhoneVerificationReq : 43,
        OptimalBrowserPhoneVerificationResp: 44,
        SecurityCodeDisplayResponse        : 45,
        PaymentCompleteIndication          : 46,
        EmailChangeRequest                 : 47,
        EmailChangeResponse                : 48,
        ChargeInfoRequest                  : 49,
        ChargeInfoResponse                 : 50, 
        RefundCompleteIndication           : 51
    }
};

////////////////////////////////////////////////////////////////////////////////
// Payment Processing Services.
//
var PAYMENT = 
{
    signupCalled: false,

    authorizationRequest: function(hmac, paymentResponseURL)
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
            "paymentResponseURL": paymentResponseURL,
            "messageAuthenticationCode": UTILS.ab2hexText(hmac)
        };
       
        var  paymentReqParamText =  JSON.stringify(paymentReqParam).toString();
        TRANSACTION.paymentRequest = paymentReqParamText;

        if (UTILS.debug.enabled())
        {
            window.alert("Payment authorization request: \n\n" + paymentReqParamText + "\n\n");
        }

        // Start T1 Timer
        window.setTimeout(TRANSACTION.t1Timer, TRANSACTION.t1Timeout);
        console.log('deviceType',TRANSACTION.deviceType);
        // if(TRANSACTION.deviceType === 1)
        // {
        //     // Set charge info with clear the CC token
        //     UTILS.setChargeInfoStored(TRANSACTION.id, 
        //                             CARDHOLDER.id, 
        //                             MERCHANT.id,
        //                             "", // empty token 
        //                             TRANSACTION.amount, 
        //                             CALLBACK.paymentResponseURL); 
        // }
        
        // Store the paymentResponseURL
        // UTILS.setPaymentResponseURL(CALLBACK.paymentResponseURL);
        // console.log("TEST");
        
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
    },

    authorizationResponse: function(paymentResponse)
    {
        // Validate message
        if (!paymentResponse)
        {
            UTILS.errorDetected("ERROR - Unexpected payment response parameters:\n\n" +
                                JSON.stringify(paymentResponse).toString());
            PAYMENT.completed();
            return;
        }

        var tid = parseInt(paymentResponse.tid);
        if (tid !== Number(TRANSACTION.id))
        {
            UTILS.errorDetected("ERROR - Invalid transaction ID: " + paymentResponse.tid);
        }
        
        var ccToken = paymentResponse.token;
        if (paymentResponse.status === STATUS.code.SUCCESS)
        {
            if(!ccToken) {
                UTILS.errorDetected("ERROR - No CC Token in Payment Response.");  
                ccToken = "fake-token";
            }
            else 
            {
                console.log("Payment authorization accepted.\n\n" + "Credit Card Token = " + ccToken);
            }     
        }
        else if ((paymentResponse.status === STATUS.code.VIDFailure) || 
                 (paymentResponse.status === STATUS.code.PhoneVerificationTrigger))
        {
            // SIGNUP.phoneVerificationRequest(); 
            // UC-5.0 p.28 - 121
            SIGNUP.optimalPhoneVerificationRequest();
            return;
        }
        else if ((paymentResponse.status === STATUS.code.InvalidPhoneNumber) ||
                 (paymentResponse.status === STATUS.code.InvalidPhoneNumber2))
        {
            var newPhone = window.prompt("A different mobile# had been associated with " + CARDHOLDER.id +  ".\n\n" +
                                         "Please enter the mobile# associated with " + CARDHOLDER.id +  ".\n");
            CARDHOLDER.id = newPhone;
            SIGNUP.phoneVerificationRequest();
            return;
        }
        else if (paymentResponse.status === STATUS.code.Cancel) 
        {
            UTILS.errorDetected("Cancel");
            return;
        }
        else if (paymentResponse.status === STATUS.code.UserTimeout)
        {
            UTILS.errorDetected("Timeout");
            PAYMENT.completed();
            return;
        }
        else 
        {
            UTILS.errorDetected("Payment authorization request failed.");
            return;
        }
       
        // Charging payment via token
        doChargePayment(TRANSACTION.id,  CARDHOLDER.id, MERCHANT.id, MERCHANT.name, ccToken, TRANSACTION.amount);
        
        PAYMENT.completed();
        return;
    },
    
    chargeInfoRecovery: function(tid, token) 
    {
        doChargePayment(tid,  CARDHOLDER.vid, MERCHANT.id, MERCHANT.name, token, TRANSACTION.amount);         

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

        SIGNUP.phoneVerificationCounter = 0;
		
        // Transaction info
        var today = new Date();
        TRANSACTION.endTime = today.getTime();
        //TRANSACTION.id = 0;
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

    create: function(amount, items, paymentResponseURL)
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

        var paymentReqParam;
        
        if(!CARDHOLDER.shippingAddress) 
        {
            paymentReqParam = {
            "msgId": MESSAGE.id.PaymentRequest,
            "tid": TRANSACTION.id,
            "ttime": TRANSACTION.date,
            "vid": CARDHOLDER.id,
            "deviceType": TRANSACTION.deviceType,
            "loginStatus": TRANSACTION.loginStatus,
            "phoneNumber": CARDHOLDER.phone,
            "amount": TRANSACTION.amount,
            "countryCode": TRANSACTION.countryCode,
            "currencyCode": TRANSACTION.currencyCode,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "lineItems": TRANSACTION.lineItems,
            "paymentResponseURL": paymentResponseURL,
            "messageAuthenticationCode": ""
            };
        }
        else 
        {
            paymentReqParam = {
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
            "paymentResponseURL": paymentResponseURL,
            "messageAuthenticationCode": ""
            };
        }
        
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
        if(token === null) 
        {
            UTILS.errorDetected("ERROR - Invalid Payment Token.\n");
            PAYMENT.completed();
            return;
        }

        
        if (status == 0)
        {
            var paymentInfo =
            {
                "msgId" : MESSAGE.id.BrowserTokenIndication,
                "tid" : TRANSACTION.id,
                "merchantIdentifier" : MERCHANT.id,
                "merchantName" : MERCHANT.name,
                "token" : token,
                "status" : status,
                "authorizationCode" : code,
                "messageAuthenticationCode": ""
            };
        }
        else
        {
            var paymentInfo =
            {
                "msgId" : MESSAGE.id.BrowserTokenIndication,
                "tid" : TRANSACTION.id,
                "merchantIdentifier" : MERCHANT.id,
                "merchantName" : MERCHANT.name,
                "status" : status,
                "authorizationCode" : code,
                "messageAuthenticationCode" : ""
            };
        }

        var paymentInfoText = JSON.stringify(paymentInfo).toString();
        paymentInfoText = UTILS.prepForHMAC(paymentInfoText);
        $.ajax(
        {
            type        : "POST",
            url         : "https://hmac.vraymerchant.com", // for hmac
            data        : paymentInfoText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) 
            {
                console.log("create-submit-token-success",hmac);
                paymentInfo.messageAuthenticationCode = UTILS.ab2hexText(hmac);
                paymentInfoText = JSON.stringify(paymentInfo).toString();
                
                if(UTILS.debug.enabled()) 
                {
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
                    success     : function() 
                    {           
                        window.setTimeout(PAYMENT.chargeInfoRecovery(TRANSACTION.id, token), 2000);
                    },
                    error: function()
                    {          
                        window.setTimeout(PAYMENT.chargeInfoRecovery(TRANSACTION.id, token), 2000);
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
        TRANSACTION.deviceType = (UTILS.isMobile() ? 1 : 0);
        if(TRANSACTION.deviceType !== 1) 
        {
            UTILS.errorDetected("ERROR - Did not launch payment method for tid = "  + tid);
            return; 
        }
        
        var tid = parseInt(payment.tid);
        if (tid !== Number(TRANSACTION.id))
        {
            UTILS.errorDetected("ERROR -  Invalid transaction ID:" + tid);
            return;
        }
        
        // Set charge info with clear the CC token
        // UTILS.setChargeInfoStored(TRANSACTION.id, 
        //                           CARDHOLDER.id, 
        //                           MERCHANT.id,
        //                           "", // empty token 
        //                           TRANSACTION.amount, 
        //                           CALLBACK.paymentResponseURL);
       
        PAYMENT.requestContinue();
        
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
        TRANSACTION.deviceType = paymentInfo.deviceType;
        TRANSACTION.paymentResponseURL = paymentInfo.paymentResponseURL;
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
                console.log('reauthorizationRequest-error',result);
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
                    timeout     : 2000, 
                    dataType    : "text",
                    async       : true,
                    xhrFields   : { withCredentials: true },
                    success     : function() 
                    {	
                        launchPayment();
                    },
                    error: function()
                    {
                        launchPayment();
                    }
                });
            },
            error: function()
            {
                UTILS.errorDetected("Couldn't calculate HMAC!");
                PAYMENT.completed();
            }
        });
    },

    getToken : function(tid) 
    {
        var token = document.getElementById('newtoken').innerHTML;  // DOM element generated by payment.html form
    
        if((token) && (TRANSACTION.id === tid)) 
        {
            if(token !== "fake-token") 
            {
                PAYMENT.createAndSubmitToken(token, 1, 8);  // 1 - authroized approved, 8 - user cancel
            }
            else
            {
                PAYMENT.createAndSubmitToken(token, 1, 0);  // 1 - authroized approved, 0 - success
            }
        }
        else 
        {
            PAYMENT.createAndSubmitToken("", 2, 4);  // 2 - authorized declined, token failure
            
            window.alert("ERROR - Unable to get CC token.");
            UTILS.errorDetected(REASON.Error, "ERROR - Unabled to get CC token", tid);
        }
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
                { 
                    PAYMENT.provision(paymentInfoRespond);

                    // Extra token from payment.html
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
                    PAYMENT.createAndSubmitToken(token, 2, STATUS.code.Cancel);
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
                    PAYMENT.createAndSubmitToken(token, 3, STATUS.code.TokenFailure);
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
                "Please enter a different email: \n\n");
            CARDHOLDER.id = vid;
        }
        else if (vidRequest.status === STATUS.code.AnotherVID)
        {
            UTILS.errorDetected("INFO - Another email, " + vidRequest.anotherEmail + ", is associated with mobile# " + CARDHOLDER.phone);
            //vid = vidRequest.anotherEmail;
            //CARDHOLDER.id = vid;
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

    optimalPhoneVerificationRequest: function()
    {
        // Phone Verification Request
        var phoneVerificationReq = {
            "msgId": MESSAGE.id.OptimalBrowserPhoneVerificationReq,
            "tid": TRANSACTION.id,
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
                    url: APPSERVER.vrayHost.getDomainURL() + "/api/accounts/OptimalBrowserPhoneVerification",
                    contentType: "application/json",
                    data: phoneVerificationText,
                    timeout: 0,
                    dataType: "text",
                    async: true,
                    xhrFields:
                    {
                        withCredentials: true
                    },
                    success: function(result)
                    {  
                        if (!result)
                        {
                            UTILS.errorDetected("ERROR:  Invalid response.  Expected security code display request.\n");
                            PAYMENT.completed();
                            return;
                        }

                        var securityCodeDisplayReq = JSON.parse(result);
                        if (!securityCodeDisplayReq)
                        {
                            UTILS.errorDetected("ERROR:  Invalid security code parameters.\n");   
                            PAYMENT.completed();    
                            return;
                        }
                            
                        //353b. Security Code Display Request(tid, securityCode)
                        if (securityCodeDisplayReq.msgId === MESSAGE.id.SecurityCodeDisplayRequest)
                        {
                            TRANSACTION.securityCode = securityCodeDisplayReq.securityCode; // code is a string
                            
                            //p80 - 354a - Display "Thank You!" page and the received security code.
                            //window.alert("Thank You!  \n" + 
                            //             "You will receive a text message to authorize payment on your mobile phone.\n" + 
                            //             "Please confirm the security code on the phone matches this one: " + 
                            //             securityCodeDisplayReq.securityCode + "\n");
                            
                            CALLBACK.call(REASON.ConfirmationCode, TRANSACTION.securityCode, TRANSACTION.id);
                            
                            var securityCodeDisplayParameters = 
                            {
                                "tid": TRANSACTION.id,
                                "securityCode": TRANSACTION.securityCode,
                                "vid": CARDHOLDER.id,
                                "phoneNumber" : CARDHOLDER.phone,
                                "merchantIdentifier": MERCHANT.id,
                                "merchantName": MERCHANT.name,
                                "payCallBack": CALLBACK.callback
                            };
                            
                            var securityCodeDisplayText = JSON.stringify(securityCodeDisplayParameters).toString();
                            // localStorage.setItem("securityCodeDisplay", securityCodeDisplayText);
                            //window.location = "thankyou.html"; // internal file

                            SIGNUP.securityCodeDisplayResponse();
                        }
                    },
                    error: function()
                    {
                        UTILS.errorDetected("ERROR:  OptimalBrowserPhoneVerification failed on response.\n");   
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
                        else if ((phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber) ||
                                 (phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber2))
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
                        else if ((phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber) ||
                                 (phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber2))
                        {
                            var newPhone = window.prompt("A different mobile# had been associated with " + CARDHOLDER.id +  ".\n\n" +
                                                         "Please enter the mobile# associated with " + CARDHOLDER.id +  ".\n");
                            CARDHOLDER.id = newPhone;
                            SIGNUP.phoneVerificationRequest();
                            return;
                        }
                        else if(phoneVerificationResp.status === STATUS.code.PhoneNumberVerificationFailure) {cons

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
    },
    
    securityCodeDisplayResponse: function()
    {
        // Security Code Display Response
        var securityCodeDisplayResp = {
            "msgId": MESSAGE.id.SecurityCodeDisplayResponse,
            "tid": TRANSACTION.id,
            "phoneNumber" : CARDHOLDER.phone,
            "emailAddress" : CARDHOLDER.id,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "messageAuthenticationCode": ""
        };

        var securityCodeDisplayRespText = JSON.stringify(securityCodeDisplayResp).toString();
        securityCodeDisplayRespText = UTILS.prepForHMAC(securityCodeDisplayRespText);
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : securityCodeDisplayRespText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                securityCodeDisplayResp.messageAuthenticationCode = UTILS.ab2hexText(hmac);       
                securityCodeDisplayRespText = JSON.stringify(securityCodeDisplayResp).toString();

                if (UTILS.debug.enabled())
                {
                    console.log("Security Code Display Response: \n\n" + securityCodeDisplayRespText + "\n\n");
                }
            
                $.ajax(
                {
                    type: "POST",
                    url: APPSERVER.vrayHost.getDomainURL() + "/api/accounts/SecurityCodeDisplayResponse",
                    contentType: "application/json",
                    data: securityCodeDisplayRespText,
                    timeout: 0,
                    dataType: "text",
                    async: true,
                    xhrFields:
                    {
                        withCredentials: true
                    },
                    success: function(result)
                    {  
                        var paymentResponse = JSON.parse(result);
                        
                        if(!paymentResponse) {
                            UTILS.errorDetected("ERROR - Payment Response.");  
                            PAYMENT.completed();
                            return;   
                        }
                        
                        if(paymentResponse.msgId !== MESSAGE.id.PaymentResponse){
                            UTILS.errorDetected("ERROR - Unexpected message in place of Payment Response.");  
                            PAYMENT.completed();
                            return;
                        }
                        
                        var tid = parseInt(paymentResponse.tid);
                        if (tid !== Number(TRANSACTION.id))
                        {
                            UTILS.errorDetected("ERROR - Invalid transaction ID: " + paymentResponse.tid);
                            PAYMENT.completed();
                            return;
                        }
        
                        if (paymentResponse.status === STATUS.code.SUCCESS)
                        {
                            var ccToken = paymentResponse.token;
                            if(!ccToken) {
                                UTILS.errorDetected("ERROR - No CC Token in Payment Response.");  
                                PAYMENT.completed();
                                return;
                            }
                           
                            console.log("Payment authorization accepted.\n\n" + "Credit Card Token = " + ccToken);
                              

                            // Charging payment via token
                            console.log("TID = " + TRANSACTION.id);
                            console.log("Amount = " + TRANSACTION.amount);
                            console.log("Merchant Name = " + MERCHANT.name);
                            console.log("VID = " + CARDHOLDER.id);
                            
                            doChargePayment(TRANSACTION.id,  CARDHOLDER.id, MERCHANT.id, MERCHANT.name, ccToken, TRANSACTION.amount);
                        }
                        else {
                            UTILS.errorDetected("ERROR - Payment Response Unsuccessful.");  
                            PAYMENT.completed();
                        }
                    },
                    error: function()
                    {
                        UTILS.errorDetected("ERROR - Invalid Security Code Display Response.");  
                        PAYMENT.completed();   
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("ERROR - Couldn't calculate HMAC!");  
                PAYMENT.completed();   
            }
        });
    },
    
    securityCodeIndication: function(rxCode, UMID) 
    {
        // Phone Verification Request
        var securityCodeInd = {
            "msgId": MESSAGE.id.SecurityCodeIndication,
            "tid": TRANSACTION.id,
            "phoneNumber": CARDHOLDER.phone,
            "merchantIdentifier": MERCHANT.id,
            "merchantName": MERCHANT.name,
            "rxCode": rxCode,
            "UMID": UMID,
            "messageAuthenticationCode": ""
        };

        var securityCodeIndText = JSON.stringify(securityCodeInd).toString();
        securityCodeIndText = UTILS.prepForHMAC(securityCodeIndText);
        $.ajax({
            type        : "POST",
            url         : "https://hmac.vraymerchant.com",
            data        : securityCodeIndText,
            timeout     : 10000, 
            async       : true,
            dataType    : "text",
            success     : function(hmac) {
                securityCodeInd.messageAuthenticationCode = UTILS.ab2hexText(hmac);       
                securityCodeIndText = JSON.stringify(securityCodeInd).toString();

                if (UTILS.debug.enabled())
                {
                    console.log("Broswer Phone Verification Request: \n\n" + securityCodeIndText + "\n\n");
                }
                
                $.ajax(
                {
                    type: "POST",
                    url: APPSERVER.vrayHost.getDomainURL() + "/api/accounts/SecurityCodeIndication",
                    contentType: "application/json",
                    data: securityCodeIndText,
                    timeout: 0,
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
                            (phoneVerificationResp.msgId !== MESSAGE.id.OptimalBrowserPhoneVerificationResp))
                        {
                            UTILS.errorDetected("ERROR - Invalid message (!Optimal Browser Phone Verification Resp).\n");  
                            PAYMENT.completed();    
                            return;
                        }

                        if(!phoneVerificationResp.tid || 
                            !phoneVerificationResp.vid || 
                            !phoneVerificationResp.phoneNumber) 
                        {
                            UTILS.errorDetected("ERROR - Invalid Optimal Browser Phone Verification Response Parameters.");  
                            PAYMENT.completed();
                            return;
                        }
                        
                        TRANSACTION.id = phoneVerificationResp.tid;
                        CARDHOLDER.id = phoneVerificationResp.vid;
                        CARDHOLDER.phone = phoneVerificationResp.phoneNumber;
                        
                        if(phoneVerificationResp.status === STATUS.code.SUCCESS)
                        {
                            window.alert("Phone verification completed.\n" + 
                                         "Please check your mobile phone for payment notification.");

                            SIGNUP.browserSignupComplete();
                        }
                        else if ((phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber) ||
                                 (phoneVerificationResp.status === STATUS.code.InvalidPhoneNumber2))
                        {
                            window.alert("Invalid Mobile Phone Number.\n" +
                                         "Please enter a different mobile number associated with " + CARDHOLDER.id +  ".\n");
                        }
                        else if(phoneVerificationResp.status === STATUS.code.PhoneNumberVerificationFailure) {
                            
                            window.alert("Mobile Phone Number Verification failed.\n");
                            PAYMENT.completed();
                        }
                        else
                        {
                            UTILS.errorDetected("ERROR - Unknown mobile phone verification failure.");
                            PAYMENT.completed();
                        }
                    },
                    error: function()
                    {
                        UTILS.errorDetected("ERROR - Failed to Security Code Display Response.");  
                        PAYMENT.completed();   
                    }
                });
            },
            error: function(){
                UTILS.errorDetected("ERROR - Couldn't calculate HMAC!");  
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
    SUCCESS         : 0,
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
	InvalidPhoneNumber2: 24,
	BrowserCodeCheck: 25,

        UNKNOWN : -1
   }
};

////////////////////////////////////////////////////////////////////////////////
//  Payment Session Transaction Info
//
var TRANSACTION =  
{
        amount  :  0.0,
        currencyCode  : null,
        countryCode  : null,
        date : null,
        deviceType : 0,     // Desktop/Laptop = 0, Mobile Phone/Tablet = 1
        endTime : 0,
        id : 0,
        idRetry : 0,
        idRetryMAX : 1,
        lineItems : null,
        loginStatus : 1,     // Logged into merchant account = NO = 1
        paymentRetry : 0,
        paymentRetryMAX : 2,
        paymentRequest  : null,
        paymentCallBack: null,
        publicKey  : "",
        securityCode : 0,
        startTime : 0,
        t1Timer  : null,
        t17Timer  : null,
        t1Timeout : 300000, // msec
        t14Timeout : 20000, // 20sec
        t15Timeout : 1000, // 5sec
        t17Timeout : 30000, // 30 sec
        token : "",
        tokenType  : "",
        //
        MAC  : "",
                    
        duration : function () { return (Number(TRANSACTION.endTime) - 
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
            TRANSACTION.paymentResponseURL = null;
        }
};

////////////////////////////////////////////////////////////////////////////////
//  Utilities & Helper Services.
var UTILS = 
{
    ab2hexText : function (buffer) {
        return buffer;
    },
    
    getChargeInfoStored: function() 
    {
        // Retrieve charge info from local storage
        var chargeInfoStored = localStorage.getItem("chargeInfo");
        var chargeInfo = JSON.parse(chargeInfoStored);
        return chargeInfo;
    },
    
    getPaymentResponseURL: function()
    {
        // Retrieve payment response URL from local storage
        var paymentResponseURLStored = localStorage.getItem("paymentResponseURL");
        var url = JSON.parse(paymentResponseURLStored);
        return url;
    },
    
    setChargeInfoStored: function(tid, vid, mid, token, amount, paymentURL) 
    {
        var chargeParameters = 
        {
                "tid" :  tid, 
                "vid" : vid, 
                "mid" : mid,
                "token" : token,
                "amount" : amount,
                "paymentResponseURL" : paymentURL
        };
        
        var chargeParametersText = JSON.stringify(chargeParameters).toString();
        localStorage.setItem("chargeInfo", chargeParametersText);
    },
    
    setPaymentResponseURL: function(paymentURL) 
    {
        var paymentResponseURL = 
        {
            "paymentResponseURL" : paymentURL
        };
        
        var paymentResponseURLText = JSON.stringify(paymentResponseURL).toString();
        localStorage.setItem("paymentResponseURL", paymentResponseURLText);
    },
    
    removePaymentRepsonseURL: function()
    {
        localStorage.removeItem("paymentResponseURL");
    },
    
    removeChargeInfoStored: function()
    {
        localStorage.removeItem("chargeInfo");
    },
    
    debug : {
        flag    : false,
        set     : function(state) {this.flag = state;},
        enabled : function() {return this.flag;}
    },
    
    errorDetected: function(error) 
    {
        console.log("ERROR - TID: " + TRANSACTION.id);
        console.log("ERROR - " + error);
        
        CALLBACK.call(REASON.Error, error, TRANSACTION.id);
    },
    
    isMobile: function() 
    {  
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },
    
    prepForHMAC: function(message, cond) {
        payVal = (cond) ? "yes" : "no";
        var obj = {
            "val" : message,
            "pay" : payVal,
            "merchantId" : MERCHANT.id       
        };
        return JSON.stringify(obj); 
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

var REASON = Object.freeze({"AuthorizationStatus":0, "ConfirmationCode":1, "Error":2, "Info":3});

var CALLBACK = 
{
    callback : null,
    
    paymentResponseURL : null, 
    
    call: function(reason, data, tid) 
    {     
        console.log("INFO - Pay request callback() got called.");
        console.log("   reason = " + reason);
        console.log("   data = " + data);
        console.log("   tid =  " + tid);
        
        if(CALLBACK.callback) {
            console.log("INFO - CALLBACK.callback(reason, data, tid)");
                
            CALLBACK.callback(reason, data, tid);
        } else {
            console.log("ERROR - Pay request callback() is not available.");
            if(CALLBACK.paymentResponseURL){
                console.log("INFO - Payment response redirected URL " + CALLBACK.paymentResponseURL);
                window.location.href = CALLBACK.paymentResponseURL + 
                "?reason=" + reason +
                "&data=" + data + 
                "&tid=" + tid;
            } 
            // else {
            //     console.log("INFO - Retrieving payment response URL from local storage.");
            //     // Retrieve payment response URL from local storage
            //     var paymentURL = UTILS.getPaymentResponseURL();
            //     if(paymentURL){
            //         console.log("INFO - Retrieved payment response redirected URL " + paymentURL);

            //         window.location.href = paymentURL.paymentResponseURL + 
            //         "?reason=" + reason +
            //         "&data=" + data + 
            //         "&tid=" + tid;
            //     } else {
            //         console.log("ERROR - Payment Response URL local storage is not available.");
            //     }
            // }
        }
        
        // remove all local storage elements
        // UTILS.removeChargeInfoStored();
        // UTILS.removePaymentRepsonseURL();
    }
};
