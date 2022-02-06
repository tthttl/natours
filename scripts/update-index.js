const fs = require('fs');
const fsPromises = fs.promises;

async function update() {
    try {
        const fileHandle = await fsPromises.open('wwwroot/index.html', 'r+');
        const file = await fileHandle.readFile('utf8');
        const updatedFile = file.replace('<link rel="stylesheet" href="css/icon-fonts.css" />', '');
        const writer = await fsPromises.open('wwwroot/index.html', 'w');
        await writer.writeFile(updatedFile);
    } catch (e) {
        console.log("Error", e);
    }
}

update();