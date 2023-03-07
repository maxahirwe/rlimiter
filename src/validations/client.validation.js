import JoiDefault from 'joi';
import JoiPhoneNumber from 'joi-phone-number';
import { QUOTA_TYPES } from '../utils/variable';

const Joi = JoiDefault.extend(JoiPhoneNumber);

/**
 * Validation for users
 */
class UserValidation {
  /**
   * validates user object upon registration
   * @param {Object} body
   * @returns {Joi.ValidationResult} Joi validation result
   */
  static async registration(body) {
    const schema = Joi.object({
      appName: Joi.string().trim().required(),
      companyName: Joi.string().trim().required(),
      companyAddress: Joi.string().trim().optional(),
      email: Joi.string().trim().email().required(),
      phone: Joi.string()
        .trim()
        .phoneNumber({
          defaultCountry: 'RW',
          format: 'e164',
          strict: true,
        })
        .required()
        .messages({
          'any.required': 'phone is required',
          'phoneNumber.invalid': 'phone has incorrect format',
        }),
      quotaType: Joi.string()
        .trim()
        .valid(...QUOTA_TYPES)
        .required(),
      quota: Joi.number().integer().default(10).optional(),
    });
    return schema.validate(body, { abortEarly: false });
  }
}
export default UserValidation;
