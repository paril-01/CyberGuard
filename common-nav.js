// Common Navigation Component for CyberGuard

class CyberGuardNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Add event listeners to navigation links
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.highlightCurrentPage();
        });
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Prevent default only if it's not an external link
                if (!item.getAttribute('href').startsWith('http')) {
                    e.preventDefault();
                    const targetPage = item.getAttribute('href');
                    window.location.href = targetPage;
                }
            });
        });
    }

    highlightCurrentPage() {
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Find and highlight the corresponding nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Initialize navigation when script is loaded
const cyberGuardNav = new CyberGuardNavigation();