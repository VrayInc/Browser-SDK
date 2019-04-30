/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doChargePayment(tid, vid, merchant, token, amount) 
{
    var chargeToken;
    var chargeAmount;
    var chargeRequest;
    
    if((token !== undefined) && (token !== null) && (token !== "fake-token"))
    {
        chargeToken = token;
        chargeAmount = amount;
        
        console.log("INFO - doChargePayment() with valid token: " + token);
    
        //POST to ChargePaymentServlet.java
        var url = "https://magentostore.vraymerchant.com/ChargePayment?action=chargestripe" + 
                "&tid=" + tid +  
                "&vid=" + vid + 
                "&merchant=" + merchant + 
                "&token=" + chargeToken + 
                "&amount=" + chargeAmount;
                  
        chargeRequest = getHTTPRequest();
        chargeRequest.open("POST", url, true);
        //chargeRequest.onreadystatechange = chargeResult;
        chargeRequest.onreadystatechange = function(){
            //console.log('chargeRequest',chargeRequest); 
            //console.log('readyState',this.readyState);
            console.log('REASON',REASON);
            console.log('responseURL',TRANSACTION.paymentResponseURL);
            if(this.readyState == 4){
                if(CALLBACK.paymentResponseURL){
                    console.log('paymentResponseURL Found');
                    window.location.href = CALLBACK.paymentResponseURL + 
                                        "?reason=" + REASON.AuthorizationStatus +
                                        "&data=" + null + 
                                        "&tid=" + tid;    
                } else {
                    console.log('paymentResponseURL not Found');
                    if(TRANSACTION.paymentResponseURL){
                        window.location.href = TRANSACTION.paymentResponseURL + 
                                        "?reason=" + REASON.AuthorizationStatus +
                                        "&data=" + null + 
                                        "&tid=" + tid;
                    } else {
                        CALLBACK.call(REASON.AuthorizationStatus, null, tid);
                    }
                }
            }
            //chargeResult(REASON.AuthorizationStatus, null, tid)
        };
        chargeRequest.send(null);
        
        if(UTILS.debug.enabled()) {
            window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        }
        
        UIUtils.hideSpinner();
        
        //CALLBACK.call(REASON.AuthorizationStatus, null, tid);
    }
    else 
    {
        console.log("doChargePayment() with valid token: " + token);
         
        if(token === "fake-token") 
        {
            CALLBACK.call(REASON.Error, "Cancel", tid);
        }
        else 
        {
            CALLBACK.call(REASON.Error, "Payment failed", tid);
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
        var url = "https://magentostore.vraymerchant.com/ChargePayment?action=refundstripe" +
                 "&mId=" + merchantId + 
                 "&name=" + merchantName +
                 "&tid=" + tid + 
                 "&amount=" + amount + 
                 "&currency=" + currency + 
                 "&reason=" + reason;
          
        refundRequest = getHTTPRequest();
        refundRequest.open("POST", url, true);
        refundRequest.onreadystatechange = refundRequest;
        refundRequest.send(null);
        
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

