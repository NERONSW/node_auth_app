import UserModel from "../models/user.js";
import bcrypt from "bcrypt";

export const getAuthenticatedUser = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      const error = new Error("Unauthorized. Please log in first.");
      error.statusCode = 401;
      throw error;
    }

    const user = await UserModel.findById(userId).select("+email").exec();

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

export const signUp = async (req, res, next) => {
  const { username, email, password: passwordRaw } = req.body;

  try {
    // Validate request parameters
    if (!username || !email || !passwordRaw) {
      const error = new Error("Parameters missing");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // Check if username exists
    const existingUsername = await UserModel.findOne({ username }).exec();
    if (existingUsername) {
      const error = new Error(
        "Username already taken. Please choose a different one or log in instead."
      );
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Check if email exists
    const existingEmail = await UserModel.findOne({ email }).exec();
    if (existingEmail) {
      const error = new Error(
        "A user with this email address already exists. Please log in instead."
      );
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Hash password and create user
    const passwordHashed = await bcrypt.hash(passwordRaw, 10);
    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHashed,
    });

    // Set session
    req.session.userId = newUser._id;

    res.status(201).json({
      message: "User saved successfully",
      data: newUser,
    });
  } catch (error) {
    next(error); // Forward to error-handling middleware
  }
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      const error = new Error("Parameters missing");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // Find user by username
    const user = await UserModel.findOne({ username })
      .select("+password +email")
      .exec();

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Save user session
    req.session.userId = user._id;

    // Return user info (without password ideally)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    res.status(200).json({
      message: "User logged in successfully",
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        message: "User logged out successfully",
      });
    }
  });
};
