import nodeFetch from 'node-fetch';

export const fetch = window?.fetch.bind(window) || nodeFetch;
