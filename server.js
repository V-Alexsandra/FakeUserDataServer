const express = require('express');
const { fakerDE, en } = require('@faker-js/faker');
const { fakerEN } = require('@faker-js/faker');
const { fakerPL } = require('@faker-js/faker');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();

app.use(cors({ origin: '*' }));

const port = process.env.PORT || 3001;

let counter = 1;

function introduceErrors(inputString, errorCount) {
    if (errorCount <= 0) {
        return inputString;
    }

    const len = inputString.length;
    let result = inputString;

    for (let i = 0; i < errorCount; i++) {
        const randomIndex = Math.floor(Math.random() * len);
        const errorType = Math.floor(Math.random() * 3);

        switch (errorType) {
            case 0:
                result = result.slice(0, randomIndex) + result.slice(randomIndex + 1);
                break;
            case 1:
                const randomChar = generateRandomCharacter();
                result = result.slice(0, randomIndex) + randomChar + result.slice(randomIndex);
                break;
            case 2:
                if (randomIndex < len - 1) {
                    const chars = result.split('');
                    [chars[randomIndex], chars[randomIndex + 1]] = [chars[randomIndex + 1], chars[randomIndex]];
                    result = chars.join('');
                }
                break;
            default:
                break;
        }
    }

    return result;
}

function generateRandomCharacter() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters.charAt(randomIndex);
}

const generateFakeData = (errorCount, combinedSeed, locale) => {
    const number = counter++;

    let selectedFaker;
    
    switch (locale) {
        case 'de':
            selectedFaker = fakerDE;
            break;
        case 'en':
            selectedFaker = fakerEN;
            break;
        case 'pl':
            selectedFaker = fakerPL;
            break;
        default:
            selectedFaker = fakerEN;
    }

    selectedFaker.seed(combinedSeed);

    const name = selectedFaker.person.fullName();
    const address = selectedFaker.location.streetAddress();
    const phoneNumber = selectedFaker.phone.imei();

    return {
        number: number,
        id: uuidv4(),
        name: introduceErrors(name, errorCount),
        address: introduceErrors(address, errorCount),
        phoneNumber: introduceErrors(phoneNumber, errorCount),
    };
};

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
  
    const params = new URLSearchParams(req.url.split('?')[1]);
    const errorCount = parseFloat(params.get('errorCount') || 0);
  
    const seed = parseInt(params.get('seed'), 10);
    const page = parseInt(params.get('page'), 10) || 1;
    
    const combinedSeed = seed + page;
    const locale = params.get('region');
  
    const fakeData = generateFakeData(errorCount, combinedSeed, locale);
    res.end(JSON.stringify(fakeData));
  };  

const itemsPerPage = 20;
const maxPages = 100;

app.get('/generateFakeData', (req, res) => {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const errorCount = parseInt(params.get('errorCount'), 10);
    const page = parseInt(params.get('page'), 10);

    const seed = parseInt(params.get('seed'), 10);

    if (page >= 1 && page <= maxPages) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const locale = params.get('region');

        const fakeData = [];
        for (let i = startIndex; i < endIndex; i++) {
            const combinedSeed = seed + page + i;
            const item = generateFakeData(errorCount, combinedSeed, locale);

            item.number = i+1;

            fakeData.push(item);
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(fakeData);
    } else {
        res.status(400).json({ error: "Invalid page number" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});