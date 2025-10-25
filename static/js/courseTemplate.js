// Video player functionality

const baseUrl = `${location.protocol}//${location.host}`;


const fetchroutes = async (route) => {

    try {

        // console.log(`Fetching data from: ${baseUrl}/api/${route}`);
        const response = await fetch(`${baseUrl}/api/${route}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }

}

const api = {
    addCompleteCourses:(courseId) => fetchroutes(`courseComplition/${courseId}`),
}


document.addEventListener('DOMContentLoaded', function() {
    // Video controls
    const videoPlayer = document.querySelector('.video-player');
    const playButton = document.querySelector('.control-btn');
    const progressBar = document.querySelector('.progress-fill');
    const progressHandle = document.querySelector('.progress-handle');
    
    let isPlaying = false;
    let currentTime = 0;
    const totalTime = 864; // 14:24 in seconds
    
    // Play/Pause functionality
    if (playButton) {
        playButton.addEventListener('click', function() {
            isPlaying = !isPlaying;
            const icon = this.querySelector('svg path');
            
            if (isPlaying) {
                // Change to pause icon
                icon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
                startProgress();
            } else {
                // Change to play icon
                icon.setAttribute('d', 'M8 5v14l11-7z');
                stopProgress();
            }
        });
    }
    
    // Progress bar functionality
    let progressInterval;
    
    function startProgress() {
        progressInterval = setInterval(function() {
            currentTime += 1;
            const percentage = (currentTime / totalTime) * 100;
            
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            if (progressHandle) {
                progressHandle.style.left = percentage + '%';
            }
            
            updateTimeDisplay();
            
            if (currentTime >= totalTime) {
                stopProgress();
                isPlaying = false;
                // Reset play button icon
                const icon = playButton.querySelector('svg path');
                icon.setAttribute('d', 'M8 5v14l11-7z');
            }
        }, 1000);
    }
    
    function stopProgress() {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
    }
    
    function updateTimeDisplay() {
        const timeDisplay = document.querySelector('.time-display');
        if (timeDisplay) {
            const currentMinutes = Math.floor(currentTime / 60);
            const currentSeconds = currentTime % 60;
            const totalMinutes = Math.floor(totalTime / 60);
            const totalSecondsRemainder = totalTime % 60;
            
            timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSecondsRemainder.toString().padStart(2, '0')}`;
        }
    }
    
    // Like button functionality
    const likeButton = document.querySelector('.like-btn');
    let isLiked = false;
    let likeCount = 4200;
    
    if (likeButton) {
        likeButton.addEventListener('click', function() {
            isLiked = !isLiked;
            const countSpan = this.textContent.trim().split(' ')[1];
            
            if (isLiked) {
                likeCount += 1;
                this.style.backgroundColor = '#dbeafe';
                this.style.color = '#1e40af';
            } else {
                likeCount -= 1;
                this.style.backgroundColor = '';
                this.style.color = '';
            }
            
            // Update like count display
            const newCount = likeCount >= 1000 ? (likeCount / 1000).toFixed(1) + 'K' : likeCount.toString();
            this.innerHTML = this.innerHTML.replace(/[\d.]+K?/, newCount);
        });
    }
    
    // Module item interactions
    const moduleItems = document.querySelectorAll('.module-item:not(.locked)');
    moduleItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // Remove current class from all items
            moduleItems.forEach(function(module) {
                module.classList.remove('current');
            });
            
            // Add current class to clicked item if it's not completed
            if (!this.classList.contains('completed')) {
                this.classList.add('current');
            }
        });
    });
    
    // Resource item interactions
    const resourceItems = document.querySelectorAll('.resource-item');
    resourceItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const title = this.querySelector('.resource-title').textContent;
            alert(`Opening: ${title}`);
        });
    });
    
    // Action button functionality
    const nextLessonBtn = document.querySelector('.btn-primary');
    const notesBtn = document.querySelector('.btn-outline');
    
    if (nextLessonBtn) {
        nextLessonBtn.addEventListener('click', function() {
            // Find current module and move to next
            const currentModule = document.querySelector('.module-item.current');
            if (currentModule) {
                const nextModule = currentModule.nextElementSibling;
                if (nextModule && !nextModule.classList.contains('locked')) {
                    currentModule.classList.remove('current');
                    currentModule.classList.add('completed');
                    
                    // Update icon to completed
                    const icon = currentModule.querySelector('.module-icon');
                    icon.className = 'module-icon completed-icon';
                    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
                    
                    nextModule.classList.add('current');
                    
                    // Update progress bar
                    const completedModules = document.querySelectorAll('.module-item.completed').length;
                    const totalModules = document.querySelectorAll('.module-item').length;
                    const newProgress = (completedModules / totalModules) * 100;
                    
                    const progressBarFill = document.querySelector('.progress-bar-fill');
                    if (progressBarFill) {
                        progressBarFill.style.width = newProgress + '%';
                    }
                    
                    // Update progress text
                    const progressText = document.querySelector('.progress-text');
                    if (progressText) {
                        progressText.textContent = `${Math.round(newProgress)}% Complete • ${completedModules + 1} of ${totalModules} lessons`;
                    }
                }
            }
        });
    }
    
    if (notesBtn) {
        notesBtn.addEventListener('click', function() {
            alert('Notes feature coming soon!');
        });
    }
    
    // Initialize time display
    updateTimeDisplay();

    const video = document.querySelector('.video-player-element');
    let lastAllowedTime = 0;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause when tab is not visible
            if (!video.paused) {
                video.pause();
                // console.log('⏸ Video paused because tab is hidden');
            }
        }
    });

    video.addEventListener('timeupdate', () => {
        if (video.currentTime > lastAllowedTime) {
            lastAllowedTime = video.currentTime;
        }
    });

    // Prevent skipping forward
    video.addEventListener('seeking', () => {
        if (video.currentTime > lastAllowedTime + 0.5) {
            // console.log('⛔ Skipping forward is disabled');
            video.currentTime = lastAllowedTime;
        }
    });

    video.addEventListener("ended", async () => {
    // console.log("Video has finished playing!");

    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");

    let data = await api.addCompleteCourses(courseId);
    // console.log("Course completion data:", data);
  

    alert("The video is over!");
  });
    
});