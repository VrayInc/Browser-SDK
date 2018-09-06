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
  * Buyer's loginStatus - whether the buyer is logged in on your website (number - 0 is logged in and 1 is otherwise)  
  * Buyer's totalAmount (string)
  
 ### VRAY.pay() ###
 
 * Parameter
   * callback(error, tid) - function that gets called once payment has been processed.
     + error - error message, or null if transaction completed successfully.
     + tid - the transaction ID.
    
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
    "92091"],
    1
    "151.00"
);

VRAY.pay(myCallback); // Step 3

//Define your callback
function myCallback(error, data) {
  if (error) {
  
      console.log("Payment Request w/ transaction ID = " + data + " failed with error = " + error);
  }
  else {
      console.log("Payment Request w/ transaction ID = " + data + "completed successfully.");
  }
}
```

#### A good way to use this would be to call the three methods inside the onclick function of a button. ####
