import { TokenType } from "./types.js";

function consume(parser, tokenType, value = null) {
    const t = parser.tokens[parser.pos];

    if (t.tokenType !== tokenType) {
        throw `Expected token type ${tokenType}, but found ${t.tokenType}`;
    }

    if (value !== null && t.value !== value) {
        throw `Expected token value ${value}, but found ${t.value}`;
    }

    parser.pos += 1;
    return t;
}

function match(parser, tokenType) {
    if (parser.tokens[parser.pos].tokenType === tokenType) {
        parser.pos += 1;
        return true;
    }

    return false;
}

function matchValue(parser, tokenType, value) {
    const t = parser.tokens[parser.pos];
    if (t.tokenType === tokenType && t.value === value) {
        parser.pos += 1;
        return true;
    }

    return false;
}

function matchValue(parser, tokenType, ...values) {
    const t = parser.tokens[parser.pos];
    if (t.tokenType === tokenType && values.includes(t.value)) {
        parser.pos += 1;
        return true;
    }
    return false;
}

const nodeType = {
    UNARY: "unary",
    LITERAL: "literal",
    GROUP: "group",
    BINARY: "binary",
    IDENTIFIER: "identifier",
    DECLARATION: "declaration",
    ASSIGNMENT: "assignment",
};

function makeExprUnary(operator, right) {
    return {
        nodeType: nodeType.UNARY,
        operator, right,
        type: null
    };
}

function makeExprBinary(left, operator, right) {
    return {
        nodeType: nodeType.BINARY,
        left, operator, right,
        type: null
    };
}

function makeExprLiteral(value, type) {
    return {
        nodeType: nodeType.LITERAL,
        value,
        type,
    };
}

function makeExprGroup(expr) {
    return {
        nodeType: nodeType.GROUP,
        expr
    }
}

function makeExprIdentifier(value) {
    return {
        nodeType: nodeType.IDENTIFIER,
        value
    };
}

function makeDeclaration(identifer, initializer) {
    return {
        nodeType: nodeType.DECLARATION,
        identifer,
        initializer
    };
}


function declaration(parser) {
    consume(parser, TokenType.KEYWORD, "let");
    const name = consume(parser, TokenType.IDENTIFIER);
    consume(parser, TokenType.SYMBOL, "=");
    const initializer = expression(parser);
    if (parser.tokens[parser.pos].tokenType !== TokenType.SYMBOL || parser.tokens[parser.pos].value !== ";") {
        throw new Error("Expected ';' at the end of declaration");
    }
    consume(parser, TokenType.SYMBOL, ";");

    return makeDeclaration(name, initializer);
}

function primary(parser) {
    const token = parser.tokens[parser.pos];

    if (match(parser, TokenType.CONST)) {
        return makeExprLiteral(token.value, token.type);
    }

    if (match(parser, TokenType.IDENTIFIER)) {
        return makeExprIdentifier(token.value);
    }

    if (matchValue(parser, TokenType.SYMBOL, "(")) {
        const expr = expression(parser);
        consume(parser, TokenType.SYMBOL, ")");
        return  makeExprGroup(expr);
    }

    throw `Invalid token... ${JSON.stringify(token)}`;
}

function unary(parser) {
    while (matchValue(parser, TokenType.OPERATOR, "-", "!")) {
        const op = parser.tokens[parser.pos - 1];
        const right = unary(parser);
        expr = makeExprUnary(op, right);
    }

    return primary(parser);
}

function factor(parser) {
    let expr = unary(parser);

    while (matchValue(parser, TokenType.OPERATOR, "*", "/")) {
        const op = parser.tokens[parser.pos - 1];
        const right = unary(parser);
        expr = makeExprBinary(expr, op, right);
    }

    return expr;
}

function term(parser) {
    let expr = factor(parser);

    while (matchValue(parser, TokenType.OPERATOR, "+", "-")) {
        const op = parser.tokens[parser.pos - 1];
        const right = factor(parser);
        expr = makeExprBinary(expr, op, right);
    }

    return expr;
}

function comparision(parser) {
    let expr = term(parser);

    while (matchValue(parser, TokenType.OPERATOR, ">", "<", ">=", "<=")) {
        const op = parser.tokens[parser.pos - 1];
        const right = term(parser);
        expr = makeExprBinary(expr, op, right);
    }

    return expr;
}

function equality(parser) {
    let expr = comparision(parser);
    
    while (matchValue(parser, TokenType.OPERATOR, "==", "!=")) {
        const op = parser.tokens[parser.pos - 1];
        const right = comparision(parser);
        expr = makeExprBinary(expr, op, right);
    }

    return expr;
}

function expression(parser) {
    return equality(parser);
}


function parseProgram(parser) {
    const declarations = [];
    while (!match(parser, TokenType.EOF)) {
        declarations.push(declaration(parser));
    }

    return declarations;
}

export function parse(tokens) {
    const parser = {
        tokens,
        pos: 0,
    };

    return parseProgram(parser);
}
