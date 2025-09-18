import getConfig from '../../default.config.js';

const config = getConfig();

// Enable relaxImplicitGrantRequirement for testing the runtime validation for the presence of the implicit grant type when a 'token' response_type is used.
// In the absence of runtime validation, the gap was that clients could register with 'token' response types without having the implicit grant type,
// and then successfully use those response types at runtime, which is a privilege escalation issue.
// With relaxImplicitGrantRequirement=true, the registration is allowed, but we still need to enforce the implicit grant type requirement at runtime.
config.relaxImplicitGrantRequirement = true;

export default {
  config,
  clients: [{
    // Standard client for normal implicit flows
    client_id: 'client',
    client_secret: 'secret',
    grant_types: ['implicit', 'authorization_code'],
    response_types: ['id_token', 'id_token token', 'code token', 'none'],
    redirect_uris: ['https://client.example.com/cb'],
  }, {
    // Client for testing relaxImplicitGrantRequirement - no implicit grant but has id_token token response type
    // This registration should succeed due to relaxImplicitGrantRequirement=true
    // But runtime token issuance should fail due to our new validation
    client_id: 'client-no-implicit',
    client_secret: 'secret',
    grant_types: ['authorization_code'],  // Note: no 'implicit' grant
    response_types: ['id_token token', 'code'],
    redirect_uris: ['https://client.example.com/cb'],
  }, {
    // Normal client with implicit grant for comparison tests
    client_id: 'client-with-implicit',
    client_secret: 'secret',
    grant_types: ['implicit', 'authorization_code'],
    response_types: ['id_token token', 'code'],
    redirect_uris: ['https://client.example.com/cb'],
  }],
};