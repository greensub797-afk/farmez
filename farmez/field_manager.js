document.addEventListener('DOMContentLoaded', function() {
   
    console.log('FarmEZ Field Manager Dashboard initialized');
    
   
    const sidebarToggle = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');
    
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.toggle('hide');
            console.log('Sidebar toggled:', sidebar.classList.contains('hide') ? 'hidden' : 'visible');
        });
    }
   
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "timeOut": "5000",
        "extendedTimeOut": "1000"
    };
    
    // ================= GLOBAL STATE =================
    let currentJobData = {
        title: '',
        ratePerHour: 0,
        budget: 0,
        duration: { start: '', end: '' },
        location: '',
        coordinates: { lat: 10.6400, lng: 122.9553 },
        skills: [],
        workersNeeded: 0,
        visibility: 'public'
    };
    
    let postedJobs = [];
    let editingField = null;
    let invitedLaborers = new Set(); // Track invited laborers
    
    // Job data
    let jobDetails = {
        id: null,
        title: '',
        ratePerHour: '',
        budget: '',
        location: '',
        coordinates: { lat: 10.6400, lng: 122.9553 },
        startDateTime: '',
        endDateTime: '',
        skills: [],
        workersNeeded: 1,
        remainingWorkers: 1,
        status: 'active'
    };
    
    // Application statistics
    let applicationStats = {
        pending: 0,
        accepted: 0,
        rejected: 0
    };
    
    // Attendance data
    let attendanceData = [];
    
    // Skills data
    const allSkills = [
        'Harvesting', 'Planting', 'Irrigation', 'Pest Control', 'Soil Preparation',
        'Livestock Care', 'Machinery Operation', 'Tractor Driving', 
        'Fertilizer Application', 'Pruning'
    ];
    
    // Data for integrated sections
    const performanceData = [
        { id: 1, name: "Ariana Teodosio", jobs_completed: 127, success_rate: 98, rating: 4.8, earnings: 245600 },
        { id: 2, name: "Emman Garcia", jobs_completed: 89, success_rate: 95, rating: 4.7, earnings: 178200 },
        { id: 3, name: "Jomarey Perez", jobs_completed: 102, success_rate: 97, rating: 4.9, earnings: 204000 },
        { id: 4, name: "Maria Santos", jobs_completed: 76, success_rate: 94, rating: 4.6, earnings: 152000 },
        { id: 5, name: "Juan Cruz", jobs_completed: 64, success_rate: 92, rating: 4.5, earnings: 128000 },
        { id: 6, name: "Luis Ramos", jobs_completed: 92, success_rate: 96, rating: 4.8, earnings: 192000 },
        { id: 7, name: "Ana Mendoza", jobs_completed: 81, success_rate: 93, rating: 4.6, earnings: 162000 }
    ];

    const farmData = [
        { id: 1, name: "Co-op Barotac", jobs: 8, laborers: 12, budget: 45000, status: "on-track", progress: 85 },
        { id: 2, name: "San Miguel Farms", jobs: 5, laborers: 8, budget: 32000, status: "on-track", progress: 75 },
        { id: 3, name: "Pototan Agricultural", jobs: 6, laborers: 10, budget: 38000, status: "on-track", progress: 60 },
        { id: 4, name: "Iloilo Veg Co-op", jobs: 3, laborers: 5, budget: 18000, status: "pending", progress: 25 },
        { id: 5, name: "Dumangas Rice", jobs: 2, laborers: 4, budget: 12000, status: "on-track", progress: 45 },
        { id: 6, name: "Northern Plains", jobs: 7, laborers: 9, budget: 52000, status: "on-track", progress: 90 }
    ];

    const laborerData = [
        { id: 1, name: "Ariana Teodosio", job: "Rice Harvest - Barotac", location: "Barotac Nuevo", status: "active", progress: 65, performance: 98, contact: "+639123456789", email: "ariana@example.com", address: "Barotac Nuevo, Iloilo", rate: 180, skills: ["Harvesting", "Machinery"] },
        { id: 2, name: "Emman Garcia", job: "Corn Planting - San Miguel", location: "San Miguel", status: "active", progress: 40, performance: 95, contact: "+639234567890", email: "emman@example.com", address: "San Miguel, Iloilo", rate: 170, skills: ["Planting", "Irrigation"] },
        { id: 3, name: "Jomarey Perez", job: "Irrigation Setup", location: "Pototan", status: "active", progress: 90, performance: 97, contact: "+639345678901", email: "jomarey@example.com", address: "Pototan, Iloilo", rate: 190, skills: ["Irrigation", "Machinery"] },
        { id: 4, name: "Maria Santos", job: "Vegetable Harvest", location: "Iloilo City", status: "active", progress: 30, performance: 94, contact: "+639456789012", email: "maria@example.com", address: "Iloilo City", rate: 160, skills: ["Harvesting", "Planting"] },
        { id: 5, name: "Juan Cruz", job: "Land Preparation", location: "Dumangas", status: "active", progress: 55, performance: 92, contact: "+639567890123", email: "juan@example.com", address: "Dumangas, Iloilo", rate: 175, skills: ["Soil Preparation", "Tractor Driving"] },
        { id: 6, name: "Luis Ramos", job: "Pesticide Application", location: "San Miguel", status: "pending", progress: 15, performance: 88, contact: "+639678901234", email: "luis@example.com", address: "San Miguel, Iloilo", rate: 165, skills: ["Pest Control", "Fertilizer"] }
    ];

    // Updated Job History Data with new headers
    const jobHistoryData = [
        { id: 1, farm_location: "Barotac Nuevo", job_type: "Rice Harvesting", total_laborers: 8, duration: "5 days", total_cost: "₱57,600", status: "completed", date_completed: "2024-01-15" },
        { id: 2, farm_location: "San Miguel", job_type: "Corn Planting", total_laborers: 6, duration: "3 days", total_cost: "₱24,480", status: "completed", date_completed: "2024-01-20" },
        { id: 3, farm_location: "Pototan", job_type: "Irrigation Setup", total_laborers: 4, duration: "2 days", total_cost: "₱12,160", status: "completed", date_completed: "2024-01-22" },
        { id: 4, farm_location: "Iloilo City", job_type: "Vegetable Harvest", total_laborers: 10, duration: "4 days", total_cost: "₱51,200", status: "completed", date_completed: "2024-01-25" },
        { id: 5, farm_location: "Dumangas", job_type: "Soil Preparation", total_laborers: 5, duration: "3 days", total_cost: "₱21,000", status: "completed", date_completed: "2024-01-28" },
        { id: 6, farm_location: "San Miguel", job_type: "Pest Control", total_laborers: 3, duration: "1 day", total_cost: "₱3,960", status: "completed", date_completed: "2024-01-30" }
    ];
    
    // Store all posted jobs
    let postedJobsList = [];
    
    // Chart instances
    let performanceChartInstance = null;
    
    // DataTable instances
    let performanceTable = null;
    let farmActivityTable = null;
    let laborerActivityTable = null;
    let jobHistoryTable = null;
    let attendanceTable = null;
    
    let isJobPosted = false;
    let currentJobId = null;
    
    // ================= LEAFLET MAP VARIABLES =================
    let map = null;
    let marker = null;
    let defaultLat = 10.8190; 
    let defaultLng = 123.0396;
    let currentLat = defaultLat;
    let currentLng = defaultLng;
    let farmSearchQuery = '';
    
    // ================= CALENDAR DATA =================
    const appData = {
        currentDate: new Date(2025, 0, 1), // January 2025
        dayNightMode: 'day',
        
        // Actual Philippine Holidays 2025-2026
        phHolidays: [
            // 2025 Holidays
            { date: "2025-01-01", name: "New Year's Day", description: "First day of the year" },
            { date: "2025-02-25", name: "EDSA Revolution", description: "People Power Revolution" },
            { date: "2025-04-17", name: "Maundy Thursday", description: "Holy Week observance" },
            { date: "2025-04-18", name: "Good Friday", description: "Commemoration of crucifixion" },
            { date: "2025-04-19", name: "Black Saturday", description: "Day before Easter" },
            { date: "2025-04-20", name: "Easter Sunday", description: "Resurrection of Jesus" },
            { date: "2025-04-09", name: "Araw ng Kagitingan", description: "Day of Valor" },
            { date: "2025-05-01", name: "Labor Day", description: "Workers' day celebration" },
            { date: "2025-06-12", name: "Independence Day", description: "Philippine Independence" },
            { date: "2025-08-21", name: "Ninoy Aquino Day", description: "Assassination anniversary" },
            { date: "2025-08-25", name: "National Heroes Day", description: "Last Monday of August" },
            { date: "2025-11-01", name: "All Saints' Day", description: "Undas holiday" },
            { date: "2025-11-30", name: "Bonifacio Day", description: "Revolutionary hero" },
            { date: "2025-12-25", name: "Christmas Day", description: "Christmas celebration" },
            { date: "2025-12-30", name: "Rizal Day", description: "National hero's day" },
            { date: "2025-12-31", name: "Last Day of Year", description: "New Year's Eve" },
            
            // 2026 Holidays
            { date: "2026-01-01", name: "New Year's Day", description: "First day of the year" },
            { date: "2026-02-25", name: "EDSA Revolution", description: "People Power Revolution" },
            { date: "2026-04-02", name: "Maundy Thursday", description: "Holy Week observance" },
            { date: "2026-04-03", name: "Good Friday", description: "Commemoration of crucifixion" },
            { date: "2026-04-04", name: "Black Saturday", description: "Day before Easter" },
            { date: "2026-04-05", name: "Easter Sunday", description: "Resurrection of Jesus" },
            { date: "2026-04-09", name: "Araw ng Kagitingan", description: "Day of Valor" },
            { date: "2026-05-01", name: "Labor Day", description: "Workers' day celebration" },
            { date: "2026-06-12", name: "Independence Day", description: "Philippine Independence" },
            { date: "2026-08-21", name: "Ninoy Aquino Day", description: "Assassination anniversary" },
            { date: "2026-08-31", name: "National Heroes Day", description: "Last Monday of August" },
            { date: "2026-11-01", name: "All Saints' Day", description: "Undas holiday" },
            { date: "2026-11-30", name: "Bonifacio Day", description: "Revolutionary hero" },
            { date: "2026-12-25", name: "Christmas Day", description: "Christmas celebration" },
            { date: "2026-12-30", name: "Rizal Day", description: "National hero's day" },
            { date: "2026-12-31", name: "Last Day of Year", description: "New Year's Eve" }
        ],
        
        // Actual Work Schedules for 2025
        workSchedules: [
            { id: 1, date: "2025-01-10", endDate: "2025-01-15", jobType: "Rice Harvesting", crop: "Rice Field A", description: "Complete harvest of Section 1", laborers: [1, 2, 4] },
            { id: 2, date: "2025-01-20", endDate: "2025-01-22", jobType: "Corn Planting", crop: "Corn Field B", description: "New planting season", laborers: [2, 5, 7] },
            { id: 3, date: "2025-01-25", endDate: "2025-01-26", jobType: "Irrigation Maintenance", crop: "Rice Field A", description: "Regular maintenance", laborers: [3, 6] },
            { id: 4, date: "2025-01-28", endDate: "2025-01-30", jobType: "Fertilizing", crop: "All Fields", description: "Monthly fertilizing", laborers: [4, 8, 10] },
            { id: 5, date: "2025-02-05", endDate: "2025-02-07", jobType: "Pest Control", crop: "Vegetable Garden", description: "Preventive spraying", laborers: [5, 9] }
        ]
    };
    
    // ================= TOASTR NOTIFICATIONS =================
    function showToast(message, type = 'info') {
        toastr.options = {
            positionClass: 'toast-top-right',
            progressBar: true,
            closeButton: true,
            timeOut: 3000,
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut',
            newestOnTop: true
        };
        
        switch(type) {
            case 'success':
                toastr.success(message);
                break;
            case 'error':
                toastr.error(message);
                break;
            case 'warning':
                toastr.warning(message);
                break;
            default:
                toastr.info(message);
        }
    }
    
    // ================= FADE TRANSITIONS =================
    function closeWithFade(modalId) {
        const modal = $(`#${modalId}`);
        modal.addClass('fade-out');
        
        setTimeout(() => {
            closeModal(modalId);
            modal.removeClass('fade-out');
        }, 300);
    }
    
    // ================= CALENDAR FUNCTIONS =================
    function initializeCalendar() {
        // Initialize calendar when DOM is loaded
        updateCalendarDisplay();
        
        // Add event listener for day/night toggle
        document.getElementById('dayNightSwitch').addEventListener('click', toggleDayNight);
    }
    
    function updateCalendarDisplay() {
        const monthYear = appData.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('currentMonthYear').textContent = monthYear;
        
        generateNormalCalendar();
    }
    
    function generateNormalCalendar() {
        const gridContainer = document.getElementById('calendarGrid');
        if (!gridContainer) return;
        
        const currentDate = new Date(appData.currentDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Create calendar header
        let calendarHTML = `
            <div class="calendar-day-header">Sun</div>
            <div class="calendar-day-header">Mon</div>
            <div class="calendar-day-header">Tue</div>
            <div class="calendar-day-header">Wed</div>
            <div class="calendar-day-header">Thu</div>
            <div class="calendar-day-header">Fri</div>
            <div class="calendar-day-header">Sat</div>
        `;
        
        // Add empty cells for days before first day of month
        const startingDay = firstDay.getDay();
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }
        
        // Today's date for highlighting
        const today = new Date(2025, 0, 15); // January 15, 2025 for demo
        const todayStr = formatDate(today);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const isToday = dateStr === todayStr;
            
            // Determine day classes
            let dayClasses = 'calendar-day';
            let eventsHTML = '';
            let holidayDesc = '';
            
            if (isToday) {
                dayClasses += ' today';
            }
            
            // Check for Philippine holidays
            const holiday = appData.phHolidays.find(h => h.date === dateStr);
            if (holiday) {
                dayClasses += ' holiday';
                eventsHTML += `<div class="calendar-event event-holiday">${holiday.name}</div>`;
                holidayDesc = `<div class="holiday-desc">${holiday.description}</div>`;
            }
            
            // Check for work schedules
            const workSchedule = appData.workSchedules.find(w => 
                isDateBetween(dateStr, w.date, w.endDate)
            );
            
            if (workSchedule) {
                dayClasses += ' work-scheduled';
                if (dateStr === workSchedule.date) {
                    eventsHTML += `<div class="calendar-event event-work">${workSchedule.jobType}</div>`;
                }
            }
            
            // Add weather/moon forecast ON THE DATE
            let weatherHTML = '';
            if (appData.dayNightMode === 'day') {
                const weather = getWeatherForDate(dateStr);
                weatherHTML = `
                    <div class="weather-info">
                        <div class="weather-temp">${weather.temp}°C</div>
                        <i class="fas ${weather.icon} weather-icon" title="${weather.condition}"></i>
                    </div>
                `;
            } else {
                const moon = getMoonPhaseForDate(dateStr);
                weatherHTML = `
                    <div class="weather-info">
                        <div class="weather-temp">${moon.illumination}</div>
                        <i class="fas ${moon.icon} moon-icon" title="${moon.phase}"></i>
                    </div>
                `;
            }
            
            calendarHTML += `
                <div class="${dayClasses}">
                    <div class="day-number">
                        <span>${day}</span>
                        <div class="day-weather">${weatherHTML}</div>
                    </div>
                    ${eventsHTML}
                    ${holidayDesc}
                </div>
            `;
        }
        
        gridContainer.innerHTML = calendarHTML;
    }
    
    function getWeatherForDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth();
        
        const conditions = [
            { temp: 32, condition: "Sunny", icon: "fa-sun" },
            { temp: 31, condition: "Partly Cloudy", icon: "fa-cloud-sun" },
            { temp: 30, condition: "Rain", icon: "fa-cloud-rain" },
            { temp: 29, condition: "Thunderstorms", icon: "fa-bolt" },
            { temp: 31, condition: "Cloudy", icon: "fa-cloud" }
        ];
        
        return conditions[(day + month) % conditions.length];
    }
    
    function getMoonPhaseForDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        
        const phases = [
            { phase: "New Moon", icon: "fa-circle", illumination: "0%" },
            { phase: "Waxing Crescent", icon: "fa-moon", illumination: "25%" },
            { phase: "First Quarter", icon: "fa-circle-half-stroke", illumination: "50%" },
            { phase: "Waxing Gibbous", icon: "fa-circle-half-stroke", illumination: "75%" },
            { phase: "Full Moon", icon: "fa-circle", illumination: "100%" },
            { phase: "Waning Gibbous", icon: "fa-circle-half-stroke", illumination: "75%" },
            { phase: "Last Quarter", icon: "fa-circle-half-stroke", illumination: "50%" },
            { phase: "Waning Crescent", icon: "fa-moon", illumination: "25%" }
        ];
        
        return phases[day % phases.length];
    }
    
    function toggleDayNight() {
        const toggle = document.getElementById('dayNightSwitch');
        const container = document.getElementById('calendarContainer');
        
        if (appData.dayNightMode === 'day') {
            appData.dayNightMode = 'night';
            toggle.classList.add('night');
            container.classList.add('night-mode');
        } else {
            appData.dayNightMode = 'day';
            toggle.classList.remove('night');
            container.classList.remove('night-mode');
        }
        
        generateNormalCalendar();
    }
    
    function prevMonth() {
        appData.currentDate.setMonth(appData.currentDate.getMonth() - 1);
        updateCalendarDisplay();
    }
    
    function nextMonth() {
        appData.currentDate.setMonth(appData.currentDate.getMonth() + 1);
        updateCalendarDisplay();
    }
    
    // Utility functions needed by calendar
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function isDateBetween(date, startDate, endDate) {
        const checkDate = new Date(date).getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return checkDate >= start && checkDate <= end;
    }
    
    // ================= LEAFLET MAP FUNCTIONS =================
    function initMap() {
        if (map) {
            map.remove();
            map = null;
        }
        
        // Initialize map with OpenStreetMap
        map = L.map('jobLocationMap').setView([defaultLat, defaultLng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add custom marker icon
        const customIcon = L.divIcon({
            html: '<div style="background: var(--leaf); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><ion-icon name="location" style="color: white; font-size: 12px;"></ion-icon></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            className: 'leaflet-marker-icon'
        });
        
        // Add initial marker
        marker = L.marker([defaultLat, defaultLng], {
            draggable: true,
            title: "Drag to set farm location",
            icon: customIcon
        }).addTo(map);
        
        // Bind popup to marker
        marker.bindPopup("<strong>Farm Location</strong><br>Drag to adjust").openPopup();
        
        // Update location input when marker is dragged
        marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            updateLocationInput(position.lat, position.lng);
            map.panTo(position);
        });
        
        // Update marker when map is clicked
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateLocationInput(e.latlng.lat, e.latlng.lng);
            marker.openPopup();
        });
        
        // Update current coordinates when marker moves
        marker.on('move', function(e) {
            const position = marker.getLatLng();
            currentLat = position.lat;
            currentLng = position.lng;
            updateCoordinatesDisplay();
        });
        
        // Set initial location
        updateLocationInput(defaultLat, defaultLng);
        updateCoordinatesDisplay();
    }
    
    function updateLocationInput(lat, lng) {
        const latFormatted = lat.toFixed(6);
        const lngFormatted = lng.toFixed(6);
        
        currentLat = lat;
        currentLng = lng;
        updateCoordinatesDisplay();
        
        // Try to get address from coordinates using Nominatim reverse geocoding
        getAddressFromCoordinates(lat, lng);
    }
    
    function updateCoordinatesDisplay() {
        $('#coordinatesDisplay').text(`${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`);
    }
    
    // Function to parse coordinates from various formats
    function parseCoordinates(input) {
        input = input.trim();
        
        // Handle DMS format like "10°39'36.0"N 122°57'18.0"E"
        const dmsRegex = /(\d+)°\s*(\d+)['′]\s*([\d.]+)["″]\s*([NSEWnsew])\s*(\d+)°\s*(\d+)['′]\s*([\d.]+)["″]\s*([NSEWnsew])/;
        const dmsMatch = input.match(dmsRegex);
        
        if (dmsMatch) {
            const latDeg = parseFloat(dmsMatch[1]);
            const latMin = parseFloat(dmsMatch[2]);
            const latSec = parseFloat(dmsMatch[3]);
            const latDir = dmsMatch[4].toUpperCase();
            
            const lngDeg = parseFloat(dmsMatch[5]);
            const lngMin = parseFloat(dmsMatch[6]);
            const lngSec = parseFloat(dmsMatch[7]);
            const lngDir = dmsMatch[8].toUpperCase();
            
            let lat = latDeg + latMin/60 + latSec/3600;
            let lng = lngDeg + lngMin/60 + lngSec/3600;
            
            if (latDir === 'S') lat = -lat;
            if (lngDir === 'W') lng = -lng;
            
            return { lat, lng };
        }
        
        // Handle decimal format like "10.66, -123.09" or "10.66° N, 123.09° W"
        const decimalRegex = /([-]?\d+(\.\d+)?)\s*°?\s*([NSEWnsew])?\s*[,]?\s*([-]?\d+(\.\d+)?)\s*°?\s*([NSEWnsew])?/;
        const decimalMatch = input.match(decimalRegex);
        
        if (decimalMatch) {
            let lat = parseFloat(decimalMatch[1]);
            const latDir = decimalMatch[3] ? decimalMatch[3].toUpperCase() : null;
            let lng = parseFloat(decimalMatch[4]);
            const lngDir = decimalMatch[6] ? decimalMatch[6].toUpperCase() : null;
            
            if (latDir === 'S') lat = -lat;
            if (lngDir === 'W') lng = -lng;
            
            return { lat, lng };
        }
        
        return null;
    }
    
    // Function to extract farm name, road, and city from address
    function extractAddressComponents(fullAddress) {
        // Try to extract farm name from the original search query
        const farmName = farmSearchQuery || "Farm Location";
        
        // Parse the address to extract road and city
        let road = '';
        let city = '';
        
        // Try to find common Philippine address patterns
        const addressParts = fullAddress.split(',');
        
        if (addressParts.length >= 2) {
            // Usually road is in the first part, city in the second
            road = addressParts[0].trim();
            city = addressParts[1].trim();
            
            // If we have more parts, try to get a better city name
            if (addressParts.length >= 3) {
                // Look for "Bacolod" or other city names
                for (let i = 1; i < addressParts.length; i++) {
                    const part = addressParts[i].trim();
                    if (part.includes('Bacolod') || 
                        part.includes('Negros') || 
                        part.includes('City') ||
                        part.match(/\b[A-Z][a-z]+\b/)) {
                        city = part;
                        break;
                    }
                }
            }
        } else {
            road = fullAddress;
            city = "Philippines";
        }
        
        // Clean up road name
        road = road.replace(/^\d+\s*/, '').replace(/[0-9]{4,}/, '').trim();
        
        return {
            farmName: farmName,
            road: road,
            city: city,
            fullAddress: fullAddress
        };
    }
    
    function getAddressFromCoordinates(lat, lng) {
        // Show loading
        showToast('Getting address information...', 'info');
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data.display_name) {
                    const address = data.display_name;
                    $('#jobLocation').val(address);
                    
                    // Extract components and update the farm name and location field
                    const components = extractAddressComponents(address);
                    const formattedLocation = `${components.farmName}, ${components.road}, ${components.city}`;
                    $('#farmNameLocation').val(formattedLocation);
                    
                    showToast('Address found and location field updated!', 'success');
                }
            })
            .catch(error => {
                console.log('Reverse geocoding failed:', error);
                // Fallback: create a simple address from coordinates
                const simpleAddress = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                const formattedLocation = `${farmSearchQuery || "Farm Location"}, ${simpleAddress}, Philippines`;
                $('#farmNameLocation').val(formattedLocation);
            });
    }
    
    function searchLocation() {
        const query = $('#jobLocation').val();
        if (!query.trim()) return;
        
        // Store the original query for farm name
        farmSearchQuery = query;
        
        // Show loading
        const searchBtn = $('#searchLocationBtn');
        const originalText = searchBtn.html();
        searchBtn.html('<ion-icon name="search"></ion-icon> Searching...').prop('disabled', true);
        
        // First, try to parse as coordinates
        const coordinates = parseCoordinates(query);
        
        if (coordinates) {
            // If coordinates were successfully parsed, use them
            const lat = coordinates.lat;
            const lng = coordinates.lng;
            
            // Update map view
            map.setView([lat, lng], 15);
            
            // Update marker position
            marker.setLatLng([lat, lng]);
            
            // Update coordinates
            currentLat = lat;
            currentLng = lng;
            updateCoordinatesDisplay();
            
            // Get address from coordinates
            getAddressFromCoordinates(lat, lng);
            
            // Open popup
            marker.bindPopup(`<strong>Coordinates found</strong><br>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
            
            searchBtn.html(originalText).prop('disabled', false);
            showToast('Coordinates located successfully!', 'success');
            return;
        }
        
        // If not coordinates, search as a place name
        // Use Nominatim API for geocoding with Philippines focus
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Philippines')}&limit=1`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    
                    // Update map view
                    map.setView([lat, lng], 15);
                    
                    // Update marker position
                    marker.setLatLng([lat, lng]);
                    
                    // Update coordinates
                    currentLat = lat;
                    currentLng = lng;
                    updateCoordinatesDisplay();
                    
                    // Get detailed address
                    getAddressFromCoordinates(lat, lng);
                    
                    // Open popup
                    marker.bindPopup(`<strong>${data[0].display_name.split(',')[0]}</strong><br>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
                } else {
                    showToast('Location not found. Please try another search or enter coordinates.', 'warning');
                }
            })
            .catch(error => {
                console.log('Location search failed:', error);
                showToast('Unable to search for location. Please check your connection.', 'error');
            })
            .finally(() => {
                // Reset button
                searchBtn.html(originalText).prop('disabled', false);
            });
    }
    
    function getCurrentLocation() {
        if (!navigator.geolocation) {
            showToast('Your browser does not support geolocation.', 'error');
            return;
        }
        
        // Show loading
        const locationBtn = $('#useCurrentLocation');
        const originalText = locationBtn.html();
        locationBtn.html('<ion-icon name="locate"></ion-icon> Getting location...').prop('disabled', true);
        
        showToast('Getting your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Update map view
                map.setView([lat, lng], 15);
                
                // Update marker position
                marker.setLatLng([lat, lng]);
                
                // Update coordinates
                currentLat = lat;
                currentLng = lng;
                updateCoordinatesDisplay();
                
                // Get address
                getAddressFromCoordinates(lat, lng);
                
                marker.bindPopup(`<strong>Your Current Location</strong><br>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
                
                locationBtn.html(originalText).prop('disabled', false);
                showToast('Location found!', 'success');
            },
            function(error) {
                showToast('Unable to get your current location. Please allow location access or enter manually.', 'error');
                locationBtn.html(originalText).prop('disabled', false);
            }
        );
    }
    
    // ================= DURATION CALCULATION FUNCTIONS =================
    function calculateTotalHours() {
        const startDate = $('#jobStartDate').val();
        const startTime = $('#jobStartTime').val();
        const endDate = $('#jobEndDate').val();
        const endTime = $('#jobEndTime').val();
        
        if (!startDate || !startTime || !endDate || !endTime) return 0;
        
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        
        if (endDateTime <= startDateTime) return 0;
        
        // Calculate difference in milliseconds
        const timeDiff = endDateTime.getTime() - startDateTime.getTime();
        
        // Convert to hours
        const totalHours = timeDiff / (1000 * 60 * 60);
        
        return Math.max(0, Math.round(totalHours * 10) / 10); // Round to 1 decimal
    }
    
    function updateDurationCalculation() {
        const startDate = $('#jobStartDate').val();
        const startTime = $('#jobStartTime').val();
        const endDate = $('#jobEndDate').val();
        const endTime = $('#jobEndTime').val();
        
        if (startDate && startTime && endDate && endTime) {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            
            if (endDateTime > startDateTime) {
                // Calculate difference in milliseconds
                const timeDiff = endDateTime.getTime() - startDateTime.getTime();
                
                // Calculate days and hours
                const totalHours = timeDiff / (1000 * 60 * 60);
                const days = Math.floor(totalHours / 24);
                const hours = Math.round((totalHours % 24) * 10) / 10;
                
                $('#durationText').text(`${days} days ${hours} hours`);
                $('#totalHours').text(totalHours.toFixed(1));
            } else {
                $('#durationText').text('0 days 0 hours');
                $('#totalHours').text('0');
            }
        } else {
            $('#durationText').text('0 days 0 hours');
            $('#totalHours').text('0');
        }
    }
    
    // ================= POPULATE SKILLS CHECKBOXES =================
    function populateSkillsCheckboxes(containerId, selectedSkills = []) {
        const container = $(`#${containerId}`);
        container.empty();
        
        allSkills.forEach(skill => {
            const label = $('<label>');
            const checkbox = $('<input>').attr({
                type: 'checkbox',
                value: skill,
                name: containerId.includes('view') ? 'viewSkills' : 'skills'
            });
            
            if (selectedSkills.includes(skill)) {
                checkbox.prop('checked', true);
            }
            
            label.append(checkbox);
            label.append(` ${skill}`);
            container.append(label);
        });
    }
    
    // ================= APPLICATION STATS FUNCTIONS =================
    function updateApplicationStatsDisplay() {
        $('#statPending').text(applicationStats.pending);
        $('#statAccepted').text(applicationStats.accepted);
        $('#statRejected').text(applicationStats.rejected);
    }
    
    // ================= INTEGRATED DASHBOARD FUNCTIONS =================
    
    // Performance Chart Initialization
    function initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        // Prepare data for chart
        const labels = performanceData.map(p => p.name);
        const jobsData = performanceData.map(p => p.jobs_completed);
        const successRateData = performanceData.map(p => p.success_rate);
        const earningsData = performanceData.map(p => p.earnings / 1000); // Convert to thousands for better scaling
        
        // Destroy existing chart if it exists
        if (performanceChartInstance) {
            performanceChartInstance.destroy();
        }
        
        performanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Jobs Completed',
                        data: jobsData,
                        backgroundColor: 'rgba(27, 123, 68, 0.8)',
                        borderColor: 'rgba(27, 123, 68, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Success Rate (%)',
                        data: successRateData,
                        backgroundColor: 'rgba(53, 179, 95, 0.6)',
                        borderColor: 'rgba(53, 179, 95, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Earnings (₱ thousands)',
                        data: earningsData,
                        backgroundColor: 'rgba(111, 154, 124, 0.6)',
                        borderColor: 'rgba(111, 154, 124, 1)',
                        borderWidth: 1,
                        borderRadius: 5,
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label.includes('Earnings')) {
                                    return `${label}: ₱${(context.raw * 1000).toLocaleString()}`;
                                }
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Jobs Completed'
                        },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Success Rate (%)'
                        },
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Earnings (₱ thousands)'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: function(value) {
                                return `₱${value}k`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Performance Table Initialization
    function initializePerformanceTable() {
        performanceTable = $('#performanceTable').DataTable({
            data: performanceData,
            columns: [
                { 
                    data: 'name',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { data: 'jobs_completed' },
                { 
                    data: 'success_rate',
                    render: function(data, type, row) {
                        return `${data}%`;
                    }
                },
                { 
                    data: 'rating',
                    render: function(data, type, row) {
                        return `<span class="rating">${data}★</span>`;
                    }
                },
                { 
                    data: 'earnings',
                    render: function(data, type, row) {
                        return `₱${data.toLocaleString()}`;
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            order: [[1, 'desc']], // Sort by jobs completed by default
            dom: '<"top"f>rt<"bottom"lip><"clear">',
            language: {
                search: "Search workers:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries"
            }
        });
    }
    
    // Job History Table Initialization (UPDATED HEADERS)
    function initializeJobHistoryTable() {
        jobHistoryTable = $('#jobHistoryTable').DataTable({
            data: jobHistoryData,
            columns: [
                { 
                    data: 'farm_location',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { 
                    data: 'job_type',
                    render: function(data, type, row) {
                        return `${data}`;
                    }
                },
                { 
                    data: 'total_laborers',
                    render: function(data, type, row) {
                        return `${data} laborers`;
                    }
                },
                { data: 'duration' },
                { 
                    data: 'total_cost',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { 
                    data: 'status',
                    render: function(data, type, row) {
                        const statusClass = 'status-active';
                        return `<span class="status-badge ${statusClass}">Completed</span>`;
                    }
                },
                { 
                    data: 'date_completed',
                    render: function(data, type, row) {
                        return new Date(data).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25], [5, 10, 25]],
            order: [[6, 'desc']], // Sort by date by default
            dom: '<"top"f>rt<"bottom"lip><"clear">',
            language: {
                search: "Search jobs:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries"
            }
        });
    }
    
    // Farm Activity Table Initialization
    function initializeFarmActivityTable() {
        farmActivityTable = $('#farmActivityTable').DataTable({
            data: farmData,
            columns: [
                { 
                    data: 'name',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { data: 'jobs' },
                { 
                    data: 'laborers',
                    render: function(data, type, row) {
                        return `${data} laborers`;
                    }
                },
                { 
                    data: 'budget',
                    render: function(data, type, row) {
                        return `₱${data.toLocaleString()}`;
                    }
                },
                { 
                    data: 'status',
                    render: function(data, type, row) {
                        const statusClass = data === 'on-track' ? 'status-on-track' : 'status-pending';
                        const statusText = data === 'on-track' ? 'On Track' : 'Pending';
                        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
                    }
                },
                { 
                    data: 'progress',
                    render: function(data, type, row) {
                        return `
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${data}%"></div>
                                </div>
                                <span>${data}%</span>
                            </div>
                        `;
                    }
                },
                {
                    data: null,
                    orderable: false,
                    render: function(data, type, row) {
                        return `
                            <div class="action-buttons">
                                <button class="action-btn view-btn" title="View" onclick="viewFarmActivity(${row.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn edit-btn" title="Edit" onclick="editFarmActivity(${row.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" title="Cancel" onclick="cancelFarm(${row.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25], [5, 10, 25]],
            order: [[0, 'asc']],
            dom: '<"top"f>rt<"bottom"lip><"clear">',
            language: {
                search: "Search farms:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries"
            }
        });
    }
    
    // Laborer Activity Table Initialization
    function initializeLaborerActivityTable() {
        laborerActivityTable = $('#laborerActivityTable').DataTable({
            data: laborerData,
            columns: [
                { 
                    data: 'name',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { data: 'job' },
                { data: 'location' },
                { 
                    data: 'status',
                    render: function(data, type, row) {
                        const statusClass = data === 'active' ? 'status-active' : 'status-pending';
                        const statusText = data === 'active' ? 'Active' : 'Pending';
                        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
                    }
                },
                { 
                    data: 'progress',
                    render: function(data, type, row) {
                        return `
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${data}%"></div>
                                </div>
                                <span>${data}%</span>
                            </div>
                        `;
                    }
                },
                { 
                    data: 'performance',
                    render: function(data, type, row) {
                        return `<span class="rating">${data}/100</span>`;
                    }
                },
                {
                    data: null,
                    orderable: false,
                    render: function(data, type, row) {
                        return `
                            <div class="action-buttons">
                                <button class="action-btn view-btn" title="View" onclick="viewLaborer(${row.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="action-btn percentage-btn" title="Add Percentage" onclick="addPercentage(${row.id})">
                                    <i class="fas fa-percentage"></i>
                                </button>
                                <button class="action-btn dismiss-btn" title="Dismiss" onclick="dismissLaborer(${row.id})">
                                    <i class="fas fa-user-times"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            pageLength: 5,
            lengthMenu: [[5, 10, 25], [5, 10, 25]],
            order: [[4, 'desc']], // Sort by progress by default
            dom: '<"top"f>rt<"bottom"lip><"clear">',
            language: {
                search: "Search laborers:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries"
            }
        });
    }
    
    // Attendance Table Initialization
    function initializeAttendanceTable() {
        // Sample attendance data
        const today = new Date().toISOString().split('T')[0];
        
        const attendanceSampleData = [
            { id: 1, name: "Ariana Teodosio", checkIn: "08:00", checkOut: "17:00", status: "present", hours: 9, date: today },
            { id: 2, name: "Emman Garcia", checkIn: "08:15", checkOut: "17:00", status: "late", hours: 8.75, date: today },
            { id: 3, name: "Jomarey Perez", checkIn: "08:00", checkOut: "17:00", status: "present", hours: 9, date: today },
            { id: 4, name: "Maria Santos", checkIn: "", checkOut: "", status: "absent", hours: 0, date: today },
            { id: 5, name: "Juan Cruz", checkIn: "08:30", checkOut: "17:00", status: "late", hours: 8.5, date: today },
            { id: 6, name: "Luis Ramos", checkIn: "08:00", checkOut: "17:00", status: "present", hours: 9, date: today }
        ];
        
        attendanceData = attendanceSampleData;
        
        attendanceTable = $('#attendanceTable').DataTable({
            data: attendanceData,
            columns: [
                { 
                    data: 'name',
                    render: function(data, type, row) {
                        return `<strong>${data}</strong>`;
                    }
                },
                { 
                    data: 'checkIn',
                    render: function(data, type, row) {
                        return data || '-';
                    }
                },
                { 
                    data: 'checkOut',
                    render: function(data, type, row) {
                        return data || '-';
                    }
                },
                { 
                    data: 'status',
                    render: function(data, type, row) {
                        const statusClass = data === 'present' ? 'status-present' : 
                                          data === 'absent' ? 'status-absent' : 'status-late';
                        const statusText = data === 'present' ? 'Present' : 
                                         data === 'absent' ? 'Absent' : 'Late';
                        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
                    }
                },
                { 
                    data: 'hours',
                    render: function(data, type, row) {
                        return `${data} hours`;
                    }
                },
                { 
                    data: 'date',
                    render: function(data, type, row) {
                        return new Date(data).toLocaleDateString();
                    }
                },
                {
                    data: null,
                    orderable: false,
                    render: function(data, type, row) {
                        return `
                            <div class="action-buttons">
                                <button class="action-btn edit-btn" title="Edit" onclick="editAttendance(${row.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" title="Delete" onclick="deleteAttendance(${row.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            pageLength: 10,
            lengthMenu: [[10, 25, 50], [10, 25, 50]],
            order: [[0, 'asc']],
            dom: '<"top"f>rt<"bottom"lip><"clear">',
            language: {
                search: "Search attendance:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries"
            }
        });
        
        // Update attendance stats
        updateAttendanceStats();
    }
    
    function updateAttendanceStats() {
        const present = attendanceData.filter(a => a.status === 'present').length;
        const absent = attendanceData.filter(a => a.status === 'absent').length;
        const late = attendanceData.filter(a => a.status === 'late').length;
        const total = attendanceData.length;
        
        $('#presentCount').text(present);
        $('#absentCount').text(absent);
        $('#lateCount').text(late);
        $('#totalWorkers').text(total);
    }
    
    // Setup Filter Controls
    function setupFilterControls() {
        // Performance filters
        $('.filter-btn').on('click', function() {
            const filterType = $(this).data('filter');
            const section = $(this).closest('.dashboard-section');
            
            // Update active state
            $(this).siblings('.filter-btn').removeClass('active');
            $(this).addClass('active');
            
            // Apply filter based on section
            if (section.find('#performanceTable').length) {
                // Performance table filtering
                filterPerformanceTable(filterType);
            } else if (section.find('#farmActivityTable').length) {
                // Farm activity filtering
                filterFarmTable(filterType);
            } else if (section.find('#laborerActivityTable').length) {
                // Laborer activity filtering
                filterLaborerTable(filterType);
            } else if (section.find('#jobHistoryTable').length) {
                // Job history filtering
                filterJobHistoryTable(filterType);
            }
        });
    }
    
    // Filter Performance Table
    function filterPerformanceTable(filterType) {
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex, rowData, counter) {
                if (filterType === 'all') return true;
                if (filterType === 'high-rating') return rowData.rating >= 4.7;
                if (filterType === 'high-earnings') return rowData.earnings >= 180000;
                return true;
            }
        );
        
        performanceTable.draw();
        
        // Remove the filter function after applying
        $.fn.dataTable.ext.search.pop();
    }
    
    // Filter Farm Table
    function filterFarmTable(filterType) {
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex, rowData, counter) {
                if (filterType === 'all') return true;
                if (filterType === 'on-track') return rowData.status === 'on-track';
                if (filterType === 'high-budget') return rowData.budget >= 30000;
                return true;
            }
        );
        
        farmActivityTable.draw();
        
        // Remove the filter function after applying
        $.fn.dataTable.ext.search.pop();
    }
    
    // Filter Laborer Table
    function filterLaborerTable(filterType) {
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex, rowData, counter) {
                if (filterType === 'all') return true;
                if (filterType === 'active') return rowData.status === 'active';
                if (filterType === 'high-progress') return rowData.progress >= 70;
                return true;
            }
        );
        
        laborerActivityTable.draw();
        
        // Remove the filter function after applying
        $.fn.dataTable.ext.search.pop();
    }
    
    // Filter Job History Table
    function filterJobHistoryTable(filterType) {
        const today = new Date();
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex, rowData, counter) {
                if (filterType === 'all') return true;
                
                const jobDate = new Date(rowData.date_completed);
                
                if (filterType === 'week') {
                    return jobDate >= thisWeekStart;
                }
                if (filterType === 'month') {
                    return jobDate >= thisMonthStart;
                }
                return true;
            }
        );
        
        jobHistoryTable.draw();
        
        // Remove the filter function after applying
        $.fn.dataTable.ext.search.pop();
    }
    
    // ================= ACTION FUNCTIONS FOR DATATABLES =================
    window.viewFarmActivity = function(id) {
        const farm = farmData.find(f => f.id === id);
        if (farm) {
            // Set modal title
            $('#farmViewTitle').text('View Farm Activity');
            
            // Populate form with data
            $('#viewFarmName').val(farm.name);
            $('#viewFarmLocation').val('Barotac Nuevo'); // Default location
            $('#viewLaborersCount').val(farm.laborers);
            $('#viewRatePerHour').val(180); // Default rate
            $('#viewTotalBudget').val(farm.budget);
            $('#viewWorkersNeeded').val(farm.laborers);
            
            // Set dates
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            $('#viewStartDateTime').val(today.toISOString().slice(0, 16));
            $('#viewEndDateTime').val(tomorrow.toISOString().slice(0, 16));
            
            // Populate job list
            const jobList = $('#viewJobList');
            jobList.empty();
            postedJobsList.forEach(job => {
                jobList.append(new Option(job.title, job.id));
            });
            
            // Populate laborers list
            const laborersList = $('#viewLaborersList');
            laborersList.empty();
            laborerData.forEach(laborer => {
                laborersList.append(new Option(laborer.name, laborer.id));
            });
            
            // Populate skills
            const skillsDisplay = $('#viewRequiredSkills');
            skillsDisplay.empty();
            allSkills.slice(0, 3).forEach(skill => {
                skillsDisplay.append(`<span class="skill-tag">${skill}</span>`);
            });
            
            // Hide update button for view mode
            $('#updateFarmBtn').hide();
            
            // Make all fields readonly
            $('.farm-details-form input, .farm-details-form select').prop('readonly', true).prop('disabled', true);
            
            openModal('modalFarmView');
        }
    };
    
    window.editFarmActivity = function(id) {
        const farm = farmData.find(f => f.id === id);
        if (farm) {
            // Set modal title
            $('#farmViewTitle').text('Edit Farm Activity');
            
            // Populate form with data
            $('#viewFarmName').val(farm.name);
            $('#viewFarmLocation').val('Barotac Nuevo'); // Default location
            $('#viewLaborersCount').val(farm.laborers);
            $('#viewRatePerHour').val(180); // Default rate
            $('#viewTotalBudget').val(farm.budget);
            $('#viewWorkersNeeded').val(farm.laborers);
            
            // Set dates
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            $('#viewStartDateTime').val(today.toISOString().slice(0, 16));
            $('#viewEndDateTime').val(tomorrow.toISOString().slice(0, 16));
            
            // Populate job list
            const jobList = $('#viewJobList');
            jobList.empty();
            postedJobsList.forEach(job => {
                jobList.append(new Option(job.title, job.id));
            });
            
            // Populate laborers list
            const laborersList = $('#viewLaborersList');
            laborersList.empty();
            laborerData.forEach(laborer => {
                laborersList.append(new Option(laborer.name, laborer.id));
            });
            
            // Populate skills
            const skillsDisplay = $('#viewRequiredSkills');
            skillsDisplay.empty();
            allSkills.slice(0, 3).forEach(skill => {
                skillsDisplay.append(`<span class="skill-tag">${skill}</span>`);
            });
            
            // Show update button for edit mode
            $('#updateFarmBtn').show();
            
            // Make all fields editable
            $('.farm-details-form input, .farm-details-form select').prop('readonly', false).prop('disabled', false);
            
            // Store farm ID for updating
            $('#updateFarmBtn').data('farm-id', id);
            
            openModal('modalFarmView');
        }
    };
    
    window.editFarm = function(id) {
        const farm = farmData.find(f => f.id === id);
        if (farm) {
            Swal.fire({
                title: 'Edit Farm Details',
                html: `
                    <input id="farmName" class="swal2-input" placeholder="Farm Name" value="${farm.name}">
                    <input id="farmJobs" class="swal2-input" placeholder="Active Jobs" type="number" value="${farm.jobs}">
                    <input id="farmLaborers" class="swal2-input" placeholder="Laborers" type="number" value="${farm.laborers}">
                    <input id="farmBudget" class="swal2-input" placeholder="Budget" type="number" value="${farm.budget}">
                `,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    return {
                        name: document.getElementById('farmName').value,
                        jobs: parseInt(document.getElementById('farmJobs').value),
                        laborers: parseInt(document.getElementById('farmLaborers').value),
                        budget: parseInt(document.getElementById('farmBudget').value)
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    farm.name = result.value.name;
                    farm.jobs = result.value.jobs;
                    farm.laborers = result.value.laborers;
                    farm.budget = result.value.budget;
                    
                    // Update DataTable
                    farmActivityTable.clear();
                    farmActivityTable.rows.add(farmData);
                    farmActivityTable.draw();
                    
                    showToast('Farm details updated successfully!', 'success');
                }
            });
        }
    };
    
    window.cancelFarm = function(id) {
        Swal.fire({
            title: 'Cancel Farm Activity?',
            text: 'Are you sure you want to cancel this farm activity? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: 'var(--sage)',
            confirmButtonText: 'Yes, cancel it',
            cancelButtonText: 'Keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                const index = farmData.findIndex(f => f.id === id);
                if (index !== -1) {
                    farmData.splice(index, 1);
                    
                    // Update DataTable
                    farmActivityTable.clear();
                    farmActivityTable.rows.add(farmData);
                    farmActivityTable.draw();
                    
                    showToast('Farm activity cancelled', 'success');
                }
            }
        });
    };
    
    window.viewLaborer = function(id) {
        const laborer = laborerData.find(l => l.id === id);
        if (laborer) {
            // Populate modal fields
            $('#viewLaborerName').val(laborer.name);
            $('#viewLaborerContact').val(laborer.contact);
            $('#viewLaborerEmail').val(laborer.email);
            $('#viewLaborerAddress').val(laborer.address);
            $('#viewLaborerRate').val(laborer.rate);
            $('#viewLaborerStatus').val(laborer.status);
            
            // Populate skills
            populateSkillsCheckboxes('viewLaborerSkills', laborer.skills);
            
            // Store current laborer ID
            $('#saveLaborerBtn').data('laborer-id', id);
            
            // Open modal
            openModal('modalViewLaborer');
        }
    };
    
    window.addPercentage = function(id) {
        const laborer = laborerData.find(l => l.id === id);
        if (laborer) {
            $('#percentageLaborerName').val(laborer.name);
            $('#percentageCurrentJob').val(laborer.job);
            $('#performancePercentage').val(laborer.performance);
            
            // Store current laborer ID
            $('#savePercentage').data('laborer-id', id);
            
            openModal('modalAddPercentage');
        }
    };
    
    window.dismissLaborer = function(id) {
        Swal.fire({
            title: 'Dismiss Laborer?',
            text: 'Are you sure you want to dismiss this laborer? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: 'var(--sage)',
            confirmButtonText: 'Yes, dismiss',
            cancelButtonText: 'Keep'
        }).then((result) => {
            if (result.isConfirmed) {
                const index = laborerData.findIndex(l => l.id === id);
                if (index !== -1) {
                    laborerData.splice(index, 1);
                    
                    // Update DataTable
                    laborerActivityTable.clear();
                    laborerActivityTable.rows.add(laborerData);
                    laborerActivityTable.draw();
                    
                    showToast('Laborer dismissed', 'success');
                }
            }
        });
    };
    
    window.editAttendance = function(id) {
        const attendance = attendanceData.find(a => a.id === id);
        if (attendance) {
            // Populate modal fields
            $('#attendanceLaborer').val(attendance.name);
            $('#attendanceStatus').val(attendance.status);
            $('#checkInTime').val(attendance.checkIn || '08:00');
            $('#checkOutTime').val(attendance.checkOut || '17:00');
            $('#attendanceDate').val(attendance.date);
            
            // Store current attendance ID
            $('#saveAttendance').data('attendance-id', id);
            
            openModal('modalMarkAttendance');
        }
    };
    
    window.deleteAttendance = function(id) {
        Swal.fire({
            title: 'Delete Attendance Record?',
            text: 'Are you sure you want to delete this attendance record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e63946',
            cancelButtonColor: 'var(--sage)',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const index = attendanceData.findIndex(a => a.id === id);
                if (index !== -1) {
                    attendanceData.splice(index, 1);
                    
                    // Update DataTable
                    attendanceTable.clear();
                    attendanceTable.rows.add(attendanceData);
                    attendanceTable.draw();
                    
                    // Update stats
                    updateAttendanceStats();
                    
                    showToast('Attendance record deleted', 'success');
                }
            }
        });
    };
    
    // ================= MODAL FUNCTIONS =================
    function openModal(modalId) {
        $(`#${modalId}`).css('display', 'flex');
        $('body').css('overflow', 'hidden');
        
        // Initialize map when Post Job modal opens
        if (modalId === 'modalPostJob' && !map) {
            setTimeout(initMap, 100);
        }
        
        // Set today's date for attendance modal
        if (modalId === 'modalMarkAttendance') {
            const today = new Date().toISOString().split('T')[0];
            $('#attendanceDate').val(today);
            
            // Populate laborer dropdown
            populateLaborerDropdown();
        }
    }
    
    function closeModal(modalId) {
        $(`#${modalId}`).css('display', 'none');
        $('body').css('overflow', 'auto');
    }
    
    function showLoading() {
        $('#loadingScreen').css('display', 'flex');
    }
    
    function hideLoading() {
        $('#loadingScreen').css('display', 'none');
    }
    
    // ================= VIEW SWITCHING =================
    function showDashboard() {
        $('#dashboardView').show();
        $('#jobView').hide();
        $('#attendanceView').hide();
        updateSidebarActive('dashboard');
    }
    
    function showJobView() {
        $('#dashboardView').hide();
        $('#jobView').show();
        $('#attendanceView').hide();
        updateSidebarActive('job');
    }
    
    function showAttendanceView() {
        $('#dashboardView').hide();
        $('#jobView').hide();
        $('#attendanceView').show();
        updateSidebarActive('attendance');
    }
    
    function updateSidebarActive(view) {
        // Remove active class from all sidebar items
        $('#sidebar .side-menu li').removeClass('active');
        
        // Add active class to the clicked item
        if (view === 'dashboard') {
            $('#openDashboard').parent().addClass('active');
        } else if (view === 'job') {
            $('#openJob').parent().addClass('active');
        } else if (view === 'attendance') {
            $('#openAttendance').parent().addClass('active');
        }
    }
    
    // ================= SIDEBAR AND NAVIGATION FUNCTIONALITY =================
    function initializeSidebar() {
        // Initialize all side menu items
        const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
        
        allSideMenu.forEach(item => {
            const li = item.parentElement;
        
            item.addEventListener('click', function(e) {
                e.preventDefault();
                allSideMenu.forEach(i => {
                    i.parentElement.classList.remove('active');
                });
                li.classList.add('active');
            });
        });
        
        // Sidebar navigation
        $('#openDashboard').click(function(e) {
            e.preventDefault();
            showDashboard();
        });
        
        $('#openJob').click(function(e) {
            e.preventDefault();
            showJobView();
        });
        
        $('#openAttendance').click(function(e) {
            e.preventDefault();
            showAttendanceView();
        });
        
        // Back to dashboard buttons
        $('#backToDashboard').click(function(e) {
            e.preventDefault();
            showDashboard();
        });
        
        $('#backToDashboardFromAttendance').click(function(e) {
            e.preventDefault();
            showDashboard();
        });
        
        // Online/Offline switch
        $('#onlineSwitch').change(function() {
            const isOnline = $(this).is(':checked');
            $('#statusText').text(isOnline ? 'Online' : 'Offline');
            
            // Update user status in system
            const status = isOnline ? 'online' : 'offline';
            showToast(`You are now ${status}`, 'success');
            
            // Here you would typically send this status to your backend
            console.log(`User status updated to: ${status}`);
        });
        
        // Top right navigation
        $('#openMessages').click(function(e) {
            e.preventDefault();
            showToast('Messages feature coming soon!', 'info');
        });
        
        $('#openNotifications').click(function(e) {
            e.preventDefault();
            // Notification dropdown handled by CSS hover
        });
        
        $('#openUserProfile').click(function(e) {
            e.preventDefault();
            // Profile dropdown handled by CSS hover
        });
        
        $('#openMyProfile').click(function(e) {
            e.preventDefault();
            openModal('modalProfile');
        });
        
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            Swal.fire({
                title: 'Log Out?',
                text: 'Are you sure you want to log out of your account?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#1b7b44',
                cancelButtonColor: '#6f9a7c',
                confirmButtonText: 'Yes, log out',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    showToast('Successfully logged out', 'success');
                    setTimeout(() => {
                        window.location.href = '#';
                    }, 1500);
                }
            });
        });
    }
    
    // ================= JOB MANAGEMENT FUNCTIONALITY =================
    function initializeJobManagement() {
        // Populate skills checkboxes
        populateSkillsCheckboxes('postJobSkillsContainer');
        
        // Set default dates with example values
        const today = new Date(2025, 9, 12); // October 12, 2025
        const tomorrow = new Date(2026, 10, 1); // November 1, 2026
        
        $('#jobStartDate').val('2025-10-12');
        $('#jobEndDate').val('2026-11-01');
        $('#jobStartTime').val('22:08'); // 10:08 PM in 24-hour format
        $('#jobEndTime').val('21:00'); // 9:00 PM in 24-hour format
        
        // Clear the farm name and location field initially
        $('#farmNameLocation').val('');
        
        // Initial calculations
        updateDurationCalculation();
        
        // Create New Job button
        $('#btnCreateJob').click(function() {
            openModal('modalPostJob');
        });
        
        // Search location button
        $('#searchLocationBtn').click(function() {
            searchLocation();
        });
        
        // Use Current Location button
        $('#useCurrentLocation').click(function() {
            getCurrentLocation();
        });
        
        // Date and time changes
        $('#jobStartDate, #jobStartTime, #jobEndDate, #jobEndTime').change(function() {
            updateDurationCalculation();
        });
        
        // Submit job post
        $('#submitPost').click(function() {
            // Collect form data
            const farmNameLocation = $('#farmNameLocation').val();
            const jobType = $('#jobType').val();
            const jobLocation = $('#jobLocation').val();
            const jobRatePerHour = $('#jobRatePerHour').val();
            const jobBudget = $('#jobBudget').val();
            const jobStartDate = $('#jobStartDate').val();
            const jobStartTime = $('#jobStartTime').val();
            const jobEndDate = $('#jobEndDate').val();
            const jobEndTime = $('#jobEndTime').val();
            
            // Get selected skills
            const selectedSkills = $('#postJobSkillsContainer input:checked').map(function() {
                return $(this).val();
            }).get();
            
            const jobCount = $('#jobCount').val();
            
            // Validate
            if (!farmNameLocation || !jobType || !jobLocation || !jobRatePerHour || !jobBudget || !jobStartDate || !jobStartTime || !jobEndDate || !jobEndTime) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate dates
            const startDateTime = new Date(`${jobStartDate}T${jobStartTime}`);
            const endDateTime = new Date(`${jobEndDate}T${jobEndTime}`);
            
            if (endDateTime <= startDateTime) {
                showToast('End date/time must be after start date/time', 'error');
                return;
            }
            
            // Calculate duration
            const timeDiff = endDateTime.getTime() - startDateTime.getTime();
            const totalHours = timeDiff / (1000 * 60 * 60);
            const days = Math.floor(totalHours / 24);
            const hours = Math.round((totalHours % 24) * 10) / 10;
            
            // Create job object
            const newJob = {
                id: Date.now(),
                farmNameLocation: farmNameLocation,
                jobType: jobType,
                location: jobLocation,
                coordinates: { lat: currentLat, lng: currentLng },
                ratePerHour: jobRatePerHour,
                budget: jobBudget,
                startDateTime: startDateTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
                skills: selectedSkills,
                workersNeeded: parseInt(jobCount),
                remainingWorkers: parseInt(jobCount),
                status: 'active'
            };
            
            // Add to posted jobs list
            postedJobsList.unshift(newJob);
            
            // Show SweetAlert with job details
            Swal.fire({
                title: 'Job Posted Successfully!',
                html: `
                    <div style="text-align: left; padding: 20px; background: var(--mint); border-radius: 10px;">
                        <p><strong>Farm Name & Location:</strong> ${farmNameLocation}</p>
                        <p><strong>Job Type:</strong> ${jobType}</p>
                        <p><strong>Location:</strong> ${jobLocation}</p>
                        <p><strong>Coordinates:</strong> ${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}</p>
                        <p><strong>Rate:</strong> ₱${jobRatePerHour}/hour</p>
                        <p><strong>Budget:</strong> ₱${jobBudget}</p>
                        <p><strong>Duration:</strong> ${days} days ${hours} hours</p>
                        <p><strong>Workers Needed:</strong> ${jobCount}</p>
                        <p><strong>Skills Required:</strong> ${selectedSkills.join(', ')}</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: 'var(--leaf)',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Add job to farm activity table
                    const newFarmJob = {
                        id: farmData.length + 1,
                        name: farmNameLocation.split(',')[0] || "New Farm",
                        jobs: 1,
                        laborers: parseInt(jobCount),
                        budget: parseInt(jobBudget),
                        status: 'on-track',
                        progress: 0
                    };
                    
                    farmData.unshift(newFarmJob);
                    
                    // Update DataTable
                    farmActivityTable.clear();
                    farmActivityTable.rows.add(farmData);
                    farmActivityTable.draw();
                    
                    showToast('Job added to Farm Activity Overview!', 'success');
                }
            });
            
            // Initialize application stats with some sample pending applications
            applicationStats.pending = 5;
            applicationStats.accepted = 0;
            applicationStats.rejected = 0;
            updateApplicationStatsDisplay();
            
            // Close modal
            closeModal('modalPostJob');
            
            // Reset form
            $('#farmNameLocation').val('');
            $('#jobType').val('');
            $('#jobLocation').val('');
            $('#jobRatePerHour').val('');
            $('#jobBudget').val('');
            $('#jobCount').val('');
            $('#postJobSkillsContainer input:checked').prop('checked', false);
            
            // Reset to default dates
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            $('#jobStartDate').val(today.toISOString().split('T')[0]);
            $('#jobEndDate').val(tomorrow.toISOString().split('T')[0]);
            $('#jobStartTime').val('08:00');
            $('#jobEndTime').val('17:00');
            
            // Reset calculations
            updateDurationCalculation();
            
            // Reset farm search query
            farmSearchQuery = '';
        });
        
        // Cancel post job
        $('#closePostJob').click(function() {
            closeWithFade('modalPostJob');
        });
        
        // View Applicants button
        $('#btnViewApplicants').click(function() {
            openModal('modalApplicants');
            populateApplicants();
        });
        
        // Match Now button
        $('#btnMatchNow').click(function() {
            showLoading();
            
            // Simulate matching process
            setTimeout(() => {
                hideLoading();
                openModal('modalMatch');
                populateMatchResults();
            }, 2000);
        });
    }
    
    // ================= APPLICANTS FUNCTIONALITY =================
    function initializeApplicants() {
        // Close applicants modal
        $('#closeApplicants').click(function() {
            closeWithFade('modalApplicants');
        });
    }
    
    function populateApplicants() {
        const container = $('#applicantsContainer');
        if (!container.length) return;
        
        // Sample applicants data with updated "Farm Applied" label
        const applicants = [
            { id: 1, name: 'Juan Dela Cruz', farm: "Co-op Barotac", rate: '₱1,800/day', status: 'pending' },
            { id: 2, name: 'Maria Santos', farm: "San Miguel Farms", rate: '₱1,750/day', status: 'pending' },
            { id: 3, name: 'Pedro Reyes', farm: "Pototan Agricultural", rate: '₱1,900/day', status: 'pending' },
            { id: 4, name: 'Ana Hernandez', farm: "Iloilo Veg Co-op", rate: '₱1,700/day', status: 'accepted' },
            { id: 5, name: 'Miguel Garcia', farm: "Dumangas Rice", rate: '₱1,850/day', status: 'rejected' }
        ];
        
        container.empty();
        
        applicants.forEach(applicant => {
            const card = $(`
                <div class="applicant-card" data-applicant-id="${applicant.id}">
                    <h4>${applicant.name}</h4>
                    <div class="applicant-meta">
                        <span><strong>Farm Applied:</strong> ${applicant.farm}</span>
                        <span><strong>Rate:</strong> ${applicant.rate}</span>
                        <span class="applicant-status" data-status="${applicant.status}">${applicant.status}</span>
                    </div>
                    <div class="action-buttons">
                        ${applicant.status === 'pending' ? `
                            <button class="small-btn accept-btn">Accept</button>
                            <button class="small-btn reject-btn">Reject</button>
                        ` : applicant.status === 'accepted' ? `
                            <span style="color: var(--leaf); font-weight: 600;">✓ Accepted</span>
                        ` : `
                            <span style="color: #d33; font-weight: 600;">✗ Rejected</span>
                        `}
                    </div>
                </div>
            `);
            
            // Add event handlers
            if (applicant.status === 'pending') {
                card.find('.accept-btn').click(function() {
                    acceptApplicant(applicant.id);
                });
                
                card.find('.reject-btn').click(function() {
                    rejectApplicant(applicant.id);
                });
            }
            
            container.append(card);
        });
        
        // Update stats
        updateApplicationStatsDisplay();
    }
    
    function acceptApplicant(applicantId) {
        const applicantCard = $(`.applicant-card[data-applicant-id="${applicantId}"]`);
        const statusSpan = applicantCard.find('.applicant-status');
        
        // Update status
        statusSpan.text('accepted').attr('data-status', 'accepted').css('color', 'var(--leaf)');
        
        // Update action buttons
        applicantCard.find('.action-buttons').html(`
            <span style="color: var(--leaf); font-weight: 600;">✓ Accepted</span>
        `);
        
        // Update stats
        applicationStats.pending = Math.max(0, applicationStats.pending - 1);
        applicationStats.accepted++;
        updateApplicationStatsDisplay();
        
        showToast('Applicant accepted!', 'success');
        
        // Add to laborer activity table (if not already there)
        const applicantName = applicantCard.find('h4').text();
        const farm = applicantCard.find('span:contains("Farm Applied:")').text().replace('Farm Applied: ', '');
        
        // Check if laborer already exists
        const existingLaborer = laborerData.find(l => l.name === applicantName);
        if (!existingLaborer) {
            const newLaborer = {
                id: laborerData.length + 1,
                name: applicantName,
                job: farm,
                location: farm.split('-')[1]?.trim() || farm,
                status: 'active',
                progress: 0,
                performance: 85,
                contact: '+639000000000',
                email: `${applicantName.toLowerCase().replace(' ', '.')}@example.com`,
                address: 'Address not specified',
                rate: 180,
                skills: ['General Farming']
            };
            
            laborerData.unshift(newLaborer);
            
            // Update DataTable
            laborerActivityTable.clear();
            laborerActivityTable.rows.add(laborerData);
            laborerActivityTable.draw();
            
            showToast('Applicant added to Laborer Activity Overview!', 'success');
        }
    }
    
    function rejectApplicant(applicantId) {
        const applicantCard = $(`.applicant-card[data-applicant-id="${applicantId}"]`);
        const statusSpan = applicantCard.find('.applicant-status');
        
        // Update status
        statusSpan.text('rejected').attr('data-status', 'rejected').css('color', '#d33');
        
        // Update action buttons
        applicantCard.find('.action-buttons').html(`
            <span style="color: #d33; font-weight: 600;">✗ Rejected</span>
        `);
        
        // Update stats
        applicationStats.pending = Math.max(0, applicationStats.pending - 1);
        applicationStats.rejected++;
        updateApplicationStatsDisplay();
        
        showToast('Applicant rejected', 'warning');
    }
    
    // ================= MATCH NOW FUNCTIONALITY =================
    function initializeMatchNow() {
        // Close match modal
        $('#closeMatch').click(function() {
            closeWithFade('modalMatch');
        });
        
        // Close SMS modal
        $('#closeSMS').click(function() {
            closeWithFade('modalSMSInvite');
        });
        
        // Send SMS button
        $('#sendSMSBtn').click(function() {
            const farmName = $('#smsFarmName').val();
            const location = $('#smsLocation').val();
            const message = $('#smsMessage').val();
            
            if (!farmName || !location || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            showToast(`SMS invitation sent for ${farmName}!`, 'success');
            closeModal('modalSMSInvite');
            
            // Reset form
            $('#smsFarmName, #smsLocation, #smsMessage').val('');
        });
    }
    
    function populateMatchResults() {
        const container = $('#matchResults');
        if (!container.length) return;
        
        // Sample match results based on the image
        const matches = [
            { 
                id: 1, 
                name: 'Juan Santos', 
                location: 'Barotac Nuevo', 
                status: 'available',
                rating: '★★★★★ 4.5 (42 jobs)',
                skills: ['Harvesting', 'Planting', 'Irrigation'],
                rate: 'P350/day',
                mobile: '+639123456789'
            },
            { 
                id: 2, 
                name: 'Maria Cruz', 
                location: 'San Miguel', 
                status: 'available',
                rating: '★★★★★ 4.7 (38 jobs)',
                skills: ['Planting', 'Weeding', 'Pruning'],
                rate: 'P320/day',
                mobile: '+639234567890'
            },
            { 
                id: 3, 
                name: 'Pedro Reyes', 
                location: 'Rotolan', 
                status: 'unavailable',
                rating: '★★★★★ 4.9 (56 jobs)',
                skills: ['Harvesting', 'Equipment', 'Transport'],
                rate: 'P380/day',
                mobile: '+639345678901'
            },
            { 
                id: 4, 
                name: 'Ana Hernandez', 
                location: 'Iloilo City', 
                status: 'available',
                rating: '★★★★★ 4.3 (29 jobs)',
                skills: ['Irrigation', 'Soil Prep', 'Fertilizer'],
                rate: 'P340/day',
                mobile: '+639456789012'
            },
            { 
                id: 5, 
                name: 'Luis Mendoza', 
                location: 'Dumangas', 
                status: 'available',
                rating: '★★★★★ 4.8 (47 jobs)',
                skills: ['Equipment', 'Maintenance', 'Harvesting'],
                rate: 'P400/day',
                mobile: '+639567890123'
            }
        ];
        
        container.empty();
        
        matches.forEach(match => {
            // Check if laborer has been invited
            const isInvited = invitedLaborers.has(match.id);
            const statusText = isInvited ? 'Booked' : match.status;
            const statusClass = isInvited ? 'status-booked' : (match.status === 'available' ? 'status-active' : 'status-pending');
            
            const card = $(`
                <div class="match-card" data-match-id="${match.id}">
                    ${isInvited ? '<span class="status-badge status-booked">Booked</span>' : ''}
                    <h4>${match.name} <span style="color: var(--sage); font-size: 0.9rem;">(${match.location})</span></h4>
                    <div class="match-meta">
                        <span><strong>Status:</strong> ${statusText}</span>
                        <span><strong>Rating:</strong> ${match.rating}</span>
                        <span><strong>Skills:</strong> ${match.skills.join(', ')}</span>
                        <span><strong>Rate:</strong> ${match.rate}</span>
                        <span><strong>Mobile:</strong> ${match.mobile}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="small-btn invite-btn ${isInvited ? 'disabled' : ''}" ${isInvited ? 'disabled' : ''}>Invite</button>
                        <button class="small-btn cancel-btn">Cancel</button>
                    </div>
                </div>
            `);
            
            // Add event handlers
            card.find('.invite-btn').click(function() {
                if (!isInvited) {
                    inviteLaborer(match.id, match.name);
                }
            });
            
            card.find('.cancel-btn').click(function() {
                cancelInvitation(match.id, match.name);
            });
            
            // Make the card clickable for SMS modal
            card.on('click', function(e) {
                // Don't trigger if clicking on buttons
                if (!$(e.target).closest('.action-buttons').length) {
                    openSMSModal(match.name, match.mobile);
                }
            });
            
            container.append(card);
        });
    }
    
    function inviteLaborer(laborerId, laborerName) {
        invitedLaborers.add(laborerId);
        showToast(`Invitation sent to ${laborerName}!`, 'success');
        
        // Update the match card to show "Booked" status
        const card = $(`.match-card[data-match-id="${laborerId}"]`);
        card.prepend('<span class="status-badge status-booked">Booked</span>');
        card.find('.invite-btn').addClass('disabled').prop('disabled', true);
        card.find('.match-meta span:first-child strong').text('Status:').next().text('Booked');
    }
    
    function cancelInvitation(laborerId, laborerName) {
        if (invitedLaborers.has(laborerId)) {
            invitedLaborers.delete(laborerId);
            showToast(`Invitation cancelled for ${laborerName}`, 'warning');
            
            // Update the match card to remove "Booked" status
            const card = $(`.match-card[data-match-id="${laborerId}"]`);
            card.find('.status-booked').remove();
            card.find('.invite-btn').removeClass('disabled').prop('disabled', false);
            card.find('.match-meta span:first-child strong').text('Status:').next().text('available');
        } else {
            showToast('No invitation found to cancel', 'info');
        }
    }
    
    function openSMSModal(laborerName, mobileNumber) {
        // Set default message
        const defaultMessage = `Dear ${laborerName},\n\nYou have been invited to work on a farm. Please confirm your availability.\n\nBest regards,\nFarmEZ Management`;
        
        $('#smsMessage').val(defaultMessage);
        
        openModal('modalSMSInvite');
    }
    
    // ================= FARM ACTIVITY VIEW/EDIT FUNCTIONALITY =================
    function initializeFarmViewModal() {
        // Close farm view modal
        $('#closeFarmView').click(function() {
            closeWithFade('modalFarmView');
            $('#updateFarmBtn').removeData('farm-id');
        });
        
        // Update farm activity
        $('#updateFarmBtn').click(function() {
            const farmId = $(this).data('farm-id');
            
            if (!farmId) {
                showToast('No farm selected for update', 'error');
                return;
            }
            
            const farm = farmData.find(f => f.id === farmId);
            if (farm) {
                // Get updated values
                farm.name = $('#viewFarmName').val();
                farm.laborers = parseInt($('#viewLaborersCount').val());
                farm.budget = parseInt($('#viewTotalBudget').val());
                
                // Update DataTable
                farmActivityTable.clear();
                farmActivityTable.rows.add(farmData);
                farmActivityTable.draw();
                
                showToast('Farm activity updated successfully!', 'success');
                closeModal('modalFarmView');
                $('#updateFarmBtn').removeData('farm-id');
            }
        });
    }
    
    // ================= ATTENDANCE FUNCTIONALITY =================
    function initializeAttendance() {
        // Mark attendance button
        $('#markAttendance').click(function() {
            openModal('modalMarkAttendance');
        });
        
        // Export attendance button
        $('#exportAttendance').click(function() {
            showToast('Attendance report exported successfully!', 'success');
        });
        
        // Save attendance
        $('#saveAttendance').click(function() {
            const laborerName = $('#attendanceLaborer').val();
            const status = $('#attendanceStatus').val();
            const checkIn = $('#checkInTime').val();
            const checkOut = $('#checkOutTime').val();
            const date = $('#attendanceDate').val();
            const notes = $('#attendanceNotes').val();
            
            if (!laborerName) {
                showToast('Please select a laborer', 'error');
                return;
            }
            
            // Calculate hours worked
            let hours = 0;
            if (checkIn && checkOut) {
                const checkInTime = new Date(`2000-01-01T${checkIn}`);
                const checkOutTime = new Date(`2000-01-01T${checkOut}`);
                hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
                hours = Math.max(0, Math.round(hours * 10) / 10);
            }
            
            const attendanceId = $(this).data('attendance-id');
            
            if (attendanceId) {
                // Update existing attendance
                const index = attendanceData.findIndex(a => a.id === attendanceId);
                if (index !== -1) {
                    attendanceData[index] = {
                        ...attendanceData[index],
                        name: laborerName,
                        checkIn,
                        checkOut,
                        status,
                        hours,
                        date
                    };
                }
            } else {
                // Add new attendance
                const newAttendance = {
                    id: attendanceData.length > 0 ? Math.max(...attendanceData.map(a => a.id)) + 1 : 1,
                    name: laborerName,
                    checkIn,
                    checkOut,
                    status,
                    hours,
                    date
                };
                
                attendanceData.unshift(newAttendance);
            }
            
            // Update DataTable
            attendanceTable.clear();
            attendanceTable.rows.add(attendanceData);
            attendanceTable.draw();
            
            // Update stats
            updateAttendanceStats();
            
            // Close modal
            closeModal('modalMarkAttendance');
            
            // Reset form
            $('#attendanceLaborer, #attendanceStatus, #checkInTime, #checkOutTime, #attendanceNotes').val('');
            const today = new Date().toISOString().split('T')[0];
            $('#attendanceDate').val(today);
            $('#saveAttendance').removeData('attendance-id');
            
            showToast('Attendance saved successfully!', 'success');
        });
        
        // Cancel attendance
        $('#cancelAttendance, #closeMarkAttendance').click(function() {
            closeWithFade('modalMarkAttendance');
            $('#saveAttendance').removeData('attendance-id');
        });
    }
    
    function populateLaborerDropdown() {
        const dropdown = $('#attendanceLaborer');
        dropdown.empty();
        
        // Add placeholder option
        dropdown.append($('<option>', {
            value: '',
            text: 'Select a laborer'
        }));
        
        // Add laborers from laborerData
        laborerData.forEach(laborer => {
            dropdown.append($('<option>', {
                value: laborer.name,
                text: laborer.name
            }));
        });
    }
    
    // ================= ENHANCED PROFILE FUNCTIONALITY =================
    function initializeProfile() {
        // Close profile modal
        $('#closeProfile').click(function() {
            // Reset editing state
            if (editingField) {
                $(`#${editingField}`).prop('disabled', true);
                editingField = null;
            }
            $('#saveProfileBtn').hide();
            closeWithFade('modalProfile');
        });
        
        // File upload
        $('#validIdUpload').change(function() {
            const fileName = $(this).val().split('\\').pop();
            $('#validIdFileName').text(fileName || 'No file chosen');
        });
        
        // Change photo button
        $('#changePhotoBtn').click(function() {
            showToast('Photo change feature coming soon!', 'info');
        });
        
        // Password toggle visibility
        $('.toggle-password').click(function() {
            const passwordInput = $(this).siblings('input');
            const icon = $(this).find('ion-icon');
            
            if (passwordInput.attr('type') === 'password') {
                passwordInput.attr('type', 'text');
                icon.attr('name', 'eye-off');
            } else {
                passwordInput.attr('type', 'password');
                icon.attr('name', 'eye');
            }
        });
        
        // Field editing with pencil icons
        $('.edit-field-btn').click(function() {
            const fieldId = $(this).data('field');
            
            // If already editing this field, save it
            if (editingField === fieldId) {
                saveProfileField(fieldId);
                return;
            }
            
            // If editing another field, save it first
            if (editingField && editingField !== fieldId) {
                saveProfileField(editingField);
            }
            
            // Start editing new field
            const input = $(`#${fieldId}`);
            const container = input.parent();
            
            // Enable input
            input.prop('disabled', false);
            container.addClass('editing');
            
            // Focus and select text
            input.focus().select();
            
            // Update editing state
            editingField = fieldId;
            $('#saveProfileBtn').show();
        });
        
        // Save profile changes
        $('#saveProfileBtn').click(function() {
            if (editingField) {
                saveProfileField(editingField);
            }
            
            showToast('Profile updated successfully!', 'success');
            $('#saveProfileBtn').hide();
            editingField = null;
        });
        
        // Handle Enter key in editable fields
        $('.editable-field input, .editable-field select').keypress(function(e) {
            if (e.which === 13) { // Enter key
                const fieldId = $(this).attr('id');
                saveProfileField(fieldId);
                e.preventDefault();
            }
        });
    }
    
    function saveProfileField(fieldId) {
        const input = $(`#${fieldId}`);
        const container = input.parent();
        
        // Disable input
        input.prop('disabled', true);
        container.removeClass('editing');
        
        // Validate and update value
        let value = input.val().trim();
        
        // Add validation for specific fields
        switch(fieldId) {
            case 'emailAddress':
                if (!isValidEmail(value)) {
                    showToast('Please enter a valid email address', 'error');
                    input.val('juan@example.com'); // Reset to default
                    return;
                }
                break;
                
            case 'contactNumber':
                if (!isValidPhone(value)) {
                    showToast('Please enter a valid phone number', 'error');
                    input.val('+63 912 345 6789'); // Reset to default
                    return;
                }
                break;
                
            case 'password':
                if (value.length < 6) {
                    showToast('Password must be at least 6 characters', 'error');
                    input.val('password123'); // Reset to default
                    return;
                }
                break;
        }
        
        // Show success message for this field
        const fieldName = fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        showToast(`${fieldName} updated`, 'success');
        
        // Reset editing state
        editingField = null;
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function isValidPhone(phone) {
        const re = /^[\d\s\+\-\(\)]{10,}$/;
        return re.test(phone);
    }
    
    // ================= LABORER VIEW/EDIT MODAL =================
    function initializeLaborerModal() {
        // Close laborer modal
        $('#closeLaborerBtn, #closeViewLaborer').click(function() {
            closeWithFade('modalViewLaborer');
        });
        
        // Save laborer changes
        $('#saveLaborerBtn').click(function() {
            const laborerId = $(this).data('laborer-id');
            
            if (!laborerId) {
                showToast('No laborer selected', 'error');
                return;
            }
            
            const laborer = laborerData.find(l => l.id === laborerId);
            if (laborer) {
                // Update laborer data
                laborer.name = $('#viewLaborerName').val();
                laborer.contact = $('#viewLaborerContact').val();
                laborer.email = $('#viewLaborerEmail').val();
                laborer.address = $('#viewLaborerAddress').val();
                laborer.rate = parseInt($('#viewLaborerRate').val());
                laborer.status = $('#viewLaborerStatus').val();
                
                // Get selected skills
                const selectedSkills = $('#viewLaborerSkills input:checked').map(function() {
                    return $(this).val();
                }).get();
                laborer.skills = selectedSkills;
                
                // Update DataTable
                laborerActivityTable.clear();
                laborerActivityTable.rows.add(laborerData);
                laborerActivityTable.draw();
                
                showToast('Laborer details updated successfully!', 'success');
                closeModal('modalViewLaborer');
            }
        });
    }
    
    // ================= ADD PERCENTAGE MODAL =================
    function initializePercentageModal() {
        // Close percentage modal
        $('#cancelPercentage, #closeAddPercentage').click(function() {
            closeWithFade('modalAddPercentage');
            $('#savePercentage').removeData('laborer-id');
        });
        
        // Save percentage
        $('#savePercentage').click(function() {
            const laborerId = $(this).data('laborer-id');
            const percentage = $('#performancePercentage').val();
            const notes = $('#percentageNotes').val();
            
            if (!laborerId || !percentage) {
                showToast('Please enter a percentage', 'error');
                return;
            }
            
            const laborer = laborerData.find(l => l.id === laborerId);
            if (laborer) {
                laborer.performance = parseInt(percentage);
                
                // Update DataTable
                laborerActivityTable.clear();
                laborerActivityTable.rows.add(laborerData);
                laborerActivityTable.draw();
                
                showToast(`Performance percentage updated to ${percentage}%`, 'success');
                closeModal('modalAddPercentage');
                $('#savePercentage').removeData('laborer-id');
            }
        });
    }
    
    // ================= MAIN INITIALIZATION =================
    $(document).ready(function() {
        // Initialize all modules
        initializeSidebar();
        initializeJobManagement();
        initializeApplicants();
        initializeMatchNow();
        initializeFarmViewModal();
        initializeAttendance();
        initializeProfile();
        initializeLaborerModal();
        initializePercentageModal();
        
        // Initialize integrated dashboard components
        initializePerformanceChart();
        initializePerformanceTable();
        initializeFarmActivityTable();
        initializeLaborerActivityTable();
        initializeJobHistoryTable();
        initializeAttendanceTable();
        
        // Initialize calendar
        initializeCalendar();
        
        // Setup filter controls
        setupFilterControls();
        
        // Update application stats
        updateApplicationStatsDisplay();
        
        // Show dashboard by default
        showDashboard();
    });
});