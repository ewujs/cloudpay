import PayPalPayload from './payload/paypal-payload';
import { displayErrorMsg } from './utils';

/**
 * A CloudPayPayPal object.
 * @typedef {Object} CloudPayPayPal 
 * @property {Object} siteInfo - The site information.
 * @property {Object} drPayments - An instance of the DigitalRiver object.
 * @property {string} sourceId - The payment source ID.
 * @property {string} token - The PayPal token.
 * @property {string} redirectUrl - The customer should be redirected to to continue the process.
 * @property {Object} page - An instance of the Page class.
 */
const CloudPayPayPal = {
  siteInfo: null,
  drPayments: null,
  sourceId: null,
  token: null,
  redirectUrl: null,
  page: null,
  /**
   * Initiate drPayments, siteInfo and page properties.
   * @param {Object} drPayments - An instance of the DigitalRiver object.
   * @param {Object} siteInfo - The site information.
   * @param {Object} page - An instance of the Page class.
   * @throws Will throw an error if page is not an object.
   */
  init(drPayments, siteInfo, page) {
    if (typeof page !== 'object') {
      throw new Error('Please pass an instance of the Page class.');
    }
    
    this.drPayments = drPayments;
    this.siteInfo = siteInfo;
    this.page = page;
  },
  /**
   * Get the PayPal token and update sourceId, token and redirectUrl properties.
   * @async
   * @return {Promise<string>} The PayPal token.
   */
  async getToken() {
    if (this.token) {
      return this.token;
    } else {
      const PP = new PayPalPayload(this.siteInfo, this.page);

      try {
        const payload = await PP.buildPayload();

        return this.drPayments.createSource(payload).then((result) => {
          if (result.hasOwnProperty('errors')) {
            displayErrorMsg(this.page, result.errors[0].message);
          } else {
            this.token = result.source.payPal.token;
            this.sourceId = result.source.id;
            this.redirectUrl = result.source.redirect.redirectUrl;
          }

          return this.token;
        });
      } catch (error) {
        console.error(error.message);
      }
    }
  }
};

export default CloudPayPayPal;