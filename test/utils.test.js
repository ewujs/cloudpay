import mockAxios from 'axios';
import Page from '../src/page-model';
import { getApiDomain, isTestOrder, getTokenExpiryTime, isTokenExpired, displayErrorMsg, getAccessToken } from '../src/utils';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div>' +
    '  <input type="checkbox" name="testOrder" value="on" checked="checked">' +
    '  <div id="dr_cloudPayErrors"></div>' +
    '</div>';
};

describe('utils test', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    setupDocumentBody();
  });

  afterEach(() => {
    console.error.mockClear();
    
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('get API domain', () => {
    const prod = 'gc.digitalriver.com';
    const test = 'drhadmin-sys-drx.drextenv.net';
  
    expect(getApiDomain(prod)).toEqual('api.digitalriver.com');
    expect(getApiDomain(test)).toEqual('dispatch-test.digitalriver.com');
  });
  
  test('check isTestOrder', () => {
    const page = new Page();
  
    page.testOrderCheckbox.checked = true;
  
    expect(isTestOrder(page)).toBeTruthy();
  
    page.testOrderCheckbox.checked = false;
  
    expect(isTestOrder(page)).not.toBeTruthy();
  });
  
  test('check isTestOrder with no checkbox', () => {
    const checkbox = document.querySelector('input[name="testOrder"]');
    checkbox.parentNode.removeChild(checkbox);
  
    const page = new Page();
    
    expect(isTestOrder(page)).not.toBeTruthy();
  });
  
  test('display error message', () => {
    const page = new Page();
  
    displayErrorMsg(page, 'ERROR_MESSAGE');
  
    expect(page.cloudPayErrors.innerText).toEqual('ERROR_MESSAGE');
  });

  test('token expired test', () => {
    const tokenExpiryTime = Date.now();
    const isExpired = isTokenExpired(tokenExpiryTime);
  
    expect(isExpired).toBeTruthy();
  });

  test('token not expired test', () => {
    const tokenExpiryTime = Date.now() + 100000;
    const isExpired = isTokenExpired(tokenExpiryTime);
  
    expect(isExpired).not.toBeTruthy();
  });

  test('get token expiry time', () => {
    const expiresIn = 10000;
    const expiryTime = getTokenExpiryTime(expiresIn);
    const expectedTime = Date.now() + (expiresIn * 1000);
  
    expect(expiryTime).toEqual(expectedTime);
  });

  test('set GC access token', async () => {
    const siteInfo = {
      apiKey : '6a0bb049109c4a0f8d8dff7db896254b',
      siteId: 'sotw2'
    };
    
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          access_token: 'ACCESS_TOKEN',
          expires_in: 86356
        }
      })
    );
    
    const token = await getAccessToken(siteInfo.siteId, siteInfo.apiKey);

    sessionStorage.setItem('gcAccessToken', token);
  
    expect(token).toEqual('ACCESS_TOKEN');
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/sotw2/SessionToken?apiKey=6a0bb049109c4a0f8d8dff7db896254b');
  });

  test('test error with getAccessToken', async () => {
    const siteInfo = {
      apiKey : '6a0bb049109c4a0f8d8dff7db896254b'
    };
    
    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject({
        errors: []
      })
    );

    await expect(getAccessToken(siteInfo.apiKey)).rejects.toThrow();
  });
});