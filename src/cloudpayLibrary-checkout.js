import CreditCardPayload from './payload/creditcard-payload';
import PayPalPayload from './payload/paypal-payload';
import CloudPayCreditCard from './cloudpayLibrary-creditcard';
import {displayErrorMsg} from './utils';

/**
 * A CloudPayCheckout object.
 * @typedef {Object} CloudPayCheckout
 * @property {Object} drPayments - An instance of the DigitalRiver object.
 * @property {Object} siteInfo - The site information.
 * @property {string[]} enabledPayments - An array of the enabled payment types.
 * @property {Object} page - An instance of the Page class.
 * @property {string} source - The payment source.
 * @property {string} sourceId - The payment sourceId.
 * @property {string} redirectUrl - The customer should be redirected to to continue the process.
 * @property {Function} init - A function that initiates the properties, attaches event handlers and pre-selects the payment method.
 * @property {Function} updatePaymentMethodId - A function that sets the payment method ID to the value of CloudPay's ID.
 * @property {Function} retrieveSource - A function that retrieves the source.
 * @property {Function} isSourceTypeMatched - A function that checks if the type and the selected payment method are matched.
 * @property {Function} preSelectPayment - A function that pre-selects the payment method on page load.
 * @property {Function} submitCart - A function that submits the cart.
 * @property {Function} addEventListener - A function that attaches an event handler function for an event to the target.
 */
const CloudPayCheckout = {
  drPayments: null,
  siteInfo: null,
  enabledPayments: null,
  page: null,
  source: null,
  sourceId: null,
  redirectUrl: null,
  /**
   * Initiate the properties, attaches event handlers and pre-selects the payment method.
   * @param {Object} drPayments - An instance of the DigitalRiver object.
   * @param {Object} siteInfo - The site information.
   * @param {string[]} enabledPayments - An array of the enabled payment types.
   * @param {Object} page - An instance of the Page class.
   * @throws Will throw an error if preSelectPayment fails.
   */
  async init(drPayments, siteInfo, enabledPayments, page) {
    this.drPayments = drPayments;
    this.siteInfo = siteInfo;
    this.enabledPayments = enabledPayments;
    this.page = page;
    this.sourceId = sessionStorage.getItem('paymentSourceId');
    this.sourceClientSecret = sessionStorage.getItem('sourceClientSecret');
    this.addEventListener();

    if (this.sourceId) {
      try {
        this.source = await drPayments.retrieveSource(this.sourceId, this.sourceClientSecret);
      } catch (error) {
        throw Error(error);
      }
    }

    this.preSelectPayment(this.source, page);
  },
  /**
   * Set the payment method ID to the value of CloudPay's ID.
   * @param {string} selectedPayment - The element's identifier of the selected payment method.
   */
  updatePaymentMethodId(selectedPayment) {
    const cloudPayElement = this.page.cloudPayRadio;

    if (cloudPayElement) {
      document.getElementById(selectedPayment).value = cloudPayElement.value;
    }
  },
  /**
   * Retrieve the source.
   * @async
   * @param {string} sourceId - The sourceId.
   * @param {string} sourceClientSecret - The client secret.
   * @return {string} The source's type.
   */
  async retrieveSource(sourceId, sourceClientSecret) {
    try {
      const res = await this.drPayments.retrieveSource(sourceId, sourceClientSecret);

      if (res.data.redirect) {
        this.redirectUrl = res.data.redirect.redirectUrl;
      }

      return res.data;
    } catch (error) {
      throw Error(error);
    }
  },
  resetCreditCardSection() {
    if (this.page.lastFourDigits) {
      this.page.lastFourDigits.style.display ='none';
      this.page.cardExpiration.style.display ='none';
      this.page.cardNumberWrapper.style.display ='block';
      this.page.cardExpirationWrapper.style.display ='block';
      this.page.cardSecurityWrapper.style.display ='block';
    }
  },
  /**
   * Check if the source's type and the selected payment method are matched.
   * @param {string} source - The source.
   * @param {string} selectedPayment - The element's identifier of the selected payment method.
   * @return {boolean} Whether the source's and the selected payment method are matched.
   */
  isSourceTypeMatched(source, selectedPayment) {
    if (source) {
      const sourceType = source.type;

      switch (selectedPayment) {
        case 'CreditCardMethod': {
          return (sourceType === 'creditCard');
        }
        case 'PayPalExpressCheckout': {
          return (sourceType === 'payPal');
        }
        case 'DirectDebit': {
          return (sourceType === 'directDebit');
        }
        default: {
          return false;
        }
      }
    } else {
      return false;
    }
  },
  /**
   * Pre-select the payment method on page load.
   * @param {string} source - The source.
   * @param {string} page - An instance of the Page class.
   */
  preSelectPayment(source, page) {
    if (source) {
      const sourceType = source.type;

      if (sourceType !== 'creditCard') {
        this.resetCreditCardSection();
      }

      switch (sourceType) {
        case 'creditCard': {
          if (page.creditCardRadio) {
            page.creditCardRadio.checked = true;
            page.creditCardRadio.click();
          }
          
          break;
        }
        case 'payPal': {
          if (page.payPalRadio) {
            page.payPalRadio.checked = true;
            page.payPalRadio.click();
          }
          
          break;
        }
        case 'directDebit': {
          if (page.directDebitRadio) {
            page.directDebitRadio.checked = true;
            page.directDebitRadio.click();
          }

          break;
        }
        default: {
          if (page.creditCardRadio) {
            page.creditCardRadio.checked = true;
            page.creditCardRadio.click();
          }
        }
      }      
    } else {
      const payments = document.querySelectorAll('input[name="paymentMethodID"]');

      if (payments[0].id !== 'CloudPay') {
        payments[0].checked = true;
        payments[0].click();
      } else {
        payments[1].checked = true;
        payments[1].click();
      }
    }
  },
  /**
   * Submit the cart.
   * @async
   * @param {string} selectedPayment - The element's identifier of the selected payment method.
   */
  async submitCart(selectedPayment) {
    this.updatePaymentMethodId(selectedPayment);

    switch (selectedPayment) {
      case 'CreditCardMethod': {
        const CP = new CreditCardPayload(this.siteInfo, this.page);
        const payload = await CP.buildPayload();

        this.drPayments.createSource(CloudPayCreditCard.cardNumber, payload).then((result) => {
          if (result.hasOwnProperty('errors')) {
            displayErrorMsg(this.page, result.errors[0].message);
          } else {
            sessionStorage.setItem('paymentSourceId', result.source.id);
            sessionStorage.setItem('sourceClientSecret', result.source.clientSecret);
            this.sourceId = result.source.id;
            this.page.checkoutForm.elements['cloudPaySourceID'].value = result.source.id;
            this.page.checkoutForm.submit();
          }
        });

        break;
      }
      case 'PayPalExpressCheckout': {
        const PP = new PayPalPayload(this.siteInfo, this.page);

        try {
          const payload = await PP.buildPayload();
        
          this.drPayments.createSource(payload).then((result) => {
            if (result.hasOwnProperty('errors')) {
              displayErrorMsg(this.page, result.errors[0].message);
            } else {
              sessionStorage.setItem('paymentSourceId', result.source.id);
              sessionStorage.setItem('sourceClientSecret', result.source.clientSecret);
              this.sourceId = result.source.id;
              this.page.checkoutForm.elements['cloudPaySourceID'].value = result.source.id;
              window.location.href = result.source.redirect.redirectUrl;
            }
          });
        } catch (error) {
          throw Error(error);
        }

        break;
      }
    }
  },
  addEventListener() {
    if (this.page.checkoutButton) {
      this.page.checkoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        const selectedPayment = document.querySelector('input[name="paymentMethodID"]:checked').id;
        
        switch (selectedPayment) {
          case 'CreditCardMethod': {
            if (this.enabledPayments.indexOf('creditCard') >= 0) {
              this.submitCart(selectedPayment).catch(error => console.error(error.messgae));
            } else {
              this.page.checkoutForm.submit();
            }

            break;
          }
          case 'PayPalExpressCheckout': {
            if (this.enabledPayments.indexOf('payPal') >= 0) {
              this.submitCart(selectedPayment).catch(error => console.error(error.messgae));
            } else {
              this.page.checkoutForm.submit();
            }

            break;
          }
          case 'DirectDebit': {
            if (this.enabledPayments.indexOf('directDebit') >= 0) {
              //do nothing
            }

            break;
          }
          default: {
            this.page.checkoutForm.submit();
          }
        }
      });
    }
  }
};

export default CloudPayCheckout;