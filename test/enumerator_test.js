const { expect } = require("chai");
const { describe, it } = require("mocha");
const { Enumerable, Enumerator } = require("../lib/enumerator.js");

describe("Enumerator", function () {
  it("is a subclass of enumerable", function () {
    const e = new Enumerator(function* () {
      for (const word of ["hello", "world", "foo", "bar"]) {
        yield word;
      }
    });

    expect(e).to.be.instanceOf(Enumerable);
  });

  it("accepts strings as inputs", function () {
    const e = new Enumerator("abcde");
    expect([...e]).to.eql(["a", "b", "c", "d", "e"]);
  });

  it("accepts generator functions as inputs", function () {
    const e = new Enumerator(function* () {
      for (const word of ["hello", "world", "foo", "bar"]) {
        yield word;
      }
    });

    expect([...e]).to.eql(["hello", "world", "foo", "bar"]);
  });
});
