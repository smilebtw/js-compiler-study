import { TokenType, Types, Keywords, KeywordSet } from "./types.js";

function createToken(pos) {
    return {
        tokenType: TokenType.NIL,
        pos,
        type: null,
        value: null,
    };
}

// essa bomba em diferentes arquivos
function isOperator(c) {
    return "+-*/!<>.%&|^".includes(c);
}

function isSymbol(c) {
    return ";{}[]():,=".includes(c);
}

function isNumber(c) {
    return c >= "0" && c <= "9";
}

function isFloat(c) {
    return c === ".";
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

export function tokenize(src) {
    const tokens = [];
    
    for (let i = 0; ; i += 1) {
        while (i < src.length && isWhitespace(src[i])) i += 1;
        if (i >= src.length) break;

        const c = src[i];
        const start = i;
        const token = createToken(start);

        if (c === "l" && src.substring(i, i + 3) === "let" && !isIdentifer(src[i + 3])) {
            token.tokenType = TokenType.KEYWORD;
            token.value = src.substring(i, i + 3);
            token.type = Types.VOID; // Defina o tipo apropriado para "let"
            i += 2; 
        } else if (isOperator(c)) {
            if (i + 1 < src.length && isOperator(src[i+1]))
                i += 1;

            token.tokenType = TokenType.OPERATOR;
            token.value = src.substring(start, i + 1);
        } else if (isSymbol(c)) {
            token.tokenType = TokenType.SYMBOL;
            token.value = c;
        } else {
            if (isNumber(c) || c === "-") {

                let isNeg = c === "-";
                let n = isNeg ? 0 : Number(c);

                for(; i < src.length && isNumber(src[i+1]); i += 1) {
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
