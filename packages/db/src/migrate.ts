import { up } from "./migrations/001_initial_schema.js";

console.log("Kysely migration scaffold ready.");
console.log("Exports available:", typeof up === "function" ? "up/down" : "missing");
