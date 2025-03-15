import axios from "axios";

const axioInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
});

const fireApiAction = async (url, method = "GET", data = {}) => {
  try {
    method = method.toLowerCase();
    let allData = {
      url,
      method,
    };
    if (method === "get") {
      allData["params"] = data;
    } else if (method === "post") {
      allData["data"] = data;
    } else if (method === "patch" || method === "put" || method === "delete") {
      let updateId = data.id;
      if (method !== "delete") delete data.id;
      url = [url, updateId];
      allData["data"] = data;
    }
    const result = await axioInstance(allData);
    return result.data;
  } catch (error) {
    throw error;
  }
};
export {
  axioInstance,
  fireApiAction,
};