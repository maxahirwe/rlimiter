import { NOT_FOUND, OK } from 'http-status';
import ResponseService from '../services/response.service';

/**
 * App controller class
 */
class AppController {
  /**
   * @param  {object} req
   * @param  {object} res
   * @returns {object} object
   */
  static landRoute(req, res) {
    ResponseService.setSuccess(
      OK,
      'Rate Limited Notification Service landing route',
    );
    return ResponseService.send(res);
  }

  /**
   * @param  {object} req
   * @param  {object} res
   * @returns {object} object
   */
  static notFoundRoute(req, res) {
    return ResponseService.error(
      NOT_FOUND,
      'Route does not exist, check well the path or the method',
      res,
    );
  }
}

export default AppController;
