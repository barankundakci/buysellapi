const Sequelize = require('sequelize')
const DATABASE_URL = 'postgres://postgres:2000@127.0.0.1:5432/db';
const database = new Sequelize(DATABASE_URL);

const Hisse = database.define(
  'hisse',
  {
    id: {
      type: Sequelize.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    symbol: {
      type: Sequelize.TEXT
    },
    hisseadi: {
      type: Sequelize.TEXT
    },
    fiyat: {
      type: Sequelize.REAL
    }
  },
  { timestamps: false }
);

const Payload = database.define(
  'payload',
  {
    id: {
      type: Sequelize.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    name: {
      type: Sequelize.TEXT
    },
    surname: {
      type: Sequelize.TEXT
    },
    password: {
      type: Sequelize.TEXT
    },
    totalPrice: {
      type: Sequelize.FLOAT
    }
  },
  { timestamps: false }
);

const Jointable = database.define(
  'hisse_payload_join_table',
  {
    id: {
      type: Sequelize.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    hisse_payload_id: {
      type: Sequelize.INTEGER
    },
    payload_id: {
      type: Sequelize.REAL
    }
  },
  { timestamps: false }
);

const Hisse_Payload = database.define(
  'hisse_payload',
  {
    id: {
      type: Sequelize.INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
    ratio: {
      type: Sequelize.REAL
    },
    active: {
      type: Sequelize.BOOLEAN
    },
    hisseId: {
      type: Sequelize.INTEGER,
      references: {
        model: Hisse, // 'Actors' would also work
        key: 'id'
      }
    }
  },
  { timestamps: false }
);


Hisse_Payload.belongsTo(Hisse);

Payload.belongsToMany(Hisse_Payload, {
  through: "hisse_payload_join_tables",
  timestamps: false,
  as: "hisse_payload",
  foreignKey: "payload_id",
});

Hisse_Payload.belongsToMany(Payload, {
  through: "hisse_payload_join_tables",
  timestamps: false,
  as: "payload",
  foreignKey: "hisse_payload_id",
});


module.exports = {
  Hisse:Hisse,
  Payload:Payload,
  Hisse_Payload: Hisse_Payload,
  Jointable: Jointable
}