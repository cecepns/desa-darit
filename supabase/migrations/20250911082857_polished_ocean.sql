-- Database: desa_darit
-- Created for Sistem Informasi Desa Darit
-- Kecamatan Menyuke, Kabupaten Landak, Kalimantan Barat

-- Create database
CREATE DATABASE IF NOT EXISTS desa_darit;
USE desa_darit;

-- ===============================
-- USERS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2a$10$rOzWcjkVQjGFzAWVvYXD6OhQ0ZQVqVkqBMxVQRWCvBCHXz2QmSqGm', 'Administrator', 'admin'),
('editor', '$2a$10$kYnSGQsWDpq9fLJsL8QtNeP8HHgDgVRIGF6kSUZwjVRHgQz3NfNJ2', 'Editor', 'editor');
-- Default passwords: admin123, editor123

-- ===============================
-- VILLAGE PROFILE TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS village_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    vision TEXT,
    mission TEXT,
    history TEXT,
    area DECIMAL(10,2),
    population INT DEFAULT 0,
    families INT DEFAULT 0,
    north_border VARCHAR(100),
    east_border VARCHAR(100),
    south_border VARCHAR(100),
    west_border VARCHAR(100),
    main_image VARCHAR(255),
    structure_image VARCHAR(255),
    map_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default village profile
INSERT INTO village_profile (
    description, vision, mission, area, population, families,
    north_border, east_border, south_border, west_border
) VALUES (
    'Desa Darit adalah sebuah desa yang terletak di Kecamatan Menyuke, Kabupaten Landak, Kalimantan Barat. Desa ini memiliki potensi alam yang melimpah dan masyarakat yang gotong royong.',
    'Terwujudnya Desa Darit yang Maju, Mandiri, dan Sejahtera Berlandaskan Gotong Royong dan Nilai-nilai Budaya Lokal',
    '<ol><li>Meningkatkan kualitas sumber daya manusia melalui pendidikan dan pelatihan</li><li>Mengembangkan potensi ekonomi desa berbasis kearifan lokal</li><li>Memperkuat infrastruktur dan fasilitas publik</li><li>Melestarikan budaya dan lingkungan hidup</li><li>Meningkatkan pelayanan publik yang transparan dan akuntabel</li></ol>',
    25.50, 1234, 456,
    'Desa Sekayam', 'Desa Menyuke', 'Desa Sungai Raya', 'Desa Pahauman'
);

-- ===============================
-- INFOGRAPHICS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS infographics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    total_population INT DEFAULT 0,
    total_families INT DEFAULT 0,
    male_population INT DEFAULT 0,
    female_population INT DEFAULT 0,
    age_groups JSON,
    education_levels JSON,
    occupations JSON,
    marital_status JSON,
    religions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default infographics data
INSERT INTO infographics (
    total_population, total_families, male_population, female_population,
    age_groups, education_levels, occupations, marital_status, religions
) VALUES (
    1234, 456, 628, 606,
    JSON_OBJECT('0-14', 234, '15-34', 456, '35-54', 345, '55+', 199),
    JSON_OBJECT('SD', 234, 'SMP', 345, 'SMA', 456, 'Sarjana', 199),
    JSON_OBJECT('Petani', 456, 'Pedagang', 123, 'PNS', 78, 'Wiraswasta', 234, 'Lainnya', 343),
    JSON_OBJECT('Belum Kawin', 234, 'Kawin', 789, 'Cerai', 34, 'Janda/Duda', 177),
    JSON_OBJECT('Islam', 987, 'Kristen', 123, 'Katolik', 78, 'Buddha', 34, 'Hindu', 12)
);

-- ===============================
-- NEWS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image VARCHAR(255),
    status ENUM('draft', 'published') DEFAULT 'published',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert sample news
INSERT INTO news (title, content, excerpt, author_id, status) VALUES
(
    'Pembangunan Jalan Baru di Desa Darit',
    '<p>Alhamdulillah, pembangunan jalan baru di Desa Darit telah dimulai. Proyek ini diharapkan dapat meningkatkan akses transportasi warga dan mendukung kegiatan ekonomi desa.</p><p>Jalan baru ini akan menghubungkan Dusun Satu dengan Dusun Tiga dengan panjang sekitar 2 kilometer. Pembangunan ini merupakan hasil kerja sama antara pemerintah desa dengan pemerintah daerah.</p><p>Diharapkan pembangunan ini dapat selesai dalam waktu 3 bulan dan memberikan manfaat yang besar bagi masyarakat Desa Darit.</p>',
    'Proyek pembangunan jalan baru sepanjang 2 kilometer untuk menghubungkan Dusun Satu dengan Dusun Tiga telah dimulai.',
    1, 'published'
),
(
    'Pelatihan UMKM untuk Ibu-ibu PKK Desa Darit',
    '<p>Hari ini telah diadakan pelatihan UMKM untuk ibu-ibu PKK Desa Darit. Pelatihan ini bertujuan untuk meningkatkan keterampilan dan kemampuan wirausaha para ibu rumah tangga.</p><p>Materi pelatihan meliputi cara membuat kue tradisional, pengolahan hasil pertanian, dan strategi pemasaran online. Pelatihan ini dihadiri oleh 25 peserta dari berbagai dusun di Desa Darit.</p><p>Diharapkan setelah pelatihan ini, ibu-ibu PKK dapat mengembangkan usaha kecil yang dapat meningkatkan pendapatan keluarga.</p>',
    'Pelatihan UMKM untuk 25 ibu-ibu PKK Desa Darit meliputi pembuatan kue tradisional dan strategi pemasaran.',
    1, 'published'
),
(
    'Gotong Royong Bersih Desa',
    '<p>Minggu lalu, seluruh warga Desa Darit bersatu dalam kegiatan gotong royong bersih desa. Kegiatan ini rutin dilakukan setiap bulan untuk menjaga kebersihan dan keindahan lingkungan desa.</p><p>Kegiatan dimulai pukul 07.00 WIB dan berlangsung hingga 11.00 WIB. Warga bergotong royong membersihkan jalan, selokan, dan area publik lainnya.</p><p>Antusiasme warga sangat tinggi dan kegiatan berlangsung dengan penuh kekeluargaan. Setelah selesai, warga berkumpul untuk makan bersama yang telah disiapkan oleh kaum ibu.</p>',
    'Kegiatan gotong royong bulanan untuk menjaga kebersihan desa dengan partisipasi aktif seluruh warga.',
    1, 'published'
);

-- ===============================
-- SHOP PRODUCTS TABLE
-- ===============================
CREATE TABLE IF NOT EXISTS shop_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert sample products
INSERT INTO shop_products (name, description, price, category, phone, status) VALUES
(
    'Kopi Robusta Darit',
    'Kopi robusta asli dari kebun warga Desa Darit. Biji kopi dipetik langsung saat matang dan diproses secara tradisional untuk menghasilkan cita rasa yang khas dan nikmat.',
    85000.00, 'Pertanian', '081234567890', 'active'
),
(
    'Madu Kelengkeng',
    'Madu murni dari lebah yang dipelihara di kebun kelengkeng Desa Darit. Madu ini memiliki rasa yang manis alami dan khasiat yang baik untuk kesehatan.',
    120000.00, 'Pertanian', '081234567891', 'active'
),
(
    'Kerupuk Ikan Haruan',
    'Kerupuk ikan haruan khas Kalimantan Barat yang dibuat secara tradisional oleh ibu-ibu PKK Desa Darit. Rasanya gurih dan renyah, cocok untuk camilan atau pelengkap makan.',
    25000.00, 'Makanan', '081234567892', 'active'
),
(
    'Anyaman Pandan',
    'Tas anyaman dari daun pandan yang dibuat oleh pengrajin lokal Desa Darit. Produk ramah lingkungan dengan kualitas terjamin dan desain yang menarik.',
    75000.00, 'Kerajinan', '081234567893', 'active'
),
(
    'Sayuran Organik',
    'Paket sayuran organik segar dari kebun warga Desa Darit. Meliputi kangkung, bayam, sawi, dan terong. Bebas pestisida dan pupuk kimia.',
    35000.00, 'Pertanian', '081234567894', 'active'
),
(
    'Ikan Lele Segar',
    'Ikan lele segar dari kolam budidaya warga Desa Darit. Ikan dipelihara dengan pakan alami dan air yang bersih, sehingga daging ikan lebih sehat dan gurih.',
    18000.00, 'Perikanan', '081234567895', 'active'
);

-- ===============================
-- INDEXES FOR PERFORMANCE
-- ===============================

-- Add indexes for better query performance
CREATE INDEX idx_news_title ON news(title);
CREATE INDEX idx_news_author_status ON news(author_id, status);
CREATE INDEX idx_products_name ON shop_products(name);
CREATE INDEX idx_products_price ON shop_products(price);

-- ===============================
-- VIEWS FOR REPORTING
-- ===============================

-- View for news with author information
CREATE VIEW news_with_author AS
SELECT 
    n.id,
    n.title,
    n.content,
    n.excerpt,
    n.image,
    n.status,
    n.created_at,
    n.updated_at,
    u.name as author_name,
    u.username as author_username
FROM news n
LEFT JOIN users u ON n.author_id = u.id;

-- View for active products
CREATE VIEW active_products AS
SELECT *
FROM shop_products
WHERE status = 'active'
ORDER BY created_at DESC;

-- ===============================
-- STORED PROCEDURES
-- ===============================

-- Procedure to get dashboard statistics
DELIMITER //
CREATE PROCEDURE GetDashboardStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM news WHERE status = 'published') as published_news,
        (SELECT COUNT(*) FROM news WHERE status = 'draft') as draft_news,
        (SELECT COUNT(*) FROM shop_products WHERE status = 'active') as active_products,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT total_population FROM infographics LIMIT 1) as total_population,
        (SELECT total_families FROM infographics LIMIT 1) as total_families;
END//
DELIMITER ;

-- ===============================
-- TRIGGERS
-- ===============================

-- Trigger to update infographics when data changes
DELIMITER //
CREATE TRIGGER update_population_stats
AFTER UPDATE ON infographics
FOR EACH ROW
BEGIN
    -- Update village profile population if needed
    UPDATE village_profile 
    SET population = NEW.total_population, families = NEW.total_families
    WHERE id = 1;
END//
DELIMITER ;

-- ===============================
-- SAMPLE DATA COMPLETION
-- ===============================

-- Update village profile with complete history
UPDATE village_profile SET history = '
<h3>Sejarah Pembentukan Desa Darit</h3>
<p>Desa Darit dibentuk pada tahun 1965 sebagai hasil pemekaran dari desa induk di wilayah Kecamatan Menyuke. Nama "Darit" berasal dari bahasa Dayak yang berarti "tempat berkumpul", sesuai dengan karakteristik wilayah ini yang menjadi pusat aktivitas masyarakat sekitar.</p>

<h4>Periode 1965-1980: Masa Pembentukan</h4>
<p>Pada masa awal pembentukannya, Desa Darit masih berupa hutan lebat yang mulai dibuka oleh para transmigran dan penduduk lokal. Kegiatan utama masyarakat adalah bercocok tanam dan berkebun.</p>

<h4>Periode 1980-2000: Masa Perkembangan</h4>
<p>Memasuki era 1980-an, Desa Darit mulai berkembang dengan dibangunnya infrastruktur dasar seperti jalan, sekolah, dan tempat ibadah. Jumlah penduduk terus bertambah seiring dengan program transmigrasi pemerintah.</p>

<h4>Periode 2000-Sekarang: Masa Modernisasi</h4>
<p>Pada era modern ini, Desa Darit terus berkembang dengan berbagai program pembangunan. Infrastruktur semakin baik, akses pendidikan dan kesehatan meningkat, serta potensi ekonomi desa mulai dikembangkan melalui program UMKM dan pariwisata.</p>
' 
WHERE id = 1;

-- Show completion message
SELECT 'Database desa_darit created successfully!' as message;