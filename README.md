# How to use our API #

## Add our script at the beginning of your html page's body - ##

### Example ###

```html
<body>
 
 <!-- SDK -->
 <script type="text/javascript" src="https://rawgit.com/VrayInc/Browser-SDK/master/js/merchant-button.js"></script>
 
 <!-- Other code -->
 
</body>
```

## The following three methods must be called in order ##

### VRAY.init() ###

* Parameter : merchantId (MID) - The ID provided by payment processor.

### VRAY.setupPayment() ###

* Parameters :
  * Buyer's emailAddress (string)
  * Buyer's phoneNumber (string)
  * Buyer's streetAddress (string)
  * Buyer's city (string)
  * Buyer's state (string)
  * Buyer's zipCode (string)
  * Buyer's totalAmount (string)
  * Buyer's loginStatus - whether the buyer is logged in on your website (number - 0 is logged in and 1 is otherwise)
  * callback - function that gets called once payment has been processed
  
 ### VRAY.pay() ###
 
 * No parameters
 * Valid merchantId, emailAddress, phoneNumber, streetAddress, city, state, zipCode and totalAmount 
   (greater than 0) are needed for pay() to work.

### Example usage ###

```javascript
VRAY.init("merchant.com"); // Step 1

VRAY.setupPayment( // Step 2
    "abc@xyz.com",
    "9431184567",
    "9500 Gilman Drive",
    "La Jolla",
    "CA",
    "92091",
    "151.00",
    1,
    myCallback
);

VRAY.pay(); // Step 3

//Define your callback
function myCallback(error) {
  if (error) {
      console.log(error);
  }
  else {
      console.log("Payment done successfully.");
  }
}
```

#### A good way to use this would be to call the three methods inside the onclick function of a button. ####
