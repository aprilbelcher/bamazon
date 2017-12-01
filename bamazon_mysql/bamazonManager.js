var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("cli-table");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
  }
);

function start(){
    
    inquirer.prompt([
        {
            name: "listChoice",
            message: "What would you like to do?",
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    }]).then(function(listChoice){
            switch (listChoice.listChoice) {
                case "View Products for Sale":
                        forSale();
                        start();
                    break;
                case "View Low Inventory": 
                    lowInventory();
                    start();
                    break;
                case "Add to Inventory":
                inquirer.prompt([
                    {
                        name: "stock_input",
                        message: "What is the id of item do you want to add inventory?",
                        type: "input"
                    },
                    {
                        name: "stock_quantity",
                        message: "How many do you want to add?",
                        type: "input"
                    }
                    ]).then(function(query) {
                        addInventory(query.stock_input, query.stock_quantity);
                        start();
                    });  

                    break;
                case "Add New Product":
                inquirer.prompt([
                    {
                        name: "product",
                        message: "What product do you want to add",
                        type: "input"
                    },
                    {
                        name: "department",
                        message: "Which department do you want to assign it?",
                        type: "input"
                    },
                    {
                        name: "price",
                        message: "How much is the item?",
                        type: "input"
                    },
                    {
                        name: "quantity",
                        message: "How many stocks do you want to add?",
                        type: "input"
                    }
                    ]).then(function(query) {
                        addProduct(query);
                        start();
                    });  

                    break;
                case "Quit":
                    inquirer.prompt([
                        {
                            name: "query",
                            message: "Which song?",
                            type: "input"
                        }
                        ]).then(function(query) {
                            searchForSong(query.query);
                        });  
                    break;
            }
        });
    }


function forSale(){
    connection.query("SELECT * from products",[],function(error,results,fields){
        var productsTable = new table({
            head: ['id','product_name','department_name', 'price', 'stock_quantity']
        });
        for(var i = 0; i < results.length; i++){
            productsTable.push([
                results[i].id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity
            
            ]);   
        }
        console.log(productsTable.toString());
    })
    
    
}

function lowInventory(){
    connection.query(
        "SELECT * FROM products WHERE stock_quantity <= ?",[10],function(error,results,fields){
            var productsTable = new table({
                head: ['id','product_name','department_name', 'price', 'stock_quantity']
            });
            for(var i = 0; i < results.length; i++){
                productsTable.push([
                    results[i].id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity
                
                ]);   
            }
            console.log(productsTable.toString());
        });
}

function addInventory(id,addstock_quantity){
    connection.query("SELECT * from products WHERE id = ?",[id],function(error,results,fields){
        var product = results[0];
        connection.query(
            "UPDATE products SET stock_quantity = ? WHERE id = ?", [parseInt(product.stock_quantity )+ parseInt(addstock_quantity),id], function(error,results,fields){
                connection.query(
                    "SELECT * FROM products WHERE stock_quantity ",[],function(error,results,fields){
                        var productsTable = new table({
                            head: ['id','product_name','department_name', 'price', 'stock_quantity']
                        });
                        for(var i = 0; i < results.length; i++){
                            productsTable.push([
                                results[i].id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity
                            
                            ]);   
                        }
                        console.log(productsTable.toString());
                    });
            }
        )
    });
}

function addProduct(input){
    connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?,?,?,?)",[input.product, input.department, input.price, input.quantity])
}