// Base URL (template)
const baseurl = `https://api.exchangerate.host/convert?access_key=&from=&to=&amount=`;
const accessKey = "0122506e1800e74ee508800bd93beb89"; 
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const msg = document.querySelector(".msg"); // Corrected variable name

// Define countryList with currency codes (if not already defined)

// Loop through the dropdowns and populate them with options
for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option"); 
        newOption.innerText = currCode;
        newOption.value = currCode;
        
        // Set default selected currencies
        if (select.name.toLowerCase() === "from" && currCode === "USD") {
            newOption.selected = "selected";
        }
        if (select.name.toLowerCase() === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    select.addEventListener("change", (evt) => {
        updateflag(evt.target);
    });
}

// Update flag based on currency selection
const updateflag = (element) => {
    let currCode = element.value;
    let countrycode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countrycode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};

// Button click event handler for fetching conversion rates
btn.addEventListener("click", async (evt) => {
    evt.preventDefault();

    // Get the amount from the input field
    let amountInput = document.querySelector(".amount input");
    let amountValue = amountInput.value;

    // Construct the URL dynamically
    const url = `https://api.exchangerate.host/convert?access_key=${accessKey}&from=${fromCurr.value}&to=${toCurr.value}&amount=${amountValue}`;

    try {
        // Fetch the conversion data from the API
        let response = await fetch(url);
        let data = await response.json();

        // Log the conversion result
        console.log(data);

        // Get the converted amount from API response
        let convertedAmount = data.result;

        // Display the result in the message container
        msg.innerText = `${amountValue} ${fromCurr.value} = ${convertedAmount} ${toCurr.value}`;
    } catch (error) {
        // Handle error if the API call fails
        console.error("Error fetching exchange rate:", error);
        msg.innerText = "An error occurred while fetching the exchange rate.";
    }
});
