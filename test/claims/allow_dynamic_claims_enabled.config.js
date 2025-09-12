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

// Override findAccount to return dynamic claims
config.findAccount = async function(ctx, sub) {
  return {
    accountId: sub,
    async claims() {
      return {
        sub,
        email: 'test@example.com',
        name: 'Test User',
        // Return dynamic claims that aren't in static configuration
        dynamic_claim: 'dynamic_value',
        external_api_claim: 'from_external_api',
        tenant_specific_claim: 'tenant_123',
      };
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