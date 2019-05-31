import { retrieveLineItems, applyAddress, getShippingAddress, getBillingAddress, getCurrentShopper } from '../apiEndpoints';
import { isTestOrder } from '../utils';

/** Class representing a payload. */
class Payload {
  /**
   * Create a payload.
   * @param {Object} siteInfo - The site information.
   * @param {Object} page - An instance of the Page class.
   * @throws Will throw an error if the siteInfo is empty or the page is undefined.
   */
  constructor(siteInfo = {}, page) {
    if (Object.keys(siteInfo).length === 0) {
      throw new Error('Please pass the site info');
    }

    if (typeof page !== 'object') {
      throw new Error('Please pass an instance of the Page class.');
    }

    this.siteInfo = siteInfo;
    this.page = page;
    this.shippingAmount = null;
    this.taxAmount = null;
    this.amount = null;
    this.testOrder = isTestOrder(page);
  }

  /**
   * Get the owner object.
   * @async
   * @return {Object} The owner object.
   */
  async getOwnerObj() {
    const token = sessionStorage.getItem('gcAccessToken');

    try {
      const currentShopper = await getCurrentShopper(this.testOrder, token);
      const email = (currentShopper.data.shopper.id === 'Anonymous') ? this.page.email.value : currentShopper.data.shopper.emailAddress;

      return {
        'firstName': this.page.firstName.value,
        'lastName': this.page.lastName.value,
        'email': email,
        'address': {
          'line1': this.page.line1.value,
          'line2': this.page.line2.value,
          'city': this.page.city.value,
          'state': this.page.state.value,
          'postalCode': this.page.postalCode.value,
          'country': this.page.country.value
        }
      };
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Get the address object.
   * @async
   * @return {Object} The address object.
   */
  async getAddressObj() {
    const token = sessionStorage.getItem('gcAccessToken');
    let billingEmail;
    let shippingEmail;
    let addressObj = {};

    try {
      const currentShopper = await getCurrentShopper(this.testOrder, token);

      if (currentShopper.data.shopper.id === 'Anonymous') {
        billingEmail = this.page.email.value;
        shippingEmail = this.page.shippingEmail.value;
      } else {
        const shopperBillingAddress = await getBillingAddress(this.testOrder, token);
        const shopperShippingAddress = await getShippingAddress(this.testOrder, token);
  
        billingEmail = shopperBillingAddress.data.address.emailAddress;
        shippingEmail = shopperShippingAddress.data.address.emailAddress;
      }

      const billingAddressObj = {
        'firstName': this.page.firstName.value,
        'lastName': this.page.lastName.value,
        'emailAddress': billingEmail,
        'companyName': this.page.companyName.value,
        'line1': this.page.line1.value,
        'line2': this.page.line2.value,
        'line3': null,
        'city': this.page.city.value,
        'countrySubdivision': this.page.state.value,
        'postalCode': this.page.postalCode.value,
        'country': this.page.country.value,
        'phoneNumber': this.page.phoneNumber.value
      };

      if (this.siteInfo.shippingRequired && this.page.shippingAddressCheckbox) {
        const isBillingOnly = !this.page.shippingAddressCheckbox.checked;
  
        if (isBillingOnly) {
          addressObj = {
            'billingAddress': billingAddressObj,
            'shippingAddress': billingAddressObj
          };
        } else {
          addressObj = {
            'billingAddress': billingAddressObj,
            'shippingAddress': {
              'firstName': this.page.shippingFirstName.value,
              'lastName': this.page.shippingLastName.value,
              'emailAddress': shippingEmail,
              'companyName': this.page.shippingCompanyName.value,
              'line1': this.page.shippingLine1.value,
              'line2': this.page.shippingLine2.value,
              'line3': null,
              'city': this.page.shippingCity.value,
              'countrySubdivision': this.page.shippingState.value,
              'postalCode': this.page.shippingPostalCode.value,
              'country': this.page.shippingCountry.value,
              'phoneNumber': this.page.shippingPhoneNumber.value
            }
          };
        }
      } else {
        addressObj = {
          'billingAddress': billingAddressObj
        };
      }
  
      return addressObj;
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Get all line items from a cart.
   * @async
   * @return {Promise<Object[]>} An array of the lineItem object.
   */
  async getLineItems() {
    const token = sessionStorage.getItem('gcAccessToken');

    try {
      const res = await retrieveLineItems(this.testOrder, token);

      return res.data.lineItems.lineItem;
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Get the order amount and update shippingAmount, taxAmount and amount class properties.
   * @async
   * @return {number} The value of the order total.
   */
  async getAmount() {
    const addressObj = this.getAddressObj();
    const data = {
      cart: addressObj
    };
    const token = sessionStorage.getItem('gcAccessToken');

    try {
      const res = await applyAddress(this.testOrder, data, token);

      this.shippingAmount = res.data.cart.pricing.shippingAndHandling.value;
      this.taxAmount = res.data.cart.pricing.tax.value;
      this.amount = res.data.cart.pricing.orderTotal.value;

      return this.amount;
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Get the shipping object for the PayPal payload.
   * @async
   * @return {Promise<Object>} The shipping object for the PayPal payload.
   */
  async getShippingObj() {
    const token = sessionStorage.getItem('gcAccessToken');

    try {
      const res = await getShippingAddress(this.testOrder, token);

      return {
        'recipient': res.data.address.firstName + ' ' + res.data.address.lastName,
        'phoneNumber': res.data.address.phoneNumber,
        'address': {
          'line1': res.data.address.line1,
          'line2': res.data.address.line2,
          'city': res.data.address.city,
          'state': res.data.address.countrySubdivision,
          'country': res.data.address.country,
          'postalCode': res.data.address.postalCode
        }
      };
    } catch (error) {
      throw Error(error);
    }
  }  
}

export default Payload;