import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../data/questions';

interface ResourceHubProps {
  selectedCategories?: Category[];
}

interface Resource {
  title: string;
  description: string;
  url: string;
  category: Category;
  tags: string[];
}

const ResourceHub: React.FC<ResourceHubProps> = ({ selectedCategories = [] }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Curated list of GitHub resources
  const resources: Resource[] = [
    {
      title: "GitHub Flow Guide",
      description: "Learn about GitHub's recommended lightweight, branch-based workflow.",
      url: "https://docs.github.com/en/get-started/quickstart/github-flow",
      category: Category.Collaboration,
      tags: ['workflow', 'branches', 'pull requests']
    },
    {
      title: "Setting up protected branches",
      description: "Learn how to set up branch protection rules to enforce certain workflows.",
      url: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches",
      category: Category.Security,
      tags: ['branches', 'protection', 'security']
    },
    {
      title: "Getting started with GitHub Actions",
      description: "Automate your workflow from idea to production.",
      url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
      category: Category.Automation,
      tags: ['CI/CD', 'actions', 'automation']
    },
    {
      title: "Introduction to Dependabot",
      description: "Keep your dependencies secure and up-to-date with automated updates.",
      url: "https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates",
      category: Category.Security,
      tags: ['dependencies', 'security', 'updates']
    },
    {
      title: "GitHub Advanced Security Overview",
      description: "Learn about GitHub's suite of security features for enterprise customers.",
      url: "https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security",
      category: Category.Security,
      tags: ['enterprise', 'security', 'scanning']
    },
    {
      title: "GitHub Copilot Documentation",
      description: "Get started with GitHub's AI pair programmer.",
      url: "https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot",
      category: Category.Automation,
      tags: ['AI', 'copilot', 'code completion']
    },
    {
      title: "Introduction to GitHub Issues",
      description: "Track ideas, feedback, tasks, or bugs for work on GitHub.",
      url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues",
      category: Category.Collaboration,
      tags: ['issues', 'tracking', 'project management']
    },
    {
      title: "GitHub Projects Documentation",
      description: "Built-in project management with customizable workflows.",
      url: "https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects",
      category: Category.Collaboration,
      tags: ['project management', 'kanban', 'tracking']
    },
    {
      title: "Code Scanning with CodeQL",
      description: "Find vulnerabilities and errors in your code using semantic analysis.",
      url: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning",
      category: Category.Security,
      tags: ['codeql', 'security', 'scanning']
    },
    {
      title: "Creating a Test Workflow with GitHub Actions",
      description: "Learn how to automate testing with GitHub Actions.",
      url: "https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs",
      category: Category.Testing,
      tags: ['testing', 'CI', 'automation']
    }
  ];
  
  // Filter resources based on active category and search term
  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSelectedCategories = selectedCategories.length === 0 || 
      selectedCategories.includes(resource.category);
    
    return matchesCategory && matchesSearch && matchesSelectedCategories;
  });
  
  // Get unique categories from resources
  const categories = ['all', ...Array.from(new Set(resources.map(resource => resource.category)))];
  
  return (
    <motion.div 
      className="resource-hub"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>GitHub Resource Hub</h3>
      <p className="resource-description">
        Curated resources to help you implement GitHub best practices:
      </p>
      
      <div className="resource-controls">
        <div className="resource-search">
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button 
              key={category} 
              className={`category-filter ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All Resources' : category}
            </button>
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        <motion.div className="resources-grid">
          {filteredResources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`resource-card ${resource.category.toLowerCase()}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
            >
              <div className="resource-category-tag">{resource.category}</div>
              <h4 className="resource-title">{resource.title}</h4>
              <p className="resource-description">{resource.description}</p>
              <div className="resource-tags">
                {resource.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="resource-tag">#{tag}</span>
                ))}
              </div>
              <div className="resource-link">Read Documentation →</div>
            </motion.a>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ResourceHub; 