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
        inquirer.prompt([
            {
                name: "item",
                message: "What is the ID of the item would you like to buy?",
                type: "input"
            },
            {
                name: "quantity",
                message: "How many would you like?",
                type: "input"
            }
        ]).then(function(input){
            selectItem(input.item,input.quantity);
        });
    });

}

function selectItem(id, quantity) {    
    var product; 
    var query = connection.query(
        "SELECT * FROM products WHERE id = ?",[id],function(error,results,fields){
            product = results[0];

            if (product.stock_quantity >= quantity){
                connection.query(
                    "UPDATE products SET stock_quantity = ? WHERE id = ?",[product.stock_quantity - quantity,id]
                )
    
                console.log("Total is :"+ product.price*quantity);
                inquirer.prompt([
                    {
                        name: "item",
                        message: "Would you like to make another purchase?",
                        type: "list",
                        choices: ["yes", "no"]
                }]).then(function(input){
                    if (input.item == "yes") {
                        start();
                    } else {
                        process.exit()
                    }
                })

            } else {
                console.log("Insufficient quantity!");
                askAgain(id);
            }


        }
    )    
}

function askAgain(id){
    inquirer.prompt([
        {
            name: "quantity",
            message: "How many would you like?",
            type: "input"
        }
    ]).then(function(input){
        selectItem(id,input.quantity);
    });

}
