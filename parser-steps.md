# Lambda Calculus Parser Steps

This document shows the step-by-step parsing process for lambda calculus expressions of varying complexity.

## Example 1: Identity Function (λx.x)

Input: `\x.x`

Parsing steps:
1. `parse()` calls `parseTerm()`
2. `parseTerm()` sees LAMBDA token ('\\'), enters abstraction case:
   - Consumes LAMBDA token
   - Calls `token(LCID)` to get parameter 'x'
   - Matches and consumes DOT token
   - Recursively calls `parseTerm()` for the body
3. Inner `parseTerm()` doesn't see LAMBDA, calls `parseApplication()`
4. `parseApplication()` calls `parseAtom()`
5. `parseAtom()` sees LCID token ('x'):
   - Creates and returns Identifier('x')
6. `parseApplication()` sees EOF, returns the Identifier
7. Outer `parseTerm()` creates and returns Abstraction('x', Identifier('x'))
8. `parse()` verifies EOF and returns final AST

Final AST:
Abstraction {
    param: "x",
    body: Identifier {
        value: "x"
    }
}

## Example 2: Function Application ((λx.x) y)

Input: `(\x.x) y`

Parsing steps:
1. `parse()` calls `parseTerm()`
2. `parseTerm()` doesn't see LAMBDA, calls `parseApplication()`
3. `parseApplication()` calls `parseAtom()` for left side
4. `parseAtom()` sees LPAREN:
   - Consumes LPAREN
   - Recursively calls `parseTerm()`
   - Inner `parseTerm()` sees LAMBDA:
     * Creates Abstraction('x', Identifier('x')) as before
   - Matches RPAREN
5. `parseApplication()` continues, sees more tokens:
   - Calls `parseAtom()` for right side
   - `parseAtom()` creates Identifier('y')
   - Creates Application node with both sides
6. `parse()` verifies EOF and returns final AST

Final AST:
Application {
    lhs: Abstraction {
        param: "x",
        body: Identifier {
            value: "x"
        }
    },
    rhs: Identifier {
        value: "y"
    }
}

## Example 3: Church Numeral 2 (λf.λx.f (f x))

Input: `\f.\x.f (f x)`

Parsing steps:
1. `parse()` calls `parseTerm()`
2. `parseTerm()` sees LAMBDA, creates outer abstraction:
   - Parameter 'f'
   - Recursively calls `parseTerm()` for body
3. Second `parseTerm()` sees LAMBDA, creates inner abstraction:
   - Parameter 'x'
   - Recursively calls `parseTerm()` for body
4. Third `parseTerm()` doesn't see LAMBDA, calls `parseApplication()`
5. First `parseApplication()` calls `parseAtom()`:
   - Creates Identifier('f')
   - Sees more tokens, continues
   - Calls `parseAtom()` for next part
6. Second `parseAtom()` sees LPAREN:
   - Calls `parseTerm()` which calls `parseApplication()`
   - Inner `parseApplication()` builds `f x`
   - Returns to outer `parseApplication()`
7. Outer `parseApplication()` combines into final structure
8. `parse()` verifies EOF and returns final AST

Final AST:
Abstraction {
    param: "f",
    body: Abstraction {
        param: "x",
        body: Application {
            lhs: Identifier { value: "f" },
            rhs: Identifier { value: "x" }
        }
    }
}
