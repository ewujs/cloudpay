import PayPalPayload from '../src/payload/paypal-payload';
import Payload from '../src/payload/payload';
import mockAxios from 'axios';
import Page from '../src/page-model';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
    '  <input name="shippingDifferentThanBilling" value="on" id="shippingDifferentThanBilling" type="checkbox">' +
    '  <input type="checkbox" name="testOrder" value="on" checked="checked">' +
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

describe('build the PayPal payload', () => {
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

  test('instantiate class', () => {
    const page = new Page();
    const P = new PayPalPayload({
      currency: 'USD',
      returnUrl: 'http://mypage.com',
      cancelUrl: 'http://mypage.com/cancel'
    }, page);

    expect(P).not.toBeNull();
    expect(P).toBeInstanceOf(PayPalPayload);
  });

  test('throws with no returnUrl', () => {
    expect(() => {
      const page = new Page();
      new PayPalPayload({
        currency: 'USD',
        cancelUrl: 'http://mypage.com/cancel'
      }, page);
    }).toThrow();
  });

  test('throws with no cancelUrl', () => {
    expect(() => {
      const page = new Page();
      new PayPalPayload({
        currency: 'USD',
        returnUrl: 'http://mypage.com'
      }, page);
    }).toThrow();
  });

  test('get PayPal items object', async () => {
    const stubLineItems = [
      {
        'uri': 'https://api.digitalriver.com/v1/shoppers/me/carts/active/line-items/63284301000',
        'id': 63284301000,
        'quantity': 1,
        'product': {
          'uri': 'https://api.digitalriver.com/v1/shoppers/me/products/313362600',
          'displayName': 'Digital River Soccer Mania',
          'thumbnailImage': 'https://drh.img.digitalriver.com/DRHM/Storefront/Company/standard/images/product/thumbnail/Soccer-Mania_Console-Game_240x136.png'
        },
        'pricing': {
          'listPrice': {
            'currency': 'USD',
            'value': 100
          },
          'listPriceWithQuantity': {
            'currency': 'USD',
            'value': 100
          },
          'salePriceWithQuantity': {
            'currency': 'USD',
            'value': 90
          },
          'formattedListPrice': '$100.00',
          'formattedListPriceWithQuantity': '$100.00',
          'formattedSalePriceWithQuantity': '$90.00'
        }
      }
    ];
    
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          lineItems: {
            lineItem: stubLineItems
          }
        }
      })
    );
    
    const page = new Page();
    const P = new PayPalPayload({
      currency: 'USD',
      returnUrl: 'http://mypage.com',
      cancelUrl: 'http://mypage.com/cancel'
    }, page);

    const paypalItemsObj = await P.getPayPalItemsObj();

    expect(paypalItemsObj).toEqual([{
      'name': 'Digital River Soccer Mania',
      'quantity': 1,
      'unitAmount': 100
    }]);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/me/carts/active/line-items?testOrder=true', {headers: {Authorization: 'Bearer null'}});
  });

  test('test error with getPayPalItemsObj', async () => {
    Payload.prototype.getLineItems = jest.fn(() => Promise.reject({errors: []}));

    const page = new Page();
    const P = new PayPalPayload({
      currency: 'USD',
      returnUrl: 'http://mypage.com',
      cancelUrl: 'http://mypage.com/cancel'
    }, page);

    const itemsObj = await P.getPayPalItemsObj();

    expect(itemsObj).toEqual(undefined);
  });

  test('test error with buildPayload', async () => {
    Payload.prototype.getAmount = jest.fn(() => Promise.reject({errors: []}));
    PayPalPayload.prototype.getPayPalItemsObj = jest.fn(() => Promise.reject({errors: []}));

    const page = new Page();
    const P = new PayPalPayload({
      currency: 'USD',
      returnUrl: 'http://mypage.com',
      cancelUrl: 'http://mypage.com/cancel'
    }, page);

    const payload = await P.buildPayload();

    expect(payload).toEqual(undefined);
  });

  test('build the payload', async () => {
    let siteInfo = {
      apiKey : '6a0bb049109c4a0f8d8dff7db896254b',
      id: 'sotw2',
      locale: 'en_US',
      currency : 'USD',
      shippingRequired : false,
      env: 'DESIGN',
      returnUrl: 'http://mypage.com',
      cancelUrl: 'http://mypage.com/cancel'
    };

    Payload.prototype.getAmount = jest.fn();

    PayPalPayload.prototype.getPayPalItemsObj = jest.fn(() => {
      return [{
        'name': 'Digital River Soccer Mania',
        'quantity': 2,
        'unitAmount': 100
      }]
    });

    const page = new Page();
    const P = new PayPalPayload(siteInfo, page);
    const payload = await P.buildPayload();
  
    expect(payload).toEqual(
      expect.objectContaining({
        'type': 'payPal',
        'currency': 'USD',
        'amount': 0,
        'payPal': {
          'returnUrl': 'http://mypage.com',
          'cancelUrl': 'http://mypage.com/cancel',
          'items': [{
            'name': 'Digital River Soccer Mania',
            'quantity': 2,
            'unitAmount': 100
          }],
          'taxAmount': 0,
          'shippingAmount': 0,
          'amountsEstimated': true
        } 
      }),
      expect.not.objectContaining({
        'owner': 'test'
      }),
    );

    Payload.prototype.getShippingObj = jest.fn(() => {
      return {
        'recipient': 'abc xyz',
        'phoneNumber': '12345678',
        'address': {
          'line1': '1600 Amphitheatre Parkway',
          'line2': null,
          'city': 'Mountain View',
          'state': 'CA',
          'country': 'US',
          'postalCode': '94043'
        }
      };
    });

    siteInfo['shippingRequired'] = true;
    
    const PP = new PayPalPayload(siteInfo, page);
    const shipPayload = await PP.buildPayload();

    expect(shipPayload).toEqual(
      expect.objectContaining({
        'type': 'payPal',
        'currency': 'USD',
        'amount': 0,
        'payPal': {
          'returnUrl': 'http://mypage.com',
          'cancelUrl': 'http://mypage.com/cancel',
          'items': [{
            'name': 'Digital River Soccer Mania',
            'quantity': 2,
            'unitAmount': 100
          }],
          'taxAmount': 0,
          'amountsEstimated': true,
          'shippingAmount': 0,
          'shipping': {
            'recipient': 'abc xyz',
            'phoneNumber': '12345678',
            'address': {
              'line1': '1600 Amphitheatre Parkway',
              'line2': null,
              'city': 'Mountain View',
              'state': 'CA',
              'country': 'US',
              'postalCode': '94043'
            }
          }
        } 
      }),
      expect.not.objectContaining({
        'owner': 'test'
      }),
    );
  });
});