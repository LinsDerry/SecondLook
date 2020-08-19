// SVG drawing area
var marginConcentric = marginPack;
var widthConcentric = 1100 - marginConcentric.left - marginConcentric.right;
var heightConcentric = 500 - marginConcentric.top - marginConcentric.bottom;
var svgConcentric = d3.select("#sentimentVisConcentric").append("svg")
    .attr("width", widthConcentric + marginConcentric.left + marginConcentric.right)
    .attr("height", heightConcentric + marginConcentric.top + marginConcentric.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginConcentric.left * 2 + "," + marginConcentric.top + ")");

//Scales
var xScaleCon = d3.scalePoint()
    .range([0, widthConcentric - 2.5 * (marginConcentric.left + marginConcentric.right)])
    .align([0.5]);
var yScaleCon = d3.scalePoint()
    .range([(marginConcentric.top + marginConcentric.bottom), heightConcentric / 2])
    .align([0.5]);

//Axes
var xAxisCon = d3.axisBottom()
    .scale(xScaleCon);
var yAxisCon = d3.axisRight()
    .scale(yScaleCon);

//Append g elements for x axis
var gx = svgConcentric.append("g")
    .attr("class", "x-axis axes")
    .attr("transform", "translate(0," + (heightConcentric - 2 * (marginConcentric.bottom + marginConcentric.top)) + ")");

gx.append("text")
    .attr("class", "axes-label")
    .style("text-anchor", "start")
    .attr("transform", "translate(0, -15)")
    .text("Least average confidence");
gx.append("text")
    .attr("class", "axes-label")
    .style("text-anchor", "end")
    .attr("transform", "translate(" + (widthConcentric - 2.5 * (marginConcentric.left + marginConcentric.right)) + ", -15)")
    .text("Greatest average confidence");
gx.append("text")
    .attr("class", "axes-label note")
    .style("text-anchor", "start")
    .attr("transform", "translate(0, 100)")
    .text("Each circle represents a painting; circle sizes are relative to AI's confidence that the painting portrays the given sentiment.");

var gy = svgConcentric.append("g")
    .attr("class", "y-axis axes")
    .attr("transform", "translate(" + (widthConcentric - (marginConcentric.left + marginConcentric.right)) + ", 0)");

//Initialize tool-tip for interaction with circles
var tipC = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, 0]);

//Call tool-tip
svgConcentric.call(tipC);

function sentimentVisConcentric(data) {

    var width = widthConcentric;
    var height = heightConcentric;

    var sentimentsReordered = orderConf();
    xScaleCon.domain(sentimentsReordered);

    var yDomain = getYDomain();
    yScaleCon.domain(yDomain);

    var updateCir = svgConcentric.selectAll("circle")
        .data(data, function(d) {
            return d.imageid;
        });
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
        .attr("cy",function (d) {
            return yScaleCon(d.gender.Value);
        })
        .attr("r",function(d) {
            if (sentiments.length === 1) { // Enlarge if user selects single emotion
                return d.emotion.Confidence * .75;
            }
            else {
                return d.emotion.Confidence * .6;
            }
        })
        .style("fill", function (d) {
            return sentColKey[d.emotion.Value];
        })
        .style("stroke", "black")
        .style("opacity", function (d) {
            if (d.emotion.Value === "FEAR") {
                return 0.7;
            }
            else {
                return 0.25;
            }
        });
    updateCir.exit().remove();

    //Call axes generators
    svgConcentric.select(".x-axis")
        .transition()
        .duration(dur)
        .call(xAxisCon);
    svgConcentric.select(".y-axis")
        .transition()
        .duration(dur)
        .call(yAxisCon);

    // Update tool-tip display information
    tipC.html(function(d) {
        var percent;

        // "Gender: Female" user selection
        if (d.gender.Value === "Female") {
            percent = (femaleSentMap[d.emotion.Value] / female.length * 100).toFixed(1);
            return "<span class = tip>" + percent + "% of FEMALE paintings are seen as "
                + d.emotion.Value + "</span> with the average confidence rating of " + average(d.emotion.Value, "Female") + "%</span>";
        }
        // "Gender: Male" user selection
        if (d.gender.Value === "Male") {
            percent = (maleSentMap[d.emotion.Value] / male.length * 100).toFixed(1);
            return "<span class = tip>" + percent + "% of MALE paintings are seen as "
                + d.emotion.Value + "</span> with the average confidence rating of " + average(d.emotion.Value, "Male") +
                "%</span>";
        }
    });

    /* Assess whether data is female or male when only a single emotion is selected */
    function isFem() {
        for (var i = 0; i < data.length; i++) {
            if (data[i].gender.Value === "Male") {
                return false;
            }
        }
        return true;
    }
    function isMal() {
        for (var i = 0; i < data.length; i++) {
            if (data[i].gender.Value === "Female") {
                return false;
            }
        }
        return true;
    }

    /* Find average confidence for emotion or emo */
    function average (emo, choice) {
        var objects = [];
        if (choice === "All") {
            objects = data;
        }
        else if (choice === "Female") {
            objects = female;
        }
        else {
            objects = male;
        }

        var sum = 0;
        var count = 0;
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].emotion.Value === emo) {
                sum += objects[i].emotion.Confidence;
                count ++;
            }
        }
        return (sum / count).toFixed(1);
    }

    /* Reorder sentiments array from least to greatest confidence */
    function orderConf () {
        var sentimentsReordered = [];
        var keys = [];
        var map = [];

        // Instantiate a map with the sentiments as the keys and the average confidences as values
        for (var i = 0; i < sentiments.length; i++) {
            var avg = average(sentiments[i]);
            keys.push(avg);
            map[avg] = sentiments[i];
        }
        keys.sort(function (a, b) {
            return a - b;
        });
        keys.forEach(function (d) {
            sentimentsReordered.push(map[d]);
        });
        return sentimentsReordered;
    }

    function getYDomain () {
        // "Gender: All" user selection
        if (data.length !== female.length && data.length !== male.length
            && !isFem() && !isMal()) {
            return ["Female", "Male"];
        }
        // "Gender: Female" user selection
        if (data.length === female.length || isFem()) {
            return ["Female"];
        }
        // "Gender: Male" user selection
        if (data.length === male.length || isMal()) {
            return ["Male"];
        }
    }
}