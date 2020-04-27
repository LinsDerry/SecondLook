// SVG drawing area
var marginLegend = {top: 50, right: 0, bottom: 50, left: 70};
var widthLegend = 150 - marginLegend.left - marginLegend.right;
var heightLegend = heightConcentric;
var svgLegend = d3.selectAll(".sentColLegend").append("svg")        //TO-DO selectAll
    .attr("width", (widthLegend + marginLegend.left + marginLegend.right))
    .attr("height", heightLegend + marginLegend.top + marginLegend.bottom)
    .append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(" + marginLegend.left + "," + marginLegend.top + ")");

// Create y-scale and y-axis
var yScaleLeg = d3.scalePoint()
    .range([0, heightLegend]);
var yAxisLeg = d3.axisLeft()
    .scale(yScaleLeg);

// Append g element for y-axis
svgLegend.append("g")
    .attr("class", "y-axis axes");

function sentColLegend() {
    yScaleLeg.domain(sentiments);

    var updateCir = svgLegend.selectAll("circle").data(sentiments);
    var enterCir = updateCir.enter()
        .append("circle")
        .attr("class", "cir");

    enterCir.merge(updateCir)
        .transition()
        .duration(dur)
        .attr("cx", marginLegend.left / 4)
        .attr("cy", function (d) {
            return yScaleLeg(d);
        })
        .attr("r", 10)
        .style("fill", function (d) {
            return sentColKey[d];
        })
        .style("stroke", "black")
        .style("stroke-width", "0.25");
    updateCir.exit().remove();

    //Call axis generator
    svgLegend.select(".y-axis")
        .transition()
        .duration(dur)
        .call(yAxisLeg);
}