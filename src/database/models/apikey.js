const { Model } = require('sequelize');
const { QUOTA_TYPES, QUOTA_METRICS } = require('../../utils/variable');

module.exports = (sequelize, DataTypes) => {
  /**
   * ApiKey Model Class
   */
  class ApiKey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     * @param {Array} models all models
     * @returns {void} associate relationship
     */
    static associate(models) {
      // define association here
      // ApiKey.belongsTo(models.Client, {
      //   foreignKey: 'clientId',
      //   as: 'client',
      // });
    }
  }
  ApiKey.init(
    {
      clientId: DataTypes.INTEGER,
      quotaType: DataTypes.ENUM(...QUOTA_TYPES),
      quotaMetric: DataTypes.ENUM(...QUOTA_METRICS),
      quota: DataTypes.INTEGER,
      quotaUsed: DataTypes.INTEGER,
      approved: DataTypes.BOOLEAN,
      key: DataTypes.STRING,
      validUntil: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      schema: 'Authentication',
      modelName: 'ApiKey',
    },
  );
  return ApiKey;
};
