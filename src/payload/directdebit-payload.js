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
  }

  /**
   * Build the Direct Debit payload.
   * @return {Object} The Direct Debit payload.
   */
  buildPayload() {
    let sourceData = {
      'type': 'directDebit',
      'currency': this.siteInfo.currency,
      'amount': 0,
      'directDebit': {
        'returnUrl': this.siteInfo.returnUrl
      }
    };

    sourceData['owner'] = super.getOwnerObj();
    delete sourceData.owner.address.state;

    return sourceData;
  }
}

export default DirectDebitPayload;