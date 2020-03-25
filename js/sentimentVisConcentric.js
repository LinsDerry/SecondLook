// SVG drawing area
var marginConcentric = marginPack;
var widthConcentric = 960 - marginConcentric.left - marginConcentric.right;
var heightConcentric = 300 - marginConcentric.top - marginConcentric.bottom;
var svgConcentric = d3.select("#sentimentVisConcentric").append("svg")
    .attr("width", widthConcentric + marginConcentric.left + marginConcentric.right)
    .attr("height", heightConcentric + marginConcentric.top + marginConcentric.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginConcentric.left * 2 + "," + marginConcentric.top + ")");

//Scale
var xScaleCon = d3.scalePoint()
    .range([0, widthConcentric - marginConcentric.left])
    .align([0.5]);

//Axis
var xAxisCon = d3.axisBottom()
    .scale(xScaleCon);

//Append g elements for x axis
svgConcentric.append("g")
    .attr("class", "x-axis axes")
    .attr("transform", "translate(0," + (heightConcentric - marginConcentric.bottom) + ")");

//Initialize tool-tip for interaction with circles
var tipC = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0]);

//Call tool-tip
svgConcentric.call(tipC);

function sentimentVisConcentric(data) {
    console.log("vis deux");
    var width = widthConcentric;
    var height = heightConcentric;

    xScaleCon.domain(sentiments);

    var updateCir = svgConcentric.selectAll("circle").data(data);
    var enterCir = updateCir.enter()
        .append("circle")
        .attr("class", "cir")
        .on("mouseover", tipC.show)
        .on("mouseout", tipC.hide);
    enterCir.merge(updateCir)
        .transition()
        .duration(dur)
        .attr("cx",function(d, i) {
            return xScaleCon(d.emotion.Value);
        })
        .attr("cy",height / 3)
        .attr("r",function(d) {
            return (d.emotion.Confidence * .75);
        })
        .style("fill", function (d) {
            return sentColKey[d.emotion.Value];
        })
        .style("stroke", "black")
        .style("opacity", 0.25);
    updateCir.exit().remove();

    //Call axis generator
    // svgConcentric.select(".x-axis")
    //     .transition()
    //     .duration(dur)
    //     .call(xAxisCon)
    //     .selectAll("text")
    //     .style("text-anchor", "start")
    //     .attr("x", "10")
    //     .attr("y", "-5")
    //     .attr("transform", function(d) {
    //         return "rotate(90)"
    //     });

    // Update tool-tip display information
    tipC.html(function(d) {
        if (sentimentsMap[d.emotion.Value] === 1) {
            return "<span class = tip> Of the " + data.length + " selected paintings, " + sentimentsMap[d.emotion.Value] +
                " is predominantly seen as <span style='color:red'><strong>" + d.emotion.Value + "</strong></span> by AI." + "</span>";
        }
        if (sentimentsMap[d.emotion.Value] > 1) {
            return "<span class = tip> Of the " + data.length + " selected paintings, " + sentimentsMap[d.emotion.Value] +
                " are predominantly seen as <span style='color:red'><strong>" + d.emotion.Value + "</strong></span> by AI." + "</span>";
        }
    });
}