import { tokenize } from "./src/tokenizer.js";
import { parse } from "./src/parser.js";


const source = "1 + 1 * 3";
const tokens = tokenize(source);
const ast = parse(tokens);

console.log(tokens);
console.log(ast);
