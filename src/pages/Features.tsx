import React from 'react';

// Features.tsx: Showcase key benefits of GitHub for Startups
const Features: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Features</h1>
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Free Credits</h2>
          <p>Access free credits and resources to power your startup's development.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Developer Tools</h2>
          <p>Utilize a suite of developer tools and integrations, designed specifically for startups.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Resources</h2>
          <p>Explore extensive documentation, support, and community resources tailored for innovation.</p>
        </div>
      </section>
    </div>
  );
};

export default Features;
