import { expect } from 'chai';

import Provider from '../../lib/index.js';
import instance from '../../lib/helpers/weak_cache.js';
import bootstrap from '../test_helper.js';

describe('allowDynamicClaims basic functionality', () => {
  describe('when allowDynamicClaims is false (default)', () => {
    before(bootstrap(import.meta.url, { config: 'claims_dynamic' }));

    it('should filter out dynamic claims from Claims helper', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        dynamic_claim: 'should_be_filtered',
        external_api_claim: 'also_filtered',
      };

      const claims = new Claims(availableClaims, { client });
      
      // Mask specific claims
      claims.mask({
        sub: null,
        email: null,
        dynamic_claim: null,
        external_api_claim: null,
      });
      
      const result = await claims.result();

      // Should only include static claims
      expect(result).to.have.keys('sub', 'email');
      expect(result).not.to.have.keys('dynamic_claim', 'external_api_claim');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
    });
  });

  describe('when allowDynamicClaims is true', () => {
    before(bootstrap(import.meta.url, { config: 'claims_dynamic_enabled' }));

    it('should include dynamic claims from Claims helper', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        dynamic_claim: 'dynamic_value',
        external_api_claim: 'from_api',
        tenant_specific: 'tenant_data',
      };

      const claims = new Claims(availableClaims, { client });
      
      // Mask specific claims including dynamic ones
      claims.mask({
        sub: null,
        email: null,
        dynamic_claim: null,
        external_api_claim: null,
        tenant_specific: null,
      });
      
      const result = await claims.result();

      // Should include both static and dynamic claims
      expect(result).to.have.keys('sub', 'email', 'dynamic_claim', 'external_api_claim', 'tenant_specific');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.dynamic_claim).to.equal('dynamic_value');
      expect(result.external_api_claim).to.equal('from_api');
      expect(result.tenant_specific).to.equal('tenant_data');
    });
  });

  describe('OIDCContext claims parameter validation', () => {
    it('should filter dynamic claims when allowDynamicClaims is false', () => {
      const provider = new Provider('https://op.example.com', {
        allowDynamicClaims: false,
        claims: {
          openid: ['sub'],
          email: ['email'],
        },
      });

      // Create a mock context with claims parameter
      const mockCtx = {
        oidc: {
          provider,
        },
      };

      const oidcContext = new provider.OIDCContext(mockCtx);
      // Set the params directly on the oidcContext
      oidcContext.params = {
        claims: JSON.stringify({
          id_token: {
            email: null,
            dynamic_claim: null, // Should be filtered
            external_claim: null, // Should be filtered
          },
        }),
      };
      const requestParamClaims = oidcContext.requestParamClaims;

      // Should only include static claims
      expect([...requestParamClaims]).to.include('email');
      expect([...requestParamClaims]).not.to.include('dynamic_claim');
      expect([...requestParamClaims]).not.to.include('external_claim');
    });

    it('should include dynamic claims when allowDynamicClaims is true', () => {
      const provider = new Provider('https://op.example.com', {
        allowDynamicClaims: true,
        claims: {
          openid: ['sub'],
          email: ['email'],
        },
      });

      // Create a mock context with claims parameter
      const mockCtx = {
        oidc: {
          provider,
        },
      };

      const oidcContext = new provider.OIDCContext(mockCtx);
      // Set the params directly on the oidcContext
      oidcContext.params = {
        claims: JSON.stringify({
          id_token: {
            email: null,
            dynamic_claim: null, // Should be included
            external_claim: null, // Should be included
          },
        }),
      };
      const requestParamClaims = oidcContext.requestParamClaims;

      // Should include both static and dynamic claims
      expect([...requestParamClaims]).to.include('email');
      expect([...requestParamClaims]).to.include('dynamic_claim');
      expect([...requestParamClaims]).to.include('external_claim');
    });
  });

  describe('Configuration inheritance and defaults', () => {
    it('should default to false when not specified', () => {
      const provider = new Provider('https://op.example.com', {
        claims: {
          openid: ['sub'],
        },
      });

      // Access the configuration via internal API
      const config = instance(provider).configuration;
      expect(config.allowDynamicClaims).to.equal(false);
    });

    it('should respect explicit true setting', () => {
      const provider = new Provider('https://op.example.com', {
        allowDynamicClaims: true,
        claims: {
          openid: ['sub'],
        },
      });

      const config = instance(provider).configuration;
      expect(config.allowDynamicClaims).to.equal(true);
    });

    it('should respect explicit false setting', () => {
      const provider = new Provider('https://op.example.com', {
        allowDynamicClaims: false,
        claims: {
          openid: ['sub'],
        },
      });

      const config = instance(provider).configuration;
      expect(config.allowDynamicClaims).to.equal(false);
    });
  });
});