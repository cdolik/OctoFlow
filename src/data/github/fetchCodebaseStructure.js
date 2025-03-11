
/**
 * Fetches codebase structure from GitHub to identify hot spots
 * and analyze file change frequencies
 */

const fetchCodebaseStructure = async (owner, repo, token) => {
  // First, get the default branch
  const branchQuery = `
    query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef {
          name
        }
      }
    }
  `;

  try {
    // Get the default branch name
    const branchResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: branchQuery,
        variables: { owner, repo }
      })
    });
    
    const branchData = await branchResponse.json();
    if (branchData.errors) {
      console.error('GitHub API errors:', branchData.errors);
      return { error: branchData.errors };
    }
    
    const defaultBranch = branchData.data.repository.defaultBranchRef.name;
    
    // Now fetch the tree structure using REST API for better file listing
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const treeData = await treeResponse.json();
    if (treeData.message) {
      console.error('GitHub API error:', treeData.message);
      return { error: treeData.message };
    }
    
    // Get commit history for each file using batch queries to respect rate limits
    const fileStats = {};
    const files = treeData.tree.filter(item => item.type === 'blob');
    
    // Process files in batches to avoid hitting API rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      
      // For each file, get its commit history
      await Promise.all(batch.map(async (file) => {
        try {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(file.path)}&per_page=20`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          const commitsData = await commitsResponse.json();
          
          if (Array.isArray(commitsData)) {
            // Calculate days since last change
            const lastCommitDate = commitsData[0]?.commit?.author?.date;
            const daysSinceChange = lastCommitDate 
              ? Math.floor((new Date() - new Date(lastCommitDate)) / (1000 * 60 * 60 * 24))
              : null;
            
            fileStats[file.path] = {
              path: file.path,
              size: file.size,
              changeFrequency: commitsData.length,
              lastChanged: lastCommitDate,
              daysSinceChange,
              authors: [...new Set(commitsData
                .map(c => c.commit.author.name)
                .filter(Boolean))]
            };
          }
        } catch (error) {
          console.error(`Error fetching commits for ${file.path}:`, error);
          // Still include the file, but without commit data
          fileStats[file.path] = {
            path: file.path,
            size: file.size,
            error: "Failed to fetch commit data"
          };
        }
      }));
      
      // Respect GitHub API rate limits with a short delay between batches
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Analyze file stats to identify hot spots
    const hotSpots = Object.values(fileStats)
      .filter(file => file.changeFrequency && file.changeFrequency > 5)
      .sort((a, b) => b.changeFrequency - a.changeFrequency)
      .slice(0, 10);
    
    // Identify files not changed in a long time (potential legacy code)
    const legacyCode = Object.values(fileStats)
      .filter(file => file.daysSinceChange && file.daysSinceChange > 180)
      .sort((a, b) => b.daysSinceChange - a.daysSinceChange)
      .slice(0, 10);
    
    return {
      fileCount: files.length,
      directoryStructure: buildDirectoryStructure(treeData.tree),
      hotSpots,
      legacyCode,
      fileStats: Object.values(fileStats)
    };
    
  } catch (error) {
    console.error('Error fetching codebase structure:', error);
    return { error };
  }
};

// Helper function to organize files into a directory structure
function buildDirectoryStructure(treeItems) {
  const root = { name: 'root', type: 'dir', children: {} };
  
  treeItems.forEach(item => {
    const pathParts = item.path.split('/');
    let currentLevel = root.children;
    
    // Navigate through path parts to build the tree structure
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLastPart = i === pathParts.length - 1;
      
      if (isLastPart && item.type === 'blob') {
        // Add file
        currentLevel[part] = { 
          name: part, 
          type: 'file',
          size: item.size
        };
      } else {
        // Add or navigate to directory
        if (!currentLevel[part]) {
          currentLevel[part] = { 
            name: part, 
            type: 'dir',
            children: {} 
          };
        }
        currentLevel = currentLevel[part].children;
      }
    }
  });
  
  return root;
}

module.exports = { fetchCodebaseStructure };