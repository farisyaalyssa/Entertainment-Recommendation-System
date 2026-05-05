// Navigation Manager
class NavigationManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupNavbarScroll();
        this.setupSearch();
        this.setupContentCarousels();
    }
    
    // Navbar scroll effect
    setupNavbarScroll() {
        const navbar = document.getElementById('mainNavbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Search functionality
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            }, 300);
        });
    }
    
    // Perform search
    async performSearch(query) {
        // Mock search - replace with actual API
        console.log('Searching for:', query);
        // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
    
    // Setup horizontal scrolling for content rows
    setupContentCarousels() {
        const rows = document.querySelectorAll('.row-content');
        rows.forEach(row => {
            let isDown = false;
            let startX;
            let scrollLeft;
            
            row.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - row.offsetLeft;
                scrollLeft = row.scrollLeft;
            });
            
            row.addEventListener('mouseleave', () => {
                isDown = false;
            });
            
            row.addEventListener('mouseup', () => {
                isDown = false;
            });
            
            row.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - row.offsetLeft;
                const walk = (x - startX) * 2;
                row.scrollLeft = scrollLeft - walk;
            });
        });
    }
}

// Initialize navigation
const navigation = new NavigationManager();