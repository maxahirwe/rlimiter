const clientTable = {
  schema: 'Authentication',
  tableName: 'Clients',
};
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(clientTable, {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      clientIdentifier: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      appName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: {
        type: Sequelize.STRING(50),
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
    await queryInterface.dropTable(clientTable);
  },
};
