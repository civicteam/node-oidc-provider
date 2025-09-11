import merge from 'lodash/merge.js';

import getConfig from '../default.config.js';

const config = getConfig();

// Enable claims parameter feature for testing
merge(config.features, { claimsParameter: { enabled: true } });

// Enable dynamic claims
config.allowDynamicClaims = true;

// Add some scopes for testing
config.scopes = new Set(['openid', 'email', 'profile', 'custom']);

// Define static claims that are always supported
config.claims = {
  openid: ['sub'],
  email: ['email'],
  profile: ['name', 'given_name', 'family_name'],
  custom: [], // Empty but scope exists
};

// Override findAccount to simulate external API integration
config.findAccount = async function(_ctx, sub) {
  return {
    accountId: sub,
    async claims(_use, scope) {
      const baseClaims = {
        sub,
        email: 'test@example.com',
      };

      // Simulate external API call based on scope
      const externalClaims = {};
      if (scope.includes('profile')) {
        externalClaims.profile_from_api = 'external_profile_data';
        externalClaims.department = 'engineering';
      }
      if (scope.includes('custom')) {
        externalClaims.custom_tenant_id = 'tenant_456';
        externalClaims.permissions = ['read', 'write'];
      }

      return { ...baseClaims, ...externalClaims };
    },
  };
};

export default {
  config,
  clients: [
    {
      client_id: 'client',
      client_secret: 'secret',
      grant_types: ['implicit', 'authorization_code'],
      response_types: ['id_token token', 'id_token', 'code', 'none'],
      redirect_uris: ['https://client.example.com/cb'],
    },
  ],
};