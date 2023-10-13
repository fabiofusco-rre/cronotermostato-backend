
exports.successResponse = (payload) => {
  return makeResponse(null, '', 'success', payload);
}

exports.errorResponse = (code, message) => {
  return makeResponse(code, message, 'fail');
}

function makeResponse(code, message, status, payload) {
  const response = {
    outcome: {
      code: code,
      message: message,
      status: status
    },
    payload: payload
  }
  return JSON.stringify(response);
}