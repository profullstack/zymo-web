import string from "@primate/types/string";
import email from "@primate/types/email";

export const readonly = true;

export const ambiguous = true;

export const strict = true;

export default {
  email,
  username: string,
  firstName: string,
  lastName: string,
  phone: string,
  phonePrefix: string,
  password: string,
  password2: string,
};
