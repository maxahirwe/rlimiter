import { CREATED, OK, UNAUTHORIZED } from 'http-status';
import _ from 'lodash';
import { Op } from 'sequelize';
import ClientService from '../services/user.service';
import ResponseService from '../services/response.service';
import BcryptService from '../services/bcrypt.service';
import TokenService from '../services/token.service';
import models from '../database/models';
import logger from '../utils/logger';

const authenticationLogger = logger('authentication');

const { Client } = models;

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
      ResponseService.success(CREATED, 'client account created', client, res);
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
