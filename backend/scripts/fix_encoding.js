const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'financeiro',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco.');

    const [results] = await sequelize.query("SELECT id, name FROM account_types");
    
    const fixes = {
      'Cartão de Crédito': [/Cart.*o/i, /Cart.*dito/i],
      'Água': [/.*gua/i],
      'Energia Elétrica': [/Energia.*trica/i],
      'Alimentação': [/Alimenta.*o/i],
      'Saúde': [/Sa.*de/i],
      'Educação': [/Educa.*o/i],
    };

    for (const row of results) {
      console.log(`Checking: "${row.name}"`);
      let newName = row.name;
      for (const [fixed, patterns] of Object.entries(fixes)) {
        if (patterns.some(p => p.test(row.name))) {
          newName = fixed;
          break;
        }
      }

      if (newName !== row.name) {
        console.log(`Fixing: "${row.name}" -> "${newName}"`);
        await sequelize.query("UPDATE account_types SET name = ? WHERE id = ?", {
          replacements: [newName, row.id]
        });
      }
    }

    console.log('Correção finalizada.');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

fix();
