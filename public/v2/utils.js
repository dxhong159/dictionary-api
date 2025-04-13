/**
 * Utility functions for the dictionary application
 */

/**
 * Creates an audio button element for pronunciation
 * @param {string} audioUrl - URL to the audio file
 * @param {string} label - Label for the button (e.g., 'UK', 'US')
 * @returns {HTMLElement} - The audio button container element
 */
export function createAudioButton(audioUrl, label) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'audio-button';
  
  const button = document.createElement('button');
  button.className = 'audio-play';
  button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1z" transform="translate(8,8) scale(0) translate(-8,-8)"></path><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg>';
  
  // Create audio element but don't add it to the DOM
  const audio = new Audio(audioUrl);
  
  // Toggle between play and pause
  let isPlaying = false;
  
  button.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1z" transform="translate(8,8) scale(0) translate(-8,-8)"></path><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg>';
      isPlaying = false;
    } else {
      // Stop all other playing audio
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      
      audio.play()
        .then(() => {
          button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1z"></path><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" transform="translate(8,8) scale(0) translate(-8,-8)"></path></svg>';
          isPlaying = true;
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    }
  });
  
  // Reset button when audio ends
  audio.addEventListener('ended', () => {
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1zm3 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h1z" transform="translate(8,8) scale(0) translate(-8,-8)"></path><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path></svg>';
    isPlaying = false;
  });
  
  buttonContainer.appendChild(button);
  
  if (label) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'audio-label';
    labelDiv.textContent = label;
    buttonContainer.appendChild(labelDiv);
  }
  
  return buttonContainer;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Creates a logo element for the dictionary
 * @param {string} source - Dictionary source name
 * @returns {HTMLElement} - Logo element
 */
export function createDictionaryLogo(source) {
  const logoSpan = document.createElement('span');
  logoSpan.className = `dictionary-logo ${source.toLowerCase()}-logo`;
  
  let logoUrl;
  switch (source.toLowerCase()) {
    case 'cambridge':
      logoUrl = 'https://dictionary.cambridge.org/external/images/logo-banner.png';
      break;
    case 'oxford':
      logoUrl = 'https://www.oed.com/public/images/oed_logo_main.svg';
      break;
    case 'merriam-webster':
    case 'merriam':
      logoUrl = 'https://www.merriam-webster.com/assets/mw/static/app-header-9f4137fc3991.png';
      break;
    default:
      logoUrl = '';
  }
  
  if (logoUrl) {
    const img = document.createElement('img');
    img.src = logoUrl;
    img.alt = `${capitalizeFirstLetter(source)} Dictionary`;
    img.height = 24;
    logoSpan.appendChild(img);
  }
  
  return logoSpan;
}

/**
 * Add a source footer to the container
 * @param {string} source - Dictionary source name
 * @param {HTMLElement} container - Container element to append to
 */
export function addSourceFooter(source, container) {
  const sourceLabel = document.createElement('div');
  sourceLabel.className = 'source-label';
  sourceLabel.textContent = `Source: ${capitalizeFirstLetter(source)} Dictionary`;
  container.appendChild(sourceLabel);
}
