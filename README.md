# How to use our API #

## Add our script at the beginning of your html page's body - ##

### Example ###

```html
<body>
 
 <!-- SDK -->
 <script type="text/javascript" src="https://raw.githubusercontent.com/VrayInc/Browser-SDK/master/v.0.2/vray-browser-sdk.js"></script>
 
 <!-- Other code -->
 
</body>
```

## The following three methods must be called in order ##

### VRAY.init() ###

* Parameters : 
  * merchantId (MID) - VRAY's assigned merchant ID (from merchant portal).
  * merchantName - Name of merchant provided by the payment processor.
  
### VRAY.setupPayment() ###

* Parameters :
  * Buyer's name (string)
  * Buyer's emailAddress (string)
  * Buyer's phoneNumber (string)
  * Buyer's purchaseItem (string)
  * Buyer's shippingAddress (array of 4 elements)
    * Buyer's streetAddress (string)
    * Buyer's city (string)
    * Buyer's state (string)
    * Buyer's zipCode (string)
    * Buyer's country (string)
  * Buyer's loginStatus - whether the buyer is logged in on your website (number - 0 is logged in and 1 is otherwise)  
  * Buyer's totalAmount (string)
  
 ### VRAY.pay() ###
 
 * Parameter
   * callback(reason, data, tid) - function that gets called once payment has been processed.
     + reason: 
       0: AuthorizationStatus
       1: ConfirmationCode
       2: Error
     + data (String): 
       reason = 0, this parameter contains the status of payment authorization:
          null - Approved
          non-null - Declined reason statement
          
       reason = 1, this parameter contains the string of:
          6-digit confirmation code
          
       reason = 2: this parameter contains the following error statement:
          "Cancel"
          "InvalidPhoneNumber"
          "PhoneNumberVerificationFailure"
          "Timeout"
     + tid - the transaction ID.
   * paymentResponseURL - redirect URL location with callback parameters 
                          (paymentResponseURL?reason=<xxx>&data=<yyy>&tid=<zzz>)
     + reason
     + data
     + tid
    
 ### Constrains ###
 * Valid merchantId, name, emailAddress, phoneNumber and totalAmount (greater than 0) are needed for pay() to work.

### Example usage ###

```javascript
VRAY.init("merchant.com", "merchant name"); // Step 1

VRAY.setupPayment( // Step 2
    "Ms. ABC",
    "abc@xyz.com",
    "9431184567",
    "Souvenir Pen"
    ["9500 Gilman Drive",
    "La Jolla",
    "CA",
    "92091",
    "US"],
    1
    "151.00"
);

// Step 3
VRAY.pay(resultCallback, "https://magentostore.vraymerchant.com/test.html"); 

//Define your callback
function resultCallback(reason, data, tid) 
{
    if(reason === REASON.AuthorizationStatus) 
    {
        if (data) {
            console.log("Payment failed w/ error:" + data.toString());
            window.alert("Transaction ID " + tid + " failed with error: " + data.toString());
        }
        else {
            console.log("Payment done successfully.");
            window.alert("Transaction ID " + tid + " completed successful.");
        }
    }
    else if (reason === REASON.ConfirmationCode) 
    {
            window.alert("Thank You!  \n" + 
                     "You will receive a text message to authorize payment on your mobile phone.\n" + 
                     "Please confirm the security code on the phone matches this one: " + 
                     data.toString() + "\n");
    }
    else if(reason === REASON.Error) {

        window.alert("Transaction ID " + tid + " received error.");
    }
    else
    {
         window.alert("Transaction ID " + tid + " received error with uknown reason.");
    }
}
