require('dotenv').config()
const axios = require('axios');
var pool = require("../connections/connectionLocal");

/**
 * @author Urvesh
 * @param {MySQL query} query
 * @date 24-04-2024
 * @returns Part Details for migration
 */
const executeQuery1 = async (query) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (error, connection) {
            if (error) {
                console.log("\n" + error);
            }
            connection.changeUser({
                database: process.env.DB1_NAME_LOCAL
            })
            connection.query(query, (error, (error, elements) => {
                if (error) {
                    connection.release();
                    console.log("\n" + query);
                    console.log("\n" + error);
                } else {
                    connection.release();
                    return resolve(elements);
                }
            }));
        });
    });
};

exports.init = async () => {
    const query1 = "SELECT * FROM vendor.part_production WHERE migration_status = 0";
    try {
        const partDetails = await executeQuery1(query1);

        for (entry of partDetails) {
            entry.vendor_code = process.env.VENDOR_CODE;
            entry.vendor_name = process.env.VENDOR_NAME;
        }

        const chunkSize = 100;

        // Split partDetails into chunks
        const chunks = [];
        for (let i = 0; i < partDetails.length; i += chunkSize) {
            chunks.push(partDetails.slice(i, i + chunkSize));
        }

        // Send each chunk separately
        for (const chunk of chunks) {
            await axios.post('http://115.111.194.182:3003/api/vendor/production-migration', {
            // await axios.post('http://127.0.0.1:3003/api/vendor/production-migration', {
                migrationData: chunk
            });
        }

        // Update migration_status for processed records
        for (const record of partDetails) {
            let query2 = "UPDATE `vendor`.`part_production` SET `migration_status` = '1' WHERE (`id` = '" + record.id + "');";
            await executeQuery1(query2);
        }

        console.log('DATA MIGRATION SERVICE FINISHED');
        return partDetails;
    } catch (error) {
        console.error("Error", error);
        throw error;
    }
}
