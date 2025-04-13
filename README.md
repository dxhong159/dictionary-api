# Cambridge Dictionary API

A multilingual dictionary API service that provides definitions from multiple dictionary sources including Cambridge, Oxford, and Merriam-Webster dictionaries.

## Overview

This API service scrapes dictionary websites to provide word definitions, examples, pronunciations, and other lexical information in a structured format. The system has both a backend API and frontend interfaces for displaying dictionary content.

## Features

- Multiple dictionary sources in one API:
  - Cambridge Dictionary
  - Oxford Learner's Dictionary
  - Merriam-Webster Dictionary
- Structured definitions with examples, synonyms, and context
- Audio pronunciation links (UK and US variants where available)
- Part of speech information
- Phrasal verbs and idioms
- Two API versions with different levels of detail and response structures

## System Architecture

The system follows a clean architecture approach with the following components:

### Backend (API)

- **Base Services**: Provides common functionality for all dictionary scrapers
- **Dictionary Services**: Source-specific scrapers for each dictionary
- **Controllers**: Handle HTTP requests and response formatting
- **Routes**: Define API endpoints
- **Types & Interfaces**: Strong typing for response structures

### Frontend

- **V1**: Basic dictionary interface
- **V2**: Enhanced interface with better styling and more detailed information

## How It Works

1. **Request Handling**: The system receives a word lookup request via API endpoints
2. **Scraping**: Dictionary services scrape content from the respective dictionary websites
3. **Parsing**: HTML content is parsed using Cheerio to extract structured data
4. **Response Formatting**: Data is formatted into a consistent JSON structure
5. **Delivery**: Results are returned via API or displayed in the frontend interface

## API Versions

### V1 API

Basic API with simpler response structure:
- `/api/v1/dictionary/:word` - Get definitions from all available dictionaries
- `/api/v1/cambridge/:word` - Get definitions from Cambridge dictionary
- `/api/v1/oxford/:word` - Get definitions from Oxford dictionary
- `/api/v1/merriam-webster/:word` - Get definitions from Merriam-Webster dictionary

### V2 API

Enhanced API with more detailed response structure:
- `/api/v2/dictionary/:word` - Get enhanced definitions from all dictionaries
- `/api/v2/cambridge/:word` - Get enhanced definitions from Cambridge dictionary
- `/api/v2/oxford/:word` - Get enhanced definitions from Oxford dictionary
- `/api/v2/merriam-webster/:word` - Get enhanced definitions from Merriam-Webster dictionary

## SOLID Principles Implementation

The system follows SOLID principles:
- **Single Responsibility**: Each class has a single purpose (e.g., scraping a specific dictionary)
- **Open/Closed**: System is extendable for new dictionary sources
- **Liskov Substitution**: All dictionary services properly implement the same interface
- **Interface Segregation**: Clean interfaces for dictionary services
- **Dependency Injection**: Services are injected, not created internally

## Technical Implementation

- **Node.js** with Express for the API server
- **TypeScript** for type safety
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests
- **Request Manager** to handle rate limiting and rotating user agents

## Example Response (V2 API)

```json
{
  "word": "example",
  "entries": [
    {
      "word": "example",
      "defGroups": [
        {
          "partOfSpeech": "noun",
          "definitions": [
            {
              "text": "something that is typical or usual of its kind",
              "level": {
                "code": "B1",
                "description": "Intermediate"
              },
              "examples": [
                {
                  "text": "This painting is a fine example of his early work."
                }
              ]
            }
          ]
        }
      ],
      "pronunciation": {
        "uk": "/ɪɡˈzɑːmpəl/",
        "us": "/ɪɡˈzæmpəl/",
        "audio": {
          "uk": "https://dictionary.cambridge.org/media/english/uk_pron/u/uke/ukex/ukexam025.mp3",
          "us": "https://dictionary.cambridge.org/media/english/us_pron/e/exa/examp/example.mp3"
        }
      }
    }
  ],
  "source": "cambridge"
}
```

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Access the frontend interfaces:
   - V1: http://localhost:5000/v1
   - V2: http://localhost:5000/v2

4. Use the API endpoints:
   - http://localhost:5000/api/v1/dictionary/example
   - http://localhost:5000/api/v2/dictionary/example

## Notes

This service is for educational purposes. The dictionary content is property of their respective owners.
