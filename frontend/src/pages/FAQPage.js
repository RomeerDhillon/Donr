import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I donate food?',
      answer: 'Sign up as a Donator, create a donation post with details about your food items, and wait for a distributor to connect with you.',
    },
    {
      question: 'Who can receive food?',
      answer: 'Anyone can sign up as an Acceptor to receive food donations. Distributors help connect donators with acceptors.',
    },
    {
      question: 'Is there a cost to use Donr?',
      answer: 'No, Donr is completely free to use. Our mission is to reduce food waste and help those in need.',
    },
    {
      question: 'How does the matching work?',
      answer: 'Our algorithm matches donators with nearby distributors and acceptors based on location and availability.',
    },
    {
      question: 'What types of food can I donate?',
      answer: 'You can donate any food items that are safe to consume. Please check expiration dates and ensure food is properly stored.',
    },
    {
      question: 'How do I become a distributor?',
      answer: 'Sign up as a Distributor during registration. Distributors help facilitate connections between donators and acceptors.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1>Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.question}
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

