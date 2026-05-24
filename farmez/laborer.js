$(document).ready(function () {
    // ======================== INITIALIZATION ========================
    // Force hide loading screen after a maximum of 2 seconds (fallback)
    setTimeout(function () {
        if ($('#loadingScreen').is(':visible')) {
            console.warn('Loading screen still visible after 2s – forcing hide.');
            $('#loadingScreen').fadeOut(300);
        }
    }, 2000);

    try {
        // Hide loading screen after 1 second (normal case)
        setTimeout(() => {
            $('#loadingScreen').fadeOut(300);
            console.log('Loading screen hidden.');
        }, 1000);

        // Initialize DataTables, Charts, and mock data
        initDataTables();
        initCharts();
        loadMockData();

    } catch (error) {
        console.error('Initialization error:', error);
        // Still hide the loading screen even if something fails
        $('#loadingScreen').fadeOut(300);
        // Show user-friendly error (optional)
        toastr.error('Something went wrong. Please refresh the page.');
    }

    // ======================== SIDEBAR & VIEW SWITCHING ========================
    function switchView(viewId) {
        $('.dashboard-view, .job-view, .attendance-view, .reports-view, .payments-view').hide();
        $(viewId).show();
        // Update active sidebar menu
        $('#sidebar .side-menu li').removeClass('active');
        if (viewId === '#dashboardView') $('#sidebar .side-menu li:first-child').addClass('active');
        else if (viewId === '#jobView') $('#sidebar .side-menu li:nth-child(2)').addClass('active');
        else if (viewId === '#checkAttendanceView') $('#sidebar .side-menu li:nth-child(3)').addClass('active');
        else if (viewId === '#reportsView') $('#sidebar .side-menu li:nth-child(4)').addClass('active');
        else if (viewId === '#paymentsView') $('#sidebar .side-menu li:nth-child(5)').addClass('active');
    }

    $('#openDashboard').click(e => { e.preventDefault(); switchView('#dashboardView'); });
    $('#openJob').click(e => { e.preventDefault(); switchView('#jobView'); });
    $('#openCheckAttendance').click(e => { e.preventDefault(); switchView('#checkAttendanceView'); });
    $('#openReports').click(e => { e.preventDefault(); switchView('#reportsView'); });
    $('#openPayments').click(e => { e.preventDefault(); switchView('#paymentsView'); });

    // Back to dashboard from other views
    $('#backToDashboard, #backToDashboardFromCheckAttendance, #backToDashboardFromReports, #backToDashboardFromPayments').click(e => {
        e.preventDefault();
        switchView('#dashboardView');
    });

    // ======================== DROPDOWNS (Notifications & Profile) ========================
    $('.notification, .profile').click(function(e) {
        e.stopPropagation();
        $(this).siblings('.dropdown-content').toggleClass('show');
    });
    $(document).click(function() { $('.dropdown-content').removeClass('show'); });

    // ======================== MODAL HANDLERS ========================
    function openModal(modalId) { $(modalId).addClass('active'); }
    function closeModal(modalId) { $(modalId).removeClass('active'); }

    // View Jobs modal
    $('#btnViewJobs').click(() => openModal('#modalViewJobs'));
    $('#closeViewJobs').click(() => closeModal('#modalViewJobs'));
    // My Applications modal
    $('#btnMyApplications').click(() => openModal('#modalMyApplications'));
    $('#closeMyApplications').click(() => closeModal('#modalMyApplications'));
    // Available Jobs modal
    $('#btnAvailableJobs').click(() => openModal('#modalAvailableJobs'));
    $('#closeAvailableJobs').click(() => closeModal('#modalAvailableJobs'));
    // Mark Attendance modal
    $('#markMyAttendance').click(() => {
        populateJobSelect('#myAttendanceJob');
        $('#myAttendanceDate').val(new Date().toISOString().slice(0,10));
        openModal('#modalMarkMyAttendance');
    });
    $('#closeMarkMyAttendance, #cancelMyAttendance').click(() => closeModal('#modalMarkMyAttendance'));
    // Profile modal
    $('#openUserProfile, #openMyProfile').click(e => {
        e.preventDefault();
        openModal('#modalProfile');
    });
    $('#closeProfile').click(() => closeModal('#modalProfile'));
    // Payment Request modal
    $('#requestPayment').click(() => {
        populateJobSelect('#paymentJob');
        openModal('#modalRequestPayment');
    });
    $('#closeRequestPayment, #cancelPaymentRequest').click(() => closeModal('#modalRequestPayment'));
    // Submit payment request
    $('#submitPaymentRequest').click(() => {
        const job = $('#paymentJob').find(':selected').text();
        const amount = $('#paymentAmount').val();
        const method = $('#paymentMethod').val();
        if (!amount) { toastr.error('Please enter amount'); return; }
        toastr.success(`Payment request for ₱${amount} (${method}) sent for job: ${job}`);
        closeModal('#modalRequestPayment');
        $('#paymentAmount').val('');
    });

    // Save attendance
    $('#saveMyAttendance').click(() => {
        const job = $('#myAttendanceJob').val();
        const status = $('#myAttendanceStatus').val();
        const checkIn = $('#myCheckInTime').val();
        const checkOut = $('#myCheckOutTime').val();
        const date = $('#myAttendanceDate').val();
        if (!job) { toastr.warning('Please select a job'); return; }
        toastr.success(`Attendance marked as ${status} for ${date}`);
        closeModal('#modalMarkMyAttendance');
        // Add new row to attendance table (example)
        const newRow = [date, job, checkIn, checkOut, status, calculateHours(checkIn, checkOut), '₱0'];
        const attendanceTable = $('#myAttendanceTable').DataTable();
        attendanceTable.row.add(newRow).draw();
    });

    // Helper to calculate hours (simple demo)
    function calculateHours(checkIn, checkOut) {
        if (!checkIn || !checkOut) return '0';
        const start = new Date(`2000-01-01T${checkIn}`);
        const end = new Date(`2000-01-01T${checkOut}`);
        const diff = (end - start) / 3600000;
        return diff.toFixed(1);
    }

    // Profile editing: pencil clicks
    $('.edit-field-btn').click(function() {
        const fieldId = $(this).data('field');
        const inputField = $('#' + fieldId);
        inputField.prop('disabled', false).focus();
        $(this).hide();
        $('#saveProfileBtn').show();
    });
    $('#saveProfileBtn').click(() => {
        toastr.success('Profile updated successfully!');
        $('.editable-field input').prop('disabled', true);
        $('.edit-field-btn').show();
        $('#saveProfileBtn').hide();
    });
    // Toggle password visibility
    $('.toggle-password').click(function() {
        const input = $(this).closest('.editable-field').find('input');
        const type = input.attr('type') === 'password' ? 'text' : 'password';
        input.attr('type', type);
        $(this).find('ion-icon').attr('name', type === 'password' ? 'eye' : 'eye-off');
    });
    document.querySelector('.bx-menu').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('hide');
});
    // Change photo button (placeholder)
    $('#changePhotoBtn').click(() => toastr.info('Photo upload feature coming soon'));

    // Generate report button
    $('#generateReport').click(() => toastr.success('Report generated successfully'));
    $('#exportReport').click(() => toastr.info('Export functionality coming soon'));

    // Filter buttons for tables (demo)
    $('.filter-btn').click(function() {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        const filter = $(this).data('filter');
        toastr.info(`Filtering by: ${filter}`);
        // In real app, you'd redraw tables with filtered data
    });

    // ======================== DATA POPULATION (MOCK) ========================
    function populateJobSelect(selectId) {
        const $select = $(selectId);
        $select.empty();
        const jobs = ['Rice Harvesting - Barotac', 'Corn Planting - Janiuay', 'Tractor Operation - Pototan'];
        jobs.forEach(job => $select.append(`<option value="${job}">${job}</option>`));
    }

    function loadMockData() {
        // Job History Table
        const jobHistoryData = [
            ['Barotac Nuevo', 'Rice Harvesting', '2 days', '₱3,200', '5.0', 'Completed', '2025-03-15'],
            ['Janiuay', 'Corn Planting', '1 day', '₱2,500', '4.8', 'Completed', '2025-03-10'],
            ['Pototan', 'Tractor Operation', '1 day', '₱4,000', '4.9', 'Completed', '2025-03-05']
        ];
        const jobHistoryTable = $('#jobHistoryTable').DataTable();
        jobHistoryTable.clear().rows.add(jobHistoryData).draw();

        // Performance Table
        const performanceData = [
            ['Rice Harvesting', 12, '100%', '4.9', '₱38,400'],
            ['Corn Planting', 8, '100%', '4.7', '₱20,000'],
            ['Tractor Operation', 6, '100%', '5.0', '₱24,000']
        ];
        const performanceTable = $('#performanceTable').DataTable();
        performanceTable.clear().rows.add(performanceData).draw();

        // Current Jobs Table
        const currentJobsData = [
            ['Rice Harvesting', 'Barotac Nuevo', '2025-03-20', '2025-03-22', '₱1,600/day', 'Active', '<button class="action-btn" onclick="toastr.info(\'Job details\')"><i class="bx bx-info-circle"></i></button>'],
            ['Corn Planting', 'Janiuay', '2025-03-18', '2025-03-19', '₱2,500/day', 'Pending', '<button class="action-btn"><i class="bx bx-info-circle"></i></button>']
        ];
        const currentJobsTable = $('#currentJobsTable').DataTable();
        currentJobsTable.clear().rows.add(currentJobsData).draw();

        // My Attendance Table
        const attendanceData = [
            ['2025-03-15', 'Rice Harvesting', '08:00', '17:00', 'Present', '8', '₱1,600'],
            ['2025-03-14', 'Corn Planting', '08:30', '17:00', 'Late', '7.5', '₱1,500']
        ];
        const attendanceTable = $('#myAttendanceTable').DataTable();
        attendanceTable.clear().rows.add(attendanceData).draw();

        // Payments Table
        const paymentsData = [
            ['PAY-001', 'Rice Harvesting - Mar 15', '₱3,200', '2025-03-16', 'Received', 'GCash', '<button class="action-btn"><i class="bx bx-receipt"></i></button>'],
            ['PAY-002', 'Corn Planting - Mar 10', '₱2,500', '2025-03-11', 'Received', 'Bank Transfer', '<button class="action-btn"><i class="bx bx-receipt"></i></button>']
        ];
        const paymentsTable = $('#paymentsTable').DataTable();
        paymentsTable.clear().rows.add(paymentsData).draw();

        // Reports Table
        const reportsData = [
            ['Monthly Performance', 'March 2025', '2025-03-31', 'Generated', '<button class="action-btn"><i class="bx bx-download"></i></button>'],
            ['Earnings Summary', 'Q1 2025', '2025-03-30', 'Generated', '<button class="action-btn"><i class="bx bx-download"></i></button>']
        ];
        const reportsTable = $('#reportsTable').DataTable();
        reportsTable.clear().rows.add(reportsData).draw();

        // Populate skills in profile modal
        const skills = ['Rice Harvesting', 'Corn Planting', 'Tractor Driving', 'Irrigation'];
        $('#profileSkills').empty(); // Clear existing to avoid duplicates
        skills.forEach(skill => {
            $('#profileSkills').append(`<span class="skill-tag">${skill}</span>`);
        });
    }

    function initDataTables() {
        $('#jobHistoryTable, #performanceTable, #currentJobsTable, #myAttendanceTable, #paymentsTable, #reportsTable').each(function() {
            if ($.fn.DataTable.isDataTable(this)) $(this).DataTable().destroy();
            $(this).DataTable({
                paging: true,
                searching: true,
                ordering: true,
                responsive: true,
                pageLength: 5,
                language: { search: "Filter records:" }
            });
        });
    }

    function initCharts() {
        // Performance Chart
        const perfCanvas = document.getElementById('performanceChart');
        if (perfCanvas) {
            const ctxPerf = perfCanvas.getContext('2d');
            new Chart(ctxPerf, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Jobs Completed',
                        data: [12, 19, 15, 22, 28, 32],
                        borderColor: '#1b7b44', // fallback to hex
                        backgroundColor: 'rgba(27, 123, 68, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        } else {
            console.warn('Performance chart canvas not found.');
        }

        // Finance Chart
        const financeCanvas = document.getElementById('financeChart');
        if (financeCanvas) {
            const ctxFinance = financeCanvas.getContext('2d');
            new Chart(ctxFinance, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Earnings (₱)',
                        data: [12500, 15800, 18400, 22100, 26800, 31200],
                        backgroundColor: '#35b35f', // fallback to hex
                        borderRadius: 8
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        } else {
            console.warn('Finance chart canvas not found.');
        }
    }

    // ======================== MISCELLANEOUS ========================
    // Sidebar toggle (mobile)
    $('.bx-menu').click(() => {
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('active');
    });

    // Logout
    $('#logoutBtn').click(e => {
        e.preventDefault();
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1b7b44',
            cancelButtonColor: '#dc2626',
            confirmButtonText: 'Yes, logout'
        }).then(result => {
            if (result.isConfirmed) {
                toastr.success('Logged out successfully');
                window.location.href = 'index.html'; // adjust as needed
            }
        });
    });

    // Demo: message icon
    $('#openMessages').click(e => {
        e.preventDefault();
        toastr.info('Message center coming soon');
    });
});
fetch("http://localhost/farmez/api/add_worker.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        agency_id: 1,
        full_name: name,
        age: age,
        skills: skills
    })
})
.then(res => res.json())
.then(data => alert(data.status));