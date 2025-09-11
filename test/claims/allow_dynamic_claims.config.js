import merge from 'lodash/merge.js';

import getConfig from '../default.config.js';

const config = getConfig();

// Enable claims parameter feature for testing
merge(config.features, { claimsParameter: { enabled: true } });

// Add some scopes for testing
config.scopes = new Set(['openid', 'email', 'profile', 'custom']);

// Explicitly disable dynamic claims for this test (default behavior)
config.allowDynamicClaims = false;

// Define static claims that are always supported
config.claims = {
  openid: ['sub'],
  email: ['email'],
  profile: ['name', 'given_name', 'family_name'],
  custom: [], // Empty but scope exists
};

// Override findAccount to include the dynamic claims for testing
config.findAccount = async function(_ctx, sub) {
  return {
    accountId: sub,
    claims(_use, _scope, _claimsParam, _rejected) {
      return {
        sub,
        email: 'johndoe@example.com',
        email_verified: false,
        name: 'John Doe',
        given_name: 'John',
        family_name: 'Doe',
        // Include dynamic claims for testing (these will be filtered when allowDynamicClaims is false)
        dynamic_claim: 'dynamic_value',
        custom_external_claim: 'external_value',
        external_api_claim: 'api_value',
        non_existent_claim: 'non_existent_value',
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