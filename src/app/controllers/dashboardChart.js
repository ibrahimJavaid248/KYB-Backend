const Model = require('../database/models')



const integrationStatus = [
"Issues in the source",
// "Duplicate Source",
"To Do",
"In Process",
"Under Testing",
"Reverted by QA - Not Live",
"Ready to push live",
"Live but keys missing",
"Done (Live)",
// "Pending"
]

LiveArray=['Done (Live)','Live but keys missing']
PendingArray = ["Duplicate Source","To Do","In Process","Under Testing","Reverted by QA - Not Live","Pending","Ready to push live",]
issueArray = ['Issues in the source']


const dashBoardChart =  async (req,res)=>{
    try {
        const totalCount = await getTotalSources();
        const portalCount = await getCountByValue('datatype', 'Portal'); 
        const dumpCount = await getCountByValue('datatype', 'Dump'); 
        const integrationStatusCount = await getCountByValuesWithArray('integration_status', integrationStatus); 
        const LiveportalCounts = await getCountsByTypeAndIntegration('Portal', true);
        const LivedumpCounts = await getCountsByTypeAndIntegration('Dump', true);
        const portalLiveCount = await getCountByIntegrationStatus('Portal', true, LiveArray);
        const portalPendingCount = await getCountByIntegrationStatus('Portal', true, PendingArray);
        const portalIssueCount = await getCountByIntegrationStatus('Portal', true, issueArray);
        const dumpLiveCount = await getCountByIntegrationStatus('Dump', true, LiveArray);
        const dumpPendingCount = await getCountByIntegrationStatus('Dump', true, PendingArray);
        const dumpIssueCount = await getCountByIntegrationStatus('Dump', true, issueArray);
        
          const customResponse = {
            TotalSource : totalCount,
            TotalPortal : portalCount,
            TotalDump :  dumpCount,
            integrationStatusList:integrationStatusCount,           
            required:LiveportalCounts.total,  //total portals where integration == true
            live:dumpLiveCount+portalLiveCount,    // total live dum+portals
            PortalLiveSource:{
                totalPortal : LiveportalCounts.portal,      // total portals with integration true
                Live: portalLiveCount,
                Pending:portalPendingCount,
                Issued:portalIssueCount
            },
            DumpLiveSource:{
                totalDump : LivedumpCounts.dump,           //total dump with integration true
                Live: dumpLiveCount,
                Pending:dumpPendingCount,
                Issued:dumpIssueCount
            }
          }


        return res.json({
            customResponse
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
}

async function getTotalSources(){
    try {
        const count = await Model.Source_data.count({});
        return count;
      } catch (error) {
        console.error(error);
        throw error;
      }
}
async function getCountByValue(columnName, columnValue) {
    try {
      const count = await Model.Source_data.count({
        where: {
          [columnName]: columnValue
        }
      });
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
async function getCountByValuesWithArray(columnName, columnValues) {
    try {
      const counts = await Model.Source_data.findAll({
        attributes: [columnName, [Model.sequelize.fn('COUNT', columnName), 'count']],
        where: {
          [columnName]: {
            [Model.Sequelize.Op.in]: columnValues
          }
        },
        group: [columnName]
      });

      const result = columnValues.map(value => {
        const matchingCount = counts.find(item => item.get(columnName) === value);
        const count = matchingCount ? matchingCount.get('count') : 0;
        return { label : value, value: count };
      });

        return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
async function getCountsByTypeAndIntegration(datatype, integrations) {
    try {
      const totalCount = await Model.Source_data.count({
        where: {
          integrations
        }
      });
  
      const specificTypeCount = await Model.Source_data.count({
        where: {
          datatype,
          integrations
        }
      });
  
      return {
        total: totalCount,
        [datatype.toLowerCase()]: specificTypeCount
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  const getCountByIntegrationStatus = async (datatype, integration, integrationStatusArray) => {
    try {
      const count = await Model.Source_data.count({
        where: {
          datatype: datatype,
          integrations: integration,
          [Model.Sequelize.Op.or]: integrationStatusArray.map(status => ({
            integration_status: status
          }))
        }
      });
      return count;
    } catch (error) {
      console.error('Error fetching count by integration status:', error);
      throw error;
    }
  };


module.exports = {dashBoardChart}