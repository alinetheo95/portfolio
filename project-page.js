// Slideshow functionality - simplified approach
let currentSlide = 0;
let autoSlideInterval = null;
let manualModeTimeout = null;

const AUTO_SLIDE_DELAY = 7000; // 7 seconds
const MANUAL_PAUSE_DURATION = 5000; // 10 seconds after manual navigation

// Get all slides and navigation elements
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.arrow.prev');
const nextBtn = document.querySelector('.arrow.next');
const currentSlideCounter = document.querySelector('.current-slide');
const totalSlidesCounter = document.querySelector('.total-slides');

// Set total slides
totalSlidesCounter.textContent = slides.length;

// Check if slide is a video
function isVideoSlide(index) {
    return slides[index].getAttribute('data-type') === 'video';
}

// Pause all videos
function pauseAllVideos() {
    slides.forEach(slide => {
        const video = slide.querySelector('video');
        if (video) {
            video.pause();
        }
    });
}

// Show specific slide
function showSlide(index) {
    // Pause all videos
    pauseAllVideos();
    
    // Remove active class from all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Wrap around if needed
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    // Add active class to current slide
    slides[currentSlide].classList.add('active');

    // Update counter
    currentSlideCounter.textContent = currentSlide + 1;

    // Auto-play video if current slide is a video
    if (isVideoSlide(currentSlide)) {
        const video = slides[currentSlide].querySelector('video');
        if (video) {
            video.play().catch(err => console.log('Video autoplay failed:', err));
        }
    }
}

// Start automatic slideshow
function startAutoSlide() {
    // Clear any existing interval first
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    
    autoSlideInterval = setInterval(() => {
        currentSlide++;
        showSlide(currentSlide);
    }, AUTO_SLIDE_DELAY);
}

// Stop automatic slideshow
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Handle manual navigation
function manualNavigate(direction) {
    // Stop auto-slide
    stopAutoSlide();
    
    // Clear any existing manual mode timeout
    if (manualModeTimeout) {
        clearTimeout(manualModeTimeout);
    }
    
    // Navigate
    if (direction === 'next') {
        currentSlide++;
    } else {
        currentSlide--;
    }
    showSlide(currentSlide);
    
    // Set timeout to resume auto-slide
    manualModeTimeout = setTimeout(() => {
        startAutoSlide();
    }, MANUAL_PAUSE_DURATION);
}

// Event listeners for navigation arrows
prevBtn.addEventListener('click', () => manualNavigate('prev'));
nextBtn.addEventListener('click', () => manualNavigate('next'));

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        manualNavigate('prev');
    } else if (e.key === 'ArrowRight') {
        manualNavigate('next');
    }
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            manualNavigate('next');
        } else {
            manualNavigate('prev');
        }
    }
});

// Pause when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoSlide();
        pauseAllVideos();
    } else if (!manualModeTimeout) {
        // Only restart if not in manual mode
        startAutoSlide();
    }
});

// Initialize
showSlide(0);
startAutoSlide();

// Magnifying glass effect for standalone images
document.addEventListener('DOMContentLoaded', function() {
    const zoomContainers = document.querySelectorAll('.zoom-container');
    
    zoomContainers.forEach(container => {
        const img = container.querySelector('img');
        
        // Create magnifying lens element
        const lens = document.createElement('div');
        lens.className = 'magnifier-lens';
        container.appendChild(lens);
        
        // Zoom level (3x magnification)
        const zoomLevel = 3;
        
        // Throttle function to improve performance
        let rafId = null;
        
        // Show lens on mouse enter
        container.addEventListener('mouseenter', function() {
            lens.style.display = 'block';
        });
        
        // Hide lens on mouse leave
        container.addEventListener('mouseleave', function() {
            lens.style.display = 'none';
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });
        
        // Move lens with mouse and show zoomed portion - optimized with requestAnimationFrame
        container.addEventListener('mousemove', function(e) {
            if (rafId) {
                return; // Skip if we're already processing
            }
            
            rafId = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Get image dimensions
                const imgRect = img.getBoundingClientRect();
                const imgX = e.clientX - imgRect.left;
                const imgY = e.clientY - imgRect.top;
                
                // Position the lens centered on cursor
                const lensSize = 150;
                const lensX = x - lensSize / 2;
                const lensY = y - lensSize / 2;
                
                // Keep lens within container bounds
                const maxX = rect.width - lensSize;
                const maxY = rect.height - lensSize;
                
                const boundedX = Math.max(0, Math.min(lensX, maxX));
                const boundedY = Math.max(0, Math.min(lensY, maxY));
                
                lens.style.left = boundedX + 'px';
                lens.style.top = boundedY + 'px';
                
                // Calculate background position to show exact cursor location in center of lens
                const bgX = imgX * zoomLevel - lensSize / 2;
                const bgY = imgY * zoomLevel - lensSize / 2;
                
                // Set the background image and position
                lens.style.backgroundImage = `url('${img.src}')`;
                lens.style.backgroundSize = `${imgRect.width * zoomLevel}px ${imgRect.height * zoomLevel}px`;
                lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
                
                rafId = null;
            });
        });
    });
});


