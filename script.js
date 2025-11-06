// --- Global Utility Functions ---

/**
 * Validates a number input to ensure it is non-negative.
 * @param {number} value - The input value.
 * @returns {boolean} True if the value is a positive number (>= 0), false otherwise.
 */
const isValidInput = (value) => {
    return !isNaN(value) && value >= 0;
};

/**
 * Formats a number to a fixed decimal place, handling potential errors.
 * @param {number} value - The number to format.
 * @param {number} [decimals=2] - The number of decimal places.
 * @returns {string} The formatted string or a message if invalid.
 */
const formatResult = (value, decimals = 2) => {
    if (isNaN(value) || !isFinite(value)) {
        return 'Invalid Input';
    }
    return value.toFixed(decimals);
};

// --- SPA Navigation Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const toolGroups = document.querySelectorAll('.tool-group');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons and hide all tool groups
            tabButtons.forEach(btn => btn.classList.remove('active'));
            toolGroups.forEach(group => group.classList.add('hidden'));

            // Add 'active' class to the clicked button
            button.classList.add('active');

            // Show the corresponding tool group
            const targetId = button.getAttribute('data-tool-group');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Initialize all tool calculations
    initConverterTools();
    initLightingTools();
    initHomeLightingTool();
});

// --- A. Feet ⇄ Meter Converter ---
const initConverterTools = () => {
    const feetInput = document.getElementById('feetInput');
    const meterInput = document.getElementById('meterInput');
    const resultArea = document.getElementById('feetMeterResult');
    const FEET_TO_METER = 0.3048;

    /**
     * Handles the conversion logic and updates the output field and result area.
     * @param {HTMLElement} changedInput - The input field that was just changed.
     * @param {HTMLElement} otherInput - The input field to update.
     * @param {Function} conversionFn - The conversion function to apply.
     * @param {string} unit - The unit of the calculated value.
     */
    const handleConversion = (changedInput, otherInput, conversionFn, unit) => {
        const value = parseFloat(changedInput.value);
        
        // Clear previous error messages
        resultArea.innerHTML = '';
        
        if (!isValidInput(value)) {
            resultArea.innerHTML = `<span class="error-message">Please enter a positive number in ${changedInput.previousElementSibling.textContent}.</span>`;
            otherInput.value = '';
            return;
        }

        const convertedValue = conversionFn(value);
        otherInput.value = formatResult(convertedValue, 4);
        resultArea.innerHTML = `<p>Result: **${formatResult(convertedValue, 4)}** ${unit}</p>`;
    };

    // Feet to Meter
    feetInput.addEventListener('input', () => {
        handleConversion(
            feetInput,
            meterInput,
            (ft) => ft * FEET_TO_METER,
            'meters (m)'
        );
    });

    // Meter to Feet
    meterInput.addEventListener('input', () => {
        handleConversion(
            meterInput,
            feetInput,
            (m) => m / FEET_TO_METER,
            'feet (ft)'
        );
    });
};

// --- B. Lighting-Specific Tools Initialization ---
const initLightingTools = () => {
    // 1. Watt ⇄ Lumen Converter
    const wattsInput = document.getElementById('wattsInput');
    const efficacyInput = document.getElementById('efficacyInput');
    const lumensOutput = document.getElementById('lumensOutput');

    const calculateLumens = () => {
        const watts = parseFloat(wattsInput.value);
        const efficacy = parseFloat(efficacyInput.value);

        if (!isValidInput(watts) || !isValidInput(efficacy) || efficacy === 0) {
            lumensOutput.textContent = '0.00';
            return;
        }

        // Lumens = Watts × Efficacy
        const lumens = watts * efficacy;
        lumensOutput.textContent = formatResult(lumens);
    };

    wattsInput.addEventListener('input', calculateLumens);
    efficacyInput.addEventListener('input', calculateLumens);
    
    // Initial run to display default values
    calculateLumens();

    // 2. Lux Calculator (Simplified)
    const luxLumensInput = document.getElementById('luxLumens');
    const luxHeightInput = document.getElementById('luxHeight');
    const luxResultOutput = document.getElementById('luxResult');

    const calculateLux = () => {
        const lumens = parseFloat(luxLumensInput.value);
        const height = parseFloat(luxHeightInput.value);
        const ROUGH_FACTOR = 0.7; // Rough combined loss/utilization factor

        if (!isValidInput(lumens) || !isValidInput(height) || height <= 0) {
            luxResultOutput.textContent = '0.00';
            return;
        }

        // Approximate Lux = (Fixture Lumen Output * 0.7) / (Mounting Height^2)
        const lux = (lumens * ROUGH_FACTOR) / (height * height);
        luxResultOutput.textContent = formatResult(lux);
    };

    luxLumensInput.addEventListener('input', calculateLux);
    luxHeightInput.addEventListener('input', calculateLux);

    // Initial run
    calculateLux();

    // 3. LED Driver Calculator
    const ledVfInput = document.getElementById('ledVf');
    const ledCurrentInput = document.getElementById('ledCurrent');
    const ledCountInput = document.getElementById('ledCount');
    const driverVoltageOutput = document.getElementById('driverVoltage');
    const driverPowerOutput = document.getElementById('driverPower');
    const driverRecommendation = document.getElementById('driverRecommendation');

    const calculateDriverSpecs = () => {
        const Vf = parseFloat(ledVfInput.value);
        const current_mA = parseFloat(ledCurrentInput.value);
        const count = parseInt(ledCountInput.value);

        if (!isValidInput(Vf) || !isValidInput(current_mA) || !isValidInput(count) || count < 1) {
            driverVoltageOutput.textContent = '0.00';
            driverPowerOutput.textContent = '0.00';
            driverRecommendation.innerHTML = '<span class="error-message">Please enter valid positive numbers for all fields.</span>';
            return;
        }

        // Total Voltage (V) = Vf * Number of LEDs
        const totalVoltage = Vf * count;

        // Total Power (W) = Total Voltage * (Current / 1000)
        const totalPower = totalVoltage * (current_mA / 1000);

        driverVoltageOutput.textContent = formatResult(totalVoltage);
        driverPowerOutput.textContent = formatResult(totalPower);

        driverRecommendation.innerHTML = `**Recommendation:** Suitable for a constant current driver (${formatResult(current_mA, 0)}mA) with a minimum operating voltage of **${formatResult(totalVoltage)}V** and power rating of at least **${formatResult(totalPower)}W**.`;
    };

    ledVfInput.addEventListener('input', calculateDriverSpecs);
    ledCurrentInput.addEventListener('input', calculateDriverSpecs);
    ledCountInput.addEventListener('input', calculateDriverSpecs);

    // Initial run
    calculateDriverSpecs();
};

// --- 4. Home Purpose Lighting Suggestion (Dynamic UI) ---
const initHomeLightingTool = () => {
    const addRoomBtn = document.getElementById('addRoomBtn');
    const roomContainers = document.getElementById('roomContainers');
    let roomCounter = 0;
    
    // Define initial room types for the dropdown
    const roomTypes = [
        'Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Office/Study', 
        'Dining Room', 'Hallway', 'Garage', 'Laundry Room'
    ];
    
    // Define the Home Lighting UI Template
    const createRoomEntry = (initialRoomType, isRemovable = true) => {
        const container = document.createElement('div');
        container.classList.add('room-entry');
        container.setAttribute('data-room-id', ++roomCounter);
        
        // Dropdown for Room Type
        const typeGroup = document.createElement('div');
        typeGroup.classList.add('input-group');
        typeGroup.innerHTML = `
            <label for="roomType${roomCounter}">Room Type</label>
            <select id="roomType${roomCounter}">
                ${roomTypes.map(type => 
                    `<option value="${type.toLowerCase().replace(' ', '-')}" ${type === initialRoomType ? 'selected' : ''}>${type}</option>`
                ).join('')}
            </select>
        `;

        // Dropdown for Number of Bedrooms (or similar metric)
        const countGroup = document.createElement('div');
        countGroup.classList.add('input-group');
        countGroup.innerHTML = `
            <label for="roomCount${roomCounter}">Approximate Size</label>
            <select id="roomCount${roomCounter}">
                <option value="small">Small (e.g. 1 Bed/Bath)</option>
                <option value="medium" selected>Medium (e.g. 2 Bed/Study)</option>
                <option value="large">Large (e.g. 3 Bed/Kitchen)</option>
                <option value="extra-large">Extra Large (e.g. 4+ Bed)</option>
            </select>
        `;

        container.appendChild(typeGroup);
        container.appendChild(countGroup);
        
        // Remove Button
        if (isRemovable) {
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-room-btn');
            removeBtn.textContent = '❌ Remove';
            removeBtn.addEventListener('click', () => {
                container.remove();
            });
            container.appendChild(removeBtn);
        }

        return container;
    };

    // Function to add a new room entry
    const addRoomEntry = (initialType = 'Bedroom', isRemovable = true) => {
        const newEntry = createRoomEntry(initialType, isRemovable);
        roomContainers.appendChild(newEntry);
    };

    // Event listener for the "Add Room" button
    addRoomBtn.addEventListener('click', () => {
        // Default new room to 'Kitchen' for variety
        addRoomEntry('Kitchen'); 
    });
    
    // Add the initial default room (Bedroom, not removable)
    addRoomEntry('Bedroom', false);
};
