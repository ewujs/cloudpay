import CloudPayCreditCard from './cloudpay-creditcard';
import CloudPayPayPal from './cloudpay-paypal';
import CloudPayCheckout from './cloudpay-checkout';
import Page from './page-model';
import { getAccessToken } from './utils';

(function(window) {
  const init = async (params) => {
    const {siteInfo = {}, digitalriverJS, paymentMethods = [], options = {}} = params || {};
    let creditCardElements = null;
    const page = new Page();

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

  window.DRCloudPay = {
    init: init
  };
})(window);