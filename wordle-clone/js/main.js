import { WordleGame } from './gameLogic.js';

let game;


function applyThemeBeforeLoad() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme ? savedTheme === "dark" : systemPrefersDark;

    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
}


applyThemeBeforeLoad();

document.addEventListener('DOMContentLoaded', async () => {
    try {

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
        if (game) {
            game.enableGame();
            game.startNewGame();
        }
    });

    document.getElementById('notification-button').addEventListener('click', () => {
        if (game) {
            game.enableGame();
            game.startNewGame();
        }
    });


    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function updateTheme(isDarkMode) {
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('light-mode', !isDarkMode);
        themeIcon.src = isDarkMode ? "images/sun-icon.svg" : "images/moon-icon.svg";
        themeIcon.alt = isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

        localStorage.setItem('theme', isDarkMode ? "dark" : "light");
    }


    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme === "dark" : systemPrefersDark;
    updateTheme(initialTheme);


    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            updateTheme(e.matches);
        }
    });


    themeToggle.addEventListener('click', () => {
        const isDarkMode = !document.body.classList.contains('dark-mode');
        updateTheme(isDarkMode);
    });
}