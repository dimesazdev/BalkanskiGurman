import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

/**
 * Checks whether a restaurant is open right now based on today's working hours.
 * 
 * @param {Object} todayHours - The working hours object for today
 * @param {dayjs.Dayjs} now - The current time (defaults to dayjs())
 * @returns {Object} - { isOpen: boolean, closeFormatted: string }
 */
export function getOpenCloseStatus(
  todayHours: any,
  now = dayjs(),
  t: (s: string) => string = (s) => s
): { isOpen: boolean; closeFormatted: string | null } {
  if (!todayHours) {
    return { isOpen: false, closeFormatted: null };
  }

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

type WorkingHour = {
  DayOfWeek: number; // 1 = Mon, 7 = Sun
  OpenHour?: number;
  OpenMinute?: number;
  CloseHour?: number;
  CloseMinute?: number;
  IsClosed?: boolean;
};

/**
 * Returns a translated string for the next opening time.
 * 
 * @param workingHours Array of working hour entries
 * @param todayDayOfWeek Current day of week (1–7)
 * @param getDayName Function to translate day number to string label
 * @param t Translation function
 * @returns Translated string like "Opens at 09:00" or "Opens at 08:00 on Tuesday"
 */
export function getNextOpeningTime(
  workingHours: WorkingHour[] = [],
  todayDayOfWeek: number,
  getDayName: (dayNum: number) => string,
  t: (key: string, opts?: any) => string = (s) => s
): string {
  const now = dayjs();
  const todayHours = workingHours.find(h => h.DayOfWeek === todayDayOfWeek);

  // Check if will open later today
  if (
    todayHours &&
    !todayHours.IsClosed &&
    typeof todayHours.OpenHour === "number" &&
    typeof todayHours.OpenMinute === "number"
  ) {
    const openTimeToday = now.clone()
      .set("hour", todayHours.OpenHour)
      .set("minute", todayHours.OpenMinute)
      .set("second", 0)
      .set("millisecond", 0);

    if (now.isBefore(openTimeToday)) {
      const timeStr = openTimeToday.format("HH:mm");
      return `${t("labels.opensAt")} ${timeStr}`;
    }
  }

  // Otherwise search next day
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = ((todayDayOfWeek + i - 1) % 7) + 1;
    const nextDayHours = workingHours.find(h => h.DayOfWeek === nextDayIndex);

    if (
      nextDayHours &&
      !nextDayHours.IsClosed &&
      typeof nextDayHours.OpenHour === "number" &&
      typeof nextDayHours.OpenMinute === "number"
    ) {
      const openTime = dayjs()
        .set("hour", nextDayHours.OpenHour)
        .set("minute", nextDayHours.OpenMinute)
        .set("second", 0)
        .set("millisecond", 0)
        .format("HH:mm");

      const isSameDay = nextDayIndex === todayDayOfWeek;
      if (isSameDay) {
        return `${t("labels.opensAt")} ${openTime}`;
      } else {
        const dayName = getDayName(nextDayIndex);
        return `${t("labels.opensAt")} ${openTime} ${t("labels.on")} ${dayName}`;
      }
    }
  }

  return t("labels.closedAllWeek");
}