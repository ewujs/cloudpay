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
    '  <input name="SHIPPINGphoneNumber" value="shippingPhoneNumber" id="shippingPhoneNumber" type="tel">'
    '</div>';
};

const siteInfo = {
  apiKey : '6a0bb049109c4a0f8d8dff7db896254b',
  id: 'sotw2',
  locale: 'en_US',
  currency : 'USD',
  shippingRequired : false,
  env: 'DESIGN'
};

describe('payload class', () => {
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
    const P = new Payload({currency: 'USD'}, page);
  
    expect(P).not.toBeNull();
    expect(P).toBeInstanceOf(Payload);
  });
  
  test('throws with no params', () => {
    expect(() => {
      new Payload();
    }).toThrow();
  });

  test('throws when siteInfo is empty', () => {
    expect(() => {
      const page = new Page();
      new Payload({}, page);
    }).toThrow();
  });

  test('throws when page is undefined', () => {
    expect(() => {
      new Payload({currency: 'USD'});
    }).toThrow();
  });
  
  test('get the owner object', () => {
    const page = new Page();
    const P = new Payload({currency: 'USD'}, page);
    const ownerObj = P.getOwnerObj();
  
    expect(ownerObj).toEqual(
      expect.objectContaining({
        'firstName': 'name1',
        'lastName': 'name2',
        'email': 'email',
        'address': {
          'line1': 'address1',
          'line2': 'address2',
          'city': 'city',
          'state': 'state',
          'postalCode': 'postalCode',
          'country': 'country'
        }
      }),
      expect.not.objectContaining({
        'currency': 'test'
      }),
    );
  });

  test('get the address object for digital products', () => {
    const page = new Page();
    const P = new Payload({currency: 'USD', shippingRequired: false}, page);
    const addressObj = P.getAddressObj();

    expect(addressObj).toEqual(
      expect.objectContaining({
        'billingAddress': {
          'firstName': 'name1',
          'lastName': 'name2',
          'emailAddress': 'email',
          'companyName': 'DR',
          'line1': 'address1',
          'line2': 'address2',
          'line3': null,
          'city': 'city',
          'countrySubdivision': 'state',
          'postalCode': 'postalCode',
          'country': 'country',
          'phoneNumber': '12345678'
        }
      }),
      expect.not.objectContaining({
        'currency': 'test'
      }),
    );
  });

  test('get the only-billing address object for physical products', () => {
    document.getElementById('shippingDifferentThanBilling').checked = false;
    
    const page = new Page();
    const P = new Payload({currency: 'USD', shippingRequired: true}, page);
    const addressObj = P.getAddressObj();

    expect(addressObj).toEqual(
      expect.objectContaining({
        'billingAddress': {
          'firstName': 'name1',
          'lastName': 'name2',
          'emailAddress': 'email',
          'companyName': 'DR',
          'line1': 'address1',
          'line2': 'address2',
          'line3': null,
          'city': 'city',
          'countrySubdivision': 'state',
          'postalCode': 'postalCode',
          'country': 'country',
          'phoneNumber': '12345678'
        },
        'shippingAddress': {
          'firstName': 'name1',
          'lastName': 'name2',
          'emailAddress': 'email',
          'companyName': 'DR',
          'line1': 'address1',
          'line2': 'address2',
          'line3': null,
          'city': 'city',
          'countrySubdivision': 'state',
          'postalCode': 'postalCode',
          'country': 'country',
          'phoneNumber': '12345678'
        }
      }),
      expect.not.objectContaining({
        'currency': 'test'
      }),
    );
  });

  test('get the address object for physical products', () => {
    document.getElementById('shippingDifferentThanBilling').checked = true;
    
    const page = new Page();
    const P = new Payload({currency: 'USD', shippingRequired: true}, page);
    const addressObj = P.getAddressObj();

    expect(addressObj).toEqual(
      expect.objectContaining({
        'billingAddress': {
          'firstName': 'name1',
          'lastName': 'name2',
          'emailAddress': 'email',
          'companyName': 'DR',
          'line1': 'address1',
          'line2': 'address2',
          'line3': null,
          'city': 'city',
          'countrySubdivision': 'state',
          'postalCode': 'postalCode',
          'country': 'country',
          'phoneNumber': '12345678'
        },
        'shippingAddress': {
          'firstName': 'shippingName1',
          'lastName': 'shippingName2',
          'emailAddress': 'shippingEmail',
          'companyName': 'shippingCompanyName',
          'line1': 'shippingAddress1',
          'line2': 'shippingAddress2',
          'line3': null,
          'city': 'shippingCity',
          'countrySubdivision': 'shippingState',
          'postalCode': 'shippingPostalCode',
          'country': 'shippingCountry',
          'phoneNumber': 'shippingPhoneNumber'
        }
      }),
      expect.not.objectContaining({
        'currency': 'test'
      }),
    );
  });

  test('get line items', async () => {
    const stubLineItems = [
      {
        'uri': 'https://api.digitalriver.com/v1/shoppers/me/carts/active/line-items/63284301000',
        'id': 63284301000,
        'quantity': 1,
        'product': {
          'uri': 'https://api.digitalriver.com/v1/shoppers/me/products/313362600',
          'displayName': 'Digital River Soccer Mania (Digital Download)',
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
    const P = new Payload(siteInfo, page);
    const lineItems = await P.getLineItems();

    expect(lineItems).toEqual(stubLineItems);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/me/carts/active/line-items?testOrder=true', {headers: {Authorization: 'Bearer null'}});
  });

  test('test error with getLineItems', async () => {
    const page = new Page();
    const P = new Payload(siteInfo, page);
    P.siteInfo = null;

    await expect(P.getLineItems()).rejects.toThrow();
  });

  test('get order amount', async () => {
    const stubCartPricing = {
      'subtotal': {
        'currency': 'USD',
        'value': 90
      },
      'discount': {
        'currency': 'USD',
        'value': 0
      },
      'shippingAndHandling': {
        'currency': 'USD',
        'value': 0
      },
      'tax': {
        'currency': 'USD',
        'value': 6.19
      },
      'orderTotal': {
        'currency': 'USD',
        'value': 96.19
      },
      'formattedSubtotal': '$90.00',
      'formattedDiscount': '$0.00',
      'formattedShippingAndHandling': '$0.00',
      'formattedTax': '$6.19',
      'formattedOrderTotal': '$96.19'
    };
    
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          cart: {
            pricing: stubCartPricing
          }
        }
      })
    );

    const page = new Page();
    const P = new Payload(siteInfo, page);
    const amount = await P.getAmount();
    const addressObj = P.getAddressObj();

    expect(amount).toEqual(stubCartPricing.orderTotal.value);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith('/me/carts/active?testOrder=true', {cart: addressObj}, {headers: {Authorization: 'Bearer null'}});
  });

  test('test error with getAmount', async () => {
    const page = new Page();
    const P = new Payload(siteInfo, page);
    P.apiDomain = null;

    await expect(P.getAmount()).rejects.toThrow();
  });

  test('get shipping object', async () => {
    const stubShippingAddressObj = {
      'uri': 'https://api.digitalriver.com/v1/shoppers/me/carts/active/shipping-address',
      'id': 'shippingAddress',
      'firstName': 'abc',
      'lastName': 'xyz',
      'companyName': 'DR',
      'line1': '10380 Bren Rd W',
      'line2': null,
      'line3': null,
      'city': 'Minnetonka',
      'countrySubdivision': 'MN',
      'postalCode': '55343-9072',
      'country': 'US',
      'countryName': 'United States',
      'phoneNumber': '9522531234',
      'emailAddress': 'ewu@dr.com',
      'suggestions': {
        'uri': 'https://api.digitalriver.com/v1/shoppers/me/carts/active/shipping-address/suggestions'
      }
    };
    
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          address: stubShippingAddressObj
        }
      })
    );

    const page = new Page();
    const P = new Payload(siteInfo, page);
    const shippingObj = await P.getShippingObj();

    expect(shippingObj).toEqual({
      'recipient': stubShippingAddressObj.firstName + ' ' + stubShippingAddressObj.lastName,
      'phoneNumber': stubShippingAddressObj.phoneNumber,
      'address': {
        'line1': stubShippingAddressObj.line1,
        'line2': stubShippingAddressObj.line2,
        'city': stubShippingAddressObj.city,
        'state': stubShippingAddressObj.countrySubdivision,
        'country': stubShippingAddressObj.country,
        'postalCode': stubShippingAddressObj.postalCode
      }
    });
    expect(mockAxios.get).toHaveBeenCalledTimes(3);
    expect(mockAxios.get).toHaveBeenCalledWith('/me/carts/active/shipping-address?testOrder=true', {headers: {Authorization: 'Bearer null'}});
  });

  test('test error with getShippingObj', async () => {
    const page = new Page();
    const P = new Payload(siteInfo, page);
    P.apiDomain = null;

    await expect(P.getShippingObj()).rejects.toThrow();
  });
});