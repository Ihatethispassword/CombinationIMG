//npm install canvas

// Настройки программы

// Для корректной работы программы, необходимо привести название файла с изображением к следующему формату: [Имя]-[вероятность выпадения обязательно в формате[000]].png 
// Пример: Hat1-025.png. Вероятность попадания картинки Hat1 составляет 25%, а Hat1 будет названием аксессуара, записанным в метаданные 
// Вероятности в одной папке должны давать в сумме 100, иначе возможна некоректная работа рандома
// Формат файлов изображений должен быть .png

const width = 500; // Установка ширины картинок
const height = 500; // Установка высоты картинок
// Для коректного отображения, необходимо указать точный размер картинок в пикселях

const Link = "https://www.dropbox.com/s/vnzq6jjmggppxsb/";


const mode = "BruteForce"; // Тут устанавливается режим генерации. "BruteForce" - перебор вариантов. "CountMode" - создание заданного колличества
// В режиме перебора вариантов происходит отрисовка всех возможных комбинаций, с учетом того, что какой-либо аксессуар может отсутствовать
// Ниже, в PermFolderArray можно указать арты из каких папок не получают возможность не появиться при генерации 

const CountImage = 3; // Тут указывается кол-во итоговых артов (сколько нужно сгенерировать). Так же влияет на кол-во артов в BruteForce
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

var PermFolderArray = [ // Тут прописываются пути к папкам с разными аксессуарами, которые в массовой прорисовке должны 100% присутствовать.
  // Путь копируеться из предыдущей папки
  "./Background/",
  "./Body/",
]

// Конец настроек программы

const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { Console } = require("console");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
var ImageArray = [];
var CountArray = [];

var OutputImageArray = [];

var MetadataArray = [];
var AttributesArray = [];

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
        Type: path.slice(2, -1),
        fileName: i,
        fullname: path + i
      };
    });
};

const AddMetadata = (Name, ListMetaDate = MetadataArray, ListAttributs = AttributesArray) => {
  let buf = {
    name: Name,
    //description: "",
    iamge: Link + Name + ".png",
    attributes: ListAttributs,
  };
  ListMetaDate.push(buf);
  AttributesArray = [];
};

const AddAttributes = (image, ListAttributs = AttributesArray) => {
  let buf = {
    trait_type: image.Type,
    value: image.Name,
  };
  ListAttributs.push(buf);
};

const GetMetadate = () => {
  return MetadataArray;
}

const GetItem = (Array) => {

  let RandomNumber = getRandomInt(100);
  var TableIndex = 0;

  var TableFind = [];
  for (let i = 0; i < Array.length; i++) {
    for (var j = 0; j < parseInt(Array[i].Rarity, 10); j++) {
      var x = Array[i];
      TableFind.push(x);
      TableIndex++;
    }
  }
  return TableFind[RandomNumber];
}

const SortArrayByRarity = (Array) => {
  var buf = Array;

  buf.sort(function (a, b) {
    if (parseInt(a.Rarity, 10) > parseInt(b.Rarity, 10)) {
      return 1;
    }
    if (parseInt(a.Rarity, 10) < parseInt(b.Rarity, 10)) {
      return -1;
    }
    return 0;
  });

  return buf;
}

function Shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


const SaveIMG = (bufcanvs, filename) => {
  fs.writeFileSync("./Result/" + filename + ".png", bufcanvs.toBuffer("image/png"));
  fs.writeFileSync("./Result/" + filename + "_MetaDate.json", JSON.stringify(MetadataArray[0]));
}

const LoadImage = () => {

  for (let i = 0; i < FolderArray.length; i++) {
    let buf = getElements(FolderArray[i]);
    ImageArray.push(SortArrayByRarity(buf));
  }

  if (mode == "BruteForce") {
    var bbb = 1;
    for (let i = 0; i < ImageArray.length; i++) {
      if (CheckPermState(i)) bbb *= ImageArray[i].length;
      else bbb *= ImageArray[i].length + 1;
    }

    for (let i = 0; i < bbb; i++) {
      CountArray.push(i);
    }

    Shuffle(CountArray);
  }

}

const draw = async (filename) => {

  for (let i = 0; i < FolderArray.length; i++) {
    var bufIMG = GetItem(ImageArray[i]);
    if (bufIMG != undefined) {
      ctx.drawImage(await loadImage(bufIMG.fullname), 0, 0, width, height);
      AddAttributes(bufIMG);
    }
  }

  AddMetadata(filename);

  SaveIMG(canvas, filename);

  MetadataArray = [];

  console.log("Изображение: " + filename + " успешно созданно!");
  ctx.clearRect(0, 0, width, height);
}

const MassDraw = async (Count) => {

  for (let i = 0; i < Count; i++) {
    await draw(OutputFileName + i);
  }
  console.log("Генерация успешно завершена!");
}

const CheckPermState = (id) => {
  for (let i = 0; i < PermFolderArray.length; i++) {
    if (FolderArray[id] == PermFolderArray[i]) return true;
  }
  return false;
}

const CrateCode = async () => {
  var StringArrayBegin = "async function BruteForce(ImageArray, CountArray, OutputImageArray) {\n";
  var StringArray = "";
  var StringArrayEnd = "";

  StringArrayBegin += "var AppCode = require(\"./app.js\");\n";

  StringArrayBegin += "var IndexNumber = 0;\n";
  StringArrayBegin += "var BufOutput = [];\n";

  /*StringArrayBegin += "const fs = require(\"fs\");\n";
  StringArrayBegin += "const { createCanvas, loadImage } = require(\"canvas\");\n";
  StringArrayBegin += "const canvas = createCanvas(width, height);\n";
  StringArrayBegin += "const ctx = canvas.getContext(\"2d\");\n"*/

  for (let i = 0; i < ImageArray.length; i++) {
    if (CheckPermState(i)) StringArrayBegin += ("for (var l" + i + " = 0; l" + i + "  < ImageArray[" + i + "].length; l" + i + " ++) {\n");
    else StringArrayBegin += ("for (var l" + i + " = 0; l" + i + "  < ImageArray[" + i + "].length + 1; l" + i + " ++) {\n");

    StringArray += "if (ImageArray[" + i + "][l" + i + "] != undefined) {\n";
    StringArray += "BufOutput.push(ImageArray[" + i + "][l" + i + "]);\n";
    StringArray += "}\n";

    StringArrayEnd += ("} //End for ImageArray[" + i + "]\n");
  }

  StringArray += "OutputImageArray.push(BufOutput);\n";
  StringArray += "BufOutput = [];\n";

  StringArray += "IndexNumber++;";

  StringArrayEnd += "}\n";
  StringArrayEnd += "module.exports.BruteForce = BruteForce;\n";


  fs.writeFileSync("_BruteForceCode.js", "");
  fs.appendFileSync("_BruteForceCode.js", (StringArrayBegin + StringArray + StringArrayEnd));

}

async function CreateImageFromArray(){
  for (let i = 0; i < CountImage; i++) {
    for (let j = 0; j < OutputImageArray[i].length; j++) {
      var bufIMG = OutputImageArray[i][j];
      ctx.drawImage(await loadImage(bufIMG.fullname), 0, 0, width, height);
      AddAttributes(bufIMG);
    }
  
    AddMetadata(OutputFileName + i);
    SaveIMG(canvas, OutputFileName + i);
    MetadataArray = [];
    ctx.clearRect(0, 0, width, height);
    console.log("Изображение: " + OutputFileName + i + " успешно созданно!");
  }
}

module.exports.AddMetadata = AddMetadata;
module.exports.AddAttributes = AddAttributes;
module.exports.GetMetadate = GetMetadate;

LoadImage();

if (mode == "CountMode") MassDraw(CountImage);
else {
  CrateCode();
  var BFCode = require("./_BruteForceCode.js");
  BFCode.BruteForce(ImageArray, CountArray, OutputImageArray);
  Shuffle(OutputImageArray);
  CreateImageFromArray();
}



