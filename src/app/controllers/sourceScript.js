// const { SourceList } = require("../database-backup/models/source-listing.js");
const reader = require("xlsx");
const { regionQueue } = require("../queues/region-excel.js");
const { countryQueue } = require("../queues/country-excel.js");
const {languageQueue} = require("../queues/language-excel.js")
const {sourceTypeQueue} = require("../queues/source-type-excel.js")

function readRegion(filepath) {
  const file = reader.readFile(filepath);
  const sheets = file.SheetNames;
  console.log(sheets);

  for (let i = 0; i < sheets.length; i++) {
    console.log("Loop");
    const sheetData = reader.utils.sheet_to_json(
      file.Sheets[file.SheetNames[i]]
    );
    sheetData.forEach((row) => {
      const regionName = row["Region"] !== undefined ? row["Region"]: null;
      // const total = row["Total"];
      // const cost = row["Cost"]!== undefined ? row["Cost"].toLowerCase() :null;
      // const sourceType =row["Source type"]!==undefined ? row["Source type"].toLowerCase() : null;
      console.log(regionName);

      regionQueue.add({
        regionName,
        // total,
        // cost,
        // sourceType,
      });
    });
  }
}


function readCountry(filepath) {
  const file = reader.readFile(filepath);
  const sheets = file.SheetNames;
  console.log(sheets);

  for (let i = 0; i < sheets.length; i++) {
    const sheetData = reader.utils.sheet_to_json(
      file.Sheets[file.SheetNames[i]]
    );
    sheetData.forEach((row) => {
      const country = row["Country"];
      const region = row["Region"] !== undefined ? row["Region"] : null
      const gdp = row["GDP Year"];
      const gdp_us_millions = row["GDP (US$ Millions)"];

      countryQueue.add({
        country, region, gdp, gdp_us_millions
      });
    });
  }
}



function readLanguage(filepath) {
  const file = reader.readFile(filepath);
  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const sheetName = sheets[i];
    const sheetData = file.Sheets[sheetName];

    let isFirstRow =true;

    // If you want to iterate over all cells in the sheet
    for (const cell in sheetData) {
      if (isFirstRow) {
        isFirstRow = false;
        continue;
      }

      // Skip the cell with the !ref key
      if (cell === '!ref') {
        continue;

      }
      const language = sheetData[cell]?.v;

      console.log(`Value at ${cell} in ${sheetName}: ${language}`);

      languageQueue.add({
        language
      });
    }
  }
}

function readSourceType(filepath) {
  const file = reader.readFile(filepath);
  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const sheetName = sheets[i];
    const sheetData = file.Sheets[sheetName];

    let isFirstRow =true;

    // If you want to iterate over all cells in the sheet
    for (const cell in sheetData) {
      if (isFirstRow) {
        isFirstRow = false;
        continue;
      }

      // Skip the cell with the !ref key
      if (cell === '!ref') {
        continue;

      }
      const sourceType = sheetData[cell]?.v;

      console.log(`Value at ${cell} in ${sheetName}: ${sourceType}`);

      sourceTypeQueue.add({
        sourceType
      });
    }
  }
}


// const filepath1 = "/root/kyb_backoffice/regions.xls";
// const filepath2 ="/root/kyb_backoffice/countries.xlsx";
// const filepath3 ="root/kyb_backoffice/lang.xlsx"
// const filepath4 = "/root/kyb_backoffice/source_type.xlsx"

const filepath1 ="/var/www/html/production/kyb_backoffice/backend/regions_1.xlsx";
const filepath2 ="/var/www/html/production/kyb_backoffice/backend/countries_1.xlsx";
const filepath3 ="/var/www/html/production/kyb_backoffice/backend/lang.xlsx";
const filepath4 ="/var/www/html/production/kyb_backoffice/backend/source_type.xlsx";






readRegion(filepath1)
readCountry(filepath2);
readLanguage(filepath3)

readSourceType(filepath4)