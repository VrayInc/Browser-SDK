/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doChargePayment(tid, token, amount, merchant, email) {
    
    var chargeToken;
    var chargeAmount;
    var chargeRequest;
    
    if((token !== undefined) && (token !== null) && (token !== "fake-token")) {
        
        chargeToken = token;
        chargeAmount = amount;
        
        //POST to ChargePaymentServlet.java
        //var url = "https://magentostore.vraymerchant.com/ChargePayment?action=chargestripe&token=" + chargeToken + 
        var url = "ChargePayment?action=chargestripe&token=" + chargeToken + 
                "&amount=" + chargeAmount + "&merchant=" + merchant + "&email=" + email;
       
                  
        chargeRequest = getHTTPRequest();
        chargeRequest.open("POST", url, true);
        chargeRequest.onreadystatechange = chargeResult;
        chargeRequest.send(null);
        
        if(UTILS.debug.enabled()) {
            window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        }
        UIUtils.hideSpinner();
        CALLBACK.call(REASON.AuthorizationStatus, null, tid);
    }
    else 
    {
        UIUtils.hideSpinner();
         
        if(token == "fake-token") 
        {
            CALLBACK.call(REASON.AuthorizationStatus, "User cancelled payment request.", tid);
        }
        else 
        {
            CALLBACK.call(REASON.AuthorizationStatus, "Payment failed", tid);
        }
    }
}

function doRefundPayment(tid, amount, currency, reason) {
    
    var refundRequest;
    
    if((tid !== undefined) && (tid !== null)) 
    {
        //POST to ChargePaymentServlet.java
        var url = "ChargePayment?action=refundstripe&tid=" + tid + 
                  "&amount=" + amount + "&currency=" + currency + "&reason=" + reason;
        refundRequest = getHTTPRequest();
        refundRequest.open("POST", url, true);
        refundRequest.onreadystatechange = refundRequest;
        refundRequest.send(null);
        
        if(UTILS.debug.enabled()) {
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
    else {
        if(UTILS.debug.enabled()) {
            CALLBACK.call(REASON.AuthorizationStatus, "Invalid token = " + token.toString(), tid);
        }
        else {
            CALLBACK.call(REASON.AuthorizationStatus, "Payment failed", tid);
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

function chargeResult() {
    //window.alert("Payment transaction completed!");
	console.log("Payment charge completed!");
}

