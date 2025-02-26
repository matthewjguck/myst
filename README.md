# Myst - A Chrome Extension for Media Awareness

![image](https://github.com/user-attachments/assets/c9e61bc1-9b8b-421c-9bd2-9e799a9c83a7)


## Inspiration
In today's digital age, many individuals engage only with content that reinforces their existing beliefs. Myst was created to break this cycle by providing real-time insights into users' media consumption habits, empowering them to make informed choices.

## What It Does
Myst is a Chrome Extension that:
- Captures screenshots of online activity upon tab changes and keystrokes.
- Analyzes content in real time using Vision-Language Models (VLMs).
- Generates a dynamic consumption vector across multiple categories:
  - **Motivational** (Optimistic vs. Pessimistic)
  - **Educational** (Informative vs. Brain Rot)
  - **Political** (Conservative vs. Liberal)
  - **Economic** (Capitalist vs. Socialist)
  - **Misinformation Detection**
- Displays an interactive 3D visualization of browsing trends.

## How We Built It
- Developed a Chrome Extension with automated screenshot capturing.
- Used OpenAI's GPT-4o and Mistral AI for content classification.
- Integrated a Flask backend for real-time processing.
- Leveraged Luma Labs to generate 3D visualizations of user trends.

## Challenges
- Debugging Flask backend and JSON formatting errors.
- Synchronizing user data across devices via a cloud-hosted database.

## Accomplishments
- Successfully built and deployed an end-to-end extension.
- Designed an intuitive UI and interactive 3D visualization.
- Integrated real-time classification and sentiment analysis.

## What We Learned
- Building a full Chrome Extension with background scripts.
- Using Vision-Language Models for media classification.
- Hosting and integrating a Flask backend.
- Creating generative AI-driven 3D visualizations.

## Future Plans
- **Improve Classification Accuracy**: Refine sentiment analysis and misinformation detection.
- **Global User Trends**: Provide anonymized insights into broader media consumption patterns.
- **Personalized Recommendations**: Suggest diverse content to encourage balanced media exposure.

## Built With
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask, Python
- **AI/ML**: OpenAI GPT-4o, Mistral AI, TogetherAI
- **Visualization**: Luma Labs

---
🚀 *Break your content bubble with Myst!*
