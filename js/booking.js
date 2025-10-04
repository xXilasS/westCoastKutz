// West Coast Kutz Booking System
// Frontend JavaScript for booking interface

class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.selectedService = null;
        this.selectedBarber = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date();
        
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
        this.parseURLParams();
        this.initializeButtonStates();
    }

    initializeButtonStates() {
        // Initially disable the next button
        const nextButton = document.getElementById('next-step');
        if (nextButton) {
            nextButton.disabled = true;
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceSlug = urlParams.get('service');
        const barberSlug = urlParams.get('barber');

        if (serviceSlug) {
            // Pre-select service if specified in URL
            setTimeout(() => {
                const serviceCard = document.querySelector(`[data-service-slug="${serviceSlug}"]`);
                if (serviceCard) {
                    this.selectService(serviceCard);
                }
            }, 1000); // Increased timeout to ensure services are loaded
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step').addEventListener('click', () => this.prevStep());
        
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
    }

    async loadServices() {
        try {
            // In production, this would fetch from Supabase
            const services = [
                { id: '1', name: 'Classic Cut', slug: 'classic-cut', description: 'A timeless haircut that never goes out of style.', duration_minutes: 30, price_dollars: 25.00 },
                { id: '2', name: 'Skin Fade', slug: 'skin-fade', description: 'A seamless transition from skin to hair for a sharp look.', duration_minutes: 45, price_dollars: 30.00 },
                { id: '3', name: 'Beard Trim', slug: 'beard-trim', description: 'Precision beard shaping and detailing for a polished look.', duration_minutes: 20, price_dollars: 15.00 },
                { id: '4', name: 'Full Service', slug: 'full-service', description: 'Complete cut and beard trim package.', duration_minutes: 60, price_dollars: 40.00 },
                { id: '5', name: 'Kids Cut', slug: 'kids-cut', description: 'Gentle, fun cuts for children 12 and under.', duration_minutes: 25, price_dollars: 20.00 },
                { id: '6', name: 'Design Cut', slug: 'design-cut', description: 'Custom designs and artistic cuts.', duration_minutes: 50, price_dollars: 35.00 }
            ];

            this.renderServices(services);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    }

    renderServices(services) {
        const grid = document.getElementById('services-grid');
        grid.innerHTML = services.map(service => `
            <div class="service-card bg-white border border-gray-200 rounded-lg p-6 cursor-pointer transition duration-300 hover:shadow-lg"
                 data-service-id="${service.id}"
                 data-service-slug="${service.slug}"
                 data-service-name="${service.name}"
                 data-service-price="${service.price_dollars.toFixed(2)}"
                 data-service-duration="${service.duration_minutes}">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-heading text-xl text-charcoal">${service.name}</h3>
                    <span class="text-accentRed font-bold text-lg">$${service.price_dollars.toFixed(2)}</span>
                </div>
                <p class="text-silver mb-4">${service.description}</p>
                <div class="flex items-center text-silver text-sm">
                    <i data-feather="clock" class="w-4 h-4 mr-2"></i>
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
        const grid = document.getElementById('barbers-grid');
        grid.innerHTML = barbers.map(barber => `
            <div class="barber-card bg-white p-6 cursor-pointer transition duration-300" data-barber-id="${barber.id}">
                <div class="text-center">
                    <h3 class="font-heading text-2xl text-charcoal mb-2">${barber.name} "${barber.nickname}"</h3>
                    <p class="text-accentBlue mb-4 font-medium">${barber.specialties.join(' | ')}</p>
                    <p class="text-silver">${barber.bio}</p>
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
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('ring-2', 'ring-accentRed'));

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

        console.log('Selected service:', this.selectedService); // Debug log

        // Enable next button
        const nextButton = document.getElementById('next-step');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    selectBarber(card) {
        // Remove previous selection
        document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));

        // Add selection styling
        card.classList.add('selected');

        // Store selection
        const nameElement = card.querySelector('h3');
        this.selectedBarber = {
            id: card.dataset.barberId,
            name: nameElement ? nameElement.textContent.trim() : 'Unknown Barber'
        };

        console.log('Selected barber:', this.selectedBarber); // Debug log

        // Enable next button
        const nextButton = document.getElementById('next-step');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    generateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month header
        document.getElementById('current-month').textContent = 
            this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const calendarDays = document.getElementById('calendar-days');
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
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        
        // Add selection styling
        element.classList.add('selected');
        
        // Store selection
        this.selectedDate = date;
        
        // Load available time slots
        this.loadTimeSlots();
    }

    async loadTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        
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
        const container = document.getElementById('time-slots');
        container.innerHTML = slots.map(slot => `
            <button class="time-slot p-3 border border-gray-300 rounded-md text-sm font-medium ${
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
        document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));

        // Add selection styling
        button.classList.add('selected');

        // Store selection
        this.selectedTime = {
            time: button.dataset.time,
            display: button.textContent.trim()
        };

        console.log('Selected time:', this.selectedTime); // Debug log

        // Enable next button
        const nextButton = document.getElementById('next-step');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
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
                const name = document.getElementById('customer-name').value.trim();
                const phone = document.getElementById('customer-phone').value.trim();
                const email = document.getElementById('customer-email').value.trim();
                
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
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => step.classList.add('hidden'));

        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.remove('hidden');

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
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');

        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (this.currentStep === this.maxSteps) {
            nextBtn.textContent = 'Book Appointment';
            nextBtn.classList.remove('bg-accentRed', 'hover:bg-red-600');
            nextBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            nextBtn.textContent = 'Next Step';
            nextBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            nextBtn.classList.add('bg-accentRed', 'hover:bg-red-600');
        }

        // Reset button state for new step
        this.updateNextButtonState();
    }

    updateNextButtonState() {
        const nextBtn = document.getElementById('next-step');
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

    updateBookingSummary() {
        document.getElementById('summary-service').textContent = this.selectedService.name;
        document.getElementById('summary-barber').textContent = this.selectedBarber.name;
        document.getElementById('summary-datetime').textContent = 
            `${this.selectedDate.toLocaleDateString()} at ${this.selectedTime.display}`;
        document.getElementById('summary-duration').textContent = this.selectedService.duration;
        document.getElementById('summary-price').textContent = this.selectedService.price;
    }

    async processBooking() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.remove('hidden');

        try {
            // Collect customer information
            const customerData = {
                name: document.getElementById('customer-name').value.trim(),
                phone: document.getElementById('customer-phone').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                notes: document.getElementById('customer-notes').value.trim()
            };

            // In production, this would:
            // 1. Create appointment in Supabase
            // 2. Process payment with Stripe
            // 3. Send SMS/email notifications
            // 4. Redirect to confirmation page

            // Mock success for demo
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                alert('Booking successful! You will receive a confirmation email and SMS shortly.');
                window.location.href = '/confirmation.html';
            }, 2000);

        } catch (error) {
            console.error('Booking error:', error);
            loadingOverlay.classList.add('hidden');
            alert('There was an error processing your booking. Please try again.');
        }
    }
}

// Initialize booking system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});
