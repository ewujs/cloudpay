import Payload from './payload';

/**
 * Class representing a Direct Debit payload.
 * @extends Payload
 */
class DirectDebitPayload extends Payload {
  /**
   * Create a Direct Debit payload.
   * @param {Object} siteInfo - The site information.
   * @param {Object} page - An instance of the Page class.
   */
  constructor(siteInfo, page) {
    super(siteInfo, page);
    this.amount = 0;
  }

  /**
   * Build the Direct Debit payload.
   * @async
   * @return {Promise<Object>} The Direct Debit payload.
   */
  async buildPayload() {
    let sourceData = {
      'type': 'directDebit',
      'currency': 'EUR',
      'directDebit': {
        'returnUrl': this.siteInfo.returnUrl
      }
    };

    try {
      await super.getAmount();
      sourceData['amount'] = this.amount;
      sourceData['owner'] = await super.getOwnerObj();
      delete sourceData.owner.address.state;
  
      return sourceData;
    } catch (error) {
      throw Error(error);
    }
  }
}

export default DirectDebitPayload;