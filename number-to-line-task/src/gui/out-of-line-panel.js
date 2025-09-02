class OutOfLineResponsePanel{
  constructor(isLeft, text, height, width, arrowBodyHeight, arrowheadWidth){
    this.isLeft = isLeft;
    this.text = text;
    // TODO MOVE THIS TO CREATE AS ELEMENT
    this.height =  height;
    this.width = width;
    this.arrowBodyHeight = arrowBodyHeight;
    this.arrowheadWidth = arrowheadWidth;
  }

  static ARROWHEAD_ID = "out-of-line-reponse-panel-arrowhead";

  createAsElement(color, textColor = "black"){
    let outOfLineResponsePanelDiv = document.createElement("div");
    outOfLineResponsePanelDiv.style.display = "flex";
    outOfLineResponsePanelDiv.style.alignItems = "center";

    let components = [
      this.createArrowheadElement(color),
      this.createMainTextBody(color, textColor),
      this.createArrowBodyEnd(color),
    ];

    if(!this.isLeft){
      components.reverse();
    }

    for (let component of components){
      outOfLineResponsePanelDiv.appendChild(component);
    }

    return outOfLineResponsePanelDiv;
  }

  // This exists so that the main body is centered
  createArrowBodyEnd(backgroundColor){
    let arrowBodyEnd = document.createElement("div");

    arrowBodyEnd.style.height = this.arrowBodyHeight;
    arrowBodyEnd.style.width = this.arrowheadWidth;
    arrowBodyEnd.style.backgroundColor = backgroundColor;

    return arrowBodyEnd;
  }

  createMainTextBody(backgroundColor, textColor){
    let mainTextBody = document.createElement("div");

    mainTextBody.style.height = this.arrowBodyHeight;
    mainTextBody.style.width = `calc(${this.width} - 2 * ${this.arrowheadWidth})`;
    mainTextBody.style.backgroundColor = backgroundColor;
    mainTextBody.innerHTML = `<p color=\"${textColor}\">${this.text}</p>`;


    mainTextBody.style.display = "flex";
    mainTextBody.style.flexDirection = "column";
    mainTextBody.style.justifyContent = "center";

    return mainTextBody;
  }

  // TODO triangle
  createArrowheadElement(backgroundColor){
    let arrowhead = document.createElement("div");

    arrowhead.id = OutOfLineResponsePanel.ARROWHEAD_ID;
    // arrowhead.style.height = `${this.height}${measurementUnit}`;
    arrowhead.style.width = this.arrowheadWidth;
    arrowhead.style.boxSizing = "border-box"

    arrowhead.style.borderStyle = "solid";
    //arrowhead.style.borderLeft = `solid ${this.arrowheadWidth}${measurementUnit}`;
    let tipBorder = `solid ${this.arrowheadWidth}`;
    let baseBorder = `solid 0`;
    let topAndBottomBorders = `solid calc(${this.height} / 2)`

    arrowhead.style.borderLeft = this.isLeft ? baseBorder : tipBorder;
    arrowhead.style.borderRight = this.isLeft ? tipBorder : baseBorder;
    arrowhead.style.borderTop= topAndBottomBorders;
    arrowhead.style.borderBottom = topAndBottomBorders;

    arrowhead.style.borderColor = `transparent ${backgroundColor} transparent ${backgroundColor}`;
    // arrowhead.style.borderColor = `black orange red ${backgroundColor}`;

    return arrowhead;
  }

}
