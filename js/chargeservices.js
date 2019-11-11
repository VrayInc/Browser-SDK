/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doMerchantCallback (tid, vid, merchantId, merchantName, token, amount) 
{
    // var chargeToken;
    var chargeAmount;
    // var chargeRequest;
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
        // chargeToken = token;
        // chargeAmount = amount;
        
        // console.log("INFO - doChargePayment() with valid token: " + token);
    
        // //POST to ChargePaymentServlet.java
        // // var url = "https://gateway.vraymerchant.com/charge" + 
        // //         "&tid=" + tid +  
        // //         "&vid=" + vid + 
        // //         "&merchant=" + merchant + 
        // //         "&token=" + chargeToken + 
        // //         "&amount=" + chargeAmount;
                  
        // // chargeRequest = getHTTPRequest();
        // // chargeRequest.open("POST", url, true);
        // var url="https://gateway.vraymerchant.com/charge";
        // chargeRequestBody ={
        //     "tid": tid,
        //     "vid": vid,
        //     "merchantId":merchantId,
        //     "merchantName":merchantName,
        //     "amount":chargeAmount,
        //     "token":chargeToken
        // }
        // console.log(chargeRequestBody);
                  
        // chargeRequest = getHTTPRequest();
        // chargeRequest.open("POST", url, true);
        // chargeRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // //chargeRequest.onreadystatechange = chargeResult;
        // chargeRequest.onreadystatechange = function(){
        //     //console.log('chargeRequest',chargeRequest); 
        //     //console.log('readyState',this.readyState);
        //     console.log('REASON',REASON);
        //     console.log('responseURL',TRANSACTION.paymentResponseURL);
        //     if(this.readyState == 4){
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
        //     }
        //     //chargeResult(REASON.AuthorizationStatus, null, tid)
        // };
        // // chargeRequest.send(null);
        // chargeRequest.send(JSON.stringify(chargeRequestBody));
        
        // if(UTILS.debug.enabled()) {
        //     window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        // }
        
        UIUtils.hideSpinner();
        
        //CALLBACK.call(REASON.AuthorizationStatus, null, tid);
    }
    else 
    {
        console.log("doChargePayment() with valid token: " + token);
         
        if(token === "fake-token") 
        {
            //CALLBACK.call(REASON.Error, "Cancel", tid);
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
            //CALLBACK.call(REASON.Error, "Payment failed", tid);
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
        //POST to ChargePaymentServlet.java
        //var url = "ChargePayment?action=refundstripe" + 
        // var url = "https://magentostore.vraymerchant.com/ChargePayment?action=refundstripe" +
        //          "&mId=" + merchantId + 
        //          "&name=" + merchantName +
        //          "&tid=" + tid + 
        //          "&amount=" + amount + 
        //          "&currency=" + currency + 
        //          "&reason=" + reason;
          
        // refundRequest = getHTTPRequest();
        // refundRequest.open("POST", url, true);

         var url="https://gateway.vraymerchant.com/refund";
        refundRequestBody ={
            "tid": tid,
            "merchantId":merchantId,
            "merchantName":merchantName,
            "amount":amount,
            "currency":currency,
            "reason":reason
        }
        
        refundRequest = getHTTPRequest();
        refundRequest.open("POST", url, true);
        refundRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        refundRequest.onreadystatechange = refundRequest;
        // refundRequest.send(null);
        refundRequest.send(JSON.stringify(refundRequestBody));        
        if(UTILS.debug.enabled()) 
        {
            window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        }
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

