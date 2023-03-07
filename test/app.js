/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import {
  OK,
  CREATED,
  FORBIDDEN,
  UNAUTHORIZED,
  TOO_MANY_REQUESTS,
} from 'http-status';
import { Op } from 'sequelize';
import { randEmail, randNumber } from '@ngneat/falso';
import server from '../src/app';
import models from '../src/database/models';
import { QUOTA_TYPES } from '../src/utils/variable';
import ClientService from '../src/services/client.service';

process.env.NODE_ENV = 'test';
const should = chai.should();

const { Client, ApiKey } = models;

chai.use(chaiHttp);

const mockClient = {
  appName: 'XYZ client',
  companyName: 'XYZ client',
  email: randEmail(),
  phone: `0788${randNumber({ length: 6 })[0]}`,
  quotaType: QUOTA_TYPES[2],
  quota: 20,
};

describe('Global Rate Limits ', async () => {
  /*
   * Test Global rate limits land route
   */

  const rateLimitsHeaders = [
    'ratelimit-limit',
    'ratelimit-remaining',
    'ratelimit-reset',
    'x-rateLimit-limit',
    'x-rateLimit-remaining',
  ];
  let firstResponse;

  describe('/GET general ratelimits', () => {
    before((done) => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          firstResponse = res;
          done();
        });
    });

    it('it should GET and have Global ratelimit headers', (done) => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.headers;
          rateLimitsHeaders.forEach((header) => res.should.have.header(header));
          expect(Number(firstResponse.headers[rateLimitsHeaders[1]])).above(
            Number(res.headers[rateLimitsHeaders[1]]),
          );
          expect(Number(firstResponse.headers[rateLimitsHeaders[1]])).equals(
            Number(res.headers[rateLimitsHeaders[1]]) + 1,
          );
          done();
        });
    });
  });
});

// Client Testing
describe('Clients', async () => {
  before(async () => {
    const { email, phone } = mockClient;
    const client = await Client.findOne({
      [Op.or]: {
        email,
        phone,
      },
    });
    if (client) {
      await ApiKey.destroy({ where: { clientId: client.id } });
      await client.destroy();
    }
  });

  /*
   * Test the client /POST route
   */
  describe('/POST client', () => {
    let apiClientId;
    let apiClientKey;
    it('it should  POST a client', (done) => {
      chai
        .request(server)
        .post('/api/auth/register')
        .send(mockClient)
        .end((err, res) => {
          res.should.have.status(CREATED);
          res.body.should.be.a('object');
          res.body.should.have.property('data');
          res.body.data.should.have.property('clientCreation');
          res.body.data.clientCreation.should.have.property('clientIdentifier');
          res.body.data.should.have.property('keyCreation');
          res.body.data.should.have.property('plainKey');
          apiClientId = res.body.data.clientCreation.clientIdentifier;
          apiClientKey = res.body.data.plainKey;
          done();
        });
    });

    it('it should not POST a client SMS without auth keys', (done) => {
      chai
        .request(server)
        .post('/api/notification/sms')
        .send(mockClient)
        .end((err, res) => {
          res.should.have.status(FORBIDDEN);
          done();
        });
    });

    it('it should not POST a client SMS with wrong auth keys', (done) => {
      chai
        .request(server)
        .post('/api/notification/sms')
        .set('client-id', 'id')
        .set('client-key', 'key')
        .send(mockClient)
        .end((err, res) => {
          res.should.have.status(UNAUTHORIZED);
          res.body.should.be.a('object');
          done();
        });
    });

    it('it should POST a client SMS with right auth keys', (done) => {
      chai
        .request(server)
        .post('/api/notification/sms')
        .set('client-id', apiClientId)
        .set('client-key', apiClientKey)
        .send(mockClient)
        .end((err, res) => {
          res.should.have.status(OK);
          done();
        });
    });

    it('it should POST a client SMS and reduce MONTHLY quota', async (done) => {
      const clientBefore = await ClientService.findBy({
        clientIdentifier: apiClientId,
      });
      const { quotaUsed: quotaBefore } = clientBefore.keys[0];
      chai
        .request(server)
        .post('/api/notification/sms')
        .set('client-id', apiClientId)
        .set('client-key', apiClientKey)
        .send(mockClient)
        .end(async (err, res) => {
          res.should.have.status(OK);
          const clientAfter = await ClientService.findBy({
            clientIdentifier: apiClientId,
          });
          const { quotaUsed: quotaAfter } = clientAfter.keys[0];
          expect(quotaBefore).lessThan(quotaAfter);
          expect(quotaBefore + 1).equals(quotaAfter);
          done();
        });
    });

    it('it should not POST a client SMS without enough MONTHLY quota', async (done) => {
      const client = await ClientService.findBy({
        clientIdentifier: apiClientId,
      });
      const apiKey = client.keys[0];
      apiKey.quota = 10;
      apiKey.quotaUsed = 10;
      await apiKey.save();

      chai
        .request(server)
        .post('/api/notification/sms')
        .set('client-id', apiClientId)
        .set('client-key', apiClientKey)
        .send(mockClient)
        .end(async (err, res) => {
          res.should.have.status(TOO_MANY_REQUESTS);
          done();
        });
    });
  });
});
