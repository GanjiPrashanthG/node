/**
 * Streams Demonstration
 * Understanding Node.js Streams
 */

const fs = require('fs');
const { Readable, Writable, Transform, pipeline } = require('stream');

// ===== READABLE STREAM =====
class NumberStream extends Readable {
  constructor(max) {
    super({ objectMode: true });
    this.max = max;
    this.index = 1;
  }
  
  _read() {
    if (this.index > this.max) {
      this.push(null); // End stream
    } else {
      this.push({ number: this.index++ });
    }
  }
}

// ===== TRANSFORM STREAM =====
class MultiplyStream extends Transform {
  constructor(factor) {
    super({ objectMode: true });
    this.factor = factor;
  }
  
  _transform(chunk, encoding, callback) {
    const result = chunk.number * this.factor;
    this.push({ original: chunk.number, multiplied: result });
    callback();
  }
}

// ===== WRITABLE STREAM =====
class LoggerStream extends Writable {
  constructor() {
    super({ objectMode: true });
  }
  
  _write(chunk, encoding, callback) {
    console.log(`Result: ${chunk.original} * 2 = ${chunk.multiplied}`);
    callback();
  }
}

// ===== USAGE =====
const numbers = new NumberStream(5);
const multiply = new MultiplyStream(2);
const logger = new LoggerStream();

// Pipe streams
numbers.pipe(multiply).pipe(logger);

// ===== FILE STREAMS =====
function copyFile(source, destination) {
  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(destination);
  
  readStream.pipe(writeStream);
  
  readStream.on('error', (err) => {
    console.error('Read error:', err);
  });
  
  writeStream.on('error', (err) => {
    console.error('Write error:', err);
  });
  
  writeStream.on('finish', () => {
    console.log('File copied successfully');
  });
}

// ===== PIPELINE (Better error handling) =====
function copyFileWithPipeline(source, destination) {
  pipeline(
    fs.createReadStream(source),
    fs.createWriteStream(destination),
    (err) => {
      if (err) {
        console.error('Pipeline error:', err);
      } else {
        console.log('Pipeline completed');
      }
    }
  );
}

// ===== BACKPRESSURE HANDLING =====
function handleBackpressure() {
  const readStream = fs.createReadStream('large-file.txt');
  const writeStream = fs.createWriteStream('output.txt');
  
  readStream.on('data', (chunk) => {
    const canContinue = writeStream.write(chunk);
    if (!canContinue) {
      // Pause reading when buffer is full
      readStream.pause();
    }
  });
  
  writeStream.on('drain', () => {
    // Resume reading when buffer is drained
    readStream.resume();
  });
  
  readStream.on('end', () => {
    writeStream.end();
  });
}

