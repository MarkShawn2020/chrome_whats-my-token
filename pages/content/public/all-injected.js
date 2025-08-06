(function() {
  // Helper to extract Bearer token from headers
  function extractBearerToken(headers) {
    if (!headers) return null;
    
    // Handle Headers object
    if (headers instanceof Headers) {
      const auth = headers.get('Authorization');
      if (auth && auth.match(/^Bearer\s+/i)) {
        return auth.substring(7);
      }
    }
    
    // Handle plain object
    if (typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === 'authorization' && value) {
          const match = value.toString().match(/^Bearer\s+(.+)$/i);
          if (match && match[1]) {
            return match[1];
          }
        }
      }
    }
    
    return null;
  }

  // Override fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    
    // Extract bearer token if present
    const token = extractBearerToken(options.headers);
    if (token) {
      window.postMessage({
        type: 'WHATSMYTOKEN_TOKEN_CAPTURED',
        data: {
          token,
          url: url.toString(),
          method: options.method || 'GET',
          source: 'fetch'
        }
      }, '*');
    }
    
    return originalFetch.apply(this, args);
  };

  // Override XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._whatsMyTokenMethod = method;
    this._whatsMyTokenUrl = url;
    this._whatsMyTokenHeaders = {};
    return originalXHROpen.apply(this, [method, url, ...args]);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    this._whatsMyTokenHeaders[name] = value;
    
    if (name.toLowerCase() === 'authorization' && value) {
      const match = value.match(/^Bearer\s+(.+)$/i);
      if (match && match[1]) {
        window.postMessage({
          type: 'WHATSMYTOKEN_TOKEN_CAPTURED',
          data: {
            token: match[1],
            url: this._whatsMyTokenUrl,
            method: this._whatsMyTokenMethod,
            source: 'xhr'
          }
        }, '*');
      }
    }
    
    return originalXHRSetRequestHeader.apply(this, [name, value]);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    return originalXHRSend.apply(this, args);
  };
  
  console.log('[WhatsMyToken] Interceptors installed');
})();