import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Popup from "../components/Popup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Icon from "@mdi/react";
import { mdiMedal, mdiDiamondStone } from "@mdi/js";
import { Country, City } from "country-state-city";
import "../styles/ManageProfile.css";
import Title from "../components/Title";
import { Tooltip } from 'react-tooltip';
import PhoneNumberPicker from "../components/PhoneNumberPicker";

function ManageProfile() {
    const { t, i18n } = useTranslation();
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
    const [translatedCountries, setTranslatedCountries] = useState([]);
    const [translatedCities, setTranslatedCities] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [popup, setPopup] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        setCountryList(Country.getAllCountries());
    }, []);

    useEffect(() => {
        fetch("/translatedCountries.json")
            .then(res => res.json())
            .then(setTranslatedCountries)
            .catch(console.error);

        fetch("/translatedCities.json")
            .then(res => res.json())
            .then(setTranslatedCities)
            .catch(console.error);
    }, [i18n.language]);

    const getTranslatedCountry = (countryName) => {
        const match = translatedCountries.find(
            c => c.name.toLowerCase() === countryName?.toLowerCase()
        );
        return match?.translations?.[i18n.language] || countryName;
    };

    const getTranslatedCity = (cityName, countryCode) => {
        const match = translatedCities.find(
            c => c.name.toLowerCase() === cityName?.toLowerCase() && c.countryCode === countryCode
        );
        return match?.translations?.[i18n.language] || cityName;
    };

    const fetchProfileData = async () => {
        try {
            const res = await fetch("http://localhost:3001/auth/me", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.status === 401) throw new Error("Unauthorized");
            const data = await res.json();

            setUserData({ ...data, reviewCount: data._count?.reviews || 0 });

            const matchedCountry = countryList.find(c => c.name === data.Country);
            const isoCode = matchedCountry?.isoCode || "";

            setFormData({
                name: data.Name,
                surname: data.Surname,
                email: data.Email,
                phoneNumber: data.PhoneNumber || "",
                countryIso: isoCode,
                country: data.Country,
                city: data.City,
                countryCode: ""
            });

            if (isoCode) {
                setCityList(City.getCitiesOfCountry(isoCode) || []);
            }

            setPhotoPreview(data.ProfilePictureUrl || null);
        } catch (err) {
            setPopup({ message: t("manageProfile.fetchError"), variant: "error" });
        }
    };

    useEffect(() => {
        if (user?.token && countryList.length > 0) {
            fetchProfileData();
        }
    }, [user, countryList]);

    const handleCountryChange = (e) => {
        const isoCode = e.target.value;
        const selectedCountry = countryList.find(c => c.isoCode === isoCode);
        setFormData(prev => ({
            ...prev,
            countryIso: isoCode,
            country: selectedCountry?.name || "",
            city: ""
        }));
        setCityList(City.getCitiesOfCountry(isoCode) || []);
    };

    const handleCityChange = (e) => setFormData(prev => ({ ...prev, city: e.target.value }));
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setPopup({ message: t("manageProfile.invalidFileType"), variant: "warning" });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setPopup({ message: t("manageProfile.fileTooLarge"), variant: "warning" });
            return;
        }
        setProfilePhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSaveChanges = async () => {
        try {
            setShowAlert(true);
            let profilePictureUrl = userData.ProfilePictureUrl;

            if (profilePhoto) {
                const form = new FormData();
                form.append("file", profilePhoto);
                const res = await fetch("http://localhost:3001/upload/profile-picture", {
                    method: "POST",
                    body: form
                });
                const data = await res.json();
                profilePictureUrl = data.url;
                setPopup({ message: t("manageProfile.photoUploadSuccess"), variant: "success" });
            }

            const selectedCountry = countryList.find(c => c.isoCode === formData.countryIso);
            const response = await fetch("http://localhost:3001/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    country: selectedCountry?.name || "",
                    profilePictureUrl
                })
            });

            if (!response.ok) throw new Error();
            const updated = await response.json();
            setUserData(updated.user || updated);
            setPopup({ message: t("manageProfile.saveSuccess"), variant: "success" });
        } catch (err) {
            setPopup({ message: t("manageProfile.saveError"), variant: "error" });
        } finally {
            setShowAlert(false);
        }
    };

    const handleSaveAndRefresh = async () => {
        setIsSaving(true);
        await handleSaveChanges();
        await refreshUser();
        await fetchProfileData();
        setIsSaving(false);
    };

    const sortedCountryOptions = [...countryList]
        .map(c => ({
            label: getTranslatedCountry(c.name),
            value: c.isoCode
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const sortedCityOptions = [...cityList]
        .map(c => ({
            label: getTranslatedCity(c.name, formData.countryIso),
            value: c.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    if (!user || !user.token) return <div>{t("manageProfile.loadingUser")}</div>;

    return (
        <div className="manage-profile">
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            {showAlert && <Alert message={t("manageProfile.saving")} buttonText={t("manageProfile.forceClose")} onButtonClick={() => setShowAlert(false)} showCancel={false} />}

            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Title>{t("profile.accountInfo")}</Title>
            </div>

            <div className="photo-section">
                <div className="photo-placeholder">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Selected Profile" className="photo-preview" />
                    ) : (
                        <div className="photo-icon">
                            <svg width="70" height="70" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="medals">
                    {[
                        { color: "#cd7f32", threshold: 1, id: "bronze" },
                        { color: "#c0c0c0", threshold: 11, id: "silver" },
                        { color: "#ffd700", threshold: 26, id: "gold" },
                        { color: "#00bfff", threshold: 51, id: "diamond" },
                    ].map((medal, index) => {
                        const earned = (userData.reviewCount || 0) >= medal.threshold;
                        const tooltipKey = earned
                            ? `medals.${medal.id}Earned`
                            : `medals.${medal.id}Missing`;
                        const tooltipText = t(tooltipKey, { count: medal.threshold });

                        return (
                            <div key={medal.id}>
                                <Icon
                                    path={index < 3 ? mdiMedal : mdiDiamondStone}
                                    size={1}
                                    color={medal.color}
                                    style={{ opacity: earned ? 1 : 0.3 }}
                                    data-tooltip-id={`tooltip-${medal.id}`}
                                    data-tooltip-content={tooltipText}
                                />
                                <Tooltip id={`tooltip-${medal.id}`} />
                            </div>
                        );
                    })}
                </div>

                {(userData.reviewCount || 0) === 0 && (
                    <div className="review-count">{t("medals.noReviews")}</div>
                )}

                {userData.reviewCount > 0 && (
                    <div className="review-count">
                        {t("labels.reviewCount", { count: userData.reviewCount })}
                    </div>
                )}

                <Button variant="red" onClick={() => document.getElementById("photo-upload")?.click()}>
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

            <div className="form-grid">
                <FormInput id="name" label={t("register.name")} value={formData.name} onChange={handleInputChange} name="name" placeholder={t("register.namePlaceholder")} />
                <FormInput id="surname" label={t("register.surname")} value={formData.surname} onChange={handleInputChange} name="surname" placeholder={t("register.surnamePlaceholder")} />
                <FormInput id="email" label={t("register.email")} type="email" value={formData.email} onChange={handleInputChange} name="email" placeholder={t("register.emailPlaceholder")} />
                <PhoneNumberPicker
                    value={{ phoneNumber: formData.phoneNumber }}
                    onChange={({ phoneNumber, countryCode }) =>
                        setFormData((prev) => ({
                            ...prev,
                            phoneNumber,
                            countryCode
                        }))
                    }
                />
                <FormSelect
                    label={t("register.country")}
                    name="countryIso"
                    value={formData.countryIso}
                    onChange={handleCountryChange}
                    options={[{ value: "", label: t("register.countryPlaceholder") }, ...sortedCountryOptions]}
                    placeholder={t("register.countryPlaceholder")}
                />
                <FormSelect
                    label={t("register.city")}
                    name="city"
                    value={formData.city}
                    onChange={handleCityChange}
                    options={formData.country ? (sortedCityOptions.length > 0 ? [{ label: t("register.cityPlaceholder"), value: "" }, ...sortedCityOptions] : [{ label: t("register.noCities"), value: "" }]) : []}
                    placeholder={t("register.cityPlaceholder")}
                    disabled={!formData.country}
                />
            </div>

            <div className="change-password-link">
                <Link to="/auth/change-password">{t("profile.changePassword")}</Link>
            </div>

            <div className="save-button">
                <Button variant="red" onClick={handleSaveAndRefresh} disabled={isSaving}>
                    {isSaving ? t("buttons.saving") : t("buttons.saveChanges")}
                </Button>
            </div>
        </div>
    );
}

export default ManageProfile;