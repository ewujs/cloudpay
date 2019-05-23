import CloudPayCreditCard from './cloudpay-creditcard';
import CloudPayPayPal from './cloudpay-paypal';
import CloudPayCheckout from './cloudpay-checkout';
import Page from './page-model';
import { getAccessToken } from './utils';
import CreditCardPayload from './payload/creditcard-payload';
import PayPalPayload from './payload/paypal-payload';
import DirectDebitPayload from './payload/directdebit-payload';

(function(window) {
  const page = new Page();

  const init = async (params) => {
    const {siteInfo = {}, digitalriverJS, paymentMethods = [], options = {}} = params || {};
    let creditCardElements = null;

    if (Object.keys(siteInfo).length === 0) {
      throw new Error('Please pass the site info object.');
    }

    if (typeof digitalriverJS !== 'object') {
      throw new Error('Please pass an instance of the DigitalRiver object.');
    }

    if (paymentMethods.length === 0) {
      throw new Error('Please pass the payment types of the CloudPay.');
    }

    const enabledPayments = paymentMethods.map(e => {return e.trim()});

    if (enabledPayments.indexOf('creditCard') >= 0) {
      creditCardElements = CloudPayCreditCard.init(digitalriverJS, options, page);
    }

    if (enabledPayments.indexOf('payPal') >= 0) {
      CloudPayPayPal.init(digitalriverJS, siteInfo, page);
    }

    try {
      await CloudPayCheckout.init(digitalriverJS, siteInfo, enabledPayments, page);
    } catch (error) {
      console.error(error.message);
    }

    try {
      const token = await getAccessToken(siteInfo.siteId, siteInfo.apiKey);

      sessionStorage.setItem('gcAccessToken', token);
    } catch (error) {
      console.error(error.message);
    }

    return creditCardElements;
  };

  const buildPayload = async (siteInfo, type) => {
    if (Object.keys(siteInfo).length === 0) {
      throw new Error('Please pass the site info object.');
    }

    if (typeof type !== 'string') {
      throw new Error('Please pass the payment type.');
    }

    let payload = {};

    switch (type) {
      case 'creditCard': {
        const CP = new CreditCardPayload(siteInfo, page);
        
        payload = CP.buildPayload();

        break;
      }
      case 'payPal': {
        const PP = new PayPalPayload(siteInfo, page);

        try {
          payload = await PP.buildPayload();
        } catch (error) {
          console.error(error.message);
        }

        break;
      }
      case 'directDebit': {
        const DD = new DirectDebitPayload(siteInfo, page);

        payload = DD.buildPayload();

        break;
      }
      default: {
        throw new Error('No matched type.');
      }
    }

    return payload;
  };


  window.DRCloudPay = {
    init: init,
    buildPayload: buildPayload
  };
})(window);