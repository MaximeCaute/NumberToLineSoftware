class Localizer {
  static FORMATTABLE_MARKER = "[!!!]";

  static format(message, parameters){
    for (var parameter of parameters){
      message = message.replace(Localizer.FORMATTABLE_MARKER, parameter);
    }

    return message;
  }

  // TODO ALLOW ARRAY OF FLAGS !
  getMessage(messageKeys, parameters = [], htmlFlags = ""){
    if (this.messages == null)
      throw new Error("Invalid localizer!");

    if (!Array.isArray(messageKeys))
      messageKeys = [messageKeys]

    var message = "";
    for (var messageKey of messageKeys){
      if (this.messages[messageKey] == null)
        throw new Error(`Invalid key for localizer: ${messageKey}!`);

      message += Localizer.format(this.messages[messageKey], parameters);
      message += " "
    }

    // DROP last " "
    message = message.substring(0, message.length - 1);

    if (htmlFlags == "")
      return message;

    return `<${htmlFlags}>${message}</${htmlFlags}>`;
  }
}
