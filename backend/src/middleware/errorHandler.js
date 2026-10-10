// =====================================================================
// Central Error and Not-Found Handling Middleware
// Ensures standardized JSON error payloads and protects internal logs
// =====================================================================

/**
 * 404 Not Found handler for undefined API routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Global centralized error-handling middleware
 */
function errorHandler(err, req, res, next) {
  // Catch malformed JSON payload errors sent by clients
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body'
    });
  }

  // Log detailed error internally on the server console for debugging
  console.error('[Unhandled Server Error]:', err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  
  // Return clean, safe error message to client without leaking stack traces or database schema details
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'An unexpected internal server error occurred. Please contact the administrator.'
      : err.message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
