
// Reading the file using default
// fs npm package
const fs = require("fs");
csv = fs.readFileSync("CSV_file.csv")

let xmlFile = fs.readFileSync("Translations.xml");

//REMOVE:
console.log('xmlFile', xmlFile);


// Convert the data to String and
// split it in an array
var array = csv.toString().split("\r\n");

// All the rows of the CSV will be
// converted to JSON objects which
// will be added to result in an array
let result = [];

// The array[0] contains all the
// header columns so we store them
// in headers array
// and remove invisible char's
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

result = array;

const resultArray = array.reduce((accu, current) => {
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


let json = JSON.stringify(result);
fs.writeFileSync('output.json', json);
fs.writeFileSync('newTranslations.xml', resultArray)