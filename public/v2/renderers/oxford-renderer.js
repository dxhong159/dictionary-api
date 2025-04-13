/**
 * Specialized renderer for Oxford Dictionary
 * Optimized to highlight Oxford's unique features like etymologies,
 * hierarchical sense structures, and scholarly approach
 */

import { addSourceFooter, createDictionaryLogo } from '../utils.js';

export function renderOxfordDictionary(data, container, utils) {
  // Reset and prepare container
  container.innerHTML = '';
  container.classList.add('oxford-dictionary');
  
  // Create word header with Oxford styling
  const wordHeader = document.createElement('div');
  wordHeader.className = 'word-header oxford-header';

  const wordTitle = document.createElement('div');
  wordTitle.className = 'word-title';
  
  const wordHeading = document.createElement('h2');
  
  // Format word with numeric suffix if present
  const numericSuffixMatch = data.word.match(/^(\w+)(\d+)$/);
  if (numericSuffixMatch) {
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

  // Add Oxford logo
  const logoSpan = createDictionaryLogo('oxford');
  wordTitle.appendChild(logoSpan);
  
  wordHeader.appendChild(wordTitle);
  
  container.appendChild(wordHeader);

  // Process each entry
  data.entries.forEach(entry => {
    // Add language information if available
    if (entry.language) {
      const langNote = document.createElement('div');
      langNote.className = 'language-note';
      langNote.textContent = `Language: ${entry.language}`;
      container.appendChild(langNote);
    }

    // Process lexical entries
    if (entry.lexicalEntries && entry.lexicalEntries.length) {
      entry.lexicalEntries.forEach(lexEntry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'dictionary-entry oxford-entry';

        // Part of speech with Oxford styling
        if (lexEntry.lexicalCategory) {
          const pos = document.createElement('div');
          pos.className = 'part-of-speech';
          pos.textContent = lexEntry.lexicalCategory.text;
          entryDiv.appendChild(pos);
        }

        // Etymology if available
        if (lexEntry.etymologies && lexEntry.etymologies.length) {
          const etymologyDiv = document.createElement('div');
          etymologyDiv.className = 'etymology';
          
          const etymLabel = document.createElement('span');
          etymLabel.className = 'etymology-label';
          etymLabel.textContent = 'Origin: ';
          etymologyDiv.appendChild(etymLabel);
          
          const etymContent = document.createElement('span');
          etymContent.className = 'etymology-content';
          etymContent.textContent = lexEntry.etymologies[0].text;
          etymologyDiv.appendChild(etymContent);
          
          entryDiv.appendChild(etymologyDiv);
        }
        
        // Pronunciations if available
        if (lexEntry.pronunciations && lexEntry.pronunciations.length) {
          const pronContainer = document.createElement('div');
          pronContainer.className = 'oxford-pronunciation';
          
          lexEntry.pronunciations.forEach(pron => {
            if (pron.phonetic) {
              const pronDiv = document.createElement('div');
              pronDiv.className = 'pronunciation';
              
              if (pron.variant) {
                const variantLabel = document.createElement('span');
                variantLabel.className = 'region-label';
                variantLabel.textContent = pron.variant;
                pronDiv.appendChild(variantLabel);
              }
              
              const phonetic = document.createElement('span');
              phonetic.className = 'ipa';
              phonetic.textContent = pron.phonetic;
              pronDiv.appendChild(phonetic);
              
              if (pron.audioUrl) {
                const audioBtn = utils.createAudioButton(pron.audioUrl, '');
                audioBtn.className = 'audio-inline';
                pronDiv.appendChild(audioBtn);
              }
              
              pronContainer.appendChild(pronDiv);
            }
          });
          
          entryDiv.appendChild(pronContainer);
        }

        // Variant forms if available
        if (lexEntry.variantForms && lexEntry.variantForms.length) {
          const variantsDiv = document.createElement('div');
          variantsDiv.className = 'variant-forms';
          
          const variantLabel = document.createElement('span');
          variantLabel.className = 'variant-label';
          variantLabel.textContent = 'Variants: ';
          variantsDiv.appendChild(variantLabel);
          
          const variantsList = lexEntry.variantForms.map(v => v.text).join(', ');
          variantsDiv.appendChild(document.createTextNode(variantsList));
          
          entryDiv.appendChild(variantsDiv);
        }

        // Render senses (definitions) using a hierarchical structure
        if (lexEntry.senses && lexEntry.senses.length) {
          const sensesDiv = document.createElement('div');
          sensesDiv.className = 'senses-container';
          
          renderOxfordSenses(lexEntry.senses, sensesDiv, 1, utils);
          
          entryDiv.appendChild(sensesDiv);
        }

        container.appendChild(entryDiv);
      });
    }
  });

  // Add source footer
  addSourceFooter('Oxford', container);
}

// Helper function to render Oxford senses recursively
function renderOxfordSenses(senses, container, level, utils) {
  const sensesList = document.createElement(level === 1 ? 'ol' : 'ul');
  sensesList.className = `senses-list level-${level}`;
  
  senses.forEach((sense, index) => {
    const senseItem = document.createElement('li');
    senseItem.className = 'sense-item';
    
    // Definition with Oxford styling
    const definitionDiv = document.createElement('div');
    definitionDiv.className = 'definition oxford-definition';
    
    // Add domains if available
    if (sense.domains && sense.domains.length) {
      const domainsSpan = document.createElement('span');
      domainsSpan.className = 'domains-label';
      domainsSpan.textContent = sense.domains.map(d => d.text).join(', ') + ' ';
      definitionDiv.appendChild(domainsSpan);
    }
    
    // Add regions if available
    if (sense.regions && sense.regions.length) {
      const regionsSpan = document.createElement('span');
      regionsSpan.className = 'regions-label';
      regionsSpan.textContent = sense.regions.map(r => r.text).join(', ') + ' ';
      definitionDiv.appendChild(regionsSpan);
    }
    
    // Add registers if available
    if (sense.registers && sense.registers.length) {
      const registersSpan = document.createElement('span');
      registersSpan.className = 'registers-label';
      registersSpan.textContent = sense.registers.map(r => r.type).join(', ') + ' ';
      definitionDiv.appendChild(registersSpan);
    }
    
    // Definition text
    const defText = document.createElement('span');
    defText.className = 'definition-text';
    defText.textContent = sense.definition;
    definitionDiv.appendChild(defText);
    
    // Short definition if available and different from main definition
    if (sense.shortDefinition && sense.shortDefinition !== sense.definition) {
      const shortDef = document.createElement('div');
      shortDef.className = 'short-definition';
      shortDef.textContent = `(${sense.shortDefinition})`;
      definitionDiv.appendChild(shortDef);
    }
    
    senseItem.appendChild(definitionDiv);
    
    // Examples with Oxford styling
    if (sense.examples && sense.examples.length) {
      const examplesDiv = document.createElement('div');
      examplesDiv.className = 'examples oxford-examples';
      
      sense.examples.forEach(ex => {
        const example = document.createElement('div');
        example.className = 'example oxford-example';
        example.textContent = `"${ex.text}"`;
        
        if (ex.source) {
          const source = document.createElement('span');
          source.className = 'example-source';
          source.textContent = ` — ${ex.source}`;
          example.appendChild(source);
        }
        
        // Add notes if available
        if (ex.notes) {
          const noteElem = document.createElement('div');
          noteElem.className = 'example-note';
          noteElem.textContent = ex.notes;
          example.appendChild(noteElem);
        }
        
        examplesDiv.appendChild(example);
      });
      
      senseItem.appendChild(examplesDiv);
    }
    
    // Cross references
    if (sense.crossReferences && sense.crossReferences.length) {
      const crossRefsDiv = document.createElement('div');
      crossRefsDiv.className = 'cross-references';
      crossRefsDiv.innerHTML = `<span>See also:</span> ${sense.crossReferences.join(', ')}`;
      senseItem.appendChild(crossRefsDiv);
    }
    
    // Synonyms and antonyms
    if (sense.synonyms && sense.synonyms.length) {
      const synonymsDiv = document.createElement('div');
      synonymsDiv.className = 'synonyms';
      synonymsDiv.innerHTML = `<span>Synonyms:</span> ${sense.synonyms.join(', ')}`;
      senseItem.appendChild(synonymsDiv);
    }
    
    if (sense.antonyms && sense.antonyms.length) {
      const antonymsDiv = document.createElement('div');
      antonymsDiv.className = 'antonyms';
      antonymsDiv.innerHTML = `<span>Antonyms:</span> ${sense.antonyms.join(', ')}`;
      senseItem.appendChild(antonymsDiv);
    }
    
    // Render subsenses recursively for hierarchical display
    if (sense.subsenses && sense.subsenses.length) {
      renderOxfordSenses(sense.subsenses, senseItem, level + 1, utils);
    }
    
    sensesList.appendChild(senseItem);
  });
  
  container.appendChild(sensesList);
}
