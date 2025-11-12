# Changelog

All notable changes to the Personal Helper project will be documented in this file.

## [1.1.0] - 2025-11-11

### 🎤 Added - Voice Input Feature
- **Voice Recognition**: Added speech-to-text capability in AI Assistant chat mode
- **Microphone Button**: Purple 🎤 button next to send button in chat interface
- **Visual Feedback**: 
  - Red pulsing button animation while recording
  - Yellow "Listening..." status banner
  - Live transcription preview
- **Browser Support**: Works in Chrome, Edge, Safari, and Opera
- **Smart Controls**:
  - Click 🎤 to start recording
  - Click ⏹️ to stop recording
  - Auto-append transcribed text to input field
  - Edit transcription before sending
- **Error Handling**: Graceful fallback for unsupported browsers
- **Documentation**: Added comprehensive VOICE_FEATURE.md guide

### 🔧 Technical Details
- Implemented using Web Speech Recognition API
- Continuous listening mode with interim results
- English language support
- No backend changes required
- Browser-native implementation

### 📝 Documentation Updates
- Updated README.md with voice feature information
- Created VOICE_FEATURE.md with detailed usage guide
- Added troubleshooting section for voice input
- Created CHANGELOG.md (this file)

### 🎨 UI/UX Improvements
- New microphone button with hover effects
- Pulsing animation for recording state
- Live status indicator
- Smooth transitions between states
- Consistent design with existing interface

---

## [1.0.0] - 2025-11-11

### 🎉 Initial Release - Unified Developer Tools

#### Features
- **PR Analyzer**: Analyze GitHub PRs with AI-powered code review
- **QA Agent**: Automated acceptance testing with browser automation
- **Ticket Creator**: AI-assisted JIRA ticket creation with chat interface

#### Tools Integration
- Unified three separate projects into one application
- Single Express server with all functionalities
- Shared JIRA service across all tools
- Common AI services (Anthropic + OpenAI)
- Consistent UI/UX with tab navigation

#### Technical Stack
- Backend: Node.js, TypeScript, Express
- Frontend: Vanilla JavaScript, HTML5, CSS3
- AI: Anthropic Claude 3.5 Sonnet, OpenAI GPT-4
- Automation: Puppeteer
- APIs: JIRA REST API, GitHub REST API

#### Documentation
- Comprehensive README.md
- Detailed SETUP.md guide
- Project summary documentation
- Environment configuration templates

---

## Future Plans

### Potential Enhancements
- [ ] Multi-language support for voice input
- [ ] Voice playback of AI responses
- [ ] Custom voice commands and shortcuts
- [ ] Offline voice recognition capability
- [ ] Team collaboration features
- [ ] History and analytics
- [ ] Saved preferences and templates
- [ ] Batch operations support

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).

