import React from 'react';
import './ResourcesPage.css';

const ResourcesPage = () => {
  const resources = [
    {
      title: 'Food Safety Guidelines',
      description: 'Learn about proper food handling and storage to ensure safe donations.',
      link: '#',
    },
    {
      title: 'Donation Best Practices',
      description: 'Tips and guidelines for making effective food donations.',
      link: '#',
    },
    {
      title: 'Community Resources',
      description: 'Find local food banks and community organizations in your area.',
      link: '#',
    },
    {
      title: 'Volunteer Opportunities',
      description: 'Discover ways to volunteer and help reduce food waste in your community.',
      link: '#',
    },
  ];

  return (
    <div className="resources-page">
      <div className="resources-container">
        <h1>Resources</h1>
        <p className="resources-intro">
          Find helpful resources and information to make the most of your Donr experience.
        </p>
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-card">
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
              <a href={resource.link} className="resource-link">
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;

