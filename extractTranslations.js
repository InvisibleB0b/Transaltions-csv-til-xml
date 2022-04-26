const fs = require("fs");

let xmlFile = "";

try {
    console.log('Reading translations from xml...');
    xmlFile = fs.readFileSync("Translations.xml", { encoding: 'utf-8' });
    console.log('Translations are loaded');
} catch (error) {
    console.log('No Translationsfile Found Remember to insert existing translations file to update all translations');
}

const xmlContent = xmlFile.toString();

const reg = /<key [^>]+>(\n|[^\n](?!<\/key>))+/gm;

console.log('Reading all keys...');
const matchedKeys = xmlContent.match(reg);

console.log('Generating translations objects from existing file');
const existingTranslations = matchedKeys?.reduce((acc, curr) => {
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
}, []);

const languages = existingTranslations.reduce((acc, curr) => {
    const currKeys = Object.keys(curr);
    currKeys.forEach((ke) => {
        const containsKey = acc.some(lang => lang == ke);
        if (!containsKey) {
            acc.push(ke);
        }
    });
    return acc;
}, []);

console.log('Headers:\n', languages);

const mappedTranslations = existingTranslations.map((translation) => {

    let csvLine = '';

    languages.forEach((ele, index, arr) => {
        csvLine += `${translation[ele].toString("utf8") ?? ''}${(index != arr.length - 1 ? ';' : '')}`;
    });

    return csvLine;
});

const csvString = [languages.join(";"), ...mappedTranslations].join("\r\n");

console.log('Saveing as csv file');
fs.writeFileSync('extractedTranslations.csv', '\uFEFF' + csvString, { encoding: "UTF-8" });

console.log("---------DONE---------");
console.log(`${mappedTranslations.length} translations extracted \nWith ${languages.length} headers`);
console.log("---------DONE---------");