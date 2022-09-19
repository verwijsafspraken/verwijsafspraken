const { GitHubAuthClient } = require("./github-auth-client");
const { GitHubClient } = require("./github-client");

const githubAuthClient = new GitHubAuthClient({
  clientId: "7b5e83ed2fd7b79ee525",
  clientSecret: "24d784d5333425052faa9609aec5190f0444c408",
  scope: "public_repo",
  async getUser(token) {
    console.log('got token', token)
    const client = new GitHubClient({ token });
    const viewer = await client.getViewer();
    console.log('got viewer', { viewer })
    if (!viewer) {
      return null;
    }
    return {
      ...viewer,
      token,
    };
  },
});

export async function getUser() {
  return await githubAuthClient.authenticate();
}

export async function getGitHubClient() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  return new GitHubClient({ token: user.token });
}

export async function login() {
    githubAuthClient.login();
}

const verwijsafsprakenRepoInfo = {
  owner: 'verwijsafspraken',
  repo: 'verwijsafspraken'
}

function stripNode({ url, path, parent, ...node }) {
  return {
    ...node,
    children: node?.children?.map(stripNode)
  }
}

export async function saveDatabase(database) {
  const githubClient = await getGitHubClient();
  if (!githubClient) {
    githubAuthClient.login();
    return;
  }
  const content = JSON.stringify(stripNode(database), null, 2) + '\n';

  const { object: { sha: baseCommitSha } } = await githubClient.getRef({ ...verwijsafsprakenRepoInfo, ref: 'heads/main' });
  const { tree: { sha: baseTreeSha } } = await githubClient.getCommit({ ...verwijsafsprakenRepoInfo, commitSha: baseCommitSha });
  const { tree: baseTree } = await githubClient.getTree({ ...verwijsafsprakenRepoInfo, treeSha: baseTreeSha });

  const forkedRepository = await ensureFork(githubClient, verwijsafsprakenRepoInfo);
  const repositoryId = forkedRepository.id;
  const owner = forkedRepository.owner.login;
  const repo = forkedRepository.name;
  const { sha: treeSha } = await githubClient.createTree({
    owner,
    repo,
    baseTree: baseTreeSha,
    tree: [{
      path: 'database.json',
      mode: '100644',
      type: 'blob',
      // sha: blobSha,
      content
    }]
  });
  const { sha: commitSha } = await githubClient.createCommit({
    owner,
    repo,
    parents: [
      baseCommitSha
    ],
    tree: treeSha,
    committer: {
      name: "Verwijsafspraken.nl",
      email: "info@verwijsafspraken.nl",
    },
    message: `content changes from website`
  });
  const branchName = `patch-${commitSha}`;
  await githubClient.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: commitSha });
  const { html_url: pullRequestUrl } = await githubClient.createPullRequest({
    ...verwijsafsprakenRepoInfo,
    base: 'main',
    head: `${owner}:${branchName}`,
    title: "Hallo",
    body: `This PR was created by Verwijsafspraken.nl.`,
    maintainerCanModify: true
  })
  return pullRequestUrl;
}

async function ensureFork(client, { owner, repo }) {
  const repository = await client.getMyFork({ owner, repo });
  if (!repository) {
    return await client.forkRepo({ owner, repo });
  }
  return {
    id: repository.databaseId,
    name: repository.name,
    owner: {
      login: repository.owner.login
    }
  };
}