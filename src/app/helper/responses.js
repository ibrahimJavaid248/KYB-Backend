function successResponse(res, status, statusCode, message, data = null, logId = null, pagination = null, token = null) {
    const response = {
        "status": status,
        "statusCode": statusCode,
        "message": message,
    };
    if (logId !== null) {
        response.logId = logId;
    }
    if (data !== null) {
        response.data = data;

        if (pagination !== null) {
            response.data.pagination = pagination;
        }
    }
    if (token !== null) {
        response.token = token;
    }
    res.status(statusCode).json(response);
}


function failureResponse(res, statusCode, message, logId) {
    const response = {
        "status": "error",
        "statusCode": statusCode,
        "message": message,
        "logId": logId
    };



    res.status(statusCode).json(response);
}

module.exports = {successResponse , failureResponse}