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
  * merchantId (string) - VRAY merchant ID (assigned through VRAY merchant portal).
  * merchantName (string) - Merchant Account Name; this is consumer recognizable brand name. This is the account name    
    provisioned by merchant on VRAY Merchant Portal.
  * serverType (number) - The VRAY Server with which this transaction is interacting. There are 3 different types:
    0: Development Server
    1: Staging Server
    2: Production Server
    
  * If the parameter "serverType" is not present in the VRAY.init(), then the serverType is default to 2. 
  
### VRAY.setupPayment() ###

* Parameters :
  * cardHolderName (string): Buyer's name
  
  * eMail (string): Buyer's emailAddress
  
  * phoneNumber (string): Buyer's cell phone number
  
  * purchaseItem (string): Buyer's purchaseItem
  
  * shippingAddress (string): Buyer's shippingAddress, which is an array of 4 elements with string type:
    * Buyer's streetAddress (string)
    * Buyer's city (string)
    * Buyer's state (string)
    * Buyer's zipCode (string)
  
  * loginStatus (number) - whether the buyer has logged into merchant's online account
    loginStatus = 0: buyser has logged into merchant's online account
    loginStatus = 1: buyer has not logged into merchant's online account; this is the default value
    
  * totalAmount (string): total amount of this payment transaction. For example: "37.25"
  
 ### VRAY.pay() ###
 
 * Parameter
   * callback(reason, data, tid) - function that gets called once payment has been processed and status has been obtained.
     + reason (number): reason of the callback
       0: AuthorizationStatus
       1: ConfirmationCode
       2: Error
     + data (String): 
       if reason = 0, this parameter contains the status of payment authorization:
          Null: Approved,
          Non-Null: a string of declined reason statement
          
       if reason = 1, this parameter contains the string of a
          6-digit confirmation code
          
       if reason = 2: this parameter contains the following error message:
          "Cancel"
          "InvalidPhoneNumber"
          "PhoneNumberVerificationFailure"
          "Timeout"
          "Unsubscribe"
     + tid (number) - the transaction ID. When passing tid to internet, need to convert number to string before passing.
     
   * paymentResponseURL - redirect URL location with callback parameters; this URL is especially useful for the mobile-only 
     transaction; i.e., consumer uses mobile phone to browse merchant web site and authorize payment. For example: Assuming 
     the redirect URL is "https://store.vraymercnat.com/checkoutcomplete", then the passing of parameters to this redirect 
     location is:  https://store.online.com/checkoutcomplete?reason=<xxx>&data=<yyy>&tid=<zzz>
 
     + reason
     + data
     + tid
    
 ### Constrains ###
 * Valid merchantId, name, emailAddress, phoneNumber and totalAmount (greater than 0) are needed for pay() to work.

### Example usage ###

```javascript
VRAY.init("0001000100000024.vraymerchant.com", "XYZ Store"); // Step 1

VRAY.setupPayment( // Step 2
    "John Doe",
    "abc@xyz.com",
    "9431184567",
    "Souvenir Pen"
    ["9500 Gilman Drive",
    "La Jolla",
    "California",
    "92091"],
    1,
    "151.00"
);

// Step 3
VRAY.pay(resultCallback, "https://magentostore.vraymerchant.com/test.html"); 

//Define your own callback
function resultCallback(reason, data, tid) 
{
    tid = tid.toString();
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
