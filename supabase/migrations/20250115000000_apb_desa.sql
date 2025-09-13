-- Migration: APB Desa (Anggaran Pendapatan dan Belanja Desa)
-- Created for Sistem Informasi Desa Darit
-- Kecamatan Menyuke, Kabupaten Landak, Kalimantan Barat

-- ===============================
-- APB DESA TABLES
-- ===============================

-- Table for APB Desa years
CREATE TABLE IF NOT EXISTS apb_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL UNIQUE,
    status ENUM('draft', 'approved', 'active') DEFAULT 'draft',
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expenditure DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_status (status)
);

-- Table for income categories
CREATE TABLE IF NOT EXISTS apb_income_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for expenditure categories
CREATE TABLE IF NOT EXISTS apb_expenditure_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for income details
CREATE TABLE IF NOT EXISTS apb_income (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
);

-- Table for expenditure details
CREATE TABLE IF NOT EXISTS apb_expenditure (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
);

-- ===============================
-- INSERT DEFAULT CATEGORIES
-- ===============================

-- Insert default income categories
INSERT INTO apb_income_categories (name, description) VALUES
('Pendapatan Asli Desa', 'Pendapatan yang berasal dari sumber-sumber di desa sendiri'),
('Transfer dari Pemerintah Pusat', 'Dana yang diterima dari pemerintah pusat'),
('Transfer dari Pemerintah Provinsi', 'Dana yang diterima dari pemerintah provinsi'),
('Transfer dari Pemerintah Kabupaten/Kota', 'Dana yang diterima dari pemerintah kabupaten/kota'),
('Bantuan Keuangan dari Pihak Ketiga', 'Bantuan keuangan dari pihak ketiga yang tidak mengikat'),
('Pendapatan Lain-lain', 'Pendapatan lain yang sah dan tidak bertentangan dengan peraturan');

-- Insert default expenditure categories
INSERT INTO apb_expenditure_categories (name, description) VALUES
('Bidang Penyelenggaraan Pemerintahan Desa', 'Belanja untuk penyelenggaraan pemerintahan desa'),
('Bidang Pelaksanaan Pembangunan Desa', 'Belanja untuk pelaksanaan pembangunan desa'),
('Bidang Pembinaan Kemasyarakatan Desa', 'Belanja untuk pembinaan kemasyarakatan desa'),
('Bidang Pemberdayaan Masyarakat Desa', 'Belanja untuk pemberdayaan masyarakat desa'),
('Bidang Penanganan Bencana, Keadaan Darurat dan Mendesak Desa', 'Belanja untuk penanganan bencana dan keadaan darurat'),
('Belanja Tidak Terduga', 'Belanja untuk keperluan yang tidak terduga');

-- ===============================
-- INSERT SAMPLE DATA
-- ===============================

-- Insert sample years
INSERT INTO apb_years (year, status, total_income, total_expenditure) VALUES
(2022, 'approved', 850000000.00, 820000000.00),
(2023, 'approved', 920000000.00, 890000000.00),
(2024, 'active', 980000000.00, 950000000.00);

-- Insert sample income data for 2024
INSERT INTO apb_income (year_id, category_id, source, description, budgeted_amount, realized_amount) VALUES
(3, 1, 'Retribusi Pasar Desa', 'Pendapatan dari retribusi pasar desa', 15000000.00, 12000000.00),
(3, 1, 'Retribusi Parkir', 'Pendapatan dari retribusi parkir', 5000000.00, 4500000.00),
(3, 2, 'Dana Desa', 'Dana desa dari pemerintah pusat', 800000000.00, 800000000.00),
(3, 3, 'Dana Alokasi Khusus', 'DAK dari pemerintah provinsi', 50000000.00, 50000000.00),
(3, 4, 'Dana Bagi Hasil', 'DBH dari pemerintah kabupaten', 30000000.00, 30000000.00),
(3, 5, 'Bantuan CSR', 'Bantuan dari perusahaan swasta', 20000000.00, 15000000.00),
(3, 6, 'Pendapatan Sewa', 'Pendapatan dari sewa aset desa', 10000000.00, 8000000.00);

-- Insert sample expenditure data for 2024
INSERT INTO apb_expenditure (year_id, category_id, activity, description, budgeted_amount, realized_amount) VALUES
(3, 1, 'Operasional Kantor Desa', 'Belanja operasional kantor desa', 50000000.00, 45000000.00),
(3, 1, 'Gaji dan Tunjangan', 'Gaji dan tunjangan aparat desa', 120000000.00, 120000000.00),
(3, 2, 'Pembangunan Jalan Desa', 'Pembangunan dan perbaikan jalan desa', 200000000.00, 180000000.00),
(3, 2, 'Pembangunan Drainase', 'Pembangunan sistem drainase', 80000000.00, 70000000.00),
(3, 2, 'Pembangunan Jembatan', 'Pembangunan jembatan desa', 150000000.00, 150000000.00),
(3, 3, 'Kegiatan Sosial', 'Kegiatan sosial dan kemasyarakatan', 30000000.00, 25000000.00),
(3, 3, 'Pembinaan Karang Taruna', 'Pembinaan dan pengembangan karang taruna', 15000000.00, 12000000.00),
(3, 4, 'Pelatihan UMKM', 'Pelatihan dan pengembangan UMKM', 40000000.00, 35000000.00),
(3, 4, 'Program Pemberdayaan Perempuan', 'Program pemberdayaan perempuan', 25000000.00, 20000000.00),
(3, 5, 'Penanganan Bencana', 'Dana darurat untuk penanganan bencana', 20000000.00, 5000000.00),
(3, 6, 'Belanja Tidak Terduga', 'Belanja untuk keperluan tidak terduga', 10000000.00, 5000000.00);

-- ===============================
-- VIEWS FOR REPORTING
-- ===============================

-- View for APB summary by year
CREATE VIEW apb_summary AS
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
GROUP BY ay.id, ay.year, ay.status, ay.total_income, ay.total_expenditure;

-- View for income details with categories
CREATE VIEW apb_income_details AS
SELECT 
    ay.year,
    aic.name as category_name,
    ai.source,
    ai.description,
    ai.budgeted_amount,
    ai.realized_amount,
    (ai.realized_amount - ai.budgeted_amount) as variance,
    ROUND((ai.realized_amount / ai.budgeted_amount) * 100, 2) as realization_percentage
FROM apb_income ai
JOIN apb_years ay ON ai.year_id = ay.id
JOIN apb_income_categories aic ON ai.category_id = aic.id;

-- View for expenditure details with categories
CREATE VIEW apb_expenditure_details AS
SELECT 
    ay.year,
    aec.name as category_name,
    ae.activity,
    ae.description,
    ae.budgeted_amount,
    ae.realized_amount,
    (ae.realized_amount - ae.budgeted_amount) as variance,
    ROUND((ae.realized_amount / ae.budgeted_amount) * 100, 2) as realization_percentage
FROM apb_expenditure ae
JOIN apb_years ay ON ae.year_id = ay.id
JOIN apb_expenditure_categories aec ON ae.category_id = aec.id;

-- ===============================
-- STORED PROCEDURES
-- ===============================

-- Procedure to calculate APB totals
DELIMITER //
CREATE PROCEDURE CalculateAPBTotals(IN year_id INT)
BEGIN
    DECLARE total_inc DECIMAL(15,2) DEFAULT 0;
    DECLARE total_exp DECIMAL(15,2) DEFAULT 0;
    
    -- Calculate total income
    SELECT COALESCE(SUM(budgeted_amount), 0) INTO total_inc
    FROM apb_income 
    WHERE year_id = year_id;
    
    -- Calculate total expenditure
    SELECT COALESCE(SUM(budgeted_amount), 0) INTO total_exp
    FROM apb_expenditure 
    WHERE year_id = year_id;
    
    -- Update APB year totals
    UPDATE apb_years 
    SET total_income = total_inc, total_expenditure = total_exp
    WHERE id = year_id;
    
    SELECT total_inc as total_income, total_exp as total_expenditure;
END//
DELIMITER ;

-- ===============================
-- TRIGGERS
-- ===============================

-- Trigger to update APB totals when income changes
DELIMITER //
CREATE TRIGGER update_apb_income_totals
AFTER INSERT ON apb_income
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(NEW.year_id);
END//

CREATE TRIGGER update_apb_income_totals_update
AFTER UPDATE ON apb_income
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(NEW.year_id);
END//

CREATE TRIGGER update_apb_income_totals_delete
AFTER DELETE ON apb_income
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(OLD.year_id);
END//
DELIMITER ;

-- Trigger to update APB totals when expenditure changes
DELIMITER //
CREATE TRIGGER update_apb_expenditure_totals
AFTER INSERT ON apb_expenditure
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(NEW.year_id);
END//

CREATE TRIGGER update_apb_expenditure_totals_update
AFTER UPDATE ON apb_expenditure
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(NEW.year_id);
END//

CREATE TRIGGER update_apb_expenditure_totals_delete
AFTER DELETE ON apb_expenditure
FOR EACH ROW
BEGIN
    CALL CalculateAPBTotals(OLD.year_id);
END//
DELIMITER ;

-- Show completion message
SELECT 'APB Desa tables created successfully!' as message;
