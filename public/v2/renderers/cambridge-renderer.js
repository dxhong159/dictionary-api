/**
 * Specialized renderer for Cambridge Dictionary
 * Optimized to highlight Cambridge's unique features like CEFR levels and language learner focus
 */

import { addSourceFooter, createDictionaryLogo } from '../utils.js';

export function renderCambridgeDictionary(data, container, utils) {
  // Reset and prepare container
  container.innerHTML = '';
  container.classList.add('cambridge-dictionary');
  
  // Create word header with Cambridge styling
  const wordHeader = document.createElement('div');
  wordHeader.className = 'word-header';

  const wordTitle = document.createElement('div');
  wordTitle.className = 'word-title';
  
  const wordHeading = document.createElement('h2');
  wordHeading.textContent = data.word;
  wordTitle.appendChild(wordHeading);

  // Add Cambridge logo
  const logoSpan = createDictionaryLogo('cambridge');
  wordTitle.appendChild(logoSpan);
  
  wordHeader.appendChild(wordTitle);

  // Add pronunciation section if available
  if (data.entries.some(entry => entry.pronunciation)) {
    const pronContainer = document.createElement('div');
    pronContainer.className = 'pronunciation-container';
    
    // Find entry with pronunciation
    const entryWithPron = data.entries.find(entry => entry.pronunciation);
    
    if (entryWithPron && entryWithPron.pronunciation) {
      const pron = entryWithPron.pronunciation;
      
      // UK pronunciation
      if (pron.ukIpa) {
        const ukPron = document.createElement('div');
        ukPron.className = 'pronunciation uk';
        
        const ukLabel = document.createElement('span');
        ukLabel.className = 'region-label uk-label';
        ukLabel.textContent = 'UK';
        
        const ukIpa = document.createElement('span');
        ukIpa.className = 'ipa';
        ukIpa.textContent = pron.ukIpa;
        
        ukPron.appendChild(ukLabel);
        ukPron.appendChild(ukIpa);
        
        // Add UK audio if available
        if (pron.ukAudioUrl) {
          const ukAudio = utils.createAudioButton(pron.ukAudioUrl, '');
          ukAudio.className = 'audio-inline';
          ukPron.appendChild(ukAudio);
        }
        
        pronContainer.appendChild(ukPron);
      }
      
      // US pronunciation
      if (pron.usIpa) {
        const usPron = document.createElement('div');
        usPron.className = 'pronunciation us';
        
        const usLabel = document.createElement('span');
        usLabel.className = 'region-label us-label';
        usLabel.textContent = 'US';
        
        const usIpa = document.createElement('span');
        usIpa.className = 'ipa';
        usIpa.textContent = pron.usIpa;
        
        usPron.appendChild(usLabel);
        usPron.appendChild(usIpa);
        
        // Add US audio if available
        if (pron.usAudioUrl) {
          const usAudio = utils.createAudioButton(pron.usAudioUrl, '');
          usAudio.className = 'audio-inline';
          usPron.appendChild(usAudio);
        }
        
        pronContainer.appendChild(usPron);
      }
      
      wordHeader.appendChild(pronContainer);
    }
  }

  container.appendChild(wordHeader);

  // Process each entry
  data.entries.forEach(entry => {
    // Process definition groups by part of speech
    if (entry.defGroups && entry.defGroups.length) {
      entry.defGroups.forEach(defGroup => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'dictionary-entry cambridge-entry';

        // Part of speech with Cambridge styling
        const pos = document.createElement('div');
        pos.className = 'part-of-speech';
        pos.textContent = defGroup.partOfSpeech;
        entryDiv.appendChild(pos);

        // Grammar info if available
        if (defGroup.grammarInfo) {
          const grammarInfo = document.createElement('div');
          grammarInfo.className = 'grammar-info';
          grammarInfo.textContent = defGroup.grammarInfo;
          entryDiv.appendChild(grammarInfo);
        }
        
        // Region note if available
        if (defGroup.regionNote) {
          const regionNote = document.createElement('div');
          regionNote.className = 'region-variation';
          regionNote.textContent = defGroup.regionNote;
          entryDiv.appendChild(regionNote);
        }

        // Render each definition with its examples
        defGroup.definitions.forEach(def => {
          const definitionDiv = document.createElement('div');
          definitionDiv.className = 'definition cambridge-definition';
          
          // Add CEFR level badge if available
          if (def.level && def.level.code) {
            const levelBadge = document.createElement('span');
            levelBadge.className = `cefr-badge ${def.level.code.toLowerCase()}`;
            levelBadge.textContent = def.level.code;
            levelBadge.title = def.level.description || `CEFR Level ${def.level.code}`;
            definitionDiv.appendChild(levelBadge);
          }

          // Domain if available
          if (def.domain) {
            const domain = document.createElement('span');
            domain.className = 'domain-label';
            domain.textContent = def.domain;
            definitionDiv.appendChild(domain);
          }

          // Register if available
          if (def.register) {
            const register = document.createElement('span');
            register.className = 'register-label';
            register.textContent = def.register;
            definitionDiv.appendChild(register);
          }
          
          // Definition text
          const definitionText = document.createElement('div');
          definitionText.className = 'definition-text';
          definitionText.textContent = def.text;
          definitionDiv.appendChild(definitionText);

          // Region variation if available
          if (def.regionVariation) {
            const regionNote = document.createElement('div');
            regionNote.className = 'region-variation';
            
            if (def.regionVariation.uk) {
              const ukVar = document.createElement('span');
              ukVar.innerHTML = '<strong>UK:</strong> ' + def.regionVariation.uk;
              regionNote.appendChild(ukVar);
            }
            
            if (def.regionVariation.us) {
              const usVar = document.createElement('span');
              usVar.innerHTML = '<strong>US:</strong> ' + def.regionVariation.us;
              if (def.regionVariation.uk) {
                regionNote.appendChild(document.createTextNode(' • '));
              }
              regionNote.appendChild(usVar);
            }
            
            definitionDiv.appendChild(regionNote);
          }

          // Alternates if available
          if (def.alternates && def.alternates.length > 0) {
            const alts = document.createElement('div');
            alts.className = 'alternates';
            alts.innerHTML = `<strong>Also:</strong> ${def.alternates.join(', ')}`;
            definitionDiv.appendChild(alts);
          }

          // Examples with Cambridge styling
          if (def.examples && def.examples.length > 0) {
            const examplesDiv = document.createElement('div');
            examplesDiv.className = 'examples cambridge-examples';
            
            def.examples.forEach(ex => {
              const example = document.createElement('div');
              example.className = 'example cambridge-example';
              
              // Example text
              const exampleText = document.createElement('div');
              exampleText.className = 'example-text';
              exampleText.textContent = typeof ex === 'string' ? ex : ex.text;
              example.appendChild(exampleText);
              
              // Example translation if available
              if (typeof ex !== 'string' && ex.translation) {
                const translation = document.createElement('div');
                translation.className = 'example-translation';
                translation.textContent = ex.translation;
                example.appendChild(translation);
              }
              
              examplesDiv.appendChild(example);
            });
            
            definitionDiv.appendChild(examplesDiv);
          }

          entryDiv.appendChild(definitionDiv);
        });

        container.appendChild(entryDiv);
      });
    }

    // Phrasal verbs section
    if (entry.phrasalVerbs && entry.phrasalVerbs.length > 0) {
      renderRelatedPhrasesSection(
        entry.phrasalVerbs, 
        'Phrasal Verbs', 
        'phrasal-verbs-section',
        container
      );
    }

    // Idioms section
    if (entry.idioms && entry.idioms.length > 0) {
      renderRelatedPhrasesSection(
        entry.idioms, 
        'Idioms', 
        'idioms-section',
        container
      );
    }
  });

  // Add source footer
  addSourceFooter('Cambridge', container);
}

// Helper function to render related phrases sections (phrasal verbs, idioms)
function renderRelatedPhrasesSection(phrases, title, className, container) {
  const section = document.createElement('div');
  section.className = `related-section ${className}`;
  
  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'related-title';
  sectionTitle.textContent = title;
  section.appendChild(sectionTitle);
  
  const phrasesList = document.createElement('ul');
  phrasesList.className = 'related-list';
  
  phrases.forEach(phrase => {
    const phraseItem = document.createElement('li');
    
    const phraseLink = document.createElement('a');
    phraseLink.textContent = phrase.phrase;
    phraseLink.href = phrase.link || `javascript:void(0);`;
    phraseLink.title = phrase.definition;
    phraseItem.appendChild(phraseLink);
    
    if (phrase.definition) {
      const definition = document.createElement('span');
      definition.className = 'quick-definition';
      definition.textContent = `: ${phrase.definition}`;
      phraseItem.appendChild(definition);
    }
    
    phrasesList.appendChild(phraseItem);
  });
  
  section.appendChild(phrasesList);
  container.appendChild(section);
}
