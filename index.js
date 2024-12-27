const express = require("express");
const app = express();
const cheerio = require("cheerio");
const axios = require("axios");

app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send("hello worldworld");
});

app.get("/data-scrapper", async (req, res) => {
  const { id } = req.query;
  try {
    const data = await cryptopriceScraper(id);
    return res.status(200).json({
      result: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/script", async (req, res) => {
  const { id } = req.query;
  try {
    const data = await getScipt(id);
    const flip = JSON.parse(data);
    const last = flip["props"]["pageProps"]["contentData"]["categories"];

    return res.status(200).json(last);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(5000, () => {
  console.log("====================================");
  console.log("server listening on port 5000");
  console.log("====================================");
});

async function getScipt(id) {
  let thing;
  const url = `https://www.imdb.com/name/${id}/awards/`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  };

  await axios(url, { headers }).then((res) => {
    const html_data = res.data;
    const $ = cheerio.load(html_data);
    thing = $("script#__NEXT_DATA__").text();
  });
  return thing;
}
async function cryptopriceScraper(id) {
  const url = `https://www.imdb.com/name/${id}/awards/`;
  let result = [];
  const thing = [];
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  };
  await axios(url, { headers }).then((response) => {
    const html_data = response.data;
    const $ = cheerio.load(html_data);

    $("section.ipc-page-section.ipc-page-section--base").each(
      (index, element) => {
        console.log(index);
        console.log("====================================");
        const title = $(element).find("a > h3").text();
        result = [];
        $(element)
          .find("ul > li")
          .each((indi, elem) => {
            const link = $(elem).find("div > img").attr("src");
            const yearFull = $(elem).find("div > a").text();
            const year = yearFull.slice(0, 5).trim();
            const status = yearFull.includes("Nominee")
              ? "Nominated"
              : "Winner";
            const genre = $(elem).find("div ul li span").text();
            const film = $(elem).find("div ul li a").text();
            const id = $(elem).find("div ul li a").attr("href");
            if (year !== "" && genre !== "" && film !== "") {
              result.push({ link, year, status, genre, film, id });
            }
          });
        thing.push({ title, result });
      }
    );
  });
  return thing;
}
