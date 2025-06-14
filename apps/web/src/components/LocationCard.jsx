import Icon from "@mdi/react";
import { mdiMapMarker } from "@mdi/js";
import Button from "./Button";
import "../styles/LocationCard.css";

const LocationCard = ({ address, label, buttonText }) => {
  const fullAddress = `${address.Street}, ${address.City}, ${address.Country}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="location-card">
      <div className="location-header">
        <Icon path={mdiMapMarker} size={1} color="var(--red)" />
        <h3>{label}</h3>
      </div>

      <div className="location-map">
        <iframe
          src={embedSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen=""
          aria-hidden="false"
          tabIndex="0"
          title="Google Map"
        ></iframe>
      </div>

      <p>{fullAddress}</p>

      <Button variant="red" onClick={() => window.open(mapsUrl, "_blank")}>
        {buttonText}
      </Button>
    </div>
  );
};

export default LocationCard;
