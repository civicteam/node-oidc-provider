import instance from './weak_cache.js';

export default (source, target, grant, provider = null) => {
  const claims = { ...(source?.[target]) };
  const requested = Object.keys(claims);
  
  // Check if allowDynamicClaims is enabled (when provider is available)
  if (provider && instance(provider).configuration.allowDynamicClaims) {
    // When allowDynamicClaims is true, return all claims without any filtering
    return claims;
  }
  
  // Original behavior when allowDynamicClaims is false or provider not available
  const granted = new Set(grant.getOIDCClaimsFiltered(new Set(requested)));

  for (const claim of requested) {
    // eslint-disable-next-line no-continue
    if (['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].includes(claim)) continue;
    if (!granted.has(claim)) {
      delete claims[claim];
    }
  }
  return claims;
};
