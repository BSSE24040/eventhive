const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  // Only allow attendee/organizer on public sign-up; admin is seeded/promoted manually
  const safeRole = role === 'organizer' ? 'organizer' : 'attendee';

  const user = await User.create({ name, email, password, role: safeRole });
  return issueTokens(user);
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  return issueTokens(user);
};

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
};

const refreshAccessToken = async (incomingToken) => {
  if (!incomingToken) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Refresh token invalid or expired');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, 'Refresh token does not match stored session');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  return { accessToken };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: '' });
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
