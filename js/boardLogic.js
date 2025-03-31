export class BoardManager {
    constructor(targetWord, maxAttempts = 6) {
        this.targetWord = targetWord.toUpperCase();
        this.maxAttempts = maxAttempts;
        this.boardElement = document.querySelector('.board');
        this.selectedCell = null;
        this.rowIndex = 0;
        this.lastKeyPressTime = 0;
    }

    initBoard() {
        this.boardElement.style.gridTemplateColumns = `repeat(${this.targetWord.length}, 1fr)`;
        this.boardElement.innerHTML = '';

        for (let i = 0; i < this.maxAttempts; i++) {
            for (let j = 0; j < this.targetWord.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (i === 0 && j === 0) {
                    cell.classList.add('selected');
                    this.selectedCell = cell;
                }

                this.boardElement.appendChild(cell);
            }
        }
    }

    handleCellClick(cell) {
        if (parseInt(cell.dataset.row) !== this.rowIndex) return false; 
        if (cell.dataset.state === 'hint') return false; 

        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        cell.classList.add('selected');
        this.selectedCell = cell;
        return true;
    }

    insertLetter(letter) {
        const now = Date.now();
        if (now - this.lastKeyPressTime < 100) return false;
        
        this.lastKeyPressTime = now;

        if (!this.selectedCell) {
            this.selectFirstEmptyCell();
        }

        if (this.selectedCell && !this.selectedCell.textContent) {
            
            this.selectedCell.textContent = letter;
            this.selectedCell.dataset.letter = letter; 
            
            this.selectNextEmptyCell();
            return true;
        }
        return false;
    }

    selectNextEmptyCell() {
        if (!this.selectedCell) return;

        const currentCol = parseInt(this.selectedCell.dataset.col);
        const rowCells = this.getCurrentRowCells();

        for (let i = currentCol + 1; i < rowCells.length; i++) {
            const nextCell = rowCells[i];
            if (!nextCell.textContent && nextCell.dataset.state !== 'hint') {
                this.selectedCell.classList.remove('selected');
                nextCell.classList.add('selected');
                this.selectedCell = nextCell;
                return;
            }
        }
    }

    deleteLastLetter() {
        const rowCells = this.getCurrentRowCells();
        let cellsWithContent = [];

        rowCells.forEach(cell => {
            if (cell.textContent) {
                cellsWithContent.push(cell);
            }
        });

        if (cellsWithContent.length > 0) {
            const lastFilledCell = cellsWithContent[cellsWithContent.length - 1];
            lastFilledCell.textContent = '';

            if (this.selectedCell) {
                this.selectedCell.classList.remove('selected');
            }
            lastFilledCell.classList.add('selected');
            this.selectedCell = lastFilledCell;

            return true;
        }
        return false;
    }

    selectFirstEmptyCell() {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        const rowCells = this.getCurrentRowCells();
        for (let cell of rowCells) {
            if (!cell.textContent && cell.dataset.state !== 'hint') {
                cell.classList.add('selected');
                this.selectedCell = cell;
                return true;
            }
        }

        if (rowCells.length > 0) {
            const lastCell = rowCells[rowCells.length - 1];
            lastCell.classList.add('selected');
            this.selectedCell = lastCell;
        }
        return false;
    }

    getCurrentRowCells() {
        return document.querySelectorAll(`[data-row="${this.rowIndex}"]`);
    }

    checkWord(currentGuess, rowIndex) {
        this.rowIndex = rowIndex;

        if (currentGuess.length < this.targetWord.length) {
            return { valid: false };
        }

        const rowCells = this.getCurrentRowCells();
        let tempTarget = this.targetWord.split('');
        const letterStates = {};

        
        currentGuess.split('').forEach((letter, index) => {
            const cellLetter = rowCells[index].textContent;
            const targetLetter = tempTarget[index];
            
            if (cellLetter === targetLetter) {
                rowCells[index].dataset.state = 'correct';
                tempTarget[index] = null;
                letterStates[letter] = 'correct';
            }
        });

        
        currentGuess.split('').forEach((letter, index) => {
            if (rowCells[index].dataset.state === 'correct') return;

            const cellLetter = rowCells[index].textContent;
            const targetIndex = tempTarget.findIndex(
                (targetLetter, i) => targetLetter && targetLetter === cellLetter
            );

            if (targetIndex !== -1) {
                rowCells[index].dataset.state = 'misplaced';
                tempTarget[targetIndex] = null;
                if (!letterStates[letter] || letterStates[letter] !== 'correct') {
                    letterStates[letter] = 'misplaced';
                }
            } else {
                rowCells[index].dataset.state = 'wrong';
                if (!letterStates[letter]) {
                    letterStates[letter] = 'wrong';
                }
            }
        });

        this.applyCellStyles(rowCells);

        const isCorrect = currentGuess === this.targetWord;
        const gameOver = isCorrect || rowIndex >= this.maxAttempts - 1;

        return {
            valid: true,
            isCorrect,
            letterStates,
            gameOver
        };
    }

    applyCellStyles(rowCells) {
        rowCells.forEach(cell => {
            const state = cell.dataset.state;
            if (state) {
                cell.classList.add(state);
            }
        });
    }

    provideHint(rowIndex) {
        this.rowIndex = rowIndex;
        const rowCells = this.getCurrentRowCells();
        const hiddenIndices = [];

        rowCells.forEach((cell, index) => {
            if (!cell.textContent && !cell.dataset.state) {
                hiddenIndices.push(index);
            }
        });

        if (hiddenIndices.length === 0) return { success: false };

        const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        const hintLetter = this.targetWord[randomIndex];

        const hintCell = rowCells[randomIndex];
        hintCell.textContent = hintLetter;
        hintCell.dataset.state = 'hint';
        hintCell.classList.add('hint'); 

        return {
            success: true,
            letter: hintLetter,
            position: randomIndex
        };
    }

    resetBoard(newTargetWord) {
        this.targetWord = newTargetWord.toUpperCase();
        this.rowIndex = 0;
        this.initBoard();
        this.clearCellStates();
    }

    clearCellStates() {
        const allCells = document.querySelectorAll('.cell');
        allCells.forEach(cell => {
            cell.classList.remove('correct', 'misplaced', 'wrong', 'hint');
            cell.textContent = '';
            delete cell.dataset.state;
        });
    }

    getCurrentGuessFromBoard(rowIndex) {
        this.rowIndex = rowIndex;
        const rowCells = this.getCurrentRowCells();
        return Array.from(rowCells).map(cell => cell.textContent).join('');
    }
}