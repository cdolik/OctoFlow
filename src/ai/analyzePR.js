/**
 * Analyzes PR data using OpenAI API
 */

const analyzePR = async (prData, apiKey) => {
  // Format the PR data for analysis
  const prSummary = {
    title: prData.title,
    description: prData.body || "",
    changedFiles: prData.changedFiles,
    additions: prData.additions,
    deletions: prData.deletions,
    reviewComments: (prData.reviews?.nodes || []).map(r => r.body).filter(Boolean),
    discussionComments: (prData.comments?.nodes || []).map(c => c.body).filter(Boolean),
    commitMessage: prData.commits?.nodes?.[0]?.commit?.message || ""
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
            content: `You are an expert code reviewer. Provide a JSON response with keys: score, titleQuality, descriptionQuality, recommendations, positiveAspects.`
          },
          {
            role: "user",
            content: `Analyze this PR: ${JSON.stringify(prSummary)}`
          }
        ]
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing PR:', error);
    return { error };
  }
};

module.exports = { analyzePR };