const puppeteer = require("puppeteer");
const http = require("http");

async function referenceExists(page, url) {
  try {
    await page.goto(url);

    console.log(url);

    const result = await page
      .waitForXPath('//*[@id="app"]/main/header/div/div[1]/div/span', {
        timeout: 3000,
      })
      .then((data) => {
        return true;
      })
      .catch((err) => {
        return false;
      });
    return result;
  } catch (error) {
    return false;
  }
}

//create a server object:
http
  .createServer(async (req, res) => {
    const buffers = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();

    const references = JSON.parse(data).references || [];
    const URL = "https://www.sprintersports.com/buscador?search=";
    const results = [];
    for (const reference of references) {
      results.push({
        reference,
        exists: await referenceExists(page, `${URL}${reference}`),
      });
    }
    console.log(results);
    await browser.close();
    res.end(JSON.stringify(results));
  })
  .listen(NODE_PORT);

console.log("Server listneing on PORT: " + NODE_PORT);
