USE financeiro;

UPDATE account_types SET name = 'Cartão de Crédito' WHERE name LIKE '%Cart%o%';
UPDATE account_types SET name = 'Água' WHERE name LIKE '%gua%';
UPDATE account_types SET name = 'Energia Elétrica' WHERE name LIKE '%El%trica%';
UPDATE account_types SET name = 'Alimentação' WHERE name LIKE '%Alimentação%' OR name LIKE '%Alimenta%o%';
UPDATE account_types SET name = 'Saúde' WHERE name LIKE '%Sa%de%';
UPDATE account_types SET name = 'Educação' WHERE name LIKE '%Educação%' OR name LIKE '%Educa%o%';
UPDATE account_types SET name = 'Internet' WHERE name = 'Internet';
UPDATE account_types SET name = 'Aluguel' WHERE name = 'Aluguel';
UPDATE account_types SET name = 'Transporte' WHERE name = 'Transporte';
UPDATE account_types SET name = 'Lazer' WHERE name = 'Lazer';
