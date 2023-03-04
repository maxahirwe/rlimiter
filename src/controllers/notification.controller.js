import { NOT_FOUND, OK } from 'http-status';
import ResponseService from '../services/response.service';

/**
 * NotificationController class
 */
class NotificationController {
  /** Send SMS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @returns {Object} object
   */
  static sms(req, res, next) {
    try {
      const { body } = req;
      const { phone } = body;
      ResponseService.setSuccess(OK, 'SMS sent (Mock)');
      return ResponseService.send(res);
    } catch (e) {
      next(e);
    }
  }

  /** Send SMS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   * @returns {Object} object
   */
  static email(req, res, next) {
    try {
      const { body } = req;
      const { email } = body;
      ResponseService.setSuccess(OK, 'Email sent (Mock)');
      return ResponseService.send(res);
    } catch (e) {
      next(e);
    }
  }
}

export default NotificationController;
