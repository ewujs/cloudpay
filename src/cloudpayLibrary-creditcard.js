/**
 * A CloudPayCreditCard object.
 * @typedef {Object} CloudPayCreditCard 
 * @property {Object} cardNumber - A UI component that DigitalRiver.js creates to collcect the card number.
 * @property {Object} cardExpiration - A UI component that DigitalRiver.js creates to collcect the card expiration date.
 * @property {Object} cardSecurityCode - A UI component that DigitalRiver.js creates to collcect the CVV code.
 * @property {Object} cardElements - An object that contains cardNumber, cardExpiration and cardSecurityCode elements.
 * @property {Object} page - An instance of the Page class.
 * @property {Function} init - A function that creates the Credit Card elements and mounts them to the DOM.
 * @property {Function} addEventListener - A function that attaches an event handler function for an event to the target.
 */
const CloudPayCreditCard = {
  cardNumber: null,
  cardExpiration: null,
  cardSecurityCode: null,
  cardElements: null,
  page: null,
  /**
   * Create the Credit Card elements and mount them to the DOM using DigitalRiver.js.
   * @param {Object} drPayments - An instance of the DigitalRiver object.
   * @param {Object} [opt] - An object that is able to customize styles and classes for the Credit Card elements.
   * @param {Object} page - An instance of the Page class.
   * @return {Object} An object that contains cardNumber, cardExpiration and cardSecurityCode elements.
   * @throws Will throw an error if page is not an object.
   */
  init(drPayments, opt, page) {
    if (typeof page !== 'object') {
      throw new Error('Please pass an instance of the Page class.');
    }

    this.page = page;
    let options = opt;

    if (Object.keys(options).length === 0) {
      options = {
        style: {
          base: {
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '14px'
          }
        }
      }
    }

    this.cardNumber = drPayments.createElement('cardnumber', options);
    this.cardExpiration = drPayments.createElement('cardexpiration', options);
    this.cardSecurityCode = drPayments.createElement('cardcvv', options);
    this.cardElements = {
      cardNumber: this.cardNumber,
      cardExpiration: this.cardExpiration,
      cardSecurityCode: this.cardSecurityCode
    };

    if (this.page.cardNumberWrapper) {
      this.cardNumber.mount(this.page.cardNumberWrapper.id);
      this.cardExpiration.mount(this.page.cardExpirationWrapper.id);
      this.cardSecurityCode.mount(this.page.cardSecurityWrapper.id);

      this.page.cardNumberWrapper.style.display ='block';
      this.page.cardExpirationWrapper.style.display ='block';
      this.page.cardSecurityWrapper.style.display ='block';

      if (this.page.cardNumberWrapper.dataset.lastFourDigits) {
        this.page.creditCardRadio.checked = true;
        this.page.creditCardRadio.click();
      }
    }

    this.addEventListener();

    return this.cardElements;
  },
  addEventListener() {
    if (this.page.editCreditCardLink) {
      this.page.editCreditCardLink.addEventListener('click', () => {
        this.page.lastFourDigits.style.display ='none';
        this.page.cardExpiration.style.display ='none';
        this.page.cardNumberWrapper.style.display ='block';
        this.page.cardExpirationWrapper.style.display ='block';
        this.page.cardSecurityWrapper.style.display ='block';
        this.page.checkoutForm.elements['ORIG_VALUE_cloudPaySourceID'].value = '';
        this.page.checkoutForm.elements['cloudPaySourceID'].value = '';
      });
    }
  }
};

export default CloudPayCreditCard;