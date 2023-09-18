export const Types = { 
    VOID: "void",
    INT: "int",
};

export const Keywords = {
    VOID: "void",
    INT: "int",
    IF: "if",
    LET: "let",
};

export const TokenType = {
    EOF: "eof",
    KEYWORD: "kw",
    IDENTIFIER: "id",
    CONST: "const",
    SYMBOL: "symbol",
    OPERATOR: "op",
    NIL: "nil",
};

export const KeywordSet = new Set(Object.keys(Keywords).map(k => k.toLowerCase()));
