/**
 * WatchLy - Home Page Module
 * Handles hero carousel, content rows, and user interactions
 */

const Home = (() => {
    // Configuration
    const CONFIG = {
        carousel: {
            interval: 6000,
            transition: 800
        },
        content: {
            cardsPerRow: { desktop: 6, tablet: 4, mobile: 3 }
        }
    };

    // State
    let state = {
        currentSlide: 0,
        totalSlides: 3,
        carouselTimer: null,
        userData: null
    };

    // DOM Elements (cached)
    const elements = {};

    /**
     * Initialize the home page
     */
    function init() {
        cacheElements();
        loadUserData();
        setupEventListeners();
        initHeroCarousel();
        populateContentRows();
        setupScrollEffects();
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements.hero = {
            slides: document.querySelectorAll('.hero-slide'),
            indicators: document.querySelectorAll('.indicator'),
            prevBtn: document.getElementById('heroPrev'),
            nextBtn: document.getElementById('heroNext'),
            indicatorsContainer: document.getElementById('heroIndicators')
        };
        
        elements.nav = {
            navbar: document.getElementById('mainNavbar'),
            searchBox: document.getElementById('searchBox'),
            searchToggle: document.getElementById('searchToggle'),
            searchClose: document.getElementById('searchClose'),
            searchInput: document.getElementById('searchInput'),
            avatarBtn: document.getElementById('avatarBtn'),
            userDropdown: document.getElementById('userDropdown')
        };
        
        elements.rows = {
            continue: document.getElementById('continueRow'),
            recommended: document.getElementById('recommendedRow'),
            trending: document.getElementById('trendingRow'),
            topMovies: document.getElementById('topMoviesRow'),
            because: document.getElementById('becauseRow')
        };
    }

    /**
     * Load user data from localStorage
     */
    function loadUserData() {
        try {
            const session = localStorage.getItem('watchly_session');
            const preferences = localStorage.getItem('watchly_preferences');
            
            if (session) {
                state.userData = JSON.parse(session).user;
                updateAvatar();
            }
            
            if (preferences) {
                const prefs = JSON.parse(preferences);
                personalizeContent(prefs);
            }
        } catch (error) {
            console.warn('Failed to load user data:', error);
        }
    }

    /**
     * Update user avatar in navbar
     */
    function updateAvatar() {
        if (state.userData?.name && elements.nav.avatarBtn) {
            const initial = state.userData.name.charAt(0).toUpperCase();
            document.getElementById('userAvatar').textContent = initial;
        }
    }

    /**
     * Personalize content based on user preferences
     */
    function personalizeContent(preferences) {
        // This would fetch personalized content from API
        // For now, we'll just log it
        console.log('Personalizing for genres:', preferences.genres);
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Hero carousel controls
        if (elements.hero.prevBtn) {
            elements.hero.prevBtn.addEventListener('click', () => goToSlide(state.currentSlide - 1));
        }
        if (elements.hero.nextBtn) {
            elements.hero.nextBtn.addEventListener('click', () => goToSlide(state.currentSlide + 1));
        }
        
        // Hero indicators
        elements.hero.indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                goToSlide(slideIndex);
            });
        });
        
        // Search functionality
        if (elements.nav.searchToggle) {
            elements.nav.searchToggle.addEventListener('click', toggleSearch);
        }
        if (elements.nav.searchClose) {
            elements.nav.searchClose.addEventListener('click', toggleSearch);
        }
        if (elements.nav.searchInput) {
            elements.nav.searchInput.addEventListener('keypress', handleSearchSubmit);
        }
        
        // User dropdown
        if (elements.nav.avatarBtn) {
            elements.nav.avatarBtn.addEventListener('click', toggleUserDropdown);
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu') && elements.nav.userDropdown) {
                elements.nav.userDropdown.classList.remove('show');
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNav);
        
        // Window resize
        window.addEventListener('resize', Utils.debounce(handleResize, 250));
    }

    /**
     * Initialize hero carousel
     */
    function initHeroCarousel() {
        state.totalSlides = elements.hero.slides.length;
        startCarouselAutoPlay();
    }

    /**
     * Start auto-play for carousel
     */
    function startCarouselAutoPlay() {
        state.carouselTimer = setInterval(() => {
            goToSlide(state.currentSlide + 1);
        }, CONFIG.carousel.interval);
    }

    /**
     * Stop carousel auto-play
     */
    function stopCarouselAutoPlay() {
        if (state.carouselTimer) {
            clearInterval(state.carouselTimer);
            state.carouselTimer = null;
        }
    }

    /**
     * Go to specific slide
     */
    function goToSlide(index) {
        // Wrap around
        if (index < 0) index = state.totalSlides - 1;
        if (index >= state.totalSlides) index = 0;
        
        // Update slides
        elements.hero.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        // Update indicators
        elements.hero.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update state
        state.currentSlide = index;
        
        // Reset auto-play timer
        stopCarouselAutoPlay();
        startCarouselAutoPlay();
    }

    /**
     * Toggle search box
     */
    function toggleSearch() {
        elements.nav.searchBox.classList.toggle('active');
        
        if (elements.nav.searchBox.classList.contains('active')) {
            elements.nav.searchInput.focus();
            stopCarouselAutoPlay();
        } else {
            elements.nav.searchInput.value = '';
            startCarouselAutoPlay();
        }
    }

    /**
     * Handle search submission
     */
    function handleSearchSubmit(e) {
        if (e.key === 'Enter') {
            const query = elements.nav.searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    }

    /**
     * Perform search (mock)
     */
    function performSearch(query) {
        console.log('Searching for:', query);
        // Redirect to search page in production
        // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        alert(`Searching for: ${query}`);
    }

    /**
     * Toggle user dropdown menu
     */
    function toggleUserDropdown() {
        elements.nav.userDropdown.classList.toggle('show');
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyboardNav(e) {
        // Close dropdown on Escape
        if (e.key === 'Escape' && elements.nav.userDropdown?.classList.contains('show')) {
            elements.nav.userDropdown.classList.remove('show');
        }
        
        // Carousel navigation with arrow keys
        if (e.key === 'ArrowLeft') {
            goToSlide(state.currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
            goToSlide(state.currentSlide + 1);
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Could adjust cards per row based on screen size
        console.log('Window resized');
    }

    /**
     * Setup scroll effects for navbar
     */
    function setupScrollEffects() {
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.scrollY > 50) {
                elements.nav.navbar?.classList.add('scrolled');
            } else {
                elements.nav.navbar?.classList.remove('scrolled');
            }
        }, 100));
    }

    /**
     * Populate content rows with mock data
     */
    function populateContentRows() {
        const mockData = {
            continue: generateMockCards(5, 'continue'),
            recommended: generateMockCards(10, 'recommended'),
            trending: generateMockCards(10, 'trending'),
            topMovies: generateMockCards(8, 'top'),
            because: generateMockCards(10, 'because')
        };
        
        Object.entries(mockData).forEach(([rowId, cards]) => {
            const row = elements.rows[rowId];
            if (row) {
                row.innerHTML = cards.map(card => createCardHTML(card)).join('');
                addCardEventListeners(row);
            }
        });
    }

    /**
     * Generate mock card data
     */
    function generateMockCards(count, type) {
        const titles = [
            'Action Movie', 'Drama Series', 'Sci-Fi Adventure', 'Thriller',
            'Comedy', 'Romance', 'Documentary', 'Horror', 'Fantasy', 'Animation'
        ];
        
        const posters = [
            '1E5baAaEse26fej7uHkjJDveEs7',
            '8UlWHLMpgZm9bx6QYh0NFoq67TZ',
            'q6y0Go1tsGEsmtFryDOJo3dEmqu',
            'rCzpDGLbOoPwLjy3OAm5NUPOTrC',
            '7WsyChQLEftFiDOVTGkv3hFpyyt',
            'pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK',
            'fiVW06jz8zRRHuhqaLHdJY4S7mE',
            '8Vt6mWEReuy4Of61Lnj5Xj704m8',
            '1NqwE6LP9IEdOZ57WCTHOxdNsH',
            't6HIqrRAclMCA60NsSmeqe9RmNV'
        ];
        
        return Array.from({ length: count }, (_, i) => ({
            id: `${type}-${i}`,
            title: titles[i % titles.length],
            rating: (Math.random() * 2 + 7).toFixed(1),
            poster: `https://image.tmdb.org/t/p/w500/${posters[i % posters.length]}.jpg`,
            progress: type === 'continue' ? Math.floor(Math.random() * 100) : null
        }));
    }

    /**
     * Create card HTML
     */
    function createCardHTML(card) {
        const progressHTML = card.progress 
            ? `<div class="progress-bar" style="width: ${card.progress}%"></div>` 
            : '';
        
        return `
            <article class="content-card ${card.progress ? 'has-progress' : ''}" 
                     data-id="${card.id}" 
                     tabindex="0"
                     role="button"
                     aria-label="View ${card.title}">
                <img src="${card.poster}" alt="${card.title}" loading="lazy">
                ${progressHTML}
                <div class="card-overlay">
                    <h4>${card.title}</h4>
                    <p><i class="fas fa-star"></i> ${card.rating}</p>
                    <button class="btn-add" aria-label="Add ${card.title} to watchlist">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </article>
        `;
    }

    /**
     * Add event listeners to cards
     */
    function addCardEventListeners(row) {
        row.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-add')) {
                    const id = card.dataset.id;
                    viewContent(id);
                }
            });
            
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.target.closest('.btn-add')) {
                    const id = card.dataset.id;
                    viewContent(id);
                }
            });
        });
        
        row.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.content-card');
                const id = card?.dataset.id;
                addToWatchlist(id);
            });
        });
    }

    /**
     * View content details
     */
    function viewContent(id) {
        console.log('Viewing content:', id);
        // window.location.href = `detail.html?id=${id}`;
    }

    /**
     * Add to watchlist
     */
    function addToWatchlist(id) {
        console.log('Added to watchlist:', id);
        // Show feedback
        const btn = event?.target?.closest('.btn-add');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = 'var(--success-color)';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-plus"></i>';
                btn.style.background = '';
            }, 1500);
        }
    }

    /**
     * Play content (mock)
     */
    function playContent(id) {
        console.log('Playing content:', id);
        alert('Playing content... (This would launch the video player)');
    }

    // Public API
    return {
        init,
        goToSlide,
        addToWatchlist,
        playContent
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Home.init();
});

// Make functions available globally for HTML onclick handlers
window.addToWatchlist = Home.addToWatchlist;
window.playContent = Home.playContent;