const express = require('express');
const Chance = require('chance');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const chance = new Chance();

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

const generateFakeData = (errorCount) => {
    const number = counter++;

    const name = chance.name();
    const address = chance.address();
    const phoneNumber = chance.phone();

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
    const errorCount = parseInt(params.get('errorCount'), 10);

    const fakeData = generateFakeData(errorCount);
    res.end(JSON.stringify(fakeData));
};

app.get('/generateFakeData', requestListener);

app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});