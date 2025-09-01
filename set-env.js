const fs = require('fs');

const targetPath = './src/app/environments.prod.ts';

const envConfigFile = `
export const environment = {
      production: true,
      testing: false,
      API_URL: '${process.env.API_URL}'
};
`;

// Write the new file
fs.writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log(`Successfully generated environment.prod.ts`);
    }
});