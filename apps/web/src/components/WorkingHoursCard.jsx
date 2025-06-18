import Icon from "@mdi/react";
import { mdiClockOutline } from "@mdi/js";
import "../styles/WorkingHoursCard.css";
import { useTranslation } from 'react-i18next';
import Button from "./Button";

const WorkingHoursCard = ({ hours, getDayName, label, buttonText }) => {
  const orderedDays = [1, 2, 3, 4, 5, 6, 7];
  const { t } = useTranslation();

  const formatTimeManual = (hour, minute) => {
    if (hour == null || minute == null) return "";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  return (
    <div className="working-hours-card">
      <div className="working-hours-header">
        <Icon path={mdiClockOutline} size={1} color="var(--red)" />
        <h3>{label}</h3>
      </div>

      <table className="working-hours-table">
        <tbody>
          {orderedDays.map((dayNum) => {
            const h = hours.find((h) => h.DayOfWeek === dayNum);

            return (
              <tr key={dayNum}>
                <td>{getDayName(dayNum)}</td>
                <td>
                  {h?.IsClosed
                    ? t("labels.closed")
                    : `${formatTimeManual(h.OpenHour, h.OpenMinute)} - ${formatTimeManual(h.CloseHour, h.CloseMinute)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Button variant="red-outline">
        {buttonText}
      </Button>
    </div>
  );
};

export default WorkingHoursCard;