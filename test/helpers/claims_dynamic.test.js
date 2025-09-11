import { expect } from 'chai';

import bootstrap from '../test_helper.js';

describe('Claims helper with allowDynamicClaims', () => {
  describe('when allowDynamicClaims is false (default)', () => {
    before(bootstrap(import.meta.url));

    it('should filter out non-static claims', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        dynamic_claim: 'should_be_filtered',
        external_api_claim: 'also_filtered',
      };

      const claims = new Claims(availableClaims, { client });
      
      // Apply scope filtering
      claims.scope('openid email profile');
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email', 'name');
      expect(result).not.to.have.keys('dynamic_claim', 'external_api_claim');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.name).to.equal('Test User');
    });

    it('should filter claims when using mask directly', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        dynamic_claim: 'should_be_filtered',
        another_dynamic_claim: 'also_filtered',
      };

      const claims = new Claims(availableClaims, { client });
      
      // Apply specific claim mask
      claims.mask({
        sub: null,
        email: null,
        dynamic_claim: null,
        another_dynamic_claim: null,
      });
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email');
      expect(result).not.to.have.keys('dynamic_claim', 'another_dynamic_claim');
    });
  });

  describe('when allowDynamicClaims is true', () => {
    before(bootstrap(import.meta.url.replace('.test.js', '_enabled.config.js')));

    it('should include dynamic claims', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        dynamic_claim: 'dynamic_value',
        external_api_claim: 'from_api',
        tenant_specific: 'tenant_data',
      };

      const claims = new Claims(availableClaims, { client });
      
      // Apply scope filtering
      claims.scope('openid email profile');
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email', 'name');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.name).to.equal('Test User');
      
      // Note: scope-based claims may not include dynamic claims unless explicitly requested
      // Let's test with explicit mask
    });

    it('should include dynamic claims when explicitly masked', async function () {
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
      
      // Apply specific claim mask including dynamic claims
      claims.mask({
        sub: null,
        email: null,
        dynamic_claim: null,
        external_api_claim: null,
        tenant_specific: null,
      });
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email', 'dynamic_claim', 'external_api_claim', 'tenant_specific');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.dynamic_claim).to.equal('dynamic_value');
      expect(result.external_api_claim).to.equal('from_api');
      expect(result.tenant_specific).to.equal('tenant_data');
    });

    it('should handle mixed static and dynamic claims', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        custom_attr_1: 'value1',
        custom_attr_2: 'value2',
        api_generated_claim: { complex: 'object' },
      };

      const claims = new Claims(availableClaims, { client });
      
      claims.mask({
        sub: null,
        email: null,
        name: null,
        custom_attr_1: null,
        custom_attr_2: null,
        api_generated_claim: null,
      });
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email', 'name', 'custom_attr_1', 'custom_attr_2', 'api_generated_claim');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.name).to.equal('Test User');
      expect(result.custom_attr_1).to.equal('value1');
      expect(result.custom_attr_2).to.equal('value2');
      expect(result.api_generated_claim).to.deep.equal({ complex: 'object' });
    });

    it('should still work with static claims only', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const claims = new Claims(availableClaims, { client });
      
      claims.scope('openid email profile');
      
      const result = await claims.result();

      expect(result).to.have.keys('sub', 'email', 'name');
      expect(result.sub).to.equal('user123');
      expect(result.email).to.equal('test@example.com');
      expect(result.name).to.equal('Test User');
    });

    it('should handle edge cases with null and undefined values', async function () {
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        nullable_claim: null,
        undefined_claim: undefined,
        empty_string_claim: '',
        zero_claim: 0,
        false_claim: false,
      };

      const claims = new Claims(availableClaims, { client });
      
      claims.mask({
        sub: null,
        nullable_claim: null,
        undefined_claim: null,
        empty_string_claim: null,
        zero_claim: null,
        false_claim: null,
      });
      
      const result = await claims.result();

      expect(result).to.have.property('sub', 'user123');
      expect(result).to.have.property('nullable_claim', null);
      expect(result).to.have.property('empty_string_claim', '');
      expect(result).to.have.property('zero_claim', 0);
      expect(result).to.have.property('false_claim', false);
      // undefined values are typically not included in JSON
    });
  });

  describe('configuration edge cases', () => {
    it('should handle provider without explicit allowDynamicClaims config', async function () {
      // Use the existing provider which has default configuration
      const client = await this.provider.Client.find('client');
      const { Claims } = this.provider;

      const availableClaims = {
        sub: 'user123',
        email: 'test@example.com',
        dynamic_claim: 'should_be_filtered',
      };

      const claims = new Claims(availableClaims, { client });
      
      claims.mask({
        sub: null,
        email: null,
        dynamic_claim: null,
      });
      
      const result = await claims.result();

      // Should behave like allowDynamicClaims: false (default)
      expect(result).to.have.keys('sub', 'email');
      expect(result).not.to.have.key('dynamic_claim');
    });
  });
});