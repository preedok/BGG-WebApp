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
