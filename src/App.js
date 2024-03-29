import React, { useState } from 'react';
import './App.css';

const stopWords = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
  "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
  "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
  "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
  "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
  "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
  "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
  "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d",
  "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn",
  "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn",
  "weren", "won", "wouldn", "attachment", "message", "reacted", "liked", "sent", "u", "like", "yeah", "get", 
  "ok", "oh", "ur"
]);

function App() {
  const [files, setFiles] = useState([]);
  const [topWords, setTopWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allWordCounts, setAllWordCounts] = useState({});


  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
    setTopWords([]);
    setSearchResult('');
    setErrorMessage('');
  };

  const processFiles = async () => {
    const wordCount = {};
  
    for (const file of files) {
      if (file.type === 'application/json') {
        try {
          const text = await file.text();
          const jsonData = JSON.parse(text);
  
          for (const msg of jsonData.messages) {
            if (msg.content) {
              const words = msg.content.toLowerCase().match(/\b(\w+)\b/g) || [];
              words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
              });
            }
          }
        } catch (error) {
          console.error('Error processing file', file.name, error);
        }
      }
    }

    setAllWordCounts(wordCount); 
  
    const filteredWordCount = Object.entries(wordCount).filter(([word, _]) => !stopWords.has(word));
  
    const sortedWords = filteredWordCount.sort((a, b) => b[1] - a[1]).slice(0, 50);
  
    setTopWords(sortedWords);
  };
  
  

  const handleSubmit = (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setErrorMessage('Please upload files before analyzing.');
      return;
    }
    processFiles();
  };

  const handleSearch = () => {  
    if (!files.length) {
      setErrorMessage('Please upload and analyze files before searching.');
      setSearchResult('');
      return;
    }
  
    const frequency = allWordCounts[searchTerm.toLowerCase()];
  
    if (frequency) {
      setSearchResult(`The word "${searchTerm}" appears ${frequency} time(s).`);
    } else {
      setSearchResult(`The word "${searchTerm}" does not appear in the analyzed text.`);
    }
  
    setErrorMessage('');
  };
  
  
  const getBackgroundColor = (index) => {
    if (index < 10) {
      const opacity = 1 - (index * 0.1);
      return `rgba(255, 0, 0, ${opacity})`;
    }
    return '#f0f0f0';
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className='Title'>Download your instagram DM as a json file and upload here 
        to see the most frequently typed word in your DM's!</div>
        <form onSubmit={handleSubmit}>
          <input type="file" multiple onChange={handleFileChange} accept=".json" />
          <button type="submit">Analyze</button>
        </form>
        <form onSubmit={(e) => {e.preventDefault(); handleSearch();}}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a word to search"
          />
          <button type="submit">Search</button>
        </form>
        {searchResult && <p>{searchResult}</p>}
        {errorMessage && <p className="ErrorMessage">{errorMessage}</p>}
        <div className="WordList">
          {topWords.map(([word, count], index) => (
            <div 
              className="WordItem" 
              key={word}
              style={{ backgroundColor: getBackgroundColor(index) }}
            >
              {word}: {count}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;