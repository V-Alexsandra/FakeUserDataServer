const express = require('express');
const faker =  require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

const app = express();

const host = "0.0.0.0";
const port = process.env.PORT || 3001;

let counter = 1;
function introduceErrors(inputString, errorCount) {
    if (errorCount <= 0) {
        return inputString;
    }

    const len = inputString.length;
    const characters = inputString.split('');

    for (let i = 0; i < errorCount; i++) {
        const randomIndex = Math.floor(Math.random() * len);

        const errorType = Math.floor(Math.random() * 3);

        switch (errorType) {
            case 0:
                characters.splice(randomIndex, 1);
                break;
            case 1:
                const randomChar = generateRandomCharacter();
                characters.splice(randomIndex, 0, randomChar);
                break;
            case 2:
                if (randomIndex < len - 1) {
                    [characters[randomIndex], characters[randomIndex + 1]] = [characters[randomIndex + 1], characters[randomIndex]];
                }
                break;
            default:
                break;
        }
    }

    return characters.join('');
}

function generateRandomCharacter() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

const generateFakeData = (region, errorCount, seed) => {
    const number = counter++;
    const randomId = uuidv4();

    faker.setLocale(region);
    faker.seed(seed);

    const fakeName = introduceErrors(faker.name.findName(), errorCount);
    const fakeAddress = introduceErrors(faker.address.streetAddress(), errorCount);
    const fakePhoneNumber = introduceErrors(faker.phone.phoneNumber(), errorCount);


    return {
        number: number,
        id: randomId,
        name: fakeName,
        address: fakeAddress,
        phoneNumber: fakePhoneNumber,
    };
};

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);

    const region = req.url.split('?')[1]?.split('region=')[1];
    const errorCount = parseInt(req.url.split('?')[1]?.split('errorCount=')[1], 10);
    const seed = parseInt(req.url.split('?')[1]?.split('seed=')[1], 10);

    if (region && faker.locales.includes(region) && errorCount && seed) {
        const fakeData = generateFakeData(region, errorCount, seed);
        res.end(JSON.stringify(fakeData));
    } else {
        res.end(JSON.stringify({ error: 'Invalid region, errorCount, seed, or region not specified' }));
    }
};

app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});