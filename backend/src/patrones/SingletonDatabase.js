class SingletonDatabase {
  constructor() {
    if (!SingletonDatabase.instance) {
      const { Pool } = require('pg');
      require('dotenv').config();

      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpark'
      });

      SingletonDatabase.instance = this;
    }

    return SingletonDatabase.instance;
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }
}

module.exports = new SingletonDatabase();
