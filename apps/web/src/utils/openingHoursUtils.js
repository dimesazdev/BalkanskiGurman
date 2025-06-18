import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

/**
 * Checks whether a restaurant is open right now based on today's working hours.
 * 
 * @param {Object} todayHours - The working hours object for today
 * @param {dayjs.Dayjs} now - The current time (defaults to dayjs())
 * @returns {Object} - { isOpen: boolean, closeFormatted: string }
 */
export function getOpenCloseStatus(todayHours, now = dayjs(), t = (s) => s) {
  const { OpenHour, OpenMinute, CloseHour, CloseMinute } = todayHours;

  if (
    OpenHour == null || OpenMinute == null ||
    CloseHour == null || CloseMinute == null
  ) {
    return { isOpen: false, closeFormatted: null };
  }

  const open = now.clone().set("hour", OpenHour).set("minute", OpenMinute).set("second", 0).set("millisecond", 0);
  let close = now.clone().set("hour", CloseHour).set("minute", CloseMinute).set("second", 0).set("millisecond", 0);

  if (CloseHour < OpenHour || (CloseHour === OpenHour && CloseMinute <= OpenMinute)) {
    close = close.add(1, "day");
  }

  const isOpen = now.isAfter(open) && now.isBefore(close);
  const closeFormatted = close.format("HH:mm");

  return { isOpen, closeFormatted };
}

/**
 * Returns a translated string for the next opening time.
 * 
 * @param {Array} workingHours - Array of working hours for all days
 * @param {Number} todayDayOfWeek - The current day (1 = Mon, 7 = Sun)
 * @param {Function} getDayName - Function that maps 1-7 to a day label
 * @param {Function} t - Translation function from react-i18next
 * @returns {String} - Translated opening time or fallback
 */
export function getNextOpeningTime(workingHours, todayDayOfWeek, getDayName, t = (s) => s) {
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayDayOfWeek + i - 1) % 7 + 1;
    const nextDayHours = workingHours?.find(h => h.DayOfWeek === nextDayIndex);

    if (
      nextDayHours &&
      !nextDayHours.IsClosed &&
      typeof nextDayHours.OpenHour === "number" &&
      typeof nextDayHours.OpenMinute === "number"
    ) {
      const openTime = dayjs()
        .set("hour", nextDayHours.OpenHour)
        .set("minute", nextDayHours.OpenMinute)
        .format("HH:mm");
      const dayName = getDayName(nextDayIndex);

      return `${t("labels.opensAt")} ${openTime} ${t("labels.on")} ${dayName}`;
    }
  }

  return t("labels.closedAllWeek");
}