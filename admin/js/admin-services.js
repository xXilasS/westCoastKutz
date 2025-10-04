// West Coast Kutz Admin - Service Management
// CRUD operations for services with real-time updates

class ServiceManager {
    constructor() {
        this.currentService = null;
    }

    async createService(serviceData) {
        try {
            const { data, error } = await adminAuth.supabase
                .from('services')
                .insert({
                    name: serviceData.name,
                    slug: serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    description: serviceData.description,
                    price_dollars: parseFloat(serviceData.price),
                    duration_minutes: parseInt(serviceData.duration_minutes),
                    display_order: parseInt(serviceData.display_order) || 0,
                    is_active: serviceData.is_active === 'true'
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error creating service:', error);
            return { success: false, error: error.message };
        }
    }

    async updateService(serviceId, serviceData) {
        try {
            const { data, error } = await adminAuth.supabase
                .from('services')
                .update({
                    name: serviceData.name,
                    slug: serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    description: serviceData.description,
                    price_dollars: parseFloat(serviceData.price),
                    duration_minutes: parseInt(serviceData.duration_minutes),
                    display_order: parseInt(serviceData.display_order) || 0,
                    is_active: serviceData.is_active === 'true',
                    updated_at: new Date().toISOString()
                })
                .eq('id', serviceId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error updating service:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteService(serviceId) {
        try {
            // Check if service has any appointments
            const { data: appointments, error: appointmentError } = await adminAuth.supabase
                .from('appointments')
                .select('id')
                .eq('service_id', serviceId)
                .limit(1);

            if (appointmentError) throw appointmentError;

            if (appointments && appointments.length > 0) {
                return { 
                    success: false, 
                    error: 'Cannot delete service with existing appointments. Deactivate instead.' 
                };
            }

            const { error } = await adminAuth.supabase
                .from('services')
                .delete()
                .eq('id', serviceId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error deleting service:', error);
            return { success: false, error: error.message };
        }
    }

    async toggleServiceStatus(serviceId, newStatus) {
        try {
            const { data, error } = await adminAuth.supabase
                .from('services')
                .update({ 
                    is_active: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', serviceId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error toggling service status:', error);
            return { success: false, error: error.message };
        }
    }

    async reorderServices(serviceOrders) {
        try {
            const updates = serviceOrders.map(({ id, display_order }) => 
                adminAuth.supabase
                    .from('services')
                    .update({ display_order, updated_at: new Date().toISOString() })
                    .eq('id', id)
            );

            await Promise.all(updates);

            return { success: true };
        } catch (error) {
            console.error('Error reordering services:', error);
            return { success: false, error: error.message };
        }
    }

    openModal(serviceId = null) {
        const modal = document.getElementById('service-modal');
        const title = document.getElementById('service-modal-title');
        const form = document.getElementById('service-form');
        
        // Reset form
        form.reset();
        this.clearError();
        
        if (serviceId) {
            // Edit mode
            title.textContent = 'Edit Service';
            this.loadServiceData(serviceId);
        } else {
            // Add mode
            title.textContent = 'Add Service';
            this.currentService = null;
            document.getElementById('service-id').value = '';
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        feather.replace();
    }

    async loadServiceData(serviceId) {
        try {
            const { data, error } = await adminAuth.supabase
                .from('services')
                .select('*')
                .eq('id', serviceId)
                .single();

            if (error) throw error;

            this.currentService = data;
            
            // Populate form
            document.getElementById('service-id').value = data.id;
            document.getElementById('service-name').value = data.name;
            document.getElementById('service-description').value = data.description || '';
            document.getElementById('service-price').value = parseFloat(data.price_dollars).toFixed(2);
            document.getElementById('service-duration').value = data.duration_minutes;
            document.getElementById('service-order').value = data.display_order || 0;
            document.getElementById('service-active').value = data.is_active.toString();

        } catch (error) {
            console.error('Error loading service data:', error);
            this.showError('Error loading service data');
        }
    }

    closeModal() {
        const modal = document.getElementById('service-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        this.currentService = null;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const serviceData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            duration_minutes: formData.get('duration_minutes'),
            display_order: formData.get('display_order'),
            is_active: formData.get('is_active')
        };

        this.clearError();

        let result;
        const serviceId = formData.get('id');
        
        if (serviceId) {
            // Update existing service
            result = await this.updateService(serviceId, serviceData);
        } else {
            // Create new service
            result = await this.createService(serviceData);
        }

        if (result.success) {
            this.closeModal();
            // Refresh the services table
            if (adminDashboard.currentSection === 'services') {
                await adminDashboard.loadServicesSection();
            }
            // Show success message
            this.showSuccessMessage(serviceId ? 'Service updated successfully!' : 'Service created successfully!');
        } else {
            this.showError(result.error);
        }
    }

    showError(message) {
        const errorElement = document.getElementById('service-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError() {
        const errorElement = document.getElementById('service-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    async confirmDelete(serviceId, serviceName) {
        if (confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
            const result = await this.deleteService(serviceId);
            
            if (result.success) {
                // Refresh the services table
                if (adminDashboard.currentSection === 'services') {
                    await adminDashboard.loadServicesSection();
                }
                this.showSuccessMessage('Service deleted successfully!');
            } else {
                alert('Error deleting service: ' + result.error);
            }
        }
    }

    async handleToggleStatus(serviceId, newStatus) {
        const result = await this.toggleServiceStatus(serviceId, newStatus);
        
        if (result.success) {
            // Refresh the services table
            if (adminDashboard.currentSection === 'services') {
                await adminDashboard.loadServicesSection();
            }
            this.showSuccessMessage(`Service ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        } else {
            alert('Error updating service status: ' + result.error);
        }
    }
}

// Global service manager instance
const serviceManager = new ServiceManager();

// Global functions for service management
function openServiceModal(serviceId = null) {
    serviceManager.openModal(serviceId);
}

function closeServiceModal() {
    serviceManager.closeModal();
}

function handleServiceSubmit(event) {
    serviceManager.handleSubmit(event);
}

function editService(serviceId) {
    serviceManager.openModal(serviceId);
}

function deleteService(serviceId, serviceName) {
    serviceManager.confirmDelete(serviceId, serviceName);
}

function toggleServiceStatus(serviceId, newStatus) {
    serviceManager.handleToggleStatus(serviceId, newStatus);
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeServiceModal();
            }
        });
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('service-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeServiceModal();
        }
    }
});
