const { DateTime } = require("luxon");
const { getHour, getMinute } = require("../util/time");

const getOpeningHours = async (pitchId, date, db) => {
  let daysOfWeeks = getFourDaysOfTheWeek(date);
  let openingHours;
  try {
    openingHours = await db.findOpeningHoursByPitchIdForDays(
      pitchId,
      daysOfWeeks
    );
  } catch (error) {
    console.log("Unable to fetch opening hours ", error);
    openingHours = [[], [], [], []];
  }

  let result = [];

  openingHours.map((hours) => {
    result.push(setOpeningHours(hours));
  });

  return result;
};

const getOpeningHoursForPitch = async (pitchId, db) => {
  let results = await db.findOpeningHoursForPitch(pitchId);

  results = results.map((day) => {
    if (!day.enabled) {
      return {
        daysOfWeek: [weekdays[day.dayofweek]],
        startTime: "00:00",
        endTime: "00:00",
      };
    }
    return {
      daysOfWeek: [weekdays[day.dayofweek]],
      startTime: day.start_time,
      endTime: day.end_time,
    };
  });

  return results;
};

const getFourDaysOfTheWeek = (date) => {
  let tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let thirdDay = new Date(tomorrow);
  thirdDay.setDate(thirdDay.getDate() + 1);

  let fourthDay = new Date(thirdDay);
  fourthDay.setDate(fourthDay.getDate() + 1);

  let dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(date)
    .toLowerCase();
  let tomorrowDayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(tomorrow)
    .toLowerCase();
  let thirdDayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(thirdDay)
    .toLowerCase();
  let fourthDayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(fourthDay)
    .toLowerCase();

  return [dayOfWeek, tomorrowDayOfWeek, thirdDayOfWeek, fourthDayOfWeek];
};

const setOpeningHours = (hours) => {
  let result = new Array(24).fill(false);

  hours.map((line) => {
    let start = line.start_time;
    let stop = line.end_time;

    start = Number(start.split(":")[0]);
    let mark = Number(stop.split(":")[0]);
    stop = Number(stop.split(":")[1]) > 0 ? mark : mark - 1; // 12:30 should mark up to 13 but 12:00 should end at 12

    for (let index = start; index <= stop; index++) {
      result[index] = true;
    }
  });

  return result;
};

const formatOpeningHours = (object, pitchId) => {
  let value = [];
  for (let key in object) {
    // pitch_id, dayOfWeek, enabled, start_time end_time
    let data = object[key];
    if (!data.enabled) {
      data.startTime = "24:00";
      data.endTime = "24:00";
    }
    let dayOpeningHours = [
      pitchId,
      data.day.toLowerCase(),
      data.enabled,
      data.startTime,
      data.endTime,
    ];
    value.push(dayOpeningHours);
  }
  return value;
};

const buildSpecialOpeningHours = (rawObject) => {
  let collection = [];
  for (let key in rawObject) {
    if (key.startsWith("special")) {
      collection.push(rawObject[key]);
    }
  }

  collection = collection.map((specialOD) => {
    let storedValue = [];
    let timeZonedDate = DateTime.fromFormat(specialOD.date, "dd-LL-y", {
      zone: "Africa/Addis_Ababa",
    });
    storedValue.push(timeZonedDate.toISO());
    storedValue.push(specialOD.enabled);
    if (specialOD.enabled) {
      storedValue.push(
        timeZonedDate
          .plus({
            hours: getHour(specialOD.startTime),
            minutes: getMinute(specialOD.startTime),
          })
          .toISO()
      );
      timeZonedDate.minus({
        hours: getHour(specialOD.startTime),
        minutes: getMinute(specialOD.startTime),
      });
      storedValue.push(
        timeZonedDate
          .plus({
            hours: getHour(specialOD.endTime),
            minutes: getMinute(specialOD.endTime),
          })
          .toISO()
      );
    } else {
      storedValue.push(null);
      storedValue.push(null);
    }
    return storedValue;
  });
  return collection;
};

const weekdays = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

module.exports = {
  getOpeningHours,
  formatOpeningHours,
  buildSpecialOpeningHours,
  getOpeningHoursForPitch,
};
