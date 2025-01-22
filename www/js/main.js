import { Parser, Interpreter } from '../../index.js';

// Function to calculate terminal dimensions based on viewport
function calculateTerminalSize() {
    const fontSize = 16;  // matches our terminal fontSize setting
    const lineHeight = 1.2;  // matches our terminal lineHeight setting

    // Calculate available height and width (90% of viewport)
    const viewportHeight = window.innerHeight * 0.9;
    const viewportWidth = window.innerWidth * 0.9;

    // Calculate rows and columns
    const rows = Math.floor(viewportHeight / (fontSize * lineHeight)) - 10; // -10 for padding
    const cols = Math.floor(viewportWidth / (fontSize * 0.6)) - 4; // 0.6 is approximate char width, -4 for padding

    return { rows, cols };
}

// Get initial dimensions
const terminalSize = calculateTerminalSize();

const term = new Terminal({
    cursorBlink: true,
    fontSize: 16,
    fontFamily: "'Fira Code', monospace",
    letterSpacing: 0,
    lineHeight: 1.2,
    fontWeight: 500,
    fontWeightBold: 700,
    allowTransparency: true,
    scrollback: 1000,  // Add scrollback support
    rows: terminalSize.rows,
    cols: terminalSize.cols,
    theme: {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#ff79c6',
        cursorAccent: '#282a36',
        selection: '#44475a',
        selectionForeground: '#ffffff',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff'
    },
    windowOptions: {
        fullscreenWin: true
    },
    rendererType: 'canvas'
});

// Create container with proper styling
const container = document.getElementById('terminal');
term.open(container);

// Add resize handler
window.addEventListener('resize', () => {
    const newSize = calculateTerminalSize();
    term.resize(newSize.cols, newSize.rows);

    // Redraw borders if needed
    const borders = createBorders();
    // You might want to clear and redraw your header here if needed

    scrollToBottom();
});

// Function to create borders based on current terminal width
function createBorders() {
    const cols = term.cols || 80;
    const title = ' Quick Guide ';
    const leftPadding = Math.floor((cols - title.length - 2) / 2);
    const rightPadding = cols - leftPadding - title.length - 2;
    return {
        top: `\x1b[38;5;212m╔${'═'.repeat(leftPadding)}${title}${'═'.repeat(rightPadding)}╗\x1b[0m\r\n`,
        bottom: `\x1b[38;5;212m╚${'═'.repeat(cols - 2)}╝\x1b[0m\r\n`
    };
}

// Create a function to handle scrolling
function scrollToBottom() {
    term.scrollToBottom();
    term.scrollToBottom(); // Called twice to ensure it works
}

// Wait a bit for terminal to initialize properly
setTimeout(() => {
    const borders = createBorders();

    // Write the guide
    term.write(borders.top);
    term.write('\x1b[38;5;141mType lambda expressions using the following syntax:\x1b[0m\r\n\r\n');
    term.write('\x1b[38;5;84m→ Use \\ for λ\x1b[0m\r\n');
    term.write('\x1b[38;5;84m→ Use . to separate parameter and body\x1b[0m\r\n\r\n');
    term.write('\x1b[38;5;141mExamples:\x1b[0m\r\n');
    term.write('\x1b[38;5;84m  → \\x. x         - Identity function\x1b[0m\r\n');
    term.write('\x1b[38;5;84m  → \\x. \\y. x     - First function\x1b[0m\r\n');
    term.write('\x1b[38;5;84m  → (\\x. x) y     - Application\x1b[0m\r\n');
    term.write('\x1b[38;5;84m  → (\\f.\\x.f (f x)) (\\y.y)  - Church numeral 2 with id\x1b[0m\r\n');
    term.write(borders.bottom + '\r\n');

    term.write('Lambda Calculus Interpreter\r\n');
    term.write('\x1b[38;5;141mType an expression (e.g. \\x. x) and press Enter\x1b[0m\r\n\r\n');
    term.write('\x1b[38;5;212mλ>\x1b[0m ');
    scrollToBottom();
}, 100);

let input = '';
let cursorPosition = 0;  // Track cursor position
let commandHistory = [];  // Store command history
let historyIndex = -1;   // Current position in history

term.onData(e => {
    // Handle paste events (when e is longer than 1 character)
    if (e.length > 1 && e !== '\x1b[A' && e !== '\x1b[B' && e !== '\x1b[C' && e !== '\x1b[D') {
        // Insert pasted text at cursor position
        input = input.slice(0, cursorPosition) + e + input.slice(cursorPosition);
        cursorPosition += e.length;
        // Clear line and rewrite with new input
        term.write('\r\x1b[K\x1b[38;5;212mλ>\x1b[0m ' + input);
        // Move cursor to correct position
        if (cursorPosition < input.length) {
            term.write('\x1b[D'.repeat(input.length - cursorPosition));
        }
        return;
    }

    switch (e) {
        case '\r': // Enter
            term.write('\r\n');
            if (input.trim()) {
                // Add command to history
                commandHistory.push(input.trim());
                historyIndex = commandHistory.length;

                try {
                    // Create interpreter with debug mode
                    const interpreter = new Interpreter(input.trim(), { debug: true });
                    const result = interpreter.evaluate();

                    // Get and display reduction steps
                    const steps = interpreter.getSteps();
                    if (steps.length > 0) {
                        term.write('\x1b[38;5;214mReduction steps:\x1b[0m\r\n');
                        steps.forEach((step, index) => {
                            term.write(`\x1b[38;5;245m${index + 1}.\x1b[0m ${step.term}\r\n`);
                        });
                        term.write('\r\n');
                    }

                    // Display final result
                    term.write(`\x1b[38;5;84mResult: ${result.toString()}\x1b[0m\r\n`);
                    scrollToBottom();
                } catch (error) {
                    // Display steps even if there's an error
                    const steps = error.steps || [];
                    if (steps.length > 0) {
                        term.write('\x1b[38;5;214mReduction steps:\x1b[0m\r\n');
                        steps.forEach((step, index) => {
                            term.write(`\x1b[38;5;245m${index + 1}.\x1b[0m ${step.term}\r\n`);
                        });
                        term.write('\r\n');
                    }
                    term.write(`\x1b[38;5;203mError: ${error.message}\x1b[0m\r\n`);
                    scrollToBottom();
                }
            }
            term.write('\x1b[38;5;212mλ>\x1b[0m ');
            scrollToBottom();
            input = '';
            cursorPosition = 0;
            break;
        case '\u007F': // Backspace
            if (input.length > 0 && cursorPosition > 0) {
                input = input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
                cursorPosition--;
                // Move cursor back, clear rest of line, write remaining input, move cursor back to position
                term.write('\b \b' + input.slice(cursorPosition) + ' \x1b[D'.repeat(input.length - cursorPosition));
            }
            break;
        case '\x1b[D': // Left arrow
            if (cursorPosition > 0) {
                cursorPosition--;
                term.write('\x1b[D');
            }
            break;
        case '\x1b[C': // Right arrow
            if (cursorPosition < input.length) {
                cursorPosition++;
                term.write('\x1b[C');
            }
            break;
        case '\x1b[A': // Up arrow
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                // Clear current input
                term.write('\r\x1b[K\x1b[38;5;212mλ>\x1b[0m ');
                input = commandHistory[historyIndex];
                cursorPosition = input.length;
                term.write(input);
            }
            break;
        case '\x1b[B': // Down arrow
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                // Clear current input
                term.write('\r\x1b[K\x1b[38;5;212mλ>\x1b[0m ');
                input = commandHistory[historyIndex];
                cursorPosition = input.length;
                term.write(input);
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex++;
                // Clear input when reaching end of history
                term.write('\r\x1b[K\x1b[38;5;212mλ>\x1b[0m ');
                input = '';
                cursorPosition = 0;
            }
            break;
        default:
            if (e >= ' ' && e <= '~') {
                // Insert character at cursor position
                input = input.slice(0, cursorPosition) + e + input.slice(cursorPosition);
                cursorPosition++;
                // Write new character and rest of input, then move cursor back to position
                term.write(e + input.slice(cursorPosition) + '\x1b[D'.repeat(input.length - cursorPosition));
            }
    }
});