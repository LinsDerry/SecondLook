// SVG drawing areas
var marginTime = {top: 25, right: 35, bottom: 25, left: 35};
var widthTime = 700 - marginTime.left - marginTime.right;
var heightTime = 700 - marginTime.top - marginTime.bottom;
var svgTime = d3.select("#sentimentVisTime").append("svg")
    .attr("width", widthPack + marginTime.left + marginTime.right)
    .attr("height", heightPack + marginTime.top + marginTime.bottom)
    .append("g")
    .attr("class", "chart")
    .attr("transform", "translate(" + marginTime.left + "," + marginTime.top / 2 + ")");

function sentimentVisTime(data) {

    var width = widthTime;
    var height = heightTime;

    var cent = [];
    artObjects.forEach(function (d) {
        var include = true;
        for (var i = 0; i < cent.length; i++) {
            if (cent[i] === d.century) {
                include = false;
            }
        }
        if (include) {
            cent.push(d.century);
        }
    });
    cent.sort();

    var hierarchyData = getHierarchyData(data);

    var pack = d3.pack()
        .size([width, height])
        .padding(3);

    var root = d3.hierarchy(hierarchyData);

    var nodes = pack(root).descendants();

    console.log(nodes);

    createTimeDefs(nodes);

    var updateEmoji = svgTime
        .selectAll(".emoji")
        .data(nodes, function(d) {
            return d.data.id;
        });

    updateEmoji
        .transition()
        .duration(dur)
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .attr("r",function(d) {
            return d.r;
        })
        .attr("xlink:href", function (d, i) {
            if (d.data.name === undefined) {
                return "url(#emoji_" + i + ")";
            } else {
                return "transparent";
            }
        });

    var newEmoji = updateEmoji.enter()
        .append("circle")
        .attr("class", "emoji")
        .attr("cx", width/2)
        .attr("cy", height/2)
        .attr("r", 0)
        .attr("fill", function (d, i) {
            if (d.data.name === undefined) {
                console.log(d.r);
                return "url(#emoji_" + i + ")";
            }
            else {
                return "transparent";
            }
        });

    newEmoji
        .transition()
        .duration(dur)
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .attr("r",function(d) {
            return d.r;
        });


    updateEmoji.exit().remove();

}

function createTimeDefs(data) {
    svgTime.selectAll("defs").remove();

    var defs = svgTime.append("defs");

    var patterns = defs.selectAll("pattern")
        .data(data)
        .enter()
        .append("pattern")
        .attr("id", function (d, i) {
            return "emoji_" + i;
        })
        .attr("width", function (d) {
            if (d.data.name === undefined) {
             return d.r * 2;
            }
            else {
                return 0;
            }
        })
        .attr("height", function (d) {
            if (d.data.name === undefined) {
                return d.r * 2;
            }
            else {
                return 0;
            }
        })
        .attr("patternUnits", "userSpaceOnUse");

    var images = patterns.append("svg:image")
        .attr("xlink:href", function (d) {
            return "img/smile.svg";
        })
        .attr("x", 0)
        .attr("y",0)
        .attr("width", function (d) {
            if (d.data.name === undefined) {
                return d.r * 2;
            }
            else {
                return 0;
            }
        })
        .attr("height", function (d) {
            if (d.data.name === undefined) {
                return d.r * 2;
            }
            else {
                return 0;
            }
        });
}