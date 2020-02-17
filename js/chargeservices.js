/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doMerchantCallback (tid, vid, merchantId, merchantName, token, amount) 
{
    var data;

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
            var a = CALLBACK.paymentResponseURL;
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
                var a = TRANSACTION.paymentResponseURL;
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
                
                var a = CALLBACK.paymentResponseURL;
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
                   
                    var a = TRANSACTION.paymentResponseURL;
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
               
                var a = CALLBACK.paymentResponseURL;
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
                   
                    var a = TRANSACTION.paymentResponseURL;
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
    var refundRequest;
    
    if((tid !== undefined) && (tid !== null)) 
    {
        var url = APPSERVER.paymentGWHost.getURL() + "/refund";
        refundRequestBody = {
            "tid": tid,
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
                    url: APPSERVER.paymentGWHost.getURL() + "/refund",
                    timeout: 10000,
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
        var url = "ChargePayment?action=submittoken&token=" + token + 
                  "&amount=" + amount + "&merchant=" + merchant;
        var chargeRequest = getHTTPRequest();
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
        requestObject = UTILS.prepForHMAC(message, false, requestObject);
        var url = "https://hmac.vraymerchant.com";
        $.ajax({
            type: "POST",
            url: url,
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
    payVal = (cond) ? "yes" : "no";
    var obj = {
        "val" : message,
        "pay" : payVal,
        "merchantId" : requestObject.merchantId,
        "tid": requestObject.tid
    };
    return JSON.stringify(obj);
}

