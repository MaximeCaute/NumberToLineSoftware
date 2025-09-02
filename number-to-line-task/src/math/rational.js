class Rational{
  constructor(value, id, components = []){
    this.value = value;
    this.id = id;
    this.components = components
  }

  static parse(inputString){
    for (let RationalClass of [WholeNumber, Decimal, Fraction]){
      var parsed = RationalClass.REGEXPR.exec(inputString);

      if (parsed != null)
        return new RationalClass(parseInt(parsed[1]), parsed[2] == undefined ? -1 : parseInt(parsed[2]));
    }

    var parsed = FractionAddition.REGEXPR.exec(inputString)
    if (parsed != null){
      return new FractionAddition(parseInt(parsed[1]), parseInt(parsed[2]), parseInt(parsed[3]), parseInt(parsed[4]))
    }

    /// TODO generalize pattern
    for (let RationalClass of [WholeOperation, WholeAndFractionOperation]){
      parsed = RationalClass.parse(inputString)
      if (parsed != null)
        return parsed;
    }

    throw new Error("No rational found matching : "+ inputString);
  }

  toImageNameWithDimensions(xSize, ySize, fractionImagePath = FRACTION_IMAGE_PATH){
    return fractionImagePath + this.toImageName() + `_${xSize}x${ySize}.png`;
  }
}

class Fraction extends Rational{
  constructor(numerator, denominator){
    super(numerator / denominator, Fraction.ID, [numerator, denominator]);
    this.numerator = numerator;
    this.denominator = denominator;
  }

  static ID = "FRACTION";
  static REGEXPR = /^([0-9]+)\/([0-9]+)$/

  toImageName(){
    return `${this.numerator}_over_${this.denominator}`;
  }

  decimalError(inverted, ten_value = 10){
    let a = inverted ? this.denominator : this.numerator;
    let b = inverted ? this.numerator : this.denominator;

    a = a == 10 ? ten_value : a;
    b = b == 10 ? ten_value : b;

    return a + b / 10
  }
}

class Decimal extends Rational{
  constructor(wholePart, decimalPart){
    super(wholePart + decimalPart / Math.pow(10, decimalPart.toString().length), Decimal.ID, [wholePart, decimalPart]);
    this.wholePart = wholePart;
    this.decimalPart = decimalPart;
  }

  static ID = "DECIMAL";
  static REGEXPR = /^([0-9]+)[,|\.]([0-9]+)$/

  toImageName(){
    return `${this.wholePart}_comma_${this.decimalPart}`;
  }
}

class WholeNumber extends Rational{
  constructor(value){
    super(value, WholeNumber.ID, [value]);
  }

  static ID = "WHOLE";
  static REGEXPR = /^([0-9]+)$/

  toImageName(){
    return `${this.value}`;
  }
}

// TODO OPERATION
class FractionAddition extends Rational{
  constructor(firstNumerator, firstDenominator, secondNumerator, secondDenominator){
    // TODO CHeck that terms are rationals
    super(firstNumerator / firstDenominator + secondNumerator / secondDenominator, FractionAddition.ID, [firstNumerator, firstDenominator, secondNumerator, secondDenominator]);
    this.firstNumerator = firstNumerator,
    this.firstDenominator = firstDenominator,
    this.secondNumerator = secondNumerator,
    this.secondDenominator = secondDenominator
  }

  static ID = "FRACTION_ADDITION";
  static REGEXPR = /^([0-9]+)\/([0-9]+)\+([0-9]+)\/([0-9]+)$/

  toImageName(){
    return `${this.firstNumerator}_over_${this.firstDenominator}_plus_${this.secondNumerator}_over_${this.secondDenominator}`;
  }
}

class WholeOperation extends Rational{
  // components must always be an integer for the plugin to work
  constructor(components){
    // todo Parse int should not be useful : perhaps just check type?
    let firstTerm = parseInt(components[0])
    let sign = parseInt(components[1]) == 1 ? "+" : "-"
    let secondTerm = parseInt(components[2])

    let value;
    // TODO this could use a dedicated OPERATOR subclass
    if (sign == "+")
      value = firstTerm + secondTerm;
    else
      value = firstTerm - secondTerm;

    // TODO CHeck that terms are rationals
    // TODO, add sign as +-1?
    super(value, WholeOperation.ID, components);
    this.firstTerm = firstTerm
    this.sign = sign
    this.secondTerm = secondTerm
  }

  static ID = "WHOLE_OPERATION";
  static REGEXPR = /^([0-9]+)([\+-])([0-9]+)$/

  static parse(source){
    var parsed = WholeOperation.REGEXPR.exec(source)
    if (parsed == null)
      return null;

    parsed[2] = parsed[2].replace("+", 1)
    parsed[2] = parsed[2].replace("-", -1)

    return new WholeOperation(parsed.slice(1).map(c => parseInt(c)))
  }

  toImageName(){
    return `${this.firstTerm}_${this.sign == "+" ? "plus" : "minus"}_${this.secondTerm}`;
  }
}

class WholeAndFractionOperation extends Rational{
  // components must always be an integer for the plugin to work
  constructor(components){
    // todo Parse int should not be useful : perhaps just check type?
    //let numerator = //parseInt(firstNumerator[0])
    //let denominator = //
    let sign = parseInt(components[0]) == 1 ? "+" : "-"
    let hasWholeNumberFirst = parseInt(components[1]) == 1 ? true : false
    let wholeTerm = parseInt(components[2])
    let fractionNumerator = parseInt(components[3])
    let fractionDenominator = parseInt(components[4])

    let value;
    // TODO this could use a dedicated OPERATOR subclass
    if (sign == "+"){
      value = wholeTerm + fractionNumerator / fractionDenominator;
    } else{
      if (hasWholeNumberFirst){
        value = wholeTerm - fractionNumerator / fractionDenominator;
      } else {
        value = fractionNumerator / fractionDenominator - wholeTerm;
      }
    }

    // TODO CHeck that terms are rationals
    // TODO, add sign as +-1?
    super(value, WholeAndFractionOperation.ID, components);
    this.hasWholeNumberFirst = hasWholeNumberFirst
    this.sign = sign
    this.fractionNumerator = fractionNumerator
    this.fractionDenominator = fractionDenominator
    this.wholeTerm = wholeTerm
  }

  static ID = "WHOLE_AND_FRACTION_OPERATION";
  // Match either "fraction(+|-)whole" or "whole(+|-)fraction" expressions.
  static REGEXPR = /^(?:([0-9]+)\/([0-9]+)([\+-])([0-9]+)|([0-9]+)([\+-])([0-9]+)\/([0-9]+))$/


  static parse(source){
    let parsed = WholeAndFractionOperation.REGEXPR.exec(source)
    if (parsed == null)
      return null;

    let hasFractionFirst = parsed[1] != undefined
    let components = hasFractionFirst ?
      [parsed[3], -1, parsed[4], parsed[1], parsed[2]] :
      [parsed[6], 1, parsed[5], parsed[7], parsed[8]]

    // TODO put order (fraction-whole vs. whole-fraction first.)
    components[0] = components[0].replace("+", 1)
    components[0] = components[0].replace("-", -1)

    return new WholeAndFractionOperation(components.map(c => parseInt(c)))
  }

  toImageName(){
    if (this.hasWholeNumberFirst)
      return `${this.wholeTerm}_${this.sign == "+" ? "plus" : "minus"}_${this.fractionNumerator}_over_${this.fractionDenominator}`;
    return `${this.fractionNumerator}_over_${this.fractionDenominator}_${this.sign == "+" ? "plus" : "minus"}_${this.wholeTerm}`;
  }
}
