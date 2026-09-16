const AuditLog = require('../models/AuditLog');

const logAction = async ({ req, action, entityType, entityId, details, previousState, newState }) => {
  try {
    const userId = req && req.user ? req.user._id : null;
    const userName = req && req.user ? req.user.name : 'System Automation';
    const userEmail = req && req.user ? req.user.email : 'system@smartgrocery.ai';
    const userRole = req && req.user ? req.user.role : 'system';
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';

    await AuditLog.create({
      user: userId,
      userName,
      userEmail,
      userRole,
      action,
      entityType,
      entityId,
      details,
      previousState,
      newState,
      ipAddress
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAction };
