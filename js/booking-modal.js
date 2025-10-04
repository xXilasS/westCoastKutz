// West Coast Kutz Booking System - Modal Version
// Frontend JavaScript for modal booking interface

class BookingSystem {
    constructor(isModal = false) {
        this.isModal = isModal;
        this.currentStep = 1;
        this.maxSteps = 4;
        this.selectedService = null;
        this.selectedBarber = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date();
        this.preSelectedServiceSlug = null;
        
        // Supabase configuration (replace with your actual URL and anon key)
        this.supabaseUrl = 'YOUR_SUPABASE_URL';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadServices();
        this.loadBarbers();
        this.generateCalendar();
        this.initializeButtonStates();
    }

    setupEventListeners() {
        const prefix = this.isModal ? 'modal-' : '';
        
        // Navigation buttons
        document.getElementById(`${prefix}next-step`).addEventListener('click', () => this.nextStep());
        document.getElementById(`${prefix}prev-step`).addEventListener('click', () => this.prevStep());
        
        // Calendar navigation
        document.getElementById(`${prefix}prev-month`).addEventListener('click', () => this.changeMonth(-1));
        document.getElementById(`${prefix}next-month`).addEventListener('click', () => this.changeMonth(1));
    }

    getElementId(baseId) {
        return this.isModal ? `modal-${baseId}` : baseId;
    }

    async loadServices() {
        try {
            // Check if we have Supabase configured
            if (window.SUPABASE_CONFIG && window.supabase) {
                // Fetch real services from Supabase
                const { data: services, error } = await window.supabase
                    .from('services')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) {
                    console.error('Error fetching services:', error);
                    this.loadFallbackServices();
                    return;
                }

                this.renderServices(services);
            } else {
                // Fallback to demo data if Supabase not configured
                this.loadFallbackServices();
            }
        } catch (error) {
            console.error('Error loading services:', error);
            this.loadFallbackServices();
        }
    }

    loadFallbackServices() {
        // Demo services with dollar prices
        const services = [
            { id: '1', name: 'Classic Cut', slug: 'classic-cut', description: 'A timeless haircut that never goes out of style.', duration_minutes: 30, price_dollars: 25.00 },
            { id: '2', name: 'Skin Fade', slug: 'skin-fade', description: 'A seamless transition from skin to hair for a sharp look.', duration_minutes: 45, price_dollars: 30.00 },
            { id: '3', name: 'Beard Trim', slug: 'beard-trim', description: 'Precision beard shaping and detailing for a polished look.', duration_minutes: 20, price_dollars: 15.00 },
            { id: '4', name: 'Full Service', slug: 'full-service', description: 'Complete cut and beard trim package.', duration_minutes: 60, price_dollars: 40.00 },
            { id: '5', name: 'Kids Cut', slug: 'kids-cut', description: 'Gentle, fun cuts for children 12 and under.', duration_minutes: 25, price_dollars: 20.00 },
            { id: '6', name: 'Design Cut', slug: 'design-cut', description: 'Custom designs and artistic cuts.', duration_minutes: 50, price_dollars: 35.00 }
        ];

        this.renderServices(services);
    }

    renderServices(services) {
        const gridId = this.getElementId('services-grid');
        const grid = document.getElementById(gridId);
        
        if (!grid) {
            console.error(`Services grid not found: ${gridId}`);
            return;
        }

        grid.innerHTML = services.map(service => `
            <div class="service-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition duration-300 hover:shadow-lg"
                 data-service-id="${service.id}"
                 data-service-slug="${service.slug}"
                 data-service-name="${service.name}"
                 data-service-price="${parseFloat(service.price_dollars || 0).toFixed(2)}"
                 data-service-duration="${service.duration_minutes}">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-heading text-lg text-charcoal">${service.name}</h3>
                    <span class="text-accentRed font-bold">$${parseFloat(service.price_dollars || 0).toFixed(2)}</span>
                </div>
                <p class="text-silver text-sm mb-3">${service.description}</p>
                <div class="flex items-center text-silver text-xs">
                    <i data-feather="clock" class="w-3 h-3 mr-1"></i>
                    <span>${service.duration_minutes} minutes</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => this.selectService(card));
        });

        feather.replace();
    }

    async loadBarbers() {
        try {
            // In production, this would fetch from Supabase
            const barbers = [
                { id: '1', name: 'Jay', nickname: 'LineKing', specialties: ['Fades', 'Tapers', 'Beard Work'], bio: '8 years perfecting crisp fades and sharp line-ups.' },
                { id: '2', name: 'Mia', nickname: 'Shears', specialties: ['Designs', 'Kids Cuts', 'Classic Styles'], bio: 'Creative cuts with precision.' }
            ];

            this.renderBarbers(barbers);
        } catch (error) {
            console.error('Error loading barbers:', error);
        }
    }

    renderBarbers(barbers) {
        const gridId = this.getElementId('barbers-grid');
        const grid = document.getElementById(gridId);
        
        if (!grid) {
            console.error(`Barbers grid not found: ${gridId}`);
            return;
        }

        grid.innerHTML = barbers.map(barber => `
            <div class="barber-card bg-white p-4 cursor-pointer transition duration-300" data-barber-id="${barber.id}">
                <div class="text-center">
                    <h3 class="font-heading text-xl text-charcoal mb-2">${barber.name} "${barber.nickname}"</h3>
                    <p class="text-accentBlue mb-3 font-medium text-sm">${barber.specialties.join(' | ')}</p>
                    <p class="text-silver text-sm">${barber.bio}</p>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.barber-card').forEach(card => {
            card.addEventListener('click', () => this.selectBarber(card));
        });
    }

    selectService(card) {
        // Remove previous selection
        const gridId = this.getElementId('services-grid');
        const grid = document.getElementById(gridId);
        grid.querySelectorAll('.service-card').forEach(c => c.classList.remove('ring-2', 'ring-accentRed'));
        
        // Add selection styling
        card.classList.add('ring-2', 'ring-accentRed');
        
        // Store selection using data attributes (more reliable)
        this.selectedService = {
            id: card.dataset.serviceId,
            slug: card.dataset.serviceSlug,
            name: card.dataset.serviceName,
            price: `$${card.dataset.servicePrice}`,
            duration: `${card.dataset.serviceDuration} minutes`,
            price_dollars: parseFloat(card.dataset.servicePrice),
            duration_minutes: parseInt(card.dataset.serviceDuration)
        };

        console.log('Selected service:', this.selectedService);

        // Enable next button
        this.updateNextButtonState();
    }

    selectBarber(card) {
        // Remove previous selection
        const gridId = this.getElementId('barbers-grid');
        const grid = document.getElementById(gridId);
        grid.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection styling
        card.classList.add('selected');
        
        // Store selection
        const nameElement = card.querySelector('h3');
        this.selectedBarber = {
            id: card.dataset.barberId,
            name: nameElement ? nameElement.textContent.trim() : 'Unknown Barber'
        };

        console.log('Selected barber:', this.selectedBarber);

        // Enable next button
        this.updateNextButtonState();
    }

    generateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month header
        const monthHeaderId = this.getElementId('current-month');
        const monthHeader = document.getElementById(monthHeaderId);
        if (monthHeader) {
            monthHeader.textContent = this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const calendarDaysId = this.getElementId('calendar-days');
        const calendarDays = document.getElementById(calendarDaysId);
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            calendarDays.innerHTML += '<div></div>';
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today;
            const isWeekend = date.getDay() === 0 || date.getDay() === 1; // Sunday or Monday (closed)
            
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day p-2 cursor-pointer rounded ${isPast || isWeekend ? 'disabled' : 'hover:bg-gray-100'}`;
            dayElement.textContent = day;
            
            if (isToday) {
                dayElement.classList.add('font-bold', 'text-accentRed');
            }
            
            if (!isPast && !isWeekend) {
                dayElement.addEventListener('click', () => this.selectDate(date, dayElement));
            }
            
            calendarDays.appendChild(dayElement);
        }
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.generateCalendar();
        
        // Clear selected date if changing months
        this.selectedDate = null;
        this.loadTimeSlots();
    }

    selectDate(date, element) {
        // Remove previous selection
        const calendarDaysId = this.getElementId('calendar-days');
        const calendarDays = document.getElementById(calendarDaysId);
        calendarDays.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        
        // Add selection styling
        element.classList.add('selected');
        
        // Store selection
        this.selectedDate = date;
        
        // Load available time slots
        this.loadTimeSlots();
    }

    async loadTimeSlots() {
        const timeSlotsId = this.getElementId('time-slots');
        const timeSlotsContainer = document.getElementById(timeSlotsId);
        
        if (!timeSlotsContainer) return;
        
        if (!this.selectedDate || !this.selectedBarber) {
            timeSlotsContainer.innerHTML = '<div class="text-center text-gray-500 col-span-2 py-8">Select a date to see available times</div>';
            return;
        }

        // Show loading
        timeSlotsContainer.innerHTML = '<div class="text-center text-gray-500 col-span-2 py-8">Loading available times...</div>';

        try {
            // In production, this would fetch from Supabase API
            const timeSlots = this.generateTimeSlots();
            this.renderTimeSlots(timeSlots);
        } catch (error) {
            console.error('Error loading time slots:', error);
            timeSlotsContainer.innerHTML = '<div class="text-center text-red-500 col-span-2 py-8">Error loading times. Please try again.</div>';
        }
    }

    generateTimeSlots() {
        // Mock time slots - in production, this would come from the API
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 18; // 6 PM
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of [0, 30]) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                // Randomly mark some as unavailable for demo
                const isAvailable = Math.random() > 0.3;
                
                slots.push({
                    time: time,
                    display: displayTime,
                    available: isAvailable
                });
            }
        }
        
        return slots;
    }

    renderTimeSlots(slots) {
        const timeSlotsId = this.getElementId('time-slots');
        const container = document.getElementById(timeSlotsId);
        
        if (!container) return;
        
        container.innerHTML = slots.map(slot => `
            <button class="time-slot p-2 border border-gray-300 rounded-md text-xs font-medium ${
                slot.available ? 'hover:border-accentRed cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-100'
            }" 
            data-time="${slot.time}" 
            ${!slot.available ? 'disabled' : ''}>
                ${slot.display}
            </button>
        `).join('');

        // Add click handlers for available slots
        container.querySelectorAll('.time-slot:not([disabled])').forEach(button => {
            button.addEventListener('click', () => this.selectTime(button));
        });
    }

    selectTime(button) {
        // Remove previous selection
        const timeSlotsId = this.getElementId('time-slots');
        const container = document.getElementById(timeSlotsId);
        container.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        
        // Add selection styling
        button.classList.add('selected');
        
        // Store selection
        this.selectedTime = {
            time: button.dataset.time,
            display: button.textContent.trim()
        };

        console.log('Selected time:', this.selectedTime);

        // Enable next button
        this.updateNextButtonState();
    }

    initializeButtonStates() {
        // Initially disable the next button
        const nextButtonId = this.getElementId('next-step');
        const nextButton = document.getElementById(nextButtonId);
        if (nextButton) {
            nextButton.disabled = true;
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    updateNextButtonState() {
        const nextButtonId = this.getElementId('next-step');
        const nextBtn = document.getElementById(nextButtonId);
        if (!nextBtn) return;

        let shouldEnable = false;

        switch (this.currentStep) {
            case 1:
                shouldEnable = !!this.selectedService;
                break;
            case 2:
                shouldEnable = !!this.selectedBarber;
                break;
            case 3:
                shouldEnable = !!(this.selectedDate && this.selectedTime);
                break;
            case 4:
                shouldEnable = true; // Always enabled on final step
                break;
        }

        if (shouldEnable) {
            nextBtn.disabled = false;
            nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    preSelectService(serviceSlug) {
        this.preSelectedServiceSlug = serviceSlug;
        
        // Try to select the service if services are already loaded
        setTimeout(() => {
            const gridId = this.getElementId('services-grid');
            const grid = document.getElementById(gridId);
            if (grid) {
                const serviceCard = grid.querySelector(`[data-service-slug="${serviceSlug}"]`);
                if (serviceCard) {
                    this.selectService(serviceCard);
                }
            }
        }, 100);
    }

    resetToFirstStep() {
        this.currentStep = 1;
        this.updateStepDisplay();
    }

    reset() {
        this.currentStep = 1;
        this.selectedService = null;
        this.selectedBarber = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.preSelectedServiceSlug = null;
        this.updateStepDisplay();
    }

    nextStep() {
        if (this.currentStep < this.maxSteps) {
            // Validate current step
            if (!this.validateStep(this.currentStep)) {
                return;
            }

            this.currentStep++;
            this.updateStepDisplay();
            
            if (this.currentStep === 4) {
                this.updateBookingSummary();
            }
        } else {
            // Final step - process booking
            this.processBooking();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                if (!this.selectedService) {
                    alert('Please select a service');
                    return false;
                }
                break;
            case 2:
                if (!this.selectedBarber) {
                    alert('Please select a barber');
                    return false;
                }
                break;
            case 3:
                if (!this.selectedDate || !this.selectedTime) {
                    alert('Please select a date and time');
                    return false;
                }
                break;
            case 4:
                const nameId = this.getElementId('customer-name');
                const phoneId = this.getElementId('customer-phone');
                const emailId = this.getElementId('customer-email');
                
                const name = document.getElementById(nameId)?.value.trim();
                const phone = document.getElementById(phoneId)?.value.trim();
                const email = document.getElementById(emailId)?.value.trim();
                
                if (!name || !phone || !email) {
                    alert('Please fill in all required fields');
                    return false;
                }
                
                if (!this.validateEmail(email)) {
                    alert('Please enter a valid email address');
                    return false;
                }
                break;
        }
        return true;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    updateStepDisplay() {
        const prefix = this.isModal ? 'modal-' : '';
        
        // Hide all steps
        for (let i = 1; i <= this.maxSteps; i++) {
            const step = document.getElementById(`${prefix}step-${i}`);
            if (step) {
                step.classList.add('hidden');
            }
        }
        
        // Show current step
        const currentStep = document.getElementById(`${prefix}step-${this.currentStep}`);
        if (currentStep) {
            currentStep.classList.remove('hidden');
        }
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNumber = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                indicator.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                indicator.classList.add('active');
            }
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById(`${prefix}prev-step`);
        const nextBtn = document.getElementById(`${prefix}next-step`);
        
        if (prevBtn) {
            if (this.currentStep === 1) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }
        }
        
        if (nextBtn) {
            if (this.currentStep === this.maxSteps) {
                nextBtn.textContent = 'Book Appointment';
                nextBtn.classList.remove('bg-accentRed', 'hover:bg-red-600');
                nextBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            } else {
                nextBtn.textContent = 'Next Step';
                nextBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                nextBtn.classList.add('bg-accentRed', 'hover:bg-red-600');
            }
        }

        // Reset button state for new step
        this.updateNextButtonState();
    }

    updateBookingSummary() {
        const prefix = this.isModal ? 'modal-' : '';

        const serviceEl = document.getElementById(`${prefix}summary-service`);
        const barberEl = document.getElementById(`${prefix}summary-barber`);
        const datetimeEl = document.getElementById(`${prefix}summary-datetime`);
        const durationEl = document.getElementById(`${prefix}summary-duration`);
        const priceEl = document.getElementById(`${prefix}summary-price`);

        if (serviceEl) serviceEl.textContent = this.selectedService?.name || '';
        if (barberEl) barberEl.textContent = this.selectedBarber?.name || '';
        if (datetimeEl) datetimeEl.textContent = this.selectedDate && this.selectedTime ?
            `${this.selectedDate.toLocaleDateString()} at ${this.selectedTime.display}` : '';
        if (durationEl) durationEl.textContent = this.selectedService?.duration || '';
        if (priceEl) priceEl.textContent = this.selectedService?.price || '';

        // Pre-fill customer information if user is logged in
        this.prefillCustomerInfo();
    }

    prefillCustomerInfo() {
        if (typeof authSystem !== 'undefined' && authSystem && authSystem.isLoggedIn()) {
            const profile = authSystem.getUserProfile();
            const user = authSystem.getCurrentUser();

            if (profile || user) {
                const prefix = this.isModal ? 'modal-' : '';

                const nameField = document.getElementById(`${prefix}customer-name`);
                const phoneField = document.getElementById(`${prefix}customer-phone`);
                const emailField = document.getElementById(`${prefix}customer-email`);

                if (nameField && profile?.full_name) {
                    nameField.value = profile.full_name;
                }
                if (phoneField && profile?.phone) {
                    phoneField.value = profile.phone;
                }
                if (emailField && (profile?.email || user?.email)) {
                    emailField.value = profile?.email || user.email;
                }
            }
        }
    }

    async processBooking() {
        try {
            // Collect customer information
            const prefix = this.isModal ? 'modal-' : '';
            const customerData = {
                name: document.getElementById(`${prefix}customer-name`)?.value.trim(),
                phone: document.getElementById(`${prefix}customer-phone`)?.value.trim(),
                email: document.getElementById(`${prefix}customer-email`)?.value.trim(),
                notes: document.getElementById(`${prefix}customer-notes`)?.value.trim()
            };

            // Prepare booking data
            const bookingData = {
                barber_id: this.selectedBarber.id,
                service_id: this.selectedService.id,
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                customer_email: customerData.email,
                appointment_date: this.selectedDate.toISOString().split('T')[0],
                appointment_time: this.selectedTime.time,
                notes: customerData.notes
            };

            // Add user_id if user is logged in
            if (typeof authSystem !== 'undefined' && authSystem && authSystem.isLoggedIn()) {
                const user = authSystem.getCurrentUser();
                if (user) {
                    bookingData.user_id = user.id;
                }
            }

            // In production, this would:
            // 1. Create appointment in Supabase
            // 2. Process payment with Stripe
            // 3. Send SMS/email notifications
            // 4. Show confirmation

            console.log('Booking data:', bookingData);

            // Mock success for demo
            alert('Booking successful! You will receive a confirmation email and SMS shortly.');

            if (this.isModal && typeof closeBookingModal === 'function') {
                closeBookingModal();
            }

        } catch (error) {
            console.error('Booking error:', error);
            alert('There was an error processing your booking. Please try again.');
        }
    }
}
