/*
  This is an attempt to implement the behavior of Ruby's
  lazy enumerator, but in javascript.  The main reason for
  the exercise was to see if I could make an object that would
  work with the [...someCustomObject] pattern.
*/

function* enumerate(context) {
  let index = 0;
  for (const value of context) {
    yield [value, index];
    index++;
  }
}

function isPrimitive(value) {
  return value == null || /^[sbn]/.test(typeof value);
}

function iterator(val) {
  return val[Symbol.iterator] ? val[Symbol.iterator]() : val();
}

class Enumerable {
  reduce(callback, seed) {
    const iterator = enumerate(this);

    let accumulation;
    if (arguments.length >= 2) {
      accumulation = seed;
    } else {
      let nextItem = iterator.next();
      if (!nextItem.done) {
        [accumulation] = nextItem.value;
      }
    }

    for (const [value, index] of iterator) {
      accumulation = callback(accumulation, value, index);
    }

    return accumulation;
  }

  toArray() {
    return this.reduce((agg, value) => agg.push(value) && agg, []);
  }

  length() {
    return this.reduce((agg) => agg + 1, 0);
  }

  max() {
    return this.reduce((a, b) => Math.max(a, b));
  }

  min() {
    return this.reduce((a, b) => Math.min(a, b));
  }

  flat() {
    return new Enumerator(
      function* () {
        for (const value of this) {
          if (isPrimitive(value)) {
            yield value;
          } else {
            yield* new Enumerator(value).flat();
          }
        }
      }.bind(this)
    );
  }

  find(criterion) {
    for (const [value, index] of enumerate(this)) {
      if (criterion(value, index)) {
        return value;
      }
    }
  }

  // TODO: add tests
  indexOf(expectedValue) {
    for (const [value, index] of enumerate(this)) {
      if (value === expectedValue) {
        return index;
      }
    }
    return -1;
  }

  // TODO: add tests
  lastIndexOf(expectedValue) {
    let highestIndexSoFar = -1;
    for (const [value, index] of enumerate(this)) {
      if (value === expectedValue) {
        highestIndexSoFar = index;
      }
    }

    return highestIndexSoFar;
  }

  // TODO: add tests
  includes(expectedValue) {
    for (const value of this) {
      if (value === expectedValue) {
        return true;
      }
    }
    return false;
  }

  any(criterion) {
    for (const [value, index] of enumerate(this)) {
      if (criterion(value, index)) {
        return true;
      }
    }

    return false;
  }

  every(criterion) {
    for (const [value, index] of enumerate(this)) {
      if (!criterion(value, index)) {
        return false;
      }
    }

    return true;
  }

  map(transform) {
    return new Enumerator(
      function* () {
        for (const [value, index] of enumerate(this)) {
          yield transform(value, index);
        }
      }.bind(this)
    );
  }

  filter(criterion) {
    return new Enumerator(
      function* () {
        for (const [value, index] of enumerate(this)) {
          if (criterion(value, index)) {
            yield value;
          }
        }
      }.bind(this)
    );
  }

  withIndex() {
    return new Enumerator(() => enumerate(this));
  }

  // TODO: add tests
  zip(otherEnumerable) {
    return new Enumerator(
      function* () {
        let otherIterator = iterator(otherEnumerable);
        for (const value of this) {
          let otherItem = otherIterator.next();
          if (otherItem.done) {
            return;
          } else {
            yield [value, otherItem.value];
          }
        }

        if (typeof otherIterator.return === "function") {
          otherIterator.return();
        }
      }.bind(this)
    );
  }

  take(quantity) {
    return new Enumerator(
      function* () {
        let item;
        const thisIterator = iterator(this);
        for (let index = 0; index < quantity; index++) {
          item = thisIterator.next();
          if (item.done) {
            break;
          } else {
            yield item.value;
          }
        }

        if (item && !item.done && typeof thisIterator.return === "function") {
          thisIterator.return();
        }
      }.bind(this)
    );
  }

  drop(quantity) {
    return new Enumerator(
      function* () {
        for (const [value, index] of enumerate(this)) {
          if (index >= quantity) {
            yield value;
          }
        }
      }.bind(this)
    );
  }
}

class Enumerator extends Enumerable {
  constructor(enumerable) {
    super();

    let iterator;
    if (enumerable[Symbol.iterator]) {
      iterator = () => enumerable[Symbol.iterator]();
    } else {
      iterator = enumerable;
    }

    Object.defineProperty(this, Symbol.iterator, { value: iterator });
  }
}

module.exports = {
  Enumerable,
  Enumerator,
};
