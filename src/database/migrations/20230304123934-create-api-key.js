const { QUOTA_TYPES, QUOTA_METRICS } = require('../../utils/variable');

const clientKeysTable = {
  schema: 'Authentication',
  tableName: 'ApiKeys',
};
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(clientKeysTable, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            schema: 'Authentication',
            tableName: 'Clients',
          },
          key: 'id',
        },
      },
      quotaType: {
        type: Sequelize.ENUM(...QUOTA_TYPES),
        allowNull: false,
      },
      quotaMetric: {
        type: Sequelize.ENUM(...QUOTA_METRICS),
        allowNull: false,
      },
      quota: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quotaUsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalQuotaUsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      approved: {
        type: Sequelize.BOOLEAN,
        default: false,
        allowNull: false,
      },
      dateApproved: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastQuotaUpdate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(clientKeysTable);
  },
};
