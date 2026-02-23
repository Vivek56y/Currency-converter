// Currency Converter JavaScript - Simple and Working
const fromCurr = document.querySelector("#from-currency");
const toCurr = document.querySelector("#to-currency");
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("#converter-form");
const msg = document.querySelector("#conversion-result");
const rateInfo = document.querySelector("#rate-info");
const swapBtn = document.querySelector("#swap-currencies");
const amountInput = document.querySelector("#amount");

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
    setupEventListeners();
    updateInitialRate();
});

// Populate currency dropdowns
function populateDropdowns() {
    for (let select of dropdowns) {
        for (let currCode in countryList) {
            let newOption = document.createElement("option"); 
            newOption.innerText = currCode;
            newOption.value = currCode;
            
            if (select.name.toLowerCase() === "from" && currCode === "USD") {
                newOption.selected = "selected";
            }
            if (select.name.toLowerCase() === "to" && currCode === "INR") {
                newOption.selected = "selected";
            }
            select.append(newOption);
        }
        
        select.addEventListener("change", (evt) => {
            updateFlag(evt.target);
            updateInitialRate();
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    btn.addEventListener("submit", handleConversion);
    swapBtn.addEventListener("click", swapCurrencies);
    amountInput.addEventListener("input", validateAmount);
}

// Update flag based on currency selection
function updateFlag(element) {
    let currCode = element.value;
    let countrycode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countrycode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
}

// Swap currencies
function swapCurrencies() {
    const tempValue = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempValue;
    
    updateFlag(fromCurr);
    updateFlag(toCurr);
    updateInitialRate();
}

// Validate amount input
function validateAmount() {
    const value = parseFloat(amountInput.value);
    if (isNaN(value) || value < 0) {
        amountInput.value = '1';
    }
}

// Handle currency conversion
async function handleConversion(evt) {
    evt.preventDefault();
    
    const amountValue = parseFloat(amountInput.value);
    if (isNaN(amountValue) || amountValue <= 0) return;
    
    // Show loading
    msg.innerText = "Converting...";
    
    try {
        const url = `https://open.er-api.com/v6/latest/${fromCurr.value}`;
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.result === 'success') {
            const rate = data.rates[toCurr.value];
            const convertedAmount = amountValue * rate;
            
            msg.innerText = `${amountValue} ${fromCurr.value} = ${convertedAmount.toFixed(4)} ${toCurr.value}`;
            rateInfo.innerText = `1 ${fromCurr.value} = ${rate} ${toCurr.value}`;
        } else {
            msg.innerText = "Conversion failed";
        }
    } catch (error) {
        console.error("Error:", error);
        msg.innerText = "Network error - try again";
    }
}

// Update initial rate
async function updateInitialRate() {
    try {
        const url = `https://open.er-api.com/v6/latest/${fromCurr.value}`;
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.result === 'success') {
            const rate = data.rates[toCurr.value];
            rateInfo.innerText = `1 ${fromCurr.value} = ${rate} ${toCurr.value}`;
        }
    } catch (error) {
        console.log("Could not fetch initial rate");
    }
}
