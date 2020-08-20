// SVG drawing area
var marginMosaic = marginPack;
var widthMosaic = 700 - marginMosaic.left - marginMosaic.right;
var heightMosaic = 550 - marginMosaic.top - marginMosaic.bottom;

var svgMosaic = d3.select("#colorVisMosaic").append("svg")
    .attr("width", widthMosaic + marginMosaic.left + marginMosaic.right)
    .attr("height", heightMosaic + marginMosaic.top + marginMosaic.bottom)
    .call(responsivefy) //Function defined at bottom of file
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginMosaic.left + "," + marginMosaic.top + ")");

// Scales
var xScaleMos = d3.scaleBand()
    .range([0, widthMosaic])
    .paddingInner(0);

var yScaleMos = d3.scaleBand()
    .range([0, heightMosaic])
    .paddingInner(0);

var hue = false;

function colorMosaic(color, data) {

    hue = isHue(color);

    data = setupData(color, data); // setupData also updates xScaleMos and yScaleMos domains

    document.getElementById("colorVisMosaic").style.backgroundColor = color.color;

    createMosaicDefs(data);
    createWheelDefs(data);

    // Create default look of color wheel
    var currColors = data[0].colors;
    var newColors = makeNewColors(currColors, color);
    colorVisWheel(newColors, data[0]);

    svgWheel.select("circle")
        .style("fill", "url(#img_cir_" + 0 + ")");

    document.getElementById("title-2").innerHTML =
        "<em>" + data[0].title + "</em>";
    document.getElementById("artist-2").innerHTML =
        "<strong>Artist: </strong>" + data[0].artist;
    document.getElementById("century-2").innerHTML =
        "<strong>Century: </strong>" + data[0].century;
    document.getElementById("emotion-2").innerHTML =
        "<strong>Dominant sentiment: </strong>" + data[0].emotion.Value.toLowerCase()
        + " (" + Math.floor(data[0].emotion.Confidence) + "% confidence)";
    document.getElementById("gender-2").innerHTML =
        "<strong>Gender: </strong>" + data[0].gender.Value.toLowerCase()
        + " (" + Math.floor(data[0].gender.Confidence) + "% confidence)";


    var updateRect = svgMosaic.selectAll("rect").data(data);

    var enterRect = updateRect.enter()
        .append("rect")
        .attr("class", "rec")
        .on("mouseover", function(d, i) {
            var currColors = d.colors;
            var newColors = makeNewColors(currColors, color);
            colorVisWheel(newColors, d);

            var index = i;
            svgWheel.select("circle")
                .style("fill", function () {
                    return "url(#img_cir_" + index + ")";
                });

            document.getElementById("title-2").innerHTML =
                "<em>" + d.title + "</em>";
            document.getElementById("artist-2").innerHTML =
                "<strong>Artist: </strong>" + d.artist;
            document.getElementById("century-2").innerHTML =
                "<strong>Century: </strong>" + d.century;
            document.getElementById("emotion-2").innerHTML =
                "<strong>Dominant sentiment: </strong>" + d.emotion.Value.toLowerCase()
                + " (" + Math.floor(d.emotion.Confidence) + "% confidence)";
            document.getElementById("gender-2").innerHTML =
                "<strong>Gender: </strong>" + d.gender.Value.toLowerCase()
                + " (" + Math.floor(d.gender.Confidence) + "% confidence)";
        });

    enterRect.merge(updateRect)
        .attr("x", function (d) {
            return xScaleMos(d.col);
        })
        .attr("y",function (d) {
            return yScaleMos(d.row);
        })
        .attr("width", function (d) {
            return xScaleMos.bandwidth(d.col);
        })
        .attr("height", function (d) {
            return yScaleMos.bandwidth(d.row);
        })
        .style("fill", function (d, i) {
            return "url(#img_" + i + ")";
        });

    updateRect.exit().remove();

}

/* Returns a filtered and sorted array of art objects whose most prominent hue/hex is color and
 the art objects with the highest percentage of color come first; adds new fields and
 values for row and column placement as well as updates xScaleMos and yScaleMos domains for
 constructing the mosaic via helper function, setupMosaic.
 */
function setupData (color, data) {

    // Filter data to include only art objects whose most prominent hue/hex is color
    if (hue) {
        data = data.filter(function (d) {
            return d.colors[0].hue === color.color;
        });
    }

    if (!hue) {
        data = data.filter(function (d) {
            return d.colors[0].color === color.color;
        });
    }

    // Sort data so that art objects with the highest percentage of color are first
    data.sort(function (a, b) {
        return b.colors[0].percent - a.colors[0].percent;
    });

    return setupMosaic(data);
}

/* updateHTML updates labels and div color for mosaic viz. */
function updateHTML(color, data) {

    document.getElementById("colorVisMosaic").style.backgroundColor = color.color;

    var type;
    if (isHue(color)) { type = "hue"; }
    else { type = "color"; }

    var element = document.getElementById("mosaic-message-1");

    if (data.length === 0) {
        element.style.backgroundColor = "#F8F8F8";
        element.style.border = 0;
        element.style.borderRadius = 8;
        element.innerHTML = "<strong> There are no paintings in this selection whose most prominent "
            + type + " matches your choice. Try another " + type + "! </strong>";
    }
    else {
        element.innerHTML = "";
        element.style.backgroundColor = color.color;
        element.style.border = "none";
    }
}

/* setupMosaic assigns row and col values to each art object and updates the x and y scales according to
 the mosaic dimensions. */
function setupMosaic(data) {
    var xDomain = [];
    var yDomain = [];

    // Make one row if data.length is less than 4, the minimum to make a grid.
    if (data.length > 0 && data.length < 4) {
        var index = 0;
        data.forEach(function (d) {
            d.row = 0;
            d.col = index;
            xDomain.push(index);
            index++;
        });
        yDomain.push(0);
    }
    else {
        var rows = Math.floor(Math.sqrt(data.length));
        var cols = rows;

        var diff = data.length - rows * cols;
        if (diff !== 0) {
            for (var k = 0; k < diff; k++) {
                data.pop();
            }
        }

        var objIndex = 0;
        for (var i = 0; i < rows; i++) {
            for (var j =  0; j < cols; j++) {
                data[objIndex].row = i;
                data[objIndex].col = j;
                objIndex++;
            }
            xDomain.push(i);
            yDomain.push(i);
        }
    }
    xScaleMos.domain(xDomain);
    yScaleMos.domain(yDomain);

    return data;
}

/* Returns a boolean for whether or not the color is a hue value */
function isHue(color) {
    return color.color[0] !== '#';
}

/* createMosaicDefs and createWheelDefs creates two sets of pattern-images using the primaryimageurl's in data.
* the Mosaic defs are sized to fill the mosaic rectangles and the wheel defs, to fill the color wheel or donut chart. */
function createMosaicDefs(data) {
    svgMosaic.selectAll("defs").remove();

    var defs = svgMosaic.append("defs");

    var patterns = defs.selectAll("pattern")
        .data(data)
        .enter()
        .append("pattern")
        .attr("id", function (d, i) {
            return "img_" + i;
        })
        .attr("width", function (d) {
            return xScaleMos.bandwidth(d.col);
        })
        .attr("height", function (d) {
            return yScaleMos.bandwidth(d.row);
        })
        .attr("patternUnits", "userSpaceOnUse");

    var images = patterns.append("svg:image")
        .attr("xlink:href", function (d) {
            return d.primaryimageurl;
        })
        .attr("x", 0)
        .attr("y",0)
        .attr("width", function (d) {
            return xScaleMos.bandwidth(d.col) * 0.8;
        })
        .attr("height", function (d) {
            return yScaleMos.bandwidth(d.row) *0.8;
        });
}

function createWheelDefs(data) {

    svgWheel.selectAll("defs").remove();

    var defs = svgWheel.append("defs");

    var patterns = defs.selectAll("pattern")
        .data(data)
        .enter()
        .append("pattern")
        .attr("id", function (d, i) {
            return "img_cir_" + i;
        })
        .attr("width", function (d) {
            return widthWheel;
        })
        .attr("height", function (d) {
            return heightWheel;
        })
        .attr("patternUnits", "userSpaceOnUse");

    var images = patterns.append("svg:image")
        .attr("xlink:href", function (d) {
            return d.primaryimageurl;
        })
        .attr("x", 0)
        .attr("y",0)
        .attr("width", function (d) {
            return widthWheel;
        })
        .attr("height", function (d) {
            return heightWheel;
        });
}

/* makeNewColors prepares an array of objects formatted for passing to colorVisWheel. */
function makeNewColors(currColors) {
    var newColors = [];

    for (var i = 0; i < currColors.length; i++) {
        var obj = {};
        if (hue) {
            if (newColors.length > 0) {
                var found = false;
                newColors.forEach(function (d) {
                    if (d.color === currColors[i].hue) {
                        d.frequency += currColors[i].percent;
                        found = true;
                    }
                });
                if (!found) {
                    obj.color = currColors[i].hue;
                    obj.frequency = currColors[i].percent;
                    newColors.push(obj);
                }
            }
            else {
                obj.color = currColors[i].hue;
                obj.frequency = currColors[i].percent;
                newColors.push(obj);
            }
        }
        if (!hue) {
            obj.color = currColors[i].color;
            obj.frequency = currColors[i].percent;
            newColors.push(obj);
        }
    }
    return newColors;
}

/* The simple viewBox code used to scale all other visualizations was glitchy with colorMosaic viz.
* This responsivefy function was copied directly from Ben Clinkinbeard at
* https://codepen.io/bclinkinbeard/pen/gGPvrz?editors=0010 */
function responsivefy(svg) {
    // container will be the DOM element the svg is appended to
    // we then measure the container and find its aspect ratio
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10),
        aspect = width / height;

    // add viewBox attribute and set its value to the initial size
    // add preserveAspectRatio attribute to specify how to scale
    // and call resize so that svg resizes on inital page load
    svg.attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMinYMid')
        .call(resize);

    // add a listener so the chart will be resized when the window resizes
    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on('resize.' + container.attr('id'), resize);

    // this is the code that actually resizes the chart
    // and will be called on load and in response to window resize
    // gets the width of the container and proportionally resizes the svg to fit
    function resize() {
        const targetWidth = parseInt(container.style('width'));
        svg.attr('width', targetWidth);
        svg.attr('height', Math.round(targetWidth / aspect));
    }
}