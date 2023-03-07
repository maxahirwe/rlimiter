import { FORBIDDEN, UNAUTHORIZED } from 'http-status';
import ResponseService from '../services/response.service';
import ClientService from '../services/client.service';
import BcryptService from '../services/bcrypt.service';

/**
 * * Authorize a client to access a protected route
 * @param  {object} req
 * @param  {object} res
 * @param  {Function} next
 * @return {object} object
 */
export default async (req, res, next) => {
  try {
    const authorizationHeaders = ['client-id', 'client-key'];
    const clientIdentifier = req.headers[authorizationHeaders[0]];
    const clientKey = req.headers[authorizationHeaders[1]];
    if (clientIdentifier && clientKey) {
      const client = await ClientService.findBy({ clientIdentifier });
      if (!client) {
        return ResponseService.error(
          UNAUTHORIZED,
          'Invalid client-Id provided',
          res,
        );
      }
      const { keys } = client;
      const { key } = keys[0]; // consider multiple keys environment
      if (!BcryptService.comparePassword(clientKey, key)) {
        return ResponseService.error(
          UNAUTHORIZED,
          'Invalid client-Key provided',
          res,
        );
      }
      req.clientIdentifier = clientIdentifier;
      req.data = { client };
      next();
    } else {
      return ResponseService.error(
        FORBIDDEN,
        `You can not proceed without setting authorization headers (${authorizationHeaders.join(
          ', ',
        )})`,
        res,
      );
    }
  } catch (err) {
    next(err);
  }
};
