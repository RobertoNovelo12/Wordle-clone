(function() {
    
    function applyTheme(isDarkMode) {
        
        document.documentElement.classList.remove('dark', 'light');
        
        
        document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
        
        
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    
    function getInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    
    applyTheme(getInitialTheme());

    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches);
        }
    });

    
    window.themeManager = {
        toggleTheme: function() {
            const currentIsDark = document.documentElement.classList.contains('dark');
            const newTheme = !currentIsDark;
            applyTheme(newTheme);
            return newTheme;
        },
        currentTheme: function() {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
    };
})();