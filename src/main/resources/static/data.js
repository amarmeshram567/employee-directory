// Initial mock employee data

// Initial mock employee data is loaded from localStorage if available.
//Otherwise. fallback to default smaple data

let employees = JSON.parse(localStorage.getItem("employees")) || [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        department: 'HR',
        role: 'Manager'
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        department: 'IT',
        role: 'Developer'
    }
];

// Generate unique ID for a new employee by taking the max Id in the list and adding 1
function generateId() {
    return employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
}

// save to employee array to localStorage 
function saveToLocalStorage() {
    localStorage.setItem("employees", JSON.stringify(employees));
}

// CRUD Operations returns current list of employees
function getEmployees() {
    return employees;
}


// Adding a new employee to the list and saves it
function addEmployee(employee) {
    const newEmployee = { ...employee, id: generateId() };
    employees.push(newEmployee);
    saveToLocalStorage();
    return newEmployee;
}


// Updates an existing employee by id and saves it
function updateEmployee(id, updatedData) {
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
        employees[index] = { ...employees[index], ...updatedData };
        saveToLocalStorage();
        return employees[index];
    }
    return null;
}

// Deletes an employee from the list by ID
function deleteEmployee(id) {
    employees = employees.filter(e => e.id !== id);
    saveToLocalStorage();
}

// Filters the employee list based on multiple criteria
function filterEmployees(criteria) {
    return employees.filter(employee => {
        return Object.keys(criteria).every(key => {
            if(!criteria[key]) return true;

            if(key === "search") {
                const keyword = criteria[key].toLowerCase();
                return (
                    employee.firstName.toLowerCase().includes(keyword) ||
                    employee.lastName.toLowerCase().includes(keyword) ||    
                    employee.email.toLowerCase().includes(keyword) ||
                    employee.department.toLowerCase().includes(keyword) ||
                    employee.role.toLowerCase().includes(keyword)
                );
            }
            // Compare field value with filter (case-insensitive)
            return employee[key]?.toLowerCase().includes(criteria[key].toLocaleLowerCase());
        });
    });
}

// Sorts the employee list by given key and direction
function sortEmployees(employees, key, direction = 'asc') {
    return [...employees].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Exporting functions to  app file
export { 
    getEmployees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    filterEmployees,
    sortEmployees
};