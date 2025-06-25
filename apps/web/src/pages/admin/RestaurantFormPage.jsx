import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../components/Title";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import PhoneNumberPicker from "../../components/PhoneNumberPicker";
import ImagePicker from "../../components/ImagePicker";
import Button from "../../components/Button";
import Icon from "@mdi/react";
import { getAmenityIcon } from "../../utils/getAmenityIcon";
import { Country } from "country-state-city";
import { useTranslation } from "react-i18next";
import Alert from "../../components/Alert";
import Popup from "../../components/Popup";
import { useAuth } from "../../context/AuthContext";
import FormTextarea from "../../components/FormTextarea";
import CountryPicker from "../../components/CountryPicker";
import CityPicker from "../../components/CityPicker";
import "../../styles/RestaurantForm.css";

const amenityOptions = [
    { code: "DELIV", label: "filters.delivery" },
    { code: "PARK", label: "filters.parking" },
    { code: "PET", label: "filters.pet" },
    { code: "CARD", label: "filters.card" },
    { code: "KIDS", label: "filters.kids" },
    { code: "SMOK", label: "filters.smoking" },
    { code: "VEGAN", label: "filters.vegan" },
    { code: "VEGE", label: "filters.vegetarian" },
    { code: "GLUT", label: "filters.glutenfree" },
    { code: "HALAL", label: "filters.halal" }
];

const RestaurantFormPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        priceRange: "",
        details: "",
        phoneNumber: "",
        countryCode: "",
        cuisine: "",
        cuisineOptions: [],
        website: "",
        menuUrl: "",
        street: "",
        postalCode: "",
        country: "",
        countryIso: "",
        city: "",
        amenities: [],
        workingHours: Array(7).fill().map((_, i) => ({
            DayOfWeek: i + 1,
            OpenHour: "",
            OpenMinute: "",
            CloseHour: "",
            CloseMinute: "",
            IsClosed: false
        }))
    });

    const [images, setImages] = useState([]);
    const [popup, setPopup] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        fetch("http://localhost:3001/cuisines")
            .then(res => res.json())
            .then(data => {
                const cuisineOptions = data.map(c => ({
                    value: c.CuisineId,
                    label: c.Name
                }));
                setFormData(prev => ({ ...prev, cuisineOptions }));
            });

        if (isEdit) {
            fetch(`http://localhost:3001/restaurants/${id}`)
                .then(res => res.json())
                .then(data => {
                    const normalizedWorkingHours = Array.from({ length: 7 }, (_, i) => {
                        const found = data.workingHours.find(wh => wh.DayOfWeek === i + 1);
                        return found
                            ? {
                                DayOfWeek: i + 1,
                                OpenHour: found.OpenHour ?? "",
                                OpenMinute: found.OpenMinute ?? "",
                                CloseHour: found.CloseHour ?? "",
                                CloseMinute: found.CloseMinute ?? "",
                                IsClosed: found.IsClosed ?? false
                            }
                            : {
                                DayOfWeek: i + 1,
                                OpenHour: "",
                                OpenMinute: "",
                                CloseHour: "",
                                CloseMinute: "",
                                IsClosed: true
                            };
                    });

                    const matchedCountry = Country.getAllCountries().find(
                        c => c.name.toLowerCase().includes(data.address?.Country.toLowerCase())
                    );

                    setFormData(prev => ({
                        ...prev,
                        name: data.Name,
                        priceRange: data.PriceRange,
                        details: data.Details || "",
                        phoneNumber: data.PhoneNumber || "",
                        countryCode: data.CountryCode || "",
                        cuisine: data.cuisines[0]?.cuisine?.CuisineId || "",
                        website: data.Website || "",
                        menuUrl: data.MenuUrl || "",
                        street: data.address?.Street || "",
                        postalCode: data.address?.PostalCode || "",
                        country: data.address?.Country || "",
                        countryIso: matchedCountry?.isoCode || "",
                        city: data.address?.City || "",
                        amenities: data.amenities.map(a => a.amenity.Code),
                        workingHours: normalizedWorkingHours
                    }));

                    setImages(data.images.map(img => ({ file: null, url: img.Url })));
                });
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 850);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePhoneChange = ({ phoneNumber, countryCode }) => {
        setFormData(prev => ({ ...prev, phoneNumber, countryCode }));
    };

    const handleCountryChange = ({ countryIso, countryName }) => {
        setFormData(prev => ({
            ...prev,
            countryIso,
            country: countryName,
            city: ""
        }));
    };

    const handleCityChange = (city) => {
        setFormData(prev => ({ ...prev, city }));
    };

    const handleAmenityToggle = (code) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(code)
                ? prev.amenities.filter(a => a !== code)
                : [...prev.amenities, code]
        }));
    };

    const handleWorkingHourChange = (index, key, value) => {
        const updated = [...formData.workingHours];
        updated[index][key] = value;
        setFormData(prev => ({ ...prev, workingHours: updated }));
    };

    const uploadImages = async () => {
        const imageFiles = images.filter(img => img.file);
        if (imageFiles.length === 0) return [];

        const formDataObj = new FormData();
        imageFiles.forEach(img => formDataObj.append('files', img.file));

        const res = await fetch('http://localhost:3001/upload/restaurant-photos', {
            method: 'POST',
            body: formDataObj
        });

        if (!res.ok) throw new Error('Failed to upload images');
        const data = await res.json();
        return data.urls;
    };

    const handleSave = async () => {
        setShowAlert(true);
        const fullPhone = `${formData.countryCode}${formData.phoneNumber}`.replace(/\D/g, "");
        const cleanedCode = formData.countryCode.replace(/\D/g, "");

        const phoneNumberToSend =
            formData.phoneNumber.trim() === "" || fullPhone === cleanedCode
                ? null
                : `${formData.countryCode}${formData.phoneNumber}`;

        const relationWithOptionalDelete = (createArray) => {
            if (!createArray || createArray.length === 0) return undefined;
            return isEdit ? { deleteMany: {}, create: createArray } : { create: createArray };
        };

        const workingHourData = formData.workingHours.map(entry => ({
            DayOfWeek: entry.DayOfWeek,
            OpenHour: entry.IsClosed || entry.OpenHour === "" ? null : Number(entry.OpenHour),
            OpenMinute: entry.IsClosed || entry.OpenMinute === "" ? null : Number(entry.OpenMinute),
            CloseHour: entry.IsClosed || entry.CloseHour === "" ? null : Number(entry.CloseHour),
            CloseMinute: entry.IsClosed || entry.CloseMinute === "" ? null : Number(entry.CloseMinute),
            IsClosed: entry.IsClosed
        }));

        const cuisineData = formData.cuisine
            ? [{ cuisine: { connect: { CuisineId: Number(formData.cuisine) } } }]
            : [];

        const amenityData = formData.amenities.map(code => ({
            amenity: { connect: { Code: code } }
        }));

        const imageUrls = await uploadImages();
        const imageData = imageUrls.map(url => ({ Url: url }));

        try {
            const payload = {
                Name: formData.name,
                PriceRange: Number(formData.priceRange),
                Details: formData.details,
                PhoneNumber: phoneNumberToSend,
                Website: formData.website,
                MenuUrl: formData.menuUrl,
                cuisines: relationWithOptionalDelete(cuisineData),
                amenities: relationWithOptionalDelete(amenityData),
                workingHours: relationWithOptionalDelete(workingHourData),
                images: relationWithOptionalDelete(imageData),
                address: isEdit
                    ? {
                        update: {
                            Street: formData.street,
                            PostalCode: formData.postalCode,
                            City: formData.city,
                            Country: formData.country
                        }
                    }
                    : {
                        create: {
                            Street: formData.street,
                            PostalCode: formData.postalCode,
                            City: formData.city,
                            Country: formData.country
                        }
                    }
            };

            const res = await fetch(`http://localhost:3001/restaurants${isEdit ? `/${id}` : ""}`, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error();

            setPopup({
                message: isEdit ? "Restaurant updated successfully" : "Restaurant created successfully",
                variant: "success"
            });

            setTimeout(() => {
                navigate("/admin/restaurants");
            }, 2000);
        } catch (err) {
            console.error("❌ Failed to save restaurant:", err);
            setPopup({
                message: "An error occurred. Please check the data and try again.",
                variant: "error"
            });
        } finally {
            setShowAlert(false);
        }
    };

    return (
        <div className="restaurant-form-page">
            {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
            {showAlert && (
                <Alert
                    message={isEdit ? "Saving changes..." : "Creating restaurant..."}
                    buttonText="Close"
                    onButtonClick={() => setShowAlert(false)}
                    showCancel={false}
                />
            )}
            <form className="restaurant-form">
                {/* Section 1: Details */}
                <Title>{t("form.restaurantDetails")}</Title>
                <div id="first-grid">
                    <FormInput
                        id="name"
                        label={t("form.name")}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("placeholders.restaurantName")}
                    />
                    <FormSelect
                        name="priceRange"
                        label={t("form.priceRange")}
                        value={formData.priceRange}
                        onChange={handleChange}
                        options={[
                            { label: "5–10€", value: 1 },
                            { label: "10–20€", value: 2 },
                            { label: "20€+", value: 3 }
                        ]}
                        placeholder={t("form.selectPrice")}
                    />
                    <div id="details-wrapper">
                        <FormTextarea
                            id="details"
                            label={t("form.details")}
                            value={formData.details}
                            onChange={handleChange}
                            placeholder={t("placeholders.restaurantDetails")}
                        />
                    </div>
                </div>

                <div className="form-grid two-col">
                    <PhoneNumberPicker value={formData} onChange={handlePhoneChange} />
                    <FormSelect
                        name="cuisine"
                        label={t("form.cuisines")}
                        value={formData.cuisine}
                        onChange={handleChange}
                        options={formData.cuisineOptions || []}
                        placeholder={t("form.selectCuisine")}
                    />
                    <FormInput id="website" label={t("form.website")} value={formData.website} onChange={handleChange} placeholder="https://example.com" />
                    <FormInput id="menuUrl" label={t("form.menuUrl")} value={formData.menuUrl} onChange={handleChange} placeholder="https://example.com/menu" />
                </div>

                {/* Section 2: Image Gallery */}
                <Title>{t("form.imageGallery")}</Title>
                <div className="max-1000">
                    <ImagePicker images={images} setImages={setImages} maxImages={10} />
                </div>

                {/* Section 3: Address */}
                <Title>{t("form.address")}</Title>
                <div className="form-grid two-col">
                    <FormInput id="street" label={t("form.street")} value={formData.street} onChange={handleChange} placeholder="e.g. Bulevar Partizanski Odredi 23" />
                    <FormInput id="postalCode" label={t("form.postalCode")} value={formData.postalCode} onChange={handleChange} placeholder="e.g. 1000" />
                    <CountryPicker
                        value={formData.countryIso}
                        onChange={handleCountryChange}
                        required
                    />
                    <CityPicker
                        countryIso={formData.countryIso}
                        value={formData.city}
                        onChange={handleCityChange}
                        disabled={!formData.countryIso}
                        required
                    />
                </div>

                {/* Section 4: Working Hours */}
                <Title>{t("form.workingHours")}</Title>
                {isMobile ? (
                    <div className="wh-mobile-container">
                        {[...Array(7)].map((_, i) => {
                            const entry = formData.workingHours[i] || {};
                            const isClosed = entry.IsClosed;

                            return (
                                <div className="working-hours-mobile" style={{ opacity: isClosed ? 0.5 : 1 }}>
                                    <div className="day-header">
                                        <label>{t(`days.${i + 1}`)}</label>
                                    </div>

                                    <div className="time-block">
                                        <label>{t("form.openTime")}</label>
                                        <div className="time-selects">
                                            <FormSelect
                                                name="OpenHour"
                                                value={entry.OpenHour}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                    handleWorkingHourChange(i, "OpenHour", val);
                                                }}
                                                options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                                disabled={isClosed}
                                                placeholder="hh"
                                            />
                                            <FormSelect
                                                name="OpenMinute"
                                                value={entry.OpenMinute}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                    handleWorkingHourChange(i, "OpenMinute", val);
                                                }} options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                                disabled={isClosed}
                                                placeholder="mm"
                                            />
                                        </div>
                                    </div>

                                    <div className="time-block">
                                        <label>{t("form.closeTime")}</label>
                                        <div className="time-selects">
                                            <FormSelect
                                                name="CloseHour"
                                                value={entry.CloseHour}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                    handleWorkingHourChange(i, "CloseHour", val);
                                                }} options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                                disabled={isClosed}
                                                placeholder="hh"
                                            />
                                            <FormSelect
                                                name="CloseMinute"
                                                value={entry.CloseMinute}
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                    handleWorkingHourChange(i, "CloseMinute", val);
                                                }}
                                                options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                                disabled={isClosed}
                                                placeholder="mm"
                                            />
                                        </div>
                                    </div>

                                    <label className="closed-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={isClosed}
                                            onChange={() => {
                                                const updated = [...formData.workingHours];
                                                updated[i] = {
                                                    ...updated[i],
                                                    IsClosed: !isClosed,
                                                    OpenHour: "",
                                                    OpenMinute: "",
                                                    CloseHour: "",
                                                    CloseMinute: ""
                                                };
                                                setFormData(prev => ({ ...prev, workingHours: updated }));
                                            }}
                                        />
                                        {t("form.closed")}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="working-hours-grid">
                        {/* Header row aligned with grid */}
                        <div className="working-hours-header">
                            <div></div> {/* empty space for day label */}
                            <label>{t("form.openTime")}</label>
                            <label>{t("form.closeTime")}</label>
                            <div></div> {/* empty space for checkbox */}
                        </div>

                        {[...Array(7)].map((_, i) => {
                            const entry = formData.workingHours[i] || {};
                            const isClosed = entry.IsClosed;

                            return (
                                <div className="day-grid-row" key={i}>
                                    <label>{t(`days.${i + 1}`)}</label>

                                    <div className="time-selects">
                                        <FormSelect
                                            name="OpenHour"
                                            value={entry.OpenHour}
                                            onChange={(e) => {
                                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                                handleWorkingHourChange(i, "OpenHour", val);
                                            }}
                                            options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                            disabled={isClosed}
                                            placeholder="hh"
                                        />
                                        <FormSelect
                                            name="OpenMinute"
                                            value={entry.OpenMinute}
                                            onChange={(e) => {
                                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                                handleWorkingHourChange(i, "OpenMinute", val);
                                            }} options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                            disabled={isClosed}
                                            placeholder="mm"
                                        />
                                    </div>

                                    <div className="time-selects">
                                        <FormSelect
                                            name="CloseHour"
                                            value={entry.CloseHour}
                                            onChange={(e) => {
                                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                                handleWorkingHourChange(i, "CloseHour", val);
                                            }} options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                            disabled={isClosed}
                                            placeholder="hh"
                                        />
                                        <FormSelect
                                            name="CloseMinute"
                                            value={entry.CloseMinute}
                                            onChange={(e) => {
                                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                                handleWorkingHourChange(i, "CloseMinute", val);
                                            }}
                                            options={Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, "0") }))}
                                            disabled={isClosed}
                                            placeholder="mm"
                                        />
                                    </div>

                                    <label className="closed-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={isClosed}
                                            onChange={() => {
                                                const updated = [...formData.workingHours];
                                                updated[i] = {
                                                    ...updated[i],
                                                    IsClosed: !isClosed,
                                                    OpenHour: "",
                                                    OpenMinute: "",
                                                    CloseHour: "",
                                                    CloseMinute: ""
                                                };
                                                setFormData(prev => ({ ...prev, workingHours: updated }));
                                            }}
                                        />
                                        {t("form.closed")}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Section 5: Amenities */}
                <Title>{t("form.amenities")}</Title>
                <div className="amenities-grid">
                    {amenityOptions.map(a => (
                        <label key={a.code} className="amenity-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(a.code)}
                                onChange={() => handleAmenityToggle(a.code)}
                            />
                            <Icon path={getAmenityIcon(a.code)} size={1} color="#BA3B46" />
                            <label>{t(a.label)}</label>
                        </label>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="max-1000" style={{ marginTop: "1rem" }}>
                    <Button variant="red" onClick={handleSave}>
                        {t("buttons.saveChanges")}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantFormPage;