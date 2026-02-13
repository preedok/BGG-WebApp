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
