const queue = require('bull')
const redisConfig = require("../config/redisCredentials.js")
const xlsx = require('xlsx')
const Model = require("../database/models");

const { date, func } = require('joi');


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

const stateRecord = new queue('stateRecord' ,  {
    redis:{
        port: redisConfig.REDIS_PORT,
        host : redisConfig.REDIS_URI
    }
  })
  
  const connectionRecord = new queue('connectionRecord' ,  {
    redis:{
        port: redisConfig.REDIS_PORT,
        host : redisConfig.REDIS_URI
    }
  })
  


async function readConnections(){
    try{
      let workbook = xlsx.readFile('connections_1.xlsx');
       let sheetName = workbook.SheetNames[0];
       let worksheet = workbook.Sheets[sheetName];
       let range = xlsx.utils.decode_range(worksheet['!ref']);
  
       const stateName = 'State'; // Replace with the desired column name
     
       const stateIndex = getColumnIndex(worksheet, stateName);
       const countryIndex = getColumnIndex(worksheet, 'Country');
  
       console.log(stateIndex)
  
       let connectionSheetData = [];
     
       for (let row = range.s.r + 1; row <= range.e.r; row++) {
  
        let stateColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: stateIndex })] || { v: '' };
        let countryColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: countryIndex })] || { v: '' };
  
        let state_name = stateColumn.v;
        let country_name = countryColumn.v
  
        connectionSheetData.push({state_name , country_name})
       }
  
       console.log(connectionSheetData)
       await updateStateSheetWithConnection(connectionSheetData)
    
  
  
  
    }
    catch(err)
    {
      console.log(err)
    }
  }
  



async function readStateSheetData() {
    try{
  
      
      let workbook = xlsx.readFile('states_1.xlsx');
       let sheetName = workbook.SheetNames[0];
       let worksheet = workbook.Sheets[sheetName];
       let range = xlsx.utils.decode_range(worksheet['!ref']);
  
       const stateName = 'State'; // Replace with the desired column name
     
       const stateIndex = getColumnIndex(worksheet, stateName);
  
       console.log(stateIndex)
  
       let sheetData = [];
     
       for (let row = range.s.r + 1; row <= range.e.r; row++) {
  
        let stateColumn = worksheet[xlsx.utils.encode_cell({ r: row, c: stateIndex })] || { v: '' };
  
        let state_name = stateColumn.v;
  
        sheetData.push({state_name})
       }
  
       console.log(sheetData)
       await insertStates(sheetData)
  
    }
    catch(err)
    {
      console.log(err)
    }
  }



async function insertStates(payload) {
    try {
      
        for (const record of payload){
            const { state_name } = record;

            if (state_name !== '')
            {
              const existingRecord = await Model.States.findOrCreate({ where: { state_name } });
            }
            else{
              console.log("empty state")
              break;
            }
      
            
        
           
        }
            
    } catch (error) {
      console.error('Error inserting record:', error);
    }
  }


  async function updateStateSheetWithConnection(payload) {
  
    for (const record of payload) {
      try {
        const { state_name, country_name } = record;

        // console.log(record)
        // return
  
        // Step 1: Retrieve the country ID from the countryTable
        const countryRecord = await Model.Countries.findOne({ where: { country_name: country_name } });
  
        if (!countryRecord) {
          console.log(`State '${country_name}' not found in the stateTable. Skipping entry.`);
         continue;
        }

       
  
        const countryId = countryRecord.id;
  
        // Step 2: Skip the record if state_name is empty
        if (!state_name) {
          console.log(`State information is missing for country '${country_name}'. Skipping entry.`);
          continue;
        }
  
        // Step 3: Retrieve the state ID from the stateTable
        const stateRecord = await Model.States.findOne({ where: { state_name: state_name } });
  
        if (!stateRecord) {
          console.log(`State '${state_name}' not found in the stateTable. Skipping entry.`);
         
         continue
        }
  
        const stateID = stateRecord.id;
  
        // Step 4: Update the state table with the country ID
        await Model.States.update(
          { country_id: countryId },
          { where: { id: stateID } }
        );
  
        console.log(`Entry for Country ID: ${countryId}, State ID: ${stateID} updated successfully.`);
      } catch (error) {
        console.error('Error processing record:', error);
      }
    }
  }






stateRecord.add('readStateSheetData')

  stateRecord.process('readStateSheetData', async (job) => {
    await readStateSheetData();

  });

  connectionRecord.add('readConnections')

  connectionRecord.process('readConnections', async (job) => {
    await readConnections()
    
  });