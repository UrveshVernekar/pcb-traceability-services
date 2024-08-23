require('dotenv').config()
const express = require('express');
const schedule = require('node-schedule');
const fs = require('fs');

const app = express();
const port = 5000;

// MODULE IMPORTS
const dataMigration = require('./modules/traceability/dataMigration');
const everICT = require('./modules/traceability/everICT')

app.listen(process.env.API_PORT_LOCAL, () => {
    console.log(`Service Worker running on port ${port}`);
});

// Preocess to Migrate Part Production data
const dataMigrationProcess = async () => {
    try {
        await dataMigration.init();
    } catch (error) {
        console.log('Error', error);
    }
}

const everICTDataProcess = async () => {
    try {
        await everICT.init();
    } catch (error) {
        console.log('Error', error);
    }
}

/**
 * @author Urvesh Vernekar
 * @date 2024-04-24
 * @updated 2024-08-23
 * @use To Migrate Ever Part Production data
 */
// schedule.scheduleJob("30 15 12 * * *", function () {
schedule.scheduleJob('*/15 * * * *', function () {
    console.log('DATA MIGRATION SERVICE RUNNING');
    dataMigrationProcess();
});

/**
 * @author Urvesh Vernekar
 * @date 2024-04-24
 * @update
 * @use To migrate ICT files
 */
schedule.scheduleJob("35 16 15 * * *", function () {
    console.log('PROCESSING EVER ICT DATA');
    everICTDataProcess();
});