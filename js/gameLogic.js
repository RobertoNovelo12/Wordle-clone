import { BoardManager } from './boardLogic.js';
import { KeyboardManager } from './keyboardLogic.js';

export class WordleGame {
    constructor(words, maxAttempts = 6) {
        this.words = words;
        this.maxAttempts = maxAttempts;
        this.boardManager = null;
        this.keyboardManager = null;
        this.targetWord = '';
        this.hintUsed = 0;
        this.currentGuess = "";
        this.rowIndex = 0;
        this.keyboardHandlerBound = this.handlePhysicalKeyboard.bind(this);
        this.isProcessingKey = false;
    }

    handlePhysicalKeyboard(e) {
        if (this.isProcessingKey) return;
        this.isProcessingKey = true;
    
        try {
            if (e.key === "Enter") {
                e.preventDefault();
                this.checkWord();
            } else if (e.key === "Backspace") {
                e.preventDefault();
                this.handleBackspace();
            } else if (/^[A-Za-zñÑ]$/.test(e.key)) {
                e.preventDefault();
                this.handleLetterInput(e.key.toUpperCase());
            } else if (e.key === "ñ" || e.key === "Ñ" || e.keyCode === 192) {
                e.preventDefault();
                this.handleLetterInput("Ñ");
            }
        } finally {
            setTimeout(() => {
                this.isProcessingKey = false;
            }, 50);
        }
    }

    initGame() {
        this.targetWord = this.getRandomWord();
        this.boardManager = new BoardManager(this.targetWord, this.maxAttempts);
        this.keyboardManager = new KeyboardManager();

        this.boardManager.initBoard();
        this.keyboardManager.initKeyboard();

        this.keyboardManager.addKeyboardListeners(this.handleVirtualKeyboard.bind(this));
        this.setupEventListeners();

        document.getElementById('hint-button').addEventListener('click', () => this.provideHint());
        document.getElementById('reload-button').addEventListener('click', () => this.startNewGame());
    }

    getRandomWord() {
        return this.words[Math.floor(Math.random() * this.words.length)].toUpperCase();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.keyboardHandlerBound); 
        this.boardManager.boardElement.addEventListener('click', this.handleBoardClick.bind(this));
    }

    handleVirtualKeyboard(key) {
        if (key === "Enter" || key === "ENTER") {
            this.checkWord();
        } else if (key === "Backspace" || key === "←") {
            this.handleBackspace();
        } else if (/^[A-Za-zÑ]$/.test(key)) { 
            this.handleLetterInput(key);
        }
    }

    handleBoardClick(e) {
        if (!e.target.classList.contains("cell")) return;
        this.boardManager.handleCellClick(e.target);
    }

    handleLetterInput(letter) {
        if (this.currentGuess.length < this.targetWord.length) {
            const wasInserted = this.boardManager.insertLetter(letter);
            if (wasInserted) {
                this.currentGuess = this.boardManager.getCurrentGuessFromBoard(this.rowIndex);
            }
        }
    }

    handleBackspace() {
        if (this.currentGuess.length > 0) {
            const wasDeleted = this.boardManager.deleteLastLetter();
            if (wasDeleted) {
                this.currentGuess = this.boardManager.getCurrentGuessFromBoard(this.rowIndex);
            }
        }
    }

    disableGame() {
        document.removeEventListener('keydown', this.keyboardHandlerBound);
        this.keyboardManager.disableKeyboard();
        this.boardManager.boardElement.style.pointerEvents = 'none';
        document.querySelector('.container').classList.add('disabled');
    }

    enableGame() {
        document.addEventListener('keydown', this.keyboardHandlerBound);
        this.keyboardManager.enableKeyboard();
        this.boardManager.boardElement.style.pointerEvents = 'auto';
        document.querySelector('.container').classList.remove('disabled');
        const overlay = document.getElementById('blocking-overlay');
        if (overlay) overlay.remove();
    }    

    disableKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = true;
            key.style.pointerEvents = 'none';
            key.style.opacity = '0.5';
        });
    }

    enableKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.disabled = false;
            key.style.pointerEvents = 'auto';
            key.style.opacity = '1';
            key.classList.remove('disabled-key');
        });
        this.keyboardElement.replaceWith(this.keyboardElement.cloneNode(true));
    }

    checkWord() {
        this.currentGuess = this.boardManager.getCurrentGuessFromBoard(this.rowIndex);
        
        if (this.currentGuess.length < this.targetWord.length) {
            this.boardManager.shakeCurrentRow();
            return;
        }
    
        const result = this.boardManager.checkWord(this.currentGuess, this.rowIndex);
        
        this.keyboardManager.updateKeyColors(result.letterStates);
        
        if (result.isCorrect) {
            this.showGameOverNotification(true);
            this.disableGame();
        } else if (this.rowIndex >= this.maxAttempts - 1) {
            this.showGameOverNotification(false);
            this.disableGame();
        } else {
            this.rowIndex++;
            this.currentGuess = "";
            this.boardManager.rowIndex = this.rowIndex;
            this.boardManager.selectFirstEmptyCell();
        }
    }
  
    showGameOverNotification(isWin) {
        const notification = document.getElementById('notification-container');
        const message = document.getElementById('notification-message');
        const button = document.getElementById('notification-button');
        
        notification.className = '';
        notification.classList.add('notification-visible');
        
        if (isWin) {
            message.textContent = "¡Felicidades! Has adivinado la palabra.";
            notification.classList.add('notification-win');
        } else {
            message.textContent = `Has agotado los intentos. La palabra era ${this.targetWord}.`;
            notification.classList.add('notification-lose');
        }
        
        button.textContent = "Nuevo juego";
        
        return new Promise((resolve) => {
            button.onclick = () => {
                notification.classList.remove('notification-visible');
                notification.classList.add('notification-hidden');
                resolve();
            };
        });
    }  

    provideHint() {
        if (this.hintUsed >= 2) {
            alert("Ya has usado el máximo de pistas permitidas");
            return;
        }

        const hintResult = this.boardManager.provideHint(this.rowIndex);
        if (hintResult.success) {
            this.currentGuess = this.boardManager.getCurrentGuessFromBoard(this.rowIndex);
            this.hintUsed++;
            document.getElementById('hint-button').title = `Pista (te quedan ${2 - this.hintUsed})`;
        } else {
            alert("No hay más letras ocultas en esta fila");
        }
    }

    async startNewGame() {
        const notification = document.getElementById('notification-container');
        notification.classList.remove('notification-visible');
        notification.classList.add('notification-hidden');
        
        this.targetWord = this.getRandomWord();
        this.hintUsed = 0;
        this.rowIndex = 0;
        this.currentGuess = "";
        
        this.enableGame();
        
        this.boardManager.resetBoard(this.targetWord);
        this.keyboardManager.resetKeyboard();
        this.keyboardManager.enableKeyboard();
        
        document.getElementById('hint-button').title = "Pista (te quedan 2)";
        
        this.boardManager.selectFirstEmptyCell();
    }
}