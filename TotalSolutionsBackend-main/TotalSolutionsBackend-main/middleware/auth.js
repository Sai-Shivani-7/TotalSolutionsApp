const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const Child = require('../models/Child');

module.exports = async (req, res, next) => {
  const token = req.headers.Authorization || req.get('Authorization');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const bearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const verified = jwt.verify(bearer, process.env.JWT_SECRET);

    if (verified.role === 'child') {
      // child token payload has sub, name, role
      req.user = {
        _id: verified.sub,
        name: verified.name,
        role: 'child',
      };
      return next();
    }

    const userId = verified.user?._id || verified._id || verified.sub;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification failed in middleware:', err.message);
    res.status(403).send('Invalid Token');
  }
};
