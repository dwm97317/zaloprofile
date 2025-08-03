import { env } from "./env";
const devBaseURL = "https://zalonew.itaoth.com/index.php?s=api/";
const proBaseURL = "https://zalonew.itaoth.com/index.php?s=api/";

export const BASE_URL = env === "development" ? devBaseURL : proBaseURL;

export const TIMEOUT = 5000;
