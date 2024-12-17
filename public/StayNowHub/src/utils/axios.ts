import axios from "axios";
import type { AxiosInstance } from "axios";
import { CONSTANTS } from "./constants";

const mimiV1Client: AxiosInstance = axios.create({
  baseURL: CONSTANTS.MIMI_API,
  headers: {
    "Content-Type": "application/json",
  },
});

export { mimiV1Client };
