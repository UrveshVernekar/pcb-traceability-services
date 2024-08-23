const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const moment = require('moment');

require('dotenv').config();

exports.init = async () => {
    try {
        const rawDirectory = '../ICT_DATA/ICT_RAW';
        const processedDirectory = '../ICT_DATA/ICT_PROCESSED';
        const files = await fs.readdir(rawDirectory);
        
        const filesToMigrate = files.filter(fileName => {
            let dateString = fileName.split('_').pop();
            dateString = dateString.slice(0, 8);
            if (dateString) {
                const fileDate = moment(dateString, 'YYYYMMDD');
                const targetDate = moment('2024-04-24', 'YYYY-MM-DD');
                return fileDate.isAfter(targetDate);
            }
            return false;
        });

        const chunkSize = 10;

        for (let i = 0; i < filesToMigrate.length; i += chunkSize) {
            const chunk = filesToMigrate.slice(i, i + chunkSize);
            const formData = new FormData();

            for (const fileName of chunk) {
                const filePath = path.join(rawDirectory, fileName);
                const fileContent = await fs.readFile(filePath);
                formData.append('files', fileContent, {
                    filename: fileName,
                    contentType: 'application/octet-stream',
                });
            }

            try {
                await axios.post('http://10.0.7.150:3003/api/vendor/ever/ict-data-migration', formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                });

                // Move files to processed directory after successful posting
                for (const fileName of chunk) {
                    const sourceFilePath = path.join(rawDirectory, fileName);
                    const destinationFilePath = path.join(processedDirectory, fileName);
                    await fs.rename(sourceFilePath, destinationFilePath);
                }
            } catch (err) {
                console.error(`Error posting files ${chunk.join(', ')}:`, err);
            }
        }

        console.log('Finished posting and moving files.');
    } catch (err) {
        console.error('Error reading directory or posting files:', err);
    }
};
