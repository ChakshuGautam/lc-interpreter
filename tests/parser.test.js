const { Parser, Abstraction, Application, Identifier } = require('../index.js');
const { Interpreter } = require('../index.js');
const { FreeVariablesVisitor, SubstitutionVisitor } = require('../index.js');

describe('Lambda Calculus Parser', () => {
    // Helper function to parse and return AST
    const parse = (input) => {
        const parser = new Parser(input);
        return parser.parse();
    };

    describe('basic lambda expressions', () => {
        test('parses identity function (λx.x)', () => {
            const ast = parse('\\x.x');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Identifier);
            expect(ast.body.value).toBe('x');
            expect(ast.toString()).toBe('(λx. x)');
        });

        test('parses identity function with spaces', () => {
            const ast = parse('\\x. x');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Identifier);
            expect(ast.body.value).toBe('x');
            expect(ast.toString()).toBe('(λx. x)');
        });

        test('parses identity function with parentheses', () => {
            const ast = parse('(\\x.x)');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Identifier);
            expect(ast.body.value).toBe('x');
            expect(ast.toString()).toBe('(λx. x)');
        });
    });

    describe('nested lambda expressions', () => {
        test('parses nested abstraction (λx.λy.x)', () => {
            const ast = parse('\\x.\\y.x');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('y');
            expect(ast.body.body).toBeInstanceOf(Identifier);
            expect(ast.body.body.value).toBe('x');
            expect(ast.toString()).toBe('(λx. (λy. x))');
        });
    });

    describe('function applications', () => {
        test('parses simple application ((λx.x) y)', () => {
            const ast = parse('(\\x.x) y');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Abstraction);
            expect(ast.rhs).toBeInstanceOf(Identifier);
            expect(ast.rhs.value).toBe('y');
            expect(ast.toString()).toBe('(λx. x) y');
        });

        test('parses nested application (((λx.x) y) z)', () => {
            const ast = parse('((\\x.x) y) z');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Application);
            expect(ast.lhs.lhs).toBeInstanceOf(Abstraction);
            expect(ast.lhs.rhs).toBeInstanceOf(Identifier);
            expect(ast.lhs.rhs.value).toBe('y');
            expect(ast.rhs).toBeInstanceOf(Identifier);
            expect(ast.rhs.value).toBe('z');
            expect(ast.toString()).toBe('((λx. x) y) z');
        });
    });

    describe('error cases', () => {
        test('throws on invalid characters', () => {
            expect(() => parse('\\x.1')).toThrow();
        });

        test('throws on unmatched parentheses', () => {
            expect(() => parse('(\\x.x')).toThrow();
        });

        test('throws on missing body', () => {
            expect(() => parse('\\x.')).toThrow();
        });
    });

    describe('complex expressions', () => {
        test('parses multiple nested abstractions (λx.λy.λz.x y z)', () => {
            const ast = parse('\\x.\\y.\\z.x y z');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('y');
            expect(ast.body.body).toBeInstanceOf(Abstraction);
            expect(ast.body.body.param).toBe('z');
            expect(ast.body.body.body).toBeInstanceOf(Application);
            expect(ast.toString()).toBe('(λx. (λy. (λz. ((x y) z))))');
        });

        test('parses nested applications with abstractions ((λx.x x) (λy.y))', () => {
            const ast = parse('(\\x.x x) (\\y.y)');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Abstraction);
            expect(ast.lhs.body).toBeInstanceOf(Application);
            expect(ast.rhs).toBeInstanceOf(Abstraction);
            expect(ast.toString()).toBe('(λx. (x x)) (λy. y)');
        });

        test('parses complex nested structure (λf.(λx.f (x x)) (λx.f (x x)))', () => {
            const ast = parse('\\f.(\\x.f (x x)) (\\x.f (x x))');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('f');
            expect(ast.body).toBeInstanceOf(Application);
            expect(ast.toString()).toBe('(λf. ((λx. (f (x x))) (λx. (f (x x)))))');
        });

        test('parses expressions with multiple parentheses ((λx.(λy.x)) z)', () => {
            const ast = parse('(\\x.(\\y.x)) z');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Abstraction);
            expect(ast.lhs.body).toBeInstanceOf(Abstraction);
            expect(ast.rhs).toBeInstanceOf(Identifier);
            expect(ast.toString()).toBe('(λx. (λy. x)) z');
        });

        test('parses church numeral 2 (λf.λx.f (f x))', () => {
            const ast = parse('\\f.\\x.f (f x)');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('f');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('x');
            expect(ast.body.body).toBeInstanceOf(Application);
            expect(ast.toString()).toBe('(λf. (λx. (f (f x))))');
        });
    });

    describe('advanced expressions', () => {
        test('parses church numeral 3 with nested applications (λf.λx.f (f (f x)))', () => {
            const ast = parse('\\f.\\x.f (f (f x))');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('f');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('x');
            expect(ast.body.body).toBeInstanceOf(Application);
            expect(ast.body.body.lhs).toBeInstanceOf(Identifier);
            expect(ast.body.body.lhs.value).toBe('f');
            expect(ast.toString()).toBe('(λf. (λx. (f (f (f x)))))');
        });

        test('parses church boolean TRUE (λx.λy.x)', () => {
            const ast = parse('\\x.\\y.x');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('y');
            expect(ast.body.body).toBeInstanceOf(Identifier);
            expect(ast.body.body.value).toBe('x');
            expect(ast.toString()).toBe('(λx. (λy. x))');
        });

        test('parses church pair constructor (λx.λy.λf.f x y)', () => {
            const ast = parse('\\x.\\y.\\f.f x y');

            expect(ast).toBeInstanceOf(Abstraction);
            expect(ast.param).toBe('x');
            expect(ast.body).toBeInstanceOf(Abstraction);
            expect(ast.body.param).toBe('y');
            expect(ast.body.body).toBeInstanceOf(Abstraction);
            expect(ast.body.body.body).toBeInstanceOf(Application);
            expect(ast.toString()).toBe('(λx. (λy. (λf. ((f x) y))))');
        });

        test('parses complex application with multiple parentheses ((λx.x) ((λy.y) z))', () => {
            const ast = parse('(\\x.x) ((\\y.y) z)');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Abstraction);
            expect(ast.rhs).toBeInstanceOf(Application);
            expect(ast.rhs.lhs).toBeInstanceOf(Abstraction);
            expect(ast.rhs.rhs).toBeInstanceOf(Identifier);
            expect(ast.toString()).toBe('(λx. x) ((λy. y) z)');
        });

        test('parses church omega combinator with self application ((λx.x x) (λx.x x))', () => {
            const ast = parse('(\\x.x x) (\\x.x x)');

            expect(ast).toBeInstanceOf(Application);
            expect(ast.lhs).toBeInstanceOf(Abstraction);
            expect(ast.lhs.body).toBeInstanceOf(Application);
            expect(ast.rhs).toBeInstanceOf(Abstraction);
            expect(ast.rhs.body).toBeInstanceOf(Application);
            // This is a divergent term (infinite loop in evaluation)
            expect(ast.toString()).toBe('(λx. (x x)) (λx. (x x))');
        });
    });
});
