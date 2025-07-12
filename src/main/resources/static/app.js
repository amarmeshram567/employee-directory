import { 
    getEmployees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    filterEmployees,
    sortEmployees
} from './data.js'; // Importing utility function for employee data handling

// DOM Elements
const appContainer = document.getElementById('app');
let currentView = 'dashboard';
let currentFilters = {};
let currentSort = { key: 'firstName', direction: 'asc' };
let currentPage = 1;
const itemsPerPage = 10;

// Initialize the app
function init() {
    renderNavigation(); //Render top navbar
    renderDashboard(); // Show employee list view
    setupEventListeners(); // Set up event listeners for navigation and filters
}

// Navigation
function renderNavigation() {
    const navHTML = `
        
        <nav  class="main-nav">
            <h1 class="title">Employee Directory</h1>
                <div class="controls">
                    <div class="search-container">
                        <input class="form-control" type="text" id="search-input" placeholder="search by name or email">
                        <button id="search-btn" class="btn">Search</button>
                    </div>
                    <div class="filter-sort-container-1">
                        <button id="filter-btn" class="btn">Filters</button>
                    </div>
            </div>
        </nav>
       
    `;
    appContainer.insertAdjacentHTML('afterbegin', navHTML);
}

// Dashboard View
function renderDashboard() {
    currentView = 'dashboard';

    appContainer.innerHTML = ''; //clear existing content

    renderNavigation(); // Add nav again
    

    // Apply Filters and sorting
    let employees = getEmployees();
    employees = filterEmployees(currentFilters);
    console.log(currentFilters)
    employees = sortEmployees(employees, currentSort.key, currentSort.direction);
    
    // Paginate results
    const paginatedEmployees = paginate(employees, currentPage, itemsPerPage);
    
    // HTML for list, pagination and filter modal
    const dashboardHTML = `
        <div class="dashboard-container">
            <div class="controls">
                <div class="filter-sort-container">
                    <button id="filter-btn" class="filter-btn">Filters</button>
                    <select id="sort-select" class="form-control filter-content">
                        <option value="firstName-asc">First Name (A-Z)</option>
                        <option value="firstName-desc">First Name (Z-A)</option>
                        <option value="department-asc">Department (A-Z)</option>
                        <option value="department-desc">Department (Z-A)</option>
                    </select>
                </div>
                <div>
                    <button  id="add-employee-btn"  class="btn add-button">Add Employee</button>
                </div>
            </div>
            
            <div class="employee-list">
                ${renderEmployeeCards(paginatedEmployees)}
            </div>
            
            ${renderPagination(employees.length)}
        </div>
        
        <div id="filter-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Filter Employees</h3>
                <form id="filter-form">
                    <div class="form-group">
                        <label for="filter-firstName">First Name</label>
                        <input type="text" id="filter-firstName" class="form-control" />
                    </div>
                    <div class="form-group">
                        <label for="filter-department">Department</label>
                        <select id="filter-department" class="form-control">
                            <option value="">All Departments</option>
                            <option value="HR">HR</option>
                            <option value="IT">IT</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    
                    <div class="btn-container">
                        <button type="submit" class="btn primary">Apply Filters</button>
                        <button type="button" id="clear-filters" class="btn">Reset</button>
                    </div>
                    
                </form>
            </div>
        </div>
    `;
    
    appContainer.insertAdjacentHTML('beforeend', dashboardHTML);
    updateSortSelect();
}


function renderEmployeeCards(employees) {

    if (employees.length === 0) {
        return '<p class="no-results">No employees found!</p>';
    }
    
    return employees.map(employee => `
        <div class="employee-card" data-id="${employee.id}">
            <div class="card-header">
                <h3>${employee.firstName} ${employee.lastName}</h3>
                <span class="badge ${employee.department.toLowerCase()}">${employee.department}</span>
            </div>
            <div class="card-body">
                <p><span>ID:</span> ${employee.id}</p>
                <p><span>Email:</span> ${employee.email}</p>
                <p><span>Role:</span> ${employee.role}</p>
            </div>
            <div class="card-actions">
                <button class="btn edit-btn" data-id="${employee.id}">Edit</button>
                <button class="btn danger delete-btn" data-id="${employee.id}">Delete</button>
            </div>
        </div>
    `).join('');
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';
    
    let paginationHTML = '<div class="pagination">';
    
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">Previous</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Next</button>`;
    }
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Form View
function renderEmployeeForm(employeeId = null) {
    currentView = 'form';
    
    const isEdit = employeeId !== null;
    const employee = isEdit ? getEmployees().find(e => e.id === employeeId) : null;
    
    const formHTML = `
        <div class="form-container">
            <h2 class="add-employee">${isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form id="employee-form" class="employee-form">
                <input type="hidden" id="employee-id" value="${employee?.id || ''}">

                    <label  class="form-label" for="first-name">First Name*</label>
                    <input type="text" id="first-name" class="form-control" value="${employee?.firstName || ''}" required />
                    <div class="error-message" id="first-name-error"></div>
            
                    <label  class="form-label"  for="last-name">Last Name*</label>
                    <input type="text" id="last-name" class="form-control" value="${employee?.lastName || ''}" required />
                    <div class="error-message" id="last-name-error"></div>

                    <div class="form-group-container">
                        <div class="form-group">
                            <label  class="form-label"  for="email">Email*</label>
                            <input type="email" placeholder="type here" id="email" class="form-control" value="${employee?.email || ''}" required />
                            <div class="error-message" id="email-error"></div>
                        </div>

                        <div class="form-group">
                            <label for="department">Department*</label>
                            <select id="department" class="form-control" required>
                                <option value="">Select Department</option>
                                <option value="HR" ${employee?.department === 'HR' ? 'selected' : ''}>HR</option>
                                <option value="IT" ${employee?.department === 'IT' ? 'selected' : ''}>IT</option>
                                <option value="Finance" ${employee?.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                <option value="Marketing" ${employee?.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            </select>
                            <div class="error-message" id="department-error"></div>
                        </div>
                    </div>
                                
                    <div class="form-group">
                        <label for="role">Role*</label>
                        <input type="text" id="role" class="form-control" value="${employee?.role || ''}" required />
                        <div class="error-message" id="role-error"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn primary">${isEdit ? 'Update' : 'Save'}</button>
                        <button type="button" id="cancel-form" class="btn">Cancel</button>
                    </div>
            </form>
        </div>
    `;
    
    appContainer.innerHTML = '';
    renderNavigation();
    appContainer.insertAdjacentHTML('beforeend', formHTML);
}

// Helper Functions
function paginate(array, pageNumber, pageSize) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

// updating sort in ascending order and descending order
function updateSortSelect() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = `${currentSort.key}-${currentSort.direction}`;
    }
}

function validateForm() {
    let isValid = true;
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const department = document.getElementById('department').value;
    const role = document.getElementById('role').value.trim();
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate first name
    if (!firstName) {
        document.getElementById('first-name-error').textContent = 'First name is required';
        isValid = false;
    }
    
    // Validate last name
    if (!lastName) {
        document.getElementById('last-name-error').textContent = 'Last name is required';
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email';
        isValid = false;
    }
    
    // Validate department
    if (!department) {
        document.getElementById('department-error').textContent = 'Department is required';
        isValid = false;
    }
    
    // Validate role
    if (!role) {
        document.getElementById('role-error').textContent = 'Role is required';
        isValid = false;
    }
    
    return isValid;
}

// Event Listeners
function setupEventListeners() {

    // Handle form submission (add/edit/filter)

    document.addEventListener("submit", e=> {
        // employee form
        if (e.target.id === "employee-form") {
            e.preventDefault()

            if(!validateForm()) return;

            const data = {
                firstName: document.getElementById('first-name').value.trim(),
                lastName: document.getElementById('last-name').value.trim(),
                email: document.getElementById('email').value.trim(),
                department: document.getElementById('department').value.trim(),
                role: document.getElementById('role').value.trim(),
            };

            const id = document.getElementById('employee-id').value;
            id ? updateEmployee(+id, data) : addEmployee(data);

            renderDashboard()
        }


        // filter modal 
        if(e.target.id === "filter-form") {
            e.preventDefault()
            currentFilters = {
                firstName: document.getElementById('filter-first-name')?.value.trim() || "",
                department: document.getElementById('filter-department')?.value || "" ,
                role: document.getElementById('filter-role')?.value.trim() || "",
            };

            currentPage = 1;
            document.getElementById('filter-modal').style.display = 'none';
            renderDashboard()
        }
    });


    // Handle click actions (add/edit/delete/pagination/filter modal)
    document.addEventListener("click", e=> {
        const t = e.target;

        // Add show 
        if (t.id === "add-employee-btn") renderEmployeeForm()

        // Edit existing
        if (t.classList.contains("edit-btn")) renderEmployeeForm(+t.dataset.id);


        if(t.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this employee?")) {
                deleteEmployee(+t.dataset.id);
                renderDashboard()
            }
        }

        // Pagination
        if(t.classList.contains("page-btn")) {
            currentPage = +t.dataset.page;
            renderDashboard();
        }

        // open modal 
        if(t.id === "filter-btn") {
            const modal = document.getElementById("filter-modal");
            if (modal) modal.style.display = "flex";
        }

        // close modal 
        if(t.classList.contains("close-modal") || t.id === "clear-filters") {
            const modal = document.getElementById("filter-modal");
            if (modal) modal.style.display = "none";
        }

        // cancel form 
        if(t.id === "cancel-form") {
            renderDashboard()
        }
    });
    

    // Search input functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if(searchBtn && searchInput) {
        const Search = () => {
           currentFilters = {
            ...currentFilters,
            search: searchInput.value.trim()
           };
           currentPage = 1;
           renderDashboard();
        }

        searchBtn.addEventListener('click', Search);
        searchInput.addEventListener('keyup', e=> {
            if (e.key === 'Enter') 
                Search();
        });
    }

    // Sorting dropdown change
    document.getElementById("change", e => {
        if (e.target && e.target.id === "sort-select") {
            const [key, direction] = e.target.value.split('-');
            currentSort = {key, direction};
            currentPage = 1;
            renderDashboard();
        }
    });
    
    // Extra filter and reset buttons
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentFilters = {
                firstName: document.getElementById('filter-firstName')?.value.trim() || "" ,
                department: document.getElementById('filter-department')?.value || "" ,
                role: document.getElementById('filter-role').value.trim() || "" 
            };
            currentPage = 1;
            document.getElementById('filter-modal').style.display = 'none';
            renderDashboard();
        });
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = {};
            if (document.getElementById("filter-form")) {
                document.getElementById('filter-form').reset();
            }
            currentPage = 1;
            document.getElementById("filter-modal").style.display = "none";
            renderDashboard();
        });
    }
    
    // Employee form submission
    const employeeForm = document.getElementById('employee-form');
    if (employeeForm) {
        employeeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            const employeeData = {
                firstName: document.getElementById('first-name').value.trim(),
                lastName: document.getElementById('last-name').value.trim(),
                email: document.getElementById('email').value.trim(),
                department: document.getElementById('department').value,
                role: document.getElementById('role').value.trim()
            };
            
            const employeeId = document.getElementById('employee-id').value;
            
            if (employeeId) {
                // Update existing employee
                updateEmployee(parseInt(employeeId), employeeData);
            } else {
                // Add new employee
                addEmployee(employeeData);
            }
            
            renderDashboard();
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);