
/* The following arrays will be used to store the Harvard Art Museums' (HAM) data in ways that are most
helpful for constructing the visualizations; these are global variables, so therefore, I am describing
them here: */

/* An array of objects derived from the HAM API's Object section (human) */
var objectData = [];

/* An array of objects derived from the HAM API's Annotation section (AI) */
var annotationData = [];

/* An array of objects containing data from objectData and annotationData made by
 cross-comparing the imageid fields. */
var artObjects = [];

/* artObjects divided into two sub-arrays, female and male, where gender is used to filter. */
var female = [];
var male = [];

/* An array of strings, specifically, the list of emotions used by AWS Rekognition in its
 facial analysis algorithm for the current selection of art objects. */
var sentiments = [];

/* A map where the key is the emotion and the value is its recurrence. For simplification,
 the emotion with the highest probability per art object is counted toward the sum of recurrence. */
var sentimentsMap = [];
var femaleSentMap = [];
var maleSentMap = [];

/* A map where the key is the emotion and the value, an arbitrarily assigned color. */
var sentColKey = [];

/* An array of strings, specifically, the hex color values listed in each art object's colors array. */
var colorsHex = [];

/* An array of objects ordered from least to most frequent hex colors in paintings. */
var orderedColorsHex = [];

/* An array of strings, specifically, the hue color listed in each art object's colors array. */
var colorsHue = [];

/* An array of objects ordered from least to most frequent hue colors in paintings. */
var orderedColorsHue = [];

// For transitions, dur is used to update visualization functions.
const dur = 1200; //Milliseconds

/* Load data using d3.queue to prevent unwanted asynchronous activity. */
d3.queue()
    .defer(d3.json, 'data/object.json')
    .defer(d3.json, 'data/annotation.json')
    .await(setup);

/* setup instantiates global arrays and creates the default visualizations. */
function setup(error, data1, data2) {

    objectDataPopulate(data1);
    annotationData = data2;
    artObjects = createArtObjects(objectData, annotationData);
    sentColKey = sentimentColorKey();

    // Initialize default look of all visualizations
    wrangleData(artObjects);
    sentimentVisPack(artObjects);
    sentimentVisConcentric(artObjects);
    colorVisualizations("hex", artObjects);
    colorMosaic(orderedColorsHex[orderedColorsHex.length - 1], artObjects);
    genderVisRadial(female, male);
    // sentimentVisTime(artObjects);
    sentColLegend();
    sentRadio("all");

    updateVisualizations();
}

/* Populate objectData with color images of paintings only. Sadly, this may filter out pieces intentionally
*  painted with only black, white, and grey hues. */
function objectDataPopulate(data1) {
    /* Filter out black and white images by testing that an image has a hue other than "Black", "White", and "Grey" */
    data1.forEach(function (d) {
        var include = false;
        for (var i = 0; i < d.colors.length; i++) {
            if (d.colors[i].hue === "Violet" || d.colors[i].hue === "Blue" || d.colors[i].hue === "Orange" ||
                d.colors[i].hue === "Red" || d.colors[i].hue === "Yellow" || d.colors[i].hue === "Green" ||
                d.colors[i].hue === "Brown") {
                include = true;
            }
            if (include === true) {
                objectData.push(d);
                break;
            }
        }
    });
}

/* createArtObjects returns an array of objects containing data from objectData and annotationData
made by cross-comparing the imageid fields. */
function createArtObjects(objectData, annotationData) {

    // Simplifies the century field. For example, "12th-13th century" becomes "12th century"
    var simplifyCentury = function(century) {
        var string = "";
        for (var i = 0; i < century.length; i++) {
            if (century[i] === '-' || century[i] === " " ) {
                break;
            }
            else {
                string += century[i];
            }
        }
        string += " century";
        return string;
    };

    var counter = 0;
    objectData.forEach(function (object) {
        //Match imageids between objectData and annotationData to combine records
        var contains = false;
        for (var i = 0; i < object.imageids.length; i++) {
            annotationData.forEach(function (annotation) {
                if (object.imageids[i] === annotation.imageid && object.century !== "") {
                    contains = true;
                    counter++;
                    object.imageid = annotation.imageid;
                    object.faceimageurl = annotation.faceimageurl;
                    object.gender = annotation.gender;
                    object.emotion = getEmotion(annotation);
                    object.century = simplifyCentury(object.century);
                }
            });
            if (contains === true) {
                artObjects.push(object);
                break;
            }
        }
    });
    console.log("There are this many combined records: " + counter);
    console.log("Above number should be equal to artObjects length which is: " + artObjects.length);
    console.log("This is the first record in artObjects:");
    console.log(artObjects[0]);

    return artObjects;
}

/* getEmotion returns an object containing the annotations's greatest emotion according to the
emotion's Confidence rating along with that Confidence value. getEmotion is a helper function
 for createArtObjects. */
function getEmotion(annotation) {
    var maxConf = d3.max(annotation.emotions, function (d) {
        return d.Confidence;
    });
    var maxEmo;
    annotation.emotions.forEach(function (d) {
        if (d.Confidence === maxConf) {
            maxEmo = d.Type;
        }
    });
    return {
        Confidence: maxConf,
        Value: maxEmo
    }
}

/* sentimentColorKey returns a map where the key is the emotion and the value, an arbitrarily assigned color.
 (Using AWS Rekognition's eight emotions used for facial analysis.) */
function sentimentColorKey() {
    var key = [];
    key["DISGUSTED"] = "#216000";
    key["SAD"] = "#2a3b90";
    key["CONFUSED"] = "#ffcc99";
    key["ANGRY"] = "#7a2536";
    key["CALM"] = "#AFEEEE";
    key["HAPPY"] = "#fff853";
    key["SURPRISED"] = "#ac128f";
    key["FEAR"] = "#1a1a1a";

    return key;
}

/* wrangleData uses helper functions getSentiments, makeSentimentsMap, makeColors, makeColorsMap, and
*  makeOrderedColors to update global variables according to choice. choice can be artObjects or a
*  variation of it. */
function wrangleData(choice) {
    female = artObjects.filter(function (d) {
        return d.gender.Value === "Female";
    });
    male = artObjects.filter(function (d) {
        return d.gender.Value === "Male";
    });

    sentiments = getSentiments(choice);
    sentimentsMap = makeSentimentsMap(choice);
    femaleSentMap = makeSentimentsMap(female);
    maleSentMap = makeSentimentsMap(male);

    colorsHex = makeColors(choice, "hex");
    colorsHexMap = makeColorsMap(colorsHex);
    orderedColorsHex = makeOrderedColors(colorsHex, colorsHexMap);

    colorsHue = makeColors(choice, "hue");
    colorsHueMap = makeColorsMap(colorsHue);
    orderedColorsHue = makeOrderedColors(colorsHue, colorsHueMap);
}

/* WrangleData HELPER FUNCTIONS: */

/* getSentiments return an array (set) of sentiments found in data. */
function getSentiments(data) {
    var emotionSet = [];
    for (var j = 0; j < data.length; j++) {
        if (!emotionSet.includes(data[j].emotion.Value)) {
            emotionSet.push(data[j].emotion.Value);
        }
    }

    return emotionSet;
}

/* makeSentimentsMap returns a map where the key is the emotion and the value is its recurrence.
 This function accepts data as an argument which could potentially be the artObjects, female, or male
 arrays where d.emotion.Value is valid. */
function makeSentimentsMap(data) {
    var map = [];

    // Instantiate a map with the sentiments as the keys
    for (var i = 0; i < sentiments.length; i++) {
        map[sentiments[i]] = 0;
    }

    // Record the recurrence for each emotion in the map
    data.forEach(function (d) {
        map[d.emotion.Value] += 1;
    });
    return map;
}

/* makeColors returns an array of strings, specifically, the prominent color (hex or hue) value listed in each record's
 colors array. I am using an array and not a set bcs I want to count the recurrences and the array's length later on.
 This function accepts data as an argument which could potentially be the artObjects, female, or male arrays where
 d.color/d.hue could be navigated to as follows. */
function makeColors(data, kind, range) {

    var colors = [];

    if (kind === "hex") {
        data.forEach(function (record) {
            // Only prominent colors
            colors.push(record.colors[0].color);
        });
    }

    if (kind === "hue") {
        data.forEach(function (record) {
            // Only prominent hues
            colors.push(record.colors[0].hue);
        });
    }

    return colors;
}

/* Returns a map where the key is the color and the value is its recurrence. The parameter, colors,
* could potentially be colorsHex or colorsHue */
function makeColorsMap(colors) {
    var map = [];

    // Instantiate a map with the colors as the keys
    for (var i = 0; i < colors.length; i++) {
        map[colors[i]] = 0;
    }
    // Record the recurrence for each color in the map
    for (var j = 0; j < colors.length; j++) {
        map[colors[j]] += 1;
    }

    return map;
}

/* Returns an array of objects ordered from least to most frequent colors in paintings. */
function makeOrderedColors(colors, map) {
    var orderedColors = [];
    var colorsSet = [];

    for (var j = 0; j < colors.length; j++) {
        if (!colorsSet.includes(colors[j])) {
            colorsSet.push(colors[j]);
        }
    }
    for (var i = 0; i < colorsSet.length; i++) {
        var obj = {
            color: colorsSet[i],
            frequency: map[colorsSet[i]]
        };
        orderedColors.push(obj);
    }
    orderedColors.sort(function (a, b) {
        return a.frequency - b.frequency;
    });

    return orderedColors;
}

/* END wrangleData HELPER FUNCTIONS */

/* Update colorVisWheel and colorVisBlock visualizations based on kind. */
function colorVisualizations(kind, data) {
    if (kind === "hue") {
        colorVisBlock(colorsHue, orderedColorsHue, data);
        colorMosaic(orderedColorsHue[orderedColorsHue.length - 1], data);
        document.getElementById("mosaic-message-0").innerHTML = "<strong>" +
            "Click on a hue to view paintings where that hue is most prominent:"
            + "</strong>";
    }
    if (kind === "hex") {
        colorVisBlock(colorsHex, orderedColorsHex, data);
        colorMosaic(orderedColorsHex[orderedColorsHex.length - 1], data);
        document.getElementById("mosaic-message-0").innerHTML = "<strong>" +
            "Click on a color to view paintings where that color is most prominent:"
            + "</strong>";
    }
}

/* SentRadio updates the user interface to hide/show relevant sentiment radio buttons. */
function sentRadio(value) {

    var result;
    var result2;

    /* Makes visible the sentiment radio buttons for the given sentiments in the selection. For example,
     if female is selected and female has no art objects annotated as disgusting, disgusting is hidden. */
    if (isGender(value)) {
        // Populate result with radio elements for sentiment
        result = document.getElementsByClassName("radio sent");
        result2 = document.getElementsByName("sentiment");
        var includeEmotion;
        var sent;

        // Edits color of radio button labels
        for (var k = 0; k < result.length; k++) {
            includeEmotion = false;
            for (var l = 0; l < sentiments.length; l++) {
                result[k].classList.forEach(function (d) {
                    if (d === sentiments[l]) {
                        includeEmotion = true;
                        sent = sentiments[l];
                    }
                });
            }
            if (!includeEmotion) {
                result[k].style.color = "#e5e5e5";
            } else {
                result[k].style.color = sentColKey[sent];
            }
        }
        // Edits ability to click on radio buttons
        for (var m = 0; m < result2.length; m++) {
            includeEmotion = false;
            for (var n = 0; n < sentiments.length; n++) {
                if (result2[m].value === sentiments[n] || result2[m].value === "all_sent") {
                    includeEmotion = true;
                }
            }
            if (!includeEmotion) {
                result2[m].disabled = true;
            }
            if (includeEmotion) {
                result2[m].disabled = false;
            }
        }
    }

    /* Makes visible the gender radio buttons for the selected sentiment. For example, if disgusting is selected
     but no female art objects are annotated as disgusting, female is hidden. */
    if (isEmotion(value)) {
        if (value === "all_sent") {
            sentRadio("all");
        }
        // Populate result with radio elements for gender
        result = document.getElementsByClassName("radio gen");
        result2 = document.getElementsByName("gender");
        var includeFemale = hasEmo(value, female);
        var includeMale = hasEmo(value, male);

        // Edits color of radio button labels
        for (var i = 0; i < result.length; i++) {
            result[i].classList.forEach(function (d) {
                if (d === "female") {
                    if (!includeFemale) {
                        result[i].style.color = "#e5e5e5";
                    } else {
                        result[i].style.color = "#343a40";
                    }
                }
                if (d === "male") {
                    if (!includeMale) {
                        result[i].style.color = "#e5e5e5";
                    } else {
                        result[i].style.color = "#343a40";
                    }
                }
            });
        }
        // Edits ability to click on radio buttons
        for (var j = 0; j < result2.length; j++) {
            if (result2[j].value === "female") {
                if (!includeFemale) {
                    result2[j].disabled = true;
                } else {
                    result2[j].disabled = false;
                }
                if (result2[j].value === "male") {
                    if (!includeMale) {
                        result2[j].disabled = true;
                    } else {
                        result2[j].disabled = false;
                    }
                }
            }
        }
    }
}

/* hasEmo returns a boolean for whether or not data has art objects annotated with the given emotion or emo */
function hasEmo(emo, data) {
    if (emo === "all_sent") {
        return true;
    }
    else {
        var hasEmo = false;

        for (var d = 0; d < data.length; d++) {
            if (data[d].emotion.Value === emo) {
                hasEmo = true;
            }
            if (hasEmo === true) {
                return hasEmo;
            }
        }
        return hasEmo;
    }
}

/* updateVisualizations "listens" for user-initiated events then updates the visualizations. */
function updateVisualizations() {

    // Set default values
    var data = artObjects;
    var gender = "all";
    var emotion = "all_sent";
    var radioColor = "hex";

    // Event listener coordinates filtering across all visualizations
    d3.selectAll("input")
        .on("change", function() {
            var value = this.value;

            if (isGender(value)) {
                gender = value;
            }
            if (isEmotion(value)) {
                emotion = value;
            }

            if (value === "hue" || value === "hex") {
                radioColor = value;
            }

            data = updateData(value, gender, emotion);
            wrangleData(data);

            // Updates visualizations with wrangled data
            sentimentVisPack(data);
            sentimentVisConcentric(data);
            colorVisualizations(radioColor, data);
            sentColLegend();
            sentRadio(value);

            // Update radio interfaces
            updateRadioInterfaces(value);
        });
}

/* isGender returns a boolean value for whether or not radio input is a gender selection */
function isGender(value) {
    var isGender = false;

    if (value === "all" || value === "female" || value === "male") {
        isGender = true;
    }

    return isGender;
}

/* isEmotion returns a boolean value for whether or not radio input is an emotion selection */
function isEmotion(value) {
    var allEmotions = ["CALM", "ANGRY", "SURPRISED", "CONFUSED", "HAPPY", "SAD", "DISGUSTED", "FEAR"];
    var isEmotion = false;
    for (var j = 0; j < allEmotions.length; j++) {
        if (value === allEmotions[j] || value === "all_sent") {
            isEmotion = true;
        }
    }
    return isEmotion;
}

/* updateData returns artObjects as a new filtered array for updating all visualizations according to the
*  user's selection for gender and emotion.  */
function updateData(value, gender, emotion) {

    /* Filter data according to gender and emotion */
    var data;

    if (gender === "all" && emotion === "all_sent") {
        data = artObjects;
    }
    if (gender === "female" && emotion === "all_sent") {
        data = female;
    }
    if (gender === "male" && emotion === "all_sent") {
        data = male;
    }
    if (gender === "all" && emotion !== "all_sent") {
        data = artObjects.filter(function (d) {
            return d.emotion.Value === emotion;
        });
    }
    if (gender === "female" && emotion !== "all_sent") {
        data = female.filter(function (d) {
            return d.emotion.Value === emotion;
        });
    }
    if (gender === "male" && emotion !== "all_sent") {
        data = male.filter(function (d) {
            return d.emotion.Value === emotion;
        });
    }
    return data;
}

/* updateRadioInterfaces visually updates radio buttons across document (page). For example, if the user
 selects female then all female radio buttons become checked. */
function updateRadioInterfaces(value) {
    var className = "radio " + value;
    var buttons = document.getElementsByClassName(className);

    // Check matching radio buttons across page
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].control.checked = true;
    }
}


