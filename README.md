# Land Verification System

A digital land document verification system for citizens, tehsildars, and administrators with full backend connectivity and database management.

## Features

- **User Management**: Registration and authentication for citizens, tehsildars, and administrators
- **Document Upload**: Secure file upload with support for images, PDFs, and documents
- **Document Verification**: Tehsildars can review and verify documents in their region
- **Real-time Tracking**: Track document status and verification progress
- **Admin Dashboard**: Comprehensive overview of all users and documents
- **Database Storage**: SQLite database for persistent data storage
- **JWT Authentication**: Secure token-based authentication

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd land_verification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and go to: `http://localhost:3000`

## Default Users

The system comes with pre-configured users for testing:

### Admin
- **Username**: admin
- **Password**: admin123
- **Access**: Full system access, user management, statistics

### Tehsildars
- **Username**: tehsildar1, tehsildar2, tehsildar3, tehsildar4, tehsildar5
- **Password**: tehsildar123
- **Regions**: Mumbai (400001), Delhi (110001), Kolkata (700001), Chennai (600001), Hyderabad (500001)

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/stats` - Get system statistics
- `GET /api/tehsildars` - Get all tehsildars

### Document Management
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get documents (filtered by user type)
- `PUT /api/documents/:id/verify` - Verify document (Tehsildar only)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username/email
- `password` - Hashed password
- `userType` - citizen, tehsildar, or admin
- `name` - Full name
- `email` - Email address
- `pincode` - Region pincode
- `phone` - Phone number
- `address` - Address
- `createdAt` - Registration timestamp
- `updatedAt` - Last update timestamp

### Documents Table
- `id` - Primary key
- `userId` - Foreign key to users table
- `title` - Document title
- `fileName` - Original filename
- `filePath` - Server file path
- `fileType` - MIME type
- `fileSize` - File size in bytes
- `uploadDate` - Upload timestamp
- `status` - pending, approved, or rejected
- `pincode` - Region pincode
- `verifiedBy` - Foreign key to users table (tehsildar)
- `verificationDate` - Verification timestamp
- `review` - Tehsildar review comment
- `issue` - Rejection reason

## User Roles

### Citizen
- Register and login
- Upload land documents
- Track document status
- View tehsildar information

### Tehsildar
- Login with regional access
- Review documents in their region
- Approve or reject documents
- Add review comments

### Admin
- Full system access
- View all users and documents
- Access system statistics
- Monitor regional activities

## File Upload

Supported file types:
- Images: JPEG, JPG, PNG
- Documents: PDF, DOC, DOCX
- Maximum file size: 10MB

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- File type validation
- File size limits
- CORS protection
- Input validation

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Project Structure

```
land_verification/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── index.html             # Frontend HTML
├── script.js              # Frontend JavaScript
├── styles.css             # Frontend styles
├── database.sqlite        # SQLite database (created automatically)
├── uploads/               # Uploaded files directory
├── config.env             # Environment variables
└── README.md              # This file
```

## Troubleshooting

1. **Port already in use**: Change the PORT in config.env
2. **Database errors**: Delete database.sqlite and restart server
3. **Upload failures**: Check uploads directory permissions
4. **Authentication errors**: Clear browser localStorage and login again

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
