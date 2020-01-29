import Cookie from "js-cookie";
import { Base64 } from "js-base64";

const COOKIE_USER_DATA = 'userData';

export const saveUserData = ({ idToken, expiresIn }, { email, avatar }) => {
  const tokenExpiration = Date.now() + expiresIn * 1000;
  const data = {
    jwt: idToken,
    expiresIn: tokenExpiration,
    user: email,
    avatar
  }
  const dataEncoded = Base64.encode(JSON.stringify(data))

  Cookie.set(COOKIE_USER_DATA, dataEncoded)
  localStorage.setItem(COOKIE_USER_DATA, dataEncoded)
};

export const getUserFromCookie = req => {
  if (!req.headers.cookie) return;

  const cookieData = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith(`${COOKIE_USER_DATA}=`));

  return parseJSON(Base64.decode(cookieData))
};

export const getUserFromLocalStorage = () => {
  if (localStorage) {
    const cookieData = localStorage.getItem(COOKIE_USER_DATA)

    return parseJSON(Base64.decode(cookieData))
  }
};

export const clearUserData = () => {
  if (!process.server) {
    localStorage.removeItem(COOKIE_USER_DATA);
  }
  Cookie.remove(COOKIE_USER_DATA)
};


function parseJSON (json) {
  try {
    return JSON.parse(json);
  } catch (error) {
  }
};
