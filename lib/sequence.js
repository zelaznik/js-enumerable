const { Enumerable } = require("./enumerator.js");

function parseArgs(...args) {
  let start = 0;
  let stop;
  let step = 1;

  if (args.length === 3) {
    [start, stop, step] = args;
  } else if (args.length === 2) {
    [start, stop] = args;
  } else if (args.length === 1) {
    [stop] = args;
  }

  return { start, stop, step };
}

class Sequence extends Enumerable {
  constructor(...args) {
    super();

    const { start, stop, step } = parseArgs(...args);

    this.start = start;
    this.stop = stop;
    this.step = step;

    Object.freeze(this);
  }

  *[Symbol.iterator]() {
    let value = this.start;

    if (this.step > 0) {
      while (value < this.stop) {
        yield value;
        value += this.step;
      }
    } else if (this.step < 0) {
      while (value > this.stop) {
        yield value;
        value += this.step;
      }
    }
  }
}

module.exports = Sequence;
