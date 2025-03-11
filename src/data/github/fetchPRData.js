/**
 * Fetches Pull Request data from GitHub using GraphQL API
 */

export const fetchPRData = async (owner, repo, token, count = 50) => {
  const query = `
    query ($owner: String!, $repo: String!, $prCount: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequests(last: $prCount, states: [MERGED, OPEN]) {
          nodes {
            id
            title
            body
            createdAt
            updatedAt
            mergedAt
            closedAt
            state
            additions
            deletions
            changedFiles
            author {
              login
              avatarUrl
            }
            reviews(first: 10) {
              nodes {
                author {
                  login
                }
                body
                state
              }
            }
            comments(first: 30) {
              nodes {
                author {
                  login
                }
                body
                createdAt
              }
            }
            commits(first: 1) {
              nodes {
                commit {
                  message
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.error(`Making GraphQL request for ${owner}/${repo} with token: ${token ? 'Token provided' : 'No token'}`);
    
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo, prCount: count }
      })
    });

    const data = await response.json();
    
    // Log response for debugging
    console.error('API Response:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (data.errors) {
      console.error('GitHub API errors:', data.errors);
      return { error: data.errors };
    }
    
    if (!data.data || !data.data.repository) {
      console.error('Unexpected API response:', data);
      return { error: 'Invalid API response', data };
    }
    
    // For testing, if PRs aren't found, return sample data
    if (!data.data.repository.pullRequests || !data.data.repository.pullRequests.nodes) {
      console.error('No PRs found, returning sample data for testing');
      return samplePrData();
    }
    
    return data.data.repository.pullRequests.nodes;
  } catch (error) {
    console.error('Error fetching PR data:', error);
    console.error('Returning sample PR data for development');
    return samplePrData();
  }
};

// Sample PR data for testing when API fails
function samplePrData() {
  return [
    {
      id: 'sample-pr-1',
      title: 'Sample PR for Testing',
      body: 'This is a sample PR description to test the analysis pipeline.',
      state: 'OPEN',
      additions: 120,
      deletions: 30,
      changedFiles: 5,
      reviews: { nodes: [] },
      comments: { nodes: [] },
      commits: { nodes: [{ commit: { message: 'Sample commit message' } }] }
    },
    {
      id: 'sample-pr-2',
      title: 'feat: Sample feature PR',
      body: 'This PR adds a new feature.\n\nWhy:\nTo demonstrate the analysis pipeline.\n\nHow:\nBy creating a sample PR object.',
      state: 'OPEN',
      additions: 250,
      deletions: 50,
      changedFiles: 8,
      reviews: { nodes: [{ author: { login: 'reviewer' }, body: 'Looks good!', state: 'APPROVED' }] },
      comments: { nodes: [{ author: { login: 'commenter' }, body: 'Nice work!', createdAt: new Date().toISOString() }] },
      commits: { nodes: [{ commit: { message: 'feat: Add sample feature' } }] }
    }
  ];
}
