const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'desa-darit-jwt-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads-desa-darit')));

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'desa_darit'
};

let db;

// Initialize database connection
const initDB = async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    // Ensure required tables exist
    await db.execute(`CREATE TABLE IF NOT EXISTS organization_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      image VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    // Banners table
    await db.execute(`CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      link VARCHAR(512) NULL,
      image VARCHAR(255) NULL,
      status ENUM('active','inactive') DEFAULT 'active',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    // Contact settings table
    await db.execute(`CREATE TABLE IF NOT EXISTS contact_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      address TEXT NULL,
      phone VARCHAR(50) NULL,
      email VARCHAR(100) NULL,
      facebook_url VARCHAR(255) NULL,
      instagram_url VARCHAR(255) NULL,
      youtube_url VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    // APB Desa tables
    await db.execute(`CREATE TABLE IF NOT EXISTS apb_years (
      id INT AUTO_INCREMENT PRIMARY KEY,
      year INT NOT NULL UNIQUE,
      status ENUM('draft', 'approved', 'active') DEFAULT 'draft',
      total_income DECIMAL(15,2) DEFAULT 0,
      total_expenditure DECIMAL(15,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_year (year),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    await db.execute(`CREATE TABLE IF NOT EXISTS apb_income_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    await db.execute(`CREATE TABLE IF NOT EXISTS apb_expenditure_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    await db.execute(`CREATE TABLE IF NOT EXISTS apb_income (
      id INT AUTO_INCREMENT PRIMARY KEY,
      year_id INT NOT NULL,
      category_id INT NOT NULL,
      source VARCHAR(255) NOT NULL,
      description TEXT,
      budgeted_amount DECIMAL(15,2) NOT NULL,
      realized_amount DECIMAL(15,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (year_id) REFERENCES apb_years(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES apb_income_categories(id) ON DELETE RESTRICT,
      INDEX idx_year_category (year_id, category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    
    await db.execute(`CREATE TABLE IF NOT EXISTS apb_expenditure (
      id INT AUTO_INCREMENT PRIMARY KEY,
      year_id INT NOT NULL,
      category_id INT NOT NULL,
      activity VARCHAR(255) NOT NULL,
      description TEXT,
      budgeted_amount DECIMAL(15,2) NOT NULL,
      realized_amount DECIMAL(15,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (year_id) REFERENCES apb_years(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES apb_expenditure_categories(id) ON DELETE RESTRICT,
      INDEX idx_year_category (year_id, category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads-desa-darit'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Helper function to handle database errors
const handleDBError = (error, res, message = 'Database error') => {
  console.error(message + ':', error);
  res.status(500).json({ message: message });
};

// ===============================
// AUTH ROUTES
// ===============================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    handleDBError(error, res, 'Login failed');
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get user info');
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// ===============================
// PROFILE ROUTES
// ===============================

// Get village profile
app.get('/api/profile', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM village_profile LIMIT 1');
    
    if (rows.length === 0) {
      // Return default profile if none exists
      return res.json({
        id: null,
        description: 'Desa Darit adalah sebuah desa yang terletak di Kecamatan Menyuke, Kabupaten Landak, Kalimantan Barat.',
        vision: 'Terwujudnya Desa Darit yang Maju, Mandiri, dan Sejahtera',
        mission: 'Meningkatkan kesejahteraan masyarakat melalui pembangunan yang berkelanjutan.',
        history: null,
        area: '25.5',
        population: 1234,
        families: 456,
        north_border: 'Desa Sekayam',
        east_border: 'Desa Menyuke',
        south_border: 'Desa Sungai Raya',
        west_border: 'Desa Pahauman',
        main_image: null,
        structure_image: null,
        map_image: null
      });
    }

    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get village profile');
  }
});

// Update village profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      description, vision, mission, history, area, population, families,
      north_border, east_border, south_border, west_border
    } = req.body;

    // Check if profile exists
    const [existingRows] = await db.execute('SELECT id FROM village_profile LIMIT 1');
    
    if (existingRows.length === 0) {
      // Insert new profile
      const [result] = await db.execute(
        `INSERT INTO village_profile 
        (description, vision, mission, history, area, population, families, 
         north_border, east_border, south_border, west_border) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [description, vision, mission, history, area, population, families,
         north_border, east_border, south_border, west_border]
      );
      
      res.json({ message: 'Village profile created successfully', id: result.insertId });
    } else {
      // Update existing profile
      await db.execute(
        `UPDATE village_profile SET 
        description = ?, vision = ?, mission = ?, history = ?, area = ?, 
        population = ?, families = ?, north_border = ?, east_border = ?, 
        south_border = ?, west_border = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [description, vision, mission, history, area, population, families,
         north_border, east_border, south_border, west_border, existingRows[0].id]
      );
      
      res.json({ message: 'Village profile updated successfully' });
    }
  } catch (error) {
    handleDBError(error, res, 'Failed to update village profile');
  }
});

// Upload profile images
app.post('/api/profile/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { type } = req.body; // main_image, structure_image, or map_image
    const filename = req.file.filename;

    if (!['main_image', 'structure_image', 'map_image'].includes(type)) {
      return res.status(400).json({ message: 'Invalid image type' });
    }

    // Check if profile exists
    const [existingRows] = await db.execute('SELECT id FROM village_profile LIMIT 1');
    
    if (existingRows.length === 0) {
      // Create default profile first
      await db.execute(
        'INSERT INTO village_profile (description) VALUES (?)',
        ['Desa Darit']
      );
    }

    // Get existing image filename for this type
    const [profileRows] = await db.execute(`SELECT id, ${type} FROM village_profile LIMIT 1`);

    const currentImage = profileRows[0]?.[type];

    // Delete old image file if exists
    if (currentImage) {
      try {
        await fs.unlink(path.join(__dirname, 'uploads-desa-darit', currentImage));
      } catch (err) {
        console.error('Error deleting old profile image:', err);
      }
    }

    // Update image field
    await db.execute(
      `UPDATE village_profile SET ${type} = ?, updated_at = CURRENT_TIMESTAMP`,
      [filename]
    );

    res.json({ message: 'Image uploaded successfully', filename });
  } catch (error) {
    handleDBError(error, res, 'Failed to upload image');
  }
});

// ===============================
// NEWS ROUTES
// ===============================

// Get all news with pagination
app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM news';
    let countQuery = 'SELECT COUNT(*) as total FROM news';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR content LIKE ?';
      countQuery += ' WHERE title LIKE ? OR content LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    const [rows] = await db.execute(query, [...params, limit, offset]);
    const [countRows] = await db.execute(countQuery, params);
    
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to get news');
  }
});

// Get single news by ID
app.get('/api/news/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM news WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get news');
  }
});

// Create news
app.post('/api/news', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, image, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO news (title, content, excerpt, image, status, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, excerpt, image, status || 'published', req.user.id]
    );

    res.status(201).json({
      message: 'News created successfully',
      id: result.insertId
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to create news');
  }
});

// Update news
app.put('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, image, status } = req.body;
    const newsId = req.params.id;

    // Check if news exists
    const [existingRows] = await db.execute('SELECT * FROM news WHERE id = ?', [newsId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    await db.execute(
      'UPDATE news SET title = ?, content = ?, excerpt = ?, image = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, excerpt, image, status, newsId]
    );

    res.json({ message: 'News updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update news');
  }
});

// Delete news
app.delete('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const newsId = req.params.id;

    // Check if news exists and get image filename
    const [existingRows] = await db.execute('SELECT image FROM news WHERE id = ?', [newsId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Delete image file if exists
    if (existingRows[0].image) {
      try {
        await fs.unlink(path.join(__dirname, 'uploads-desa-darit', existingRows[0].image));
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    await db.execute('DELETE FROM news WHERE id = ?', [newsId]);

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete news');
  }
});

// Upload news image
app.post('/api/news/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to upload image');
  }
});

// ===============================
// INFOGRAPHICS ROUTES
// ===============================

// Get infographics data
app.get('/api/infographics', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM infographics LIMIT 1');
    
    if (rows.length === 0) {
      // Return default data if none exists
      return res.json({
        total_population: 1234,
        total_families: 456,
        male_population: 628,
        female_population: 606,
        age_groups: JSON.stringify({
          '0-14': 234,
          '15-34': 456,
          '35-54': 345,
          '55+': 199
        }),
        education_levels: JSON.stringify({
          'SD': 234,
          'SMP': 345,
          'SMA': 456,
          'Sarjana': 199
        }),
        occupations: JSON.stringify({
          'Petani': 456,
          'Pedagang': 123,
          'PNS': 78,
          'Lainnya': 577
        }),
        marital_status: JSON.stringify({
          'Belum Kawin': 234,
          'Kawin': 789,
          'Cerai': 34,
          'Janda/Duda': 177
        }),
        religions: JSON.stringify({
          'Islam': 987,
          'Kristen': 123,
          'Katolik': 78,
          'Buddha': 34,
          'Hindu': 12
        })
      });
    }

    // Parse JSON fields
    const data = rows[0];
    if (data.age_groups) data.age_groups = JSON.parse(data.age_groups);
    if (data.education_levels) data.education_levels = JSON.parse(data.education_levels);
    if (data.occupations) data.occupations = JSON.parse(data.occupations);
    if (data.marital_status) data.marital_status = JSON.parse(data.marital_status);
    if (data.religions) data.religions = JSON.parse(data.religions);

    res.json(data);
  } catch (error) {
    handleDBError(error, res, 'Failed to get infographics data');
  }
});

// Update infographics data
app.put('/api/infographics', authenticateToken, async (req, res) => {
  try {
    const {
      total_population, total_families, male_population, female_population,
      age_groups, education_levels, occupations, marital_status, religions
    } = req.body;

    // Check if data exists
    const [existingRows] = await db.execute('SELECT id FROM infographics LIMIT 1');
    
    if (existingRows.length === 0) {
      // Insert new data
      const [result] = await db.execute(
        `INSERT INTO infographics 
        (total_population, total_families, male_population, female_population, 
         age_groups, education_levels, occupations, marital_status, religions) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [total_population, total_families, male_population, female_population,
         JSON.stringify(age_groups), JSON.stringify(education_levels),
         JSON.stringify(occupations), JSON.stringify(marital_status), 
         JSON.stringify(religions)]
      );
      
      res.json({ message: 'Infographics data created successfully', id: result.insertId });
    } else {
      // Update existing data
      await db.execute(
        `UPDATE infographics SET 
        total_population = ?, total_families = ?, male_population = ?, 
        female_population = ?, age_groups = ?, education_levels = ?, 
        occupations = ?, marital_status = ?, religions = ?, 
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [total_population, total_families, male_population, female_population,
         JSON.stringify(age_groups), JSON.stringify(education_levels),
         JSON.stringify(occupations), JSON.stringify(marital_status), 
         JSON.stringify(religions), existingRows[0].id]
      );
      
      res.json({ message: 'Infographics data updated successfully' });
    }
  } catch (error) {
    handleDBError(error, res, 'Failed to update infographics data');
  }
});

// ===============================
// SHOP ROUTES
// ===============================

// Get all shop products
app.get('/api/shop', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let query = 'SELECT * FROM shop_products WHERE status = "active"';
    let countQuery = 'SELECT COUNT(*) as total FROM shop_products WHERE status = "active"';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    const [rows] = await db.execute(query, [...params, limit, offset]);
    const [countRows] = await db.execute(countQuery, params);
    
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to get shop products');
  }
});

// Get single product by ID
app.get('/api/shop/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM shop_products WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get product');
  }
});

// Create shop product
app.post('/api/shop', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, image, phone, status } = req.body;

    if (!name || !description || !price || !phone) {
      return res.status(400).json({ message: 'Name, description, price, and phone are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO shop_products (name, description, price, category, image, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image, phone, status || 'active']
    );

    res.status(201).json({
      message: 'Product created successfully',
      id: result.insertId
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to create product');
  }
});

// Update shop product
app.put('/api/shop/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, image, phone, status } = req.body;
    const productId = req.params.id;

    // Check if product exists
    const [existingRows] = await db.execute('SELECT * FROM shop_products WHERE id = ?', [productId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.execute(
      'UPDATE shop_products SET name = ?, description = ?, price = ?, category = ?, image = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, category, image, phone, status, productId]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update product');
  }
});

// Delete shop product
app.delete('/api/shop/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists and get image filename
    const [existingRows] = await db.execute('SELECT image FROM shop_products WHERE id = ?', [productId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image file if exists
    if (existingRows[0].image) {
      try {
        await fs.unlink(path.join(__dirname, 'uploads-desa-darit', existingRows[0].image));
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    await db.execute('DELETE FROM shop_products WHERE id = ?', [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete product');
  }
});

// Upload shop product image
app.post('/api/shop/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to upload image');
  }
});

// ===============================
// ORGANIZATION MEMBERS ROUTES
// ===============================

// Get all organization members (public)
app.get('/api/organization', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM organization_members';
    let countQuery = 'SELECT COUNT(*) as total FROM organization_members';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR position LIKE ?';
      countQuery += ' WHERE name LIKE ? OR position LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const [rows] = await db.execute(query, [...params, limit, offset]);
    const [countRows] = await db.execute(countQuery, params);

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages }
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to get organization members');
  }
});

// Get single member by ID (public)
app.get('/api/organization/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM organization_members WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Member not found' });
    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get member');
  }
});

// Create member
app.post('/api/organization', authenticateToken, async (req, res) => {
  try {
    const { name, position, image } = req.body;
    if (!name || !position) {
      return res.status(400).json({ message: 'Name and position are required' });
    }
    const [result] = await db.execute(
      'INSERT INTO organization_members (name, position, image) VALUES (?, ?, ?)',
      [name, position, image || null]
    );
    res.status(201).json({ message: 'Member created successfully', id: result.insertId });
  } catch (error) {
    handleDBError(error, res, 'Failed to create member');
  }
});

// Update member
app.put('/api/organization/:id', authenticateToken, async (req, res) => {
  try {
    const { name, position, image } = req.body;
    const memberId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM organization_members WHERE id = ?', [memberId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Member not found' });

    await db.execute(
      'UPDATE organization_members SET name = ?, position = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, position, image || null, memberId]
    );
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update member');
  }
});

// Delete member
app.delete('/api/organization/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;
    const [existingRows] = await db.execute('SELECT image FROM organization_members WHERE id = ?', [memberId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Member not found' });

    if (existingRows[0].image) {
      try {
        await fs.unlink(path.join(__dirname, 'uploads-desa-darit', existingRows[0].image));
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    await db.execute('DELETE FROM organization_members WHERE id = ?', [memberId]);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete member');
  }
});

// Upload member image
app.post('/api/organization/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to upload image');
  }
});

// ===============================
// DASHBOARD ROUTES
// ===============================

// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [newsCount] = await db.execute('SELECT COUNT(*) as count FROM news');
    const [productsCount] = await db.execute('SELECT COUNT(*) as count FROM shop_products WHERE status = "active"');
    const [usersCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    
    // Get infographics data
    const [infographics] = await db.execute('SELECT total_population, total_families FROM infographics LIMIT 1');
    
    res.json({
      news_count: newsCount[0].count,
      products_count: productsCount[0].count,
      users_count: usersCount[0].count,
      population: infographics[0]?.total_population || 0,
      families: infographics[0]?.total_families || 0
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to get dashboard stats');
  }
});

// ===============================
// BANNERS ROUTES
// ===============================

// Get all banners (public)
app.get('/api/banners', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = 'SELECT * FROM banners';
    let countQuery = 'SELECT COUNT(*) as total FROM banners';
    const params = [];

    const where = [];
    if (search) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (where.length) {
      query += ' WHERE ' + where.join(' AND ');
      countQuery += ' WHERE ' + where.join(' AND ');
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await db.execute(query, [...params, limit, offset]);
    const [countRows] = await db.execute(countQuery, params);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    handleDBError(error, res, 'Failed to get banners');
  }
});

// Get single banner by ID (public)
app.get('/api/banners/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM banners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Banner not found' });
    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get banner');
  }
});

// Create banner
app.post('/api/banners', authenticateToken, async (req, res) => {
  try {
    const { title, description, link, image, status, sort_order } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const [result] = await db.execute(
      'INSERT INTO banners (title, description, link, image, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, link || null, image || null, status || 'active', Number(sort_order) || 0]
    );
    res.status(201).json({ message: 'Banner created successfully', id: result.insertId });
  } catch (error) {
    handleDBError(error, res, 'Failed to create banner');
  }
});

// Update banner
app.put('/api/banners/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, link, image, status, sort_order } = req.body;
    const bannerId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM banners WHERE id = ?', [bannerId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Banner not found' });
    await db.execute(
      'UPDATE banners SET title = ?, description = ?, link = ?, image = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description || null, link || null, image || null, status || 'active', Number(sort_order) || 0, bannerId]
    );
    res.json({ message: 'Banner updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update banner');
  }
});

// Delete banner
app.delete('/api/banners/:id', authenticateToken, async (req, res) => {
  try {
    const bannerId = req.params.id;
    const [existingRows] = await db.execute('SELECT image FROM banners WHERE id = ?', [bannerId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Banner not found' });
    if (existingRows[0].image) {
      try {
        await fs.unlink(path.join(__dirname, 'uploads-desa-darit', existingRows[0].image));
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }
    await db.execute('DELETE FROM banners WHERE id = ?', [bannerId]);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete banner');
  }
});

// Upload banner image
app.post('/api/banners/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    res.json({ message: 'Image uploaded successfully', filename: req.file.filename, url: `/uploads/${req.file.filename}` });
  } catch (error) {
    handleDBError(error, res, 'Failed to upload image');
  }
});

// ===============================
// CONTACT SETTINGS ROUTES
// ===============================

// Get contact settings (public)
app.get('/api/contact-settings', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contact_settings LIMIT 1');
    
    if (rows.length === 0) {
      // Return default contact settings if none exists
      return res.json({
        id: null,
        address: 'Desa Darit, Kec. Menyuke\nKab. Landak, Kalimantan Barat\nIndonesia',
        phone: '+62 123 4567 8900',
        email: 'info@desadarit.id',
        facebook_url: '',
        instagram_url: '',
        youtube_url: ''
      });
    }

    res.json(rows[0]);
  } catch (error) {
    handleDBError(error, res, 'Failed to get contact settings');
  }
});

// Update contact settings
app.put('/api/contact-settings', authenticateToken, async (req, res) => {
  try {
    const {
      address, phone, email, facebook_url, instagram_url, youtube_url
    } = req.body;

    // Check if settings exist
    const [existingRows] = await db.execute('SELECT id FROM contact_settings LIMIT 1');
    
    if (existingRows.length === 0) {
      // Insert new settings
      const [result] = await db.execute(
        `INSERT INTO contact_settings 
        (address, phone, email, facebook_url, instagram_url, youtube_url) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [address, phone, email, facebook_url, instagram_url, youtube_url]
      );
      
      res.json({ message: 'Contact settings created successfully', id: result.insertId });
    } else {
      // Update existing settings
      await db.execute(
        `UPDATE contact_settings SET 
        address = ?, phone = ?, email = ?, facebook_url = ?, 
        instagram_url = ?, youtube_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [address, phone, email, facebook_url, instagram_url, youtube_url, existingRows[0].id]
      );
      
      res.json({ message: 'Contact settings updated successfully' });
    }
  } catch (error) {
    handleDBError(error, res, 'Failed to update contact settings');
  }
});

// ===============================
// APB DESA ROUTES
// ===============================

// Get all APB years
app.get('/api/apb/years', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM apb_years ORDER BY year DESC');
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get APB years');
  }
});

// Get single APB year by ID
app.get('/api/apb/years/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM apb_years WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'APB year not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    handleDBError(error, res, 'Failed to get APB year');
  }
});

// Create APB year
app.post('/api/apb/years', authenticateToken, async (req, res) => {
  try {
    const { year, status } = req.body;
    if (!year) return res.status(400).json({ message: 'Year is required' });
    
    const [result] = await db.execute(
      'INSERT INTO apb_years (year, status) VALUES (?, ?)',
      [year, status || 'draft']
    );
    
    res.status(201).json({ message: 'APB year created successfully', data: { id: result.insertId, year, status: status || 'draft' } });
  } catch (error) {
    handleDBError(error, res, 'Failed to create APB year');
  }
});

// Update APB year
app.put('/api/apb/years/:id', authenticateToken, async (req, res) => {
  try {
    const { year, status, total_income, total_expenditure } = req.body;
    const yearId = req.params.id;
    
    const [existingRows] = await db.execute('SELECT * FROM apb_years WHERE id = ?', [yearId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'APB year not found' });
    
    await db.execute(
      'UPDATE apb_years SET year = ?, status = ?, total_income = ?, total_expenditure = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [year, status, total_income, total_expenditure, yearId]
    );
    
    res.json({ message: 'APB year updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update APB year');
  }
});

// Delete APB year
app.delete('/api/apb/years/:id', authenticateToken, async (req, res) => {
  try {
    const yearId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM apb_years WHERE id = ?', [yearId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'APB year not found' });
    
    await db.execute('DELETE FROM apb_years WHERE id = ?', [yearId]);
    res.json({ message: 'APB year deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete APB year');
  }
});

// Get income categories
app.get('/api/apb/categories/income', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM apb_income_categories ORDER BY name');
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get income categories');
  }
});

// Create income category
app.post('/api/apb/categories/income', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const [result] = await db.execute(
      'INSERT INTO apb_income_categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    res.status(201).json({ message: 'Income category created successfully', data: { id: result.insertId, name, description } });
  } catch (error) {
    handleDBError(error, res, 'Failed to create income category');
  }
});

// Update income category
app.put('/api/apb/categories/income/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    const [existingRows] = await db.execute('SELECT * FROM apb_income_categories WHERE id = ?', [categoryId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Income category not found' });
    
    await db.execute(
      'UPDATE apb_income_categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, categoryId]
    );
    
    res.json({ message: 'Income category updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update income category');
  }
});

// Delete income category
app.delete('/api/apb/categories/income/:id', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM apb_income_categories WHERE id = ?', [categoryId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Income category not found' });
    
    await db.execute('DELETE FROM apb_income_categories WHERE id = ?', [categoryId]);
    res.json({ message: 'Income category deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete income category');
  }
});

// Get expenditure categories
app.get('/api/apb/categories/expenditure', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM apb_expenditure_categories ORDER BY name');
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get expenditure categories');
  }
});

// Create expenditure category
app.post('/api/apb/categories/expenditure', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const [result] = await db.execute(
      'INSERT INTO apb_expenditure_categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    res.status(201).json({ message: 'Expenditure category created successfully', data: { id: result.insertId, name, description } });
  } catch (error) {
    handleDBError(error, res, 'Failed to create expenditure category');
  }
});

// Update expenditure category
app.put('/api/apb/categories/expenditure/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    const [existingRows] = await db.execute('SELECT * FROM apb_expenditure_categories WHERE id = ?', [categoryId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Expenditure category not found' });
    
    await db.execute(
      'UPDATE apb_expenditure_categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, categoryId]
    );
    
    res.json({ message: 'Expenditure category updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update expenditure category');
  }
});

// Delete expenditure category
app.delete('/api/apb/categories/expenditure/:id', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM apb_expenditure_categories WHERE id = ?', [categoryId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Expenditure category not found' });
    
    await db.execute('DELETE FROM apb_expenditure_categories WHERE id = ?', [categoryId]);
    res.json({ message: 'Expenditure category deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete expenditure category');
  }
});

// Get all income data
app.get('/api/apb/income', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ai.*, aic.name as category_name, ay.year 
      FROM apb_income ai 
      JOIN apb_income_categories aic ON ai.category_id = aic.id 
      JOIN apb_years ay ON ai.year_id = ay.id 
      ORDER BY ay.year DESC, ai.created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get income data');
  }
});

// Get income data by year
app.get('/api/apb/income/year/:yearId', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ai.*, aic.name as category_name, ay.year 
      FROM apb_income ai 
      JOIN apb_income_categories aic ON ai.category_id = aic.id 
      JOIN apb_years ay ON ai.year_id = ay.id 
      WHERE ai.year_id = ? 
      ORDER BY ai.created_at DESC
    `, [req.params.yearId]);
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get income data by year');
  }
});

// Get single income by ID
app.get('/api/apb/income/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ai.*, aic.name as category_name, ay.year 
      FROM apb_income ai 
      JOIN apb_income_categories aic ON ai.category_id = aic.id 
      JOIN apb_years ay ON ai.year_id = ay.id 
      WHERE ai.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Income data not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    handleDBError(error, res, 'Failed to get income data');
  }
});

// Create income data
app.post('/api/apb/income', authenticateToken, async (req, res) => {
  try {
    const { year_id, category_id, source, description, budgeted_amount, realized_amount } = req.body;
    if (!year_id || !category_id || !source || !budgeted_amount) {
      return res.status(400).json({ message: 'Year, category, source, and budgeted amount are required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO apb_income (year_id, category_id, source, description, budgeted_amount, realized_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [year_id, category_id, source, description, budgeted_amount, realized_amount || 0]
    );
    
    res.status(201).json({ message: 'Income data created successfully', data: { id: result.insertId } });
  } catch (error) {
    handleDBError(error, res, 'Failed to create income data');
  }
});

// Update income data
app.put('/api/apb/income/:id', authenticateToken, async (req, res) => {
  try {
    const { year_id, category_id, source, description, budgeted_amount, realized_amount } = req.body;
    const incomeId = req.params.id;
    
    const [existingRows] = await db.execute('SELECT * FROM apb_income WHERE id = ?', [incomeId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Income data not found' });
    
    await db.execute(
      'UPDATE apb_income SET year_id = ?, category_id = ?, source = ?, description = ?, budgeted_amount = ?, realized_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [year_id, category_id, source, description, budgeted_amount, realized_amount, incomeId]
    );
    
    res.json({ message: 'Income data updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update income data');
  }
});

// Delete income data
app.delete('/api/apb/income/:id', authenticateToken, async (req, res) => {
  try {
    const incomeId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM apb_income WHERE id = ?', [incomeId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Income data not found' });
    
    await db.execute('DELETE FROM apb_income WHERE id = ?', [incomeId]);
    res.json({ message: 'Income data deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete income data');
  }
});

// Get all expenditure data
app.get('/api/apb/expenditure', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ae.*, aec.name as category_name, ay.year 
      FROM apb_expenditure ae 
      JOIN apb_expenditure_categories aec ON ae.category_id = aec.id 
      JOIN apb_years ay ON ae.year_id = ay.id 
      ORDER BY ay.year DESC, ae.created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get expenditure data');
  }
});

// Get expenditure data by year
app.get('/api/apb/expenditure/year/:yearId', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ae.*, aec.name as category_name, ay.year 
      FROM apb_expenditure ae 
      JOIN apb_expenditure_categories aec ON ae.category_id = aec.id 
      JOIN apb_years ay ON ae.year_id = ay.id 
      WHERE ae.year_id = ? 
      ORDER BY ae.created_at DESC
    `, [req.params.yearId]);
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get expenditure data by year');
  }
});

// Get single expenditure by ID
app.get('/api/apb/expenditure/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT ae.*, aec.name as category_name, ay.year 
      FROM apb_expenditure ae 
      JOIN apb_expenditure_categories aec ON ae.category_id = aec.id 
      JOIN apb_years ay ON ae.year_id = ay.id 
      WHERE ae.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expenditure data not found' });
    res.json({ data: rows[0] });
  } catch (error) {
    handleDBError(error, res, 'Failed to get expenditure data');
  }
});

// Create expenditure data
app.post('/api/apb/expenditure', authenticateToken, async (req, res) => {
  try {
    const { year_id, category_id, activity, description, budgeted_amount, realized_amount } = req.body;
    if (!year_id || !category_id || !activity || !budgeted_amount) {
      return res.status(400).json({ message: 'Year, category, activity, and budgeted amount are required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO apb_expenditure (year_id, category_id, activity, description, budgeted_amount, realized_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [year_id, category_id, activity, description, budgeted_amount, realized_amount || 0]
    );
    
    res.status(201).json({ message: 'Expenditure data created successfully', data: { id: result.insertId } });
  } catch (error) {
    handleDBError(error, res, 'Failed to create expenditure data');
  }
});

// Update expenditure data
app.put('/api/apb/expenditure/:id', authenticateToken, async (req, res) => {
  try {
    const { year_id, category_id, activity, description, budgeted_amount, realized_amount } = req.body;
    const expenditureId = req.params.id;
    
    const [existingRows] = await db.execute('SELECT * FROM apb_expenditure WHERE id = ?', [expenditureId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Expenditure data not found' });
    
    await db.execute(
      'UPDATE apb_expenditure SET year_id = ?, category_id = ?, activity = ?, description = ?, budgeted_amount = ?, realized_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [year_id, category_id, activity, description, budgeted_amount, realized_amount, expenditureId]
    );
    
    res.json({ message: 'Expenditure data updated successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to update expenditure data');
  }
});

// Delete expenditure data
app.delete('/api/apb/expenditure/:id', authenticateToken, async (req, res) => {
  try {
    const expenditureId = req.params.id;
    const [existingRows] = await db.execute('SELECT * FROM apb_expenditure WHERE id = ?', [expenditureId]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Expenditure data not found' });
    
    await db.execute('DELETE FROM apb_expenditure WHERE id = ?', [expenditureId]);
    res.json({ message: 'Expenditure data deleted successfully' });
  } catch (error) {
    handleDBError(error, res, 'Failed to delete expenditure data');
  }
});

// Get APB summary by year
app.get('/api/apb/summary/:yearId', async (req, res) => {
  try {
    const [yearRows] = await db.execute('SELECT * FROM apb_years WHERE id = ?', [req.params.yearId]);
    if (yearRows.length === 0) return res.status(404).json({ message: 'APB year not found' });
    
    const [incomeRows] = await db.execute(`
      SELECT ai.*, aic.name as category_name 
      FROM apb_income ai 
      JOIN apb_income_categories aic ON ai.category_id = aic.id 
      WHERE ai.year_id = ?
    `, [req.params.yearId]);
    
    const [expenditureRows] = await db.execute(`
      SELECT ae.*, aec.name as category_name 
      FROM apb_expenditure ae 
      JOIN apb_expenditure_categories aec ON ae.category_id = aec.id 
      WHERE ae.year_id = ?
    `, [req.params.yearId]);
    
    res.json({ 
      data: {
        year: yearRows[0],
        income: incomeRows,
        expenditure: expenditureRows
      }
    });
  } catch (error) {
    handleDBError(error, res, 'Failed to get APB summary');
  }
});

// Get all APB summary
app.get('/api/apb/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ay.year,
        ay.status,
        ay.total_income,
        ay.total_expenditure,
        (ay.total_income - ay.total_expenditure) as surplus_deficit,
        COUNT(DISTINCT ai.id) as income_items,
        COUNT(DISTINCT ae.id) as expenditure_items
      FROM apb_years ay
      LEFT JOIN apb_income ai ON ay.id = ai.year_id
      LEFT JOIN apb_expenditure ae ON ay.id = ae.year_id
      GROUP BY ay.id, ay.year, ay.status, ay.total_income, ay.total_expenditure
      ORDER BY ay.year DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    handleDBError(error, res, 'Failed to get APB summary');
  }
});

// ===============================
// ERROR HANDLING
// ===============================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

// ===============================
// SERVER START
// ===============================

const startServer = async () => {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API documentation: http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;