const url = require('url');
const { createHash } = require('crypto');

const sinon = require('sinon');
const { expect } = require('chai');
const { JWK, JWT } = require('jose2');
const { importJWK } = require('jose');

const nanoid = require('../../lib/helpers/nanoid');
const epochTime = require('../../lib/helpers/epoch_time');
const bootstrap = require('../test_helper');
const base64url = require('../../lib/helpers/base64url');

const expectedS256 = 'ZjEgWN6HnCZRssL1jRQHiJi6vlWXolM5Zba8FQBYONg';

function ath(accessToken) {
  return base64url.encode(createHash('sha256').update(accessToken).digest());
}

describe('features.dPoP', () => {
  before(bootstrap(__dirname));
  before(function () { return this.login({ scope: 'openid offline_access' }); });
  bootstrap.skipConsent();
  before(async function () {
    this.jwk = JWK.asKey({
      crv: 'P-256',
      x: '1_Dz3o3_V5CpuzQ78gImNb2QIKjBfREXwBQxjyO0xig',
      y: 'YMSWnnBjNeMvfL9nZtYSyxGKZtPFG28jJwjjk06716o',
      d: 'IHFCcQXeUew9o_7jAIj2t6GEoJpgrOC9L_pQGlvRpto',
      kty: 'EC',
    });
  });
  before(function () {
    this.proof = (uri, method, accessToken, jwk = this.jwk) => {
      let accessTokenHash;
      if (accessToken) {
        accessTokenHash = ath(accessToken);
      }
      return JWT.sign(
        {
          htu: uri, htm: method, jti: nanoid(), ath: accessTokenHash,
        },
        jwk,
        {
          kid: false, header: { typ: 'dpop+jwt', jwk: JWK.asKey(jwk) },
        },
      );
    };
  });

  before(async function () {
    const client = await this.provider.Client.find('client');
    this.key = await importJWK(client.symmetricKeyStore.selectForSign({ alg: 'HS256' })[0]);
  });

  it('extends discovery', function () {
    return this.agent.get('/.well-known/openid-configuration')
      .expect(200)
      .expect((response) => {
        expect(response.body).to.have.deep.property('dpop_signing_alg_values_supported', ['ES256', 'PS256']);
      });
  });

  describe('userinfo', () => {
    it('validates the way DPoP proof JWT is provided', async function () {
      const at = new this.provider.AccessToken({
        accountId: 'account',
        client: await this.provider.Client.find('client'),
        scope: 'openid',
      });
      at.setThumbprint('jkt', this.jwk.thumbprint);

      expect(() => at.setThumbprint('x5t', 'foo')).to.throw().with.property('error_description', 'multiple proof-of-posession mechanisms are not allowed');

      const dpop = await at.save();

      await this.agent.get('/me')
        .set('Authorization', `Bearer ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_token', error_description: 'invalid token provided' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_token"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me')
        .set('Authorization', `DPoP ${dpop}`)
        .expect(400)
        .expect({ error: 'invalid_request', error_description: '`DPoP` header not provided' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.post('/me')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/me')}`, 'POST', dpop))
        .send({ access_token: dpop })
        .type('form')
        .expect(400)
        .expect({ error: 'invalid_request', error_description: '`DPoP` tokens must be provided via an authorization header' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/me')}`, 'GET', dpop))
        .set('Authorization', `Bearer ${dpop}`)
        .expect(400)
        .expect({ error: 'invalid_request', error_description: 'authorization header scheme must be `DPoP` when DPoP is used' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);
    });

    it('validates the DPoP proof JWT is conform', async function () {
      const key = await JWK.generate('EC');

      const at = new this.provider.AccessToken({
        accountId: this.loggedInAccountId,
        grantId: this.getGrantId(),
        client: await this.provider.Client.find('client'),
        scope: 'openid',
      });
      at.setThumbprint('jkt', key.thumbprint);

      const dpop = await at.save();

      for (const value of ['JWT', 'secevent+jwt']) { // eslint-disable-line no-restricted-syntax
        await this.agent.get('/me') // eslint-disable-line no-await-in-loop
          .set('DPoP', JWT.sign({}, key, { kid: false, header: { jwk: key, typ: value } }))
          .set('Authorization', `DPoP ${dpop}`)
          .expect(401)
          .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
          .expect('WWW-Authenticate', /^DPoP /)
          .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
          .expect('WWW-Authenticate', /algs="ES256 PS256"/);
      }

      for (const value of [1, true, 'none', 'HS256', 'unsupported']) { // eslint-disable-line no-restricted-syntax
        await this.agent.get('/me') // eslint-disable-line no-await-in-loop
          .set('DPoP', `${base64url.encode(JSON.stringify({ jwk: key, typ: 'dpop+jwt', alg: value }))}.e30.`)
          .set('Authorization', `DPoP ${dpop}`)
          .expect(401)
          .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
          .expect('WWW-Authenticate', /^DPoP /)
          .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
          .expect('WWW-Authenticate', /algs="ES256 PS256"/);
      }

      for (const value of [undefined, '', 1, true, null, 'foo', []]) { // eslint-disable-line no-restricted-syntax
        await this.agent.get('/me') // eslint-disable-line no-await-in-loop
          .set('DPoP', JWT.sign({}, key, { kid: false, header: { typ: 'dpop+jwt', jwk: value } }))
          .set('Authorization', `DPoP ${dpop}`)
          .expect(401)
          .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
          .expect('WWW-Authenticate', /^DPoP /)
          .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
          .expect('WWW-Authenticate', /algs="ES256 PS256"/);
      }

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({}, key, { kid: false, header: { typ: 'dpop+jwt', jwk: key.toJWK(true) } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({}, key, { kid: false, header: { typ: 'dpop+jwt', jwk: await JWK.generate('oct') } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({ htm: 'POST', htu: `${this.provider.issuer}${this.suitePath('/me')}` }, key, { kid: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof must have a jti string property' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({ jti: nanoid(), htm: 'POST' }, key, { kid: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof htm mismatch' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({ jti: nanoid(), htm: 'GET', htu: 'foo' }, key, { kid: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof htu mismatch' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({
          jti: nanoid(), htm: 'GET', htu: `${this.provider.issuer}${this.suitePath('/me')}`, iat: epochTime() - 61,
        }, key, { kid: false, iat: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof iat is not recent enough' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({
          jti: nanoid(), htm: 'GET', htu: `${this.provider.issuer}${this.suitePath('/me')}`, iat: epochTime() + 61,
        }, key, { kid: false, iat: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof iat is not recent enough' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({
          jti: nanoid(), htm: 'GET', htu: `${this.provider.issuer}${this.suitePath('/me')}`, iat: epochTime() - 60, ath: ath(dpop),
        }, key, { kid: false, iat: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(200);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({
          jti: nanoid(), htm: 'GET', htu: `${this.provider.issuer}${this.suitePath('/me')}`, iat: epochTime() + 60, ath: ath(dpop),
        }, key, { kid: false, iat: false, header: { typ: 'dpop+jwt', jwk: key } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(200);

      await this.agent.get('/me') // eslint-disable-line no-await-in-loop
        .set('DPoP', JWT.sign({
          jti: nanoid(), htm: 'GET', htu: `${this.provider.issuer}${this.suitePath('/me')}`,
        }, key, { kid: false, header: { typ: 'dpop+jwt', jwk: await JWK.generate('EC') } }))
        .set('Authorization', `DPoP ${dpop}`)
        .expect(401)
        .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' })
        .expect('WWW-Authenticate', /^DPoP /)
        .expect('WWW-Authenticate', /error="invalid_dpop_proof"/)
        .expect('WWW-Authenticate', /algs="ES256 PS256"/);
    });

    it('acts like an RS checking the DPoP proof and thumbprint now', async function () {
      const at = new this.provider.AccessToken({
        accountId: this.loggedInAccountId,
        grantId: this.getGrantId(),
        client: await this.provider.Client.find('client'),
        scope: 'openid',
      });
      at.setThumbprint('jkt', this.jwk.thumbprint);

      const dpop = await at.save();
      const proof = this.proof(`${this.provider.issuer}${this.suitePath('/me')}`, 'GET', dpop);

      await this.agent.get('/me')
        .set('Authorization', `DPoP ${dpop}`)
        .set('DPoP', proof)
        .expect(200);

      let spy = sinon.spy();
      this.provider.once('userinfo.error', spy);

      await this.agent.get('/me')
        .set('Authorization', `DPoP ${dpop}`)
        .set('DPoP', proof)
        .expect(401)
        .expect({ error: 'invalid_token', error_description: 'invalid token provided' });

      expect(spy).to.have.property('calledOnce', true);
      expect(spy.args[0][1]).to.have.property('error_detail', 'DPoP proof JWT Replay detected');

      const anotherJWK = JWK.generateSync('EC');

      spy = sinon.spy();
      this.provider.once('userinfo.error', spy);

      await this.agent.get('/me')
        .set('Authorization', `DPoP ${dpop}`)
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/me')}`, 'GET', dpop, anotherJWK))
        .expect({ error: 'invalid_token', error_description: 'invalid token provided' })
        .expect(401);

      await this.agent.get('/me')
        .set('Authorization', `DPoP ${dpop}`)
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/me')}`, 'GET', 'anotherAccessTokenValue'))
        .expect({ error: 'invalid_dpop_proof', error_description: 'DPoP proof ath mismatch' })
        .expect(401);

      expect(spy).to.have.property('calledOnce', true);
      expect(spy.args[0][1]).to.have.property('error_detail', 'failed jkt verification');

      spy = sinon.spy();
      this.provider.once('userinfo.error', spy);

      await this.agent.get('/me')
        .set('Authorization', `Bearer ${dpop}`)
        .expect({ error: 'invalid_token', error_description: 'invalid token provided' })
        .expect(401);

      expect(spy).to.have.property('calledOnce', true);
      expect(spy.args[0][1]).to.have.property('error_detail', 'failed jkt verification');
    });
  });

  describe('introspection', () => {
    it('exposes cnf and DPoP proof JWT type now', async function () {
      const at = new this.provider.AccessToken({
        accountId: 'account',
        client: await this.provider.Client.find('client'),
        scope: 'openid',
      });
      at.setThumbprint('jkt', this.jwk.thumbprint);

      const token = await at.save();

      await this.agent.post('/token/introspection')
        .auth('client', 'secret')
        .send({ token })
        .type('form')
        .expect(200)
        .expect(({ body }) => {
          expect(body).to.have.property('cnf');
          expect(body).to.have.property('token_type', 'DPoP');
          expect(body.cnf).to.have.property('jkt');
        });
    });
  });

  describe('urn:ietf:params:oauth:grant-type:device_code', () => {
    beforeEach(async function () {
      await this.agent.post('/device/auth')
        .auth('client', 'secret')
        .send({ scope: 'openid' })
        .type('form')
        .expect(200)
        .expect(({ body: { device_code: dc } }) => {
          this.dc = dc;
        });

      this.TestAdapter.for('DeviceCode').syncUpdate(this.getTokenJti(this.dc), {
        scope: 'openid offline_access',
        accountId: this.loggedInAccountId,
        grantId: this.getGrantId(),
      });
    });

    it('binds the access token to the jwk', async function () {
      const spy = sinon.spy();
      this.provider.once('grant.success', spy);

      await this.agent.post('/token')
        .auth('client', 'secret')
        .send({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.dc,
        })
        .type('form')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
        .expect(200);

      expect(spy).to.have.property('calledOnce', true);
      const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
      expect(AccessToken).to.have.property('jkt', expectedS256);
      expect(RefreshToken).not.to.have.property('jkt');
    });

    it('binds the refresh token to the jwk for public clients', async function () {
      const spy = sinon.spy();
      this.provider.once('grant.success', spy);

      // changes the code to client-none
      this.TestAdapter.for('DeviceCode').syncUpdate(this.getTokenJti(this.dc), {
        clientId: 'client-none',
        accountId: this.loggedInAccountId,
        grantId: this.getGrantId('client-none'),
      });

      await this.agent.post('/token')
        .send({
          client_id: 'client-none',
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.dc,
        })
        .type('form')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
        .expect(200);

      expect(spy).to.have.property('calledOnce', true);
      const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
      expect(AccessToken).to.have.property('jkt', expectedS256);
      expect(RefreshToken).to.have.property('jkt', expectedS256);
    });
  });

  describe('urn:openid:params:grant-type:ciba', () => {
    beforeEach(async function () {
      await this.agent.post('/backchannel')
        .auth('client', 'secret')
        .send({
          scope: 'openid offline_access',
          login_hint: 'accountId',
        })
        .type('form')
        .expect(200)
        .expect(({ body: { auth_req_id: reqId } }) => {
          this.reqId = reqId;
        });
    });

    it('binds the access token to the jwk', async function () {
      const spy = sinon.spy();
      this.provider.once('grant.success', spy);

      await this.agent.post('/token')
        .auth('client', 'secret')
        .send({
          grant_type: 'urn:openid:params:grant-type:ciba',
          auth_req_id: this.reqId,
        })
        .type('form')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
        .expect(200);

      expect(spy).to.have.property('calledOnce', true);
      const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
      expect(AccessToken).to.have.property('jkt', expectedS256);
      expect(RefreshToken).not.to.have.property('jkt');
    });

    it('binds the refresh token to the jwk for public clients', async function () {
      const spy = sinon.spy();
      this.provider.once('grant.success', spy);

      // changes the code to client-none
      this.TestAdapter.for('BackchannelAuthenticationRequest').syncUpdate(this.getTokenJti(this.reqId), {
        clientId: 'client-none',
      });
      const { grantId } = this.TestAdapter.for('BackchannelAuthenticationRequest').syncFind(this.getTokenJti(this.reqId));
      this.TestAdapter.for('Grant').syncUpdate(grantId, {
        clientId: 'client-none',
      });

      await this.agent.post('/token')
        .send({
          client_id: 'client-none',
          grant_type: 'urn:openid:params:grant-type:ciba',
          auth_req_id: this.reqId,
        })
        .type('form')
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
        .expect(200);

      expect(spy).to.have.property('calledOnce', true);
      const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
      expect(AccessToken).to.have.property('jkt', expectedS256);
      expect(RefreshToken).to.have.property('jkt', expectedS256);
    });
  });

  describe('pushed authorization request', () => {
    it('checks dpop_jkt equals the jwk thumbprint when both are present', async function () {
      await this.agent.post('/request')
        .auth('client', 'secret')
        .send({
          response_type: 'code',
          client_id: 'client',
          dpop_jkt: 'ZjEgWN6HnCZRssL1jRQHiJi6vlWXolM5Zba8FQBYONg',
        })
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/request')}`, 'POST'))
        .type('form')
        .expect(201);

      await this.agent.post('/request')
        .auth('client', 'secret')
        .send({
          response_type: 'code',
          client_id: 'client',
          dpop_jkt: 'cbaZgHZazjgQq0Q2-Hy_o2-OCDpPu02S30lNhTsNU1Q',
        })
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/request')}`, 'POST'))
        .type('form')
        .expect(400)
        .expect({ error: 'invalid_request', error_description: 'DPoP proof key thumbprint does not match dpop_jkt' });
    });

    it('sets the request dpop_jkt automatically when missing (no request object used)', async function () {
      let request_uri;
      await this.agent.post('/request')
        .auth('client', 'secret')
        .send({
          scope: 'openid',
          response_type: 'code',
          client_id: 'client',
        })
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/request')}`, 'POST'))
        .type('form')
        .expect(201)
        .expect(({ body }) => {
          ({ request_uri } = body);
        });

      const auth = new this.AuthorizationRequest({
        request_uri,
      });

      let code;
      await this.wrap({ route: '/auth', verb: 'get', auth })
        .expect(303)
        .expect(auth.validateClientLocation)
        .expect(({ headers: { location } }) => {
          ({ query: { code } } = url.parse(location, true));
        });

      const { dpopJkt } = this.TestAdapter.for('AuthorizationCode').syncFind(code);
      expect(dpopJkt).to.be.a('string').of.length(43);
    });

    it('sets the request dpop_jkt automatically when missing (request object used)', async function () {
      let request_uri;
      await this.agent.post('/request')
        .auth('client', 'secret')
        .send({
          client_id: 'client',
          request: JWT.sign({
            client_id: 'client',
            scope: 'openid',
            response_type: 'code',
            iss: 'client',
            aud: this.provider.issuer,
          }, this.key),
        })
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/request')}`, 'POST'))
        .type('form')
        .expect(201)
        .expect(({ body }) => {
          ({ request_uri } = body);
        });

      const auth = new this.AuthorizationRequest({
        request_uri,
      });

      let code;
      await this.wrap({ route: '/auth', verb: 'get', auth })
        .expect(303)
        .expect(auth.validateClientLocation)
        .expect(({ headers: { location } }) => {
          ({ query: { code } } = url.parse(location, true));
        });

      const { dpopJkt } = this.TestAdapter.for('AuthorizationCode').syncFind(code);
      expect(dpopJkt).to.be.a('string').of.length(43);
    });
  });

  describe('authorization flow', () => {
    describe('without dpop_jkt', () => {
      beforeEach(async function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'code',
          scope: 'openid offline_access',
          prompt: 'consent',
        });

        await this.wrap({ route: '/auth', verb: 'get', auth })
          .expect(303)
          .expect(auth.validateClientLocation)
          .expect(({ headers: { location } }) => {
            const { query: { code } } = url.parse(location, true);
            this.code = code;
          });
      });

      describe('authorization_code', () => {
        it('binds the access token to the jwk', async function () {
          const spy = sinon.spy();
          this.provider.once('grant.success', spy);

          await this.agent.post('/token')
            .auth('client', 'secret')
            .send({
              grant_type: 'authorization_code',
              code: this.code,
              redirect_uri: 'https://client.example.com/cb',
            })
            .type('form')
            .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
            .expect(200);

          expect(spy).to.have.property('calledOnce', true);
          const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
          expect(AccessToken).to.have.property('jkt', expectedS256);
          expect(RefreshToken).not.to.have.property('jkt');
        });
      });
    });

    describe('with dpop_jkt', () => {
      beforeEach(async function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'code',
          scope: 'openid offline_access',
          prompt: 'consent',
          dpop_jkt: this.jwk.thumbprint,
        });

        await this.wrap({ route: '/auth', verb: 'get', auth })
          .expect(303)
          .expect(auth.validateClientLocation)
          .expect(({ headers: { location } }) => {
            const { query: { code } } = url.parse(location, true);
            this.code = code;
          });
      });

      describe('authorization_code', () => {
        it('binds the access token to the jwk', async function () {
          const spy = sinon.spy();
          this.provider.once('grant.success', spy);

          await this.agent.post('/token')
            .auth('client', 'secret')
            .send({
              grant_type: 'authorization_code',
              code: this.code,
              redirect_uri: 'https://client.example.com/cb',
            })
            .type('form')
            .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
            .expect(200);

          expect(spy).to.have.property('calledOnce', true);
          const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
          expect(AccessToken).to.have.property('jkt', expectedS256);
          expect(RefreshToken).not.to.have.property('jkt');
        });

        it('checks the dpop_jkt matches the proof jwk thumbprint', async function () {
          const spy = sinon.spy();
          this.provider.once('grant.error', spy);

          await this.agent.post('/token')
            .auth('client', 'secret')
            .send({
              grant_type: 'authorization_code',
              code: this.code,
              redirect_uri: 'https://client.example.com/cb',
            })
            .type('form')
            .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST', undefined, JWK.generateSync('EC')))
            .expect(400)
            .expect({ error: 'invalid_grant', error_description: 'grant request is invalid' });

          expect(spy).to.have.property('calledOnce', true);
          expect(spy.args[0][1]).to.have.property('error_detail', 'DPoP proof key thumbprint does not match dpop_jkt');
        });

        it('requires dpop to be used when dpop_jkt was present', async function () {
          const spy = sinon.spy();
          this.provider.once('grant.error', spy);

          await this.agent.post('/token')
            .auth('client', 'secret')
            .send({
              grant_type: 'authorization_code',
              code: this.code,
              redirect_uri: 'https://client.example.com/cb',
            })
            .type('form')
            .expect(400)
            .expect({ error: 'invalid_grant', error_description: 'grant request is invalid' });

          expect(spy).to.have.property('calledOnce', true);
          expect(spy.args[0][1]).to.have.property('error_detail', 'missing DPoP proof JWT');
        });
      });
    });

    describe('refresh_token', () => {
      beforeEach(async function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'code',
          scope: 'openid offline_access',
          prompt: 'consent',
        });

        await this.wrap({ route: '/auth', verb: 'get', auth })
          .expect(303)
          .expect(auth.validateClientLocation)
          .expect(({ headers: { location } }) => {
            const { query: { code } } = url.parse(location, true);
            this.code = code;
          });

        await this.agent.post('/token')
          .auth('client', 'secret')
          .send({
            grant_type: 'authorization_code',
            code: this.code,
            redirect_uri: 'https://client.example.com/cb',
          })
          .type('form')
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
          .expect(({ body }) => {
            this.rt = body.refresh_token;
          });
      });

      it('binds the access token to the jwk', async function () {
        const spy = sinon.spy();
        this.provider.once('grant.success', spy);

        await this.agent.post('/token')
          .auth('client', 'secret')
          .send({
            grant_type: 'refresh_token',
            refresh_token: this.rt,
          })
          .type('form')
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
          .expect(200);

        expect(spy).to.have.property('calledOnce', true);
        const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
        expect(AccessToken).to.have.property('jkt', expectedS256);
        expect(RefreshToken.jkt).to.be.undefined;
      });
    });
  });

  describe('authorization flow (public client)', () => {
    beforeEach(async function () {
      const auth = new this.AuthorizationRequest({
        client_id: 'client-none',
        response_type: 'code',
        scope: 'openid offline_access',
        prompt: 'consent',
      });

      await this.wrap({ route: '/auth', verb: 'get', auth })
        .expect(303)
        .expect(auth.validateClientLocation)
        .expect(({ headers: { location } }) => {
          const { query: { code } } = url.parse(location, true);
          this.code = code;
        });
    });

    describe('authorization_code', () => {
      it('binds the access token to the jwk', async function () {
        const spy = sinon.spy();
        this.provider.once('grant.success', spy);

        await this.agent.post('/token')
          .send({
            client_id: 'client-none',
            grant_type: 'authorization_code',
            code: this.code,
            redirect_uri: 'https://client.example.com/cb',
          })
          .type('form')
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
          .expect(200);

        expect(spy).to.have.property('calledOnce', true);
        const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
        expect(AccessToken).to.have.property('jkt', expectedS256);
        expect(RefreshToken).to.have.property('jkt', expectedS256);
      });
    });

    describe('refresh_token', () => {
      beforeEach(async function () {
        await this.agent.post('/token')
          .send({
            client_id: 'client-none',
            grant_type: 'authorization_code',
            code: this.code,
            redirect_uri: 'https://client.example.com/cb',
          })
          .type('form')
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
          .expect(({ body }) => {
            this.rt = body.refresh_token;
          });
      });

      it('binds the access token to the jwk', async function () {
        const spy = sinon.spy();
        this.provider.once('grant.success', spy);

        await this.agent.post('/token')
          .send({
            client_id: 'client-none',
            grant_type: 'refresh_token',
            refresh_token: this.rt,
          })
          .type('form')
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
          .expect(200);

        expect(spy).to.have.property('calledOnce', true);
        const { oidc: { entities: { AccessToken, RefreshToken } } } = spy.args[0][0];
        expect(AccessToken).to.have.property('jkt', expectedS256);
        expect(RefreshToken).to.have.property('jkt', expectedS256);
      });

      it('verifies the request made with the same cert jwk', async function () {
        const spy = sinon.spy();
        this.provider.once('grant.error', spy);

        const anotherJWK = JWK.generateSync('EC');
        await this.agent.post('/token')
          .send({
            client_id: 'client-none',
            grant_type: 'refresh_token',
            refresh_token: this.rt,
          })
          .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST', undefined, anotherJWK))
          .type('form')
          .expect(400)
          .expect({ error: 'invalid_grant', error_description: 'grant request is invalid' });

        expect(spy).to.have.property('calledOnce', true);
        expect(spy.args[0][1]).to.have.property('error_detail', 'failed jkt verification');
      });
    });
  });

  describe('client_credentials', () => {
    it('binds the access token to the jwk', async function () {
      const spy = sinon.spy();
      this.provider.once('grant.success', spy);

      await this.agent.post('/token')
        .auth('client', 'secret')
        .send({ grant_type: 'client_credentials' })
        .set('DPoP', this.proof(`${this.provider.issuer}${this.suitePath('/token')}`, 'POST'))
        .type('form')
        .expect(200);

      expect(spy).to.have.property('calledOnce', true);
      const { oidc: { entities: { ClientCredentials } } } = spy.args[0][0];
      expect(ClientCredentials).to.have.property('jkt', expectedS256);
    });
  });

  describe('status codes at the token endpoint', () => {
    it('should be 400 for invalid_dpop_proof', async function () {
      return this.agent.post('/token')
        .auth('client', 'secret')
        .send({ grant_type: 'client_credentials' })
        .set('DPoP', 'invalid')
        .type('form')
        .expect(400)
        .expect({ error: 'invalid_dpop_proof', error_description: 'invalid DPoP key binding' });
    });
  });
});
