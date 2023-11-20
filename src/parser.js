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
    STATEMENT: "statement",
    BLOCK: "block",
    IF_STATEMENT: "if_statement"
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

function makeIfStatement(condition, then, otherwise = null) {
    return {
        nodeType: nodeType.IF_STATEMENT,
        condition,
        then,
        otherwise
    };
}

function makeBlock(statements) {
    return {
        nodeType: nodeType.BLOCK,
        statements
    };
}

function makeDeclaration(identifer, initializer) {
    return {
        nodeType: nodeType.DECLARATION,
        identifer,
        initializer
    };
}

function makeExprStatement(expr) {
    return {
        nodeType: nodeType.STATEMENT,
        expr
    };
}

function block(parser) {
    const statements = [];
    while(!matchValue(parser, TokenType.SYMBOL, "}")) {
        statements.push(statement(parser)); 
    }

    return makeBlock(statements);
}

function statement(parser) {
    if (matchValue(parser, TokenType.SYMBOL, "{")) return block(parser);
    if (matchValue(parser, TokenType.KEYWORD, "if")) return ifStatement(parser);
    if (matchValue(parser, TokenType.KEYWORD, "let")) return declaration(parser);
    const expr = expression(parser);
    consume(parser, TokenType.SYMBOL, ';');
    return makeExprStatement(expr);
} 

function ifStatement(parser) {
    consume(parser, TokenType.SYMBOL, "(");
    const condition = expression(parser);
    consume(parser, TokenType.SYMBOL, ")");
    const thenBranch = statement(parser);
    let otherwise = null;
    if (matchValue(parser, TokenType.KEYWORD, "else")) {
        otherwise = statement(parser);
    }
    return makeIfStatement(condition, thenBranch, otherwise);
}

function declaration(parser) {
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
    const statements= [];
    while (!match(parser, TokenType.EOF)) {
        statements.push(statement(parser));
    }

    return statements;
}

export function parse(tokens) {
    const parser = {
        tokens,
        pos: 0,
    };

    return parseProgram(parser);
}
