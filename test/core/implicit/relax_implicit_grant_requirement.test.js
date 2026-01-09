import { expect } from 'chai';
import bootstrap from '../../test_helper.js';

const route = '/auth';

describe('relaxImplicitGrantRequirement runtime validation', () => {
  before(bootstrap(import.meta.url, { config: 'relax_implicit_grant_requirement' }));
  afterEach(function () {
    this.provider.removeAllListeners();
  });

  // First verify the configuration is loaded correctly
  it('should have relaxImplicitGrantRequirement enabled', function () {
    const { configuration } = i(this.provider);
    expect(configuration.relaxImplicitGrantRequirement).to.be.true;
  });

  // Test client registration works with our configuration
  it('should allow clients to register with token response_type but no implicit grant', async function () {
    const client = await this.provider.Client.find('client-no-implicit');
    expect(client).to.exist;
    expect(client.grantTypes).to.deep.equal(['authorization_code']);
    expect(client.responseTypes).to.include('id_token token');
  });

  describe('when relaxImplicitGrantRequirement is enabled', () => {
    describe('client with token response_type but no implicit grant_type', () => {
      before(function () { return this.login(); });

      // When relaxImplicitGrantRequirement is enabled, clients can register with 'token'
      // response types without having 'implicit' in their grant_types. However, we still
      // need to prevent them from actually receiving implicit tokens at runtime if they
      // don't have the implicit grant type - this prevents privilege escalation.
      it('should reject id_token token response_type when client lacks implicit grant', async function () {
        // First verify our client setup
        const client = await this.provider.Client.find('client-no-implicit');
        expect(client.grantTypeAllowed('implicit')).to.be.false;
        expect(client.responseTypes).to.include('id_token token');

        const auth = new this.AuthorizationRequest({
          response_type: 'id_token token',
          scope: 'openid',
          client_id: 'client-no-implicit'
        });

        await this.wrap({ route, verb: 'get', auth })
          .expect(303)
          .expect((response) => {
            // For implicit flow, errors are returned in the fragment part of the redirect URL
            const url = new URL(response.headers.location);
            const fragmentParams = new URLSearchParams(url.hash?.replace('#', '') || '');
            expect(fragmentParams.get('error')).to.equal('invalid_grant');
            expect(fragmentParams.get('error_description')).to.equal('grant request is invalid');
          });
      });
    });
  });
});