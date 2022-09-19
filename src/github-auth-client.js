function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

class GitHubAuthClient {
  constructor({ clientId, clientSecret, getUser, scope = "public_repo" }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope;
    this.getUser = getUser;
  }

  async storedAuthentication() {
    const storedToken = window.localStorage.getItem("github_access_token");
    if (!storedToken) {
      return null;
    }
    return await this.getUser(storedToken);
  }

  async personalAccessTokenAuthentication() {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const token = hash.get("token");
    if (!token) {
      return null;
    }
    const result = await this.getUser(token);
    if (result) {
      // Remove token from URL if it is valid.
      hash.delete("token");
      url.hash = hash.toString();
      window.history.replaceState(
        window.history.state,
        document.title,
        url.toString()
      );

      window.localStorage.setItem("github_access_token", token);
    }
    return result;
  }

  async oauthCallbackAuthentication() {
    const url = new URL(window.location.href + window.location.hash);
    const params = url.searchParams;
    const code = params.get("code");
    const state = params.get("state");

    if (!code) {
      return null;
    }

    const storedState = window.localStorage.getItem("github_oauth_state");
    if (storedState !== state) {
      throw new Error("OAuth error: invalid state");
    }

    const parameters = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    });
    const response = await fetch(
      // AWS service to allow CORS GitHub access_token calls:
      "https://d5pweeyzg2.execute-api.us-east-1.amazonaws.com/login/oauth/access_token",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: parameters.toString(),
      }
    );
    const responseText = await response.text();
    console.log(responseText);
    const responseParams = new URLSearchParams(responseText);
    const error = responseParams.get("error");
    if (error) {
      console.error({ error });
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState(null, '', url);
      const errorDescription = responseParams.get("error_description");
      throw new Error(`OAuth error: ${error}: ${errorDescription}`);
    }
    const token = responseParams.get("access_token");

    window.localStorage.removeItem("github_oauth_state");

    // Make sure the URL doesn't show the code and state anymore.
    // Using the history API avoids doing a redirect.
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState(null, '', url);
    window.history.replaceState(null, '', url);

    const result = await this.getUser(token);
    console.log({  result });
    if (result) {
      window.localStorage.setItem("github_access_token", token);
    }
    return result;
  }

  async authenticate() {
    const url = new URL(window.location.href);

    const attempts = [
      () => this.oauthCallbackAuthentication(),
      () => this.personalAccessTokenAuthentication(),
      () => this.storedAuthentication(),
    ];

    for (const attempt of attempts) {
      console.log(attempt.toString());
      const result = await attempt();
      if (result) {
        console.log('result', { result });
        return result;
      }
    }
    console.log('no result');
    return null;
  }

  login() {
    const state = uuidv4();
    window.localStorage.setItem("github_oauth_state", state);

    const redirect_uri = window.location.href;

    const parameters = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: redirect_uri.toString(),
      scope: this.scope,
      state,
    });
    const url = `https://github.com/login/oauth/authorize?${parameters.toString()}`;
    window.location.assign(url);
  }

  logout() {
    window.localStorage.removeItem("github_access_token");
  }
}

module.exports = {
  GitHubAuthClient,
};
