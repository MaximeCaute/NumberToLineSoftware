class MathUtils {
  static isInRect(coordinates, rect){
    return coordinates.x >= rect.left
            & coordinates.x <= rect.right
            & coordinates.y >= rect.top
            & coordinates.y <= rect.bottom;
  }

  static computeRectCenter(rect){
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  static isEqualWithMargin(a, b, margin){
    return Math.abs(a - b) < margin;
  }

  static isIntegerWithMargin(a, margin){
    return MathUtils.isEqualWithMargin(a, Math.round(a), margin)
  }

  // from https://stackoverflow.com/questions/39899072/how-can-i-find-the-prime-factors-of-an-integer-in-javascript
  static getPrimeFactors(n) {
    const factors = [];
    let divisor = 2;

    while (n >= 2) {
      if (n % divisor == 0) {
        factors.push(divisor);
        n = n / divisor;
      } else {
        divisor++;
      }
    }
    return factors;
  }
}
