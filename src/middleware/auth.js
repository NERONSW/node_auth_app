//Auth Module

export const requiresAuth = (req, res, next) => {
  if (req.session.userId) {
    next(); // user is authenticated, proceed
  } else {
    // User not authenticated, create error manually
    const error = new Error("User not authenticated");
    error.statusCode = 401; // Unauthorized
    next(error); // pass to global error handler
  }
};
