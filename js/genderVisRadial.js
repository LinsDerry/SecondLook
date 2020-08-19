// SVG drawing areas
var marginRadial = {top: 65, right: 55, bottom: 45, left: 55};
var widthRadial = 800 - marginRadial.left - marginRadial.right;
var heightRadial = 700 - marginRadial.top - marginRadial.bottom;

var svgRadial = d3.select("#genderVisRadial").append("svg")
    .attr("viewBox", "0 0 " + (widthRadial + marginRadial.left + marginRadial.right) + " " +
        (heightRadial + marginRadial.top + marginRadial.bottom) + "")
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginRadial.left + "," + (marginRadial.top * 1.3) + ")");

// var svgRadial = d3.select("#genderVisRadial").append("svg")
//     .attr("width", widthRadial + marginRadial.left + marginRadial.right)
//     .attr("height", heightRadial + marginRadial.top + marginRadial.bottom)
//     .append("g")
//     .attr("class", "chart")
//     .attr("transform", "translate(" + marginRadial.left + "," + (marginRadial.top * 1.3) + ")");

// Color scale
var gradientCol = d3.scaleLinear()
//Using more than 2 values in domain and range to create segmentation of color gradients
    .domain([0, 50, 149, 150, 224, 249, 250, 349, 399])
    .range(["#9c9ffc", "#6f1e34", "#fbf3f5", "#fcfcfc", "#fcfcfc", "#fcfcfc", "#f6f8f9", "#223740", "#9c9ffc"]);

// lavender: "#9c9ffc"
// dark pink: "#6f1e34"
// light pink: "#fbf3f5"
// light grey: "#fcfcfc"
// light blue: "#f6f8f9"
// dark blue: "#223740"
// lavender: "#9c9ffc"

//Normalization scale
var normalize = d3.scaleLinear()
    .range([0, 1]);

//Initialize tool-tip for interaction with bars
var tipG = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, 0]);

//Call tool-tip
svgRadial.call(tipG);

function genderVisRadial(fem, mal) {

    var width = widthRadial;
    var height = heightRadial;

    // Outer doughnut
    var inRadius = width / 3.1;
    var outRadius = inRadius * 1.1;

    // Outer doughnut
    var slices = orderSlices(fem, mal);
    // Inner doughnut
    var sections = makeSections();

    normalize.domain(getDomain(slices));

    var outerPie = d3.pie()
        .value(function (d) { // Make arcs all equal
            return 1;
        });
    var innerPie = d3.pie()
        .startAngle(-45 * Math.PI / 180)
        .endAngle(-45 * Math.PI / 180 + 2 * Math.PI)
        .value(function (d) { // Make arcs all equal
            return d.value;
        })
        .sort(function (a, b) {
            return a.order - b.order;
        });

    var arc = d3.arc()
        .innerRadius(inRadius)
        .outerRadius(function (d) {
            var increase = normalize(d.data.frequency);
            return outRadius * (1 + increase);
        });

    // For label positioning
    var labelArc = d3.arc()
        .innerRadius(width / 3.7 * 1.03)
        .outerRadius(width / 3.7);

    var pieData = outerPie(slices);
    var labelData = innerPie(sections);

    svgRadial.selectAll("g.arc").remove(); //Can delete if no filters are used.

    // Draw outer doughnut
    var arcs = svgRadial.selectAll("g.arc")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    arcs.append("path")
        .attr("fill", function (d, i) {
            return gradientCol(i);
        })
        .attr("d", arc)
        .on("mouseover", tipG.show)
        .on("mouseout", tipG.hide);

    //Draw inner doughnut for labels
    var labelArcs = svgRadial.selectAll("g.labelArcs")
        .data(labelData)
        .enter()
        .append("g")
        .attr("class", "labelArcs")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    labelArcs.append("path")
        .style("fill", function (d) {
            return d.data.fill;
        })
        .attr("d", labelArc)
        .each(function (d, i) {

            // Code snippet from www.visualcinnamon.com tutorial
            var firstArcSection = /(^.+?)L/;
            var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
            newArc = newArc.replace(/,/g, " ");

            // Flip bottom label NEITHER so it is not upside-down or backwards
            if (d.data.label === "NEITHER") {
                var startLoc = /M(.*?)A/;
                var middleLoc = /A(.*?)0 0 1/;
                var endLoc = /0 0 1 (.*?)$/;
                var newStart = endLoc.exec(newArc)[1];
                var newEnd = startLoc.exec(newArc)[1];
                var middleSec = middleLoc.exec(newArc)[1];

                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }

            /* Create an invisible arc that the text can flow along
            (only the outer curve of pie slice) */
            svgRadial.append("path")
                .attr("class", "hiddenDonutArcs")
                .attr("id", "arc_" + i)
                .attr("d", newArc)
                .style("fill", "none");
        });

    // Add labels on curved textPaths
    svgRadial.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .selectAll(".radialLabel")
        .data(sections)
        .enter().append("text")
        .attr("class", "radialLabel")
        .attr("dy", function (d) {
            if (d.label === "NEITHER") {
                return 18;
            } else {
                return -6;
            }
        })
        .append("textPath")
        .attr("xlink:href", function (d, i) {
            return "#arc_" + i;
        })
        .attr("text-anchor", "middle")
        .attr("startOffset", "50%")
        .style("font-size", function (d) {
            return d.size;
        })
        .style("font-weight", function (d) {
            return d.weight;
        })
        .text(function (d) {
            return d.label;
        });

    svgRadial.append("circle")
        .attr("class", "cir")
        .attr("id", "zero-rim")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", outRadius)
        .style("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", 0.1);

    // Update tool-tip display information
    tipG.html(function (d) {
        var percent = (d.data.frequency / (fem.length + mal.length) * 100).toFixed(1);

        if (d.data.gender === "FEMALE" || d.data.gender === "MALE") {
            if (d.data.frequency !== 0) {
                return "<span class = tip>" + percent + "% of paintings are seen as " + d.data.gender + " with a " + d.data.confidence + "% confidence rating</span>";
            } else {
                return "<span class = tip>There are no paintings seen as " + d.data.gender + " with a " + d.data.confidence + "% confidence rating</span>";
            }
        }
        if (d.data.gender === "NON-BINARY") {
            return "<span class = tip>There are no paintings seen as NON-BINARY</span>";
        }
    });
}

/* orderSlices returns a new array for passing to d3.pie(). This function divides the circle into 4 sections -
* (starting at 12:00) "Both", "Female", "Neither (Non-Binary)", "Male". Each section has 100 pie slices that
* coincide with AI's 1-100 gender confidence ratings. This is for inner doughnut chart. */
function orderSlices(fem, mal) {
    var slices = [];
    var femMap = makeFrequencyMap(fem);
    var malMap = makeFrequencyMap(mal);

    // Populate slices:
    var obj = {};
    // First half of "Both" section
    for (var i = 0; i < 50; i++) {
        obj = {};
        obj.gender = "NON-BINARY";
        obj.confidence = 0;
        obj.frequency = 0;
        slices.push(obj);
    }
    // "Female" section
    // Note that female is descending and male ascending to match clockwise orientation of chart
    for (var j = 100; j >= 1; j--) {
        obj = {};
        obj.gender = "FEMALE";
        obj.confidence = j;
        obj.frequency = femMap[j];
        slices.push(obj);
    }
    // "Non-binary" section
    for (var n = 0; n < 100; n++) {
        obj = {};
        obj.gender = "NON-BINARY";
        obj.confidence = 0;
        obj.frequency = 0;
        slices.push(obj);
    }
    // "Male" section in circle
    for (var k = 1; k <= 100; k++) {
        obj = {};
        obj.gender = "MALE";
        obj.confidence = k;
        obj.frequency = malMap[k];
        slices.push(obj);
    }
    // Second half of "Both" section
    for (var m = 0; m < 50; m++) {
        obj = {};
        obj.gender = "NON-BINARY";
        obj.confidence = 0;
        obj.frequency = 0;
        slices.push(obj);
    }

    console.log(slices);
    return slices;
}

function makeFrequencyMap(data) {
    var map = [];

    /* Instantiate a map with the indices as the keys (indices represent AI's confidence on
    a scale of 1-100%) */
    for (var i = 1; i <= 100; i++) {
        map[i] = 0;
    }

    // Record the recurrence for each confidence rating in the map
    data.forEach(function (d) {
        var confidence = Math.floor(d.gender.Confidence);
        if (confidence === 0) { // For, 0 < x < 1
            confidence = 1;
        }
        map[confidence] += 1;
    });

    return map;
}

function getDomain(slices) {

    var domain = [];
    var max = d3.max(slices, function (d) {
        return d.frequency;
    });

    domain.push(0);
    domain.push(max);
    return domain;
}

/* makeSections returns a new array for passing to d3.pie(). This function divides the circle into 4 sections -
* (starting at 12:00) "Both", "Female", "Neither or Non-Binary", "Male". Each section has 3 pie slices for supporting
* the textAlign labels. This is for inner doughnut chart. */
function makeSections() {
    var sm = "10px";
    var lg = "14px";

    return [
        {
            order: 0,
            value: 3,
            label: "BOTH",
            fill: "#9c9ffc",
            size: lg
        },
        {
            order: 1,
            value: 1,
            label: "more feminine",
            fill: "#6f1e34",
            size: sm
        },
        {
            order: 2,
            value: 1,
            label: "FEMALE",
            fill: "#B58995",
            size: lg
        },
        {
            order: 3,
            value: 1,
            label: "less feminine",
            fill: "#f6e4e9",
            size: sm
        },
        {
            order: 4,
            value: 3,
            label: "NEITHER",
            fill: "#fcfcfc",
            size: lg
        },
        {
            order: 5,
            value: 1,
            label: "less masculine",
            fill: "#eaeff1",
            size: sm
        },
        {
            order: 6,
            value: 1,
            label: "MALE",
            fill: "#8C989D",
            size: lg
        },
        {
            order: 7,
            value: 1,
            label: "more masculine",
            fill: "#223740",
            size: sm
        }
    ];
}