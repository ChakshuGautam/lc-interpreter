const { Interpreter, Identifier, Abstraction } = require('../index.js');

describe('Lambda Calculus Interpreter', () => {
    // Helper to run interpreter with debug logging
    const evaluateWithDebug = (input) => {
        console.log(`\nEvaluating: ${input}`);
        const interpreter = new Interpreter(input, { debug: true });
        try {
            const result = interpreter.evaluate();
            console.log('Final result:', result.toString());
            return result;
        } catch (e) {
            console.log('Evaluation error:', e.message);
            throw e;
        }
    };

    test('evaluates identity function application', () => {
        const result = evaluateWithDebug('(\\x.x) y');
        expect(result).toBeInstanceOf(Identifier);
        expect(result.value).toBe('y');
    });

    test('evaluates nested application', () => {
        const result = evaluateWithDebug('(\\x.\\y.x) a b');
        expect(result).toBeInstanceOf(Identifier);
        expect(result.value).toBe('a');
    });

    test('handles variable shadowing', () => {
        const result = evaluateWithDebug('(\\x.\\x.x) a b');
        expect(result).toBeInstanceOf(Identifier);
        expect(result.value).toBe('b');
    });

    test('evaluates church numerals', () => {
        const result = evaluateWithDebug('(\\f.\\x.f (f x)) (\\y.y)');
        expect(result).toBeInstanceOf(Abstraction);
        expect(result.toString()).toBe('(λx. ((λy. y) ((λy. y) x)))');
    });

    test('evaluates simple beta reduction', () => {
        const interpreter = new Interpreter('(\\x.x) y');
        const result = interpreter.evaluate();
        expect(result.toString()).toBe('y');
    });

    test('handles nested applications correctly', () => {
        const interpreter = new Interpreter('(\\x.\\y.x) a b');
        const result = interpreter.evaluate();
        expect(result.toString()).toBe('a');
    });

    test('preserves variable binding under substitution', () => {
        const interpreter = new Interpreter('(\\x.\\y.x) (\\z.z)');
        const result = interpreter.evaluate();
        expect(result.toString()).toBe('(λy. (λz. z))');
    });

    test('handles variable capture avoidance', () => {
        const interpreter = new Interpreter('(\\x.\\y.x) y');
        const result = interpreter.evaluate();
        expect(result.toString()).toBe('(λy\'. y)');
    });

    // test('evaluates Y-combinator pattern', () => {
    //     const input = 'λf.(λx.f (x x)) (λx.f (x x))';
    //     const interpreter = new Interpreter(input);
    //     const result = interpreter.evaluate();
    //     expect(result).toBeInstanceOf(Abstraction);
    //     expect(result.toString()).toBe('(λf. ((λx. (f (x x))) (λx. (f (x x))))');
    // });

    // test('evaluates complex function composition', () => {
    //     // Tests composition of functions: (λf.λg.λx.f(g x))
    //     const result = evaluateWithDebug('((\\f.\\g.\\x.f(g x)) (\\y.y)) (\\z.z)');
    //     expect(result).toBeInstanceOf(Abstraction);
    //     expect(result.toString()).toBe('(λx. x)');
    // });

    // test('handles multiple nested beta reductions', () => {
    //     const result = evaluateWithDebug('((\\x.\\y.\\z.x z (y z)) (\\a.\\b.a)) (\\c.c)');
    //     expect(result).toBeInstanceOf(Abstraction);
    //     expect(result.toString()).toBe('(λz. z)');
    // });

    // test('evaluates church numeral multiplication', () => {
    //     // Tests multiplication of church numerals (2 * 2)
    //     const result = evaluateWithDebug('(\\m.\\n.\\f.\\x.m (n f) x) (\\f.\\x.f(f x)) (\\f.\\x.f(f x))');
    //     expect(result).toBeInstanceOf(Abstraction);
    //     expect(result.toString()).toBe('(λf. (λx. (f (f (f (f x))))))');
    // });

    // test('handles complex variable renaming scenarios', () => {
    //     const result = evaluateWithDebug('(\\x.\\y.\\z.(\\y.x y) z) a b c');
    //     expect(result.toString()).toBe('(a c)');
    // });

    // test('throws error on exceeding maximum steps', () => {
    //     expect(() => {
    //         evaluateWithDebug('(\\x.x x) (\\x.x x)');
    //     }).toThrow(`Evaluation exceeded ${new Interpreter('').MAX_STEPS} steps`);
    // });

    // test('tracks reduction steps correctly', () => {
    //     const interpreter = new Interpreter('(\\x.\\y.x) a b', { debug: true });
    //     const result = interpreter.evaluate();
    //     const steps = interpreter.getSteps();

    //     console.log('\nReduction steps:');
    //     steps.forEach(step => {
    //         console.log(`Step ${step.step}: ${step.term}`);
    //     });

    //     expect(steps.length).toBeGreaterThan(0);
    //     expect(steps[0].step).toBe(0);
    //     expect(steps[steps.length - 1].term).toBe('a');
    // });

    // test('evaluates within step limit for simple terms', () => {
    //     const interpreter = new Interpreter('(\\x.x) y', { debug: true });
    //     const result = interpreter.evaluate();
    //     const steps = interpreter.getSteps();

    //     console.log('\nSimple term reduction steps:');
    //     steps.forEach(step => {
    //         console.log(`Step ${step.step}: ${step.term}`);
    //     });

    //     expect(steps.length).toBeLessThanOrEqual(interpreter.MAX_STEPS);
    //     expect(result.toString()).toBe('y');
    // });

    // test('logs reduction steps when debug is enabled', () => {
    //     const consoleSpy = jest.spyOn(console, 'log');
    //     const interpreter = new Interpreter('(\\x.\\y.x) a b', { debug: true });
    //     const result = interpreter.evaluate();

    //     expect(consoleSpy).toHaveBeenCalled();
    //     expect(consoleSpy.mock.calls.some(call =>
    //         call[0].startsWith('Step')
    //     )).toBeTruthy();

    //     consoleSpy.mockRestore();
    // });
}); 