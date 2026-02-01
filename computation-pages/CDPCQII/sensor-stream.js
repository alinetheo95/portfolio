// SENSOR STREAM FUNCTIONALITY

// Simulated sensor data
const sensorData = `Timestamp,Hour,Temperature_C,Humidity_%,Proximity,Red,Green,Blue,Clear,Ambient_Lux,Photocell_Ohm,Vibration,Mycelium_uV,Event
2025-12-09 06:00:00,6.00,20.1,72.5,8,450,520,380,45,12,8520,0,28.3,None
2025-12-09 06:15:00,6.25,20.2,71.8,10,620,710,520,95,45,7200,0,26.8,None
2025-12-09 06:30:00,6.50,20.5,70.2,7,890,1050,780,180,85,5800,0,24.5,None
2025-12-09 06:45:00,6.75,20.8,68.9,9,1120,1340,980,285,145,4200,0,21.2,None
2025-12-09 07:00:00,7.00,21.2,67.4,11,1350,1620,1180,420,180,3250,0,18.5,None
2025-12-09 07:15:00,7.25,21.6,66.1,185,1520,1820,1340,580,280,2450,1,15.8,WATERING
2025-12-09 07:30:00,7.50,21.9,64.8,12,1680,2010,1480,720,385,1850,0,13.5,None
2025-12-09 08:00:00,8.00,22.4,62.5,10,1850,2240,1620,2100,850,1250,0,10.5,None
2025-12-09 09:00:00,9.00,23.2,59.3,8,1950,2360,1720,2320,1200,720,0,6.9,None
2025-12-09 10:00:00,10.00,23.9,56.8,8,2050,2480,1820,2480,1450,380,0,4.2,None
2025-12-09 10:30:00,10.50,24.4,54.5,185,2080,2530,1870,2540,1510,320,1,3.5,TOUCH
2025-12-09 10:45:00,10.75,24.6,53.8,245,2090,2540,1880,2560,1525,300,1,3.2,TOUCH
2025-12-09 11:00:00,11.00,24.7,54.2,158,2095,2545,1885,2570,1535,290,0,2.9,TOUCH
2025-12-09 12:00:00,12.00,25.1,52.6,9,2100,2420,1850,2590,1580,250,0,2.2,None
2025-12-09 13:00:00,13.00,25.8,50.9,7,2115,2432,1862,2602,1568,210,0,1.7,None
2025-12-09 14:00:00,14.00,26.3,49.4,7,2123,2439,1869,2609,1558,170,0,1.3,None
2025-12-09 14:45:00,14.75,26.0,50.1,95,2110,2428,1858,2598,1485,220,0,1.2,GESTURE
2025-12-09 15:00:00,15.00,25.8,50.5,105,2100,2420,1850,2590,1440,250,0,1.3,GESTURE
2025-12-09 16:00:00,16.00,24.9,52.8,9,2020,2340,1770,2510,1150,450,0,1.9,None
2025-12-09 17:00:00,17.00,23.7,56.3,10,1800,2100,1550,2290,690,950,0,3.8,None
2025-12-09 18:00:00,18.00,22.5,60.3,7,1650,1850,1360,2060,420,1650,0,7.1,None
2025-12-09 18:45:00,18.75,21.8,62.8,220,1560,1560,1150,1830,280,2180,1,11.0,INSPECTION
2025-12-09 19:00:00,19.00,21.5,63.8,10,1480,1420,980,1710,85,2450,0,12.8,None
2025-12-09 19:15:00,19.25,21.3,64.6,8,3200,1800,3150,260,70,2680,0,14.5,None
2025-12-09 20:00:00,20.00,20.7,66.9,9,1250,2950,2850,285,65,2800,0,18.5,None
2025-12-09 20:30:00,20.50,20.4,68.3,11,2850,1600,1200,295,62,2850,0,21.2,None
2025-12-09 21:00:00,21.00,20.1,69.6,10,2860,1580,1190,292,66,2800,0,23.8,None
2025-12-09 22:00:00,22.00,19.7,71.6,11,520,610,420,158,45,4850,0,27.0,None
2025-12-09 23:00:00,23.00,19.4,72.9,9,455,535,365,122,25,6350,0,29.5,None
2025-12-10 00:00:00,0.00,19.1,73.8,10,445,520,355,110,15,7850,0,32.5,None
2025-12-10 01:00:00,1.00,18.9,74.5,11,436,511,346,100,9,9320,0,35.5,None
2025-12-10 02:00:00,2.00,18.8,75.1,9,432,507,342,94,7,10780,0,37.8,None
2025-12-10 03:00:00,3.00,18.7,75.6,10,430,505,340,90,5,12100,0,38.8,None
2025-12-10 04:00:00,4.00,18.6,75.9,11,429,504,339,87,4,13200,0,37.8,None
2025-12-10 05:00:00,5.00,18.6,76.2,10,430,505,340,85,4,14030,1,34.5,None`.split('\n');

let currentLine = 0;
let isStreaming = false;
let streamHasStarted = false;
let streamSpeed = 1; // Speed multiplier: 1 = slowest, higher = faster
let streamInterval;

const dataContainer = document.getElementById('dataContainer');
const toggleBtn = document.getElementById('toggleBtn');
const sensorStreamSection = document.querySelector('.sensor-stream-section');

// Check if sensor stream section is in viewport
function isSensorStreamInView() {
    if (!sensorStreamSection) return false;
    
    const rect = sensorStreamSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Trigger when section is 30% visible from top
    return rect.top <= windowHeight * 0.7 && rect.bottom >= 0;
}

// Scroll listener to start stream
window.addEventListener('scroll', () => {
    if (!streamHasStarted && isSensorStreamInView()) {
        streamHasStarted = true;
        isStreaming = true;
        startStream();
    }
});

let currentChar = 0;

function typeNextChar() {
    if (!dataContainer || !isStreaming || currentLine >= sensorData.length) {
        if (currentLine >= sensorData.length) {
            stopStream();
            
            const completionLine = document.createElement('div');
            completionLine.className = 'data-line';
            completionLine.style.marginTop = '2rem';
            completionLine.style.color = '#00e676';
            completionLine.textContent = '✓ Stream complete — 24 hour cycle captured';
            dataContainer.appendChild(completionLine);
        }
        return;
    }

    const line = sensorData[currentLine];
    
    // Create new line element if starting a new line
    if (currentChar === 0) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'data-line';
        
        if (currentLine === 0) {
            lineDiv.className += ' header';
        }
        
        if (line.includes('WATERING') || line.includes('TOUCH') || 
            line.includes('GESTURE') || line.includes('INSPECTION')) {
            lineDiv.className += ' event';
        }
        
        lineDiv.id = `line-${currentLine}`;
        dataContainer.appendChild(lineDiv);
        
        // Auto-scroll
        dataContainer.scrollTop = dataContainer.scrollHeight;
    }

    const currentLineDiv = document.getElementById(`line-${currentLine}`);
    
    // Add the next character
    if (currentChar < line.length) {
        const char = line[currentChar];
        const charSpan = document.createElement('span');
        charSpan.className = 'data-char';
        charSpan.textContent = char;
        currentLineDiv.appendChild(charSpan);
        currentChar++;
    }

    // Move to next line when done
    if (currentChar >= line.length) {
        updateStatsCards(line);
        currentLine++;
        currentChar = 0;
    }
}

function startStream() {
    if (streamInterval) clearInterval(streamInterval);
    
    // Calculate delay based on speed
    const baseDelay = 30; // Base delay in milliseconds per character
    const delay = baseDelay / streamSpeed;
    
    streamInterval = setInterval(typeNextChar, delay);
}

function stopStream() {
    if (streamInterval) {
        clearInterval(streamInterval);
        streamInterval = null;
    }
}

function updateStatsCards(line) {
    const parts = line.split(',');
    if (parts.length < 13) return;

    const temp = parseFloat(parts[2]);
    const humid = parseFloat(parts[3]);
    const lux = parseInt(parts[9]);
    const mycelium = parseFloat(parts[12]);

    const tempValue = document.getElementById('tempValue');
    const humidValue = document.getElementById('humidValue');
    const myceliumValue = document.getElementById('myceliumValue');
    const lightValue = document.getElementById('lightValue');
    
    if (!tempValue) return; // Safety check

    if (!isNaN(temp)) {
        tempValue.innerHTML = `${temp.toFixed(1)}<span class="stat-unit">°C</span>`;
        document.getElementById('tempProgress').style.width = 
            `${((temp - 18) / (27 - 18)) * 100}%`;
    }

    if (!isNaN(humid)) {
        humidValue.innerHTML = `${humid.toFixed(1)}<span class="stat-unit">%</span>`;
        document.getElementById('humidProgress').style.width = 
            `${((humid - 45) / (80 - 45)) * 100}%`;
    }

    if (!isNaN(mycelium)) {
        myceliumValue.innerHTML = `${mycelium.toFixed(1)}<span class="stat-unit">μV</span>`;
        document.getElementById('myceliumProgress').style.width = 
            `${(mycelium / 40) * 100}%`;
    }

    if (!isNaN(lux)) {
        lightValue.innerHTML = `${lux}<span class="stat-unit">lux</span>`;
        document.getElementById('lightProgress').style.width = 
            `${(lux / 2000) * 100}%`;
    }
}

function toggleStream() {
    isStreaming = !isStreaming;
    toggleBtn.textContent = isStreaming ? 'Pause' : 'Resume';
    toggleBtn.classList.toggle('active');
    
    if (isStreaming) {
        startStream();
    } else {
        stopStream();
    }
}

function resetStream() {
    stopStream();
    currentLine = 0;
    currentChar = 0;
    streamHasStarted = false;
    dataContainer.innerHTML = '<div class="data-line header" style="opacity: 1;">Initializing sensor array...</div>';
    
    ['tempValue', 'humidValue', 'myceliumValue', 'lightValue'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.innerHTML = '--';
    });
    ['tempProgress', 'humidProgress', 'myceliumProgress', 'lightProgress'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.width = '0%';
    });
    
    if (!isStreaming) {
        isStreaming = true;
        toggleBtn.textContent = 'Pause';
        toggleBtn.classList.remove('active');
    }
    
    // Wait for scroll to trigger again
}

function setSpeed(speed) {
    streamSpeed = speed;
    
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Restart stream with new speed if already streaming
    if (isStreaming && streamInterval) {
        startStream();
    }
}