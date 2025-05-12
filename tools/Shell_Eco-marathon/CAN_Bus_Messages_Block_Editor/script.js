$(document).ready(function () {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    var shapes = [];
    var selectedShape = null;
    var dragStartX, dragStartY;
    var draggingShape = false;
    var draggingPin = null;
    var connectingLine = null;
    var hoverPin = null;

    const cppDataTypes = [
        'int8_t', 'uint8_t', 'int16_t', 'uint16_t', 'int32_t', 'uint32_t', 
        'int64_t', 'uint64_t', 'float', 'double', 'bool', 'char'
    ];

    function generateHexId() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function Shape(type, x, y, width, height, inputCount, outputCount, name) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.showInfo = false;
        this.scrollPosition = 0;
        this.inputPins = [];
        this.outputPins = [];
        this.connections = [];

        if (this.type === 'rectangle') {
            this.id = generateHexId();
            this.isStd = true;
            this.inputCount = 0;
            this.outputCount = outputCount;
            this.pinData = {};
            for (let i = 1; i <= this.outputCount; i++) {
                this.pinData[i] = { startBit: 0, endBit: 0 };
            }
        } else if (this.type === 'ellipse') {
            this.inputCount = 1;
            this.outputCount = outputCount >= 0 && outputCount <= 1 ? outputCount : 1;
        } else if (this.type === 'parallelogram') {
            this.inputCount = inputCount;
            this.outputCount = outputCount;
            this.outputData = {};
            for (let i = 1; i <= this.outputCount; i++) {
                this.outputData[i] = '';
            }
        }

        this.outputDataTypes = new Array(this.outputCount).fill('uint32_t');

        this.createPins = function () {
            if (this.type === 'rectangle') {
                var pinHeight = this.height / (this.outputCount + 1);
                for (var j = 1; j <= this.outputCount; j++) {
                    var pinY = this.y + j * pinHeight;
                    pinY = Math.min(Math.max(pinY, this.y), this.y + this.height - 5);
                    this.outputPins.push({ x: this.x + this.width, y: pinY });
                }
            } else if (this.type === 'ellipse') {
                this.inputPins.push({ x: this.x, y: this.y + this.height / 2 });
                if (this.outputCount === 1) {
                    this.outputPins.push({ x: this.x + this.width, y: this.y + this.height / 2 });
                }
            } else if (this.type === 'parallelogram') {
                var inputPinHeight = this.height / (this.inputCount + 1);
                for (var i = 1; i <= this.inputCount; i++) {
                    var pinY = this.y + i * inputPinHeight;
                    pinY = Math.min(Math.max(pinY, this.y), this.y + this.height - 5);
                    this.inputPins.push({ x: this.x, y: pinY });
                }
                
                var outputPinHeight = this.height / (this.outputCount + 1);
                for (var j = 1; j <= this.outputCount; j++) {
                    var pinY = this.y + j * outputPinHeight;
                    pinY = Math.min(Math.max(pinY, this.y), this.y + this.height - 5);
                    this.outputPins.push({ x: this.x + this.width, y: pinY });
                }
            }
        };

        this.draw = function () {
            ctx.beginPath();
            if (this.type === 'rectangle') {
                ctx.rect(this.x, this.y, this.width, this.height);
            } else if (this.type === 'ellipse') {
                ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
            } else if (this.type === 'parallelogram') {
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width * 0.6, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.lineTo(this.x + this.width * 0.4, this.y + this.height);
                ctx.closePath();
            }
            ctx.stroke();
        
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            
            this.inputPins.forEach(function (pin, index) {
                ctx.beginPath();
                ctx.arc(pin.x, pin.y, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = 'right';
                ctx.fillText(index + 1, pin.x - 5, pin.y + 3);
            });
            
            this.outputPins.forEach(function (pin, index) {
                ctx.beginPath();
                ctx.arc(pin.x, pin.y, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = 'left';
                ctx.fillText(index + 1, pin.x + 5, pin.y + 3);
            });
        
            if (this.name) {
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
            }
    
            if (this.showInfo) {
                this.showInfoBox();
            }
        };

        this.showInfoBox = function() {
            let infoContent = ['Output Data Types:'];
            this.outputDataTypes.forEach((type, index) => {
                infoContent.push(`Output ${index + 1}: ${type}`);
            });
            
            if (this.type === 'rectangle') {
                infoContent.push(`ID: ${this.id}`);
                infoContent.push(`Type: ${this.isStd ? 'STD' : 'EXTD'}`);
                infoContent.push('Pin Data:');
                Object.entries(this.pinData).forEach(([pin, data]) => {
                    infoContent.push(`Pin ${pin}: ${data.startBit}-${data.endBit}`);
                });
            } else if (this.type === 'parallelogram') {
                infoContent.push('Output Data:');
                Object.entries(this.outputData).forEach(([pin, data]) => {
                    infoContent.push(`Output ${pin}: ${data}`);
                });
            }

            let infoBoxHeight = Math.min(200, 80 + infoContent.length * 15);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(this.x, this.y - infoBoxHeight, this.width, infoBoxHeight);
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';

            let lineHeight = 15;
            let visibleLines = Math.floor((infoBoxHeight - 10) / lineHeight);

            for (let i = this.scrollPosition; i < Math.min(infoContent.length, this.scrollPosition + visibleLines); i++) {
                ctx.fillText(infoContent[i], this.x + 5, this.y - infoBoxHeight + 15 + (i - this.scrollPosition) * lineHeight);
            }

            if (infoContent.length > visibleLines) {
                let scrollBarHeight = (visibleLines / infoContent.length) * infoBoxHeight;
                let scrollBarY = this.y - infoBoxHeight + (this.scrollPosition / infoContent.length) * infoBoxHeight;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(this.x + this.width - 10, scrollBarY, 5, scrollBarHeight);
            }
        };

        this.isInside = function (mouseX, mouseY) {
            return mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height;
        };

        this.pinIsInside = function (pinX, pinY, mouseX, mouseY) {
            var radius = 5;
            return mouseX >= pinX - radius && mouseX <= pinX + radius && mouseY >= pinY - radius && mouseY <= pinY + radius;
        };

        this.move = function (dx, dy) {
            this.x += dx;
            this.y += dy;

            this.inputPins.forEach(function (pin) {
                pin.x += dx;
                pin.y += dy;
            });
            
            this.outputPins.forEach(function (pin) {
                pin.x += dx;
                pin.y += dy;
            });
        };
    }

    canvas.addEventListener('mousedown', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;

        shapes.forEach(function (shape) {
            if (shape.isInside(mouseX, mouseY)) {
                selectedShape = shape;
                draggingShape = true;
                dragStartX = mouseX - shape.x;
                dragStartY = mouseY - shape.y;

                shape.outputPins.forEach(function (pin) {
                    if (shape.pinIsInside(pin.x, pin.y, mouseX, mouseY)) {
                        draggingPin = pin;
                        connectingLine = { startX: pin.x, startY: pin.y, endX: mouseX, endY: mouseY, pin: pin };
                        return;
                    }
                });

                return;
            }
        });
    });

    canvas.addEventListener('mousemove', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;

        if (draggingShape) {
            if (draggingPin) {
                connectingLine.endX = mouseX;
                connectingLine.endY = mouseY;
            } else {
                var dx = mouseX - dragStartX - selectedShape.x;
                var dy = mouseY - dragStartY - selectedShape.y;
                selectedShape.move(dx, dy);
            }
            updateCanvas();
        } else if (draggingPin) {
            connectingLine.endX = mouseX;
            connectingLine.endY = mouseY;
            updateCanvas();
        }

        hoverPin = null;
        shapes.forEach(function (shape) {
            if ((shape.type === 'rectangle' || shape.type === 'ellipse' || shape.type === 'parallelogram') && shape.isInside(mouseX, mouseY)) {
                shape.showInfo = true;
            } else {
                shape.showInfo = false;
            }

            if (!hoverPin) {
                shape.inputPins.forEach(function (pin) {
                    if (shape.pinIsInside(pin.x, pin.y, mouseX, mouseY) && pin !== draggingPin) {
                        hoverPin = pin;
                    }
                });
            }
        });

        updateCanvas();
    });

    canvas.addEventListener('mouseup', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;

        if (draggingPin) {
            var connected = false;
            shapes.forEach(function (shape) {
                if (!connected) {
                    shape.inputPins.forEach(function (pin) {
                        if (!connected && shape.pinIsInside(pin.x, pin.y, mouseX, mouseY) && pin !== draggingPin) {
                            draggingPin.connectedPin = pin;
                            shape.connections.push({ startPin: draggingPin, endPin: pin });
                            connected = true;
                        }
                    });
                }
            });
        }

        draggingShape = false;
        selectedShape = null;
        draggingPin = null;
        connectingLine = null;
        updateCanvas();
    });

    canvas.addEventListener('dblclick', function (e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;

        shapes.forEach(function (shape) {
            if ((shape.type === 'rectangle' || shape.type === 'ellipse' || shape.type === 'parallelogram') && shape.isInside(mouseX, mouseY)) {
                editShapeInfo(shape);
            }
        });
    });

    canvas.addEventListener('wheel', function(e) {
        var mouseX = e.clientX - canvas.getBoundingClientRect().left;
        var mouseY = e.clientY - canvas.getBoundingClientRect().top;

        shapes.forEach(function(shape) {
            if ((shape.type === 'rectangle' || shape.type === 'ellipse' || shape.type === 'parallelogram') && shape.showInfo && shape.isInside(mouseX, mouseY)) {
                e.preventDefault();
                let infoContent = ['Output Data Types:'].concat(shape.outputDataTypes.map((type, index) => `Output ${index + 1}: ${type}`));
                
                if (shape.type === 'rectangle') {
                    infoContent = infoContent.concat([`ID: ${shape.id}`, `Type: ${shape.isStd ? 'STD' : 'EXTD'}`, 'Pin Data:'])
                        .concat(Object.entries(shape.pinData).map(([pin, data]) => `Pin ${pin}: ${data.startBit}-${data.endBit}`));
                } else if (shape.type === 'parallelogram') {
                    infoContent = infoContent.concat(['Output Data:'])
                        .concat(Object.entries(shape.outputData).map(([pin, data]) => `Output ${pin}: ${data}`));
                }
                
                let visibleLines = Math.floor((Math.min(200, 80 + infoContent.length * 15) - 10) / 15);
                
                if (infoContent.length > visibleLines) {
                    shape.scrollPosition += e.deltaY > 0 ? 1 : -1;
                    shape.scrollPosition = Math.max(0, Math.min(shape.scrollPosition, infoContent.length - visibleLines));
                    updateCanvas();
                }
            }
        });
    });

    function editShapeInfo(shape) {
        if (shape.type === 'rectangle') {
            let newId = prompt("Enter new ID (hex format):", shape.id);
            if (newId && /^[0-9A-Fa-f]{6}$/.test(newId)) {
                shape.id = newId;
            } else {
                alert("Invalid hex ID. It should be 6 characters long and contain only hex digits.");
                return;
            }

            let newType = prompt("Enter type (STD or EXTD):", shape.isStd ? "STD" : "EXTD");
            if (newType === "STD" || newType === "EXTD") {
                shape.isStd = (newType === "STD");
            } else {
                alert("Invalid type. It should be either STD or EXTD.");
                return;
            }

            let pinDataStr = prompt("Enter pin data (format: 'pin:startBit-endBit', separate multiple pins with comma):", 
                Object.entries(shape.pinData).map(([pin, data]) => `${pin}:${data.startBit}-${data.endBit}`).join(','));
            
            if (pinDataStr !== null) {
                let pinDataArr = pinDataStr.split(',');
                shape.pinData = {};
                pinDataArr.forEach(pinData => {
                    let [pin, bits] = pinData.split(':');
                    let [startBit, endBit] = bits.split('-').map(Number);
                    if (!isNaN(startBit) && !isNaN(endBit) && startBit >= 0 && endBit >= startBit) {
                        shape.pinData[pin] = { startBit, endBit };
                    } else {
                        alert(`Invalid data for pin ${pin}. Skipping this pin.`);
                    }
                });
            }
        }
        else if (shape.type === 'parallelogram') {
            alert("Output pin manipulations use the following rules:\n" +
                  "- Input pins are numbered i1, i2, i3, ...\n" +
                  "- To combine two bytes: i1+i2\n" +
                  "- To crop data: i5[3:11] (from bit 3 to bit 11 (inclusive) of the data from input pin 5)\n" +
                  "- To combine multiple operations: i1+i2[0:7]+i3[4:11]");

            for (let i = 1; i <= shape.outputCount; i++) {
                let outputData = prompt(`Enter data manipulation for Output ${i}:`, shape.outputData[i]);
                if (outputData !== null) {
                    // Simple validation
                    if (/^(i\d+(\[\d+:\d+\])?(\+i\d+(\[\d+:\d+\])?)*)+$/.test(outputData)) {
                        shape.outputData[i] = outputData;
                    } else {
                        alert(`Invalid format for Output ${i}. Please use the specified format.`);
                    }
                }
            }
        }

        // Data type selection for each output pin
        for (let i = 0; i < shape.outputCount; i++) {
            let dataType = prompt(`Enter data type for Output ${i + 1} (e.g. uint32_t):`, shape.outputDataTypes[i]);
            if (dataType && cppDataTypes.includes(dataType)) {
                shape.outputDataTypes[i] = dataType;
            } else {
                alert(`Invalid data type. Using default: ${shape.outputDataTypes[i]}`);
            }
        }

        updateCanvas();
    }

    $('#btnRect').click(function () {
        var outputCount = parseInt($('#outputCount').val());
        var shapeName = $('#shapeName').val();
        var rectWidth = 100;
        var rectHeight = 50;
        var rectX = canvas.width / 2 - rectWidth / 2;
        var rectY = canvas.height / 2 - rectHeight / 2;

        var rectangle = new Shape('rectangle', rectX, rectY, rectWidth, rectHeight, 0, outputCount, shapeName);
        rectangle.createPins();
        shapes.push(rectangle);
        updateCanvas();
    });

    $('#btnEllipse').click(function () {
        var outputCount = parseInt($('#outputCount').val());
        if (outputCount < 0 || outputCount > 1) {
            alert("Ellipse output count must be 0 or 1.");
            return;
        }
        var shapeName = $('#shapeName').val();
        var ellipseWidth = 100;
        var ellipseHeight = 50;
        var ellipseX = canvas.width / 2 - ellipseWidth / 2;
        var ellipseY = canvas.height / 2 - ellipseHeight / 2;

        var ellipse = new Shape('ellipse', ellipseX, ellipseY, ellipseWidth, ellipseHeight, 1, outputCount, shapeName);
        ellipse.createPins();
        shapes.push(ellipse);
        updateCanvas();
    });

    $('#btnParallelogram').click(function () {
        var inputCount = parseInt($('#inputCount').val());
        var outputCount = parseInt($('#outputCount').val());
        var shapeName = $('#shapeName').val();
        var paraWidth = 100;
        var paraHeight = 50;
        var paraX = canvas.width / 2 - paraWidth / 2;
        var paraY = canvas.height / 2 - paraHeight / 2;

        var parallelogram = new Shape('parallelogram', paraX, paraY, paraWidth, paraHeight, inputCount, outputCount, shapeName);
        parallelogram.createPins();
        shapes.push(parallelogram);
        updateCanvas();
    });

    function updateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(function (shape) {
            shape.draw();
            shape.connections.forEach(function (connection) {
                ctx.beginPath();
                ctx.moveTo(connection.startPin.x, connection.startPin.y);
                ctx.lineTo(connection.endPin.x, connection.endPin.y);
                ctx.stroke();
            });
        });

        if (connectingLine) {
            ctx.beginPath();
            ctx.moveTo(connectingLine.startX, connectingLine.startY);
            ctx.lineTo(connectingLine.endX, connectingLine.endY);
            ctx.stroke();
        }

        if (hoverPin && connectingLine) {
            ctx.beginPath();
            ctx.arc(hoverPin.x, hoverPin.y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = 'green';
            ctx.stroke();
        }
    }

    function saveSchemaAsXML() {
        let xmlDoc = document.implementation.createDocument(null, "schema");
        let schemaElement = xmlDoc.documentElement;

        shapes.forEach((shape, index) => {
            let shapeElement = xmlDoc.createElement("shape");
            shapeElement.setAttribute("type", shape.type);
            shapeElement.setAttribute("x", shape.x);
            shapeElement.setAttribute("y", shape.y);
            shapeElement.setAttribute("width", shape.width);
            shapeElement.setAttribute("height", shape.height);
            shapeElement.setAttribute("inputCount", shape.inputCount);
            shapeElement.setAttribute("outputCount", shape.outputCount);
            shapeElement.setAttribute("name", shape.name);

            if (shape.type === "rectangle") {
                shapeElement.setAttribute("id", shape.id);
                shapeElement.setAttribute("isStd", shape.isStd);
                let pinDataElement = xmlDoc.createElement("pinData");
                for (let [pin, data] of Object.entries(shape.pinData)) {
                    let pinElement = xmlDoc.createElement("pin");
                    pinElement.setAttribute("number", pin);
                    pinElement.setAttribute("startBit", data.startBit);
                    pinElement.setAttribute("endBit", data.endBit);
                    pinDataElement.appendChild(pinElement);
                }
                shapeElement.appendChild(pinDataElement);
            } else if (shape.type === "parallelogram") {
                let outputDataElement = xmlDoc.createElement("outputData");
                for (let [pin, data] of Object.entries(shape.outputData)) {
                    let pinElement = xmlDoc.createElement("pin");
                    pinElement.setAttribute("number", pin);
                    pinElement.textContent = data;
                    outputDataElement.appendChild(pinElement);
                }
                shapeElement.appendChild(outputDataElement);
            }

            let outputDataTypesElement = xmlDoc.createElement("outputDataTypes");
            shape.outputDataTypes.forEach((type, index) => {
                let typeElement = xmlDoc.createElement("type");
                typeElement.setAttribute("pin", index + 1);
                typeElement.textContent = type;
                outputDataTypesElement.appendChild(typeElement);
            });
            shapeElement.appendChild(outputDataTypesElement);

            let connectionsElement = xmlDoc.createElement("connections");
            shape.connections.forEach((connection, connIndex) => {
                let connectionElement = xmlDoc.createElement("connection");

                // Start pin shape index and pin index
                let startShapeIndex = shapes.findIndex(s => s.outputPins.includes(connection.startPin));
                let startPinIndex = shapes[startShapeIndex].outputPins.indexOf(connection.startPin);

                // End pin shape index and pin index
                let endShapeIndex = shapes.findIndex(s => s.inputPins.includes(connection.endPin));
                let endPinIndex = shapes[endShapeIndex].inputPins.indexOf(connection.endPin);

                connectionElement.setAttribute("startPin", `${startShapeIndex},${startPinIndex}`);
                connectionElement.setAttribute("endPin", `${endShapeIndex},${endPinIndex}`);
                connectionsElement.appendChild(connectionElement);
            });
            shapeElement.appendChild(connectionsElement);

            schemaElement.appendChild(shapeElement);
        });

        let serializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(xmlDoc);

        let blob = new Blob([xmlString], {type: "text/xml;charset=utf-8"});
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "schema.xml";
        link.click();
    }

    function loadSchemaFromXML(xmlString) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xmlString, "text/xml");

        shapes = []; // Clear existing shapes

        let shapeElements = xmlDoc.getElementsByTagName("shape");
        for (let shapeElement of shapeElements) {
            let type = shapeElement.getAttribute("type");
            let x = parseFloat(shapeElement.getAttribute("x"));
            let y = parseFloat(shapeElement.getAttribute("y"));
            let width = parseFloat(shapeElement.getAttribute("width"));
            let height = parseFloat(shapeElement.getAttribute("height"));
            let inputCount = parseInt(shapeElement.getAttribute("inputCount"));
            let outputCount = parseInt(shapeElement.getAttribute("outputCount"));
            let name = shapeElement.getAttribute("name");

            let shape = new Shape(type, x, y, width, height, inputCount, outputCount, name);

            if (type === "rectangle") {
                shape.id = shapeElement.getAttribute("id");
                shape.isStd = shapeElement.getAttribute("isStd") === "true";
                let pinDataElement = shapeElement.getElementsByTagName("pinData")[0];
                let pinElements = pinDataElement.getElementsByTagName("pin");
                for (let pinElement of pinElements) {
                    let pinNumber = pinElement.getAttribute("number");
                    let startBit = parseInt(pinElement.getAttribute("startBit"));
                    let endBit = parseInt(pinElement.getAttribute("endBit"));
                    shape.pinData[pinNumber] = { startBit, endBit };
                }
            } else if (type === "parallelogram") {
                let outputDataElement = shapeElement.getElementsByTagName("outputData")[0];
                let pinElements = outputDataElement.getElementsByTagName("pin");
                for (let pinElement of pinElements) {
                    let pinNumber = pinElement.getAttribute("number");
                    shape.outputData[pinNumber] = pinElement.textContent;
                }
            }

            let outputDataTypesElement = shapeElement.getElementsByTagName("outputDataTypes")[0];

            if (outputDataTypesElement) {
                let typeElements = outputDataTypesElement.getElementsByTagName("type");
                for (let typeElement of typeElements) {
                    let pinNumber = parseInt(typeElement.getAttribute("pin")) - 1;
                    shape.outputDataTypes[pinNumber] = typeElement.textContent;
                }
            }

            shape.createPins();
            shapes.push(shape);
        }

        // Load connections
        for (let i = 0; i < shapeElements.length; i++) {
            let connectionsElement = shapeElements[i].getElementsByTagName("connections")[0];
            let connectionElements = connectionsElement.getElementsByTagName("connection");
            for (let connectionElement of connectionElements) {
                let [startShapeIndex, startPinIndex] = connectionElement.getAttribute("startPin").split(",").map(Number);
                let [endShapeIndex, endPinIndex] = connectionElement.getAttribute("endPin").split(",").map(Number);

                let startPin = shapes[startShapeIndex].outputPins[startPinIndex];
                let endPin = shapes[endShapeIndex].inputPins[endPinIndex];

                shapes[i].connections.push({ startPin, endPin });
                startPin.connectedPin = endPin;
            }
        }

        updateCanvas();
    }

    $('#btnSave').click(function() {
        saveSchemaAsXML();
    });

    $('#btnLoad').click(function() {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        input.onchange = e => {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function(e) {
                loadSchemaFromXML(e.target.result);
            }
            reader.readAsText(file);
        }
        input.click();
    });

    updateCanvas();
    $('#btnLoadExample1').click(function () {
        fetch('schema_1.xml')
            .then(response => response.text())
            .then(data => loadSchemaFromXML(data))
            .catch(error => alert('schema_1.xml dosyası yüklenemedi: ' + error));
    });

    $('#btnLoadExample2').click(function () {
        fetch('schema_2.xml')
            .then(response => response.text())
            .then(data => loadSchemaFromXML(data))
            .catch(error => alert('schema_2.xml dosyası yüklenemedi: ' + error));
    });

});