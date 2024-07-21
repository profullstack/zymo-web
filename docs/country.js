import fs from 'fs';
import path from 'path';
import { parse } from 'fast-csv';

const csvFilePath = 'input.csv'; // CSV file path
const jsonFilePath = 'country.json'; // Existing JSON file path

const readJsonFile = async (filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
};

const addPhoneCodesToJSON = async () => {
  try {
    const jsonData = await readJsonFile(jsonFilePath); // Load the existing JSON data

    fs.createReadStream(csvFilePath)
      .pipe(parse({ headers: true }))
      .on('data', (row) => {
        // Find the corresponding JSON object by matching the "code" field
        const existingData = jsonData.find((item) => item.code.toLowerCase() === row.ISO2.toLowerCase());

        if (existingData) {
          // Add the "Phone Code" from the CSV to the existing JSON object
          existingData['telephonePrefix'] = row['Phone Code'];
          existingData['timezone'] = row['Time Zone in Capital'];
          existingData['currency'] = row['Currency'];
          existingData['iso3'] = row['ISO3'];

        }
      })
      .on('end', () => {
        // Write the updated JSON data back to the file
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        console.log('Phone Codes have been added to the JSON data.');
      });
  } catch (error) {
    console.error('Error:', error);
  }
};

// Call the function to add phone codes to the JSON
addPhoneCodesToJSON();

