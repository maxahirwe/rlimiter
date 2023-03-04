/* eslint-disable object-curly-newline */
import { CONFLICT } from 'http-status';
import _ from 'lodash';
import ResponseService from '../services/response.service';
import ClientService from '../services/user.service';

/**
 * middleware to check uniqueness of client's accounts
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns middleware to check uniqueness of client's accounts
 */

export const checkClientDuplicate = async (req, res, next) => {
  try {
    const { body } = req;
    const { email, phone } = body;
    const userEmail = await ClientService.findBy({ email });
    const userPhone = await ClientService.findBy({ phone });
    if (userEmail) {
      return ResponseService.error(
        CONFLICT,
        'Email has already been registered',
        res,
      );
    }
    if (userPhone) {
      return ResponseService.error(
        CONFLICT,
        'Phone number has already been registered',
        res,
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};
