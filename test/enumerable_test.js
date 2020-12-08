const { expect } = require("chai");
const { describe, it, beforeEach, context } = require("mocha");
const { Enumerable, Enumerator } = require("../lib/enumerator.js");
const sinon = require("sinon");

describe("Enumerable", function () {
  let MyEnumerable;

  beforeEach(function () {
    /* Make a trivial subclass of Enumerable which accepts a generator */
    MyEnumerable = (() => {
      return class MyEnumerable extends Enumerable {
        constructor(iterator) {
          super();
          this[Symbol.iterator] = iterator;
        }
      };
    })();

    this.emptyIterator = function* () {
      for (const _value of []) {
        yield _value;
      }
    };

    const lazySpy = sinon.fake();
    this.lazySpy = lazySpy;

    this.abcIterator = function* () {
      lazySpy();

      yield "a";
      yield "b";
      yield "c";
    };
  });

  describe("#length", function () {
    it("equals zero when no items are yielded", function () {
      const e = new MyEnumerable(this.emptyIterator);
      expect(e.length()).to.eq(0);
    });

    it("equals the number of items that are yielded", function () {
      const e = new MyEnumerable(this.abcIterator);
      expect(e.length()).to.eql(3);
    });
  });

  describe("#toArray", function () {
    it("returns empty array when no items are yielded", function () {
      const e = new MyEnumerable(this.emptyIterator);
      expect(e.toArray()).to.eql([]);
    });

    it("returns the an array of the items yielded", function () {
      const e = new MyEnumerable(this.abcIterator);
      expect(e.toArray()).to.eql(["a", "b", "c"]);
    });
  });

  describe("#map", function () {
    let map;

    beforeEach(function () {
      const e = new MyEnumerable(this.abcIterator);
      map = e.map((v) => `${v}-${v}`);
    });

    it("is evaluated lazily", function () {
      expect(map).to.be.instanceOf(Enumerator);
      expect(this.lazySpy).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      expect([...map]).to.eql([...map]);
      expect([...map]).not.to.eql([]);
    });

    it("transforms each item", function () {
      expect([...map]).to.eql(["a-a", "b-b", "c-c"]);
    });
  });

  describe("#filter", function () {
    let filter;

    beforeEach(function () {
      const e = new MyEnumerable(this.abcIterator);
      filter = e.filter((v) => v === "b" || v === "c");
    });

    it("is evaluated lazily", function () {
      expect(filter).to.be.instanceOf(Enumerator);
      expect(this.lazySpy).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      expect([...filter]).to.eql([...filter]);
      expect([...filter]).not.to.eql([]);
    });

    it("transforms each item", function () {
      expect([...filter]).to.eql(["b", "c"]);
    });
  });

  describe("#withIndex", function () {
    let withIndex;

    beforeEach(function () {
      const e = new MyEnumerable(this.abcIterator);
      withIndex = e.withIndex();
    });

    it("is evaluated lazily", function () {
      expect(withIndex).to.be.instanceOf(Enumerator);
      expect(this.lazySpy).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      expect([...withIndex]).to.eql([...withIndex]);
      expect([...withIndex]).not.to.eql([]);
    });

    it("yields tuples of [value, index]", function () {
      expect([...withIndex]).to.eql([
        ["a", 0],
        ["b", 1],
        ["c", 2],
      ]);
    });
  });

  describe("#every", function () {
    it("returns true when no items are yielded", function () {
      const e = new MyEnumerable(this.emptyIterator);
      expect(e.every(() => false)).to.be.true;
    });

    it("returns false when at least one element doesn't pass", function () {
      const e = new MyEnumerable(this.abcIterator);
      expect(e.every((v) => v !== "c")).to.be.false;
    });

    it("stops iterating after the first failing element", function () {
      const fake = sinon.fake();
      const e = new MyEnumerable(function* () {
        yield "a";
        fake(); // This line should never be executed
        yield "b";
        yield "c";
      });

      // Eagerly evaluate this function:
      e.every((v) => v === "z");

      expect(fake).not.to.have.been.called;
    });
  });

  describe("#any", function () {
    it("returns false when no items are yielded", function () {
      const e = new MyEnumerable(this.emptyIterator);
      expect(e.any(() => true)).to.be.false;
    });

    it("returns true when at least one element passes", function () {
      const e = new MyEnumerable(this.abcIterator);
      expect(e.any((v) => v === "c")).to.be.true;
    });

    it("stops iterating after the first passing element", function () {
      const fake = sinon.fake();
      const e = new MyEnumerable(function* () {
        yield "a";
        fake(); // This line should never be executed
        yield "b";
        yield "c";
      });

      // Eagerly evaluate this function:
      e.any((v) => v === "a");

      expect(fake).not.to.have.been.called;
    });
  });

  describe("#take", function () {
    it("is evaluated lazily", function () {
      const fake = sinon.fake();
      const e = new MyEnumerable(function* () {
        fake();
        yield "a";
        yield "b";
        yield "c";
      });
      const take = e.take(2);

      expect(take).to.be.instanceOf(Enumerator);
      expect(fake).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      const take = e.take(2);

      expect([...take]).to.eql([...take]);
      expect([...take]).not.to.eql([]);
    });

    it("yields nothing when 0 is passed in", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.take(0)]).to.eql([]);
    });

    it("yields everything when the number passed in exceeds the number of yielded items", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.take(Infinity)]).to.eql(["a", "b", "c"]);
    });

    it("yields the first n items", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.take(2)]).to.eql(["a", "b"]);
    });

    it("does not eagarly load the next item", function () {
      const fake = sinon.fake();
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        fake();
        yield "c";
      });

      [...e.take(2)];

      expect(fake).not.to.have.been.called;
    });
  });

  describe("#drop", function () {
    it("is evaluated lazily", function () {
      const fake = sinon.fake();
      const e = new MyEnumerable(function* () {
        fake();
        yield "a";
        yield "b";
        yield "c";
      });
      const drop = e.drop(1);

      expect(drop).to.be.instanceOf(Enumerator);
      expect(fake).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      const drop = e.drop(1);

      expect([...drop]).to.eql([...drop]);
      expect([...drop]).not.to.eql([]);
    });

    it("yields nothing when the number passed in exceeds the number of yielded items", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.drop(Infinity)]).to.eql([]);
    });

    it("yields everything when 0 is passed in", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.drop(0)]).to.eql(["a", "b", "c"]);
    });

    it("yields the last n items", function () {
      const e = new MyEnumerable(function* () {
        yield "a";
        yield "b";
        yield "c";
      });

      expect([...e.drop(1)]).to.eql(["b", "c"]);
    });
  });

  describe("#flat", function () {
    let flat, fake;

    beforeEach(function () {
      fake = sinon.fake();
      // structure looks like ['a', ['b', ['c', 'd', 'e'], ['f'], ['g']]]
      const e = new MyEnumerable(function* () {
        fake();
        yield "a";
        yield new MyEnumerable(function* () {
          yield "b";
          yield new MyEnumerable(function* () {
            for (const _value of []) {
              // this will never yield
              yield null;
            }
          });
          yield new MyEnumerable(function* () {
            yield "c";
            yield "d";
            yield "e";
          });
          yield new MyEnumerable(function* () {
            yield "f";
          });
          yield new MyEnumerable(function* () {
            yield "g";
          });
        });
      });

      flat = e.flat();
    });

    it("is evaluated lazily", function () {
      expect(flat).to.be.instanceOf(Enumerator);
      expect(fake).not.to.have.been.called;
    });

    it("cannot exhaust the iterator", function () {
      expect([...flat]).to.eql([...flat]);
      expect([...flat]).not.to.eql([]);
    });

    it("iterates recursively through each item", function () {
      expect([...flat]).to.eql(["a", "b", "c", "d", "e", "f", "g"]);
    });
  });
});
