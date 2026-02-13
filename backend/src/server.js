require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/sequelize');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: false })
  .then(() => {
    logger.info('Database synchronized');
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🗄️  Database: PostgreSQL`);
      logger.info(`🌐 API: http://localhost:${PORT}/api/v1`);
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
