import Icon from "@mdi/react";
import { mdiClockOutline } from "@mdi/js";
import "../styles/WorkingHoursCard.css";
import { useTranslation } from 'react-i18next';
import Button from "./Button";

const WorkingHoursCard = ({ hours, getDayName, formatTime, label, buttonText }) => {
  // Force order Monday (1) → Sunday (7)
  const orderedDays = [1, 2, 3, 4, 5, 6, 7];

  const { t } = useTranslation();

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
                    ? `${t("labels.closed")}`
                    : `${formatTime(h?.OpenTime)} - ${formatTime(h?.CloseTime)}`}
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