import Icon from "@mdi/react";
import "../styles/InfoCard.css";

function InfoCard({ icon, label, value, onClick, style }) {
  return (
    <div className={`info-card ${onClick ? 'clickable' : ''}`} onClick={onClick} style={style}>
      
      <div className="info-card-header">
        {icon && <Icon path={icon} size={1.2} color="var(--red)" />}
        <div className="info-card-label">{label}</div>
      </div>

      {value && <div className="info-card-value">{value}</div>}
      
    </div>
  );
}

export default InfoCard;