export const domain = 'https://ci.nodejs.org/';

const params = {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('shnooshnoo:11ef43bd6bc463cce94fa1f28e1d6596f1')
  },
};

export const f = (url) => fetch(url, params);
