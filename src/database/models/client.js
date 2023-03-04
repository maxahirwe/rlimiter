const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /**
   * Client Model Class
   */
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     * @param {Array} models all models
     * @returns {void} associate relationship
     */
    static associate(models) {
      // define association here
      Client.hasMany(models.ApiKey, { foreignKey: 'clientId', as: 'keys' });
    }
  }
  Client.init(
    {
      clientIdentifier: DataTypes.STRING,
      appName: DataTypes.STRING,
      companyName: DataTypes.STRING,
      companyAddress: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      schema: 'Authentication',
      modelName: 'Client',
    },
  );
  return Client;
};
