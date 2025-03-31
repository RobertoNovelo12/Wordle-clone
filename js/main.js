import { WordleGame } from './gameLogic.js';

let game;


function updateThemeIcon(isDarkMode) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    themeIcon.src = isDarkMode 
        ? "images/sun-icon.svg" 
        : "images/moon-icon.svg";
    themeIcon.alt = isDarkMode
        ? "Cambiar a modo claro"
        : "Cambiar a modo oscuro";
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        
        document.documentElement.style.visibility = "visible";
        
        
        const response = await fetch('words.json');
        const words = await response.json();

        
        game = new WordleGame(words);
        game.initGame();
        setupUI(game);

        
        document.documentElement.classList.add('loaded');

        
        game.onGameOver = (gameWon) => {
            game.disableGame();
        };

    } catch (error) {
        console.error('Error inicializando el juego:', error);
    }
});

function setupUI(game) {
    
    document.getElementById('help-button').addEventListener('click', () => {
        window.location.href = 'instrucciones.html';
    });

    document.getElementById('reload-button').addEventListener('click', () => {
        game?.enableGame();
        game?.startNewGame();
    });

    document.getElementById('notification-button').addEventListener('click', () => {
        game?.enableGame();
        game?.startNewGame();
    });

    
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function updateThemeIcon(isDarkMode) {
        themeIcon.src = isDarkMode ? "images/sun-icon.svg" : "images/moon-icon.svg";
        themeIcon.alt = isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    }

    themeToggle.addEventListener('click', () => {
        const isNowDarkMode = window.themeManager.toggleTheme();
        updateThemeIcon(isNowDarkMode);
    });

    
    updateThemeIcon(window.themeManager.currentTheme() === 'dark');
}