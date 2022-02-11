
// Reading the file using default
// fs npm package
const fs = require("fs");
csv = fs.readFileSync("CSV_file.csv")

const xmlFile = fs.readFileSync("Translations.xml");

const xmlContent = xmlFile.toString();

const reg = /<key [^>]+>(\n|[^\n](?!<\/key>))+/gm;

const matchedKeys = xmlContent.match(reg);

//REMOVE:
console.log('matchedKeys', matchedKeys[0].toString());


let existingTranslations = matchedKeys.reduce((acc, curr) => {
    let translation = {
        Key: /name=\"([^\"]+)/gm.exec(curr)[1],
        Default: /DefaultValue=\"([^\"]+)/gm.exec(curr)[1]
    };

    curr = curr.replace(/\r|\n/g, '');
    let allTranslationsStart = curr.match(/<translation[^>]+>/g);

    acc.push(translation);
    return acc;
}, [])

//REMOVE:
// console.log('ex', existingTranslations[0]);



// Convert the data to String and
// split it in an array
var array = csv.toString().split("\r\n");

const headers = array[0].split(";").map((el) => el.replace(/^\uFEFF/gm, ""));
//remove headers and empty rows
array.shift();
array = array.filter(el => el != '');

array = array.reduce((accu, current) => {
    let obj = {};

    const splittedRow = current.split(';');

    for (let index = 0; index < splittedRow.length; index++) {
        obj[headers[index]] = splittedRow[index];
    }

    accu.push(obj);
    return accu;

}, []);

let resultArray = `<?xml version="1.0" encoding="utf-8"?>
<translations>
`

resultArray += array.reduce((accu, current) => {
    const keys = Object.keys(current).filter(el => el != 'Key' && el != 'Default');

    const insertedXML = `<key name="${current.Key}" DefaultValue="${current.Default}">
        ${keys.reduce((acc, ke) => {
        return acc += `<translation culture="${ke}"><![CDATA[${current[ke]}]]></translation>
        `;
    }, '')}
    </key>
  `;
    return accu += insertedXML;
}, '');

resultArray += '</translations>';

fs.writeFileSync('newTranslations.xml', resultArray)