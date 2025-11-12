// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab pane
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(targetTab).classList.add('active');
    });
});

// Common Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const loadingMessage = document.getElementById('loadingMessage');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

function showLoading(message = 'Processing your request...') {
    loadingMessage.textContent = message;
    loadingSpinner.style.display = 'block';
    hideError();
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

function hideError() {
    errorSection.style.display = 'none';
}

// ============================================================================
// PR ANALYZER
// ============================================================================

const prAnalyzerForm = document.getElementById('prAnalyzerForm');
const prResults = document.getElementById('prResults');

prAnalyzerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ticketId = document.getElementById('prTicketId').value.trim();
    const prUrls = document.getElementById('prUrls').value.trim();
    
    if (!ticketId) {
        showError('Please enter a JIRA ticket ID');
        return;
    }
    
    try {
        showLoading('Analyzing Pull Requests... This may take a minute.');
        prResults.style.display = 'none';
        
        const response = await fetch('/api/pr-analyzer/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId, prUrls })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze PRs');
        }
        
        displayPRResults(data);
        prResults.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

function displayPRResults(data) {
    let html = '<div class="card">';
    html += `<h2>📊 PR Analysis Results for ${data.jiraTicket.key}</h2>`;
    html += `<p><strong>Summary:</strong> ${data.jiraTicket.summary}</p>`;
    html += `<p><strong>Status:</strong> ${data.jiraTicket.status}</p>`;
    
    if (data.jiraTicket.acceptanceCriteria && data.jiraTicket.acceptanceCriteria !== 'No acceptance criteria found') {
        html += '<details style="margin-top: 15px;"><summary style="cursor: pointer; font-weight: 600;">Acceptance Criteria</summary>';
        html += `<pre style="margin-top: 10px;">${data.jiraTicket.acceptanceCriteria}</pre></details>`;
    }
    html += '</div>';
    
    if (data.results && data.results.length > 0) {
        data.results.forEach((result, index) => {
            html += '<div class="result-card">';
            html += `<div class="result-header">`;
            html += `<h3>PR #${result.prInfo.number} - ${result.prInfo.title}</h3>`;
            html += `</div>`;
            html += `<p><strong>Repository:</strong> ${result.prInfo.owner}/${result.prInfo.repo}</p>`;
            html += `<p><strong>Files Changed:</strong> ${result.filesCount}</p>`;
            html += `<p><strong>URL:</strong> <a href="${result.prInfo.url}" target="_blank">${result.prInfo.url}</a></p>`;
            html += '<h4 style="margin-top: 20px;">Analysis:</h4>';
            html += `<pre>${result.analysis}</pre>`;
            html += '</div>';
        });
    }
    
    prResults.innerHTML = html;
}

// ============================================================================
// QA AGENT
// ============================================================================

const qaAgentForm = document.getElementById('qaAgentForm');
const qaResults = document.getElementById('qaResults');

qaAgentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ticketId = document.getElementById('qaTicketId').value.trim();
    const portalUrl = document.getElementById('portalUrl').value.trim();
    
    if (!ticketId || !portalUrl) {
        showError('Please enter both ticket ID and portal URL');
        return;
    }
    
    try {
        showLoading('Running automated tests... This may take 30-60 seconds.');
        qaResults.style.display = 'none';
        
        const response = await fetch('/api/qa-agent/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId, portalUrl })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to run tests');
        }
        
        displayQAResults(data);
        qaResults.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

function displayQAResults(data) {
    let html = '<div class="card">';
    html += `<div class="result-header">`;
    html += `<h2>🧪 QA Test Results for ${data.ticket.key}</h2>`;
    html += `<span class="badge ${data.allTestsPassed ? 'badge-success' : 'badge-danger'}">${data.allTestsPassed ? '✓ All Passed' : '✗ Some Failed'}</span>`;
    html += `</div>`;
    html += `<p><strong>Summary:</strong> ${data.ticket.summary}</p>`;
    html += `<p><strong>Tests:</strong> ${data.results.passed}/${data.results.total} passed</p>`;
    html += '</div>';
    
    if (data.results.tests && data.results.tests.length > 0) {
        html += '<div class="card"><h3>Test Results</h3>';
        data.results.tests.forEach((test, index) => {
            const icon = test.passed ? '✅' : '❌';
            html += `<div class="result-card" style="border-left-color: ${test.passed ? 'var(--success)' : 'var(--danger)'}">`;
            html += `<h4>${icon} ${test.description}</h4>`;
            html += `<p><strong>Action:</strong> ${test.action}</p>`;
            html += `<p><strong>Target:</strong> ${test.target}</p>`;
            html += `<p><strong>Expected:</strong> ${test.expected}</p>`;
            if (test.actual) {
                html += `<p><strong>Actual:</strong> ${test.actual}</p>`;
            }
            if (test.error) {
                html += `<p style="color: var(--danger);"><strong>Error:</strong> ${test.error}</p>`;
            }
            html += '</div>';
        });
        html += '</div>';
    }
    
    if (data.report) {
        html += '<div class="card">';
        html += '<h3>AI-Generated Report</h3>';
        html += `<pre>${data.report}</pre>`;
        html += '</div>';
    }
    
    qaResults.innerHTML = html;
}

// ============================================================================
// TICKET CREATOR
// ============================================================================

// Mode Toggle
const quickModeBtn = document.getElementById('quickModeBtn');
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const quickModeSection = document.getElementById('quickModeSection');
const aiAssistantSection = document.getElementById('aiAssistantSection');
const ticketResults = document.getElementById('ticketResults');

let currentMode = 'quick';
let chatSessionId = null;

quickModeBtn.addEventListener('click', () => {
    currentMode = 'quick';
    quickModeBtn.classList.add('active');
    aiAssistantBtn.classList.remove('active');
    quickModeSection.style.display = 'block';
    aiAssistantSection.style.display = 'none';
    ticketResults.style.display = 'none';
});

aiAssistantBtn.addEventListener('click', () => {
    currentMode = 'assistant';
    aiAssistantBtn.classList.add('active');
    quickModeBtn.classList.remove('active');
    aiAssistantSection.style.display = 'block';
    quickModeSection.style.display = 'none';
    ticketResults.style.display = 'none';
    
    if (!chatSessionId) {
        initializeChat();
    }
});

// Quick Mode
const ticketForm = document.getElementById('ticketForm');
const createBtn = document.getElementById('createBtn');

ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateTicket(false);
});

createBtn.addEventListener('click', () => generateTicket(true));

async function generateTicket(create = false) {
    const taskDescription = document.getElementById('taskDescription').value.trim();
    
    if (!taskDescription) {
        showError('Please enter a task description');
        return;
    }
    
    try {
        showLoading(create ? 'Creating ticket in JIRA...' : 'Generating preview...');
        ticketResults.style.display = 'none';
        
        const endpoint = create ? '/api/ticket-creator/create' : '/api/ticket-creator/generate';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskDescription })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process ticket');
        }
        
        displayTicketResults(data, create);
        ticketResults.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// AI Assistant Mode
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatActions = document.getElementById('chatActions');
const generateFromChatBtn = document.getElementById('generateFromChatBtn');
const createFromChatBtn = document.getElementById('createFromChatBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendChatMessage();
});

// Handle Enter key to send message (Shift+Enter for new line)
chatInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await sendChatMessage();
    }
});

generateFromChatBtn.addEventListener('click', () => generateTicketFromChat(false));
createFromChatBtn.addEventListener('click', () => generateTicketFromChat(true));

// ============================================================================
// VOICE RECOGNITION
// ============================================================================

let recognition = null;
let isRecording = false;

// Check if browser supports Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Handle recognition results
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update the input with transcription
        if (finalTranscript) {
            chatInput.value += finalTranscript;
        }
        
        // Show interim results in placeholder or as overlay
        if (interimTranscript && !finalTranscript) {
            chatInput.placeholder = `Listening: ${interimTranscript}...`;
        }
    };
    
    // Handle recognition errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
        
        let errorMsg = 'Voice recognition error. ';
        if (event.error === 'no-speech') {
            errorMsg += 'No speech detected. Please try again.';
        } else if (event.error === 'not-allowed') {
            errorMsg += 'Microphone access denied. Please allow microphone access.';
        } else {
            errorMsg += event.error;
        }
        showError(errorMsg);
    };
    
    // Handle recognition end
    recognition.onend = () => {
        if (isRecording) {
            // If we're still supposed to be recording, restart
            try {
                recognition.start();
            } catch (e) {
                stopRecording();
            }
        } else {
            stopRecording();
        }
    };
    
    // Voice button click handler
    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
} else {
    // Browser doesn't support speech recognition
    voiceBtn.disabled = true;
    voiceBtn.title = 'Voice input not supported in this browser';
    voiceBtn.style.opacity = '0.5';
    console.warn('Web Speech API not supported in this browser');
}

function startRecording() {
    if (!recognition) return;
    
    try {
        isRecording = true;
        recognition.start();
        
        // Update UI
        voiceBtn.classList.add('recording');
        voiceBtn.textContent = '⏹️'; // Stop icon
        voiceStatus.style.display = 'flex';
        chatInput.placeholder = 'Listening...';
        
        // Disable send button while recording
        document.getElementById('sendMessageBtn').disabled = true;
    } catch (error) {
        console.error('Error starting recognition:', error);
        stopRecording();
    }
}

function stopRecording() {
    if (!recognition) return;
    
    try {
        isRecording = false;
        recognition.stop();
        
        // Update UI
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤'; // Microphone icon
        voiceStatus.style.display = 'none';
        chatInput.placeholder = 'Type your message or use voice...';
        
        // Re-enable send button
        document.getElementById('sendMessageBtn').disabled = false;
        
        // Focus on input
        chatInput.focus();
    } catch (error) {
        console.error('Error stopping recognition:', error);
    }
}

async function initializeChat() {
    try {
        const response = await fetch('/api/ticket-creator/chat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to start chat');
        }
        
        chatSessionId = data.sessionId;
        addChatMessage('assistant', data.message);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

async function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    chatInput.value = '';
    
    try {
        const response = await fetch('/api/ticket-creator/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: chatSessionId, message })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send message');
        }
        
        addChatMessage('assistant', data.message);
        
        if (data.isComplete) {
            chatActions.style.display = 'flex';
            chatInput.disabled = true;
            setTimeout(() => {
                addChatMessage('assistant', '✅ Great! I have gathered all the information. You can now generate a preview or create the ticket directly in JIRA.');
            }, 500);
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

function addChatMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = `chat-avatar ${role}`;
    avatar.textContent = role === 'assistant' ? 'AI' : 'You';
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function generateTicketFromChat(create = false) {
    try {
        showLoading(create ? 'Creating ticket in JIRA...' : 'Generating preview...');
        ticketResults.style.display = 'none';
        
        const endpoint = create ? '/api/ticket-creator/chat/create' : '/api/ticket-creator/chat/generate';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: chatSessionId })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process ticket');
        }
        
        displayTicketResults(data, create);
        ticketResults.style.display = 'block';
        
        if (create) {
            // Reset chat
            chatSessionId = null;
            chatMessages.innerHTML = '';
            chatActions.style.display = 'none';
            chatInput.disabled = false;
            setTimeout(() => initializeChat(), 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayTicketResults(data, wasCreated) {
    let html = '<div class="card">';
    
    if (wasCreated && data.jiraResponse) {
        html += '<div class="badge badge-success" style="margin-bottom: 15px;">✓ Ticket Created Successfully!</div>';
        if (data.jiraResponse.key) {
            html += `<p><strong>Ticket Key:</strong> ${data.jiraResponse.key}</p>`;
        }
    } else {
        html += '<h2>🎫 Ticket Preview</h2>';
    }
    
    if (data.ticketContent && data.ticketContent.fields) {
        const fields = data.ticketContent.fields;
        
        if (fields.summary) {
            html += `<h3 style="margin-top: 20px;">${fields.summary}</h3>`;
        }
        
        if (fields.description) {
            html += '<h4 style="margin-top: 15px;">Description:</h4>';
            html += `<pre>${JSON.stringify(fields.description, null, 2)}</pre>`;
        }
        
        if (fields.customfield_10115) {
            html += '<h4 style="margin-top: 15px;">Acceptance Criteria:</h4>';
            html += `<pre>${JSON.stringify(fields.customfield_10115, null, 2)}</pre>`;
        }
    }
    
    html += '<h4 style="margin-top: 20px;">Full JSON:</h4>';
    html += `<pre>${JSON.stringify(data.ticketContent, null, 2)}</pre>`;
    html += '</div>';
    
    ticketResults.innerHTML = html;
}

