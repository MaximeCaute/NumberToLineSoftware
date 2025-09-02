class JsUtils{
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
