-- 1. VARTOTOJAI IR ROLĖS (FR0, FR1)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' arba 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. KATEGORIJOS (FR0)
-- Administratorius gali valdyti šį sąrašą
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')), -- Kategorija skirta pajamoms arba išlaidoms
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSAKCIJOS (PAJAMOS IR IŠLAIDOS) (FR2, FR3, FR4, FR5)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BIUDŽETO LIMITAI (FR6)
CREATE TABLE IF NOT EXISTS budget_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    amount_limit DECIMAL(10, 2) NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER,
    UNIQUE(user_id, category_id, month, year)
);

-- 5. ĮVYKIŲ ŽURNALAS (FR0 - Audit Log)
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Kas atliko veiksmą
    action VARCHAR(255) NOT NULL, -- Pvz: 'SUKURTAS_VARTOTOJAS', 'PAŠALINTA_IŠLAIDA'
    target_user_id INTEGER NULL, -- Jei veiksmas atliktas su kitu vartotoju (adminui)
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --- PRADINIAI DUOMENYS ---

-- Administratorius ir testinis vartotojas
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@budgetnest.com', 'admin123', 'admin'),
('jonas', 'jonas@test.com', 'jonas123', 'user')
ON CONFLICT DO NOTHING;

-- Išlaidų kategorijos (FR0 pavyzdžiai)
INSERT INTO categories (name, type) VALUES 
('Maistas/Gėrimai', 'expense'),
('Transportas', 'expense'),
('Pramogos', 'expense'),
('Sveikata', 'expense'),
('Sportas', 'expense'),
('Kelionės', 'expense'),
('Alga', 'income'), -- FR2 pavyzdys
('Papildomi darbai', 'income')
ON CONFLICT DO NOTHING;

-- --- FR6: BIUDŽETO LIMITŲ LENTELĖ ---
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    limit_amount DECIMAL(10, 2) NOT NULL,
    UNIQUE(user_id, category_id) -- Užtikrina, kad viena kategorija turėtų tik vieną limitą vartotojui
);

-- --- TESTINIAI DUOMENYS (Nebūtina, bet padeda pamatyti vaizdą) ---
-- Tarkime, kad vartotojo ID yra 1, o kategorijų ID yra 1, 2, 3...
-- Šios eilutės sukurs pradinius limitus tavo "John" vartotojui:
INSERT INTO budgets (user_id, category_id, limit_amount) 
VALUES 
    (1, 1, 500.00), -- Maistas/Gėrimai limitas 500€
    (1, 2, 200.00), -- Transportas limitas 200€
    (1, 3, 150.00)  -- Pramogos limitas 150€
ON CONFLICT DO NOTHING;