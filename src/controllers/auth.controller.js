import _ from 'lodash';
import { CREATED, OK } from 'http-status';
import ClientService from '../services/client.service';
import ResponseService from '../services/response.service';
import models from '../database/models';
import logger from '../utils/logger';

const authenticationLogger = logger('authentication');

/**
 * Auth controller class
 */
class AuthController {
  /**
   * Registration
   * @param  {object} req
   * @param  {object} res
   * @param  {Function} next
   * @returns {object} object
   */
  static async register(req, res, next) {
    try {
      const { body } = req;
      const client = await ClientService.create(body);
      ResponseService.success(
        CREATED,
        'client account created (save plain key for later use)',
        client,
        res,
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Profile
   * @param  {object} req
   * @param  {object} res
   * @param  {Function} next
   * @returns {object} object
   */
  static async profile(req, res, next) {
    try {
      const { client } = req;
      const { keys } = client;

      ResponseService.success(
        OK,
        'client profile',
        {
          client: _.omit(client.dataValues, ['keys']),
          mainKey: _.omit(keys[0].dataValues, ['key']),
        },
        res,
      );
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
