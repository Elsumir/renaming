const fs = require('fs');
const path = require('path');
const myPath = path.join(__dirname);
const searchText = /\[SW.BAND\] ?/g; // Исправлено: добавлен необязательный пробел после скобки

// Массивы для хранения путей
let files = [];
let dirs = [];

// Рекурсивная функция для сбора всех файлов и папок
function collectFilesAndDirs(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          dirs.push(fullPath);
          collectFilesAndDirs(fullPath); // Рекурсивный вызов для подпапок
        } else {
          files.push(fullPath);
        }
      } catch (err) {
        console.error(`Ошибка при обработке ${fullPath}:`, err.message);
      }
    }
  } catch (err) {
    console.error(`Ошибка при чтении директории ${dir}:`, err.message);
  }
}

// Функция переименования с использованием промисов
function rename(oldPath) {
  return new Promise((resolve, reject) => {
    // Получаем директорию и имя файла
    const dirName = path.dirname(oldPath);
    const baseName = path.basename(oldPath);
    
    // Проверяем, содержит ли имя нужный текст
    if (!baseName.includes('[SW.BAND]')) {
      return resolve({ path: oldPath, renamed: false });
    }
    
    // Создаем новое имя
    const newBaseName = baseName.replace(searchText, '');
    const newPath = path.join(dirName, newBaseName);
    
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(`Ошибка при переименовании ${oldPath}:`, err.message);
        return reject(err);
      }
      resolve({ path: newPath, renamed: true });
    });
  });
}

// Основная функция
async function main() {
  console.log('Начинаем сканирование файлов и папок...');
  collectFilesAndDirs(myPath);
  
  console.log(`Найдено ${dirs.length} папок и ${files.length} файлов`);
  
  // Сортируем директории от самых глубоких к корневым
  dirs.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
  
  // Сначала переименовываем файлы
  console.log('Переименовываем файлы...');
  let renamedFiles = 0;
  
  for (const file of files) {
    try {
      const result = await rename(file);
      if (result.renamed) {
        renamedFiles++;
        console.log(`Файл переименован: ${path.basename(file)} -> ${path.basename(result.path)}`);
      }
    } catch (err) {
      // Ошибки уже обрабатываются в функции rename
    }
  }
  
  // Затем переименовываем папки (начиная с самых глубоких)
  console.log('Переименовываем папки...');
  let renamedDirs = 0;
  
  for (const dir of dirs) {
    try {
      const result = await rename(dir);
      if (result.renamed) {
        renamedDirs++;
        console.log(`Папка переименована: ${path.basename(dir)} -> ${path.basename(result.path)}`);
      }
    } catch (err) {
      // Ошибки уже обрабатываются в функции rename
    }
  }
  
  console.log(`Обработка завершена! Переименовано ${renamedFiles} файлов и ${renamedDirs} папок.`);
}

// Запускаем основную функцию
main().catch(err => {
  console.error('Произошла критическая ошибка:', err);
});
