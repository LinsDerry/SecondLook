// SVG drawing area
var marginBlock = marginPack;
var widthBlock = 1000;
var heightBlock = 200 - marginBlock.top - marginBlock.bottom;
var svgBlock = d3.select("#colorVisBlock").append("svg")
    .attr("width", widthBlock + marginBlock.left + marginBlock.right)
    .attr("height", heightBlock + marginBlock.top + marginBlock.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginBlock.left + "," + marginBlock.top + ")");

/* ? Can't pass data from arguments directly bcs it doesn't update inside enterRec with each
new call of colorVisBlock. For instance, if female is passed as data next time, it still passes
the original data value which was artObjects. Made data_ as a workaround. ? */
var data_ =[];

function colorVisBlock(colors, orderedColors, data) {

    data_ = data;

    var width = widthBlock;
    var height = heightBlock;

    var xTracker = 0;

    var updateRect = svgBlock.selectAll("rect")
        .data(orderedColors, function(d) {
            return d.color;
        });
    var enterRect = updateRect.enter()
        .append("rect")
        .attr("class", "rec")
        .on("click", function(d) {
            colorMosaic(d, data_);
        });

    enterRect.merge(updateRect)
        .transition()
        .duration(dur)
        .attr("x", function (d) {
            var w = width / colors.length * d.frequency;
            xTracker += w;
            return xTracker - w;
        })
        .attr("y",0)
        .attr("width", function (d) {
            return width / colors.length * d.frequency;
        })
        .attr("height", height)
        .style("fill", function (d) {
            return d.color;
        })
        .style("stroke", function (d) {
            if (d.color === "White" || d.color === "#FFFFFF") {
                return "#343a40"
            }
        })
        .style("stroke-width", function (d) {
            if (d.color === "White" || d.color === "#FFFFFF") {
                return "0.25"
            }
        });
    updateRect.exit().remove();

}