// West Coast Kutz Admin Dashboard
// Main dashboard functionality and navigation

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
    }

    async loadDashboardData() {
        try {
            // Load dashboard statistics
            const statsResult = await adminAuth.getDashboardStats();
            if (statsResult.success) {
                this.updateDashboardStats(statsResult.data);
            }

            // Load recent appointments
            const appointmentsResult = await adminAuth.getAppointments();
            if (appointmentsResult.success) {
                this.displayRecentAppointments(appointmentsResult.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('today-appointments').textContent = stats.todayAppointments;
        document.getElementById('total-customers').textContent = stats.totalCustomers;
        document.getElementById('monthly-revenue').textContent = `$${stats.monthlyRevenue.toFixed(2)}`;
        document.getElementById('pending-appointments').textContent = stats.pendingAppointments;
    }

    displayRecentAppointments(appointments) {
        const container = document.getElementById('recent-appointments');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No recent appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-accentRed rounded-full flex items-center justify-center">
                        <i data-feather="user" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <p class="font-medium text-charcoal">${apt.customer_name}</p>
                        <p class="text-sm text-gray-600">${apt.services?.name || 'Service'} with ${apt.barbers?.name || 'Barber'}</p>
                        <p class="text-sm text-gray-500">${new Date(apt.appointment_date).toLocaleDateString()} at ${apt.appointment_time}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(apt.status)}">
                        ${apt.status}
                    </span>
                    <p class="text-sm text-gray-600 mt-1">$${parseFloat(apt.price_dollars || 0).toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        // Re-render feather icons
        feather.replace();
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(`admin-${sectionName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Update sidebar navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Find and activate the clicked link
        const activeLink = document.querySelector(`[onclick="showAdminSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'appointments':
                await this.loadAppointmentsSection();
                break;
            case 'services':
                await this.loadServicesSection();
                break;
            case 'barbers':
                await this.loadBarbersSection();
                break;
            case 'gallery':
                await this.loadGallerySection();
                break;
            case 'hero':
                await this.loadHeroSection();
                break;
            case 'customers':
                await this.loadCustomersSection();
                break;
        }
    }

    async loadAppointmentsSection() {
        const section = document.getElementById('admin-appointments');
        if (!section.dataset.loaded) {
            section.innerHTML = `
                <div class="mb-6 flex justify-between items-center">
                    <h2 class="font-heading text-2xl text-charcoal">Appointment Management</h2>
                    <div class="flex space-x-4">
                        <select id="appointment-filter-date" class="px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="week">This Week</option>
                        </select>
                        <select id="appointment-filter-status" class="px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div id="appointments-table" class="overflow-x-auto">
                        <!-- Appointments table will be loaded here -->
                    </div>
                </div>
            `;
            section.dataset.loaded = 'true';
        }

        // Load appointments data
        const result = await adminAuth.getAppointments();
        if (result.success) {
            this.displayAppointmentsTable(result.data);
        }
    }

    displayAppointmentsTable(appointments) {
        const container = document.getElementById('appointments-table');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No appointments found</p>';
            return;
        }

        container.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barber</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${appointments.map(apt => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${apt.customer_name}</div>
                                    <div class="text-sm text-gray-500">${apt.customer_email}</div>
                                    <div class="text-sm text-gray-500">${apt.customer_phone}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${apt.services?.name || 'N/A'}</div>
                                <div class="text-sm text-gray-500">${apt.services?.duration_minutes || apt.duration_minutes} min</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${apt.barbers?.name || 'N/A'}</div>
                                <div class="text-sm text-gray-500">"${apt.barbers?.nickname || ''}"</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${new Date(apt.appointment_date).toLocaleDateString()}</div>
                                <div class="text-sm text-gray-500">${apt.appointment_time}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(apt.status)}">
                                    ${apt.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                $${parseFloat(apt.price_dollars || 0).toFixed(2)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">
                                    <button onclick="editAppointment('${apt.id}')" class="text-accentBlue hover:text-blue-700">Edit</button>
                                    <button onclick="cancelAppointment('${apt.id}')" class="text-red-600 hover:text-red-800">Cancel</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async loadServicesSection() {
        const section = document.getElementById('admin-services');
        if (!section.dataset.loaded) {
            section.innerHTML = `
                <div class="mb-6 flex justify-between items-center">
                    <h2 class="font-heading text-2xl text-charcoal">Service Management</h2>
                    <button onclick="openServiceModal()" class="bg-accentRed hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition">
                        <i data-feather="plus" class="w-4 h-4 inline mr-2"></i>
                        Add Service
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div id="services-table">
                        <!-- Services table will be loaded here -->
                    </div>
                </div>
            `;
            section.dataset.loaded = 'true';
            feather.replace();
        }

        // Load services data
        const result = await adminAuth.getServices();
        if (result.success) {
            this.displayServicesTable(result.data);
        }
    }

    displayServicesTable(services) {
        const container = document.getElementById('services-table');
        
        if (services.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No services found</p>';
            return;
        }

        container.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${services.map(service => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">${service.name}</div>
                                <div class="text-sm text-gray-500">Order: ${service.display_order}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-900 max-w-xs truncate">${service.description || 'No description'}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                $${parseFloat(service.price_dollars || 0).toFixed(2)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${service.duration_minutes} min
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${service.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">
                                    <button onclick="editService('${service.id}')" class="text-accentBlue hover:text-blue-700">Edit</button>
                                    <button onclick="toggleServiceStatus('${service.id}', ${!service.is_active})" class="text-accentGold hover:text-yellow-700">
                                        ${service.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onclick="deleteService('${service.id}', '${service.name.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Placeholder methods for other sections
    async loadBarbersSection() {
        // Will be implemented in the next part
        console.log('Loading barbers section...');
    }

    async loadGallerySection() {
        // Will be implemented in the next part
        console.log('Loading gallery section...');
    }

    async loadHeroSection() {
        // Will be implemented in the next part
        console.log('Loading hero section...');
    }

    async loadCustomersSection() {
        // Will be implemented in the next part
        console.log('Loading customers section...');
    }
}

// Global admin dashboard instance
const adminDashboard = new AdminDashboard();

// Global navigation function
function showAdminSection(sectionName) {
    adminDashboard.showSection(sectionName);
}

// Placeholder functions for admin actions
function editAppointment(appointmentId) {
    console.log('Edit appointment:', appointmentId);
    // Will be implemented
}

function cancelAppointment(appointmentId) {
    console.log('Cancel appointment:', appointmentId);
    // Will be implemented
}

function openServiceModal(serviceId = null) {
    console.log('Open service modal:', serviceId);
    // Will be implemented
}

function editService(serviceId) {
    console.log('Edit service:', serviceId);
    // Will be implemented
}

function toggleServiceStatus(serviceId, newStatus) {
    console.log('Toggle service status:', serviceId, newStatus);
    // Will be implemented
}
