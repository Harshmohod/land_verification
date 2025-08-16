// Global variables
let currentUser = null;
let documents = [];
let users = [];
let authToken = localStorage.getItem('authToken');

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
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
async function handleLogin(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ userType, username, password })
        });
        
        currentUser = response.user;
        authToken = response.token;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        
        closeLoginModal();
        await loadDashboardData();
        showDashboard();
        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage(error.message || 'Login failed. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const userType = document.getElementById('regUserType').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const pincode = document.getElementById('regPincode').value;
    
    try {
        const response = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({
                userType,
                name,
                email,
                password,
                pincode: pincode || null
            })
        });
        
        closeRegisterModal();
        showMessage('Registration successful! Please login.', 'success');
    } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    }
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        if (currentUser.userType === 'admin') {
            // Load all users and documents for admin
            const [usersResponse, documentsResponse, statsResponse] = await Promise.all([
                apiRequest('/users'),
                apiRequest('/documents'),
                apiRequest('/stats')
            ]);
            users = usersResponse.users;
            documents = documentsResponse.documents;
        } else {
            // Load documents for citizen/tehsildar
            const documentsResponse = await apiRequest('/documents');
            documents = documentsResponse.documents;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Error loading dashboard data', 'error');
    }
}

// Show dashboard based on user type
async function showDashboard() {
    await loadDashboardData();
    
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
                                    ${doc.review ? `<div class="document-review"><strong>Tehsildar Review:</strong> ${doc.review}</div>` : ''}
                                    ${doc.status === 'approved' ? `<div class="document-review approved"><strong>Status:</strong> Document approved by ${getUserName(doc.verifiedBy)}</div>` : ''}
                                </div>
                                <div class="document-actions">
                                    <button class="btn-secondary" onclick="previewDocument(${doc.id})">View Document</button>
                                    <div class="document-status status-${doc.status}">
                                        ${getStatusIcon(doc.status)} ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                    </div>
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
                                    ${doc.review ? `<div class="document-review"><strong>Your Review:</strong> ${doc.review}</div>` : ''}
                                </div>
                                <div class="document-actions">
                                    ${doc.status === 'pending' ? `
                                        <button class="btn-primary" onclick="previewDocument(${doc.id})">View Document</button>
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
                                    ${doc.review ? `<div class="document-review"><strong>Review:</strong> ${doc.review}</div>` : ''}
                                    ${doc.issue ? `<div class="document-issue">Issue: ${doc.issue}</div>` : ''}
                                </div>
                                <div class="document-actions">
                                    <button class="btn-secondary" onclick="previewDocument(${doc.id})">View Document</button>
                                    <div class="document-status status-${doc.status}">
                                        ${getStatusIcon(doc.status)} ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                    </div>
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
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', file.name);
        
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        showMessage('Document uploaded successfully!', 'success');
        await showDashboard(); // Refresh dashboard
    } catch (error) {
        showMessage(error.message || 'Upload failed. Please try again.', 'error');
    }
}

// Verify document (for tehsildar)
async function verifyDocument(docId, status) {
    try {
        let review = null;
        let issue = null;
        
        if (status === 'rejected') {
            issue = prompt('Please specify the issue:');
            if (!issue) return; // User cancelled
        } else if (status === 'approved') {
            review = prompt('Please provide a review comment (optional):');
        }
        
        const response = await apiRequest(`/documents/${docId}/verify`, {
            method: 'PUT',
            body: JSON.stringify({ status, review, issue })
        });
        
        showMessage(`Document ${status}!`, 'success');
        await showDashboard(); // Refresh dashboard
    } catch (error) {
        showMessage(error.message || 'Verification failed', 'error');
    }
}

// Preview document
function previewDocument(docId) {
    const doc = documents.find(d => d.id === docId);
    if (doc && doc.fileContent) {
        // Create modal for document preview
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        let content = '';
        if (doc.fileType.startsWith('image/')) {
            content = `<img src="${doc.fileContent}" alt="${doc.title}" style="max-width: 100%; height: auto;">`;
        } else if (doc.fileType === 'application/pdf') {
            content = `<iframe src="${doc.fileContent}" width="100%" height="600px" style="border: none;"></iframe>`;
        } else {
            content = `<p>Document preview not available for this file type.</p>
                      <p><strong>File:</strong> ${doc.title}</p>
                      <a href="${doc.fileContent}" download="${doc.title}" class="btn-primary">Download Document</a>`;
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="document-preview">
                    <h3>${doc.title}</h3>
                    <div class="preview-content">
                        ${content}
                    </div>
                    <div class="document-details">
                        <p><strong>Uploaded by:</strong> ${getUserName(doc.userId)}</p>
                        <p><strong>Upload date:</strong> ${new Date(doc.uploadDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</p>
                        ${doc.review ? `<p><strong>Review:</strong> ${doc.review}</p>` : ''}
                        ${doc.issue ? `<p><strong>Issue:</strong> ${doc.issue}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.onclick = function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        };
    } else {
        showMessage('Document not found or no preview available.', 'error');
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
    authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
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
window.onload = async function() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        try {
            await showDashboard();
        } catch (error) {
            // Token might be expired, clear and reload
            logout();
        }
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
