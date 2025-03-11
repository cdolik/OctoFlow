/**
 * Fetches repository metrics from GitHub using GraphQL API
 * This includes stars, forks, watchers, and contribution statistics
 */

const fetchRepoMetrics = async (owner, repo, token) => {
  const query = `
    query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        name
        description
        url
        stargazerCount
        forkCount
        watchers {
          totalCount
        }
        issues(states: OPEN) {
          totalCount
        }
        pullRequests(states: OPEN) {
          totalCount
        }
        defaultBranchRef {
          name
          target {
            ... on Commit {
              history(first: 100) {
                totalCount
                nodes {
                  committedDate
                  author {
                    user {
                      login
                    }
                  }
                }
              }
            }
          }
        }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            node {
              name
              color
            }
            size
          }
          totalSize
        }
        collaborators(first: 10) {
          totalCount
          nodes {
            login
            name
            avatarUrl
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GitHub API errors:', data.errors);
      return { error: data.errors };
    }

    const repoData = data.data.repository;
    
    // Process commit history to get commit frequency by author
    const commitHistory = repoData.defaultBranchRef.target.history.nodes;
    const authorCommits = {};
    
    commitHistory.forEach(commit => {
      const author = commit.author.user?.login || 'unknown';
      authorCommits[author] = (authorCommits[author] || 0) + 1;
    });
    
    // Calculate commit frequency over time (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
    
    const recentCommits = commitHistory.filter(commit => 
      commit.committedDate >= thirtyDaysAgo
    ).length;
    
    // Process language data
    const languages = repoData.languages.edges.map(edge => ({
      name: edge.node.name,
      color: edge.node.color,
      percentage: (edge.size / repoData.languages.totalSize * 100).toFixed(1)
    }));

    // Return processed metrics
    return {
      name: repoData.name,
      description: repoData.description,
      url: repoData.url,
      stars: repoData.stargazerCount,
      forks: repoData.forkCount,
      watchers: repoData.watchers.totalCount,
      openIssues: repoData.issues.totalCount,
      openPRs: repoData.pullRequests.totalCount,
      commitActivity: {
        total: repoData.defaultBranchRef.target.history.totalCount,
        recent30Days: recentCommits,
        byAuthor: authorCommits
      },
      languages,
      collaboratorCount: repoData.collaborators.totalCount
    };
  } catch (error) {
    console.error('Error fetching repo metrics:', error);
    return { error };
  }
};

module.exports = { fetchRepoMetrics };
