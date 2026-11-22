CREATE DATABASE IF NOT EXISTS financeiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE financeiro;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NULL UNIQUE,
  phone VARCHAR(20) NULL,
  emergency_fund DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  investments DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_types (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account_types_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  account_type_id VARCHAR(36) NULL,
  name VARCHAR(150) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  is_recurring TINYINT(1) NOT NULL DEFAULT 0,
  is_installment TINYINT(1) NOT NULL DEFAULT 0,
  installment_count INT NULL,
  installment_number INT NULL,
  parent_expense_id VARCHAR(36) NULL,
  is_paid TINYINT(1) NOT NULL DEFAULT 0,
  is_credit_card TINYINT(1) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expenses_user_id (user_id),
  INDEX idx_expenses_due_date (due_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_type_id) REFERENCES account_types(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS income (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  is_recurring TINYINT(1) NOT NULL DEFAULT 0,
  income_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_income_user_id (user_id),
  INDEX idx_income_income_date (income_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_groups (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'Painel Família',
  created_by_user_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_members (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  family_group_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  user_cpf VARCHAR(14) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_family_members_group (family_group_id),
  UNIQUE KEY uq_family_member_user_cpf (user_id, user_cpf),
  FOREIGN KEY (family_group_id) REFERENCES family_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_invites (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  family_group_id VARCHAR(36) NOT NULL,
  inviter_user_id VARCHAR(36) NOT NULL,
  inviter_cpf VARCHAR(14) NOT NULL,
  invitee_user_id VARCHAR(36) NOT NULL,
  invitee_cpf VARCHAR(14) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_family_invites_invitee (invitee_user_id, status),
  INDEX idx_family_invites_group (family_group_id, status),
  FOREIGN KEY (family_group_id) REFERENCES family_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invitee_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed: usuário admin (senha: Admin@123)
INSERT IGNORE INTO users (id, name, email, password, emergency_fund)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Administrador',
  'admin@financeiro.com',
  '$2b$10$1OpiS6uP6mYM4C63/ziDXuFeSr5Q.ljX2Is6VAELXCwCcXvNSmMKW',
  0.00
);

-- Tipos de conta padrão para o admin
INSERT IGNORE INTO account_types (id, name, user_id) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'Cartão de Crédito', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000002', 'Água', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000003', 'Energia Elétrica', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000004', 'Internet', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000005', 'Aluguel', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000006', 'Alimentação', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000007', 'Transporte', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000008', 'Saúde', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000009', 'Educação', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000010', 'Lazer', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000011', 'Moradia', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000012', 'Compras', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000013', 'Fast Food', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('t1000000-0000-0000-0000-000000000014', 'Eletrônicos', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
