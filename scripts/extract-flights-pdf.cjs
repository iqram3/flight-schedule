const fs = require("fs");
const zlib = require("zlib");

const source = "c:/Users/miqra/Downloads/flights.docx.pdf";
const pdf = fs.readFileSync(source, "latin1");

let text = "";

for (const match of pdf.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
  try {
    const inflated = zlib.inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");

    if (!/Tj/.test(inflated)) {
      continue;
    }

    for (const glyph of inflated.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
      const hex = glyph[1];

      for (let index = 0; index < hex.length; index += 4) {
        const code = Number.parseInt(hex.slice(index, index + 4), 16);
        text += String.fromCharCode(code + 29);
      }
    }

    text += "\n";
  } catch {
    // Some streams are images/fonts; only text streams inflate cleanly into PDF operators.
  }
}

text = text
  .replaceAll("\u0003", " ")
  .replaceAll("\u0005", '"')
  .replaceAll("\u000f", ",")
  .replaceAll("\u001d", ":");

const start = text.indexOf("{");
const end = text.lastIndexOf("}");

if (start === -1 || end === -1) {
  throw new Error("Unable to find JSON payload in PDF text.");
}

const json = JSON.parse(text.slice(start, end + 1));
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/flights.json", `${JSON.stringify(json, null, 2)}\n`);

console.log(`Extracted ${json.flights.length} flights to public/flights.json`);
