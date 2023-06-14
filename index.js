const inquirer = require("inquirer");
const connection = require("./db/connection");
// Function to start the application
function startApp() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Update employee managers",
        "View employees by manager",
        "View employees by department",
        "Delete departments, roles, and employees",
        "View total utilized budget of a department",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Update employee managers":
          updateEmployeeManagers();
          break;
        case "View employees by manager":
          viewEmployeesByManager();
          break;
        case "View employees by department":
          viewEmployeesByDepartment();
          break;
        case "Delete departments, roles, and employees":
          deleteData();
          break;
        case "View total utilized budget of a department":
          viewUtilizedBudget();
          break;
        case "Exit":
          console.log("Goodbye!");
          process.exit(0);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
// View all departments
async function viewAllDepartments() {
  try {
    const departments = await query("SELECT * FROM departments");
    console.table(departments);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// View all roles
async function viewAllRoles() {
  try {
    const roles = await query(`
      SELECT roles.id, roles.title, roles.salary, departments.name AS department
      FROM roles
      INNER JOIN departments ON roles.department_id = departments.id
    `);
    console.table(roles);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// View all employees
async function viewAllEmployees() {
  try {
    const employees = await query(`
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        roles.title AS role,
        departments.name AS department,
        roles.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees AS e
      INNER JOIN roles ON e.role_id = roles.id
      INNER JOIN departments ON roles.department_id = departments.id
      LEFT JOIN employees AS m ON e.manager_id = m.id
    `);
    console.table(employees);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// Add a department
async function addDepartment() {
  try {
    const answer = await inquirer.prompt({
      name: "name",
      type: "input",
      message: "Enter the name of the department:",
      validate: (input) => {
        if (input.trim() !== "") {
          return true;
        }
        return "Please enter a department name.";
      },
    });

    await query("INSERT INTO departments SET ?", { name: answer.name });
    console.log("Department added successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// Add a role
async function addRole() {
  try {
    const departments = await query("SELECT * FROM departments");

    const answer = await inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "Enter the title of the role:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          }
          return "Please enter a role title.";
        },
      },
      {
        name: "salary",
        type: "number",
        message: "Enter the salary for the role:",
        validate: (input) => {
          if (!isNaN(input) && input >= 0) {
            return true;
          }
          return "Please enter a valid salary (a non-negative number).";
        },
      },
      {
        name: "department",
        type: "list",
        message: "Select the department for the role:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ]);

    await query("INSERT INTO roles SET ?", {
      title: answer.title,
      salary: answer.salary,
      department_id: answer.department,
    });
    console.log("Role added successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// Add an employee
async function addEmployee() {
  try {
    const roles = await query("SELECT * FROM roles");
    const employees = await query("SELECT * FROM employees");

    const answer = await inquirer.prompt([
      {
        name: "first_name",
        type: "input",
        message: "Enter the employee's first name:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          }
          return "Please enter the employee's first name.";
        },
      },
      {
        name: "last_name",
        type: "input",
        message: "Enter the employee's last name:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          }
          return "Please enter the employee's last name.";
        },
      },
      {
        name: "role",
        type: "list",
        message: "Select the employee's role:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
      {
        name: "manager",
        type: "list",
        message: "Select the employee's manager:",
        choices: [
          { name: "None", value: null },
          ...employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        ],
      },
    ]);

    await query("INSERT INTO employees SET ?", {
      first_name: answer.first_name,
      last_name: answer.last_name,
      role_id: answer.role,
      manager_id: answer.manager,
    });
    console.log("Employee added successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// Update an employee role
async function updateEmployeeRole() {
  try {
    const employees = await query("SELECT * FROM employees");
    const roles = await query("SELECT * FROM roles");

    const answer = await inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "Select the employee to update:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        name: "role",
        type: "list",
        message: "Select the new role for the employee:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ]);

    await query("UPDATE employees SET role_id = ? WHERE id = ?", [
      answer.role,
      answer.employee,
    ]);
    console.log("Employee role updated successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}
async function updateEmployeeManagers() {
  try {
    const employees = await query("SELECT * FROM employees");
    const managers = [{ name: "None", value: null }, ...employees];

    const answer = await inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "Select the employee to update:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        name: "manager",
        type: "list",
        message: "Select the new manager for the employee:",
        choices: managers.map((manager) => ({
          name: manager.name
            ? `${manager.first_name} ${manager.last_name}`
            : "None",
          value: manager.value,
        })),
      },
    ]);

    await query("UPDATE employees SET manager_id = ? WHERE id = ?", [
      answer.manager,
      answer.employee,
    ]);
    console.log("Employee manager updated successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// View employees by manager
async function viewEmployeesByManager() {
  try {
    const employees = await query("SELECT * FROM employees");
    const managers = [{ name: "None", value: null }, ...employees];

    const answer = await inquirer.prompt([
      {
        name: "manager",
        type: "list",
        message: "Select the manager to view employees:",
        choices: managers.map((manager) => ({
          name: manager.name
            ? `${manager.first_name} ${manager.last_name}`
            : "None",
          value: manager.value,
        })),
      },
    ]);

    const managerId = answer.manager;
    const queryString = `
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        roles.title AS role,
        departments.name AS department,
        roles.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees AS e
      INNER JOIN roles ON e.role_id = roles.id
      INNER JOIN departments ON roles.department_id = departments.id
      LEFT JOIN employees AS m ON e.manager_id = m.id
      WHERE e.manager_id = ${managerId}
    `;
    const employeesByManager = await query(queryString);
    console.table(employeesByManager);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// View employees by department
async function viewEmployeesByDepartment() {
  try {
    const departments = await query("SELECT * FROM departments");

    const answer = await inquirer.prompt([
      {
        name: "department",
        type: "list",
        message: "Select the department to view employees:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ]);

    const departmentId = answer.department;
    const queryString = `
      SELECT
        e.id,
        e.first_name,
        e.last_name,
        roles.title AS role,
        departments.name AS department,
        roles.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees AS e
      INNER JOIN roles ON e.role_id = roles.id
      INNER JOIN departments ON roles.department_id = departments.id
      LEFT JOIN employees AS m ON e.manager_id = m.id
      WHERE departments.id = ${departmentId}
    `;
    const employeesByDepartment = await query(queryString);
    console.table(employeesByDepartment);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// Delete departments, roles, and employees
async function deleteData() {
  try {
    const answer = await inquirer.prompt({
      name: "action",
      type: "list",
      message: "What would you like to delete?",
      choices: ["Department", "Role", "Employee"],
    });

    switch (answer.action) {
      case "Department":
        await deleteDepartment();
        break;
      case "Role":
        await deleteRole();
        break;
      case "Employee":
        await deleteEmployee();
        break;
    }
  } catch (error) {
    console.error(error);
    startApp();
  }
}

async function deleteDepartment() {
  try {
    const departments = await query("SELECT * FROM departments");

    const answer = await inquirer.prompt([
      {
        name: "department",
        type: "list",
        message: "Select the department to delete:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ]);

    await query("DELETE FROM departments WHERE id = ?", [answer.department]);
    console.log("Department deleted successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

async function deleteRole() {
  try {
    const roles = await query("SELECT * FROM roles");

    const answer = await inquirer.prompt([
      {
        name: "role",
        type: "list",
        message: "Select the role to delete:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ]);

    await query("DELETE FROM roles WHERE id = ?", [answer.role]);
    console.log("Role deleted successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

async function deleteEmployee() {
  try {
    const employees = await query("SELECT * FROM employees");

    const answer = await inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "Select the employee to delete:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
    ]);

    await query("DELETE FROM employees WHERE id = ?", [answer.employee]);
    console.log("Employee deleted successfully!");
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}

// View total utilized budget of a department
async function viewUtilizedBudget() {
  try {
    const departments = await query("SELECT * FROM departments");

    const answer = await inquirer.prompt([
      {
        name: "department",
        type: "list",
        message: "Select the department to view the budget:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ]);

    const departmentId = answer.department;
    const queryString = `
      SELECT SUM(roles.salary) AS utilized_budget
      FROM employees
      INNER JOIN roles ON employees.role_id = roles.id
      WHERE roles.department_id = ${departmentId}
    `;
    const result = await query(queryString);
    console.log(`Total Utilized Budget: $${result[0].utilized_budget}`);
    startApp();
  } catch (error) {
    console.error(error);
    startApp();
  }
}
// Start the application
startApp();
