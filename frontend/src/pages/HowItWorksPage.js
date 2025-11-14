import React from 'react';
import './HowItWorksPage.css';

const HowItWorksPage = () => {
  return (
    <div className="how-it-works-page">
      <div className="how-it-works-container">
        <h1>How It Works</h1>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h2>Sign Up</h2>
            <p>Create an account as a Donator, Distributor, or Acceptor.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h2>Donate or Request</h2>
            <p>Donators can post available food items. Acceptors can request food.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h2>Connect</h2>
            <p>Our matching algorithm connects donators with nearby distributors and acceptors.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h2>Distribute</h2>
            <p>Distributors facilitate the connection and help reduce food waste.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;

