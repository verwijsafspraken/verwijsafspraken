import { GraphQLClient, gql } from "./graphql-client";

export class GitHubClient {
  constructor({ token }) {
    this.token = token;
    const graphqlUrl = "https://api.github.com/graphql";
    const headers = token ? { authorization: `token ${token}` } : {};
    this.graphql = new GraphQLClient(graphqlUrl, {
      headers,
    });
  }

  async request({ method = 'GET', path, query = {}, body = null }) {
    const url = new URL(`https://api.github.com`);
    url.pathname = path;
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    console.log('request', {
      method,
      path,
      query,
      body
    })
    const response = await fetch(url, {
      method,
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${this.token}`,
        ...(body && {
          "Content-Type": "application/json",
        })
      },
      ...(body && {
        body: JSON.stringify(body)
      })
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to request github: ${response.status} ${response.statusText}: ${await response.text()}`)
    }
    return await response.json();
  }

  async getViewer() {
    const result = await this.graphql.request(gql`
      query {
        viewer {
          name
          login
          avatarUrl
        }
      }
    `);
    return result.viewer;
  }

  async getMyFork({ owner, repo }) {
    const result = await this.graphql.request(gql`
      query($owner:String!, $repo: String!) { 
        repository(owner:$owner, name: $repo) {
          forks(first: 1, ownerAffiliations: OWNER) {
            nodes {
              databaseId
              name,
              owner {
                login
              }
            }
          }
        }
      }
    `, { owner, repo });
    return result?.repository?.forks?.nodes?.[0];
  }
  
  async forkRepo({ owner, repo }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/forks`,
      body: {
        name: repo,
        default_branch_only: true
      }
    });
  }

  // https://docs.github.com/en/rest/git/commits#get-a-commit
  async getCommit({ owner, repo, commitSha }) {
    return await this.request({
      method: 'GET',
      path: `/repos/${owner}/${repo}/git/commits/${commitSha}`,
    });
  }

  // https://docs.github.com/en/rest/git/commits#create-a-commit
  async createCommit({ owner, repo, message, tree, parents, author, committer, signature }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/commits`,
      body: {
        message,
        tree,
        parents,
        author,
        committer,
        signature
      }
    });
  }

  // https://docs.github.com/en/rest/git/blobs#create-a-blob
  async createBlob({ owner, repo, content }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/blobs`,
      body: {
        content
      }
    });
  }

  async getTree({ owner, repo, treeSha }) {
    return await this.request({
      method: 'GET',
      path: `/repos/${owner}/${repo}/git/trees/${treeSha}`,
    });
  }

  async createTree({ owner, repo, tree, baseTree }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/trees`,
      body: {
        tree,
        base_tree: baseTree
      }
    });
  }

  // https://docs.github.com/en/rest/git/refs#get-a-reference
  async getRef({ owner, repo, ref }) {
    return await this.request({
      method: 'GET',
      path: `/repos/${owner}/${repo}/git/ref/${ref}`,
    });
  }

  async createRef({ owner, repo, ref, sha }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/git/refs`,
      body: {
        ref,
        sha
      }
    });
  }

  // https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request
  async createPullRequest({
    owner,
    repo,
    title,
    head,
    base,
    body,
    maintainerCanModify,
    draft,
    issue,
  }) {
    return await this.request({
      method: 'POST',
      path: `/repos/${owner}/${repo}/pulls`,
      body: {
        title,
        head,
        base,
        body,
        maintainer_can_modify: maintainerCanModify,
        draft,
        issue
      }
    });
  }

  async *paginate(queryFn) {
    let after = null;
    do {
      const { pageInfo, edges } = await queryFn(after);
      for (const edge of edges) {
        yield edge;
      }
      after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    } while (after);
  }
}
