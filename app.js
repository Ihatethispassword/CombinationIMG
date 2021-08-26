//npm install canvas

// Настройки программы

// Для корректной работы программы, необходимо привести название файла с изображением к следующему формату: [Имя]-[вероятность выпадения обязательно в формате[000]].png 
// Пример: Hat1-025.png. Вероятность попадания картинки Hat1 составляет 25%, а Hat1 будет названием аксессуара, записанным в метаданные 
// Вероятности в одной папке должны давать в сумме 100, иначе возможна некоректная работа рандома
// Формат файлов изображений должен быть .png

const width = 500; // Установка ширины картинок
const height = 500; // Установка высоты картинок
// Для коректного отображения, необходимо указать точный размер картинок в пикселях

const CountImage = 5; // Тут указывается кол-во итоговых артов (сколько нужно сгенерировать)
const OutputFileName = "image"; // Название файла изображения полученного на выходе. К нему автоматически добавляется порядковый номер

var FolderArray = [ // Тут прописываются пути к папкам с разными аксессуарами. Прорисовка проходит сверху вниз. Картининки из первой строчки рисуются первыми
  // Добавление картинок полностью автоматическое, необходимо лишь создать папку и указать ее название ниже, вместе со спц символами в начале и в конце.
  // Например: "./[Имя папки]/". Также важно поставить запятую после закрывающей кавычки
  "./Background/",
  "./Body/",
  "./Hats/",
  "./Chest/",
  "./Weapon/",
]

// Конец настроек программы

const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { Console } = require("console");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
var Metadate = [];
var ImageArray = [];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

const getElements = (path) => { 
    return fs
      .readdirSync(path)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .map((i, index) => {
        return {
          Name: i.slice(0, -8),
          Rarity: i.slice(-7, -4),
          fileName: i,
          fullname: path + i
        };
      });
};

const AddToMetaDate = (image) => {
  Metadate.push(image.Name);
  Metadate.push(image.Rarity);
}

const GetItem = (Array) => {

  let RandomNumber = getRandomInt(100);

  var TableFind = [];
  var TableIndex = 0;
  if (Array.length == 1) return Array[0];
  else 
  for (let i = 0; i < Array.length; i++) {
    for (var j = 0; j < parseInt(Array[i].Rarity,10); j++) {
      var x = Array[i];
      TableFind.push(x);
      TableIndex++;
    }
  }
  return TableFind[RandomNumber];
}

const SortArrayByRarity = (Array) =>{
  var buf = Array;

  buf.sort(function (a, b) {
    if (parseInt(a.Rarity,10) > parseInt(b.Rarity,10))
    {
      return 1;
    }
    if (parseInt(a.Rarity,10) < parseInt(b.Rarity,10)) {
      return -1;
    }
    return 0;
  });

  return buf;
}

const SaveIMG = (bufcanvs, filename) => {
    fs.writeFileSync("./Result/" + filename + ".png", bufcanvs.toBuffer("image/png"));
    fs.writeFileSync("./Result/" + filename + "_MetaDate.json", JSON.stringify(Metadate));
}

const LoadImage = () =>{

  for (let i= 0; i < FolderArray.length; i++)
  {
    let buf = getElements(FolderArray[i]);
    ImageArray.push(SortArrayByRarity(buf));
  }
}

const draw = async (filename) => {

  for (let i = 0; i < FolderArray.length; i++)
  {
    var bufIMG = GetItem(ImageArray[i]);
    if (bufIMG != undefined) {
      ctx.drawImage(await loadImage(bufIMG.fullname), 0, 0, width, height);
      AddToMetaDate(await bufIMG);
    }
  }
  
  SaveIMG(canvas, filename);

  Metadate = [];
  ctx.clearRect(0, 0, width, height);
}

const MassDraw = async (Count) => {

  for (let i = 0; i < Count; i++)
  {
    await draw(OutputFileName + " " + i);
  }
}

LoadImage();
MassDraw(CountImage);
