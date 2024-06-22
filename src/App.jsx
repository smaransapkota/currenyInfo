import React, { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css"; // Import custom CSS file for styling
import "@lottiefiles/lottie-player";

function App() {
  const [allData, setAllData] = useState([]);
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [activeData, setActiveData] = useState({});
  const [publishedOn, setPublishedOn] = useState("");
  const [modifiedOn, setModifiedOn] = useState("");
  const [amount, setAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(null);

  function extractRateDetails(rates) {
    const dates = [];
    const buyPrices = [];
    const sellPrices = [];
    if (rates) {
      rates.forEach((rate) => {
        dates.push(rate.date);
        buyPrices.push(rate.buy);
        sellPrices.push(rate.sell);
      });
    }

    return { dates, buyPrices, sellPrices };
  }

  const extra = {
    currency_symbols: {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      CHF: "CHF",
      AUD: "A$",
      CAD: "C$",
      SGD: "S$",
      JPY: "¥",
      CNY: "¥",
      SAR: "ر.س",
      QAR: "ر.ق",
      THB: "฿",
      AED: "د.إ",
      MYR: "RM",
      KRW: "₩",
      SEK: "kr",
      DKK: "kr",
      HKD: "HK$",
      KWD: "د.ك",
      BHD: "د.ب",
    },
    currency_flags: {
      INR: "https://www.countryflags.com/wp-content/uploads/india-flag-png-large.png",
      USD: "https://www.countryflags.com/wp-content/uploads/united-states-of-america-flag-png-large.png",
      EUR: "https://www.countryflags.com/wp-content/uploads/europe-flag-jpg-xl.jpg",
      GBP: "https://www.countryflags.com/wp-content/uploads/united-kingdom-flag-png-large.png",
      CHF: "https://www.countryflags.com/wp-content/uploads/switzerland-flag-png-large.png",
      AUD: "https://www.countryflags.com/wp-content/uploads/flag-jpg-xl-9-2048x1024.jpg",
      CAD: "https://www.countryflags.com/wp-content/uploads/canada-flag-png-large.png",
      SGD: "https://www.countryflags.com/wp-content/uploads/singapore-flag-png-large.png",
      JPY: "https://www.countryflags.com/wp-content/uploads/japan-flag-png-large.png",
      CNY: "https://www.countryflags.com/wp-content/uploads/china-flag-png-large.png",
      SAR: "https://www.countryflags.com/wp-content/uploads/saudi-arabia-flag-png-large.png",
      QAR: "https://www.countryflags.com/wp-content/uploads/qatar-flag-png-large.png",
      THB: "https://www.countryflags.com/wp-content/uploads/thailand-flag-png-large.png",
      AED: "https://www.countryflags.com/wp-content/uploads/united-arab-emirates-flag-png-large.png",
      MYR: "https://www.countryflags.com/wp-content/uploads/malaysia-flag-png-large.png",
      KRW: "https://www.countryflags.com/wp-content/uploads/south-korea-flag-png-large.png",
      SEK: "https://www.countryflags.com/wp-content/uploads/sweden-flag-png-large.png",
      DKK: "https://www.countryflags.com/wp-content/uploads/denmark-flag-png-large.png",
      HKD: "https://www.countryflags.com/wp-content/uploads/hongkong-flag-jpg-xl.jpg",
      KWD: "https://www.countryflags.com/wp-content/uploads/kuwait-flag-png-large.png",
      BHD: "https://www.countryflags.com/wp-content/uploads/flag-jpg-xl-13-2048x1229.jpg",
    },
  };

  useEffect(() => {
    setLoading(true);
    const params = {
      from: fromDate || moment().subtract(10, "days").format("YYYY-MM-DD"),
      to: toDate || moment().format("YYYY-MM-DD"),
      page: 1,
      per_page: 100,
    };
    let props = "";
    for (const key in params) {
      if (Object.hasOwnProperty.call(params, key)) {
        const element = params[key];
        props += `${key}=${element}&`;
      }
    }
    const url = `https://www.nrb.org.np/api/forex/v1/rates?${props}`;
    axios.get(url).then((res) => {
      setAllData(res.data.data?.payload);
      if (res.data.data?.payload.length > 0) {
        setPublishedOn(res.data.data.payload[0].published_on);
        setModifiedOn(res.data.data.payload[0].modified_on);
      }
      if (active) {
        handleActiveItems(res.data.data?.payload, active);
      }
      setLoading(false);
    });
  }, [fromDate, toDate]);

  const handleActiveItems = (allCurrency, active) => {
    const grouped = groupRatesByCurrency(allCurrency);
    setActiveData(grouped[active]);
  };

  useEffect(() => {
    if (active) {
      setLoading(true);
      const params = {
        from: moment().subtract(10, "days").format("YYYY-MM-DD"),
        to: moment().format("YYYY-MM-DD"),
        page: 1,
        per_page: 100,
      };
      let props = "";
      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          const element = params[key];
          props += `${key}=${element}&`;
        }
      }
      const url = `https://www.nrb.org.np/api/forex/v1/rates?${props}`;
      axios.get(url).then((res) => {
        handleActiveItems(res.data?.data?.payload, active);
        setLoading(false);
      });
    }
  }, [active]);

  function groupRatesByCurrency(data) {
    // Create an empty object to hold the grouped rates
    const groupedRates = {};
    // Loop through each entry in the data array
    data.forEach((entry) => {
      // Loop through each rate in the entry
      entry.rates.forEach((rate) => {
        const currencyCode = rate.currency.iso3;

        // If the currency code is not yet a key in the groupedRates object, add it
        if (!groupedRates[currencyCode]) {
          groupedRates[currencyCode] = {
            name: rate.currency.name,
            unit: rate.currency.unit,
            rates: [],
          };
        }

        // Add the rate information to the corresponding currency key
        groupedRates[currencyCode].rates.push({
          date: entry.date,
          buy: rate.buy,
          sell: rate.sell,
        });
      });
    });

    return groupedRates;
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    const rate = allData.find((data) =>
      data.rates.some((r) => r.currency.iso3 === selectedCurrency)
    );
    if (rate) {
      const { buy } = rate.rates.find(
        (r) => r.currency.iso3 === selectedCurrency
      );
      setConvertedAmount((e.target.value * buy).toFixed(2));
    }
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
    if (amount > 0) {
      const rate = allData.find((data) =>
        data.rates.some((r) => r.currency.iso3 === e.target.value)
      );
      if (rate) {
        const { buy } = rate.rates.find(
          (r) => r.currency.iso3 === e.target.value
        );
        setConvertedAmount((amount * buy).toFixed(2));
      }
    }
  };

  return (
    <div className="app-container">
      <h2 className="app-title">Foreign Exchange Rates</h2>
      {!loading && (
        <div className="conversion-container">
          <div className="flexfirst">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
            />
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="countrySelect"
            >
              {Object.keys(extra.currency_symbols).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          {convertedAmount && (
            <div className="converted-amount">
              Converted Amount in NPR = {convertedAmount}
            </div>
          )}
        </div>
      )}
      {publishedOn && modifiedOn && (
        <div className="dates-info">
          <p>
            Published On: {moment(publishedOn).format("YYYY-MM-DD hh:mm:ss")}
          </p>
          <p>Modified On: {moment(modifiedOn).format("YYYY-MM-DD hh:mm:ss")}</p>
        </div>
      )}
      {active && (
        <div className="date-picker-container">
          <ReactDatePicker
            selectsEnd
            showIcon
            className="date-picker"
            endDate={new Date()}
            selected={fromDate}
            onChange={(date) => setFromDate(moment(date).format("YYYY-MM-DD"))}
          />
          <ReactDatePicker
            className="date-picker"
            showIcon
            selected={toDate}
            onChange={(date) => setToDate(moment(date).format("YYYY-MM-DD"))}
          />
          <button onClick={() => setActive(null)} className="back-button">
            BACK
          </button>
        </div>
      )}
      {loading ? (
        <div className="animation-container">
          <lottie-player
            autoplay
            loop
            mode="normal"
            src="https://lottie.host/a22648ca-a979-48a5-960c-26d54bd48924/IvYOpIkPff.json"
            style={{ width: "100%", backgroundColor: "white" }}
          ></lottie-player>
        </div>
      ) : !active ? (
        <table className="currency-table">
          <thead>
            <tr>
              <th>Flag</th>
              <th>Currency</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Buy</th>
              <th>Sell</th>
            </tr>
          </thead>
          <tbody>
            {allData.map((rates, key) =>
              rates.rates.map((rate, rateKey) => (
                <tr key={`${key}-${rateKey}`}>
                  <td>
                    <img
                      src={extra.currency_flags[rate.currency.iso3]}
                      alt={rate.currency.iso3}
                      className="currency-flag"
                    />
                  </td>
                  <td>{rate.currency.iso3}</td>
                  <td>{rate.currency.name}</td>
                  <td>{rate.currency.unit}</td>
                  <td>{rate.buy}</td>
                  <td>{rate.sell}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : activeData ? (
        <div className="active-data-container">
          <img
            src={extra.currency_flags[active]}
            alt={active}
            className="active-flag"
          />
          <h2 className="active-name">{activeData.name}</h2>
          <p className="active-unit">
            {extra.currency_symbols[active]}
            {activeData.unit}
          </p>
          <p>Last 10 Days Rates</p>
          {/* You can add a chart or more details here */}
        </div>
      ) : (
        "Data Not Found"
      )}
    </div>
  );
}

export default App;
