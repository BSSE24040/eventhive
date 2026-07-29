const asyncHandler = require('express-async-handler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { accessToken, refreshToken, user } = await authService.registerUser({
    name,
    email,
    password,
    role,
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 201, { accessToken, user }, 'Account created successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.loginUser({ email, password });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 200, { accessToken, user }, 'Logged in successfully');
});

const refresh = asyncHandler(async (req, res) => {
  const { accessToken } = await authService.refreshAccessToken(req.cookies.refreshToken);
  sendSuccess(res, 200, { accessToken }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) await authService.logoutUser(req.user._id);
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 200, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user }, 'Current user fetched');
});

module.exports = { register, login, refresh, logout, getMe };
