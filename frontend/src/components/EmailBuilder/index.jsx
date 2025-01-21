import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE_URL = 'http://localhost:5000/api';

const EmailBuilder = () => {
  const [emailContent, setEmailContent] = useState({
    title: 'Email has never been easier',
    subtitle: 'Create beautiful and sophisticated emails in minutes. No coding required, and minimal setup. The way email should be.',
    imageUrls: {
      logo: null,
      content: null
    },
    styles: {
      title: {
        color: '#000000',
        fontSize: 'Md',
        fontFamily: 'Heading font',
        alignment: 'center',
        textTransform: 'none',
        margin: '20px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
      },
      subtitle: {
        color: '#666666',
        fontSize: 'Sm',
        fontFamily: 'Body font',
        alignment: 'center',
        textTransform: 'none',
        margin: '16px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
      }
    }
  });

  const [selectedElement, setSelectedElement] = useState('title');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load initial template layout
    const loadTemplate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getEmailLayout`);
        if (!response.ok) throw new Error('Failed to load template');
        const layout = await response.text();
        // You might want to parse the layout and update the state accordingly
        console.log('Template loaded:', layout);
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Failed to load template');
      }
    };

    loadTemplate();
  }, []);

  const handleTextChange = (field, value) => {
    setEmailContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStyleChange = (property, value) => {
    setEmailContent(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [selectedElement]: {
          ...prev.styles[selectedElement],
          [property]: value
        }
      }
    }));
  };

  const handleFormatting = (format) => {
    const formatMap = {
      bold: 'isBold',
      italic: 'isItalic',
      underline: 'isUnderline',
      strike: 'isStrike'
    };

    setEmailContent(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [selectedElement]: {
          ...prev.styles[selectedElement],
          [formatMap[format]]: !prev.styles[selectedElement][formatMap[format]]
        }
      }
    }));
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`${API_BASE_URL}/uploadImage`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');
        
        const data = await response.json();
        setEmailContent(prev => ({
          ...prev,
          imageUrls: {
            ...prev.imageUrls,
            [type]: data.imageUrl
          }
        }));
      } catch (err) {
        console.error('Error uploading image:', err);
        setError('Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/uploadEmailConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) throw new Error('Failed to save template');
      
      const savedTemplate = await response.json();
      console.log('Template saved:', savedTemplate);
      alert('Template saved successfully!');
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template');
      alert('Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/renderAndDownloadTemplate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading template:', err);
      setError('Failed to download template');
      alert('Failed to download template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFontSizeInPx = (size) => {
    const sizeMap = {
      'Xxs': '12px',
      'Xs': '14px',
      'Sm': '16px',
      'Md': '18px',
      'Lg': '24px',
      'Xl': '32px',
      'Xxl': '48px'
    };
    return sizeMap[size] || '16px';
  };

  const getTextStyles = (element) => {
    const styles = emailContent.styles[element];
    return {
      color: styles.color,
      fontSize: getFontSizeInPx(styles.fontSize),
      fontFamily: styles.fontFamily,
      textAlign: styles.alignment,
      textTransform: styles.textTransform,
      margin: styles.margin,
      fontWeight: styles.isBold ? 'bold' : 'normal',
      fontStyle: styles.isItalic ? 'italic' : 'normal',
      textDecoration: [
        styles.isUnderline ? 'underline' : '',
        styles.isStrike ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
    };
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="email-builder">
      {loading && <div className="loading-overlay">Loading...</div>}
      <div className="preview-panel">
        <div className="email-preview">
          <div className="logo-section">
            {emailContent.imageUrls.logo ? (
              <img src={emailContent.imageUrls.logo} alt="Logo" className="logo-image" />
            ) : (
              <div className="logo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  id="logo-upload"
                  hidden
                />
                <label htmlFor="logo-upload" className="add-logo-btn">
                  ADD LOGO
                </label>
              </div>
            )}
          </div>
          
          <div className="email-content">
            <h1 
              onClick={() => setSelectedElement('title')}
              style={getTextStyles('title')}
              className={selectedElement === 'title' ? 'selected' : ''}
            >
              {emailContent.title}
            </h1>
            <p 
              onClick={() => setSelectedElement('subtitle')}
              style={getTextStyles('subtitle')}
              className={selectedElement === 'subtitle' ? 'selected' : ''}
            >
              {emailContent.subtitle}
            </p>
            
            <div className="action-buttons">
              <button className="get-started-btn">Get started</button>
              <button className="learn-more-btn">Learn more</button>
            </div>

            {emailContent.imageUrls.content ? (
              <img src={emailContent.imageUrls.content} alt="Email content" className="content-image" />
            ) : (
              <div className="image-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'content')}
                  id="image-upload"
                  hidden
                />
                <label htmlFor="image-upload" className="upload-btn">
                  + Add Image
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="controls-panel">
        <div className="control-section">
          <h3>Text</h3>
          <div className="text-controls">
            <div className="formatting-buttons">
              <button 
                title="Bold" 
                onClick={() => handleFormatting('bold')}
                className={emailContent.styles[selectedElement].isBold ? 'active' : ''}
              >
                <strong>B</strong>
              </button>
              <button 
                title="Italic"
                onClick={() => handleFormatting('italic')}
                className={emailContent.styles[selectedElement].isItalic ? 'active' : ''}
              >
                <em>I</em>
              </button>
              <button 
                title="Underline"
                onClick={() => handleFormatting('underline')}
                className={emailContent.styles[selectedElement].isUnderline ? 'active' : ''}
              >
                <u>U</u>
              </button>
              <button 
                title="Strike"
                onClick={() => handleFormatting('strike')}
                className={emailContent.styles[selectedElement].isStrike ? 'active' : ''}
              >
                S
              </button>
              <button title="Link">🔗</button>
              <button title="Code">{`</>`}</button>
            </div>

            <div className="text-input">
              <textarea
                value={emailContent[selectedElement]}
                onChange={(e) => handleTextChange(selectedElement, e.target.value)}
                placeholder="Enter text here..."
              />
              <small>Shift + Enter will add a line break</small>
            </div>

            <div className="text-options">
              <div className="option-group">
                <label>Alignment</label>
                <div className="alignment-buttons">
                  <button 
                    title="Left"
                    onClick={() => handleStyleChange('alignment', 'left')}
                    className={emailContent.styles[selectedElement].alignment === 'left' ? 'active' : ''}
                  >⫷</button>
                  <button 
                    title="Center"
                    onClick={() => handleStyleChange('alignment', 'center')}
                    className={emailContent.styles[selectedElement].alignment === 'center' ? 'active' : ''}
                  >☰</button>
                  <button 
                    title="Right"
                    onClick={() => handleStyleChange('alignment', 'right')}
                    className={emailContent.styles[selectedElement].alignment === 'right' ? 'active' : ''}
                  >⫸</button>
                  <button 
                    title="Justify"
                    onClick={() => handleStyleChange('alignment', 'justify')}
                    className={emailContent.styles[selectedElement].alignment === 'justify' ? 'active' : ''}
                  >≡</button>
                </div>
              </div>

              <div className="option-group">
                <label>Font</label>
                <select 
                  className="font-select"
                  value={emailContent.styles[selectedElement].fontFamily}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                >
                  <option>Body font</option>
                  <option>Heading font</option>
                </select>
              </div>

              <div className="option-group">
                <label>Text color</label>
                <div className="color-buttons">
                  <button 
                    className="color-btn black" 
                    onClick={() => handleStyleChange('color', '#000000')}
                  ></button>
                  <button 
                    className="color-btn gray"
                    onClick={() => handleStyleChange('color', '#666666')}
                  ></button>
                  <button 
                    className="color-btn blue"
                    onClick={() => handleStyleChange('color', '#0066ff')}
                  ></button>
                  <button 
                    className="color-btn purple"
                    onClick={() => handleStyleChange('color', '#6b46c1')}
                  ></button>
                  <input
                    type="color"
                    value={emailContent.styles[selectedElement].color}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="color-btn custom"
                  />
                </div>
              </div>

              <div className="option-group">
                <label>Font size</label>
                <div className="size-buttons">
                  {['Xxs', 'Xs', 'Sm', 'Md', 'Lg', 'Xl', 'Xxl'].map(size => (
                    <button
                      key={size}
                      onClick={() => handleStyleChange('fontSize', size)}
                      className={emailContent.styles[selectedElement].fontSize === size ? 'active' : ''}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Text transform</label>
                <div className="transform-buttons">
                  <button
                    onClick={() => handleStyleChange('textTransform', 'lowercase')}
                    className={emailContent.styles[selectedElement].textTransform === 'lowercase' ? 'active' : ''}
                  >
                    aa
                  </button>
                  <button
                    onClick={() => handleStyleChange('textTransform', 'capitalize')}
                    className={emailContent.styles[selectedElement].textTransform === 'capitalize' ? 'active' : ''}
                  >
                    Aa
                  </button>
                  <button
                    onClick={() => handleStyleChange('textTransform', 'uppercase')}
                    className={emailContent.styles[selectedElement].textTransform === 'uppercase' ? 'active' : ''}
                  >
                    AA
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label>Margin</label>
                <div className="margin-controls">
                  <button
                    onClick={() => handleStyleChange('margin', '16px')}
                    className={emailContent.styles[selectedElement].margin === '16px' ? 'active' : ''}
                  >□</button>
                  <button
                    onClick={() => handleStyleChange('margin', '24px')}
                    className={emailContent.styles[selectedElement].margin === '24px' ? 'active' : ''}
                  >▢</button>
                  <button
                    onClick={() => handleStyleChange('margin', '32px')}
                    className={emailContent.styles[selectedElement].margin === '32px' ? 'active' : ''}
                  >⬚</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <button className="action-button save-button" onClick={handleSave}>
            <span className="button-icon">💾</span>
            Save Template
          </button>
          <button className="action-button download-button" onClick={handleDownload}>
            <span className="button-icon">⬇️</span>
            Download HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailBuilder;
