class Rational{
  constructor(value, id){
    this.value = value;
    this.id = id;
  }

  static parse(inputString){
    for (let RationalClass of [WholeNumber, Decimal, Fraction]){
      var parsed = RationalClass.REGEXPR.exec(inputString);

      if (parsed != null)
        return new RationalClass(parseInt(parsed[1]), parsed[2] == undefined ? -1 : parseInt(parsed[2]));
    }

    throw new Error("No rational found matching : "+ inputString);
  }

  toImageNameWithDimensions(xSize, ySize, fractionImagePath = FRACTION_IMAGE_PATH){
    return fractionImagePath + this.toImageName() + `_${xSize}x${ySize}.png`;
  }
}

class Fraction extends Rational{
  constructor(numerator, denominator){
    super(numerator / denominator, Fraction.ID);
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

    console.log(a, b, a+b/10)
     return a + b / 10
  }
}

class Decimal extends Rational{
  constructor(wholePart, decimalPart){
    super(wholePart + decimalPart / Math.pow(10, decimalPart.toString().length), Decimal.ID);
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
    super(value, WholeNumber.ID);
  }

  static ID = "WHOLE";
  static REGEXPR = /^([0-9]+)$/

  toImageName(){
    return `${this.value}`;
  }
}
