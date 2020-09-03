/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doMerchantCallback (tid, vid, merchantId, merchantName, token, amount)
{
    let data;

    if (token == "good-token")
    {
        data = null;
    }
    else
    {
        data = token;
    }
    if((token !== undefined) && (token !== null) && (token !== "fake-token"))
    {
        if(CALLBACK.paymentResponseURL){
            console.log('paymentResponseURL Found');
            let a = CALLBACK.paymentResponseURL;
            if(a.indexOf("?") > -1) {
                window.location.href = CALLBACK.paymentResponseURL +
                    "&reason=" + REASON.AuthorizationStatus +
                    "&data=" + data +
                    "&tid=" + tid;
            }else{
                window.location.href = CALLBACK.paymentResponseURL +
                    "?reason=" + REASON.AuthorizationStatus +
                    "&data=" + data +
                    "&tid=" + tid;
            }

        } else {
            console.log('paymentResponseURL not Found');
            if(TRANSACTION.paymentResponseURL){
                let a = TRANSACTION.paymentResponseURL;
                if(a.indexOf("?") > -1) {
                    window.location.href = TRANSACTION.paymentResponseURL +
                        "&reason=" + REASON.AuthorizationStatus +
                        "&data=" + data +
                        "&tid=" + tid;
                }else{
                    window.location.href = TRANSACTION.paymentResponseURL +
                        "?reason=" + REASON.AuthorizationStatus +
                        "&data=" + data +
                        "&tid=" + tid;
                }

            } else {
                CALLBACK.call(REASON.AuthorizationStatus, data, tid);
            }
        }
        UIUtils.hideSpinner();
    }
    else
    {
        if(token === "fake-token")
        {
            if(CALLBACK.paymentResponseURL){
                console.log('paymentResponseURL Found');

                let a = CALLBACK.paymentResponseURL;
                if(a.indexOf("?") > -1) {
                    window.location.href = CALLBACK.paymentResponseURL +
                        "&reason=" + REASON.Error +
                        "&data=Cancel&tid=" + tid;
                }else{
                    window.location.href = CALLBACK.paymentResponseURL +
                        "?reason=" + REASON.Error +
                        "&data=Cancel&tid=" + tid;
                }
            } else {
                console.log('paymentResponseURL not Found');
                if(TRANSACTION.paymentResponseURL){

                    let a = TRANSACTION.paymentResponseURL;
                    if(a.indexOf("?") > -1) {
                        window.location.href = TRANSACTION.paymentResponseURL +
                            "&reason=" + REASON.Error +
                            "&data=Cancel&tid=" + tid;
                    }else{
                        window.location.href = TRANSACTION.paymentResponseURL +
                            "?reason=" + REASON.Error +
                            "&data=Cancel&tid=" + tid;
                    }
                } else {
                    CALLBACK.call(REASON.Error, "Cancel", tid);
                }
            }
        }
        else
        {
            if(CALLBACK.paymentResponseURL){
                console.log('paymentResponseURL Found');

                let a = CALLBACK.paymentResponseURL;
                if(a.indexOf("?") > -1) {
                    window.location.href = CALLBACK.paymentResponseURL +
                        "&reason=" + REASON.Error +
                        "&data=" + "Payment failed" +
                        "&tid=" + tid;
                }else{
                    window.location.href = CALLBACK.paymentResponseURL +
                        "?reason=" + REASON.Error +
                        "&data=" + "Payment failed" +
                        "&tid=" + tid;
                }
            } else {
                console.log('paymentResponseURL not Found');
                if(TRANSACTION.paymentResponseURL){

                    let a = TRANSACTION.paymentResponseURL;
                    if(a.indexOf("?") > -1) {
                        window.location.href = TRANSACTION.paymentResponseURL +
                            "&reason=" + REASON.Error +
                            "&data=" + "Payment failed" +
                            "&tid=" + tid;
                    }else{
                        window.location.href = TRANSACTION.paymentResponseURL +
                            "?reason=" + REASON.Error +
                            "&data=" + "Payment failed" +
                            "&tid=" + tid;
                    }
                } else {
                    console.log('callback function called not Found');
                    CALLBACK.call(REASON.Error, "Payment failed", tid);
                }
            }
        }

        UIUtils.hideSpinner();

        PAYMENT.completed();
    }
}


function doRefundPayment(merchantId, merchantName, tid, amount, currency, reason)
{
    if((tid !== undefined) && (tid !== null))
    {
        let serverType = tid.charAt(tid.length - 1);
        let url = getURLs(serverType);

        //var url = APPSERVER.paymentGWHost.getURL() + "/refund";
        refundRequestBody = {
            "tid": parseInt(tid),
            "merchantId": merchantId,
            "merchantName": merchantName,
            "amount": amount,
            "currency": currency,
            "reason": reason
        };

        return new Promise(function (resolve, reject) {
            hmacService(refundRequestBody).then(function (contentMac) {
                $.ajax({
                    type: "POST",
                    url: url.gatewayURL + "refund",
                    timeout: 20000,
                    contentType: "application/json",
                    headers: {
                        'Content-Mac': contentMac
                    },
                    data: JSON.stringify(refundRequestBody),
                    async: true,
                    dataType: "json"
                })
                    .done(function (response) {
                        console.log(response);
                        console.log("Refund Successful");
                    })
                    .fail(function (response) {
                        console.log(response);
                        console.log("Refund failed");
                    });
            });
        });
    } else {
        console.log("Please enter tid");
    }
}


function sendChargePayment(tid, token, amount, merchant, charge) {

    if((token !== undefined) && (token !== null)) {

        //POST to ChargePaymentServlet.java
        let url = "ChargePayment?action=submittoken&token=" + token +
            "&amount=" + amount + "&merchant=" + merchant;
        let chargeRequest = getHTTPRequest();
        chargeRequest.open("POST", url, true);
        chargeRequest.onreadystatechange = chargeResult;
        chargeRequest.send(charge);
    }
    else
    {
        if(UTILS.debug.enabled())
        {
            CALLBACK.call(REASON.Error, "Cancel", tid);
        }
        else {
            CALLBACK.call(REASON.Error, "Unknown", tid);
        }
    }

    console.log("Sending payment to charging server: " + url.toLocaleString);
}

function getHTTPRequest() {

    if (window.XMLHttpRequest) {
        if (navigator.userAgent.indexOf('MSIE') !== -1) {
            IE = true;
        }
        return new XMLHttpRequest();

    } else if (window.ActiveXObject) {
        IE = true;
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

function chargeResult(req,reason,data,tid) {
    //window.alert("Payment transaction completed!");
    console.log("Payment charge completed!");
    //        console.log('responseURL', CALLBACK.paymentResponseURL);
    //        console.log('reason',REASON.AuthorizationStatus);
    //        console.log('data',data);
    //        console.log('tid',tid);


}

function hmacService (requestObject) {
    return new Promise(function (resolve, reject) {
        let message = JSON.stringify(requestObject);
        requestObject = prepForHMAC(message, false, requestObject);
        let url = APPSERVER.hmacHost.getURL();
        $.ajax({
            type: "POST",
            url: url,
            contentType : "text/plain",
            data: requestObject,
            timeout: 10000,
            async: true,
            dataType: "text"
        })
            .done(function (resp) {
                resolve(resp);
            })
            .fail(function (err) {
                reject(err);
            });
    });

}

function prepForHMAC(message, cond, requestObject) {
    let payVal = (cond) ? "yes" : "no";
    let obj = {
        "val" : message,
        "pay" : payVal,
        "merchantId" : requestObject.merchantId,
        "tid": requestObject.tid
    };
    return JSON.stringify(obj);
}

function getURLs(serverType) {
    let domainURL = "";
    let gatewayURL = "";
    let vrayBaseURL = "";
    let hmacURL = "";
    let urls = {};

    if (serverType == "0") {
        domainURL = "https://vraydevportal.azurewebsites.net";
        gatewayURL = "https://devgateway.vraymerchant.com/";
        vrayBaseURL = "https://devpay.vraymerchant.com/";
        hmacURL = "https://devhmac.vraymerchant.com";
        urls = {
            domainURL: domainURL,
            gatewayURL: gatewayURL,
            vrayBaseURL: vrayBaseURL,
            hmacURL: hmacURL
        };
    }
    else if (serverType == "1") {
        domainURL = "https://vraystagingportal.azurewebsites.net";
        gatewayURL = "https://staginggateway.vraymerchant.com/";
        vrayBaseURL = "https://stagingpay.vraymerchant.com/";
        hmacURL = "https://staginghmac.vraymerchant.com";
        urls = {
            domainURL: domainURL,
            gatewayURL: gatewayURL,
            vrayBaseURL: vrayBaseURL,
            hmacURL: hmacURL
        };
    }
    else if (serverType == "2") {
        domainURL = "https://vrayproduction.azurewebsites.net";
        gatewayURL = "https://gateway.vraymerchant.com/";
        vrayBaseURL = "https://pay.vraymerchant.com/";
        hmacURL = "https://hmac.vraymerchant.com";
        urls = {
            domainURL: domainURL,
            gatewayURL: gatewayURL,
            vrayBaseURL: vrayBaseURL,
            hmacURL: hmacURL
        };
    }
    return urls;
}

