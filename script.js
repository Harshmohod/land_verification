// Global variables
let currentUser = null;
let documents = JSON.parse(localStorage.getItem('documents')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Initialize with default users if empty
if (users.length === 0) {
    users = [
        { id: 1, username: 'admin', password: 'admin123', userType: 'admin', name: 'System Admin' },
        { id: 2, username: 'tehsildar1', password: 'tehsildar123', userType: 'tehsildar', name: 'Tehsildar Mumbai', pincode: '400001' },
        { id: 3, username: 'tehsildar2', password: 'tehsildar123', userType: 'tehsildar', name: 'Tehsildar Delhi', pincode: '110001' },
        { id: 4, username: 'tehsildar3', password: 'tehsildar123', userType: 'tehsildar', name: 'Tehsildar Kolkata', pincode: '700001' },
        { id: 5, username: 'tehsildar4', password: 'tehsildar123', userType: 'tehsildar', name: 'Tehsildar Chennai', pincode: '600001' },
        { id: 6, username: 'tehsildar5', password: 'tehsildar123', userType: 'tehsildar', name: 'Tehsildar Hyderabad', pincode: '500001' },
        { id: 7, username: 'citizen1', password: 'citizen123', userType: 'citizen', name: 'John Doe', pincode: '400001' },
        { id: 8, username: 'citizen2', password: 'citizen123', userType: 'citizen', name: 'Jane Smith', pincode: '110001' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function openRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
    document.getElementById('pincodeGroup').style.display = 'none';
}

// Handle register form user type change
document.getElementById('regUserType').addEventListener('change', function() {
    const pincodeGroup = document.getElementById('pincodeGroup');
    if (this.value === 'tehsildar' || this.value === 'citizen') {
        pincodeGroup.style.display = 'block';
        document.getElementById('regPincode').required = true;
    } else {
        pincodeGroup.style.display = 'none';
        document.getElementById('regPincode').required = false;
    }
});

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.userType === userType
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeLoginModal();
        showDashboard();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid credentials. Please try again.', 'error');
    }
}

// Handle registration
function handleRegister(event) {
    event.preventDefault();
    
    const userType = document.getElementById('regUserType').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const pincode = document.getElementById('regPincode').value;
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === email);
    if (existingUser) {
        showMessage('User already exists with this email.', 'error');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        username: email,
        password: password,
        userType: userType,
        name: name,
        pincode: pincode || null
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeRegisterModal();
    showMessage('Registration successful! Please login.', 'success');
}

// Show dashboard based on user type
function showDashboard() {
    const main = document.querySelector('main');
    
    if (currentUser.userType === 'citizen') {
        main.innerHTML = createCitizenDashboard();
    } else if (currentUser.userType === 'tehsildar') {
        main.innerHTML = createTehsildarDashboard();
    } else if (currentUser.userType === 'admin') {
        main.innerHTML = createAdminDashboard();
    }
    
    // Update navigation
    updateNavigation();
}

// Create citizen dashboard
function createCitizenDashboard() {
    const userDocuments = documents.filter(doc => doc.userId === currentUser.id);
    const assignedTehsildar = users.find(u => u.userType === 'tehsildar' && u.pincode === currentUser.pincode);
    
    return `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Welcome, ${currentUser.name}!</h1>
                <p>Citizen Dashboard - Upload and track your land verification documents</p>
                <p><strong>Your Region:</strong> ${currentUser.pincode} | <strong>Assigned Tehsildar:</strong> ${assignedTehsildar ? assignedTehsildar.name : 'Not Assigned'}</p>
            </div>
            <div class="dashboard-content">
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3><i class="fas fa-upload"></i> Upload Document</h3>
                        <p>Upload your land verification documents for review</p>
                        <div class="upload-area" onclick="document.getElementById('fileInput').click()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Click to upload document</p>
                            <input type="file" id="fileInput" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="handleFileUpload(event)">
                        </div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-chart-bar"></i> Document Status</h3>
                        <p>Track the status of your uploaded documents</p>
                        <div class="status-summary">
                            <div class="status-item">
                                <span class="status-dot pending"></span>
                                <span>Pending: ${userDocuments.filter(doc => doc.status === 'pending').length}</span>
                            </div>
                            <div class="status-item">
                                <span class="status-dot approved"></span>
                                <span>Approved: ${userDocuments.filter(doc => doc.status === 'approved').length}</span>
                            </div>
                            <div class="status-item">
                                <span class="status-dot rejected"></span>
                                <span>Rejected: ${userDocuments.filter(doc => doc.status === 'rejected').length}</span>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-user-tie"></i> Your Tehsildar</h3>
                        <p>Contact information for your assigned tehsildar</p>
                        <div class="tehsildar-info">
                            <p><strong>Name:</strong> ${assignedTehsildar ? assignedTehsildar.name : 'Not Assigned'}</p>
                            <p><strong>Region:</strong> ${currentUser.pincode}</p>
                            <p><strong>Status:</strong> ${assignedTehsildar ? 'Active' : 'No Tehsildar Assigned'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-file-alt"></i> Your Documents</h3>
                    <div class="document-list">
                        ${userDocuments.length === 0 ? '<p class="text-center">No documents uploaded yet.</p>' : ''}
                        ${userDocuments.map(doc => `
                            <div class="document-item">
                                <div class="document-info">
                                    <div class="document-title">${doc.title}</div>
                                    <div class="document-date">Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</div>
                                    ${doc.status === 'rejected' ? `<div class="document-issue">Issue: ${doc.issue}</div>` : ''}
                                </div>
                                <div class="document-status status-${doc.status}">
                                    ${getStatusIcon(doc.status)} ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create tehsildar dashboard
function createTehsildarDashboard() {
    const regionDocuments = documents.filter(doc => doc.pincode === currentUser.pincode);
    
    return `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Welcome, ${currentUser.name}!</h1>
                <p>Tehsildar Dashboard - Region: ${currentUser.pincode}</p>
            </div>
            <div class="dashboard-content">
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3><i class="fas fa-tasks"></i> Pending Reviews</h3>
                        <p>Documents awaiting your verification</p>
                        <div class="count-badge">${regionDocuments.filter(doc => doc.status === 'pending').length}</div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-check-circle"></i> Approved Today</h3>
                        <p>Documents approved today</p>
                        <div class="count-badge">${regionDocuments.filter(doc => doc.status === 'approved' && isToday(doc.verificationDate)).length}</div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-times-circle"></i> Rejected Today</h3>
                        <p>Documents rejected today</p>
                        <div class="count-badge">${regionDocuments.filter(doc => doc.status === 'rejected' && isToday(doc.verificationDate)).length}</div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-file-alt"></i> Region Documents</h3>
                    <div class="document-list">
                        ${regionDocuments.length === 0 ? '<p class="text-center">No documents in your region.</p>' : ''}
                        ${regionDocuments.map(doc => `
                            <div class="document-item">
                                <div class="document-info">
                                    <div class="document-title">${doc.title}</div>
                                    <div class="document-date">Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</div>
                                    <div class="document-user">By: ${getUserName(doc.userId)}</div>
                                </div>
                                <div class="document-actions">
                                    ${doc.status === 'pending' ? `
                                        <button class="btn-primary" onclick="verifyDocument(${doc.id}, 'approved')">Approve</button>
                                        <button class="btn-secondary" onclick="showRejectModal(${doc.id})">Reject</button>
                                    ` : `
                                        <div class="document-status status-${doc.status}">
                                            ${getStatusIcon(doc.status)} ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                        </div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create admin dashboard
function createAdminDashboard() {
    return `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Welcome, ${currentUser.name}!</h1>
                <p>Admin Dashboard - Overview of all regions</p>
            </div>
            <div class="dashboard-content">
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3><i class="fas fa-users"></i> Total Users</h3>
                        <p>Registered users in the system</p>
                        <div class="count-badge">${users.length}</div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-file-alt"></i> Total Documents</h3>
                        <p>Documents uploaded across all regions</p>
                        <div class="count-badge">${documents.length}</div>
                    </div>
                    <div class="dashboard-card">
                        <h3><i class="fas fa-clock"></i> Pending Reviews</h3>
                        <p>Documents awaiting verification</p>
                        <div class="count-badge">${documents.filter(doc => doc.status === 'pending').length}</div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-map-marker-alt"></i> Regional Overview</h3>
                    <div class="region-stats">
                        ${getRegionalStats()}
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="fas fa-file-alt"></i> All Documents</h3>
                    <div class="document-list">
                        ${documents.length === 0 ? '<p class="text-center">No documents uploaded yet.</p>' : ''}
                        ${documents.map(doc => `
                            <div class="document-item">
                                <div class="document-info">
                                    <div class="document-title">${doc.title}</div>
                                    <div class="document-date">Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}</div>
                                    <div class="document-user">By: ${getUserName(doc.userId)} | Region: ${doc.pincode}</div>
                                </div>
                                <div class="document-status status-${doc.status}">
                                    ${getStatusIcon(doc.status)} ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const newDocument = {
        id: documents.length + 1,
        userId: currentUser.id,
        title: file.name,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        pincode: currentUser.pincode || '400001' // Default pincode
    };
    
    documents.push(newDocument);
    localStorage.setItem('documents', JSON.stringify(documents));
    
    showMessage('Document uploaded successfully!', 'success');
    showDashboard(); // Refresh dashboard
}

// Verify document (for tehsildar)
function verifyDocument(docId, status) {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        doc.status = status;
        doc.verificationDate = new Date().toISOString();
        doc.verifiedBy = currentUser.id;
        
        if (status === 'rejected') {
            const issue = prompt('Please specify the issue:');
            if (issue) {
                doc.issue = issue;
            }
        }
        
        localStorage.setItem('documents', JSON.stringify(documents));
        showMessage(`Document ${status}!`, 'success');
        showDashboard(); // Refresh dashboard
    }
}

// Show reject modal
function showRejectModal(docId) {
    const issue = prompt('Please specify the issue with this document:');
    if (issue) {
        verifyDocument(docId, 'rejected');
    }
}

// Update navigation
function updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.innerHTML = `
        <span>Welcome, ${currentUser.name}</span>
        <button class="login-btn" onclick="logout()">Logout</button>
    `;
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// Utility functions
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function getStatusIcon(status) {
    switch(status) {
        case 'pending': return '<i class="fas fa-clock status-icon"></i>';
        case 'approved': return '<i class="fas fa-check status-icon"></i>';
        case 'rejected': return '<i class="fas fa-times status-icon"></i>';
        default: return '';
    }
}

function getUserName(userId) {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
}

function isToday(dateString) {
    const today = new Date().toDateString();
    const date = new Date(dateString).toDateString();
    return today === date;
}

function getRegionalStats() {
    const regions = [...new Set(documents.map(doc => doc.pincode))];
    return regions.map(region => {
        const regionDocs = documents.filter(doc => doc.pincode === region);
        const pending = regionDocs.filter(doc => doc.status === 'pending').length;
        const approved = regionDocs.filter(doc => doc.status === 'approved').length;
        const rejected = regionDocs.filter(doc => doc.status === 'rejected').length;
        
        return `
            <div class="region-stat">
                <h4>Region: ${region}</h4>
                <p>Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}</p>
            </div>
        `;
    }).join('');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Check if user is already logged in
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
};

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
};
