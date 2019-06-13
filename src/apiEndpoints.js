import axios from 'axios';
import {getApiDomain} from './utils';

const subdomain = window.location.hostname.split('.')[0];
const apiDomain = getApiDomain(subdomain);

// Payments Service API
const paymentsService = axios.create({
  baseURL: `https://${apiDomain}/payments/`
});

// Shoppers API
const shoppersApi = axios.create({
  baseURL: `https://${apiDomain}/v1/shoppers/`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// GC
const gc = axios.create({
  baseURL: `https://${window.location.hostname}/store/`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const establishAccessToken = (siteId, apiKey) => gc.get(`/${siteId}/SessionToken?apiKey=${apiKey}`);

export const getPaymentSource = (sourceId, apiKey) => paymentsService.get(`/sources/${sourceId}?apiKey=${apiKey}`);

export const retrieveLineItems = (isTestOrder, token) => shoppersApi.get(`/me/carts/active/line-items?testOrder=${isTestOrder}`, {headers: {Authorization: `Bearer ${token}`}});

export const applyAddress = (isTestOrder, data, token) => shoppersApi.post(`/me/carts/active?testOrder=${isTestOrder}`, data, {headers: {Authorization: `Bearer ${token}`}});

export const applyPaymentMethod = (isTestOrder, data, token) => shoppersApi.post(`/me/carts/active/apply-payment-method?testOrder=${isTestOrder}`, data, {headers: {Authorization: `Bearer ${token}`}});

export const getShippingAddress = (isTestOrder, token) => shoppersApi.get(`/me/carts/active/shipping-address?testOrder=${isTestOrder}`, {headers: {Authorization: `Bearer ${token}`}});

export const getBillingAddress = (isTestOrder, token) => shoppersApi.get(`/me/carts/active/billing-address?testOrder=${isTestOrder}`, {headers: {Authorization: `Bearer ${token}`}});

export const getCurrentShopper = (isTestOrder, token) => shoppersApi.get(`/me?testOrder=${isTestOrder}`, {headers: {Authorization: `Bearer ${token}`}});