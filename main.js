// https://github.com/HashLips/generative-art-opensource/blob/main/index.js
const fs = require("fs");

// Original
let original = 70;
// Rare
let rare = 20;
// Superare
let super_rare = 10;

// Data Elements, for the MVP of this library I have kept the tracks structure very simple. You could theoretically get really wild with this, and include dozens of tracks & variations.
let drums = [
  {
    file: "./layers/drums/drums1.wav",
    rarity: rare,
  },
  {
    file: "./layers/drums/drums2.wav",
    rarity: original,
  },
  {
    file: "./layers/drums/drums3.wav",
    rarity: super_rare,
  },
];

let keys = [
  {
    file: "./layers/keys/keys1.wav",
    rarity: rare,
  },
  {
    file: "./layers/keys/keys2.wav",
    rarity: original,
  },
  {
    file: "./layers/keys/keys3.wav",
    rarity: super_rare,
  },
];

let leads = [
  {
    file: "./layers/leads/lead1.wav",
    rarity: rare,
  },
  {
    file: "./layers/leads/lead2.wav",
    rarity: original,
  },
  {
    file: "./layers/leads/lead3.wav",
    rarity: super_rare,
  },
];

// Function to check if the given stem combo of layers is contained unique
const isDnaUnique = (_DnaList = [], _dna = []) => {
  let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  // return true if it is, indicating that this stem combo is already in use and should be recalculated.
  return foundDna == undefined ? true : false;
};

// Rarity aspect of this
function createTracks(leads, drums, keys) {
  let trackList = [];
  let metadataList = [];

  //Edition count
  let editionCount = 5;

  for (let i = 0; i < editionCount; i++) {
    // Create new track stems
    let newTrack = createTrackStems(leads, drums, keys);
    // check if track is unique, if not, create newTracks until it is
    while (!isDnaUnique(trackList, newTrack)) {
      newTrack = createTrackStems(leads, drums, keys);
    }
    // Push new unique track to the trackList
    trackList.push(newTrack);
    // joinAudio + output
    joinAudio(newTrack, i);
    // Create metadata with approriate info
    const nftMetadata = createMetadata(newTrack, i);
    metadataList.push(nftMetadata);
    writeMetaData(i, JSON.stringify(nftMetadata));
  }
  console.log(trackList);
  console.log("-- Process Finished --");
}

// To Do: Improve metadata outputs
function createMetadata(trackData, i) {
  const metadata = {
    version: "Songchain-v1",
    name: "Generative music engine",
    description: "Debut generative collection from Pete Keating",
    external_url: "https://google.com",
    image: "ipfs://QmUb4kqN8i3Gism8VAdt86DQHf3FbTXRPipdNJD5y3KMAh",
    animation_url: `ipfs://REPLACE_WITH_CID/generativeTrack` + i + ".wav",
    attributes: [
      {
        trait_type: "Leads",
        value: trackData[0],
      },
      {
        trait_type: "Drums",
        value: trackData[1],
      },
      {
        trait_type: "Drums",
        value: trackData[2],
      },
    ],
  };
  return metadata;
}

// To Do: Write metadata
const writeMetaData = (id, _data) => {
  fs.writeFileSync("./output/metadata/metadata_" + id + ".json", _data);
};

// RandomTracks
const createTrackStems = (array1, array2, array3) => {
  const stem1 = selectRandomWeightedTrack(array1);
  const stem2 = selectRandomWeightedTrack(array2);
  const stem3 = selectRandomWeightedTrack(array3);
  return (trackStems = [stem1, stem2, stem3]);
};

// Select random weighted item
// Input array or items with file & weights
// Create distribution
// Select random number from that distribution
const selectRandomWeightedTrack = (array) => {
  // Create a distribution
  const distribution = [];

  // Push file locations into weighted distribution
  for (let i = 0; i < array.length; ++i) {
    for (let j = 0; j < array[i].rarity; ++j) {
      distribution.push(array[i].file);
    }
  }
  // Eeturn random value from weighted distributino
  return (stem = distribution[Math.floor(Math.random() * distribution.length)]);
};

const joinAudio = (trackData, i) => {
  var SoxCommand = require("sox-audio");
  var command = SoxCommand();

  var outputName = "./output/audio/generativeTrack" + i + ".wav";

  var command = SoxCommand()
    .input(trackData[0])
    .input(trackData[1])
    .input(trackData[2])
    .output(outputName)
    .outputFileType("wav")
    .combine("mix");

  command.on("prepare", function (args) {
    console.log("Preparing sox command with args " + args.join(" "));
  });

  command.on("start", function (commandLine) {
    console.log("Spawned sox with command " + commandLine);
  });

  command.on("progress", function (progress) {
    console.log("Processing progress: ", progress);
  });

  command.on("error", function (err, stdout, stderr) {
    console.log("Cannot process audio: " + err.message);
    console.log("Sox Command Stdout: ", stdout);
    console.log("Sox Command Stderr: ", stderr);
  });

  command.on("end", function () {
    console.log("Sox command succeeded!");
  });

  command.run();
};

createTracks(leads, drums, keys);
