# Transaltions-csv-til-xml

in order to run this Dynamicweb translations adder.

You need the following.

### 1. node.js installed.
### 2. A csv file named CSV_file.csv in the same directory as the index.js file.
### 3. The csv needs to contain the following headers Key, Default, ... any cultures in the following format en-GB || da-DK or any other culture format for Dynamicweb.
| Key              | Default        | en-GB         | da-DK         | ... |
| -----------------| ---------------| --------------| ------------- | --- |
| `CartPayment.Alt`| `Kortbetaling` | `CartPayment` | `Kortbetaling`| ... |
...
### or as a raw file look like this
```
Key;Default;en-GB;da-DK
1;1;one;en
2;2;two;to
3;3;three;tre
4;4;four;fire
```
### 4. (Optional) An XML file named Translations.xml in the same directory as the index.js file ( the current translations file from Dynamicweb administration ).
### 5. Run the following command in the console, from the repo's directory.

```
node index.js
```
### 6. wait for the program to run, the file will then be outputted in a new xml file called newTranslations.xml in the same directory.