// Smooth scroll to content section
function scrollToContent() {
    document.getElementById('page-2').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Fade out scroll hint after user starts scrolling
window.addEventListener('scroll', function() {
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        if (window.scrollY > 80) {
            scrollHint.style.opacity = '0';
            scrollHint.style.transition = 'opacity 0.4s ease';
        } else {
            scrollHint.style.opacity = '1';
        }
    }
});