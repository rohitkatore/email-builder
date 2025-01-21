import React from 'react';
import EmailBuilder from './components/EmailBuilder';
import './App.css';

function App() {
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      // Navigate back or to dashboard
      console.log('Navigating back...');
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      window.location.reload();
    }
  };

  const handleSave = () => {
    // Here you would typically trigger the save functionality
    console.log('Saving template...');
    alert('Template saved successfully!');
  };

  return (
    <div className="app">
      <nav className="top-nav">
        <button className="back-btn" onClick={handleBack}>← Back</button>
        <span className="template-name">Welcome email</span>
        <div className="nav-actions">
          <button className="action-btn" onClick={handleDiscard}>Discard</button>
          <button className="action-btn primary" onClick={handleSave}>Save</button>
        </div>
      </nav>
      <main>
        <EmailBuilder />
      </main>
    </div>
  );
}

export default App;