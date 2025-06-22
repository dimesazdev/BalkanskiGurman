import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../styles/PhoneNumberPicker.css";
import { useTranslation } from "react-i18next";

const PhoneNumberPicker = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="form-group">
      <label htmlFor="phoneNumber" className="text-white">
        {t("register.phone")}
      </label>
      <PhoneInput
        country={"mk"}
        value={value.phoneNumber}
        onChange={(phone, countryData) =>
          onChange({
            phoneNumber: phone,
            countryCode: `+${countryData.dialCode}`
          })
        }
        inputProps={{ name: "phone" }}
        containerClass="custom-phone-container"
        inputClass="custom-phone-input"
        buttonClass="custom-phone-button"
        dropdownClass="custom-phone-dropdown"
      />
    </div>
  );
};

export default PhoneNumberPicker;