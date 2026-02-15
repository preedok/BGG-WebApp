require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/sequelize');
const logger = require('./config/logger');

// Load models (register with sequelize)
require('./models');

const PORT = process.env.PORT || 5000;

/** Ensure users table has password_hash column (fix login error if column was missing or named differently) */
async function ensureUsersPasswordHashColumn(db) {
  try {
    const [rows] = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      AND column_name IN ('password_hash', 'passwordhash', 'password');
    `);
    const columns = (rows || []).map(r => r.column_name);
    if (columns.includes('password_hash')) return;
    if (columns.includes('passwordhash')) {
      await db.query('ALTER TABLE users RENAME COLUMN passwordhash TO password_hash');
      logger.info('users: renamed column passwordhash -> password_hash');
      return;
    }
    if (columns.includes('password')) {
      await db.query('ALTER TABLE users RENAME COLUMN password TO password_hash');
      logger.info('users: renamed column password -> password_hash');
      return;
    }
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
    logger.info('users: added column password_hash');
  } catch (e) {
    logger.warn('ensureUsersPasswordHashColumn:', e.message);
  }
}

// alter: false by default — avoid ALTER when DB has views (e.g. v_orders_summary) that depend on tables.
// Set SYNC_ALTER=true only when you need schema changes and have dropped dependent views.
sequelize.sync({ alter: process.env.SYNC_ALTER === 'true' })
  .then(() => ensureUsersPasswordHashColumn(sequelize))
  .then(() => {
    logger.info('Database synchronized');
    
    app.listen(PORT, async () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🗄️  Database: PostgreSQL`);
      logger.info(`🌐 API: http://localhost:${PORT}/api/v1`);
      const { SystemLog } = require('./models');
      await SystemLog.create({ source: 'backend', level: 'info', message: 'Server started', meta: { port: PORT } }).catch(() => {});
    });
  })
  .catch(err => {
    logger.error('Failed to sync database:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
