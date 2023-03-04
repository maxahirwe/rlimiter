import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import dateTime from 'date-and-time';
import models from '../database/models';
import { QUOTA_METRICS } from '../utils/variable';
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
    console.log(_.omit(body, ['quotaType']));
    return models.sequelize.transaction(async (transaction) => {
      const plainKey = uuidv4();
      const clientIdentifier = uuidv4();

      const apiKey = BcryptService.hashPassword(plainKey);
      const defaultQuota = 100;
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

      // create client account keys
      const keyCreation = await ApiKey.create(
        {
          clientId: clientCreation.id,
          quotaType,
          quotaMetric: QUOTA_METRICS[1],
          quota: defaultQuota,
          quotaUsed: 0,
          approved: true,
          validUntil: dateTime.addMonths(new Date(), expiryPeriod),
          key: apiKey,
        },
        {
          transaction,
        },
      );

      return { clientCreation, keyCreation, plainKey };
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
}

export default ClientService;
