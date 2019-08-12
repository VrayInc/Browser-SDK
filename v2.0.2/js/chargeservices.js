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
    
    if((token !== undefined) && (token !== null)) {
        
        chargeToken = token;
        chargeAmount = amount;
        
        //POST to ChargePaymentServlet.java
        var url = "https://magentostore.vraymerchant.com/ChargePayment?action=chargestripe&token=" + chargeToken + 
                  "&amount=" + chargeAmount + "&merchant=" + merchant + "&email=" + email;
        chargeRequest = getChargeRequest();
        chargeRequest.open("POST", url, true);
        chargeRequest.onreadystatechange = chargeResult;
        chargeRequest.send(null);
        
        if(UTILS.debug.enabled()) {
            window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        }
        UIUtils.hideSpinner();
        CALLBACK.call(REASON.AuthorizationStatus, null, tid);
    }
    else {
        if(UTILS.debug.enabled()) {
            CALLBACK.call(REASON.AuthorizationStatus, "Invalid token = " + token.toString(), tid);
        }
        else {
            CALLBACK.call(REASON.AuthorizationStatus, "Payment failed", tid);
        }
    }
}

function sendChargePayment(tid, token, amount, merchant, charge) {
    
    if((token !== undefined) && (token !== null)) {
        
        //POST to ChargePaymentServlet.java
        var url = "ChargePayment?action=submittoken&token=" + token + 
                  "&amount=" + amount + "&merchant=" + merchant;
        var chargeRequest = getChargeRequest();
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

function getChargeRequest() {
    
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
