import Cookies from 'js-cookie';

const AFFILIATE_COOKIE_NAME = 'affiliate_code';
const COOKIE_EXPIRY_DAYS = 60;

export const setAffiliateCookie = (affiliateCode: string) => {
  Cookies.set(AFFILIATE_COOKIE_NAME, affiliateCode, { expires: COOKIE_EXPIRY_DAYS });
};

export const getAffiliateCookie = () => {
  return Cookies.get(AFFILIATE_COOKIE_NAME);
};

export const removeAffiliateCookie = () => {
  Cookies.remove(AFFILIATE_COOKIE_NAME);
};