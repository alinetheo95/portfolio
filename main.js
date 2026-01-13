function scrollToContent() {
    document.getElementById('content').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Add smooth scroll behavior on page load
window.addEventListener('load', function() {
    // Optional: Add any initialization code here
});

// Hide scroll indicator after scrolling past hero
window.addEventListener('scroll', function() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
});