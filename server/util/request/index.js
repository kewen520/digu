const request = require('request');
const uuidv4 = require('uuid/v4');

const DEFAULT_HEADERS = {};
const DEFAULT_TIMEOUT = 3000;

/**
 * post请求
 * @param url
 * @param body
 * @param headers
 * @param timeout
 * @returns {Promise}
 */
const post = (url, body = '', headers = DEFAULT_HEADERS, timeout = DEFAULT_TIMEOUT) => {
  if (!headers['X-Request-Id']) {
    headers['X-Request-Id'] = uuidv4();
  }
  const options = { url, body, headers, timeout };
  return new Promise((resolve, reject) => {
    const req = request.post(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(new Error(
          `请求错误!` + (error ? error.message : ''),
          req,
          response ? response.statusCode : '',
        ));
      }
    });
  });
};

/**
 * get请求
 * @param url
 * @param headers
 * @param timeout
 * @returns {Promise}
 */
const get = (url, headers = DEFAULT_HEADERS, timeout = DEFAULT_TIMEOUT) => {
  if (!headers['X-Request-Id']) {
    headers['X-Request-Id'] = uuidv4();
  }
  const options = { url, headers, timeout };
  return new Promise((resolve, reject) => {
    const req = request.get(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(new Error(
          `请求错误!` + (error ? error.message : ''),
          req,
          response ? response.statusCode : '',
        ));
      }
    });
  });
};

module.exports = {
  post,
  get,
};
