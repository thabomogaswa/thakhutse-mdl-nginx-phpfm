var gsjson = require('google-spreadsheet-to-json');
const fs = require("fs");

const myArgs = process.argv.slice(2);
const fileName = 'colegios.json'

const writeStream = fs.createWriteStream(fileName);
const pathName = writeStream.path;

gsjson({
  spreadsheetId: '1SQjFfnTrMeGh281k0fAcDIL5oK_Kc2BR91Upr8kUU0E',
  credentials: './credentials.json',
  worksheet: 'solicitudes'
})
  .then(function (jsonData) {
    const centros = jsonData
      .filter((centro) => centro.estado === 'desplegado' || centro.estado === 'pendiente')
      .map((centro) => {
        console.log(centro)
        const url = centro.estado === 'desplegado' ? `https://${centro.gfp_url_solicitada}.aeducar.es` : ''
        const gestor = `${centro.gfp_nombre_gestor} ${centro.gfp_apellido1_gestor} ${centro.gfp_apellido2_gestor}`
        return { url, name: centro.gfp_centro_y_localidad, cp: centro.gfp_centro_formacion_ref, gestor, gestorEmail: centro.gfp_email_gestor }
      })
    // console.log(`Se han generado un total de ${centros.length} centros`);
    // centros.forEach(centro => writeStream.write(JSON.stringify(centro)));
    centros.sort((a, b) => a.name.localeCompare(b.name))
    writeStream.write(JSON.stringify(centros))

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
