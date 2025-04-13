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
  const tabButtons = document.querySelectorAll('.tab-button');

  // Base API URL - adjust based on environment
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/v1' 
    : '/api/v1';

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
        
        renderResults(cambridgeResponse, cambridgeResultsPanel);
        renderResults(oxfordResponse, oxfordResultsPanel);
        renderResults(merriamWebsterResponse, document.getElementById('merriam-webster-results'));
        
        // Show Cambridge tab by default after search with all dictionaries
        document.querySelector('.tab-button[data-target="cambridge-results"]').click();
      } else {
        // Fetch from selected dictionary
        const response = await fetchDictionary(selectedDictionary, word);
        
        if (selectedDictionary === 'cambridge') {
          renderResults(response, cambridgeResultsPanel);
          document.querySelector('.tab-button[data-target="cambridge-results"]').click();
        } else if (selectedDictionary === 'oxford') {
          renderResults(response, oxfordResultsPanel);
          document.querySelector('.tab-button[data-target="oxford-results"]').click();
        } else if (selectedDictionary === 'merriam-webster') {
          renderResults(response, document.getElementById('merriam-webster-results'));
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

  // Render dictionary results
  function renderResults(data, container) {
    container.innerHTML = ''; // Clear previous results

    if (!data || data.error || data.entries.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>${data.error || 'No definitions found.'}</p>
        </div>
      `;
      return;
    }

    // Word header with pronunciation info
    const wordHeader = document.createElement('div');
    wordHeader.className = 'word-header';

    const wordTitle = document.createElement('div');
    wordTitle.className = 'word-title';
    
    const wordHeading = document.createElement('h2');
    
    // Format word with numeric suffix if present (for Oxford Dictionary)
    const numericSuffixMatch = data.word.match(/^(\w+)(\d+)$/);
    if (numericSuffixMatch && data.source === 'oxford') {
      // Create base word
      const baseWord = document.createTextNode(numericSuffixMatch[1]);
      wordHeading.appendChild(baseWord);
      
      // Create superscript numeric suffix
      const numericSuffix = document.createElement('span');
      numericSuffix.className = 'numeric-suffix';
      numericSuffix.textContent = numericSuffixMatch[2];
      wordHeading.appendChild(numericSuffix);
    } else {
      wordHeading.textContent = data.word;
    }
    
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

      // Entry-specific audio if different from global
      if (entry.audio && (
          (entry.audio.uk && (!data.audio || entry.audio.uk !== data.audio.uk)) || 
          (entry.audio.us && (!data.audio || entry.audio.us !== data.audio.us))
        )) {
        const audioButtons = document.createElement('div');
        audioButtons.className = 'audio-buttons';
        
        if (entry.audio.uk) {
          const ukButton = createAudioButton(entry.audio.uk, 'UK');
          audioButtons.appendChild(ukButton);
        }
        
        if (entry.audio.us) {
          const usButton = createAudioButton(entry.audio.us, 'US');
          audioButtons.appendChild(usButton);
        }
        
        entryDiv.appendChild(audioButtons);
      }

      // Definitions
      entry.definitions.forEach(def => {
        const definitionDiv = document.createElement('div');
        definitionDiv.className = 'definition';

        const definitionText = document.createElement('div');
        definitionText.className = 'definition-text';
        definitionText.textContent = def.definition;
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
            example.textContent = `"${ex}"`;
            examplesDiv.appendChild(example);
          });
          
          definitionDiv.appendChild(examplesDiv);
        }

        entryDiv.appendChild(definitionDiv);
      });

      // Synonyms if available
      if (entry.synonyms && entry.synonyms.length > 0) {
        const synonymsDiv = document.createElement('div');
        synonymsDiv.className = 'synonyms';
        synonymsDiv.innerHTML = `<span>Synonyms:</span> ${entry.synonyms.join(', ')}`;
        entryDiv.appendChild(synonymsDiv);
      }

      container.appendChild(entryDiv);
    });

    // Add data source footer
    const sourceLabel = document.createElement('div');
    sourceLabel.className = 'source-label';
    sourceLabel.textContent = `Source: ${capitalizeFirstLetter(data.source)} Dictionary`;
    container.appendChild(sourceLabel);
  }

  // Helper function to create audio buttons
  function createAudioButton(audioUrl, label) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'audio-button';
    
    const button = document.createElement('button');
    button.className = 'audio-play';
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1z" transform="translate(8,8) scale(0) translate(-8,-8)"></path><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg>';
    
    const audio = new Audio(audioUrl);
    
    button.addEventListener('click', () => {
      audio.play();
    });
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'audio-label';
    labelDiv.textContent = label;
    
    buttonContainer.appendChild(button);
    buttonContainer.appendChild(labelDiv);
    
    return buttonContainer;
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Auto-focus the search input on page load
  wordInput.focus();
});
