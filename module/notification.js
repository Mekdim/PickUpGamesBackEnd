const database = require("../db/db");

const notify = async ({type, playerId, entityId}) => {
    try {
        await database.notify({type, playerId, entityId});
    } catch (error) {
        console.error("An error occurred when attempting to add notification ", error);
    }
};

const addAsPending = async({playerId, sessionId}) => {
    try {
        await database.inviteToSession({playerId, sessionId, sessionStatus: 'Invited'});
    } catch (error) {
        console.error("An error occurred when attempting to add Session Members ", error);
    }
}

module.exports = {
    notify,
    addAsPending,
};
