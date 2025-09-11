import merge from 'lodash/merge.js';

import getConfig from '../default.config.js';

const config = getConfig();

// Enable claims parameter feature for testing (same as working claims.config.js)
merge(config.features, { claimsParameter: { enabled: true } });

// Enable dynamic claims - this is the only new addition
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

// Don't override findAccount - use the default test Account
// This will use the test framework's Account.findAccount method
// We'll modify the Account claims in the test instead

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