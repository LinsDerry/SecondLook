/* This script, import-HAM.js, was created by Dario Rodighiero and adapted by Lins Derry for metaLAB project
Curatorial A(i)gents. I first downloaded Dario's HAM project from GitHub and saved it to my desktop as
 HAM-adaptation where I then made my changes to import-HAM.js and added my two CSV files metadata-object.csv
and paintings-annotation-AWS to the data/HAM/ directory. Dario's project can be found here:
 https://github.com/rodighiero/HAM
 
 To run this script using my Mac Terminal, I download Node.js then entered the following commands:
 1. npm install csv-parser
 2. npm install beautify
 3. node /Users/linsderry/Desktop/HAM-adaptation/import-HAM.js

Once the script runs, a JSON file is generated in the HAM-adaptation/data directory. Note that HAM is short
 for the Harvard Art Museums. */

/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
const path = require('path')
const fs = require('fs');
const csv = require('csv-parser')

const results = [];

// For Object section of HAM API
//fs.createReadStream('/Users/linsderry/Desktop/HAM-adaptation/data/HAM/metadata-object.csv')

// For Annotation section of HAM API
fs.createReadStream('/Users/linsderry/Desktop/HAM-adaptation/data/HAM/paintings-annotation-AWS.csv')

.pipe(csv())
.on('data', (data) => results.push(data))
.on('end', () => createJson(results))

const createJson = (data) => {

    let docs = []

    data.forEach(record => {

                     // For Object section of HAM API
//                     if (record.colorcount > 1) {
//                         const obj = {}
//                         obj.century = record.century
//                         obj.culture = record.culture
//                         obj.primaryimageurl = record.primaryimageurl
//                         obj.rank = +record.rank
//                         obj.totalpageviews = +record.totalpageviews
//                         obj.totaluniquepageviews = +record.totaluniquepageviews
//                         obj.title = record.title
//                         obj.peoplecount = +record.peoplecount
//
//                         var people = record.people
//                         /* The following replace() addresses problem with CSV using single quotes instead of two
//                                                (preventing JSON.parse to run) and non-data-types like None. */
//                         people = people.replace(/{'/g, '{"')
//                         people = people.replace(/'}/g, '"}')
//                         people = people.replace(/':/g, '":')
//                         people = people.replace(/: '/g, ': "')
//                         people = people.replace(/, '/g, ', "')
//                         people = people.replace(/',/g, '",')
//                         people = people.replace(/None/g, '"unknown"')
//                         people = JSON.parse(people)
//                         //obj.people = people
//                         getArtist(obj, people)
//
//                         var colors = record.colors
//                         colors = colors.replace(/'/g, '"')
//                         colors = colors.replace(/None/g, '"unknown"')
//                         colors = JSON.parse(colors)
//                         obj.colors = colors
//
//                         var images = record.images
//                         images = images.replace(/{'/g, '{"')
//                         images = images.replace(/'}/g, '"}')
//                         images = images.replace(/':/g, '":')
//                         images = images.replace(/: '/g, ': "')
//                         images = images.replace(/, '/g, ', "')
//                         images = images.replace(/',/g, '",')
//                         images = images.replace(/None/g, '"unknown"')
//                         images = images.replace(/\\xa0 Used/g, 'Used') // The extra \ escapes the literal '\' to be searched for
//                         images = JSON.parse(images)
//                         obj.images = images
//
//                         var imageids = []
//                         images.forEach(function(img) {
//                             imageids.push(img.imageid)
//                         })
//                         obj.imageids = imageids
//
//                         docs.push(obj)
//                     }
//                 })

    // For Annotation section of HAM API
                 if (record.Type === "face") {
                    const obj = {}
                    obj.imageid = +record.ImageID
                    obj.confidence = +record.Confidence

                    var raw = record.Raw
                    raw = raw.replace(/None/g, '"unknown"')
                    raw = raw.replace(/False/g, 'false')
                    raw = raw.replace(/True/g, 'true')
                    raw = JSON.parse(raw)
                    // obj.raw = raw

                    // Pulling out three interesting features from raw for quick access
                    obj.gender = raw.Gender
                    obj.emotions = raw.Emotions
                    obj.faceimageurl = raw.iiifFaceImageURL

                 docs.push(obj)
                 }
               })

//     Sort Annotation records by ascending imageid followed by ascending confidence
        docs.sort(function(a, b) {
            return a.imageid - b.imageid ||  a.confidence - b.confidence
        })

    const format = json => beautify(JSON.stringify(json), { format: 'json' })

    // For Object section of HAM API
//    let fileName = path.resolve(__dirname, `./data/object.json`)

    // For Annotation section of HAM API
            let fileName = path.resolve(__dirname, `./data/paintings-annotation.json`)

    fs.writeFile(fileName, format(docs), err => {
                     if (err) throw err
                     console.log("made it")
                 })
}

/*getArtist goes through the people array to figure out who the artist is, minding duplicates and
 the possibility for more than one artist. */
function getArtist(obj, people) {
    var artist = [];

    people.forEach(function (person) {
        var duplicate = false
        if (person.role === "Artist" && artist.length === 0) {
            artist.push(person.name)
        }
        if (person.role === "Artist" && artist.length !== 0) {
            for (var i = 0; i < artist.length; i++) {
                if (person.name === artist[i]) {
                    duplicate = true
                }
                if (duplicate === true) {
                    break
                }
            }
            if (duplicate === false) {
                artist.push(person.name)
            }
        }
    })

    artist.forEach(function (person, index) {
        if (person === "Unidentified Artist") {
            artist[index] = "Unknown Artist"
        }
    })

    if (artist.length === 0) {
        obj.artist = "Unknown Artist"
    }
    if (artist.length === 1) {
        obj.artist = artist[0];
    }
    if (artist.length > 1) {
        var artists = artist[0]
        for (var i = 1; i < artist.length; i++) {
            if (i !== artist.length - 1 && artist.length > 2) {
                artists += (" and " + artist[i])
            }
            if (i === artist.length - 1 && artist.length > 2) {
                artists += artist[artist.length - 1]
            }
            if (i === artist.length - 1 && artist.length === 2){
                artists += (" and " + artist[artist.length - 1])
            }
        }
        obj.artist = artists
    }
}

//                    const obj = {}
//                    obj.imageid = +record.imageid
//                    obj.confidence = +record.confidence
//
//                    var raw = record.raw
//                    raw = raw.replace(/{'/g, '{"')
//                    raw = raw.replace(/'}/g, '"}')
//                    raw = raw.replace(/':/g, '":')
//                    raw = raw.replace(/: '/g, ': "')
//                    raw = raw.replace(/, '/g, ', "')
//                    raw = raw.replace(/',/g, '",')
//                    raw = raw.replace(/None/g, '"unknown"')
//                    raw = raw.replace(/False/g, 'false')
//                    raw = raw.replace(/True/g, 'true')
//                    raw = JSON.parse(raw)
//                    // obj.raw = raw
//
//                    // Pulling out three interesting features from raw for quick access
//                    obj.gender = raw.Gender
//                    obj.emotions = raw.Emotions
//                    obj.faceimageurl = raw.iiifFaceImageURL
//
//                    docs.push(obj)
//
//                })
//
//Sort Annotation records by ascending imageid followed by ascending confidence
//   docs.sort(function(a, b) {
//       return a.imageid - b.imageid ||  a.confidence - b.confidence
//   })
