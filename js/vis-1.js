// /* Design by Lins Derry */
//
// // SVG drawing area
// var margin = {top: 100, right: 100, bottom: 50, left: 100};
// var width = 1000 - margin.left - margin.right;
// var height = 500 - margin.top - margin.bottom;
// var svg = d3.select("#sentiment-chart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// var svgLegend = d3.select("#sentiment-legend").append("svg")
//     .attr("width", (width + margin.left + margin.right))
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("class", "legendOrdinal")
//     .attr("transform", "translate(30," + (margin.top) + ")");
// var svg2 = d3.select("#sentiment-chart-2").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + (margin.left + 150) + "," + margin.top + ")");
//
// //Scales
// var xScale = d3.scalePoint()
//     .range([0, width])
//     .align([0.5]);
// var yScale = d3.scalePoint()
//     .range([0, height])
//     .align([0.5]);
// // Create a color scale
// var colorScale = d3.scaleOrdinal()
//     .range(["#c3f4e9", "#2a3b90", "#216000", "#fff853", "#7a2536", "#C25BB8", "#fdbf6f"]);
//
// /*
// Calm: #2a3b90
// Sad: #0c0d49
// Disgusted: #216000
// Happy: #fff853
// Angry: #7a2536
// Surprise: #873778
//  */
//
// // Create a legend using d3-legend library
// var legend = d3.legendColor()
//     .labelFormat(d3.format(",.2r"))
//     .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
//     .shapePadding(5)
//     .scale(colorScale);
//
// //Axes
// var xAxis = d3.axisBottom()
//     .scale(xScale);
// var yAxis = d3.axisLeft()
//     .scale(yScale);
//
// //Append g elements for x and y axes
// svg.append("g")
//     .attr("class", "x-axis axes")
//     .attr("transform", "translate(0," + (height - margin.bottom) + ")");
// svg.append("g")
//     .attr("class", "y-axis axes")
//     .attr("transform", "translate(-5, 0)");
//
// // Add labels about circle size encodings
// svgLegend.append("text")
//     .attr("x", 0)
//     .attr("y", height)
//     .attr("dy", ".35em")
//     .text("Circle size is relative to AI's confidence that the painting portrays the given sentiment.");
//
// svg.append("text")
//     .attr("x", 0 - 40)
//     .attr("y", height)
//     .attr("dy", ".35em")
//     .attr("id", "sentiment-chart-label")
//     .text("Circle size is relative to AI's confidence that the painting portrays the given sentiment.");
//
// // For transitions, dur is used to update visualization functions.
// const dur = 900; //Milliseconds
//
// /* createVis triggers the default look of the chart then "listens" for
// 	user-initiated events. */
// function createSentimentVis() {
//
//     // Update scales
//     xScale.domain(sentiments);
//     yScale.domain(sentiments);
//     colorScale.domain(sentiments);
//
//     /* Draw chart with default as "All" since it is first on the drop-down list and
//         visible when user first lands on the page. */
//     sentimentVisConcentric("artObjects");
//     sentimentVisPack("artObjects");
//
//
//     //Event listener
//     d3.select("#dropdown-selection")
//         .on("change", function () {
//             var choice = d3.select("#dropdown-selection").property("value");
//             sentimentVisConcentric(choice);
//             sentimentVisPack(choice);
//         });
// }
// /* sentimentVisHelper sets up the axes properties, calls the axes generators, and draws the inner chart
// 	according to the user's choice. */
// function sentimentVisConcentric(choice) {
//
//     var data;
//
//     if(choice === "artObjects") { data = artObjects; }
//     if(choice === "female") { data = female; }
//     if(choice === "male") { data = male; }
//
//     var updateCir = svg.selectAll("circle").data(data);
//     var enterCir = updateCir.enter()
//         .append("circle")
//         .attr("class", "cir");
//     enterCir.merge(updateCir)
//         .transition()
//         .duration(dur)
//         .attr("cx",function(d, i) {
//             return xScale(d.emotion);
//         })
//         .attr("cy",height / 3)
//         .attr("r",function(d) {
//             return (d.confidence * .75);
//         })
//         .style("fill", function (d) {
//             return colorScale(d.emotion);
//         })
//         .style("stroke", "black")
//         .style("opacity", 0.3);
//     updateCir.exit().remove();
//
//     //Call axes generators
//     svg.select(".x-axis")
//         .transition()
//         .duration(dur)
//         .call(xAxis)
//         .selectAll("text")
//         .style("text-anchor", "start")
//         .attr("x", "3")
//         .attr("y", "-3")
//         .attr("transform", function(d) {
//             return "rotate(-90)"
//         });
// }
//
// function sentimentVisPack(choice) {
//
//     var hierarchyData = getHierarchyData(choice);
//
//     var pack = d3.pack()
//         .size([width, height])
//         .padding(2);
//
//     var root = d3.hierarchy(hierarchyData);
//
//     var nodes = pack(root).descendants();
//
//     var updateCir = svg2.selectAll("circle").data(nodes);
//     var enterCir = updateCir.enter()
//         .append("circle")
//         .attr("class", "cir")
//         .on("mouseover", function(d) {
//             if (d.children === undefined) {
//                 var image = document.getElementById("hover-img");
//                 image.src = d.data.url;
//                 document.getElementById("title").innerHTML = "Title: " + d.data.title;
//                 document.getElementById("date").innerHTML = "Date: " + d.data.date;
//                 document.getElementById("artist").innerHTML = "Artist: " + d.data.artist;
//                 document.getElementById("emotion").innerHTML = "Dominant emotion: " + d.data.name;
//                 document.getElementById("confidence").innerHTML =
//                     "AI confidence: " + Math.floor(d.data.value) + "%";
//             }
//         });
//
//     enterCir.merge(updateCir)
//         .transition()
//         .duration(dur)
//         .attr("cx",function(d) {
//             return d.x - 400;
//         })
//         .attr("cy",function(d) {
//             return d.y - 85;
//         })
//         .attr("r",function(d) {
//             return d.r;
//         })
//         .style("fill", function (d) {
//             if (d.data.name !== "RootNode" && d.data.name !== undefined) {
//                 return colorScale(d.data.name);
//             }
//             else {
//                 return "white";
//             }
//         });
//
//     updateCir.exit().remove();
//
//     // Now that the color.domain is updated which affects how legend is constructed, call legend.
//     svgLegend.call(legend);
// }
//
// function getHierarchyData(choice) {
//
//     var sentimentsMapLocal = [];
//     var selection = [];
//
//     if (choice === "artObjects") {
//         sentimentsMapLocal = sentimentsMap;
//         selection = artObjects;
//     }
//     if (choice === "female") {
//         // Instantiate a map of dominant emotions
//         female.forEach(function (d) {
//             sentimentsMapLocal[d.emotion] = 0;
//         });
//         // Record the recurrence for each emotion in the map
//         female.forEach(function (d) {
//             sentimentsMapLocal[d.emotion] += 1;
//         });
//         selection = female;
//     }
//
//     if (choice === "male") {
//         // Instantiate a map of dominant emotions
//         male.forEach(function (d) {
//             sentimentsMapLocal[d.emotion] = 0;
//         });
//         // Record the recurrence for each emotion in the map
//         male.forEach(function (d) {
//             sentimentsMapLocal[d.emotion] += 1;
//         });
//         selection = male;
//     }
//     var sentimentsLocal = makeSentimentsArray(sentimentsMapLocal);
//     var sentimentsObjects = [];
//     for (var i = 0; i < sentimentsLocal.length; i++) {
//         var children = [];
//         for (var j = 0; j < selection.length; j++) {
//             if (sentimentsLocal[i] === selection[j].emotion) {
//                 var child = {"name": selection[j].emotion,
//                         "value": selection[j].confidence,
//                         "children": undefined,
//                         "title": selection[j].title,
//                         "artist": selection[j].artist,
//                         "date": selection[j].date,
//                         "url" : selection[j].url
//                         };
//                 children.push(child);
//             }
//         }
//         var obj = {
//             "name": undefined,
//             "value": sentimentsMapLocal[sentimentsLocal[i]],
//             "children": children
//         };
//         sentimentsObjects.push(obj);
//     }
//     return {"name": "RootNode",
//         "value": choice.length,
//         "children": sentimentsObjects
//     };
// }
//
