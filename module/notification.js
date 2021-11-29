const database = require("../db/db");

const notify = async ({type, playerId, entityId}) => {
    try {
        await database.notify({type, playerId, entityId});
    } catch (error) {
        console.error("An error occurred when attempting to add notification ", error);
    }
};

module.exports = {
    notify,
};
