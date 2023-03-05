/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { OK, CREATED, FORBIDDEN, UNAUTHORIZED } from 'http-status';
import { Op } from 'sequelize';
import server from '../src/app';
import models from '../src/database/models';

process.env.NODE_ENV = 'test';
const should = chai.should();

const { Client, ApiKey } = models;

chai.use(chaiHttp);

const mockClient = {
  appName: 'XYZ client',
  companyName: 'XYZ client',
  email: 'xyz_test@max.rw',
  phone: '0788536933',
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

  describe('/GET ratelimits', () => {
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
    await ApiKey.destroy({ where: { clientId: client.id } });
    await client.destroy();
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
    // quotas testing   // should not pass quota per month
  });
});
