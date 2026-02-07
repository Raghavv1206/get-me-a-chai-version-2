'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

export default function FAQAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="faq-accordion">
      <h3 className="faq-title">Frequently Asked Questions</h3>

      {faqs.length > 3 && (
        <div className="faq-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <div className="faq-list">
        {filteredFaqs.length === 0 ? (
          <div className="no-results">
            No FAQs found matching your search.
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >
                <span className="question-text">{faq.question}</span>
                <span className="toggle-icon">
                  {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              <div className={`faq-answer ${openIndex === index ? 'expanded' : ''}`}>
                <div className="answer-content">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .faq-accordion {
          margin-top: 40px;
        }

        .faq-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 20px;
        }

        .faq-search {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 45px;
          border: 2px solid #334155;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #1e293b;
          color: #e2e8f0;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: #1e293b;
          border: 2px solid #334155;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #475569;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .faq-item.open {
          border-color: #667eea;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .faq-question:hover {
          background: #334155;
        }

        .question-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #f1f5f9;
          flex: 1;
          padding-right: 20px;
        }

        .toggle-icon {
          color: #667eea;
          font-size: 1rem;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .faq-item.open .toggle-icon {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }

        .faq-answer.expanded {
          max-height: 500px;
        }

        .answer-content {
          padding: 0 20px 20px;
          color: #cbd5e1;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
          font-size: 1rem;
        }

        @media (max-width: 640px) {
          .faq-title {
            font-size: 1.25rem;
          }

          .faq-question {
            padding: 16px;
          }

          .question-text {
            font-size: 0.95rem;
          }

          .answer-content {
            padding: 0 16px 16px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
