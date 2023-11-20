import { tokenize } from "./src/tokenizer.js";
import { parse } from "./src/parser.js";


const source = "let a = b + 3.14 * 2;"
const tokens = tokenize(source);
const ast = parse(tokens);

console.log(tokens);
console.log(ast);

