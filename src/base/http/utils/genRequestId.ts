import { AxiosRequestConfig } from 'axios';

export const genRequestId = (config: AxiosRequestConfig) => {
  let { data } = config;
  const { url, method, params } = config;
  if (typeof data === 'string') data = JSON.parse(data);
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
};
