const queue = require('bull')
const redisConfig = require("../config/redisCredentials.js")
const xlsx = require('xlsx')

// console.log("im runinf")


// const urlTable = require("../database-backup/models/urlData.js")

// const entryTable = require("../database/models/EntryCountTable.js");
// const countryTable = require('../database/models/countryData.js');
// const sourceData = require('../database/models/sourceDataTable.js')
// const countryRegionData = require('../database/models/countryRegionData.js')
// const sourceDataTable = require('../database-backup/models/source-data.js')

const Model = require("../database/models");

// const Country_Url = require('../database/models/country-source-url.js')

// const entryTable = require('../database-backup/models/source-url-country-relation.js')
// const {SourceUrl} = require('../database-backup/models/source-url.js')

// const {Country} = require('../database-backup/models/country.js')

const getColumnIndex = (worksheet, columnName) => {
 
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = xlsx.utils.encode_cell({ r: range.s.r , c: col });
    const cellValue = worksheet[cellAddress].v;

    if (cellValue === columnName) {
      return col;
    }
  }

  throw new Error(`Column '${columnName}' not found in the worksheet.`);
};

const sheetDump = new queue('sheetdump' ,  {
    redis:{
        port: redisConfig.REDIS_PORT,
        host : redisConfig.REDIS_URI
    }
})








async function readAndInsertData() {
  try{
      console.log("im in ")
     let workbook = xlsx.readFile('/var/www/html/production/kyb_backoffice/backend/Consolidated-KYB 2.0.xlsx');
     let sheetName = workbook.SheetNames[0];
     let worksheet = workbook.Sheets[sheetName];
     let range = xlsx.utils.decode_range(worksheet['!ref']);

    // console.log("im in")
 
    
     // console.log(workbook)
 
     // const rowNumber = 1; // Assuming the column names are in the first row
 
     const countryName = 'Country'; // Replace with the desired column name
   
     const countryIndex = getColumnIndex(worksheet, countryName);

     const stateName = 'State'; // Replace with the desired column name
   
     const stateIndex = getColumnIndex(worksheet, stateName);
 
 
     const uuid = 'UID'; // Replace with the desired column name
     const uuidIndex = getColumnIndex(worksheet, uuid);
 
     const authority = 'Authority Name'; // Replace with the desired column name
     const authorityIndex = getColumnIndex(worksheet, authority);
 
     const url = 'URL'; // Replace with the desired column name
     const urlIndex= getColumnIndex(worksheet, 'URL');
     const Region= getColumnIndex(worksheet, 'Region');
     // const gdpindex= getColumnIndex(worksheet, 'GDP');
     const SourceType= getColumnIndex(worksheet, 'Source Type');
     const Coverage= getColumnIndex(worksheet, 'Coverage');
     const DataType= getColumnIndex(worksheet, 'Data Type');
 
     const Format= getColumnIndex(worksheet, 'Format');
     const Cost= getColumnIndex(worksheet, 'Cost');
     const Language= getColumnIndex(worksheet, 'Language');
     const PortalRange= getColumnIndex(worksheet, 'Portal Range');
     const ContainsUBOs= getColumnIndex(worksheet, 'Contains UBOs');
     const Comments= getColumnIndex(worksheet, 'Comments');
     const Keys= getColumnIndex(worksheet, 'Keys');
     const MappingIssues= getColumnIndex(worksheet, 'Mapping Issues');
     const IntegrationStatus= getColumnIndex(worksheet, 'Integration Status');
     const ClickUpTask= getColumnIndex(worksheet, 'ClickUp Task');
     const TechComments= getColumnIndex(worksheet, 'Tech Comments');
     const Integration= getColumnIndex(worksheet, 'Integration');
     const gdbColumn = getColumnIndex(worksheet , 'gdp_amount')
     // console.log("gdb colum" , gdbColumn)
     // return
 
     // let a = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: countryIndex })] || { v: '' };
     // let b = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: uuidIndex })] || { v: '' };
     // let c = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: authorityIndex })] || { v: '' };
     // let d = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: urlIndex })] || { v: '' };
     // let e = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Region })] || { v: '' };
     // let f = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: SourceType })] || { v: '' };
     // let g = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Coverage })] || { v: '' };
     // let h = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: DataType })] || { v: '' };
     // let i = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Format })] || { v: '' };
     // let j = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Cost })] || { v: '' };
     // let k = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Language })] || { v: '' };
     // let l = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: PortalRange })] || { v: '' };
     // let m = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: ContainsUBOs })] || { v: '' };
     // let n = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Comments })] || { v: '' };
     // let o = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Keys })] || { v: '' };
     // let p = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: MappingIssues })] || { v: '' };
     // let q = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: IntegrationStatus })] || { v: '' };
     // let r = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: ClickUpTask })] || { v: '' };
     // let s = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: TechComments })] || { v: '' };
     // let t = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: Integration })] || { v: '' };
     // // let f = worksheet[xlsx.utils.encode_cell({ r: rowNumber, c: gdpindex })] || { v: '' };
     // console.log('Country Column:', a.v);
     // console.log('uuidIndex Column:', b.v);
     // console.log('authorityIndex Column:', c.v);
     // console.log('urlIndex Column:', d.v);
     // console.log('Region Column:', e.v);
     // console.log('SourceType Column:', f.v);
     // console.log('Coverage Column:', g.v);
     // console.log('DataType Column:', h.v);
     // console.log('Format Column:', i.v);
     // console.log('Cost Column:', j.v);
     // console.log('Language Column:', k.v);
     // console.log('PortalRange Column:', l.v);
     // console.log('ContainsUBOs Column:', m.v);
     // console.log('Comments Column:', n.v);
     // console.log('Keys Column:', o.v);
     // console.log('MappingIssues Column:', p.v);
     // console.log('IntegrationStatus Column:', q.v);
     // console.log('ClickUpTask Column:', r.v);
     // console.log('TechComments Column:', s.v);
     // console.log('Integration Column:', t.v);
     // console.log('Country Column:', f.v);
   //  return 
     let data = [];
   
     for (let row = range.s.r + 1; row <= range.e.r; row++) {
       
 
       // let uuidColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 'uuid' })]|| { v: '' };;
       // let authorityNameColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 1 })]|| { v: '' };;
       // let urlColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 2 })] || { v: '' };;
       // let countryColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 3 })] || { v: '' };;
       // let regionColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 4 })] || { v: '' };;
       // let GDPColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 5 })] || { v: 0.0 };;
       // let sourcetypeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 6 })] || { v: '' };;
       // let coverageColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 7 })] || { v: '' };;
       // let datatypeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 8 })] || { v: '' };;
       // let formatColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 9 })] || { v: '' };;
       // let costColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 10 })] || { v: '' };;
       // let languageColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 11 })] || { v: '' };;
       // let portalRangeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 12 })] || { v: '' };;
       // let containubosColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 13 })] || { v: '' };;
       // let commentColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 14 })] || { v: '' };;
       // let keysColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 15 })] || { v: '' };;
       // let mappingIssueColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 16 })] || { v: '' };;
       // let integrationStatusColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 17 })] || { v: '' };;
       // let clickupTaskColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 18 })] || { v: "www.clickup.com" };;
       // let techCommentColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 19 })] || { v: '' };;
       // let integrationColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: 20 })] || { v: '' };;
 // console.log("hi")
       let countryColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: countryIndex })] || { v: '' };
       let stateColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: stateIndex })] || { v: '' };
     let uuidColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: uuidIndex })] || { v: '' };
     let authorityNameColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: authorityIndex })] || { v: '' };
     let urlColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: urlIndex })] || { v: '' };
     let regionColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Region })] || { v: '' };
     let sourcetypeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: SourceType })] || { v: '' };
     let coverageColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Coverage })] || { v: '' };
     let datatypeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: DataType })] || { v: '' };
     let formatColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Format })] || { v: '' };
     let costColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Cost })] || { v: '' };
     let languageColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Language })] || { v: '' };
     let portalRangeColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: PortalRange })] || { v: '' };
     let containubosColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: ContainsUBOs })] || { v: '' };
     let commentColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Comments })] || { v: '' };
     let keysColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Keys })] || { v: '' };
     let mappingIssueColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: MappingIssues })] || { v: '' };
     let integrationStatusColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: IntegrationStatus })] || { v: '' };
     let clickupTaskColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: ClickUpTask })] || { v: 'https://clickup.com/' };
     let techCommentColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: TechComments })] || { v: '' };
     let integrationColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: Integration })] || { v: 'False' };
     let gdpAmountColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: gdbColumn })] || { v: 0.0 };
       
   // console.log(urlColumn.v, "l", row)
         let uuid = uuidColumn.v;
         let authorityName = authorityNameColumn.v;
         let country = countryColumn.v.replace(/\s+$/, '');
         let state = stateColumn.v
         let url = urlColumn.v;
         let region_name = regionColumn.v;
         let GDP = gdpAmountColumn.v;
         let format = formatColumn.v;
         let cost = costColumn.v;
         let language = languageColumn.v;
         let portal_range = portalRangeColumn.v;
         let contains_UBOs = containubosColumn.v;
         let keys = keysColumn.v;
         let mapping_issues = mappingIssueColumn.v;
         let integration_status = integrationStatusColumn.v;
         let clickup_task = clickupTaskColumn.v;
         let tech_comments = techCommentColumn.v;
         let integrations = integrationColumn.v;
         let datatype = datatypeColumn.v;
         let coverage = coverageColumn.v;
         let sourceType = sourcetypeColumn.v;
         let formattedcomment = commentColumn.v;
         let comment = formattedcomment;
 
       data.push({ uuid,authorityName, country , url , region_name , format , cost , 
         language , portal_range , contains_UBOs , keys , mapping_issues , integration_status,
         clickup_task , tech_comments , integrations ,
         datatype , coverage , sourceType , comment , GDP , state});
     }
     console.log(data[1294])
   await insertUniqueURL(data)
    await insertOrUpdateRecords(data);
   await checkUrlAndCountriesAndInsertIntoEntryTable(data)

  }
  catch(err)
  {
    console.log(err)
  }
   
//   }
//  insertUniqueURL(data)
// checkUrlAndCountriesAndInsertIntoEntryTable(data)
}
  
// async function insertDataIntoDatabase(data) {
//     try {
//         const insertedData = await testTable.bulkCreate(data);
    
//         console.log('Data inserted successfully:', insertedData.map(data => data.toJSON()));
//       } catch (error) {
//         console.error('Error inserting data:', error);
//       }

// }

// async function insertOrUpdateRecords(records) {
//     for (const record of records) {
//       const { name, country, type } = record;
//       const existingRecord = await testTable.findOne({ where: { type } });
  
//       if (existingRecord) {
//         // Update existing record's associateCountries
//         existingRecord.associateCountries = existingRecord.associateCountries || [];
//         existingRecord.associateCountries.push(country);
  
//         // Save the updated record
//         await existingRecord.save();
//       } else {
//         // Insert a new record
//         await testTable.create({
//           name,
//           country,
//           type,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });
//       }
//     }
//   }

async function insertOrUpdateRecords(records) {
  try{
    for (const record of records) {
      const { authorityName, country , url , region_name , format , cost , 
        language , portal_range , contains_UBOs , keys , mapping_issues , integration_status,
        clickup_task , tech_comments , integrations , comment,
        datatype , coverage , sourceType  , GDP ,state} = record;
        console.log(record);
      const existingRecord = await Model.Source_data.findOne({ where: { url } });

      const countryRegion = await Model.Countries.findOne({ where: { region_name: region_name } });
      // console.log("id of url is" , urlRecord.id)

      if (!countryRegion) {
        console.log(`country '${record.country}' not found in the country Table. Skipping entry.`);
        continue;
      }

      const region_id = countryRegion.region_id;
      console.log("region id is" ,  region_id)

      const urlRecord = await Model.Source_url.findOne({ where: { url: url } });
      // console.log("id of url is" , urlRecord.id)

      if (!urlRecord) {
        console.log(`url  '${urlRecord}' not found in the urlTable. Skipping entry.`);
        continue;
      }

      const urlID = urlRecord.id;

    // const urlID = 1;
    // const regionID = 1;
  
      if (existingRecord) {
        // Update existing record's associateCountries
        existingRecord.associateCountries = existingRecord.associateCountries || [];
        // existingRecord.associateCountries = [...existingRecord.associateCountries, country];
        // await existingRecord.save();
        if(existingRecord.associateCountries.includes(country) && country==country ){
          console.log("This is a repeated country ", country)
          const repeated = await Model.Countries.findOne({
            where: { country_name: country }
          });
           console.log(repeated, "repeated country");
           
          if (repeated) {
            console.log("im'jh")
            await Model.Countries.update(
              { countryDup: Model.sequelize.literal('"countryDup" + 1') },
              { where: { country_name: country } }
            );
            console.log('Country duplicated count incremented successfully.');
            // continue;
          }
        }
        else{
          existingRecord.associateCountries = [...existingRecord.associateCountries, country];
          await existingRecord.save();
        }
        
        // Save the updated record
        console.log(`Updated record for type '${url}': ${JSON.stringify(existingRecord)}`);
      }
      
      
      else {
        // Insert a new record
        const newRecord = await Model.Source_data.create({
            authorityName, country , url , urlID, region_name ,GDP, format , cost ,region_id,
            language , portal_range , contains_UBOs , keys , mapping_issues , integration_status,
            clickup_task , tech_comments , integrations ,
            datatype , coverage , sourceType, comment, state,
            associateCountries : [country],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Inserted new record: ${JSON.stringify(newRecord)}`);
      }
    }

  }
  catch(err)
  {
    console.log(err)
  }
    
  }
const countriesWithDiffrentName = []
  async function checkUrlAndCountriesAndInsertIntoEntryTable(records) {
    for (const record of records) {
      try {
        const { country, url  , state} = record;
  
        // Step 1: Retrieve the country ID from the countryTable
        const countryRecord = await Model.Countries.findOne({ where: { country_name: country } });
  
        if (!countryRecord) {
          //console.log(`Country '${country}' not found in the countryTable. Skipping entry.`);
          countriesWithDiffrentName.push(country)
          continue;
        }

        const uniqueRecordsSet = new Set();

        for (let record of countriesWithDiffrentName) {
          uniqueRecordsSet.add(record);
        }
        
        // Convert Set back to an array (if needed)
        const uniqueRecordsArray = [...uniqueRecordsSet];
        
        // Log unique records
        for (let record of uniqueRecordsArray) {
          console.log(record);
        }
        
  
       const countryId = countryRecord.id ;
  
        // Step 2: Retrieve the URL ID from the urlTable
        const urlRecord = await Model.Source_url.findOne({ where: { url: url } });
        // console.log("id of url is" , urlRecord.id)
  
        if (!urlRecord) {
          console.log(`URL '${url}' not found in the urlTable. Skipping entry.`);
          continue;
        }
  
        const urlId = urlRecord.id ;


        // if (!state) {
        //   console.log(`State information is missing for country '${country_name}'. Skipping entry.`);
        //   continue;
        // }
  
        // Step 3: Retrieve the state ID from the stateTable
        const stateRecord = await Model.States.findOne({ where: { state_name: state } });

        let stateID;

        if (!stateRecord) {
            console.log(`State '${state}' not found in the stateTable. Creating entry with empty stateID.`);
           
            stateID = null; // Retrieve the generated stateID from the newly created entry
        } else {
            stateID = stateRecord.id
          }
  
        // Step 3: Insert a new entry into the entrycounttable
        // await Model.Linked_urls.findOrCreate({
        //  country_id :  countryId,
        //   url_id : urlId
        // });
        try {
          const existingRecord = await Model.Linked_urls.findOne({
              where: {
                  country_id: countryId,
                  url_id: urlId,
                  state_id: stateID 
              }
          });
      
          if (!existingRecord) {
              const createdRecord = await Model.Linked_urls.create({
                  country_id: countryId,
                  url_id: urlId,
                  state_id: stateID 
              });
              console.log('Record created:', createdRecord);
          } else {
              console.log('Record already exists:', existingRecord);
          }
      } catch (error) {
          console.error('Error:', error);
      }
  
       console.log(`Entry for Country ID: ${countryId}, URL ID: ${urlId} inserted successfully.`);
      } catch (error) {
       // console.error('Error processing record:', error);
      }
    }
  }

  async function insertUniqueURL(payload) {
    try {
      
        for (const record of payload){
            const { url } = record;
      
            
            // Check if the URL already exists
            const existingRecord = await Model.Source_url.findOrCreate({ where: { url } });
            // const allUrlsOnly = await Model.Source_url.findAll({ attributes: ['url'] });

            // console.log("All URLs:", allUrlsOnly.map(record => record.url));
            // if (existingRecord) {
            //     console.log(`URL '${url}' already exists. Skipping insertion.`);
            // } else {
            //     // Insert a new record
            //     await urlTable.create({
            //     ...record,
            //     });
        
            //     console.log(`Record with URL '${url}' inserted successfully.`);
            // }
        }
            
    } catch (error) {
      console.error('Error inserting record:', error);
    }
  }



 sheetDump.add('readAndInsertData')

  sheetDump.process('readAndInsertData', async (job) => {
    await readAndInsertData();
  });


  
//  await readStateSheetData()

// await readConnections()

