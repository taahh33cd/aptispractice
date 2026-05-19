const fs = require('fs');
const path = require('path');

const weeks = [1, 2, 3, 4];
const data = {};

weeks.forEach(w => {
  try {
    const roadmapPath = path.join(__dirname, `week${w}_roadmap.json`);
    const vocabPath = path.join(__dirname, `week${w}_vocab.json`);
    const exercisesPath = path.join(__dirname, `week${w}_exercises.json`);

    data[w] = {
      roadmap: fs.existsSync(roadmapPath) ? JSON.parse(fs.readFileSync(roadmapPath, 'utf8')) : null,
      vocab: fs.existsSync(vocabPath) ? JSON.parse(fs.readFileSync(vocabPath, 'utf8')) : null,
      exercises: fs.existsSync(exercisesPath) ? JSON.parse(fs.readFileSync(exercisesPath, 'utf8')) : null
    };
    console.log(`Loaded data for week ${w}`);
  } catch (err) {
    console.error(`Error loading data for week ${w}:`, err.message);
  }
});

const output = `const aptisData = ${JSON.stringify(data, null, 2)};`;
fs.writeFileSync(path.join(__dirname, 'data.js'), output);
console.log('Successfully bundled data into data.js');
