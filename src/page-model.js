export default class Page {
  constructor() {
    // Billing section
    this.firstName = document.getElementById('billingName1');
    this.lastName = document.getElementById('billingName2');
    this.email = document.getElementById('email');
    this.phoneNumber = document.getElementById('billingPhoneNumber');
    this.companyName = document.getElementById('billingCompanyName');
    this.line1 = document.getElementById('billingAddress1');
    this.line2 = document.getElementById('billingAddress2');
    this.city = document.getElementById('billingCity');
    this.state = document.getElementById('billingState');
    this.postalCode = document.getElementById('billingPostalCode');
    this.country = document.getElementById('billingCountry');
    // Shipping section
    this.shippingFirstName = document.getElementById('shippingName1');
    this.shippingLastName = document.getElementById('shippingName2');
    this.shippingEmail = document.getElementById('shippingEmail');
    this.shippingPhoneNumber = document.getElementById('shippingPhoneNumber');
    this.shippingCompanyName = document.getElementById('shippingCompanyName');
    this.shippingLine1 = document.getElementById('shippingAddress1');
    this.shippingLine2 = document.getElementById('shippingAddress2');
    this.shippingCity = document.getElementById('shippingCity');
    this.shippingState = document.getElementById('shippingState');
    this.shippingPostalCode = document.getElementById('shippingPostalCode');
    this.shippingCountry = document.getElementById('shippingCountry');
    // GC site elements
    this.shippingAddressCheckbox = document.getElementById('shippingDifferentThanBilling');
    this.checkoutForm = document.querySelector('form[name="CheckoutAddressForm"]');
    this.checkoutButton = document.getElementById('checkoutButton');
    this.paymentsRadio = document.querySelector('input[name="paymentMethodID"]');
    this.cloudPayRadio = document.getElementById('CloudPay');
    this.creditCardRadio = document.getElementById('CreditCardMethod');
    this.payPalRadio = document.getElementById('PayPalExpressCheckout');
    this.directDebitRadio = document.getElementById('DirectDebit');
    this.testOrderCheckbox = document.querySelector('input[name="testOrder"]');
    // Credit Card elements
    this.cardNumberWrapper = document.getElementById('card-number');
    this.cardExpirationWrapper = document.getElementById('card-expiration');
    this.cardSecurityWrapper = document.getElementById('card-security-code');
    // CloudPay elements
    this.lastFourDigits = document.getElementById('dr_lastFourDigits');
    this.cardExpiration = document.getElementById('dr_cardExpiration');
    this.editCreditCardLink = document.getElementById('dr_editCloudPayCC');
    this.cloudPayErrors = document.getElementById('dr_cloudPayErrors');
  }
}