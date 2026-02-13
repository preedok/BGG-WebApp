#!/bin/bash

echo "=================================================="
echo "   BINTANG GLOBAL GROUP - PROJECT SETUP"
echo "   Enterprise B2B Platform for Umroh Services"
echo "   Database: PostgreSQL"
echo "   FIXED VERSION - Compatible Dependencies"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create root project directory
PROJECT_NAME="bintang-global-group"
echo -e "${GREEN}Creating project structure for ${PROJECT_NAME}...${NC}"

# Remove old directory if exists
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}Removing existing directory...${NC}"
    rm -rf $PROJECT_NAME
fi

# Create main directories
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# ==========================================
# ROOT PACKAGE.JSON
# ==========================================
echo -e "${YELLOW}Creating root package.json...${NC}"
cat > package.json << 'EOF'
{
  "name": "bintang-global-group",
  "version": "1.0.0",
  "description": "Enterprise B2B Platform for Umroh Services - Bintang Global Group",
  "main": "index.js",
  "scripts": {
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install --legacy-peer-deps && cd ..",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend && npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "concurrently \"npm run test:backend\" \"npm run test:frontend\"",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test",
    "migrate": "cd backend && npm run migrate",
    "migrate:undo": "cd backend && npm run migrate:undo",
    "seed": "cd backend && npm run seed",
    "seed:undo": "cd backend && npm run seed:undo",
    "clean": "rm -rf node_modules backend/node_modules frontend/node_modules"
  },
  "keywords": ["umroh", "b2b", "enterprise", "hotel", "visa", "ticket", "travel", "postgresql"],
  "author": "Bintang Global Group",
  "license": "ISC",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# ==========================================
# ROOT README
# ==========================================
echo -e "${YELLOW}Creating root README.md...${NC}"
cat > README.md << 'EOF'
# Bintang Global Group - Enterprise B2B Platform

Platform manajemen terintegrasi untuk layanan umroh yang mengelola hotel, visa, tiket, bus, dan paket umroh.

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Setup PostgreSQL database
createdb bintang_global

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials

# 4. Run migrations
npm run migrate

# 5. Seed database (optional)
npm run seed

# 6. Start application
npm start
```

## Access Points
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

## Default Users
After seeding:
- Super Admin: superadmin@bintangglobal.com / password123
- Admin Pusat: adminpusat@bintangglobal.com / password123
- Admin Cabang: admincabang.jakarta@bintangglobal.com / password123
- Owner: owner@example.com / password123

## Troubleshooting

### Dependency Issues
If you encounter dependency conflicts during installation, use:
```bash
cd frontend
npm install --legacy-peer-deps
```

### PostgreSQL Connection
Make sure PostgreSQL is running:
```bash
# Ubuntu/Debian
sudo service postgresql start

# macOS
brew services start postgresql

# Check status
pg_isready
```
EOF

# ==========================================
# BACKEND STRUCTURE
# ==========================================
echo -e "${BLUE}Creating backend structure...${NC}"
mkdir -p backend

# Backend directories
mkdir -p backend/src/{config,controllers,models,routes,middleware,services,utils,validators,migrations,seeders,jobs}
mkdir -p backend/src/controllers/{auth,user,hotel,visa,ticket,bus,package,order,invoice,payment,branch,notification,report,settings,dashboard}
mkdir -p backend/src/models/{user,product,order,payment,branch,notification,settings}
mkdir -p backend/src/routes/v1
mkdir -p backend/src/middleware/{auth,validation,upload,error}
mkdir -p backend/src/services/{email,notification,payment,report,export,socket}
mkdir -p backend/src/utils/{constants,helpers,validators}
mkdir -p backend/src/validators/{auth,product,order,payment}
mkdir -p backend/uploads/{payments,documents,reports,mou}
mkdir -p backend/logs
mkdir -p backend/tests/{unit,integration,fixtures}
mkdir -p backend/temp/reports

# Backend package.json - UPDATED with latest versions
cat > backend/package.json << 'EOF'
{
  "name": "bintang-global-backend",
  "version": "1.0.0",
  "description": "Backend API for Bintang Global Group",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "migrate:undo:all": "sequelize-cli db:migrate:undo:all",
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo:all",
    "db:create": "sequelize-cli db:create",
    "db:drop": "sequelize-cli db:drop"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.12.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.37.3",
    "dotenv": "^16.4.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.2.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.4.0",
    "multer": "^1.4.5-lts.1",
    "moment": "^2.30.1",
    "moment-timezone": "^0.5.45",
    "nodemailer": "^6.9.15",
    "winston": "^3.14.2",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "express-mongo-sanitize": "^2.2.0",
    "hpp": "^0.2.3",
    "joi": "^17.13.3",
    "socket.io": "^4.7.5",
    "exceljs": "^4.4.0",
    "pdfkit": "^0.15.0",
    "qrcode": "^1.5.4",
    "sharp": "^0.33.5",
    "node-cron": "^3.0.3",
    "express-async-handler": "^1.2.0",
    "validator": "^13.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.7",
    "sequelize-cli": "^6.6.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "eslint": "^8.57.1"
  }
}
EOF

# Backend .env.example
cat > backend/.env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/bintang_global
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bintang_global
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=noreply@bintangglobal.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Report Generation
REPORT_TEMP_DIR=./temp/reports
LOG_LEVEL=info
EOF

cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=5000
API_VERSION=v1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bintang_global
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bintang_global
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
JWT_SECRET=bintang-global-secret-key-2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# Sequelize Config
cat > backend/.sequelizerc << 'EOF'
const path = require('path');

module.exports = {
  'config': path.resolve('src/config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
EOF

# Backend .gitignore
cat > backend/.gitignore << 'EOF'
node_modules/
.env
uploads/
logs/
temp/
*.log
.DS_Store
coverage/
dist/
build/
EOF

# Backend README
cat > backend/README.md << 'EOF'
# Bintang Global Group - Backend API

RESTful API untuk platform Bintang Global Group dengan PostgreSQL

## Tech Stack
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Socket.io

## Setup
1. `npm install`
2. Configure `.env` file
3. `npm run migrate`
4. `npm run seed`
5. `npm start`

## Database Commands
```bash
npm run migrate         # Run migrations
npm run migrate:undo    # Undo last migration
npm run seed            # Seed database
npm run seed:undo       # Undo seeds
```
EOF

echo -e "${YELLOW}Creating backend core files...${NC}"

# Database Config
cat > backend/src/config/database.js << 'EOF'
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'bintang_global',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: (process.env.DB_NAME || 'bintang_global') + '_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};
EOF

# Sequelize Instance
cat > backend/src/config/sequelize.js << 'EOF'
const { Sequelize } = require('sequelize');
const config = require('./database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;

if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connection established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to PostgreSQL database:', err);
  });

module.exports = sequelize;
EOF

# Logger Config
cat > backend/src/config/logger.js << 'EOF'
const winston = require('winston');
const path = require('path');

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
EOF

# Roles Config
cat > backend/src/config/roles.js << 'EOF'
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_PUSAT: 'admin_pusat',
  ADMIN_CABANG: 'admin_cabang',
  ROLE_INVOICE: 'role_invoice',
  ROLE_HANDLING: 'role_handling',
  ROLE_VISA: 'role_visa',
  ROLE_BUS: 'role_bus',
  ROLE_TICKET: 'role_ticket',
  ROLE_ACCOUNTING: 'role_accounting',
  OWNER: 'owner'
};

const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN_PUSAT]: [
    'manage_branches', 'manage_users', 'manage_products',
    'manage_packages', 'manage_settings', 'view_all_reports'
  ],
  [ROLES.ADMIN_CABANG]: [
    'manage_branch_users', 'view_branch_reports', 'manage_owners'
  ],
  [ROLES.ROLE_INVOICE]: [
    'create_orders', 'view_orders', 'manage_invoices'
  ],
  [ROLES.ROLE_HANDLING]: [
    'view_hotels', 'manage_room_allocation'
  ],
  [ROLES.ROLE_VISA]: [
    'view_visa_orders', 'process_visa'
  ],
  [ROLES.ROLE_BUS]: [
    'view_bus_orders', 'manage_bus_allocation'
  ],
  [ROLES.ROLE_TICKET]: [
    'view_ticket_orders', 'manage_tickets'
  ],
  [ROLES.ROLE_ACCOUNTING]: [
    'view_financial_reports', 'manage_payments'
  ],
  [ROLES.OWNER]: [
    'view_products', 'create_orders', 'view_own_orders'
  ]
};

module.exports = { ROLES, PERMISSIONS };
EOF

# Server file
cat > backend/src/server.js << 'EOF'
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
EOF

# App file
cat > backend/src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bintang Global API is running',
    database: 'PostgreSQL'
  });
});

app.use('/api/v1', require('./routes/v1'));

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
EOF

# Routes index
cat > backend/src/routes/v1/index.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Bintang Global Group API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      hotels: '/api/v1/hotels',
      products: '/api/v1/products',
      orders: '/api/v1/orders'
    }
  });
});

module.exports = router;
EOF

# Models index
cat > backend/src/models/index.js << 'EOF'
const sequelize = require('../config/sequelize');

const db = {
  sequelize,
  Sequelize: require('sequelize')
};

module.exports = db;
EOF

# ==========================================
# FRONTEND STRUCTURE
# ==========================================
echo -e "${BLUE}Creating frontend structure...${NC}"
mkdir -p frontend

mkdir -p frontend/src/{components,pages,layouts,store,hooks,services,utils,types,assets,routes}
mkdir -p frontend/src/components/{common,layout,dashboard,auth}
mkdir -p frontend/src/pages/{auth,dashboard}
mkdir -p frontend/public

# Frontend package.json - FIXED TypeScript version
cat > frontend/package.json << 'EOF'
{
  "name": "bintang-global-frontend",
  "version": "1.0.0",
  "description": "Frontend for Bintang Global Group",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "react-scripts": "5.0.1",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "axios": "^1.6.4",
    "formik": "^2.4.5",
    "yup": "^1.3.3",
    "socket.io-client": "^4.6.0",
    "moment": "^2.29.4",
    "recharts": "^2.10.3",
    "react-toastify": "^9.1.3",
    "typescript": "^4.9.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/node": "^20.10.6"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_NAME=Bintang Global Group
EOF

cat > frontend/.gitignore << 'EOF'
node_modules/
/build
.env.local
.DS_Store
EOF

cat > frontend/README.md << 'EOF'
# Bintang Global Group - Frontend

React application untuk platform Bintang Global Group

## Setup
```bash
npm install --legacy-peer-deps
npm start
```
EOF

cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bintang Global Group</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

cat > frontend/src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

cat > frontend/src/App.tsx << 'EOF'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌟 Bintang Global Group</h1>
        <p>Enterprise B2B Platform for Umroh Services</p>
        <p>Database: PostgreSQL</p>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          <p>✅ Backend: http://localhost:5000</p>
          <p>✅ Frontend: http://localhost:3000</p>
        </div>
      </header>
    </div>
  );
}

export default App;
EOF

cat > frontend/src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
EOF

cat > frontend/src/App.css << 'EOF'
.App {
  text-align: center;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.App-header p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOF

# ==========================================
# ROOT FILES
# ==========================================
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
logs/
*.log
.DS_Store
uploads/
temp/
coverage/
dist/
build/
EOF

cat > .npmrc << 'EOF'
legacy-peer-deps=true
EOF

# ==========================================
# DOCKER SUPPORT
# ==========================================
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bintang-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bintang_global
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# ==========================================
# COMPLETION MESSAGE
# ==========================================
echo ""
echo -e "${GREEN}=================================================="
echo "   ✅ PROJECT SETUP COMPLETED SUCCESSFULLY!"
echo "   Database: PostgreSQL"
echo "==================================================${NC}"
echo ""
echo -e "${BLUE}Project: ${YELLOW}${PROJECT_NAME}${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Install dependencies:"
echo "   ${GREEN}cd $PROJECT_NAME${NC}"
echo "   ${GREEN}npm run install:all${NC}"
echo ""
echo "2. Setup PostgreSQL:"
echo "   ${GREEN}createdb bintang_global${NC}"
echo "   ${GREEN}# OR use docker: docker-compose up postgres -d${NC}"
echo ""
echo "3. Configure environment:"
echo "   ${GREEN}nano backend/.env${NC}"
echo "   ${GREEN}# Update DB credentials if needed${NC}"
echo ""
echo "4. Run migrations:"
echo "   ${GREEN}npm run migrate${NC}"
echo ""
echo "5. Seed database (optional):"
echo "   ${GREEN}npm run seed${NC}"
echo ""
echo "6. Start application:"
echo "   ${GREEN}npm start${NC}"
echo ""
echo -e "${YELLOW}🚀 Access Points:${NC}"
echo "   Backend:  ${BLUE}http://localhost:5000${NC}"
echo "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo "   Database: ${BLUE}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}💡 Troubleshooting:${NC}"
echo "   If frontend install fails, try:"
echo "   ${GREEN}cd frontend && npm install --legacy-peer-deps${NC}"
echo ""
echo -e "${GREEN}Happy Coding! 🎉${NC}"
echo ""