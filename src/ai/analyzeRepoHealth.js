
/**
 * Analyzes repository health using OpenAI API
 */

const analyzeRepoHealth = async (repoData, codebaseData, apiKey) => {
  // Combine repo metrics and codebase structure data for comprehensive analysis
  const analysisData = {
    repoMetrics: {
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stars,
      forks: repoData.forks,
      openIssues: repoData.openIssues,
      openPRs: repoData.openPRs,
      languages: repoData.languages,
      commitActivity: {
        recent30Days: repoData.commitActivity.recent30Days,
        totalCommits: repoData.commitActivity.total
      }
    },
    codebaseHealth: {
      fileCount: codebaseData.fileCount,
      hotSpots: codebaseData.hotSpots.map(file => ({
        path: file.path,
        changeFrequency: file.changeFrequency
      })),
      legacyCode: codebaseData.legacyCode.map(file => ({
        path: file.path,
        daysSinceChange: file.daysSinceChange
      }))
    }
  };

  // OpenAI API request
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert software engineering consultant specializing in repository health analysis.
                     Analyze the GitHub repository data and provide:
                     1. Overall repository health score (0-100)
                     2. Key strengths of the repository
                     3. Areas that need immediate attention
                     4. Specific recommendations for improvement
                     5. Risk assessment of hot spots and legacy code
                     Format your response as JSON with these keys: score, strengths, concernAreas, recommendations, riskAssessment`
          },
          {
            role: "user",
            content: `Analyze this repository data: ${JSON.stringify(analysisData)}`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return { error: data.error };
    }
    
    // Extract JSON from OpenAI response
    try {
      const content = data.choices[0].message.content;
      // Try to parse the JSON response
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      return {
        error: 'Failed to parse AI response',
        rawResponse: data.choices[0].message.content
      };
    }
  } catch (error) {
    console.error('Error analyzing repository health:', error);
    return { error };
  }
};

module.exports = { analyzeRepoHealth };