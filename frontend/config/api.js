import axios from "axios";

const axioInstance = axios.create({
  //   baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
//   baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    baseURL: "http://0.0.0.0:8000"
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
    throw error.response.data;
  }
};
export {
  axioInstance,
  fireApiAction,
  // fireApiGet
};