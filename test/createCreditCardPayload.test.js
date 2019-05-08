import CreditCardPayload from '../src/payload/creditcard-payload';
import Payload from '../src/payload/payload';
import Page from '../src/page-model';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
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
    '</div>';
};

describe('build the Credit Card payload', () => {
  beforeEach(() => {
    setupDocumentBody();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('instantiate class', () => {
    const page = new Page();
    const C = new CreditCardPayload({currency: 'USD'}, page);

    expect(C).not.toBeNull();
    expect(C).toBeInstanceOf(CreditCardPayload);
  });
   
  test('build the payload', () => {
    const page = new Page();
    const C = new CreditCardPayload({currency: 'USD'}, page);
    
    Payload.prototype.getOwnerObj = jest.fn(() => {
      return {
        'firstName': page.firstName.value,
        'lastName': page.lastName.value,
        'email': page.email.value,
        'address': {
          'line1': page.line1.value,
          'line2': page.line2.value,
          'city': page.city.value,
          'state': page.state.value,
          'postalCode': page.postalCode.value,
          'country': page.country.value
        }
      };
    });

    const payload = C.buildPayload();
  
    expect(payload).toEqual(
      expect.objectContaining({
        'type': 'creditCard',
        'currency': 'USD',
        'amount': 0,
        'owner': {
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
        } 
      }),
      expect.not.objectContaining({
        'payPal': 'test'
      }),
    );
  });
});