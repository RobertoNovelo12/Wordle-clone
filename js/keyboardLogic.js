export class KeyboardManager {
    constructor() {
        this.keys = [
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "←"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
            ["Z", "X", "C", "V", "B", "N", "M", "ENTER"]
        ];
        this.keyboardElement = document.querySelector('.keyboard');
    }


    initKeyboard() {
        this.keyboardElement.innerHTML = '';

        this.keys.forEach(rowKeys => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');

            rowKeys.forEach(key => {
                const button = document.createElement('button');
                button.textContent = key;
                button.classList.add('key');
                button.dataset.key = key;

                if (key === "ENTER") {
                    button.classList.add('enter-key');
                    button.dataset.action = "enter";
                } else if (key === "←") {
                    button.classList.add('delete-key');
                    button.dataset.action = "backspace";
                } else {
                    button.dataset.action = "letter";
                }

                rowDiv.appendChild(button);
            });

            this.keyboardElement.appendChild(rowDiv);
        });
    }


    addKeyboardListeners(callback) {
        this.keyboardElement.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {

                event.stopImmediatePropagation();
                
                const key = event.target.textContent;
                
                if (key === "ENTER") {
                    callback("Enter");
                } else if (key === "←") {
                    callback("Backspace");
                } else {
                    callback(key);
                }
            }
        }, { once: false, capture: true });
    }


    updateKeyColors(letterStates) {
        Object.keys(letterStates).forEach(letter => {
            const keyButtons = document.querySelectorAll(`.key[data-key="${letter}"]`);
            
            keyButtons.forEach(button => {

                if (!button.classList.contains('correct')) {
                    button.classList.remove('misplaced', 'wrong');
                    button.classList.add(letterStates[letter]);
                }
            });
        });
    }


    disableKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = true;
            key.style.pointerEvents = 'none';
            key.style.opacity = '0.5';
        });
    }


    enableKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = false;
            key.style.pointerEvents = 'auto';
            key.style.opacity = '1';
        });
    }


    resetKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'misplaced', 'wrong');
        });
    }
}