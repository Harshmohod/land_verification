const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        userType TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        pincode TEXT,
        phone TEXT,
        address TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Documents table
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileType TEXT NOT NULL,
        fileSize INTEGER,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        pincode TEXT,
        verifiedBy INTEGER,
        verificationDate DATETIME,
        review TEXT,
        issue TEXT,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (verifiedBy) REFERENCES users (id)
    )`);

    // Insert default admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, userType, name, email) 
            VALUES ('admin', ?, 'admin', 'System Admin', 'admin@system.com')`, [adminPassword]);

    // Insert default tehsildars
    const tehsildarPassword = bcrypt.hashSync('tehsildar123', 10);
    const defaultTehsildars = [
        ['tehsildar1', tehsildarPassword, 'tehsildar', 'Tehsildar Mumbai', 'mumbai@tehsildar.com', '400001'],
        ['tehsildar2', tehsildarPassword, 'tehsildar', 'Tehsildar Delhi', 'delhi@tehsildar.com', '110001'],
        ['tehsildar3', tehsildarPassword, 'tehsildar', 'Tehsildar Kolkata', 'kolkata@tehsildar.com', '700001'],
        ['tehsildar4', tehsildarPassword, 'tehsildar', 'Tehsildar Chennai', 'chennai@tehsildar.com', '600001'],
        ['tehsildar5', tehsildarPassword, 'tehsildar', 'Tehsildar Hyderabad', 'hyderabad@tehsildar.com', '500001']
    ];

    defaultTehsildars.forEach(tehsildar => {
        db.run(`INSERT OR IGNORE INTO users (username, password, userType, name, email, pincode) 
                VALUES (?, ?, ?, ?, ?, ?)`, tehsildar);
    });

    console.log('Database initialized successfully');
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image, PDF, and document files are allowed!'));
        }
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// API Routes

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { userType, name, email, password, pincode, phone, address } = req.body;

        // Check if user already exists
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [email, email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (user) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const sql = `INSERT INTO users (username, password, userType, name, email, pincode, phone, address) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [email, hashedPassword, userType, name, email, pincode, phone, address], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error creating user' });
                }

                // Get the created user (without password)
                db.get('SELECT id, username, userType, name, email, pincode, phone, address, createdAt FROM users WHERE id = ?', 
                    [this.lastID], (err, newUser) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error retrieving user' });
                    }

                    res.status(201).json({
                        message: 'User registered successfully',
                        user: newUser
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { userType, username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ? AND userType = ?', [username, userType], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, userType: user.userType },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token: token
        });
    });
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const sql = `SELECT id, username, userType, name, email, pincode, phone, address, createdAt, updatedAt 
                 FROM users ORDER BY createdAt DESC`;
    
    db.all(sql, [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ users });
    });
});

// Get user statistics
app.get('/api/stats', authenticateToken, (req, res) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const stats = {};
    
    // Get user counts by type
    db.get('SELECT COUNT(*) as total FROM users', [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.totalUsers = result.total;

        db.get('SELECT COUNT(*) as citizens FROM users WHERE userType = "citizen"', [], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.citizens = result.citizens;

            db.get('SELECT COUNT(*) as tehsildars FROM users WHERE userType = "tehsildar"', [], (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                stats.tehsildars = result.tehsildars;

                db.get('SELECT COUNT(*) as admins FROM users WHERE userType = "admin"', [], (err, result) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    stats.admins = result.admins;

                    // Get document counts
                    db.get('SELECT COUNT(*) as total FROM documents', [], (err, result) => {
                        if (err) return res.status(500).json({ error: 'Database error' });
                        stats.totalDocuments = result.total;

                        db.get('SELECT COUNT(*) as pending FROM documents WHERE status = "pending"', [], (err, result) => {
                            if (err) return res.status(500).json({ error: 'Database error' });
                            stats.pendingDocuments = result.pending;

                            db.get('SELECT COUNT(*) as approved FROM documents WHERE status = "approved"', [], (err, result) => {
                                if (err) return res.status(500).json({ error: 'Database error' });
                                stats.approvedDocuments = result.approved;

                                db.get('SELECT COUNT(*) as rejected FROM documents WHERE status = "rejected"', [], (err, result) => {
                                    if (err) return res.status(500).json({ error: 'Database error' });
                                    stats.rejectedDocuments = result.rejected;

                                    res.json({ stats });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Get tehsildar details
app.get('/api/tehsildars', authenticateToken, (req, res) => {
    const sql = `SELECT id, username, name, email, pincode, phone, address, createdAt 
                 FROM users WHERE userType = 'tehsildar' ORDER BY name`;
    
    db.all(sql, [], (err, tehsildars) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ tehsildars });
    });
});

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('document'), (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get user's pincode
        db.get('SELECT pincode FROM users WHERE id = ?', [req.user.id], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            const sql = `INSERT INTO documents (userId, title, fileName, filePath, fileType, fileSize, pincode) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, [
                req.user.id, 
                title || file.originalname, 
                file.originalname, 
                file.path, 
                file.mimetype, 
                file.size, 
                user.pincode
            ], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error uploading document' });
                }

                res.status(201).json({
                    message: 'Document uploaded successfully',
                    documentId: this.lastID
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get documents for user
app.get('/api/documents', authenticateToken, (req, res) => {
    let sql;
    let params = [];

    if (req.user.userType === 'admin') {
        sql = `SELECT d.*, u.name as userName, u.userType 
               FROM documents d 
               JOIN users u ON d.userId = u.id 
               ORDER BY d.uploadDate DESC`;
    } else if (req.user.userType === 'tehsildar') {
        sql = `SELECT d.*, u.name as userName, u.userType 
               FROM documents d 
               JOIN users u ON d.userId = u.id 
               WHERE d.pincode = ? 
               ORDER BY d.uploadDate DESC`;
        params = [req.user.pincode];
    } else {
        sql = `SELECT d.*, u.name as userName, u.userType 
               FROM documents d 
               JOIN users u ON d.userId = u.id 
               WHERE d.userId = ? 
               ORDER BY d.uploadDate DESC`;
        params = [req.user.id];
    }

    db.all(sql, params, (err, documents) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ documents });
    });
});

// Verify document (Tehsildar only)
app.put('/api/documents/:id/verify', authenticateToken, (req, res) => {
    if (req.user.userType !== 'tehsildar') {
        return res.status(403).json({ error: 'Only tehsildars can verify documents' });
    }

    const { status, review, issue } = req.body;
    const documentId = req.params.id;

    const sql = `UPDATE documents 
                 SET status = ?, verifiedBy = ?, verificationDate = CURRENT_TIMESTAMP, review = ?, issue = ? 
                 WHERE id = ? AND pincode = ?`;
    
    db.run(sql, [status, req.user.id, review, issue, documentId, req.user.pincode], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Document not found or not in your region' });
        }
        res.json({ message: 'Document verified successfully' });
    });
});

// Serve uploaded files
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'uploads', filename));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
