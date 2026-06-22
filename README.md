# Medicare Backend

A comprehensive Node.js/Express backend for the Medicare medical management system with MongoDB database, JWT authentication, and role-based access control.

## Features

- **JWT Authentication** with role-based access control
- **4 User Roles**: Patient, Doctor, Reception, Admin
- **RESTful API** with 40+ endpoints
- **File Upload** for medical records
- **OTP-based Password Reset**
- **Security Alerts** for unauthorized login attempts
- **Inventory Management** for pharmacy
- **Invoice Generation** with dynamic pricing

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd medicare-back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medicare
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Using Homebrew on macOS
   brew services start mongodb-community
   
   # Or using mongod directly
   mongod --dbpath /path/to/data/directory
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Test Credentials

After running the seed script, you can use these credentials:

- **Admin**: `admin@medicare.com` / `password123`
- **Doctor**: `doctor@medicare.com` / `password123`
- **Reception**: `reception@medicare.com` / `password123`
- **Patient**: `patient@medicare.com` / `password123`
- **Deactivated User**: `deactivated@medicare.com` / `password123` (should fail with security alert)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user info (requires JWT)

### Patient Module
- `GET /api/patient/profile` - Get patient profile
- `GET /api/patient/appointments` - Get all appointments
- `POST /api/patient/appointments` - Book new appointment
- `PUT /api/patient/appointments/:id/cancel` - Request cancellation
- `PUT /api/patient/appointments/:id/reschedule` - Request reschedule
- `GET /api/patient/medical-records` - Get medical records
- `POST /api/patient/medical-records` - Upload medical record
- `GET /api/patient/notifications` - Get notifications
- `PUT /api/patient/notifications/:id/read` - Mark as read
- `GET /api/patient/doctors` - Get all doctors
- `POST /api/patient/contact-request` - Submit contact request

### Doctor Module
- `GET /api/doctor/appointments` - Get doctor's appointments
- `GET /api/doctor/appointments/:id` - Get appointment details
- `PUT /api/doctor/appointments/:id/consultation` - Update consultation
- `PUT /api/doctor/appointments/:id/approve-change` - Approve patient request
- `PUT /api/doctor/appointments/:id/deny-change` - Deny patient request
- `GET /api/doctor/patients/search` - Search patients
- `GET /api/doctor/patients/:id/history` - Get patient history
- `PUT /api/doctor/patients/:id/name` - Update patient name
- `GET /api/doctor/notifications` - Get notifications
- `PUT /api/doctor/status` - Update online/offline status
- `PUT /api/doctor/slots` - Update available slots

### Reception Module
- `POST /api/reception/walk-in` - Register walk-in patient
- `GET /api/reception/queue` - Get today's patient queue
- `GET /api/reception/stats` - Get reception stats
- `GET /api/reception/invoice/:appointmentId` - Generate invoice
- `POST /api/reception/invoice` - Save and mark invoice as paid

### Admin Module
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/inventory` - Get inventory items
- `POST /api/admin/inventory` - Add inventory item
- `PUT /api/admin/inventory/:id` - Update inventory item
- `DELETE /api/admin/inventory/:id` - Delete inventory item
- `PUT /api/admin/inventory/:id/adjust-stock` - Adjust stock
- `GET /api/admin/security-alerts` - Get security alerts
- `GET /api/admin/contact-requests` - Get contact requests
- `PUT /api/admin/contact-requests/:id` - Update request status

## Project Structure

```
medicare-back/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── scripts/         # Database seed scripts
│   └── server.ts        # Main entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Seed database
npm run seed
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Endpoints protected by user roles
- **Deactivated User Detection**: Logs security alerts when deactivated users attempt login
- **File Upload Validation**: Only allows specific file types and sizes

## Error Handling

All endpoints return consistent JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## License

ISC

## Support

For issues or questions, please contact the admin department.
