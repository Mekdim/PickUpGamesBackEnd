
const getDate = (date) => {
    return date.split("T")[0];
}

const getTime = (date) => {
    return date.split("T")[1];
}

const getHour = (time) => {
    return Number(time.split(':')[0])
}

const getMinute = (time) => {
    return Number(time.split(':')[1])
}

module.exports = {
    getDate,
    getTime,
    getHour,
    getMinute
}
