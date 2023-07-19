const fetch = require("node-fetch");

exports.get = async (url, authToken = null) => {
  return fetchApi(url, "GET", authToken, null);
};

exports.post = async (url, authToken = null, payload) => {
  return fetchApi(url, "POST", authToken, payload);
};

const fetchApi = async (url, type, authToken, payload = null) => {
  try {
    const res = await fetch(url, {
      method: type,
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken ? "Bearer " + authToken : null,
      },
      body: payload ? JSON.stringify(payload) : null
    });
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};
