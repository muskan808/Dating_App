import fs from "fs";
import Handlebars from "handlebars";
import { env } from "../../env";
import { generatePdf } from "html-pdf-node";
import puppeteer from "puppeteer-core";
import dbConnection from "src/app/providers/db";
import { exec } from 'child_process'
//import puppeteer from 'puppeteer'

export const exportPDF = async (exportData: any, fileName: string) => {
  try {

    const badgeFilePath = env.app.root_dir + `/views/${fileName}`;

    console.log("=====>", env.app.root_dir + `/views/export/${fileName}`);
    const source = fs.readFileSync(
      badgeFilePath,
      "utf8"
    );

    // exec(`chmod 777 ${badgeFilePath}`, (err, out, stdErr) => {
    //   if (err) {
    //     throw {
    //       message: "Something went wrong on while giving permission",
    //       error: stdErr
    //     }
    //   }
    // })

    const template = Handlebars.compile(source);
    const templateHBS = await template(exportData);

    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disabled-setupid-sandbox"],
    });
    const page = await browser.newPage();

    // Set the viewport to match B6 size (in pixels)
    // await page.setViewport({
    //     width: 500, // Example width for B6 in pixels
    //     height: 707, // Example height for B6 in pixels
    //     deviceScaleFactor: 2, // Adjust as needed
    // });

    //
    await page.setContent(templateHBS);
    const badgePDFFile = fileName.slice(0, -4) + '.pdf';
    const pdfBuffer = await page.pdf({
      //format: "a4", // Puppeteer needs a default format, but we set the viewport above
      printBackground: true,
      path: badgePDFFile,
      height: 707,
      width: 500,

    });

    exec(`sudo chmod 777 ${badgePDFFile}`, (err, out, stdErr) => {
      if (err) {
        console.log(stdErr)
        throw {
          message: "Something went wrong on while giving permission",
          error: stdErr
        }
      }
    })

    await browser.close();
    console.log(pdfBuffer);

    return pdfBuffer;
  } catch (error) {
    console.log(error, "==pdf generate====>error");

    return null
  }
};
