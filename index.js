/**
 * Token class represents a lexical token with a type and value.
 * The type is one of: EOF, LAMBDA, LPAREN, RPAREN, LCID, DOT.
 * The value is the actual string content of the token.
 *
 * @example
 * new Token(Token.LAMBDA, 'λ')  // Represents a lambda symbol
 * new Token(Token.LCID, 'x')    // Represents a variable name 
 * new Token(Token.DOT, '.')     // Represents the dot separator
 * new Token(Token.EOF, '')      // Represents end of input
 */

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
};

const tokenStrings = [
    'EOF', // we augment the tokens with EOF, to indicate the end of the input.
    'LAMBDA',
    'LPAREN',
    'RPAREN',
    'LCID',
    'DOT',
]
tokenStrings.forEach(token => {
    Token[token] = token;
});

/**
 * Lexer class handles tokenization of the input string into a sequence of tokens.
 * It maintains state about the current position in the input and provides methods
 * to advance through the input character by character, converting them into tokens
 * according to the lambda calculus syntax rules.
 * 
 * @example
 * const lexer = new Lexer('λx.x');  // Create lexer for λx.x
 * lexer.token();      // Returns Token{type: 'LAMBDA', value: 'λ'} 
 * lexer.nextToken();  // Advances to next token
 * lexer.token();      // Returns Token{type: 'LCID', value: 'x'}
 * lexer.nextToken();  // Advances to next token
 * lexer.token();      // Returns Token{type: 'DOT', value: '.'}
 * lexer.nextToken();  // Advances to next token
 * lexer.token();      // Returns Token{type: 'LCID', value: 'x'}
 * lexer.nextToken();  // Advances to next token
 * lexer.token();      // Returns Token{type: 'EOF', value: ''}
 */
class Lexer {

    constructor(input) {
        this._input = input;
        this._index = 0;
        this._token = undefined;
        this._nextToken()
    }

    /**
     * Return the next char of the input or '\0' if we've reached the end
     */
    _nextChar() {
        if (this._index >= this._input.length) {
            return '\0';
        }
        return this._input[this._index++];
    }


    /**
     * Set this._token based on the remaining of the input
     *
     * This method is meant to be private, it doesn't return a token, just sets
     * up the state for the helper functions.
     */
    _nextToken() {
        let char = this._nextChar();
        if (char === '\0') {
            this._token = new Token(Token.EOF, '');
            return;
        }
        if (char === '(') {
            this._token = new Token(Token.LPAREN, char);
            return;
        }

        if (char === ')') {
            this._token = new Token(Token.RPAREN, char);
            return;
        }

        if (char === '.') {
            this._token = new Token(Token.DOT, char);
            return;
        }

        if (char === '\\') {
            this._token = new Token(Token.LAMBDA, char);
            return;
        }

        if (char === ' ') {
            this._nextToken();
            return;
        }

        // Handle LCID - lowercase identifiers
        if (/[a-z]/.test(char)) {
            this._token = new Token(Token.LCID, char);
            return;
        }

        throw new Error(`Unexpected character: ${char}`);
    }

    /**
     * Return true if the next token is of type t
     */
    next(t) {
        return this._token.type === t;
    }

    /**
     * Returns the current token value without consuming it
     */
    peek() {
        return this._token.value;
    }

    /**
     * Skip the next token if it matches t
     */
    skip(t) {
        if (this.next(t)) {
            const value = this._token.value;
            this._nextToken();
            return value;
        }
        return false;
    }

    /**
     * Assert that the next token is of type t, and skip it
     */
    match(t) {
        if (!this.next(t)) {
            throw new Error(`Expected token: ${t}`);
        }
        const value = this._token.value;
        this._nextToken();
        return value;
    }

    /**
     * Assert that the next token is of type t, and return its value
     */
    token(t) {
        if (!this.next(t)) {
            throw new Error(`Expected token: ${t}`);
        }
        const value = this._token.value;
        this._nextToken();
        return value;
    }
}

class Abstraction {
    /**
     * Represents a lambda abstraction (λx. body) in the lambda calculus.
     * 
     * Why this exists:
     * - In lambda calculus, abstractions define functions with a single parameter
     * - They are one of the core building blocks, alongside applications and variables
     * 
     * Structure:
     * - param: The bound variable name (the 'x' in λx. body)
     * - body: The expression that forms the function body
     * 
     * Implementation notes:
     * - We don't need a separate node for the λ symbol since:
     *   1. It's implicit in the Abstraction node type
     *   2. λ always appears with a parameter and body together
     *   3. The symbol itself carries no additional semantic meaning
     * 
     * Example:
     * For λx. x y
     * - param would be "x"
     * - body would be an Application node of (x y)
     */
    constructor(param, body) {
        this.param = param;
        this.body = body;
    }

    toString(ctx = []) {
        // Add parentheses around applications in the body
        const bodyStr = this.body instanceof Application
            ? `(${this.body.toString([this.param].concat(ctx))})`
            : this.body.toString([this.param].concat(ctx));

        return `(λ${this.param}. ${bodyStr})`;
    }
}


class Application {
    /**
     * (lhs rhs) - left-hand side and right-hand side of an application.
     */
    constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    toString(ctx = []) {
        // Add parentheses around nested applications in lhs
        const lhsStr = this.lhs instanceof Application
            ? `(${this.lhs.toString(ctx)})`
            : this.lhs.toString(ctx);

        // Add parentheses around rhs only if it's an application
        // (not for abstractions - they already have their own parentheses)
        const rhsStr = this.rhs instanceof Application
            ? `(${this.rhs.toString(ctx)})`
            : this.rhs.toString(ctx);

        return `${lhsStr} ${rhsStr}`;
    }
}

class Identifier {
    /**
     * name is the string matched for this identifier.
     */
    constructor(value) {
        this.value = value;
    }

    toString(ctx = []) {
        return this.value;
    }
}


/**
 * Parser class handles the conversion of a string input into a tree structure
 * representing the lambda calculus expression.
 * 
 * It uses the Lexer class to tokenize the input and then builds the tree structure
 * based on the grammar rules defined in the lambda calculus.
 * 
 * Example:
 * Input: "λx. x y"
 * Output: 
 *   new Abstraction(
 *     "x",
 *     new Application(
 *       new Identifier("x"),
 *       new Identifier("y")
 *     )
 *   )
 * 
 */
class Parser {
    /**
     * Grammar rules being implemented:
     * term ::= application
     *        | LAMBDA LCID DOT term
     * 
     * atom ::= LPAREN term RPAREN
     *        | LCID
     */
    constructor(input) {
        this.lexer = new Lexer(input);
    }

    /**
     * Parse a term according to the grammar rule:
     * term ::= application
     *        | LAMBDA LCID DOT term [this is an abstraction]
     * 
     * example:
     * λx. x y
     */
    parseTerm() {
        // Check if it starts with a lambda
        if (this.lexer.skip(Token.LAMBDA)) {  // VERIFY and CONSUME lambda if present. Skip to next token.
            // If yes, this is an abstraction.
            const param = this.lexer.token(Token.LCID);  // GET and CONSUME parameter name
            this.lexer.match(Token.DOT);  // CONSUME dot
            const body = this.parseTerm();  // Recursively parse the body
            return new Abstraction(param, body);
        }

        // If not a lambda, it must be an application
        return this.parseApplication();
    }

    /**
     * Parse an atom according to the grammar rule:
     * atom ::= LPAREN term RPAREN
     *        | LCID
     */
    parseAtom() {
        if (this.lexer.skip(Token.LPAREN)) {  // Check and consume left parenthesis if present
            const term = this.parseTerm();   // Parse the term inside
            this.lexer.match(Token.RPAREN);  // Consume right parenthesis
            return term;
        }

        // If not parenthesized, must be an identifier
        if (this.lexer.next(Token.LCID)) {
            const name = this.lexer.token(Token.LCID);
            return new Identifier(name);
        }

        throw new Error('Expected atom');
    }

    /**
     * Parse an application according to the grammar rule:
     * application ::= atom application'
     * application' ::= atom application'
     *                | ε
     * 
     * This handles left-associative application like:
     * f x y z => ((f x) y) z
     */
    parseApplication() {
        let lhs = this.parseAtom();

        // Keep consuming atoms as right-hand sides while we have them
        while (!this.lexer.next(Token.EOF) &&
            !this.lexer.next(Token.RPAREN) &&
            !this.lexer.next(Token.DOT)) {
            const rhs = this.parseAtom();
            lhs = new Application(lhs, rhs);
        }

        return lhs;
    }

    /**
     * Main entry point for parsing
     */
    parse() {
        const term = this.parseTerm();
        this.lexer.match(Token.EOF);  // Make sure we've reached the end of input
        return term;
    }
}

class Interpreter {
    constructor(input) {
        this.parser = new Parser(input);
        this.AST = { Application, Abstraction, Identifier };
    }

    evaluate() {
        const ast = this.parser.parse();
        return this._evaluate(ast);
    }

    _isValue(node) {
        return node instanceof this.AST.Abstraction ||
            node instanceof this.AST.Identifier;
    }

    _evaluate(ast) {
        while (true) {
            if (ast instanceof this.AST.Application) {
                if (this._isValue(ast.lhs) && this._isValue(ast.rhs)) {
                    if (ast.lhs instanceof this.AST.Abstraction) {
                        ast = this._substitute(ast.lhs.param, ast.rhs, ast.lhs.body);
                    } else {
                        return ast;
                    }
                } else if (this._isValue(ast.lhs)) {
                    ast.rhs = this._evaluate(ast.rhs);
                } else {
                    ast.lhs = this._evaluate(ast.lhs);
                }
            } else if (this._isValue(ast)) {
                return ast;
            } else {
                return ast;
            }
        }
    }

    _substitute(param, arg, node) {
        if (node instanceof this.AST.Identifier) {
            return node.value === param ? arg : node;
        }

        if (node instanceof this.AST.Application) {
            return new this.AST.Application(
                this._substitute(param, arg, node.lhs),
                this._substitute(param, arg, node.rhs)
            );
        }

        if (node instanceof this.AST.Abstraction) {
            if (node.param === param) {
                return node;
            }

            if (this._getFreeVariables(arg).has(node.param)) {
                const newParam = this._freshVariable(node.param);
                const newBody = this._substitute(node.param, new this.AST.Identifier(newParam), node.body);
                return new this.AST.Abstraction(
                    newParam,
                    this._substitute(param, arg, newBody)
                );
            }

            return new this.AST.Abstraction(
                node.param,
                this._substitute(param, arg, node.body)
            );
        }
    }

    _getFreeVariables(node) {
        const freeVars = new Set();

        if (node instanceof this.AST.Identifier) {
            freeVars.add(node.value);
        } else if (node instanceof this.AST.Application) {
            this._getFreeVariables(node.lhs).forEach(v => freeVars.add(v));
            this._getFreeVariables(node.rhs).forEach(v => freeVars.add(v));
        } else if (node instanceof this.AST.Abstraction) {
            this._getFreeVariables(node.body).forEach(v => {
                if (v !== node.param) {
                    freeVars.add(v);
                }
            });
        }

        return freeVars;
    }

    _freshVariable(base) {
        if (!this._usedVariables) {
            this._usedVariables = new Set();
        }
        let counter = 1;
        let newName = `${base}'`;
        while (this._usedVariables.has(newName)) {
            newName = `${base}'${counter++}`;
        }
        this._usedVariables.add(newName);
        return newName;
    }
}

module.exports = {
    Parser,
    Abstraction,
    Application,
    Identifier,
    Interpreter
};