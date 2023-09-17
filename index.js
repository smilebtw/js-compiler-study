// Comecando com os valores em str pra facilitar o debugging

// TODO: Substituir str para valores inteiros
const Types = { 
    VOID: "void",
    INT: "int",
};

const Keywords = {
    VOID: "void",
    INT: "int",
    IF: "if",
    LET: "let",
};

const KeywordSet = new Set(Object.keys(Keywords).map(k => k.toLowerCase()));

const TokenType = {
    EOF: "eof",
    KEYWORD: "kw",
    IDENTIFIER: "id",
    CONST: "const",
    SYMBOL: "symbol",
    OPERATOR: "op",
    NIL: "nil",
};

function createToken(pos) {
    return {
        tokenType: TokenType.NIL,
        pos,
        type: null,
        value: null,
    };
}

// Criando tudo num arquivo so, depois separar 
// essa bomba em diferentes arquivos
function isOperator(c) {
    return "+-*/!<>.%&|^".includes(c);
}

function isSymbol(c) {
    return ";{}[]():,".includes(c);
}

function isNumber(c) {
    return c >= "0" && c <= "9";
}

function isWhitespace(c) {
    return c <= " ";
}

function isIdentiferStart(c) {
    return (c >= "a" && c <= "z") ||
           (c >= "A" && c <= "Z") ||
           c === "_";
}

function isIdentifer(c) {
    return isIdentiferStart(c) || isNumber(c);
}

// src = 1 + 2 * 3
function tokenize(src) {
    const tokens = [];
    
    for (let i = 0; ; i += 1) {
        
        while (i < src.length && isWhitespace(src[i])) i += 1;
        if (i >= src.length) break;

        const c = src[i];
        const start = i;
        const token = createToken(start);

        if (isOperator(c)) {
            if (i + 1 < src.length && isOperator(src[i+1]))
                i += 1;

            token.tokenType = TokenType.OPERATOR;
            token.value = src.substring(start, i + 1);
        } else if (isSymbol(c)) {
            token.tokenType = TokenType.SYMBOL;
            token.value = c;
        } else {
            if (isNumber(c) || c === "-") {
                i += 1;

                let isNeg = c === "-";
                let n = isNeg ? 0 : Number(c);

                for(; i < src.length && isNumber(src[i]); i += 1) {
                    n = (n * 10) + Number(src[i]);
                }

                token.tokenType = TokenType.CONST;
                token.type = Types.INT;
                token.value = n;
                } else if (isIdentiferStart(c)) {
                    i += 1;
                    for (; i < src.length && isIdentifer(src[i]); i += 1);

                    const value = src.substring(start, i);
                    const kw = KeywordSet.has(value);

                    token.tokenType = kw ? TokenType.KEYWORD : TokenType.IDENTIFIER;
                    token.value = value;
                } else {
                    throw `Invalid char '${c}'`;
                }
            }
            
            tokens.push(token);
        }

    const EOF = createToken(src.length);
    EOF.tokenType = TokenType.EOF;
    tokens.push(EOF);

    return tokens;
}

function consume(parser, tokenType, value) {
    const t = parser.tokens[parser.pos];
    if (t.tokenType === tokenType && t.value === value) {
        parser.pos += 1;
        return;
    }

    throw `${JSON.stringify(t)} != ${tokenType}: ${value}`;
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
    BINARY: "binary"
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

function primary(parser) {
    const token = parser.tokens[parser.pos];
    if (match(parser, TokenType.CONST)) return makeExprLiteral(token.value, token.type);

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

function parse(tokens) {
    const parser = {
        tokens,
        pos: 0,
    };

    return expression(parser);
}

const source = "1 + 1 * 3 / 2";
const tokens = tokenize(source);
const ast = parse(tokens);

console.log(tokens);
console.log(ast);
