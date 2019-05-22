var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;


var app = express();

app.set('veiws', path.join(__dirname, 'veiws'));
app.set('veiw engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123'));
var session = driver.session();

// home page
app.get('/', function (req, res) {
    res.send(`
    <a href="http://localhost:3000/Q1">i. Only consider the products which contain the letter ‘A’ in their names, you are required to get the Max UnitPrice per each Category.</a>
    <br/><br/>
    <a href="http://localhost:3000/Q2">ii. Get the names of the Employees, who are managing at least 3 employees.</a>
    <br/><br/>
    <a href="http://localhost:3000/Q3">iii. For any 2 employees (x reports to Y), and Y reports to Z. Update the data to make sure that both X and Y reporting to Z.</a>
    <br/><br/>
    <a href="http://localhost:3000/Q4">iv. who are the customers performed more than 300 orders through the same employee?</a>
    <br/><br/>
    <a href="http://localhost:3000/Q5">v.	Get the top 3 categories in terms of their number of products.</a>
    <br/><br/>
    <a href="http://localhost:3000/Q6">vi. Get the customers who did orders using the same employee?</a>
    `);

})

app.get('/Q1', function (req, res) {

    session
        .run(`
            match (p:Product),(c:Category)
            WHERE p.categoryID = c.categoryID AND p.productName CONTAINS 'A' 
            RETURN p.productName AS PName,c.categoryName AS CName,max(p.unitPrice) AS maxUnit
        `)
        .then(function (result) {

            console.log('');
            result.records.forEach(function (record) {

                console.log('productName: ' + record.get('PName'));
                console.log('categoryName: ' + record.get('CName'));
                console.log('Max Price: ' + record.get('maxUnit'));
                console.log('\n');

            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})


//second query 

app.get('/Q2', function (req, res) {

    session
        .run(`
            match (e:Employee)
            with e.reportsTo as empID, count(*) as num
            where num>=3
            return empID,num
        `)
        .then(function (result) {

            result.records.forEach(function (record) {

                console.log('empID: ' + record.get('empID'));
                console.log('num: ' + record.get('num'));
                console.log('\n');

            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})


// third query 

app.get('/Q3', function (req, res) {

    session
        .run(`
            MATCH (x:Employee)-[:managed_by]->(y:Employee)-[:managed_by]->(z:Employee)
            WHERE not exists((x)-[:managed_by]->(z))
            CREATE (x)-[:managed_by]->(z)
        `)
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record);
            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})

// fourth query 

app.get('/Q4', function (req, res) {

    // put 100 in query as num less than required 300
    session
        .run(`
            match(o:Order) with count(o.customerID) as num,o.employeeID as empID
            where num>=100
            return num, empID
        `)
        .then(function (result) {
            result.records.forEach(function (record) {
                
                console.log('empID: ' + record.get('empID'));
                console.log('num: ' + record.get('num'));
                console.log('\n');
            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})

// fifth query 

app.get('/Q5', function (req, res) {

    session
        .run(`
            match(p:Product)
            with count(p.categoryID) as num, p.categoryID as catID
            return num,catID
            order by num desc
            limit 3
        `)
        .then(function (result) {
            result.records.forEach(function (record) {
                
                console.log('catID: ' + record.get('catID'));
                console.log('num: ' + record.get('num'));
                console.log('\n');
            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})

// last query 

app.get('/Q6', function (req, res) {

    session
        .run(`
            match (o:Order)
            RETURN o.employeeID as empID ,o.customerID as cusID
            order by o.employeeID
        `)
        .then(function (result) {
            result.records.forEach(function (record) {
                
                console.log('empID: ' + record.get('empID'));
                console.log('cusID: ' + record.get('cusID'));
                console.log('\n');
            });
        })
        .catch(function (err) {
            console.log(err);
        });

    res.send('it works');
})


app.listen(3000);
console.log('Server Started On Port 3000 !!')

module.exports = app;