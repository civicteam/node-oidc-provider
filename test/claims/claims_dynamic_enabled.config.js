import getConfig from '../default.config.js';

const config = getConfig();

// Enable dynamic claims
config.allowDynamicClaims = true;

// Define static claims
config.claims = {
  openid: ['sub'],
  email: ['email'],
  profile: ['name', 'family_name'],
};

export default {
  config,
  clients: [
    {
      client_id: 'client',
      client_secret: 'secret',
      grant_types: ['authorization_code', 'implicit'],
      response_types: ['code', 'id_token', 'id_token token'],
      redirect_uris: ['https://client.example.com/cb'],
    },
  ],
};