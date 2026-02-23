// Currency Converter JavaScript
const accessKey = "0122506e1800e74ee508800bd93beb89"; 
const fromCurr = document.querySelector("#from-currency");
const toCurr = document.querySelector("#to-currency");
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("#converter-form");
const msg = document.querySelector("#conversion-result");
const rateInfo = document.querySelector("#rate-info");
const swapBtn = document.querySelector("#swap-currencies");
const amountInput = document.querySelector("#amount");

// Initialize the converter
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
            updateFlag(evt.target);
            updateInitialRate();
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    btn.addEventListener("submit", handleConversion);
    
    // Swap currencies button
    swapBtn.addEventListener("click", swapCurrencies);
    
    // Amount input validation
    amountInput.addEventListener("input", validateAmount);
    
    // Real-time conversion on amount change
    amountInput.addEventListener("input", debounce(handleConversion, 500));
}

// Update flag based on currency selection
function updateFlag(element) {
    let currCode = element.value;
    let countrycode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countrycode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    
    // Add fade effect when changing flags
    img.style.opacity = '0.5';
    setTimeout(() => {
        img.src = newSrc;
        img.style.opacity = '1';
    }, 150);
}

// Swap currencies
function swapCurrencies() {
    const tempValue = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempValue;
    
    // Update flags
    updateFlag(fromCurr);
    updateFlag(toCurr);
    
    // Update conversion
    updateInitialRate();
    
    // Add rotation animation to swap button
    swapBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 300);
}

// Validate amount input
function validateAmount() {
    const value = parseFloat(amountInput.value);
    
    if (isNaN(value) || value < 0) {
        amountInput.value = '1';
        showError('Please enter a valid positive amount');
        return false;
    }
    
    if (value > 999999999) {
        amountInput.value = '999999999';
        showError('Maximum amount exceeded');
        return false;
    }
    
    clearError();
    return true;
}

// Handle currency conversion
async function handleConversion(evt) {
    if (evt) evt.preventDefault();
    
    if (!validateAmount()) return;
    
    const amountValue = parseFloat(amountInput.value);
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const url = `https://api.exchangerate.host/convert?access_key=${accessKey}&from=${fromCurr.value}&to=${toCurr.value}&amount=${amountValue}`;
        
        let response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error?.info || 'Conversion failed');
        }
        
        // Display the result
        displayResult(data, amountValue);
        
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        showError(`Failed to get exchange rate: ${error.message}`);
        
        // Fallback to cached rate if available
        if (localStorage.getItem(`rate_${fromCurr.value}_${toCurr.value}`)) {
            const cachedRate = localStorage.getItem(`rate_${fromCurr.value}_${toCurr.value}`);
            const convertedAmount = (amountValue * parseFloat(cachedRate)).toFixed(4);
            msg.innerText = `${amountValue} ${fromCurr.value} = ${convertedAmount} ${toCurr.value} (Cached)`;
            rateInfo.innerText = 'Using cached exchange rate';
        }
    } finally {
        setLoadingState(false);
    }
}

// Display conversion result
function displayResult(data, amountValue) {
    const convertedAmount = data.result;
    const rate = data.info.rate;
    
    // Cache the rate for offline use
    localStorage.setItem(`rate_${fromCurr.value}_${toCurr.value}`, rate);
    
    // Format the result with proper decimal places
    const formattedAmount = formatNumber(convertedAmount);
    const formattedRate = formatNumber(rate);
    
    msg.innerText = `${amountValue} ${fromCurr.value} = ${formattedAmount} ${toCurr.value}`;
    rateInfo.innerText = `1 ${fromCurr.value} = ${formattedRate} ${toCurr.value}`;
    
    // Add success animation
    msg.classList.add('success');
    setTimeout(() => msg.classList.remove('success'), 2000);
}

// Update initial rate on page load
async function updateInitialRate() {
    try {
        const url = `https://api.exchangerate.host/convert?access_key=${accessKey}&from=${fromCurr.value}&to=${toCurr.value}&amount=1`;
        
        let response = await fetch(url);
        let data = await response.json();
        
        if (data.success) {
            const rate = data.info.rate;
            const formattedRate = formatNumber(rate);
            rateInfo.innerText = `1 ${fromCurr.value} = ${formattedRate} ${toCurr.value}`;
            
            // Cache the rate
            localStorage.setItem(`rate_${fromCurr.value}_${toCurr.value}`, rate);
        }
    } catch (error) {
        console.log('Could not fetch initial rate, using cached if available');
        const cachedRate = localStorage.getItem(`rate_${fromCurr.value}_${toCurr.value}`);
        if (cachedRate) {
            const formattedRate = formatNumber(parseFloat(cachedRate));
            rateInfo.innerText = `1 ${fromCurr.value} = ${formattedRate} ${toCurr.value} (Cached)`;
        }
    }
}

// Set loading state
function setLoadingState(loading) {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const convertBtn = document.querySelector('.convert-btn');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        convertBtn.disabled = true;
        convertBtn.classList.add('loading');
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        convertBtn.disabled = false;
        convertBtn.classList.remove('loading');
    }
}

// Show error message
function showError(message) {
    msg.innerText = message;
    msg.classList.add('error');
    rateInfo.innerText = '';
    
    setTimeout(() => {
        msg.classList.remove('error');
    }, 3000);
}

// Clear error state
function clearError() {
    msg.classList.remove('error');
}

// Format number with proper decimal places
function formatNumber(num) {
    if (num >= 1) {
        return num.toFixed(4).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return num.toFixed(6).replace(/0+$/, '');
    }
}

// Debounce function for real-time conversion
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleConversion();
    }
    
    // Ctrl/Cmd + S to swap currencies
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        swapCurrencies();
    }
});

// Add some polish with smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
