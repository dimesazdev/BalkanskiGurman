export function validateFields(data, t) {
  const errors = {};

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  if (!nameRegex.test(data.name.trim())) {
    errors.name = t("register.errorName");
  }
  if (!nameRegex.test(data.surname.trim())) {
    errors.surname = t("register.errorSurname");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    errors.email = t("register.errorEmail");
  }

  const phoneRegex = /^\d*$/;
  const cleanedPhone = data.phoneNumber.replace(/\s+/g, "");
  if (cleanedPhone && !phoneRegex.test(cleanedPhone)) {
    errors.phoneNumber = t("register.errorPhone");
  }

  if (!data.country || data.country.trim() === "") {
    errors.country = t("register.errorCountry");
  }

  if (!data.city || data.city.trim() === "") {
    errors.city = t("register.errorCity");
  }

  const pw = data.password;
  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!pwRegex.test(pw)) {
    errors.password = t("register.errorPassword");
  }

  if (pw !== data.retypePassword) {
    errors.retypePassword = t("register.errorPasswordsMatch");
  }

  return errors;
}