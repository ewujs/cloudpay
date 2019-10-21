import CloudPayCreditCard from '../src/cloudpayLibrary-creditcard';
import Page from '../src/page-model';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
    '  <form method="post" action="/store/" name="CheckoutAddressForm">' +
    '    <input type="hidden" name="ORIG_VALUE_cloudPaySourceID" value="">' +
    '    <input type="hidden" name="cloudPaySourceID" value="">' +
    '  </form>' +
    '  <div id="card-number"></div>' +
    '  <div id="card-expiration"></div>' +
    '  <div id="card-security-code"></div>' +
    '  <input type="radio" name="paymentMethodID" value="-1" id="CreditCardMethod" checked="checked">' +
    '  <div id="cloudPay"></div>' +
    '</div>';
};

const DigitalRiver = {};

Object.defineProperty(DigitalRiver, 'createElement', {
  value: jest.fn()
});

describe('CloudPay - Credit Card', () => {
  beforeEach(() => {
    setupDocumentBody();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('throws with no params', () => {
    expect(() => {
      CloudPayCreditCard.init();
    }).toThrow();
  });

  test('init', () => {
    const page = new Page();
    const options = {
      style: {
        base: {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '18px'
        }
      }
    };
    const mount = (id) => {
      document.getElementById(id).innerText = id;
    };
    
    DigitalRiver.createElement.mockImplementation((type, options) => {
      return {
        type: type,
        mount: mount,
        options: options
      };
    });

    CloudPayCreditCard.init(DigitalRiver, {}, page);
    CloudPayCreditCard.init(DigitalRiver, options, page);

    expect(page.cardNumberWrapper.innerText).toEqual('card-number');
    expect(page.cardExpirationWrapper.innerText).toEqual('card-expiration');
    expect(page.cardSecurityWrapper.innerText).toEqual('card-security-code');
    expect(page.cardNumberWrapper.style.display).toEqual('block');
    expect(page.cardExpirationWrapper.style.display).toEqual('block');
    expect(page.cardSecurityWrapper.style.display).toEqual('block');
  });

  test('init() returns Credit Card elements', () => {
    const page = new Page();
    const creditCardElements = CloudPayCreditCard.init(DigitalRiver, {}, page);

    expect(creditCardElements).toEqual(
      expect.objectContaining({
        cardNumber: expect.any(Object),
        cardExpiration: expect.any(Object),
        cardSecurityCode: expect.any(Object)
      }),
    );
  });

  test('without cardNumberWrapper', () => {
    const cardNumberWrapper = document.getElementById('card-number');
    cardNumberWrapper.parentNode.removeChild(cardNumberWrapper);

    const page = new Page();
    CloudPayCreditCard.init(DigitalRiver, {}, page);

    expect(page.cardNumberWrapper).toBeNull();
    expect(page.cardExpirationWrapper.innerText).toEqual(undefined);
    expect(page.cardSecurityWrapper.innerText).toEqual(undefined);
  });

  test('card info exists', () => {
    document.getElementById('cloudPay').innerHTML = '<div id="dr_lastFourDigits">8888</div>';

    const page = new Page();
    
    page.cardNumberWrapper.dataset.lastFourDigits = '8888';
    page.creditCardRadio.click = jest.fn(() => {
      return true;
    });
    
    CloudPayCreditCard.init(DigitalRiver, {}, page);

    expect(page.creditCardRadio.checked).toBeTruthy();
    expect(page.creditCardRadio.click).toHaveBeenCalled();
  });

  test('event listener', () => {
    document.getElementById('cloudPay').innerHTML = '<a id="dr_editCloudPayCC">Edit</a>' + '<div id="dr_lastFourDigits">8888</div>' + '<div id="dr_cardExpiration">12/28</div>';

    const page = new Page();
    let map = {};

    page.editCreditCardLink.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    CloudPayCreditCard.init(DigitalRiver, {}, page);
    
    map.click();

    expect(page.lastFourDigits.style.display).toEqual('none');
    expect(page.cardExpiration.style.display).toEqual('none');
    expect(page.cardNumberWrapper.style.display).toEqual('block');
    expect(page.cardExpirationWrapper.style.display).toEqual('block');
    expect(page.cardSecurityWrapper.style.display).toEqual('block');
    expect(page.checkoutForm.elements['ORIG_VALUE_cloudPaySourceID'].value).toEqual('');
    expect(page.checkoutForm.elements['cloudPaySourceID'].value).toEqual('');
  });
});