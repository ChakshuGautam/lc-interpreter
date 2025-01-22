import { Parser, Interpreter } from '../../index.js';

const term = new Terminal({
    cursorBlink: true,
    fontSize: 16,
    fontFamily: "'Fira Code', monospace",
    letterSpacing: 0,
    lineHeight: 1.2,
    fontWeight: 500,
    fontWeightBold: 700,
    allowTransparency: true,
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

term.open(document.getElementById('terminal'));

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
    term.write(borders.bottom + '\r\n');

    term.write('Lambda Calculus Interpreter\r\n');
    term.write('\x1b[38;5;141mType an expression (e.g. \\x. x) and press Enter\x1b[0m\r\n\r\n');
    term.write('\x1b[38;5;212mλ>\x1b[0m ');
}, 100);

let input = '';

term.onData(e => {
    switch (e) {
        case '\r': // Enter
            term.write('\r\n');
            if (input.trim()) {
                try {
                    const interpreter = new Interpreter(input.trim());
                    const result = interpreter.evaluate();
                    term.write(`\x1b[38;5;84m${result.toString()}\x1b[0m\r\n`);
                } catch (error) {
                    term.write(`\x1b[38;5;203mError: ${error.message}\x1b[0m\r\n`);
                }
            }
            term.write('\x1b[38;5;212mλ>\x1b[0m ');
            input = '';
            break;
        case '\u007F': // Backspace
            if (input.length > 0) {
                input = input.slice(0, -1);
                term.write('\b \b');
            }
            break;
        default:
            if (e >= ' ' && e <= '~') {
                input += e;
                term.write(e);
            }
    }
}); 