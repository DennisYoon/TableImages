function intToExcelCol(num) {
  let colName = "";
  while (num > 0) {
    let modulo = (num - 1) % 26;
    colName = String.fromCharCode(65 + modulo) + colName;
    num = Math.floor((num - modulo) / 26);
  }
  return colName;
}

const express = require("express");
const Jimp = require("jimp");
const cors = require("cors");
const xlsx = require("xlsx-color");
const {v4} = require("uuid");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({limit: "50mb"})); 
app.use(express.urlencoded( {limit: "50mb", extended : true } ));

fs.createReadStream(__dirname + "/download");

app.post("/tableImage", async (req, res) => {
  console.log("req");
  const tableImageBody = req.body.tableImage;
  const toRemove = tableImageBody.substring(tableImageBody.indexOf("data"), tableImageBody.indexOf("base64,") + 7);
  console.log(toRemove);
  const tableImage = req.body.tableImage.replace(toRemove, "");
  const imageSize = Math.abs(parseInt(req.body.imageSize)) || 1;
  const imageName = v4();

  await Jimp.read(Buffer.from(tableImage, "base64"))
    .then(image => {
      const wb = xlsx.utils.book_new();
      
      const sheets = {
        "Sheet": Array(image.bitmap.height / imageSize).fill(
          Array(image.bitmap.width / imageSize).fill("")
        )
      };

      for (let sheet of Object.keys(sheets)) {
        xlsx.utils.book_append_sheet(
          wb,
          xlsx.utils.aoa_to_sheet(sheets[sheet]),
          sheet
        );
      }

        const ws = wb.Sheets["Sheet"];
        ws['!cols'] = Array(image.bitmap.width / imageSize).fill({wch: 0.8});
        ws['!rows'] = Array(image.bitmap.height / imageSize).fill({hpt: 5});

      for (let h = 1; h <= image.bitmap.height / imageSize; h++) {
        for (let w = 1; w <= image.bitmap.width / imageSize; w++) {
          const colorNum = image.getPixelColor(w * imageSize, h * imageSize);
          const colorRgba = Jimp.intToRGBA(colorNum);
          const colorRgb = Object.values(colorRgba).filter((_, i) => i <= 2);
          const colorHex = colorRgb.map(v => v.toString(16)).join("");

          const cell = intToExcelCol(w) + h;

          wb.Sheets["Sheet"][cell].s = {
            fill: {
              patternType: "solid",
              fgColor: { rgb: colorHex }
            }
          };
        }
      }

      console.log("created");
      xlsx.writeFile(wb, "download/" + imageName + ".xlsx");
    })
    .catch(err => {
      console.error(err);
    });
  
  res.download(__dirname + "/download/" + imageName + ".xlsx", (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.unlink(__dirname + "/download/" + imageName + ".xlsx", (err) => {
        if (err)
          console.error(err);
      });
    }
  });

  return res.status(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("running");
});