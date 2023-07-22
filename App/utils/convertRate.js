// ------------------------------ Rate Converter Api -------------------------------
var fetch  = require("node-fetch");
// const axios = require("axios");

module.exports.convertRate = async (amount, from, to) => {
//   let myHeaders = new Headers();
//   myHeaders.append("apikey", "UhgB9kWqnHoYUw5UE38gONfac8B9CO73");
  
  const head = {
    apiKey: "UhgB9kWqnHoYUw5UE38gONfac8B9CO73",
  };

  var requestOptions = {
    method: "GET",
    redirect: "follow",
    headers: head,
  };

  let data = await fetch(
    `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amount}`,
    {
        headers: head
    }
  ).then((response) => response.json());

  return data.result;
};
