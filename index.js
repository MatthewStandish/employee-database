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
