# Land Verification System

A comprehensive digital land verification system that allows citizens to upload documents, tehsildars to verify them, and administrators to oversee the entire process.

## Features

### 🏠 **Citizen Portal**
- **User Registration & Login**: Citizens can register and login to the system
- **Document Upload**: Upload land verification documents (PDF, JPG, JPEG, PNG)
- **Status Tracking**: Real-time tracking of document verification status
- **Document History**: View all uploaded documents with their current status
- **Issue Notifications**: See specific issues if documents are rejected

### 👨‍💼 **Tehsildar Portal**
- **Region-based Access**: Tehsildars only see documents from their assigned region (pincode)
- **Document Verification**: Approve or reject documents with issue specification
- **Dashboard Overview**: View pending, approved, and rejected documents for their region
- **Daily Statistics**: Track daily verification activities

### 🔧 **Admin Portal**
- **System Overview**: View all documents across all regions
- **User Management**: Monitor all registered users
- **Regional Statistics**: Comprehensive overview of all regions
- **Read-only Access**: Can view but cannot modify documents (as per requirements)

## Default Login Credentials

### Admin
- **Username**: admin
- **Password**: admin123
- **Access**: Full system overview

### Tehsildars
- **Username**: tehsildar1
- **Password**: tehsildar123
- **Region**: Mumbai (400001)

- **Username**: tehsildar2
- **Password**: tehsildar123
- **Region**: Delhi (110001)

### Citizen
- **Username**: citizen1
- **Password**: citizen123
- **Region**: Mumbai (400001)

## How to Use

### For Citizens:
1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Documents**: Click the upload area to select and upload land verification documents
3. **Track Status**: Monitor the status of your documents (Pending/Approved/Rejected)
4. **View Issues**: If a document is rejected, you'll see the specific issue mentioned

### For Tehsildars:
1. **Login**: Use your tehsildar credentials to login
2. **View Region Documents**: See only documents from your assigned region
3. **Verify Documents**: Click "Approve" or "Reject" for pending documents
4. **Specify Issues**: When rejecting, provide specific reasons for rejection
5. **Monitor Statistics**: Track daily verification activities

### For Administrators:
1. **Login**: Use admin credentials to access the system
2. **System Overview**: View comprehensive statistics across all regions
3. **Monitor Activity**: Track all documents and user activities
4. **Regional Analysis**: View detailed breakdown by region

## Technical Features

### 🔒 **Security**
- User authentication and authorization
- Region-based access control for tehsildars
- Secure document handling

### 📱 **Responsive Design**
- Mobile-friendly interface
- Modern UI with smooth animations
- Cross-browser compatibility

### 💾 **Data Persistence**
- Local storage for demo purposes
- Document and user data management
- Status tracking and history

### 🎨 **User Experience**
- Intuitive navigation
- Real-time status updates
- Clear visual indicators (green tick for approved, red mark for rejected)
- Helpful notifications and messages

## File Structure

```
land_verification/
├── index.html          # Main landing page
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md          # This documentation
```

## Status Indicators

- **🟡 Pending**: Document is awaiting verification
- **🟢 Approved**: Document has been verified and approved (green tick)
- **🔴 Rejected**: Document has been rejected with specific issues (red mark)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started

1. Open `index.html` in a web browser
2. Register as a new user or login with default credentials
3. Explore the different user roles and their capabilities
4. Test document upload and verification processes

## Demo Scenarios

### Scenario 1: Citizen Upload
1. Login as a citizen
2. Upload a document
3. See it appear in pending status

### Scenario 2: Tehsildar Verification
1. Login as a tehsildar from the same region
2. View the pending document
3. Approve or reject with comments
4. Citizen sees updated status

### Scenario 3: Admin Overview
1. Login as admin
2. View all documents across regions
3. Monitor system statistics
4. Track regional activities

## Future Enhancements

- Database integration for production use
- File upload to cloud storage
- Email notifications
- Advanced document validation
- Digital signature integration
- Mobile app development
- API endpoints for external integrations

---

**Note**: This is a demo system using local storage. For production use, implement proper backend services, database, and security measures.
