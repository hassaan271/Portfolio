// Custom Cursor Logic
const cursorOuter = document.getElementById('cursor-outer');
const cursorInner = document.getElementById('cursor-inner');

document.addEventListener('mousemove', (e) => {
    if (cursorInner) {
        cursorInner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }

    // Subtle delay for outer circle
    if (cursorOuter) {
        setTimeout(() => {
            cursorOuter.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`;
        }, 50);
    }
});

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursorOuter) {
            cursorOuter.style.width = '60px';
            cursorOuter.style.height = '60px';
            cursorOuter.style.background = 'rgba(255,255,255,0.1)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursorOuter) {
            cursorOuter.style.width = '40px';
            cursorOuter.style.height = '40px';
            cursorOuter.style.background = 'transparent';
        }
    });
});

// Intro Reveal Config
window.addEventListener('load', () => {
    document.body.classList.add('is-visible');

    // Intersection Observer for scroll elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-trigger').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });

    updateTime();
    setInterval(updateTime, 60000);
});

// Magnetic Button Glow
function moveGlow(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--x', x + 'px');
    btn.style.setProperty('--y', y + 'px');
}

// Time Update
function updateTime() {
    const timeEl = document.getElementById('time');
    if (timeEl) {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
}

// Auto-Fit Hero Text (CSS + JS Solution)
function fitHeroText() {
    const ids = ['hero-name-1', 'hero-name-2'];
    const maxWidth = window.innerWidth * 0.9; // 90% of screen width

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        // Reset to base size
        el.style.fontSize = '12vw';

        // Check if it exceeds width and scale down
        if (el.offsetWidth > maxWidth) {
            const scale = maxWidth / el.offsetWidth;
            // Current VW * Scale
            el.style.fontSize = (12 * scale) + 'vw';
        }
    });
}

window.addEventListener('resize', fitHeroText);
// Include in load
window.addEventListener('load', () => {
    fitHeroText();
});

// ------------------------------------------------------------------
// ELEVENLABS AUDIO INTEGRATION
// ------------------------------------------------------------------

const API_KEY = 'sk_81702bc105a69056f59bed8a32eecb512a47f637a1ee5552';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

let isSpeakerOn = false;
let currentAudio = null;
let playbackCounter = 0; // To track active requests

// Toggle Speaker
const speakerBtn = document.getElementById('speaker-toggle');
const speakerIcon = document.getElementById('speaker-icon');
const speakerFill = document.getElementById('speaker-fill');

if (speakerBtn) {
    speakerBtn.addEventListener('click', () => {
        isSpeakerOn = !isSpeakerOn;

        if (isSpeakerOn) {
            if (speakerIcon) {
                speakerIcon.classList.remove('fa-volume-mute');
                speakerIcon.classList.add('fa-volume-up');
                speakerIcon.style.color = 'white';
            }
            if (speakerFill) {
                speakerFill.style.transform = 'translateY(0)';
            }

            // Welcome Message
            speakText("System Online. Hover over projects to hear details.");
        } else {
            if (speakerIcon) {
                speakerIcon.classList.remove('fa-volume-up');
                speakerIcon.classList.add('fa-volume-mute');
                speakerIcon.style.color = 'black';
            }
            if (speakerFill) {
                speakerFill.style.transform = 'translateY(100%)';
            }

            // Stop Audio
            stopAudio();
        }
    });
}

// Audio Playback Logic
function stopAudio() {
    // Stop currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    // Invalidate any pending API requests
    playbackCounter++;
}

async function speakText(text) {
    if (!isSpeakerOn) return;

    // Stop any previous audio/requests
    stopAudio();

    // Create a generic error for API Key issues
    if (API_KEY.includes('YOUR_API_KEY')) {
        alert("Please update the API KEY in script.js to make audio work.");
        return;
    }

    // Capture the current ID
    const myRequestId = playbackCounter;

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_turbo_v2", // Faster model
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail?.message || 'API Request Failed');
        }

        const blob = await response.blob();

        // If a new request started while we were fetching, ignore this result
        if (myRequestId !== playbackCounter) return;

        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        currentAudio.play().catch(e => console.error("Playback error:", e));

    } catch (error) {
        console.error("ElevenLabs Error:", error);
        // Alert the user once if there's a serious error
        if (isSpeakerOn) {
            alert("Audio Error: " + error.message + "\nCheck your API Key quota.");
            // Turn off speaker to prevent spam
            speakerBtn.click();
        }
    }
}

// Hover Interaction for Projects
document.querySelectorAll('[data-read]').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (isSpeakerOn) {
            const textToRead = el.getAttribute('data-read');
            // Small debounce/delay could be added here if needed
            speakText(textToRead);
        }
    });
    // Optional: Stop audio when leaving the element?
    // el.addEventListener('mouseleave', stopAudio); 
});
