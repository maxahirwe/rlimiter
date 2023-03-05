import cron from 'node-cron';
import models from './database/models';
import logging from './utils/logger';
import ClientService from './services/client.service';
import { QUOTA_TYPES } from './utils/variable';

const { ApiKey } = models;

const { MONTLY_RESET_CRON: resetPattern } = process.env;
const logger = logging('automations');
const scheduler = () => {
  logger.info(`Client Quota Scheduler will execute with ${resetPattern}`);
  try {
    const quotaCron = cron.schedule(
      resetPattern,
      async () => {
        logger.info(
          ` ${new Date()}:  Client Quota Scheduler Task is running with pattern: ${resetPattern}`,
        );
        const keysToReset = await ApiKey.count({
          where: {
            quotaType: QUOTA_TYPES[2],
            approved: true,
          },
        });
        logger.info(`number of resetted keys quotas ${keysToReset}`);
        await ClientService.resetMonthlyQuotas();
      },
      {
        scheduled: false,
      },
    );
    quotaCron.start();
  } catch (err) {
    logger.info(err);
  }
};

export default scheduler;
