
const getDate = (date) => {
    return date.split("T")[0];
}

const getTime = (date) => {
    return date.split("T")[1];
}

module.exports = {
    getDate,
    getTime
}
