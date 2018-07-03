/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var IE;

function doChargePayment(token, amount, merchant) {
    
    var chargeToken;
    var chargeAmount;
    var chargeRequest;
    
    if((token !== undefined) && (token !== null)) {
        
        chargeToken = token;
        chargeAmount = amount;
        
        //POST to ChargePaymentServlet.java
        var url = "ChargePayment?action=chargestripe&token=" + chargeToken + 
                  "&amount=" + chargeAmount + "&merchant=" + merchant;
        chargeRequest = getChargeRequest();
        chargeRequest.open("POST", url, true);
        chargeRequest.onreadystatechange = chargeResult;
        chargeRequest.send(null);
        
        window.alert("Payment of $" + chargeAmount.toString() + ", has been completed.\n");
        $("#waitForAuthorization").css("display", "none");
        document.getElementById('mobilepay').innerHTML='';
    }
    else {
        window.alert("Invalid token = " + token.toString());
    }
}

function sendChargePayment(token, amount, merchant, charge) {
    
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
        window.alert("Invalid token = " + token);
    }
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
}
