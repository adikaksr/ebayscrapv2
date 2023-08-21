const { JSDOM } = require("jsdom");
const { writeFile } = require("fs");

const saveCSV = (dict, path) => {
  console.log("Saving data...");
  writeFile(path, dict, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("CSV file has been written.");
    }
  });
};
const getDOM = async (url, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok (Status: ${response.status}).`
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    clearTimeout(timeoutId); // Clear the timeout since the request succeeded
    return document;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Connection Timeout Error:", error.message);
    } else {
      console.error("Error occurred:", error.message, url);
    }
    return undefined;
  }
};
const findLinks = async (url) => {
  try {
    const document = await getDOM(url);
    let links = [];
    for (let link of document.querySelectorAll(".s-item__link")) {
      let href = link.getAttribute("href");
      if (href.startsWith("https://ebay.com")) continue;
      let title = link
        .querySelector(".s-item__title")
        .querySelector("span").textContent;
      let item = {
        link: href,
        title: title,
      };
      links[links.length] = item;
    }
    return links;
  } catch (error) {
    return [];
  }
};
const getDetails = async (url) => {
  try {
    const document = await getDOM(url);
    const price =
      document
        .querySelector(".x-bin-price__content")
        .querySelector(".x-price-primary")
        .querySelector("span")
        .textContent.split("$")[1] || "0";
    const img = document
      .querySelector(".ux-image-carousel-item.active.image")
      .querySelector("img")
      .getAttribute("src");

    const shipping = document
      .querySelector(".ux-labels-values__values-content")
      .querySelector("div")
      .querySelector(".ux-textspans.ux-textspans--BOLD")
      .textContent.split("$")[1];
    const quantity = document
      .querySelector(".d-quantity__availability")
      .querySelector(".ux-textspans").textContent;

    const descIfr = document.querySelector("#desc_ifr").getAttribute("src");

    //   calculate total price
    const total = ((parseFloat(price) + parseFloat(shipping)) * 2).toFixed(2);

    const data = {
      price: parseFloat(price),
      shipping: parseFloat(shipping),
      total: total,
      quantity: quantity,
      desc: descIfr,
      img: img,
    };
    return data;
  } catch (error) {
    return {
      price: 0,
      shipping: 0,
      total: 0,
      quantity: 0,
      desc: "",
      img: "",
    };
  }
};
const main = async (filename, url) => {
  const links = await findLinks(url);

  for (let data of links) {
    console.log("Crawling: ", data.title);
    const detail = await getDetails(data.link);
    const { price, shipping, total, quantity, desc, img } = detail;
    data["price"] = price;
    data["shipping"] = shipping;
    data["total"] = total;
    data["quantity"] = quantity;
    data["desc"] = desc;
    data["img"] = img;
  }
  const csvContent = links
    .map((entry) => Object.values(entry).join(";"))
    .join("\n");
  saveCSV(csvContent, `result/${filename}`);
  return JSON.stringify({
    message: "success",
    fileLocation: `result/${filename}`,
    filename: filename,
  });
};

module.exports = {
  main,
};
