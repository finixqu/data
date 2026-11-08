Liputan6 Scraper

A Node.js project for scraping article data from Liputan6.com.

Description

This project is used to collect article URLs from Liputan6.com and extract article metadata.

Workflow
1. Fetch sitemap data from Liputan6.com.
2. Extract article URLs from the sitemap.
3. Visit each article URL to retrieve its meta description.
4. Store the extracted description in the description field of each article object.
5. Save the updated data in JSON format.

Requirements
Node.js
npm
Axios

Installation

Install the project dependencies:
npm install

Usage

Run the scraper:
node sitemap.extractor.js


Run the description updater:
node description.update.js
