
// Reading the file using default
// fs npm package
const fs = require("fs");
csv = fs.readFileSync("CSV_file.csv")

let xmlFile = "";

try {
    console.log('Reading translations from xml...');
    xmlFile = fs.readFileSync("Translations.xml");
    console.log('Translations are loaded');
} catch (error) {
    console.log('No Translationsfile Found Remember to insert existing translations file to update all translations');
}

const xmlContent = xmlFile.toString();

const reg = /<key [^>]+>(\n|[^\n](?!<\/key>))+/gm;

console.log('Reading all keys...');
const matchedKeys = xmlContent.match(reg);

console.log('Generating translations from existing ones');
let existingTranslations = matchedKeys?.reduce((acc, curr) => {
    let translation = {
        Key: /name=\"([^\"]+)/gm.exec(curr)[1],
        Default: (/DefaultValue=\"([^\"]+)/gm.exec(curr) != null ? /DefaultValue=\"([^\"]+)/gm.exec(curr)[1] : /name=\"([^\"]+)/gm.exec(curr)[1])
    };

    curr = curr.replace(/\r|\n/g, '');
    let allTranslationsStart = curr.match(/<translation[^>]+>/g);

    allTranslationsStart.forEach((current) => {

        const translationIndex = curr.indexOf(current);

        const endTranslationIndex = curr.indexOf('</translation>', translationIndex);

        const entireTranslationTag = curr.substring(translationIndex, endTranslationIndex + 14);

        const theCulture = /culture=\"([^\"]+)/gm.exec(current)[1];

        const theTranslatedValue = /\<\!\[CDATA\[([^\]]*)\]\]>/gm.exec(entireTranslationTag);

        translation[theCulture] = theTranslatedValue != null ? theTranslatedValue[1] : "";

    });

    acc.push(translation);
    return acc;
}, [])


var array = csv.toString().replace(/\"/gm, '').split("\r\n");

console.log('Generating translations from csv file');
const headers = array[0].split(";").map((el) => el.replace(/^\uFEFF/gm, ""));
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

console.log('Comparing translations and updateing... skipped if no exsiting translations are present');
let translationsToUpdate = array.filter((csvTranslation) => existingTranslations?.some(xmlTranslation => xmlTranslation.Key == csvTranslation.Key));

let translationsToAdd = array.filter((csvTranslation) => !existingTranslations?.some(xmlTranslation => xmlTranslation.Key == csvTranslation.Key));

translationsToUpdate.forEach((updatedTranslation) => {

    const translationIndexInExisting = existingTranslations.findIndex((xmlTranslation) => xmlTranslation.Key == updatedTranslation.Key);

    existingTranslations[translationIndexInExisting] = updatedTranslation;
});

let combinedTranslations = [...existingTranslations ?? new Array, ...translationsToAdd];


// generating the translations xml
let resultArray = `<?xml version="1.0" encoding="utf-8"?>
<translations>
`
console.log('Converting to xml');
resultArray += combinedTranslations.reduce((accu, current) => {
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

console.log('Saveing as xml file');
fs.writeFileSync('newTranslations.xml', resultArray);

console.log("---------DONE---------");
console.log(`${translationsToUpdate.length} translations updated \n${translationsToAdd.length} translations added \n${xmlFile != "" ? existingTranslations.length - translationsToUpdate.length + " translations retained" : ""}`);