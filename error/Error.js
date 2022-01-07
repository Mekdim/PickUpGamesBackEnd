class InvalidInput extends Error {
    constructor(message) {
        super();
        this.name = this.constructor.name
        this.message = message;
        this.statusCode = 422;
    }
}

class ForbiddenAction extends Error {
    constructor(message) {
        super();
        this.name = this.constructor.name
        this.message = message;
        this.statusCode = 403;
    }
}

class ResultsNotFound extends Error {
    constructor(message) {
        super();
        this.name = this.constructor.name
        this.message = message;
        this.statusCode = 404;
    }
}

class DatabaseError extends Error {
    constructor(message) {
        super();
        this.name = this.constructor.name
        this.message = message;
        this.statusCode = 500;
    }
}

class UnknownError extends Error {
    constructor(message) {
        super();
        this.name = this.constructor.name
        this.message = message;
        this.statusCode = 500;
    }
}

module.exports = {
    InvalidInput,
    ResultsNotFound,
    DatabaseError,
    UnknownError,
    ForbiddenAction,
}
