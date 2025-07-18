export function validateFields(data, t) {
  const errors = {};

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿЀ-џășțćčđšžžĆČĐŠŽҐЄІЇЈЉЊЋЏабвгдѓежзийклљмнњопрстћуфхцчџшščž\s'-]+$/i;
  if (data.name !== undefined && !nameRegex.test(data.name.trim())) {
    errors.name = t("register.errorName");
  }
  if (data.surname !== undefined && !nameRegex.test(data.surname.trim())) {
    errors.surname = t("register.errorSurname");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email !== undefined && !emailRegex.test(data.email.trim())) {
    errors.email = t("register.errorEmail");
  }

  const phoneRegex = /^\d*$/;
  if (data.phoneNumber !== undefined) {
    const cleanedPhone = data.phoneNumber.replace(/\s+/g, "");
    if (cleanedPhone && !phoneRegex.test(cleanedPhone)) {
      errors.phoneNumber = t("register.errorPhone");
    }
  }

  if (data.country !== undefined && (!data.country || data.country.trim() === "")) {
    errors.country = t("register.errorCountry");
  }

  if (data.password !== undefined) {
    const pw = data.password;
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!pwRegex.test(pw)) {
      errors.password = t("register.errorPassword");
    }
    if (data.retypePassword !== undefined && pw !== data.retypePassword) {
      errors.retypePassword = t("register.errorPasswordsMatch");
    }
  }

  return errors;
}