/**
 * Specialized renderer for Merriam-Webster Dictionary
 * Optimized to highlight Merriam-Webster's unique features like
 * detailed sense numbers, etymologies, first known use dates,
 * and hierarchical meaning structure
 */

import { addSourceFooter, createDictionaryLogo } from '../utils.js';

export function renderMerriamWebsterDictionary(data, container, utils) {
  // Reset and prepare container
  container.innerHTML = '';
  container.classList.add('merriam-webster-dictionary');
  
  // Create word header with M-W styling
  const wordHeader = document.createElement('div');
  wordHeader.className = 'word-header mw-header';

  const wordTitle = document.createElement('div');
  wordTitle.className = 'word-title';
  
  const wordHeading = document.createElement('h2');
  wordHeading.textContent = data.word;
  wordTitle.appendChild(wordHeading);
  
  // Add MW logo
  const logoSpan = createDictionaryLogo('merriam-webster');
  wordTitle.appendChild(logoSpan);
  
  wordHeader.appendChild(wordTitle);

  container.appendChild(wordHeader);

  // Render each entry (homonym)
  data.entries.forEach((entry, index) => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'dictionary-entry mw-entry';
    
    // Homonym number if multiple entries
    if (data.entries.length > 1) {
      const homonymNumber = document.createElement('div');
      homonymNumber.className = 'homonym-number';
      homonymNumber.textContent = entry.homonymNumber || (index + 1);
      entryDiv.appendChild(homonymNumber);
    }

    // Variety (American/British) if available
    if (entry.variety) {
      const varietyLabel = document.createElement('div');
      varietyLabel.className = 'variety-label';
      varietyLabel.textContent = entry.variety;
      entryDiv.appendChild(varietyLabel);
    }

    // Pronunciation
    if (entry.pronunciation) {
      const pronDiv = document.createElement('div');
      pronDiv.className = 'mw-pronunciation';
      
      // Written pronunciation
      const writtenPron = document.createElement('span');
      writtenPron.className = 'written-pronunciation';
      writtenPron.textContent = entry.pronunciation.written;
      pronDiv.appendChild(writtenPron);
      
      // Phonetic if available
      if (entry.pronunciation.phonetic) {
        const phonetic = document.createElement('span');
        phonetic.className = 'phonetic';
        phonetic.textContent = ` ${entry.pronunciation.phonetic}`;
        pronDiv.appendChild(phonetic);
      }
      
      // Audio button if available
      if (entry.pronunciation.audioUrl) {
        const audioBtn = utils.createAudioButton(entry.pronunciation.audioUrl, '');
        audioBtn.className = 'audio-inline';
        pronDiv.appendChild(audioBtn);
      }
      
      entryDiv.appendChild(pronDiv);

      // Word forms with audio if available
      if (entry.pronunciation.wordForms && entry.pronunciation.wordForms.length) {
        const formsDiv = document.createElement('div');
        formsDiv.className = 'word-forms';
        
        const formsLabel = document.createElement('span');
        formsLabel.className = 'forms-label';
        formsLabel.textContent = 'Forms: ';
        formsDiv.appendChild(formsLabel);
        
        entry.pronunciation.wordForms.forEach((form, i) => {
          if (i > 0) formsDiv.appendChild(document.createTextNode(', '));
          
          const formSpan = document.createElement('span');
          formSpan.className = 'word-form';
          formSpan.textContent = form.form;
          formsDiv.appendChild(formSpan);
          
          if (form.audioUrl) {
            const audioBtn = utils.createAudioButton(form.audioUrl, '');
            audioBtn.className = 'audio-inline';
            formsDiv.appendChild(audioBtn);
          }
        });
        
        entryDiv.appendChild(formsDiv);
      }
    }

    // Functional label if available
    if (entry.functionalLabel) {
      const functionalLabel = document.createElement('div');
      functionalLabel.className = 'functional-label';
      functionalLabel.textContent = entry.functionalLabel;
      entryDiv.appendChild(functionalLabel);
    }

    // Etymology if available
    if (entry.etymology) {
      const etymologyDiv = document.createElement('div');
      etymologyDiv.className = 'etymology mw-etymology';
      
      const etymLabel = document.createElement('span');
      etymLabel.className = 'etymology-label';
      etymLabel.textContent = 'Etymology: ';
      etymologyDiv.appendChild(etymLabel);
      
      const etymText = document.createElement('span');
      etymText.className = 'etymology-text';
      etymText.textContent = entry.etymology.text;
      etymologyDiv.appendChild(etymText);
      
      entryDiv.appendChild(etymologyDiv);
    }

    // First known use if available
    if (entry.firstKnownUse) {
      const firstUseDiv = document.createElement('div');
      firstUseDiv.className = 'first-known-use';
      firstUseDiv.innerHTML = `<span>First Known Use:</span> ${entry.firstKnownUse}`;
      entryDiv.appendChild(firstUseDiv);
    }

    // Parts of speech sections
    if (entry.partOfSpeechSections && entry.partOfSpeechSections.length) {
      entry.partOfSpeechSections.forEach(posSection => {
        const posSectionDiv = document.createElement('div');
        posSectionDiv.className = 'part-of-speech-section';
        
        // Part of speech header
        const posHeader = document.createElement('h3');
        posHeader.className = 'part-of-speech mw-pos';
        posHeader.textContent = posSection.partOfSpeech;
        posSectionDiv.appendChild(posHeader);
        
        // Inflections if available
        if (posSection.inflections && posSection.inflections.length) {
          const inflectionsDiv = document.createElement('div');
          inflectionsDiv.className = 'inflections';
          inflectionsDiv.textContent = posSection.inflections.join(', ');
          posSectionDiv.appendChild(inflectionsDiv);
        }
        
        // Definitions in a nested structure
        const defsContainer = document.createElement('div');
        defsContainer.className = 'definitions-container';
        
        // Create a numbered list for definitions
        const defsList = document.createElement('ol');
        defsList.className = 'definitions-list';
        
        posSection.definitions.forEach(def => {
          const defItem = document.createElement('li');
          defItem.className = 'definition-item';
          
          // Add sense number information
          if (def.senseNumber) {
            const senseNumber = document.createElement('span');
            senseNumber.className = 'sense-number';
            senseNumber.textContent = def.senseNumber.fullForm;
            defItem.appendChild(senseNumber);
          }
          
          // Add labels if available
          if (def.labels && def.labels.length) {
            const labelsDiv = document.createElement('div');
            labelsDiv.className = 'definition-labels';
            
            def.labels.forEach(label => {
              const labelSpan = document.createElement('span');
              labelSpan.className = `label-${label.type}`;
              labelSpan.textContent = label.text;
              labelsDiv.appendChild(labelSpan);
            });
            
            defItem.appendChild(labelsDiv);
          }
          
          // Definition text
          const defText = document.createElement('div');
          defText.className = 'definition-text';
          defText.textContent = def.text;
          defItem.appendChild(defText);
          
          // Usage notes if available
          if (def.usageNotes && def.usageNotes.length) {
            const notesDiv = document.createElement('div');
            notesDiv.className = 'usage-notes';
            
            def.usageNotes.forEach(note => {
              const noteP = document.createElement('p');
              noteP.className = 'usage-note';
              noteP.textContent = note;
              notesDiv.appendChild(noteP);
            });
            
            defItem.appendChild(notesDiv);
          }
          
          // Examples with M-W styling
          if (def.examples && def.examples.length) {
            const examplesDiv = document.createElement('div');
            examplesDiv.className = 'examples mw-examples';
            
            def.examples.forEach(ex => {
              const example = document.createElement('div');
              example.className = 'example mw-example';
              
              const exText = document.createElement('span');
              exText.className = 'example-text';
              exText.textContent = ex.text;
              example.appendChild(exText);
              
              if (ex.attribution) {
                const attribution = document.createElement('span');
                attribution.className = 'example-attribution';
                attribution.textContent = ` — ${ex.attribution}`;
                example.appendChild(attribution);
              }
              
              examplesDiv.appendChild(example);
            });
            
            defItem.appendChild(examplesDiv);
          }
          
          // Synonyms and antonyms
          if (def.synonyms && def.synonyms.length) {
            const synonymsDiv = document.createElement('div');
            synonymsDiv.className = 'synonyms mw-synonyms';
            synonymsDiv.innerHTML = `<span>Synonyms:</span> ${def.synonyms.join(', ')}`;
            defItem.appendChild(synonymsDiv);
          }
          
          if (def.antonyms && def.antonyms.length) {
            const antonymsDiv = document.createElement('div');
            antonymsDiv.className = 'antonyms mw-antonyms';
            antonymsDiv.innerHTML = `<span>Antonyms:</span> ${def.antonyms.join(', ')}`;
            defItem.appendChild(antonymsDiv);
          }
          
          defsList.appendChild(defItem);
        });
        
        defsContainer.appendChild(defsList);
        posSectionDiv.appendChild(defsContainer);
        entryDiv.appendChild(posSectionDiv);
      });
    }

    // Related phrases
    if (entry.relatedPhrases && entry.relatedPhrases.length) {
      const phrasesSection = document.createElement('div');
      phrasesSection.className = 'related-section related-phrases-section';
      
      const sectionTitle = document.createElement('h3');
      sectionTitle.className = 'related-title';
      sectionTitle.textContent = 'Related Phrases';
      phrasesSection.appendChild(sectionTitle);
      
      const phrasesList = document.createElement('ul');
      phrasesList.className = 'phrases-list';
      
      entry.relatedPhrases.forEach(phrase => {
        const phraseItem = document.createElement('li');
        phraseItem.className = 'phrase-item';
        
        const phraseText = document.createElement('div');
        phraseText.className = 'phrase-text';
        phraseText.textContent = phrase.phrase;
        phraseItem.appendChild(phraseText);
        
        const phraseDefinition = document.createElement('div');
        phraseDefinition.className = 'phrase-definition';
        phraseDefinition.textContent = phrase.definition;
        phraseItem.appendChild(phraseDefinition);
        
        if (phrase.examples && phrase.examples.length) {
          const exampleDiv = document.createElement('div');
          exampleDiv.className = 'phrase-example';
          exampleDiv.textContent = `"${phrase.examples[0].text}"`;
          phraseItem.appendChild(exampleDiv);
        }
        
        phrasesList.appendChild(phraseItem);
      });
      
      phrasesSection.appendChild(phrasesList);
      entryDiv.appendChild(phrasesSection);
    }

    // Other forms
    if (entry.otherForms && Object.keys(entry.otherForms).length) {
      const formsDiv = document.createElement('div');
      formsDiv.className = 'other-forms-container';
      
      const formsTitle = document.createElement('h4');
      formsTitle.className = 'other-forms-title';
      formsTitle.textContent = 'Other Forms';
      formsDiv.appendChild(formsTitle);
      
      const formsList = document.createElement('ul');
      formsList.className = 'other-forms-list';
      
      for (const [formType, formValue] of Object.entries(entry.otherForms)) {
        const formItem = document.createElement('li');
        formItem.innerHTML = `<strong>${formType}:</strong> ${formValue}`;
        formsList.appendChild(formItem);
      }
      
      formsDiv.appendChild(formsList);
      entryDiv.appendChild(formsDiv);
    }
    
    container.appendChild(entryDiv);
  });

  // Add source footer
  addSourceFooter('Merriam-Webster', container);
}
