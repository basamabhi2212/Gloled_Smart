document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Switching Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add 'active' class to the clicked button and corresponding content
            button.classList.add('active');
            const targetTab = button.dataset.tab;
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Helper for Input Validation and Error Display ---
    function getValidNumber(inputElement, defaultValue = 0) {
        const value = parseFloat(inputElement.value);
        if (isNaN(value) || value < 0) {
            // Optionally, provide visual feedback for invalid input
            // For this exercise, we'll just return 0 or a default
            inputElement.style.border = '1px solid #dc3545'; // Red border for error
            setTimeout(() => {
                inputElement.style.border = '1px solid #ced4da'; // Reset after a short delay
            }, 1000);
            return defaultValue;
        }
        inputElement.style.border = '1px solid #ced4da'; // Reset if valid
        return value;
    }

    // --- A. Feet ⇄ Meter Converter ---
    const feetInput = document.getElementById('feetInput');
    const metersInput = document.getElementById('metersInput');
    const FEET_TO_METER = 0.3048;

    function convertFeetToMeters() {
        const feet = getValidNumber(feetInput);
        if (feet !== null) {
            metersInput.value = (feet * FEET_TO_METER).toFixed(4); // 4 decimal places for precision
        } else {
            metersInput.value = ''; // Clear if invalid
        }
    }

    function convertMetersToFeet() {
        const meters = getValidNumber(metersInput);
        if (meters !== null) {
            feetInput.value = (meters / FEET_TO_METER).toFixed(4);
        } else {
            feetInput.value = ''; // Clear if invalid
        }
    }

    feetInput.addEventListener('input', convertFeetToMeters);
    metersInput.addEventListener('input', convertMetersToFeet);

    // Initial conversion if there are pre-filled values
    if (feetInput.value) convertFeetToMeters();
    if (metersInput.value && !feetInput.value) convertMetersToFeet();


    // --- B. Lighting-Specific Tools ---

    // Watt ⇄ Lumen Converter
    const wattsInput = document.getElementById('wattsInput');
    const efficacyInput = document.getElementById('efficacyInput');
    const lumensOutput = document.getElementById('lumensOutput');

    function calculateLumens() {
        const watts = getValidNumber(wattsInput);
        const efficacy = getValidNumber(efficacyInput, 1); // Efficacy shouldn't be zero
        if (watts !== null && efficacy !== null) {
            const lumens = watts * efficacy;
            lumensOutput.textContent = lumens.toFixed(2);
        } else {
            lumensOutput.textContent = '0';
        }
    }

    wattsInput.addEventListener('input', calculateLumens);
    efficacyInput.addEventListener('input', calculateLumens);
    calculateLumens(); // Initial calculation on load

    // Lux Calculator (Simplified)
    const luxWattageInput = document.getElementById('luxWattageInput');
    const mountingHeightInput = document.getElementById('mountingHeightInput');
    const fixtureLumenOutputInput = document.getElementById('fixtureLumenOutputInput');
    const approxLuxOutput = document.getElementById('approxLuxOutput');

    function calculateApproxLux() {
        const wattage = getValidNumber(luxWattageInput); // Not directly used in formula, but collected
        const mountingHeight = getValidNumber(mountingHeightInput, 1); // Height cannot be zero or negative
        const fixtureLumen = getValidNumber(fixtureLumenOutputInput);

        if (fixtureLumen !== null && mountingHeight !== null && mountingHeight > 0) {
            // Simplified formula: (Fixture Lumen Output * 0.7) / Mounting Height^2
            const approximateLux = (fixtureLumen * 0.7) / (mountingHeight * mountingHeight);
            approxLuxOutput.textContent = approximateLux.toFixed(2);
        } else {
            approxLuxOutput.textContent = '0';
        }
    }

    luxWattageInput.addEventListener('input', calculateApproxLux);
    mountingHeightInput.addEventListener('input', calculateApproxLux);
    fixtureLumenOutputInput.addEventListener('input', calculateApproxLux);
    calculateApproxLux(); // Initial calculation

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

        if (vf !== null && current_mA !== null && numLeds !== null) {
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
    calculateLedDriverSpecs(); // Initial calculation

    // Home Purpose Lighting Suggestion
    const roomContainer = document.getElementById('roomContainer');
    const addRoomButton = document.getElementById('addRoomButton');
    const homeLightingSuggestion = document.getElementById('homeLightingSuggestion');
    let roomCount = 1; // Start with 1 as there's one pre-existing room entry

    // Function to update suggestions based on current rooms
    function updateHomeLightingSuggestion() {
        const roomEntries = roomContainer.querySelectorAll('.room-entry');
        let suggestions = [];
        roomEntries.forEach((entry, index) => {
            const roomTypeSelect = entry.querySelector(`#roomType${index}`);
            const numBedroomsSelect = entry.querySelector(`#numBedrooms${index}`);

            const roomType = roomTypeSelect ? roomTypeSelect.value : '';
            const numBedrooms = numBedroomsSelect ? numBedroomsSelect.value : ''; // This is less critical for general suggestion

            if (roomType) {
                let suggestion = `For a ${roomType}`;
                if (roomType === 'Bedroom') {
                    suggestion += `, consider soft ambient lighting with bedside lamps and a dimmable overhead fixture.`;
                } else if (roomType === 'Living Room') {
                    suggestion += `, use layered lighting: ambient, task (reading lamps), and accent lighting (spotlights for art).`;
                } else if (roomType === 'Kitchen') {
                    suggestion += `, bright task lighting for countertops, under-cabinet lights, and good general overhead lighting are key.`;
                } else if (roomType === 'Bathroom') {
                    suggestion += `, ensure bright, even lighting around the mirror for grooming, and consider a separate dimmable fixture for relaxation.`;
                } else if (roomType === 'Dining Room') {
                    suggestion += `, a dimmable chandelier over the table is essential, complemented by ambient lighting.`;
                } else if (roomType === 'Office') {
                    suggestion += `, focus on good task lighting for the desk and glare-free ambient light.`;
                } else if (roomType === 'Hallway') {
                    suggestion += `, use evenly spaced ceiling lights or wall sconces for safe passage.`;
                } else {
                    suggestion += `, general ambient lighting is usually suitable.`;
                }
                suggestions.push(suggestion);
            }
        });

        if (suggestions.length > 0) {
            homeLightingSuggestion.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
            homeLightingSuggestion.previousElementSibling.textContent = 'Lighting Suggestions:'; // Change label if needed
        } else {
            homeLightingSuggestion.textContent = 'Suggestions will appear here based on room types.';
            homeLightingSuggestion.previousElementSibling.textContent = 'Home Purpose Lighting Suggestion';
        }
    }


    // Function to add a new room entry
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
            <select id="numBedrooms${roomCount}" aria-label="Number of bedrooms selection">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
            </select>
            <button type="button" class="remove-room-button" aria-label="Remove room">Remove</button>
        `;
        roomContainer.appendChild(newRoomEntry);

        // Add event listeners to the new elements
        const newRoomTypeSelect = newRoomEntry.querySelector(`#roomType${roomCount}`);
        if (newRoomTypeSelect) {
            newRoomTypeSelect.addEventListener('change', updateHomeLightingSuggestion);
        }

        const newNumBedroomsSelect = newRoomEntry.querySelector(`#numBedrooms${roomCount}`);
        if (newNumBedroomsSelect) {
            newNumBedroomsSelect.addEventListener('change', updateHomeLightingSuggestion);
        }

        newRoomEntry.querySelector('.remove-room-button').addEventListener('click', (event) => {
            event.target.closest('.room-entry').remove();
            updateHomeLightingSuggestion(); // Update suggestions after removal
        });

        roomCount++;
        updateHomeLightingSuggestion(); // Update suggestions after adding
    });

    // Add event listeners to initial room entry
    const initialRoomTypeSelect = document.getElementById('roomType0');
    if (initialRoomTypeSelect) {
        initialRoomTypeSelect.addEventListener('change', updateHomeLightingSuggestion);
    }
    const initialNumBedroomsSelect = document.getElementById('numBedrooms0');
    if (initialNumBedroomsSelect) {
        initialNumBedroomsSelect.addEventListener('change', updateHomeLightingSuggestion);
    }

    // Add event listener to initial remove button (if it exists)
    const initialRemoveButton = document.querySelector('.room-entry .remove-room-button');
    if (initialRemoveButton) {
        initialRemoveButton.addEventListener('click', (event) => {
            // Prevent removing the very last room entry
            if (roomContainer.children.length > 1) {
                event.target.closest('.room-entry').remove();
                updateHomeLightingSuggestion();
            } else {
                alert("You need at least one room entry.");
            }
        });
    }

    updateHomeLightingSuggestion(); // Initial suggestion on load

    // Trigger initial calculations for all tools on page load
    // This ensures all output fields show '0' or a calculated value, not just blank.
    convertFeetToMeters();
    calculateLumens();
    calculateApproxLux();
    calculateLedDriverSpecs();
});
