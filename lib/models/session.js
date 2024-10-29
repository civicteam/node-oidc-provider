/* eslint-disable prefer-rest-params */

import nanoid from '../helpers/nanoid.js';
import epochTime from '../helpers/epoch_time.js';
import instance from '../helpers/weak_cache.js';
import * as ssHandler from '../helpers/samesite_handler.js';
import * as JWT from '../helpers/jwt.js';

import hasFormat from './mixins/has_format.js';

export default (provider) => class Session extends hasFormat(provider, 'Session', instance(provider).BaseModel) {
  constructor(payload) {
    super(payload);
    if (!payload) {
      Object.defineProperty(this, 'new', { value: true });
    }
    this.uid = this.uid || nanoid();
    this.jti = this.jti || nanoid();
  }

  get id() {
    return this.jti;
  }

  set id(value) {
    this.jti = value;
  }

  static get IN_PAYLOAD() {
    return [
      ...super.IN_PAYLOAD,
      'uid',
      'acr',
      'amr',
      'accountId',
      'loginTs',
      'transient',
      'state',
      'authorizations',
    ];
  }

  static async findByUid(uid) {
    const stored = await this.adapter.findByUid(uid);
    if (!stored) {
      return undefined;
    }
    try {
      const payload = await this.verify(stored);
      return this.instantiate(payload);
    } catch (err) {
      return undefined;
    }
  }

  static async getSessionFromIdTokenHint(ctx) {
    try {
      const clientId = ctx.oidc?.params?.client_id || ctx.oidc?.body?.client_id || ctx.request?.query?.client_id;
      if (!clientId) {
        // We need to know the client in order to verify the ID token signature (the key lives with the client).
        return undefined;
      }
      const client = await provider.Client.find(clientId);
      if (!client) {
        return undefined;
      }
      const idTokenJwt = ctx.oidc?.params?.id_token_hint || ctx.oidc?.body?.id_token_hint || ctx.request?.query?.id_token_hint;;
      // Verify the signature of the ID token JWT
      await provider.IdToken.validate(idTokenJwt, client);

      const decodedIdToken = JWT.decode(idTokenJwt);
      const sessionId = decodedIdToken?.payload?.sid;
      if (!sessionId) {
        return undefined;
      }
      const session = await this.find(sessionId);
      if (!sessionId) {
        return undefined;
      }
      console.log('FOUND SESSION from ID token hint.', session);
      return session;
    } catch {
      // Could not decode id_token_hint as JWT.
      return undefined;
    }
  }

  static async get(ctx) {
    const cookielessFallbackEnabled = instance(provider).configuration('cookies.enableCookielessFallback') === true;

    const cookies = ctx.oidc
      ? ctx.oidc.cookies : provider.app.createContext(ctx.req, ctx.res).cookies;
    cookies.secure = !cookies.secure && ctx.secure ? true : cookies.secure;

    // is there supposed to be a session bound? generate if not
    const cookieSessionId = ssHandler.get(
      cookies,
      provider.cookieName('session'),
      instance(provider).configuration('cookies.long'),
    );

    let session;

    if (cookieSessionId) {
      session = await this.find(cookieSessionId);
    }

    if (!session && cookielessFallbackEnabled) {
      // Try to get the session from a query param.
      session = await this.getSessionFromIdTokenHint(ctx);
    }

    if (!session) {
      if (cookieSessionId) {
        // underlying session was removed since we have a session id in cookie, let's assign an
        // empty data so that session.new is not true and cookie will get written even if nothing
        // gets written to it
        session = this.instantiate({});
      } else {
        session = this.instantiate();
      }
    }

    if (ctx.oidc instanceof provider.OIDCContext) {
      ctx.oidc.entity('Session', session);
    }

    return session;
  }

  async save(ttl) {
    if (typeof ttl !== 'number') {
      throw new TypeError('"ttl" argument must be a number');
    }
    // one by one adapter ops to allow for uid to have a unique index
    if (this.oldId) {
      await this.adapter.destroy(this.oldId);
    }

    const result = await super.save(ttl);

    this.touched = false;

    return result;
  }

  async persist() {
    if (typeof this.exp !== 'number') {
      throw new TypeError('persist can only be called on previously persisted Sessions');
    }
    return this.save(this.exp - epochTime());
  }

  async destroy() {
    await super.destroy();
    this.destroyed = true;
  }

  resetIdentifier() {
    this.oldId = this.id;
    this.id = nanoid();
    this.touched = true;
  }

  authTime() {
    return this.loginTs;
  }

  past(age) {
    const maxAge = +age;

    if (this.loginTs) {
      return epochTime() - this.loginTs > maxAge;
    }

    return true;
  }

  authorizationFor(clientId) {
    // the call will not set, let's not modify the session object
    if (arguments.length === 1 && !this.authorizations) {
      return {};
    }

    this.authorizations = this.authorizations || {};
    if (!this.authorizations[clientId]) {
      this.authorizations[clientId] = {};
    }

    return this.authorizations[clientId];
  }

  sidFor(clientId, value) {
    const authorization = this.authorizationFor(...arguments);

    if (value) {
      authorization.sid = value;
      return undefined;
    }

    return authorization.sid;
  }

  grantIdFor(clientId, value) {
    const authorization = this.authorizationFor(...arguments);

    if (value) {
      authorization.grantId = value;
      return undefined;
    }

    return authorization.grantId;
  }

  ensureClientContainer(clientId) {
    if (!this.sidFor(clientId)) {
      this.sidFor(clientId, nanoid());
    }
  }

  loginAccount(details) {
    const {
      transient = false, accountId, loginTs = epochTime(), amr, acr,
    } = details;

    Object.assign(
      this,
      {
        accountId, loginTs, amr, acr,
      },
      transient ? { transient: true } : undefined,
    );
  }
};
