// Slideshow functionality
let currentSlide = 0;
let autoSlideInterval;
const autoSlideDelay = 4000; // 4 seconds between auto-transitions

// Get all slides and navigation elements
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.arrow.prev');
const nextBtn = document.querySelector('.arrow.next');
const currentSlideCounter = document.querySelector('.current-slide');
const totalSlidesCounter = document.querySelector('.total-slides');

// Set total slides
totalSlidesCounter.textContent = slides.length;

// Show specific slide
function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Wrap around if index is out of bounds
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
}

// Next slide
function nextSlide() {
    showSlide(currentSlide + 1);
    resetAutoSlide();
}

// Previous slide
function prevSlide() {
    showSlide(currentSlide - 1);
    resetAutoSlide();
}

// Start automatic slideshow
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, autoSlideDelay);
}

// Reset automatic slideshow (when user manually navigates)
function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Event listeners for navigation arrows
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped left - next slide
        nextSlide();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped right - previous slide
        prevSlide();
    }
}

// Pause auto-slide when page is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(autoSlideInterval);
    } else {
        startAutoSlide();
    }
});

// Initialize slideshow
showSlide(0);
startAutoSlide();