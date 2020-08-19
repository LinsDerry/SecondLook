// SVG drawing area
var marginWheel = {top: 5, right: 5, bottom: 5, left: 5};
var widthWheel = 350 - marginWheel.left - marginWheel.right;
var heightWheel = 400 - marginWheel.top - marginWheel.bottom;

// var svgWheel = d3.select("#colorVisWheel").append("svg")
//     .attr("viewBox", "0 0 " + (widthWheel + marginWheel.left + marginWheel.right) + " " +
//         (heightWheel + marginWheel.top + marginWheel.bottom) + "")
//     .append("g")
//     .attr("class", "chart")
//     .attr("transform", "translate(" + marginWheel.left / 4 + ", 0)");

var svgWheel = d3.select("#colorVisWheel").append("svg")
    .attr("width", widthWheel + marginWheel.left + marginWheel.right)
    .attr("height", heightWheel + marginWheel.top + marginWheel.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginWheel.left / 4 + ", 0)");

function colorVisWheel(orderedColors, data) {

    var width = widthWheel;
    var height = heightWheel;

    var pie = d3.pie()
        .value(function (d) {
            return d.frequency;
        });

    // d3.arc path drawing function
    var outRadius = width / 2;
    var inRadius = width / 2 * 0.8;
    var arc = d3.arc()
        .innerRadius(inRadius)
        .outerRadius(outRadius);

    svgWheel.selectAll("g.arc").remove();

    var arcs = svgWheel.selectAll("g.arc")
        .data(pie(orderedColors))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    arcs.append("path")
        .attr("fill", function (d) {
            return d.data.color;
        })
        .style("stroke", function (d) {
            if (d.data.color === "White" || d.data.color === "#FFFFFF") {
             return "#343a40"
            }
        })
        .style("stroke-width", function (d) {
            if (d.data.color === "White" || d.data.color === "#FFFFFF") {
                return "0.25"
            }
        })
        .attr("d", arc);

    // Circumscribed circle in donut hole that's filled with a pattern-image in colorMosaic.js
    svgWheel.selectAll("circle").remove();

    svgWheel.append("circle")
        .attr("class", "cir")
        .attr("id", "wheel-img")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", inRadius);
}
