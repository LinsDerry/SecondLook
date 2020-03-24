// SVG drawing area
var marginWheel = {top: 10, right: 10, bottom: 10, left: 10};
var widthWheel = 175 - marginWheel.left - marginWheel.right;
var heightWheel = 175 - marginWheel.top - marginWheel.bottom;
var svgWheel = d3.select("#colorVisWheel").append("svg")
    .attr("width", widthWheel + marginWheel.left + marginWheel.right)
    .attr("height", heightWheel + marginWheel.top + marginWheel.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginWheel.left + "," + marginWheel.top + ")");

function colorVisWheel(orderedColors, data) {
    console.log("vis trois");

    var width = widthWheel;
    var height = heightWheel;

    var pie = d3.pie()
        .value(function (d) {
            return d.frequency;
        });

    // d3.arc path drawing function
    var outRadius = width / 2;
    var inRadius = width / 2 * 0.75;
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
        .attr("d", arc);
}
