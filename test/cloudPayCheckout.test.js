import mockAxios from 'axios';
import CloudPayCheckout from '../src/cloudpay-checkout';
import Page from '../src/page-model';
import PayPalPayload from '../src/payload/paypal-payload';
import CreditCardPayload from '../src/payload/creditcard-payload';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
    '  <form method="post" action="/store/" name="CheckoutAddressForm">' +
    '   <div id="dr_cloudPayErrors"></div>' +
    '   <input name="ORIG_VALUE_cloudPaySourceID" value="" type="hidden">' +
    '   <input name="cloudPaySourceID" value="" type="hidden">' +
    '   <input name="BILLINGname1" value="name1" id="billingName1" type="text">' +
    '   <input name="BILLINGname2" value="name2" id="billingName2" type="text">' +
    '   <input name="EMAILemail" value="email" id="email" type="text">' +
    '   <input name="BILLINGline1" value="address1" id="billingAddress1" type="text">' +
    '   <input name="BILLINGline2" value="address2" id="billingAddress2" type="text">' +
    '   <input name="BILLINGcity" value="city" id="billingCity" type="text">' +
    '   <input name="BILLINGstate" value="state" id="billingState" type="text">' +
    '   <input name="BILLINGpostalCode" value="postalCode" id="billingPostalCode" type="text">' +
    '   <input name="BILLINGcountry" value="country" id="billingCountry" type="text">' +
    '   <input name="BILLINGcompanyName" value="DR" id="billingCompanyName" type="text">' +
    '   <input name="BILLINGphoneNumber" value="12345678" id="billingPhoneNumber" type="tel">' +
    '   <input name="SHIPPINGname1" value="shippingName1" id="shippingName1" type="text">' +
    '   <input name="SHIPPINGname2" value="shippingName2" id="shippingName2" type="text">' +
    '   <input name="SHIPPINGemail" value="shippingEmail" id="shippingEmail" type="text">' +
    '   <input name="SHIPPINGline1" value="shippingAddress1" id="shippingAddress1" type="text">' +
    '   <input name="SHIPPINGline2" value="shippingAddress2" id="shippingAddress2" type="text">' +
    '   <input name="SHIPPINGcity" value="shippingCity" id="shippingCity" type="text">' +
    '   <input name="SHIPPINGstate" value="shippingState" id="shippingState" type="text">' +
    '   <input name="SHIPPINGpostalCode" value="shippingPostalCode" id="shippingPostalCode" type="text">' +
    '   <input name="SHIPPINGcountry" value="shippingCountry" id="shippingCountry" type="text">' +
    '   <input name="SHIPPINGcompanyName" value="shippingCompanyName" id="shippingCompanyName" type="text">' +
    '   <input name="SHIPPINGphoneNumber" value="shippingPhoneNumber" id="shippingPhoneNumber" type="tel">' +
    '   <input name="paymentMethodID" id="CloudPay" type="radio" value="4821307100">' +
    '   <input name="paymentMethodID" id="CreditCardMethod" type="radio" value="-1" checked="checked">' +
    '   <input name="paymentMethodID" id="PayPalExpressCheckout" value="800000" type="radio">' +
    '   <button id="checkoutButton" type="button">REVIEW ORDER</button>' +
    '  </form>' +
    '</div>';
};

const DigitalRiver = {};

Object.defineProperty(DigitalRiver, 'createSource', {
  value: jest.fn()
});

const siteInfo = {
  apiKey : '6a0bb049109c4a0f8d8dff7db896254b',
  id: 'sotw2',
  locale: 'en_US',
  currency : 'USD',
  shippingRequired : false,
  env: 'DESIGN',
  returnUrl: 'http://mypage.com',
  cancelUrl: 'http://mypage.com/cancel'
};

const enabledPayments = ['creditCard', 'payPal'];

describe('CloudPay Checkout', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    setupDocumentBody();
  });

  afterEach(() => {
    console.error.mockClear();

    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('initiate object', async () => {
    const page = new Page();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);

    expect(CloudPayCheckout.siteInfo).toEqual(siteInfo);
    expect(CloudPayCheckout.enabledPayments).toEqual(enabledPayments);
    expect(CloudPayCheckout.page).toEqual(page);
    expect(page.checkoutButton.click).not.toBeNull();
  });

  test('test error with init', async () => {
    const page = new Page();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => Promise.reject({errors: []}));

    await expect(CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page)).rejects.toThrow();
  });

  test('update paymentMethodID', () => {
    CloudPayCheckout.updatePaymentMethodId('CreditCardMethod');

    expect(document.getElementById('CreditCardMethod').value).toEqual('4821307100');
  });
  
  test('CloudPay not enabled', async () => {
    const cloudPayRadio = document.getElementById('CloudPay');
    
    cloudPayRadio.parentNode.removeChild(cloudPayRadio);

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    const page = new Page();

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);

    CloudPayCheckout.updatePaymentMethodId('CreditCardMethod');

    expect(document.getElementById('CreditCardMethod').value).not.toEqual('4821307100');
  });

  test('getSourceType test', async () => {
    const stubSourceId = '10ca197a-6710-4354-9760-ff889d2da66b';
    const stubPaymentSource = {
      'clientId': 'gc',
      'channelId': 'sotw2',
      'liveMode': false,
      'id': '10ca197a-6710-4354-9760-ff889d2da66b',
      'type': 'creditCard',
      'reusable': false,
      'currency': 'USD',
      'redirect': {
        'redirectUrl': 'https://payments/redirects/b617c3e6-46ca-4214-ba96-9b83f9eb2b05?apiKey=6a0bb049109c4a0f8d8dff7db896254b'
      }
    };

    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: stubPaymentSource
      })
    );

    const paymentType = await CloudPayCheckout.getSourceType(stubSourceId);

    expect(paymentType).toEqual(stubPaymentSource.type);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/sources/${stubSourceId}?apiKey=${siteInfo.apiKey}`);
  });

  test('test error with getSourceType', async () => {
    const stubSourceId = '10ca197a-6710-4354-9760-ff889d2da66b';

    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject({
        errors: []
      })
    );

    await expect(CloudPayCheckout.getSourceType(stubSourceId)).rejects.toThrow();
  });

  test('isSourceTypeMatched test without params', async () => {
    const isMatched = await CloudPayCheckout.isSourceTypeMatched();

    expect(isMatched).not.toBeTruthy();
  });

  test('isSourceTypeMatched test as type is matched', async () => {
    const stubSourceId = '10ca197a-6710-4354-9760-ff889d2da66b';
    const stubPaymentSource = {
      'clientId': 'gc',
      'channelId': 'sotw2',
      'liveMode': false,
      'id': '10ca197a-6710-4354-9760-ff889d2da66b',
      'type': 'creditCard',
      'reusable': false,
      'currency': 'USD'
    };

    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: stubPaymentSource
      })
    );

    const isMatched = await CloudPayCheckout.isSourceTypeMatched(stubSourceId, 'CreditCardMethod');

    expect(isMatched).toBeTruthy();
  });

  test('isSourceTypeMatched test as type is not matched', async () => {
    const stubSourceId = '10ca197a-6710-4354-9760-ff889d2da66b';
    const stubPaymentSource = {
      'clientId': 'gc',
      'channelId': 'sotw2',
      'liveMode': false,
      'id': '10ca197a-6710-4354-9760-ff889d2da66b',
      'type': 'creditCard',
      'reusable': false,
      'currency': 'USD'
    };

    mockAxios.get.mockImplementation(() =>
      Promise.resolve({
        data: stubPaymentSource
      })
    );

    const isMatched = await CloudPayCheckout.isSourceTypeMatched(stubSourceId, 'PayPalExpressCheckout');
    const notMatched = await CloudPayCheckout.isSourceTypeMatched(stubSourceId, 'XXX');

    expect(isMatched).not.toBeTruthy();
    expect(notMatched).not.toBeTruthy();
  });

  test('test error with isSourceTypeMatched', async () => {
    const stubSourceId = '10ca197a-6710-4354-9760-ff889d2da66b';

    CloudPayCheckout.getSourceType = jest.fn(() => Promise.reject({errors: []}));

    await expect(CloudPayCheckout.isSourceTypeMatched(stubSourceId, 'CreditCardMethod')).rejects.toThrow();
  });

  test('without the checkout button', async () => {
    const checkoutButton = document.getElementById('checkoutButton');
    
    checkoutButton.parentNode.removeChild(checkoutButton);

    const page = new Page();

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);
    
    expect(page.checkoutButton).toBeNull();
  });
  
  test('test error with submitCart', async () => {
    CloudPayCheckout.isSourceTypeMatched = jest.fn(() => Promise.reject({errors: []}));

    await expect(CloudPayCheckout.submitCart('CreditCardMethod')).rejects.toThrow();
  });

  test('submit cart using Credit Card', async () => {
    const page = new Page();

    page.checkoutForm.elements['ORIG_VALUE_cloudPaySourceID'].value = '';
    
    CreditCardPayload.prototype.buildPayload = jest.fn(() => Promise.resolve({data: {}}));
    
    page.checkoutForm.submit = jest.fn();

    CloudPayCheckout.isSourceTypeMatched = jest.fn();
    
    DigitalRiver.createSource.mockImplementation(() =>
      Promise.resolve({
        source: {
          id: 'SOURCE_ID',
          type: 'creditCard'
        }
      })
    );

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);
    await CloudPayCheckout.submitCart('CreditCardMethod');

    expect(CloudPayCheckout.sourceId).toEqual('SOURCE_ID');
    expect(page.checkoutForm.elements['cloudPaySourceID'].value).toEqual('SOURCE_ID');
    expect(DigitalRiver.createSource).toHaveBeenCalledTimes(1);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(1);

    page.checkoutForm.elements['ORIG_VALUE_cloudPaySourceID'].value = 'SOURCE_ID';

    CloudPayCheckout.isSourceTypeMatched.mockImplementation(() => {return true;});

    await CloudPayCheckout.submitCart('CreditCardMethod');
    
    expect(DigitalRiver.createSource).toHaveBeenCalledTimes(1);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(2);

    CloudPayCheckout.isSourceTypeMatched.mockImplementation(() => {return false;});

    await CloudPayCheckout.submitCart('CreditCardMethod');
    
    expect(DigitalRiver.createSource).toHaveBeenCalledTimes(2);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(3);
  });

  test('create source error as using Credit Card', async () => {
    const page = new Page();

    DigitalRiver.createSource.mockImplementationOnce(() =>
      Promise.resolve({errors: [{message: 'CREATE_SOURCE_ERROR_MESSAGE'}]})
    );

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);

    CloudPayCheckout.sourceId = null;

    await CloudPayCheckout.submitCart('CreditCardMethod');

    expect(page.cloudPayErrors.innerText).toEqual('CREATE_SOURCE_ERROR_MESSAGE');
    expect(CloudPayCheckout.sourceId).toBeNull();
  });

  test('test error with submitCart using PayPal', async () => {
    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.reject({errors: []}));

    await expect(CloudPayCheckout.submitCart('PayPalExpressCheckout')).rejects.toThrow();
  });

  test('submit cart using PayPal', async () => {
    const page = new Page();
    
    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.resolve({data: {}}));
    
    DigitalRiver.createSource.mockImplementationOnce(() =>
      Promise.resolve({
        source: {
          id: 'PAYPAL_SOURCE_ID',
          redirect: {
            redirectUrl: 'http://dummy.com'
          }
        }
      })
    );

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);
    await CloudPayCheckout.submitCart('PayPalExpressCheckout');

    expect(CloudPayCheckout.sourceId).toEqual('PAYPAL_SOURCE_ID');
  });

  test('create source error as using PayPal', async () => {
    const page = new Page();
    
    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.resolve({data: {}}));

    DigitalRiver.createSource.mockImplementationOnce(() =>
      Promise.resolve({errors: [{message: 'CREATE_SOURCE_ERROR_MESSAGE'}]})
    );

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});
    
    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);

    CloudPayCheckout.sourceId = null;

    await CloudPayCheckout.submitCart('PayPalExpressCheckout');

    expect(page.cloudPayErrors.innerText).toEqual('CREATE_SOURCE_ERROR_MESSAGE');
    expect(CloudPayCheckout.sourceId).toBeNull();
  });

  test('submit cart using PayPal as isSourceTypeMatched returns true', async () => {
    CloudPayCheckout.isSourceTypeMatched = jest.fn(() => {return true;});

    CloudPayCheckout.sourceId = null;

    await CloudPayCheckout.submitCart('PayPalExpressCheckout');

    expect(CloudPayCheckout.sourceId).toBeNull();
  });

  test('click the checkout button as no payment matched', async () => {
    document.getElementById('CloudPay').checked = true;

    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    page.checkoutForm.submit = jest.fn(() => {return true;});

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, enabledPayments, page);
    await map.click(event);

    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(1);
  });

  test('select Credit Card and click the checkout button as Credit Card enabled', async () => {
    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    CloudPayCheckout.submitCart.catch = jest.fn();
    page.checkoutForm.submit = jest.fn();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, ['creditCard'], page);
    await map.click(event);

    expect(CloudPayCheckout.submitCart.catch).toHaveBeenCalledTimes(0);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(0);
  });

  test('select PayPal and click the checkout button as PayPal enabled', async () => {
    document.getElementById('PayPalExpressCheckout').checked = true;

    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    CloudPayCheckout.submitCart.catch = jest.fn();
    page.checkoutForm.submit = jest.fn();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, ['payPal'], page);
    await map.click(event);

    expect(CloudPayCheckout.submitCart.catch).toHaveBeenCalledTimes(0);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(0);
  });

  test('select Credit Card and click the checkout button as no payments enabled', async () => {
    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    page.checkoutForm.submit = jest.fn();
    CloudPayCheckout.submitCart = jest.fn();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, [], page);
    await map.click(event);

    expect(CloudPayCheckout.submitCart).toHaveBeenCalledTimes(0);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(1);
  });

  test('select PayPal and click the checkout button as no payments enabled', async () => {
    document.getElementById('PayPalExpressCheckout').checked = true;

    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    page.checkoutForm.submit = jest.fn();
    CloudPayCheckout.submitCart = jest.fn();

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, [], page);
    await map.click(event);

    expect(CloudPayCheckout.submitCart).toHaveBeenCalledTimes(0);
    expect(page.checkoutForm.submit).toHaveBeenCalledTimes(1);
  });

  test('submitCart throws error as selecting Credit Card', async () => {
    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    CloudPayCheckout.submitCart = jest.fn(() => Promise.reject({errors: [{message: 'ERROR_MESSAGE'}]}));

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, ['creditCard'], page);
    await map.click(event);

    expect(console.error).toHaveBeenCalledTimes(1);
  });

  test('submitCart throws error as selecting PayPal', async () => {
    document.getElementById('PayPalExpressCheckout').checked = true;

    let map = {};
    const page = new Page();
    const event = {preventDefault: jest.fn()};

    page.checkoutButton.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    CloudPayCheckout.submitCart = jest.fn(() => Promise.reject({errors: [{message: 'ERROR_MESSAGE'}]}));

    jest.spyOn(CloudPayCheckout, 'preSelectPayment').mockImplementationOnce(() => {});

    await CloudPayCheckout.init(DigitalRiver, siteInfo, ['payPal'], page);
    await map.click(event);

    expect(console.error).toHaveBeenCalledTimes(1);
  });

  test('test error with preSelectPayment', async () => {
    CloudPayCheckout.preSelectPayment.mockRestore();

    const page = new Page();
    CloudPayCheckout.getSourceType = jest.fn(() => Promise.reject({errors: []}));

    await expect(CloudPayCheckout.preSelectPayment('SOURCE_ID', page)).rejects.toThrow();
  });

  test('preSelectPayment test with creditCard type', async () => {
    const page = new Page();
    
    page.creditCardRadio.click = jest.fn();
    CloudPayCheckout.getSourceType = jest.fn(() => {return 'creditCard';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(page.creditCardRadio.checked).toBeTruthy();
    expect(page.creditCardRadio.click).toHaveBeenCalledTimes(1);
  });

  test('preSelectPayment test with payPal type', async () => {
    const page = new Page();

    page.payPalRadio.click = jest.fn();
    CloudPayCheckout.getSourceType = jest.fn(() => {return 'payPal';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(page.payPalRadio.checked).toBeTruthy();
    expect(page.payPalRadio.click).toHaveBeenCalledTimes(1);
  });

  test('preSelectPayment test as no matching type', async () => {
    const page = new Page();

    page.creditCardRadio.click = jest.fn();
    CloudPayCheckout.getSourceType = jest.fn(() => {return 'XXX';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(page.creditCardRadio.checked).toBeTruthy();
    expect(page.creditCardRadio.click).toHaveBeenCalledTimes(1);
  });

  test('preSelectPayment test without radio buttons', async () => {
    const creditCardRadio = document.getElementById('CreditCardMethod');
    const payPalRadio = document.getElementById('PayPalExpressCheckout');
    
    creditCardRadio.parentNode.removeChild(creditCardRadio);
    payPalRadio.parentNode.removeChild(payPalRadio);
    
    const page = new Page();

    CloudPayCheckout.getSourceType = jest.fn(() => {return 'creditCard';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(document.querySelector('input[name="paymentMethodID"]:checked')).toBeNull();

    CloudPayCheckout.getSourceType = jest.fn(() => {return 'payPal';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(document.querySelector('input[name="paymentMethodID"]:checked')).toBeNull();

    CloudPayCheckout.getSourceType = jest.fn(() => {return 'XXX';});

    await CloudPayCheckout.preSelectPayment('SOURCE_ID', page);

    expect(document.querySelector('input[name="paymentMethodID"]:checked')).toBeNull();
  });
});