const database = require("../db/db");

const getOpeningHours =  async ({pitchId, date}) => {

    let daysOfWeeks = getFourDaysOfTheWeek(date);
    let openingHours;
    try {
        openingHours = await database.findOpeningHoursByPitchIdForDays(pitchId, daysOfWeeks);
    } catch (error) {
        console.log("Unable to fetch opening hours ", error);
        openingHours = [[], [], [], []];
    }

    let result = [];

    openingHours.map(hours => {
        result.push(setOpeningHours(hours));
    })

    return result;
}

const getFourDaysOfTheWeek = (date) => {

    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let thirdDay = new Date(tomorrow);
    thirdDay.setDate(thirdDay.getDate() + 1);

    let fourthDay = new Date(thirdDay);
    fourthDay.setDate(fourthDay.getDate() + 1);

    let dayOfWeek = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(date).toLowerCase();
    let tomorrowDayOfWeek = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(tomorrow).toLowerCase();
    let thirdDayOfWeek = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(thirdDay).toLowerCase();
    let fourthDayOfWeek = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(fourthDay).toLowerCase();

    return [dayOfWeek, tomorrowDayOfWeek, thirdDayOfWeek, fourthDayOfWeek];

}

const setOpeningHours = (hours) => {
    let result = new Array(24).fill(false);

    hours.map(line => {
        let start = line.start_time;
        let stop = line.end_time;

        start = Number(start.split(":")[0]);
        stop = Number(stop.split(":")[0]);

        for (let index = start; index <= stop; index++) {
            result[index] = true;
        }
    })

    return result;
}

module.exports = {
    getOpeningHours
}
