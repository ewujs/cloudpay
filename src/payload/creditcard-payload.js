import Payload from './payload';

/**
 * Class representing a Credit Card payload.
 * @extends Payload
 */
class CreditCardPayload extends Payload {
  /**
   * Create a Credit Card payload.
   * @param {Object} siteInfo - The site information.
   * @param {Object} page - An instance of the Page class.
   */
  constructor(siteInfo, page) {
    super(siteInfo, page);
  }

  /**
   * Build the Credit Card payload.
   * @async
   * @return {Object} The Credit Card payload.
   */
  async buildPayload() {
    let sourceData = {
      'type': 'creditCard',
      'currency': this.siteInfo.currency,
      'amount': 0
    };

    try {
      sourceData['owner'] = await super.getOwnerObj();
      return sourceData;
    } catch (error) {
      throw Error(error);
    }
  }
}

export default CreditCardPayload;