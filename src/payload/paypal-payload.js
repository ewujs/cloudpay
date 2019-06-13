import Payload from './payload';

/**
 * Class representing a PayPal payload.
 * @extends Payload
 */
class PayPalPayload extends Payload {
  /**
   * Create a PayPal payload.
   * @param {Object} siteInfo - The site information.
   * @param {Object} page - An instance of the Page class.
   * @throws Will throw an error if returnUrl or cancelUrl is undefined or empty.
   */
  constructor(siteInfo, page) {
    super(siteInfo, page);

    if (!this.siteInfo.returnUrl) {
      throw new Error('Please pass the return URL for PayPal.');
    }

    if (!this.siteInfo.cancelUrl) {
      throw new Error('Please pass the cancel URL for PayPal.');
    }
    
    this.taxAmount = 0;
    this.shippingAmount = 0;
    this.amount = 0;
    this.amountsEstimated = true;
  }

  /**
   * Get a single item object.
   * @param {string} name - The name of a product.
   * @param {number} qty - The quantity of a product.
   * @param {number} listPrice - The list price of a product.
   * @return {Object} The item object.
   */
  getItemObj(name, qty, listPrice) {
    return {
      'name': name,
      'quantity': qty,
      'unitAmount': listPrice
    };
  }

  /**
   * Get all items.
   * @async
   * @return {Promise<Object[]>} An array of the item object.
   */
  async getPayPalItemsObj() {
    let itemsObj;

    try {
      const lineItems = await super.getLineItems();

      itemsObj = lineItems.map((obj) => {
        return this.getItemObj(obj.product.displayName, obj.quantity, obj.pricing.listPrice.value);
      });
  
      return itemsObj;
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Build the PayPal payload.
   * @async
   * @return {Promise<Object>} The PayPal payload.
   */
  async buildPayload() {
    let payPalObj;
    let sourceData = {
      'type': 'payPal',
      'currency': this.siteInfo.currency
    };

    try {
      await super.getAmount();
      const itemsObj = await this.getPayPalItemsObj();

      payPalObj = {
        'returnUrl': this.siteInfo.returnUrl,
        'cancelUrl': this.siteInfo.cancelUrl,
        'items': itemsObj,
        'taxAmount': this.taxAmount,
        'shippingAmount': this.shippingAmount,
        'amountsEstimated': this.amountsEstimated,
        'requestShipping': this.siteInfo.shippingRequired
      };

      if (this.siteInfo.shippingRequired) {
        payPalObj['shipping'] = await super.getShippingObj();
      }

      sourceData['amount'] = this.amount;
      sourceData['payPal'] = payPalObj;

      return sourceData;
    } catch (error) {
      throw Error(error);
    }
  }
}

export default PayPalPayload;