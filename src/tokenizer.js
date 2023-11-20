import { TokenType, Types, Keywords, KeywordSet } from "./types.js";

function createToken(pos) {
    return {
        tokenType: TokenType.NIL,
        pos,
        type: null,
        value: null,
    };
}

function isOperator(c) {
    return "+-*/!<>.%&|^".includes(c);
}

function isSymbol(c) {
    return ";{}[]():,=".includes(c);
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

export function tokenize(src) {
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
            if (isNumber(c) || (c === "-" && isNumber(src[i + 1]))) {
                let isFloat = false;
                let number = c === "-" ? "" : c;

                i += 1;
                while (i < src.length && (isNumber(src[i]) || (!isFloat && src[i] === "."))) {
                    if (src[i] === ".") {
                        isFloat = true;
                    }
                    number += src[i];
                    i += 1;
                }

                token.tokenType = TokenType.CONST;
                token.type = isFloat ? Types.FLOAT : Types.INT;
                token.value = isFloat ? parseFloat(number) : parseInt(number);
                i -= 1;
                } else if (isIdentiferStart(c)) {
                    while (i + 1 < src.length && isIdentifer(src[i + 1])) {
                        i += 1;
                    }

                    const value = src.substring(start, i + 1);
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
