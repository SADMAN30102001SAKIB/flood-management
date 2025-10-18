# Flood Relief Management System

A production-quality web platform for coordinating flood relief operations.

## Features

- **User Management**: Request help for rescue, medical, food, clothing, and shelter
- **Volunteer Coordination**: Permanent and emergency volunteers can accept and respond to requests
- **Admin Operations**: Approve accounts, manage shelters, assign resources, broadcast notifications
- **Role-Based Access Control**: User, Volunteer, Emergency Volunteer, Admin roles with approval workflow
- **Location-Based Services**: Emergency volunteers see urgent nearby requests
- **Real-time Status Tracking**: Track requests from submission to completion

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Authentication**: NextAuth.js with email/password
- **Database**: MongoDB with Mongoose ODM
- **Maps**: Leaflet for location visualization
- **Charts**: Recharts for admin dashboard

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 5+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and NextAuth secret
```

3. Seed the database:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Default Admin Account

After seeding:
- **Email**: admin@floodrelief.com
- **Password**: Admin@123

## API Documentation

See inline OpenAPI-style comments in `/app/api/` routes.

## License

MIT
