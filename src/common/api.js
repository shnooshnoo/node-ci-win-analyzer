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

export const fetchTests = () => fetch(getTestsUrl()).then((res) => res.json());
