// Ensure jsPDF is loaded before this script, typically via <script> tags in HTML head/body.
// window.jsPDF is available if jsPDF.umd.min.js is correctly loaded.

document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Switching Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const targetTab = button.dataset.tab;
            document.getElementById(targetTab).classList.add('active');

            // Specific action for the Estimation PDF tab
            if (targetTab === 'estimationPdfGenerator' && !allProductsData.length) {
                // If the PDF tab is opened and products haven't been loaded, try to load them
                loadProductData(); 
            }
        });
    });

    // --- Helper for Input Validation and Error Display ---
    function getValidNumber(inputElement, defaultValue = 0) {
        const value = parseFloat(inputElement.value);
        if (isNaN(value) || value < 0) {
            inputElement.style.border = '1px solid #dc3545';
            setTimeout(() => {
                inputElement.style.border = '1px solid #ced4da';
            }, 1000);
            return defaultValue;
        }
        inputElement.style.border = '1px solid #ced4da';
        return value;
    }

    // --- A. Feet ⇄ Meter Converter ---
    const feetInput = document.getElementById('feetInput');
    const metersInput = document.getElementById('metersInput');
    const FEET_TO_METER = 0.3048;

    function convertFeetToMeters() {
        const feet = getValidNumber(feetInput);
        metersInput.value = (feet * FEET_TO_METER).toFixed(4);
    }

    function convertMetersToFeet() {
        const meters = getValidNumber(metersInput);
        feetInput.value = (meters / FEET_TO_METER).toFixed(4);
    }

    feetInput.addEventListener('input', convertFeetToMeters);
    metersInput.addEventListener('input', convertMetersToFeet);
    if (feetInput.value) convertFeetToMeters();
    if (metersInput.value && !feetInput.value) convertMetersToFeet();


    // --- B. Lighting-Specific Tools ---

    // Watt ⇄ Lumen Converter
    const wattsInput = document.getElementById('wattsInput');
    const efficacyInput = document.getElementById('efficacyInput');
    const lumensOutput = document.getElementById('lumensOutput');

    function calculateLumens() {
        const watts = getValidNumber(wattsInput);
        const efficacy = getValidNumber(efficacyInput, 1);
        const lumens = watts * efficacy;
        lumensOutput.textContent = lumens.toFixed(2);
    }

    wattsInput.addEventListener('input', calculateLumens);
    efficacyInput.addEventListener('input', calculateLumens);
    calculateLumens();

    // Lux Calculator (Simplified)
    const luxWattageInput = document.getElementById('luxWattageInput');
    const mountingHeightInput = document.getElementById('mountingHeightInput');
    const fixtureLumenOutputInput = document.getElementById('fixtureLumenOutputInput');
    const approxLuxOutput = document.getElementById('approxLuxOutput');

    function calculateApproxLux() {
        const mountingHeight = getValidNumber(mountingHeightInput, 1);
        const fixtureLumen = getValidNumber(fixtureLumenOutputInput);

        if (fixtureLumen > 0 && mountingHeight > 0) {
            const approximateLux = (fixtureLumen * 0.7) / (mountingHeight * mountingHeight);
            approxLuxOutput.textContent = approximateLux.toFixed(2);
        } else {
            approxLuxOutput.textContent = '0';
        }
    }

    luxWattageInput.addEventListener('input', calculateApproxLux);
    mountingHeightInput.addEventListener('input', calculateApproxLux);
    fixtureLumenOutputInput.addEventListener('input', calculateApproxLux);
    calculateApproxLux();

    // LED Driver Calculator
    const forwardVoltageInput = document.getElementById('forwardVoltageInput');
    const currentInput = document.getElementById('currentInput');
    const numLedsInput = document.getElementById('numLedsInput');
    const driverTotalVoltage = document.getElementById('driverTotalVoltage');
    const driverTotalPower = document.getElementById('driverTotalPower');
    const driverRecommendation = document.getElementById('driverRecommendation');

    function calculateLedDriverSpecs() {
        const vf = getValidNumber(forwardVoltageInput);
        const current_mA = getValidNumber(currentInput);
        const numLeds = getValidNumber(numLedsInput);

        if (vf > 0 && current_mA > 0 && numLeds > 0) {
            const totalVoltage = vf * numLeds;
            const totalPower = totalVoltage * (current_mA / 1000); // Convert mA to A

            driverTotalVoltage.textContent = totalVoltage.toFixed(2);
            driverTotalPower.textContent = totalPower.toFixed(2);
            driverRecommendation.textContent = `Driver Recommendation: ${totalVoltage.toFixed(0)}-${(totalVoltage * 1.2).toFixed(0)}V, ${totalPower.toFixed(0)}-${(totalPower * 1.2).toFixed(0)}W Constant Current (CC)`;
        } else {
            driverTotalVoltage.textContent = '0';
            driverTotalPower.textContent = '0';
            driverRecommendation.textContent = 'N/A';
        }
    }

    forwardVoltageInput.addEventListener('input', calculateLedDriverSpecs);
    currentInput.addEventListener('input', calculateLedDriverSpecs);
    numLedsInput.addEventListener('input', calculateLedDriverSpecs);
    calculateLedDriverSpecs();

    // Home Purpose Lighting Suggestion
    const roomContainer = document.getElementById('roomContainer');
    const addRoomButton = document.getElementById('addRoomButton');
    const homeLightingSuggestion = document.getElementById('homeLightingSuggestion');
    let roomCount = 1;

    function updateHomeLightingSuggestion() {
        const roomEntries = roomContainer.querySelectorAll('.room-entry');
        let suggestions = [];
        roomEntries.forEach((entry, index) => {
            const roomTypeSelect = entry.querySelector(`#roomType${index}`);
            const roomType = roomTypeSelect ? roomTypeSelect.value : '';

            if (roomType) {
                let suggestion = `For a ${roomType}`;
                if (roomType === 'Bedroom') suggestion += `, consider soft ambient lighting with bedside lamps and a dimmable overhead fixture.`;
                else if (roomType === 'Living Room') suggestion += `, use layered lighting: ambient, task (reading lamps), and accent lighting (spotlights for art).`;
                else if (roomType === 'Kitchen') suggestion += `, bright task lighting for countertops, under-cabinet lights, and good general overhead lighting are key.`;
                else if (roomType === 'Bathroom') suggestion += `, ensure bright, even lighting around the mirror for grooming, and consider a separate dimmable fixture for relaxation.`;
                else if (roomType === 'Dining Room') suggestion += `, a dimmable chandelier over the table is essential, complemented by ambient lighting.`;
                else if (roomType === 'Office') suggestion += `, focus on good task lighting for the desk and glare-free ambient light.`;
                else if (roomType === 'Hallway') suggestion += `, use evenly spaced ceiling lights or wall sconces for safe passage.`;
                else suggestion += `, general ambient lighting is usually suitable.`;
                suggestions.push(suggestion);
            }
        });

        if (suggestions.length > 0) {
            homeLightingSuggestion.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
        } else {
            homeLightingSuggestion.textContent = 'Suggestions will appear here based on room types.';
        }
    }

    addRoomButton.addEventListener('click', () => {
        const newRoomEntry = document.createElement('div');
        newRoomEntry.classList.add('room-entry');
        newRoomEntry.innerHTML = `
            <label for="roomType${roomCount}">Room Type:</label>
            <select id="roomType${roomCount}" aria-label="Room type selection">
                <option value="">Select Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Living Room">Living Room</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Dining Room">Dining Room</option>
                <option value="Office">Office</option>
                <option value="Hallway">Hallway</option>
            </select>
            <label for="numBedrooms${roomCount}">Number of Bedrooms:</label>
