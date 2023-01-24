var gsjson = require('google-spreadsheet-to-json');
const fs = require("fs");


const myArgs = process.argv.slice(2);

switch (myArgs[0]) {
  case '1':
  case '2':
  case '3':
  case '4':
    var fileName = `createCenters_${myArgs[0]}.sh`
    console.log(`Data will be saved to ${fileName}`)
    break;
  default:
    console.log('USAGE: node index.js <número servidor>');
    process.exit();
}

const writeStream = fs.createWriteStream(fileName);
const pathName = writeStream.path;

gsjson({
  spreadsheetId: '1SQjFfnTrMeGh281k0fAcDIL5oK_Kc2BR91Upr8kUU0E',
  credentials: './credentials.json',
  worksheet: 'solicitudes'
})
  .then(function (jsonData) {
    console.log(jsonData)
    const centros = jsonData
      .filter((centro) => centro.estado !== 'desplegado')
      .filter((centro) => !!centro.gfp_url_solicitada)
      .filter((centro) => centro.server == myArgs[0])
      .map((centro) => {
        const url = `https://${centro.gfp_url_solicitada}.aeducar.es`
        const shortName = centro.gfp_centro_y_localidad.substring(0, centro.gfp_centro_y_localidad.indexOf("(") - 1)
        return { url, shortName, longName: centro.gfp_centro_y_localidad, deployType: centro.tipoDespliegue }
      })
    console.log(`Se han generado un total de ${centros.length} centros`);
    centros.forEach(centro => writeStream.write(`createMoodle.sh -l es -n "${centro.longName}" -t "${centro.deployType}" -u "${centro.url}" "${centro.shortName}" \nsleep 4m\n`));

    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {
      console.log(`wrote all the array data to file ${pathName}`);
    });

    // handle the errors on the write process
    writeStream.on('error', (err) => {
      console.error(`There is an error writing the file ${pathName} => ${err}`)
    });

    // close the stream
    writeStream.end();
  })
  .catch(function (err) {
    console.log(err.message);
    console.log(err.stack);
  });
