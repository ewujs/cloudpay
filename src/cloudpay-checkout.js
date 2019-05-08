import CreditCardPayload from './payload/creditcard-payload';
import PayPalPayload from './payload/paypal-payload';
import CloudPayCreditCard from './cloudpay-creditcard';
import { displayErrorMsg } from './utils';
import { getPaymentSource } from './apiEndpoints';

const CloudPayCheckout = {
  drPayments: null,
  siteInfo: null,
  enabledPayments: null,
  page: null,
  sourceId: null,
  paymentSource: null,
  init(drPayments, siteInfo, enabledPayments, page) {
    this.drPayments = drPayments;
    this.siteInfo = siteInfo;
    this.enabledPayments = enabledPayments;
    this.page = page;
    this.addEventListener();
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
   * Get the source's type from a sourceId and update the paymentSource property.
   * @async
   * @param {string} sourceId - The sourceId.
   * @return {string} The source's type.
   */
  async getSourceType(sourceId) {
    try {
      const res = await getPaymentSource(sourceId, this.siteInfo.apiKey);

      this.paymentSource = res;

      return res.data.type;
    } catch (error) {
      console.error(error.message);
    }
  },
  /**
   * Check if the source's type and the selected payment method are matched.
   * @async
   * @param {string} sourceId - The sourceId.
   * @param {string} selectedPayment - The element's identifier of the selected payment method.
   * @return {boolean} Whether the source's and the selected payment method are matched.
   */
  async isSourceTypeMatched(sourceId, selectedPayment) {
    if (sourceId) {
      try {
        const sourceType = await this.getSourceType(sourceId);

        switch (selectedPayment) {
          case 'CreditCardMethod': {
            return (sourceType === 'creditCard');
          }
          case 'PayPalExpressCheckout': {
            return (sourceType === 'payPal');
          }
          default: {
            return false;
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    } else {
      return false;
    }
  },
  /**
   * Submit the cart.
   * @async
   * @param {string} selectedPayment - The element's identifier of the selected payment method.
   */
  async submitCart(selectedPayment) {
    const sourceId = sessionStorage.getItem('paymentSourceId');
    let isMatched = false;

    try {
      isMatched = await this.isSourceTypeMatched(sourceId, selectedPayment);
    } catch (error) {
      console.error(error.message);
    }  

    this.updatePaymentMethodId(selectedPayment);

    switch (selectedPayment) {
      case 'CreditCardMethod': {
        if ((this.page.checkoutForm.elements['ORIG_VALUE_cloudPaySourceID'].value === '') || (!isMatched)) {
          const CP = new CreditCardPayload(this.siteInfo, this.page);
          const payload = CP.buildPayload();

          this.drPayments.createSource(CloudPayCreditCard.cardNumber, payload).then((result) => {
            if (result.hasOwnProperty('errors')) {
              displayErrorMsg(this.page, result.errors[0].message);
            } else {
              sessionStorage.setItem('paymentSourceId', result.source.id);
              this.sourceId = result.source.id;
              this.page.checkoutForm.elements['cloudPaySourceID'].value = result.source.id;
              this.page.checkoutForm.submit();
            }
          });
        } else {
          this.page.checkoutForm.elements['cloudPaySourceID'].value = sourceId;
          this.page.checkoutForm.submit();
        }

        break;
      }
      case 'PayPalExpressCheckout': {
        if (isMatched) {
          window.location.href = this.paymentSource.source.redirect.redirectUrl;
        } else {
          const PP = new PayPalPayload(this.siteInfo, this.page);

          try {
            const payload = await PP.buildPayload();
            
            this.drPayments.createSource(payload).then((result) => {
              if (result.hasOwnProperty('errors')) {
                displayErrorMsg(this.page, result.errors[0].message);
              } else {
                sessionStorage.setItem('paymentSourceId', result.source.id);
                this.sourceId = result.source.id;
                this.page.checkoutForm.elements['cloudPaySourceID'].value = result.source.id;
                window.location.href = result.source.redirect.redirectUrl;
              }
            });
          } catch (error) {
            console.error(error.message);
          }
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
              this.submitCart(selectedPayment);
            } else {
              this.page.checkoutForm.submit();
            }

            break;
          }
          case 'PayPalExpressCheckout': {
            if (this.enabledPayments.indexOf('payPal') >= 0) {
              this.submitCart(selectedPayment);
            } else {
              this.page.checkoutForm.submit();
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