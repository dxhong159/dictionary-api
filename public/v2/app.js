// Main application file
import { renderCambridgeDictionary } from './renderers/cambridge-renderer.js';
import { renderOxfordDictionary } from './renderers/oxford-renderer.js';
import { renderMerriamWebsterDictionary } from './renderers/merriam-webster-renderer.js';
import { createAudioButton, capitalizeFirstLetter } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const searchForm = document.getElementById('search-form');
  const wordInput = document.getElementById('word-input');
  const loadingIndicator = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  const cambridgeResultsPanel = document.getElementById('cambridge-results');
  const oxfordResultsPanel = document.getElementById('oxford-results');
  const merriamWebsterResultsPanel = document.getElementById('merriam-webster-results');
  const tabButtons = document.querySelectorAll('.tab-button');

  // Base API URL - adjust based on environment
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/v2' 
    : '/api/v2';

  // Tab switching logic
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      // Add active class to clicked button and its target panel
      button.classList.add('active');
      const targetPanelId = button.getAttribute('data-target');
      document.getElementById(targetPanelId).classList.add('active');
    });
  });

  // Form submission handler
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const word = wordInput.value.trim();
    if (!word) return;

    const selectedDictionary = document.querySelector('input[name="dictionary"]:checked').value;
    
    // Reset previous results and show loading indicator
    cambridgeResultsPanel.innerHTML = '';
    oxfordResultsPanel.innerHTML = '';
    merriamWebsterResultsPanel.innerHTML = '';
    errorContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    try {
      if (selectedDictionary === 'all') {
        // Fetch from all dictionaries in parallel
        const [cambridgeResponse, oxfordResponse, merriamWebsterResponse] = await Promise.all([
          fetchDictionary('cambridge', word),
          fetchDictionary('oxford', word),
          fetchDictionary('merriam-webster', word)
        ]);
        
        renderDictionaryResults(cambridgeResponse, cambridgeResultsPanel);
        renderDictionaryResults(oxfordResponse, oxfordResultsPanel);
        renderDictionaryResults(merriamWebsterResponse, merriamWebsterResultsPanel);
        
        // Show Cambridge tab by default after search with all dictionaries
        document.querySelector('.tab-button[data-target="cambridge-results"]').click();
      } else {
        // Fetch from selected dictionary
        const response = await fetchDictionary(selectedDictionary, word);
        
        if (selectedDictionary === 'cambridge') {
          renderDictionaryResults(response, cambridgeResultsPanel);
          document.querySelector('.tab-button[data-target="cambridge-results"]').click();
        } else if (selectedDictionary === 'oxford') {
          renderDictionaryResults(response, oxfordResultsPanel);
          document.querySelector('.tab-button[data-target="oxford-results"]').click();
        } else if (selectedDictionary === 'merriam-webster') {
          renderDictionaryResults(response, merriamWebsterResultsPanel);
          document.querySelector('.tab-button[data-target="merriam-webster-results"]').click();
        }
      }

      // Show results container
      resultsContainer.classList.remove('hidden');
    } catch (error) {
      errorMessage.textContent = `Error: ${error.message || 'Could not fetch dictionary data'}`;
      errorContainer.classList.remove('hidden');
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  });

  // Fetch dictionary data
  async function fetchDictionary(source, word) {
    const response = await fetch(`${API_URL}/${source}/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Main render function that delegates to specialized renderers
  function renderDictionaryResults(data, container) {
    container.innerHTML = ''; // Clear previous results

    if (!data || data.error || data.entries.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>${data?.error || 'No definitions found.'}</p>
        </div>
      `;
      return;
    }

    // Choose the appropriate renderer based on the dictionary source
    switch (data.source.toLowerCase()) {
      case 'cambridge':
        renderCambridgeDictionary(data, container, { createAudioButton, capitalizeFirstLetter });
        break;
      case 'oxford':
        renderOxfordDictionary(data, container, { createAudioButton, capitalizeFirstLetter });
        break;
      case 'merriam-webster':
        renderMerriamWebsterDictionary(data, container, { createAudioButton, capitalizeFirstLetter });
        break;
      default:
        renderGenericDictionary(data, container);
    }
  }

  // Generic dictionary renderer (fallback)
  function renderGenericDictionary(data, container) {
    // Add the data source class to the container
    container.classList.add(`${data.source.toLowerCase()}-dictionary`);

    // Word header with pronunciation info
    const wordHeader = document.createElement('div');
    wordHeader.className = 'word-header';

    const wordTitle = document.createElement('div');
    wordTitle.className = 'word-title';
    
    const wordHeading = document.createElement('h2');
    wordHeading.textContent = data.word;
    wordTitle.appendChild(wordHeading);

    // Add phonetics if available
    const firstEntryWithPhonetic = data.entries.find(e => e.phonetic);
    if (firstEntryWithPhonetic && firstEntryWithPhonetic.phonetic) {
      const phonetic = document.createElement('span');
      phonetic.className = 'phonetic';
      phonetic.textContent = firstEntryWithPhonetic.phonetic;
      wordTitle.appendChild(phonetic);
    }

    wordHeader.appendChild(wordTitle);

    // Audio pronunciation buttons if available
    if (data.audio && (data.audio.uk || data.audio.us)) {
      const audioButtons = document.createElement('div');
      audioButtons.className = 'audio-buttons';
      
      if (data.audio.uk) {
        const ukButton = createAudioButton(data.audio.uk, 'UK');
        audioButtons.appendChild(ukButton);
      }
      
      if (data.audio.us) {
        const usButton = createAudioButton(data.audio.us, 'US');
        audioButtons.appendChild(usButton);
      }
      
      wordHeader.appendChild(audioButtons);
    }

    container.appendChild(wordHeader);

    // Render each entry
    data.entries.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'dictionary-entry';

      // Part of speech
      if (entry.partOfSpeech) {
        const pos = document.createElement('div');
        pos.className = 'part-of-speech';
        pos.textContent = entry.partOfSpeech;
        entryDiv.appendChild(pos);
      }

      // Definitions
      if (entry.definitions && entry.definitions.length > 0) {
        entry.definitions.forEach(def => {
          const definitionDiv = document.createElement('div');
          definitionDiv.className = 'definition';

          const definitionText = document.createElement('div');
          definitionText.className = 'definition-text';
          definitionText.textContent = def.definition || def.text;
          definitionDiv.appendChild(definitionText);

          // Context if available
          if (def.context) {
            const context = document.createElement('div');
            context.className = 'context';
            context.textContent = def.context;
            definitionDiv.appendChild(context);
          }

          // Examples if available
          if (def.examples && def.examples.length > 0) {
            const examplesDiv = document.createElement('div');
            examplesDiv.className = 'examples';
            
            def.examples.forEach(ex => {
              const example = document.createElement('div');
              example.className = 'example';
              
              // Handle both string examples and object examples
              const exampleText = typeof ex === 'string' ? ex : ex.text;
              example.textContent = `"${exampleText}"`;
              
              examplesDiv.appendChild(example);
            });
            
            definitionDiv.appendChild(examplesDiv);
          }

          entryDiv.appendChild(definitionDiv);
        });
      }

      container.appendChild(entryDiv);
    });

    // Add data source footer
    const sourceLabel = document.createElement('div');
    sourceLabel.className = 'source-label';
    sourceLabel.textContent = `Source: ${capitalizeFirstLetter(data.source)} Dictionary`;
    container.appendChild(sourceLabel);
  }

  // Auto-focus the search input on page load
  wordInput.focus();
});
