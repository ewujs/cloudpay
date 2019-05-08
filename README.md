# DRCloudPay
DRCloudPay is a JavaScript library for utilizing DigitalRiver.js to interact with the Payments Service and using the CloudPay payment method to place an order on GC hosted sites.

## Prerequisites
* The **CloudPay** payment method has been added to the site.
* The **SiteSetting_CLOUDPAY_PAYMENT_METHODS_LIST** site setting attribute must be configured with a list of the payment types. (i.e. `creditCard, payPal`)
* DigitalRiver.js has been included on the site.
* The **CheckoutAddressForm** form contains a new hidden input named **cloudPaySourceID**.

## Build your own DRCloudPay
Clone a copy of the repo:
```bash
git clone https://github.digitalriverws.net/gc-templates/dr-cloudpay.git
```
Enter the dr-cloudpay directory and install dependencies:
```bash
cd dr-cloudpay && npm install
```
Run the build script:
```bash
npm run build
```
The built version of DRCloudPay will be put in the `dist/` subdirectory.

## Usage
Include the library on the site.
```html
<script src="dist/dr-cloudpay.js"></script>
```

The `init()` method is available on the `DRCloudPay` global to initialize the CloudPay on a GC hosted site. It takes one object argument containing three required (`siteInfo`, `digitalriverJS` and `paymentMethods`) and one optional (`options`) fields.
```javascript
DRCloudPay.init({
  siteInfo: {},
  digitalriverJS: {},
  paymentMethods: [],
  options: {}
});
```
* **siteInfo:** (Required) An object contains the site information including `apiKey`, `siteId`, `currency`, `shippingRequired`, `returnUrl` (PayPal) and `cancelUrl` (PayPal).
* **digitalriverJS:** (Required) An instance of the DigitalRiver object.
* **paymentMethods:** (Required) An array contains the payment types of the CloudPay.
* **options:** (Optional) [An object that you can style the Credit Card elements](https://developers.digitalriver.com/docs/reference#section-custom-classes).

The method returns an object which contains three instances of the three Credit Card elements.
```javascript
const creditCardElements = DRCloudPay.init({siteInfo: {}, digitalriverJS: {}, paymentMethods: []});

const cardNumber = creditCardElements.cardNumber;
const cardExpiration = creditCardElements.cardExpiration;
const cardSecurityCode = creditCardElements.cardSecurityCode;
```

[Element functions](https://developers.digitalriver.com/docs/reference#section--element-on)

## Examples

```javascript
let creditCardElements = null;

document.addEventListener('DOMContentLoaded', function() {
  const siteInfo = {
    apiKey : 'YOUR_API_KEY',
    siteId: '<bean:write name="page" property="site.siteID" />',
    currency : '<bean:write name="page" property="user.currency" />',
    shippingRequired : '<bean:write name="page" property="activeRequisition.shippingMethodRequired" />' === 'true',
    returnUrl: 'https://<bean:write name="request" property="serverName" />/store/<bean:write name="page" property="site.siteID" />/<bean:write name="page" property="user.locale" />/DisplayQuickBuyConfirmOrderPage/Env.<bean:write name="page" property="userSession.environment.environmentName" />',
    cancelUrl: 'https://<bean:write name="request" property="serverName" />/store/<bean:write name="page" property="site.siteID" />/<bean:write name="page" property="user.locale" />/DisplayQuickBuyCartPage/Env.<bean:write name="page" property="userSession.environment.environmentName" />'
  };
  const DRPayments = new DigitalRiver(siteInfo.apiKey);
  const paymentMethods = '<dr:resource key="SiteSetting_CLOUDPAY_PAYMENT_METHODS_LIST"/>'.split(',').map(e => {return e.trim();});
  
  // Initialize the CloudPay
  creditCardElements = DRCloudPay.init({
    siteInfo: siteInfo,
    digitalriverJS: DRPayments,
    paymentMethods: paymentMethods
  });
  
  // Bind an event handler to the change event on the cardNumber element
  creditCardElements.cardNumber.on('change', function(event) {
    console.log('card number change', event);
  });
});

window.onload = function() {
  // Trigger the focus event on the cardNumber element
  creditCardElements.cardNumber.focus();
};
```