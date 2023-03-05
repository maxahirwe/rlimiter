import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import dateTime from 'date-and-time';
import models from '../database/models';
import { QUOTA_METRICS, QUOTA_TYPES } from '../utils/variable';
import BcryptService from './bcrypt.service';

const { Client, ApiKey } = models;

const includeKeys = {
  model: ApiKey,
  as: 'keys',
};

/**
 * Class that provides client services
 */
class ClientService {
  /**
   * Registers a client
   * @param {Object} body
   * @returns {Object} Registered User
   */
  static async create(body) {
    return models.sequelize.transaction(async (transaction) => {
      const plainKey = uuidv4();
      const clientIdentifier = uuidv4();

      const apiKey = BcryptService.hashPassword(plainKey);
      const defaultQuota = 10;
      const expiryPeriod = 6; // months
      const { quotaType } = body;

      // create client account
      const client = {
        ..._.omit(body, ['quotaType']),
        clientIdentifier,
      };

      // create client account
      const clientCreation = await Client.create(client, {
        transaction,
      });

      // create client account apiKeys
      const quotaMetric =
        quotaType === QUOTA_TYPES[2] ? QUOTA_METRICS[2] : QUOTA_METRICS[1];
      const keyCreation = await ApiKey.create(
        {
          clientId: clientCreation.id,
          quotaType,
          quotaMetric,
          quota: defaultQuota,
          quotaUsed: 0,
          totalQuotaUsed: 0,
          approved: true,
          dateApproved: Date.now(),
          lastQuotaUpdate: Date.now(),
          validUntil: dateTime.addMonths(new Date(), expiryPeriod),
          key: apiKey,
        },
        {
          transaction,
        },
      );

      return {
        clientCreation,
        keyCreation: _.omit(keyCreation.dataValues, ['key']),
        plainKey,
      };
    });
  }

  /**
   * @param  {Number} id
   * @returns {object} object
   */
  static findById(id) {
    return Client.findByPk(id, {
      include: [includeKeys],
    });
  }

  /**
   * @param  {object} condition
   * @returns {object} object
   */
  static findBy(condition) {
    return Client.findOne({
      where: condition,
      include: [includeKeys],
    });
  }

  /**
   * ApiKey increase used quota
   * @param {Object} apiKey
   * @returns {Object} Registered User
   */
  static async quotaUsageIncrease(apiKey) {
    const { lastQuotaUpdate } = apiKey;

    return models.sequelize.transaction(async (transaction) => {
      const keyUpdate = await apiKey.update(
        {
          lastQuotaUpdate,
          quotaUsed: apiKey.quotaUsed + 1,
          totalQuotaUsed: apiKey.totalQuotaUsed + 1,
        },
        {
          transaction,
        },
      );

      return keyUpdate;
    });
  }

  /**
   * Reset all monthly ApiKeys quotas
   * @returns {Object} Registered User
   */
  static async resetMonthlyQuotas() {
    return models.sequelize.transaction(async (transaction) => {
      return ApiKey.update(
        { lastQuotaUpdate: Date.now(), quotaUsed: 0 },
        {
          where: {
            quotaType: QUOTA_TYPES[2],
            approved: true,
          },
          transaction,
        },
      );
    });
  }
}

export default ClientService;
