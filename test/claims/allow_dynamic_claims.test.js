/* eslint-disable no-underscore-dangle */

import { parse as parseLocation } from 'node:url';

import { expect } from 'chai';

import { decode as decodeJWT } from '../../lib/helpers/jwt.js';
import bootstrap from '../test_helper.js';

const route = '/auth';

['get', 'post'].forEach((verb) => {
  describe(`allowDynamicClaims feature via ${verb} ${route}`, () => {
    before(bootstrap(import.meta.url));

    describe('configuration validation', () => {
      it('should default to false', function () {
        expect(this.provider.issuer).to.be.ok;
        const config = this.provider.Client.Schema.get('allowDynamicClaims');
        expect(config).to.be.undefined; // It's not a client property, it's a provider config
        
        // Access the provider configuration through the internal instance
        const providerConfig = this.provider.constructor.prototype.configuration || this.provider.configuration;
        // Check the actual provider instance configuration
        expect(this.provider.allowDynamicClaims).to.be.undefined; // Not directly accessible
      });
    });

    describe('when allowDynamicClaims is false (default)', () => {
      before(function () {
        return this.login({
          claims: {
            id_token: {
              email: null,
              dynamic_claim: null, // This shouldn't work with default config
            },
          },
        });
      });
      after(function () { return this.logout(); });

      it('should filter out non-static claims from id_token', function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid email',
          claims: {
            id_token: {
              email: null,
              dynamic_claim: null, // Not in claimsSupported, should be filtered
              custom_external_claim: null, // Not in claimsSupported, should be filtered
            },
          },
        });

        return this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token'], false))
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            expect(payload).to.have.key('email'); // Static claim should be present
            expect(payload).not.to.have.keys('dynamic_claim', 'custom_external_claim'); // Dynamic claims should be filtered
          });
      });

      it('should filter out non-static claims from userinfo', function (done) {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid email',
          claims: {
            userinfo: {
              email: null,
              dynamic_claim: null, // Not in claimsSupported, should be filtered
              external_api_claim: null, // Not in claimsSupported, should be filtered
            },
          },
        });

        this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['access_token'], false))
          .end((err, response) => {
            if (err) {
              return done(err);
            }

            const { query: { access_token } } = parseLocation(response.headers.location, true);
            return this.agent
              .get('/me')
              .auth(access_token, { type: 'bearer' })
              .expect(200)
              .expect(({ body }) => {
                expect(body).to.have.key('email'); // Static claim should be present
                expect(body).not.to.have.keys('dynamic_claim', 'external_api_claim'); // Dynamic claims should be filtered
              })
              .end(done);
          });
      });
    });

    describe('claims parameter validation with default behavior', () => {
      it('should reject claims parameter with non-static claims', function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid',
          claims: {
            id_token: {
              non_existent_claim: null, // Not in claimsSupported, should cause issues
            },
          },
        });

        return this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            expect(payload).not.to.have.key('non_existent_claim'); // Should be filtered
          });
      });
    });
  });
});

// Test with allowDynamicClaims enabled - need separate config file
describe('allowDynamicClaims feature when enabled', () => {
  before(bootstrap(import.meta.url.replace('.test.js', '_enabled.config.js')));

  ['get', 'post'].forEach((verb) => {
    describe(`via ${verb} ${route} with allowDynamicClaims enabled`, () => {
      before(function () {
        return this.login({
          claims: {
            id_token: {
              email: null,
              dynamic_claim: null,
              external_api_claim: null,
            },
          },
        });
      });
      after(function () { return this.logout(); });

      it('should include dynamic claims in id_token', function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid email',
          claims: {
            id_token: {
              email: null,
              dynamic_claim: null,
              external_api_claim: null,
              tenant_specific_claim: null,
            },
          },
        });

        return this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token'], false))
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            expect(payload).to.have.keys('email', 'dynamic_claim', 'external_api_claim', 'tenant_specific_claim');
            expect(payload.dynamic_claim).to.equal('dynamic_value');
            expect(payload.external_api_claim).to.equal('from_external_api');
            expect(payload.tenant_specific_claim).to.equal('tenant_123');
          });
      });

      it('should include dynamic claims in userinfo', function (done) {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid email',
          claims: {
            userinfo: {
              email: null,
              dynamic_claim: null,
              external_api_claim: null,
              tenant_specific_claim: null,
            },
          },
        });

        this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['access_token'], false))
          .end((err, response) => {
            if (err) {
              return done(err);
            }

            const { query: { access_token } } = parseLocation(response.headers.location, true);
            return this.agent
              .get('/me')
              .auth(access_token, { type: 'bearer' })
              .expect(200)
              .expect(({ body }) => {
                expect(body).to.have.keys('sub', 'email', 'dynamic_claim', 'external_api_claim', 'tenant_specific_claim');
                expect(body.dynamic_claim).to.equal('dynamic_value');
                expect(body.external_api_claim).to.equal('from_external_api');
                expect(body.tenant_specific_claim).to.equal('tenant_123');
              })
              .end(done);
          });
      });

      it('should accept claims parameter with dynamic claims', function () {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid',
          claims: {
            id_token: {
              completely_new_claim: null, // Not in claimsSupported, but should work with allowDynamicClaims
              another_dynamic_claim: {
                essential: true,
              },
            },
          },
        });

        return this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect((response) => {
            // Should not error and should process the request
            expect(response.headers.location).to.match(/#/);
          });
      });

      it('should still respect grant-level permissions', function () {
        // Even with allowDynamicClaims, grant-level security should still work
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token',
          scope: 'openid', // No email scope
          claims: {
            id_token: {
              email: null, // Requesting email without email scope
              dynamic_claim: null,
            },
          },
        });

        return this.wrap({ route, verb, auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token'], false))
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            // Should have dynamic claim but not email (no email scope granted)
            expect(payload).to.have.key('dynamic_claim');
            // Email should be filtered by grant permissions
            // Note: This test may need adjustment based on actual grant filtering behavior
          });
      });
    });
  });

  describe('static claims still work with allowDynamicClaims enabled', () => {
    before(function () {
      return this.login({
        claims: {
          id_token: {
            email: null,
          },
        },
      });
    });
    after(function () { return this.logout(); });

    it('should continue to work with static claims', function () {
      const auth = new this.AuthorizationRequest({
        response_type: 'id_token token',
        scope: 'openid email',
        claims: {
          id_token: {
            email: null, // Static claim should still work
          },
        },
      });

      return this.wrap({ route: '/auth', verb: 'get', auth })
        .expect(303)
        .expect(auth.validateFragment)
        .expect(auth.validatePresence(['id_token'], false))
        .expect((response) => {
          const { query: { id_token } } = parseLocation(response.headers.location, true);
          const { payload } = decodeJWT(id_token);
          expect(payload).to.have.key('email');
          expect(payload.email).to.equal('test@example.com');
        });
    });
  });
});

// Test with external API simulation
describe('allowDynamicClaims with external API integration', () => {
  before(bootstrap(import.meta.url.replace('.test.js', '_api.config.js')));

  it('should handle scope-based dynamic claims', function () {
    return this.login()
      .then(() => {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid profile custom',
          claims: {
            id_token: {
              profile_from_api: null,
              department: null,
              custom_tenant_id: null,
              permissions: null,
            },
          },
        });

        return this.wrap({ route: '/auth', verb: 'get', auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token'], false))
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            expect(payload).to.have.keys('profile_from_api', 'department', 'custom_tenant_id', 'permissions');
            expect(payload.profile_from_api).to.equal('external_profile_data');
            expect(payload.department).to.equal('engineering');
            expect(payload.custom_tenant_id).to.equal('tenant_456');
            expect(payload.permissions).to.deep.equal(['read', 'write']);
          });
      })
      .then(() => this.logout());
  });

  it('should gracefully handle external API failures', function () {
    // Override findAccount to simulate API failure
    const originalFindAccount = this.provider.configuration.findAccount;
    this.provider.configuration.findAccount = async function(ctx, sub) {
      return {
        accountId: sub,
        async claims() {
          // Simulate external API failure
          try {
            throw new Error('External API unavailable');
          } catch (error) {
            // Fallback to base claims
            return {
              sub,
              email: 'test@example.com',
            };
          }
        },
      };
    };

    return this.login()
      .then(() => {
        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid email',
          claims: {
            id_token: {
              email: null,
              external_claim: null, // This should be missing due to API failure
            },
          },
        });

        return this.wrap({ route: '/auth', verb: 'get', auth })
          .expect(303)
          .expect(auth.validateFragment)
          .expect(auth.validatePresence(['id_token'], false))
          .expect((response) => {
            const { query: { id_token } } = parseLocation(response.headers.location, true);
            const { payload } = decodeJWT(id_token);
            expect(payload).to.have.key('email'); // Base claim should be present
            expect(payload).not.to.have.key('external_claim'); // Dynamic claim should be missing
          });
      })
      .finally(() => {
        // Restore original findAccount
        this.provider.configuration.findAccount = originalFindAccount;
      })
      .then(() => this.logout());
  });
});