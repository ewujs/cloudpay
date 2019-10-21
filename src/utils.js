import {establishAccessToken} from './apiEndpoints';

/**
* Get the API domain.
* @param {string} subdomain - The subdomain.
* @return {string} The API domain.
*/
export function getApiDomain(subdomain) {
 return (subdomain.indexOf('cte') > 0 || subdomain.indexOf('sys') > 0 || subdomain.indexOf('int') > 0) ? 'dispatch-test.digitalriver.com' : 'api.digitalriver.com';
}

/**
 * Check if the order is a test order.
 * @param {Object} page - An instance of the Page class.
 * @return {boolean} Whether the order is a test order.
 */
export function isTestOrder(page) {
  if (page.testOrderCheckbox) {
    return page.testOrderCheckbox.checked;
  } else {
    return false;
  }
}

/**
 * Display the error message.
 * @param {Object} page - An instance of the Page class.
 * @param {string} msg - The error message.
 */
export function displayErrorMsg(page, msg) {
  page.cloudPayErrors.innerText = msg;
}

/**
 * Get the expiry time for GC access token.
 * @param {number} expiresIn - The value of expires_in.
 * @return {number} The expiry time.
 */
export function getTokenExpiryTime(expiresIn) {
  return Date.now() + (expiresIn * 1000);
}

/**
 * Check if the token is expired.
 * @param {number} tokenExpiryTime - The token expiry time.
 * @return {boolean} Whether the token is expired.
 */
export function isTokenExpired(tokenExpiryTime) {
  const nowAddOneMin = Date.now() + 60000;
  return (tokenExpiryTime < nowAddOneMin);
}

/**
 * Get limited access token.
 * @async
 * @param {string} siteId - The site ID.
 * @param {string} apiKey - The public API key.
 * @return {string} The limited access token.
 */
export async function getAccessToken(siteId, apiKey) {
  try {
    const res = await establishAccessToken(siteId, apiKey);

    return res.data.access_token;
  } catch (error) {
    throw Error(error);
  }
}