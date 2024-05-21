// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiry, setExpiry] = useState('1d');
  const [shortUrl, setShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/url', {
        originalUrl,
        expiry,
      });
      setShortUrl(response.data.shortUrl);
    } catch (error) {
      console.error("Error generating URL:", error);
    }
  };

  return (
    <div>
      <h1>Tiny URL Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
          <option value="1d">1 Day</option>
          <option value="30d">30 Days</option>
          <option value="90d">90 Days</option>
        </select>
        <button type="submit">Generate Tiny URL</button>
      </form>
      {shortUrl && <p>Short URL: <a href={shortUrl}>{shortUrl}</a></p>}
    </div>
  );
}

export default App;
