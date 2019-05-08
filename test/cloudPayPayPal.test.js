import CloudPayPayPal from '../src/cloudpay-paypal';
import PayPalPayload from '../src/payload/paypal-payload';
import Page from '../src/page-model';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
    '  <div id="dr_cloudPayErrors"></div>' +
    '  <input name="BILLINGname1" value="name1" id="billingName1" type="text">' +
    '  <input name="BILLINGname2" value="name2" id="billingName2" type="text">' +
    '  <input name="EMAILemail" value="email" id="email" type="text">' +
    '  <input name="BILLINGline1" value="address1" id="billingAddress1" type="text">' +
    '  <input name="BILLINGline2" value="address2" id="billingAddress2" type="text">' +
    '  <input name="BILLINGcity" value="city" id="billingCity" type="text">' +
    '  <input name="BILLINGstate" value="state" id="billingState" type="text">' +
    '  <input name="BILLINGpostalCode" value="postalCode" id="billingPostalCode" type="text">' +
    '  <input name="BILLINGcountry" value="country" id="billingCountry" type="text">' +
    '  <input name="BILLINGcompanyName" value="DR" id="billingCompanyName" type="text">' +
    '  <input name="BILLINGphoneNumber" value="12345678" id="billingPhoneNumber" type="tel">' +
    '  <input name="SHIPPINGname1" value="shippingName1" id="shippingName1" type="text">' +
    '  <input name="SHIPPINGname2" value="shippingName2" id="shippingName2" type="text">' +
    '  <input name="SHIPPINGemail" value="shippingEmail" id="shippingEmail" type="text">' +
    '  <input name="SHIPPINGline1" value="shippingAddress1" id="shippingAddress1" type="text">' +
    '  <input name="SHIPPINGline2" value="shippingAddress2" id="shippingAddress2" type="text">' +
    '  <input name="SHIPPINGcity" value="shippingCity" id="shippingCity" type="text">' +
    '  <input name="SHIPPINGstate" value="shippingState" id="shippingState" type="text">' +
    '  <input name="SHIPPINGpostalCode" value="shippingPostalCode" id="shippingPostalCode" type="text">' +
    '  <input name="SHIPPINGcountry" value="shippingCountry" id="shippingCountry" type="text">' +
    '  <input name="SHIPPINGcompanyName" value="shippingCompanyName" id="shippingCompanyName" type="text">' +
    '  <input name="SHIPPINGphoneNumber" value="shippingPhoneNumber" id="shippingPhoneNumber" type="tel">' +
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

describe('CloudPay - PayPal', () => {
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

  test('throws with no params', () => {
    expect(() => {
      CloudPayPayPal.init();
    }).toThrow();
  });  

  test('get PayPal token', async () => {
    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.resolve({data: {}}));

    DigitalRiver.createSource.mockImplementation(() =>
      Promise.resolve({
        source: {
          id: 'SOURCE_ID',
          payPal: {
            token: 'PAYPAL_TOKEN'
          },
          redirect: {
            redirectUrl: 'REDIRECT_URL'
          }
        }
      })
    );

    const page = new Page();
    
    CloudPayPayPal.init(DigitalRiver, siteInfo, page);
    
    const token = await CloudPayPayPal.getToken();

    expect(token).toEqual('PAYPAL_TOKEN');
    expect(CloudPayPayPal.token).toEqual('PAYPAL_TOKEN');
    expect(CloudPayPayPal.sourceId).toEqual('SOURCE_ID');
    expect(CloudPayPayPal.redirectUrl).toEqual('REDIRECT_URL');

    const existingToken = await CloudPayPayPal.getToken();

    expect(existingToken).toEqual('PAYPAL_TOKEN');
  });

  test('test error with getToken', async () => {
    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.reject({errors: []}));

    CloudPayPayPal.token = null;

    const token = await CloudPayPayPal.getToken();

    expect(token).toEqual(undefined);
  });

  test('fail to create source', async () => {
    const page = new Page();

    PayPalPayload.prototype.buildPayload = jest.fn(() => Promise.resolve({data: {}}));

    DigitalRiver.createSource.mockImplementationOnce(() =>
      Promise.resolve({errors: [{message: 'CREATE_SOURCE_ERROR_MESSAGE'}]})
    );
    
    CloudPayPayPal.init(DigitalRiver, siteInfo, page);
    
    CloudPayPayPal.token = null;
    
    const token = await CloudPayPayPal.getToken();

    expect(page.cloudPayErrors.innerText).toEqual('CREATE_SOURCE_ERROR_MESSAGE');
    expect(token).toBeNull();
  });
});