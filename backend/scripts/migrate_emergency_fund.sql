USE financeiro;
ALTER TABLE users ADD COLUMN emergency_fund DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
