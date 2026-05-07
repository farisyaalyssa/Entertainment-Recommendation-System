/**
 * WatchLy - Home Page Content Loader
 * Uses static mock data with correct TMDB image URLs
 */

// Mock data with CORRECT TMDB posters that match the titles
const homeContent = {
    continue: [
        { id: 155, title: "The Dark Knight", year: 2008, progress: 65, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
        { id: 27205, title: "Inception", year: 2010, progress: 30, poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
        { id: 157336, title: "Interstellar", year: 2014, progress: 85, poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
        { id: 438631, title: "Dune", year: 2021, progress: 12, poster: "https://image.tmdb.org/t/p/w500/d5NXSklpcvkC173QCnEh3w0VBgX.jpg" }
    ],
    recommended: [
        { id: 550, title: "Fight Club", year: 1999, rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
        { id: 13, title: "Forrest Gump", year: 1994, rating: 8.8, poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
        { id: 680, title: "Pulp Fiction", year: 1994, rating: 8.9, poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
        { id: 424, title: "Schindler's List", year: 1993, rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pTXMYXKd.jpg" },
        { id: 389, title: "12 Angry Men", year: 1957, rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg" },
        { id: 19404, title: "Dilwale Dulhania Le Jayenge", year: 1995, rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg" }
    ],
    trending: [
        { id: 94997, title: "House of the Dragon", year: 2022, rating: 8.5, poster: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg" },
        { id: 85271, title: "WandaVision", year: 2021, rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/glKDfE6btIRcVB5zrjspRIs4r52.jpg" },
        { id: 60735, title: "The Flash", year: 2023, rating: 7.0, poster: "https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg" },
        { id: 76479, title: "The Boys", year: 2019, rating: 8.7, poster: "https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg" },
        { id: 1396, title: "Breaking Bad", year: 2008, rating: 9.5, poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
        { id: 1668, title: "Friends", year: 1994, rating: 8.9, poster: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnGSEKJwv.jpg" }
    ],
    topMovies: [
        { id: 238, title: "The Godfather", year: 1972, rating: 9.2, poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
        { id: 278, title: "The Shawshank Redemption", year: 1994, rating: 9.3, poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" },
        { id: 424, title: "Schindler's List", year: 1993, rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pTXMYXKd.jpg" },
        { id: 389, title: "12 Angry Men", year: 1957, rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg" },
        { id: 129, title: "Spirited Away", year: 2001, rating: 8.6, poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg" },
        { id: 155, title: "The Dark Knight", year: 2008, rating: 9.0, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
    ],
    because: [
        { id: 245891, title: "John Wick", year: 2014, rating: 7.4, poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg" },
        { id: 324857, title: "Spider-Man: Into the Spider-Verse", year: 2018, rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg" },
        { id: 299536, title: "Avengers: Infinity War", year: 2018, rating: 8.3, poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
        { id: 299534, title: "Avengers: Endgame", year: 2019, rating: 8.4, poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
        { id: 1726, title: "Iron Man", year: 2008, rating: 7.9, poster: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg" },
        { id: 1771, title: "Captain America: The First Avenger", year: 2011, rating: 7.0, poster: "https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg" }
    ]
};

// Render a row of content cards
function renderContentRow(containerId, items, hasProgress = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map(item => {
        const progressHTML = hasProgress && item.progress 
            ? `<div class="progress-bar" style="width: ${item.progress}%"></div>` 
            : '';
        const ratingHTML = item.rating 
            ? `<p><i class="fas fa-star"></i> ${item.rating}</p>` 
            : '';

        return `
            <article class="content-card ${hasProgress ? 'has-progress' : ''}" 
                     data-id="${item.id}" 
                     tabindex="0"
                     role="button"
                     aria-label="View ${item.title}">
                <img src="${item.poster}" 
                     alt="${item.title}" 
                     class="card-poster"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/185x278/1a2d47/F63049?text=${encodeURIComponent(item.title)}'">
                ${progressHTML}
                <div class="card-overlay">
                    <h4>${item.title}</h4>
                    ${ratingHTML}
                    <p class="card-year">${item.year}</p>
                    <button class="btn-add" aria-label="Add ${item.title} to watchlist" onclick="event.stopPropagation(); addToWatchlist(${item.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </article>
        `;
    }).join('');

    // Add click handlers to cards
    container.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-add')) {
                const id = card.dataset.id;
                viewContent(id);
            }
        });
    });
}

// View content details (placeholder)
function viewContent(id) {
    console.log('Viewing content:', id);
    // For demo: alert instead of navigation
    alert(`Opening details for content ID: ${id}`);
    // In production: window.location.href = `content-detail.html?id=${id}&type=movie`;
}

// Add to watchlist (placeholder)
function addToWatchlist(id) {
    console.log('Added to watchlist:', id);
    // Visual feedback
    const btn = event?.target?.closest('.btn-add');
    if (btn) {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
            btn.style.background = '';
        }, 1200);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Render all content rows
    renderContentRow('continueRow', homeContent.continue, true);
    renderContentRow('recommendedRow', homeContent.recommended);
    renderContentRow('trendingRow', homeContent.trending);
    renderContentRow('topMoviesRow', homeContent.topMovies);
    renderContentRow('becauseRow', homeContent.because);

    // Setup hero carousel (basic version)
    setupHeroCarousel();
});

// Basic hero carousel logic
function setupHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    
    let current = 0;
    const total = slides.length;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        current = index;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        goToSlide((current - 1 + total) % total);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        goToSlide((current + 1) % total);
    });
    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => goToSlide(i));
    });

    // Auto-advance every 8 seconds
    setInterval(() => {
        goToSlide((current + 1) % total);
    }, 8000);
}