const LineByLine = require('n-readlines');
const liner = new LineByLine('./tools/pmena.txt');
const fs = require('fs');

let line;
const words = [];
const lengths = {};

while ((line = liner.next())) {
  const word = line.toString().toUpperCase().replace('\r', '');
  words.push(word);
  if (!lengths[word.length]) {
    lengths[word.length] = [];
  }
  lengths[word.length].push(word);
}

fs.writeFileSync(
  'words2.json',
  JSON.stringify({ words, count: words.length, lengths })
);
