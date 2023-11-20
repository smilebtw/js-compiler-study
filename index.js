import { tokenize } from "./src/tokenizer.js";
import { parse } from "./src/parser.js";


const source = "if (a <= 3) { let b = 2; }"
const tokens = tokenize(source);
const ast = parse(tokens);

console.log(tokens);
console.log(ast);

