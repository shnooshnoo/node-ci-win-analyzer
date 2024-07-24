import { isProd } from './env.js';

const getPRsUrl = (includeUnstable) => {
  if (!isProd()) {
    return `http://localhost:3000/api/prs?includeUnstable=${includeUnstable}`;
  }
  if (includeUnstable) {
    return './assets/prs_unstable.json';
  }
  return './assets/prs.json';
}

const getTestsUrl = () => {
  if (!isProd()) {
    return 'http://localhost:3000/api/tests';
  }
  return './assets/tests.json';
}

export const fetchPRs = (includeUnstable) => fetch(getPRsUrl(includeUnstable)).then((res) => res.json());

export const fetchTests = async () => {
  const url = getTestsUrl();
  if (!isProd()) {
    return fetch(url).then((res) => res.json());
  }
  return await fetchTestsProd(url);
}

const fetchTestsProd = async url => {
  const response = await fetch(url);
  const data = await response.json();
  const files = data.data;
  const filesData = await Promise.all(files.map(file => fetch(file).then(res => res.json())));
  const result = filesData.reduce((res, tests) => [...res, ...tests.data], []);
  return { data: result};
};
