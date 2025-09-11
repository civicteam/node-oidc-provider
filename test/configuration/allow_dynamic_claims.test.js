import { expect } from 'chai';

import Configuration from '../../lib/helpers/configuration.js';
import getDefaults from '../../lib/helpers/defaults.js';

describe('allowDynamicClaims configuration', () => {
  it('should have default value of false', () => {
    const defaults = getDefaults();
    expect(defaults.allowDynamicClaims).to.equal(false);
  });

  it('should accept boolean true', () => {
    const config = new Configuration({
      allowDynamicClaims: true,
    });
    expect(config.allowDynamicClaims).to.equal(true);
  });

  it('should accept boolean false', () => {
    const config = new Configuration({
      allowDynamicClaims: false,
    });
    expect(config.allowDynamicClaims).to.equal(false);
  });

  it('should use default when not specified', () => {
    const config = new Configuration({});
    expect(config.allowDynamicClaims).to.equal(false);
  });

  it('should accept non-boolean values (no validation)', () => {
    // The configuration system doesn't validate basic property types
    // This is consistent with other configuration properties
    const config1 = new Configuration({
      allowDynamicClaims: 'true',
    });
    expect(config1.allowDynamicClaims).to.equal('true');

    const config2 = new Configuration({
      allowDynamicClaims: 1,
    });
    expect(config2.allowDynamicClaims).to.equal(1);

    const config3 = new Configuration({
      allowDynamicClaims: null,
    });
    expect(config3.allowDynamicClaims).to.equal(null);
  });

  it('should work with other configuration options', () => {
    const config = new Configuration({
      allowDynamicClaims: true,
      issuer: 'https://op.example.com',
      features: {
        claimsParameter: { enabled: true },
        userinfo: { enabled: true },
      },
      claims: {
        openid: ['sub'],
        email: ['email'],
      },
    });

    expect(config.allowDynamicClaims).to.equal(true);
    expect(config.features.claimsParameter.enabled).to.equal(true);
    expect(config.features.userinfo.enabled).to.equal(true);
  });

  it('should not affect claimsSupported when disabled', () => {
    const config = new Configuration({
      allowDynamicClaims: false,
      claims: {
        openid: ['sub'],
        email: ['email'],
        profile: ['name', 'family_name'],
      },
    });

    expect(config.allowDynamicClaims).to.equal(false);
    expect(config.claimsSupported.has('sub')).to.equal(true);
    expect(config.claimsSupported.has('email')).to.equal(true);
    expect(config.claimsSupported.has('name')).to.equal(true);
    expect(config.claimsSupported.has('family_name')).to.equal(true);
    expect(config.claimsSupported.has('non_existent')).to.equal(false);
  });

  it('should not affect claimsSupported when enabled', () => {
    const config = new Configuration({
      allowDynamicClaims: true,
      claims: {
        openid: ['sub'],
        email: ['email'],
        profile: ['name', 'family_name'],
      },
    });

    expect(config.allowDynamicClaims).to.equal(true);
    // claimsSupported should still be computed normally
    expect(config.claimsSupported.has('sub')).to.equal(true);
    expect(config.claimsSupported.has('email')).to.equal(true);
    expect(config.claimsSupported.has('name')).to.equal(true);
    expect(config.claimsSupported.has('family_name')).to.equal(true);
    expect(config.claimsSupported.has('non_existent')).to.equal(false);
  });
});