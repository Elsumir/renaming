const fs = require('fs');
const path = require('path');
const myPath = path.join(__dirname);
const searchText = /\[SW.BAND\] /g; // Если что пропиши рукой, то что ищешь
let arr;
let dirs = [];

const getFiles = function (dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (var i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      dirs.push(name);

      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return (arr = files_);
};

getFiles(myPath);

async function renamingDirs() {
  dirs.forEach((e) => {
    fs.rename(e, e.replace(searchText, ''), (err) => {
      if (err) throw err;
      console.log('Папка успешно переименована');
    });
  });

  getFiles(myPath);
}

async function renamingFiles() {
  arr.forEach((e) => {
    fs.rename(e, e.replace(searchText, ''), (err) => {
      if (err) throw err;
      console.log('Файл успешно переименован');
    });
  });
}

async function queue() {
  await renamingDirs();
  await renamingFiles();
}

queue();
