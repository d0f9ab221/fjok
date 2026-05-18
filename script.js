// Frontend JavaScript for YouTube Channel Profiler
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('channelForm');
    const channelUrlInput = document.getElementById('channelUrl');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Form submission handler
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await generateProfile();
    });
    
    // Button click handler
    generateBtn.addEventListener('click', async () => {
        await generateProfile();
    });
    
    async function generateProfile() {
        // Reset UI
        resultContainer.innerHTML = '';
        errorMessage.textContent = '';
        generateBtn.disabled = true;
        loadingIndicator.style.display = 'block';
        
        const channelUrl = channelUrlInput.value.trim();
        
        if (!channelUrl) {
            showError('Please enter a YouTube channel URL');
            return;
        }
        
        try {
            const response = await fetch('/api/generate-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ channelUrl })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessageText = errorData.error || `Request failed with status ${response.status}`;
                throw new Error(errorMessageText);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display the profile
            displayProfile(data);
            
        } catch (error) {
            showError(error.message);
        } finally {
            generateBtn.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }
    
    function displayProfile(data) {
        const { channel, subscribeButton } = data;
        
        // Create profile HTML
        const profileHTML = `
            <div class="profile-card">
                <img src="${channel.logo}" alt="${channel.name} Logo" class="channel-logo">
                <h2 class="channel-name">${channel.name}</h2>
                <div class="subscribe-section">
                    ${subscribeButton}
                </div>
                <p class="channel-id">Channel ID: ${channel.id}</p>
            </div>
        `;
        
        resultContainer.innerHTML = profileHTML;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
