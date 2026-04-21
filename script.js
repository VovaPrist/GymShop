class MenuManager {
    constructor() {
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.menuButton = document.querySelector('[alt="menu"]');
        this.isDesktop = window.innerWidth >= 1025;
        
        this.initializeEventListeners();
        this.handleWindowResize();
    }

    initializeEventListeners() {
        if (this.menuButton) {
            this.menuButton.addEventListener('click', () => {
                if (window.innerWidth < 1025) {
                    this.toggleMenu();
                }
            });

            if (this.isDesktop) {
                const header = document.querySelector('header');
                
                header.addEventListener('mouseenter', () => {
                    this.showMenu();
                });

                header.addEventListener('mouseleave', () => {
                    this.hideMenu();
                });

                this.dropdownMenu.addEventListener('mouseenter', () => {
                    this.showMenu();
                });

                this.dropdownMenu.addEventListener('mouseleave', () => {
                    this.hideMenu();
                });
            }
        }

        const menuLinks = this.dropdownMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hideMenu();
            });
        });

        window.addEventListener('resize', () => this.handleWindowResize());
    }

    toggleMenu() {
        this.dropdownMenu.classList.toggle('active');
    }

    showMenu() {
        this.dropdownMenu.classList.add('active');
    }

    hideMenu() {
        this.dropdownMenu.classList.remove('active');
    }

    handleWindowResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth >= 1025;

        if (wasDesktop !== this.isDesktop) {
            this.dropdownMenu.classList.remove('active');
        }
    }
}

// Initialize the MenuManager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MenuManager();
});