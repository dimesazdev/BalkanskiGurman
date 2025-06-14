// At top:
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Icon from "@mdi/react";
import { mdiMedal, mdiDiamondStone } from "@mdi/js";
import { Country, City } from "country-state-city";
import "../styles/ManageProfile.css";

// Component:
function ManageProfile() {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuth();
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        countryIso: "",
        country: "",
        city: "",
        countryCode: ""
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [countryList, setCountryList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCountryList(Country.getAllCountries());
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await fetch('http://localhost:3001/auth/me', {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (res.status === 401) throw new Error("Unauthorized");
            const data = await res.json();

            setUserData(data);

            const matchedCountry = countryList.find(c => c.name === data.Country);

            setFormData({
                name: data.Name,
                surname: data.Surname,
                email: data.Email,
                phoneNumber: data.PhoneNumber || "",
                countryIso: matchedCountry?.isoCode || "",
                country: data.Country,
                city: data.City,
                countryCode: ""
            });

            if (matchedCountry?.isoCode) {
                setCityList(City.getCitiesOfCountry(matchedCountry.isoCode));
            }

            if (data.ProfilePictureUrl) {
                setPhotoPreview(data.ProfilePictureUrl);
            } else {
                setPhotoPreview(null);
            }

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user && countryList.length > 0 && user.token) {
            fetchProfileData();
        }
    }, [user, countryList]);

    const countryOptions = countryList.map((c) => ({
        label: c.name,
        value: c.isoCode
    }));

    const cityOptions = cityList.map((c) => ({
        label: c.name,
        value: c.name
    }));

    const handleCountryChange = (e) => {
        const isoCode = e.target.value;
        const selectedCountry = countryList.find(c => c.isoCode === isoCode);

        setFormData((prev) => ({
            ...prev,
            countryIso: isoCode,
            country: selectedCountry?.name || "",
            city: ""
        }));

        setCityList(City.getCitiesOfCountry(isoCode));
    };

    const handleCityChange = (e) => {
        setFormData((prev) => ({ ...prev, city: e.target.value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file); // No preview yet
        }
    };

    const getMedalIcon = (reviewCount, threshold) => {
        if (reviewCount >= threshold) return 1;
        return 0.5;
    };

    const handleSaveChanges = async () => {
        try {
            let profilePictureUrl = userData.ProfilePictureUrl;

            if (profilePhoto) {
                const photoForm = new FormData();
                photoForm.append("file", profilePhoto);

                const uploadRes = await fetch("http://localhost:3001/upload/profile-picture", {
                    method: "POST",
                    body: photoForm
                });

                const uploadData = await uploadRes.json();
                profilePictureUrl = uploadData.url;
            }

            const selectedCountry = countryList.find(c => c.isoCode === formData.countryIso);
            const countryName = selectedCountry?.name || "";

            const response = await fetch('http://localhost:3001/auth/me', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    country: countryName,
                    city: formData.city,
                    profilePictureUrl: profilePictureUrl
                })
            });

            if (!response.ok) throw new Error("Failed to update user");
            const updated = await response.json();
            console.log("User updated:", updated);

            setUserData(updated.user || updated);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAndRefresh = async () => {
        try {
            setIsSaving(true);
            await handleSaveChanges();
            await refreshUser(); // update global user (navbar)
            await fetchProfileData(); // update local photoPreview
            setProfilePhoto(null); // clear selected file after save
            setIsSaving(false);
        } catch (err) {
            console.error(err);
            setIsSaving(false);
        }
    };

    return (
        <div className="manage-profile">
            <h2 className="section-title">{t("profile.accountInfo")}</h2>

            <div className="photo-section">
                <div className="photo-placeholder">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="photo-preview" />
                    ) : (
                        <div className="photo-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="medals">
                    <Icon path={mdiMedal} size={1} color="#cd7f32" style={{ opacity: getMedalIcon(userData.reviewCount || 0, 1) }} />
                    <Icon path={mdiMedal} size={1} color="#c0c0c0" style={{ opacity: getMedalIcon(userData.reviewCount || 0, 11) }} />
                    <Icon path={mdiMedal} size={1} color="#ffd700" style={{ opacity: getMedalIcon(userData.reviewCount || 0, 26) }} />
                    <Icon path={mdiDiamondStone} size={1} color="#00bfff" style={{ opacity: getMedalIcon(userData.reviewCount || 0, 50) }} />
                </div>

                {userData.reviewCount > 0 && (
                    <div className="review-count">
                        {t("labels.reviewCount", { count: userData.reviewCount })}
                    </div>
                )}

                <div>
                    <Button
                        variant="red"
                        onClick={() => document.getElementById('photo-upload').click()}
                    >
                        {t("buttons.choosePhoto")}
                    </Button>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            <div className="form-grid">
                <FormInput
                    id="name"
                    label={t("register.name")}
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                    placeholder={t("register.namePlaceholder")}
                />
                <FormInput
                    id="surname"
                    label={t("register.surname")}
                    value={formData.surname}
                    onChange={handleInputChange}
                    name="surname"
                    placeholder={t("register.surnamePlaceholder")}
                />

                <FormInput
                    id="email"
                    label={t("register.email")}
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    placeholder={t("register.emailPlaceholder")}
                />

                <div className="form-group">
                    <label htmlFor="phoneNumber" className="text-white">{t("register.phone")}</label>
                    <PhoneInput
                        country={"mk"}
                        value={formData.phoneNumber}
                        onChange={(phone, countryData) => {
                            setFormData((prev) => ({ ...prev, phoneNumber: phone, countryCode: `+${countryData.dialCode}` }));
                        }}
                        inputProps={{ name: "phone" }}
                        containerClass="custom-phone-container"
                        inputClass="custom-phone-input"
                        buttonClass="custom-phone-button"
                        dropdownClass="custom-phone-dropdown"
                    />
                </div>

                <FormSelect
                    label={t("register.country")}
                    name="countryIso"
                    value={formData.countryIso}
                    onChange={handleCountryChange}
                    options={[{ value: "" }, ...countryOptions]}
                    placeholder={t("register.countryPlaceholder")}
                />

                <FormSelect
                    label={t("register.city")}
                    name="city"
                    value={formData.city}
                    onChange={handleCityChange}
                    options={
                        formData.country
                            ? cityOptions.length > 0
                                ? [{ label: t("register.cityPlaceholder"), value: "" }, ...cityOptions]
                                : [{ label: t("register.noCities"), value: "" }]
                            : []
                    }
                    placeholder={t("register.cityPlaceholder")}
                    disabled={!formData.country}
                />
            </div>

            <div className="change-password-link">
                <Link to="/auth/change-password">{t("profile.changePassword")}</Link>
            </div>

            <div className="save-button">
                <Button variant="red" onClick={handleSaveAndRefresh}>
                    {t("buttons.saveChanges")}
                </Button>
            </div>
        </div>
    );
}

export default ManageProfile;