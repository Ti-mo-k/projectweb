const express = require('express');
const session = require ('express-session');
const bodyparser = require('body-parser');
const mysql = require ('mysql2');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const path = require('path')

const app=express();

// session middleware
app.use(session({
    secret:'jjgvhbbh,bs.nó289048953-hjrau-tiuequy8tt-tau8tkosn',
    resave: false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        maxAge: 30 * 60 * 1000
    }
}))

// middleware
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({extended : true}));
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, '/static')))

app.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname,'register.html'))
})
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname,'login.html'))
})
app.get('/home',checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'home.html'))
})
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'index.html'))
})
app.get('/cattleInfo', checkAuth,(req,res) => {
    res.sendFile(path.join(__dirname,'cattleInfo.html'))
})
app.get('/viewcattleInfo', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'viewcattleInfo.html'))
})
app.get('/milkRecords', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'milkRecords.html'))
})
app.get('/milkrecordtable',checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'milkrecordtable.html'))
})
app.get('/breeding', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'breeding.html'))
})
app.get('/breedingview', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'viewbreedinginfo.html'))
})
app.get('/health', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'health.html'))
})
app.get('/viewhealth', checkAuth, (req,res) => {
    res.sendFile(path.join(__dirname,'viewhealth.html'))
})

function checkAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Tim200@4',
    database: 'webproject'
})

db.connect((err) =>{
    if (err) {
        console.log('Error conecting to mysql', err.message)
    } else {
        console.log('connected to mysql successfully')
    }

});

const userTable =`
    CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
    ) 
    `;

db.query(userTable, (err) =>{
    if (err) {
        console.log('Errror creating user table', err.message)
    } else {
        console.log('Users table created')
    }
})
const CattleInfoTable =`
    CREATE TABLE IF NOT EXISTS cattleInfo(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    )  

`
db.query(CattleInfoTable,(err) =>{
    if (err) {
        console.log('Errror creating cattle table', err.message)  
    } else {
        console.log('cattle table created')
    }
})
const milkRecords =`
    CREATE TABLE IF NOT EXISTS milkRecords(
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     date DATE,
     session VARCHAR(255),
     liters DECIMAL(5,2),
     user_id INT,
     FOREIGN KEY (user_id) REFERENCES users(id)
     )
`
db.query(milkRecords,(err) =>{
    if (err) {
        console.log('Errror creating milk record table', err.message)  
    } else {
        console.log('milk record table created')
    }
})

const breeding=`
      CREATE TABLE IF NOT EXISTS breeding(
      id INT AUTO_INCREMENT PRIMARY KEY,
      cowname VARCHAR(255) NOT NULL,
      bull_id VARCHAR(255) NOT NULL,
      breeding_date DATE,
      expectancy_date DATE,
      user_id INT,     
      FOREIGN KEY (user_id) REFERENCES users(id) 
      )
`
db.query(breeding,(err) =>{
    if (err) {
        console.log(err, err.message)
    } else {
        console.log('breeding table created')
    }
})

const health =`
    CREATE TABLE IF NOT EXISTS health(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    date DATE NOT NULL,
    notes VARCHAR(255),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    )  

`
db.query(health,(err) =>{
    if (err) {
        console.log(err, err.message)
    } else {
        console.log('health table created')
    }
})
app.post('/register',
    [
        check('username').isString().isLength({ min: 3 }),
        check('password').isLength({ min: 8 })
    ],
    async(req,res)=>{
    
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('username has to be more than three charcters and password more than 8 characters');
    }
    const {username ,password} = req.body;
    const hashedpassword = await bcrypt.hash(password, 8)

    db.query('INSERT INTO users SET ?',{username, password:hashedpassword}, (err) =>{
        if (err) {
            console.log('error inserting into users', err.message)
            res.status(500).send('Server error')
        }
        else{
             res.redirect('/login')
        }
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }

        if (results.length === 0) {
            res.status(400).send('Invalid username or password');
            return;
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).send('Invalid username or password');
            return;
        }

        req.session.user = { id: user.id, username: user.username };
        res.redirect('/home');
    });
});


app.post('/cattleInfo',checkAuth, (req,res) => {
    const {name,breed,gender} =req.body;
    const user_id = req.session.user.id;
    db.query('INSERT INTO cattleInfo SET ?',{name,breed,gender,user_id}, (err) =>{
        if (err) {
            console.log('error inserting into cattleInfo', err.message)
            res.status(500).send('Server error') 
        } else {
            res.send('submitted successfuly')
        }
    })
})

app.get('/viewcattleinformation', checkAuth, (req, res) => {
    const user_id = req.session.user.id;
    db.query('SELECT * FROM cattleInfo where user_id = ?',[user_id], (err, results) => {
        if (err) {
            console.log('error fetching cattle info', err.message);
            res.status(500).send('Server error');
        } else {
            res.json(results);
            console.log(results)
        }
    });
});

app.post('/milkRecords', checkAuth,(req, res) => {
    const { name, dateTime, morningLiters, afternoonLiters, eveningLiters, session } = req.body;
    const user_id = req.session.user.id;

    if (!session || !Array.isArray(session) || session.length === 0) {
         return res.status(400).send('Session data is required and should be a non-empty array.');
    }

    const values = [];

    if (session.includes("Morning")) {
        values.push([name, dateTime, "Morning", morningLiters, user_id]);
    }
    if (session.includes("Afternoon")) {
        values.push([name, dateTime.split('T')[0], "Afternoon", afternoonLiters,user_id]);
    }
    if (session.includes("Evening")) {
        values.push([name, dateTime.split('T')[0], "Evening", eveningLiters,user_id]);
    }

    console.log(values); // Log to check the structure

    if (values.length > 0) {
        const query = 'INSERT INTO milkRecords (name, date, session, liters,user_id) VALUES ?';
        db.query(query, [values], (err) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send('Error inserting data');
            }
            res.send('Data inserted successfully');
        });
    } else {
        res.status(400).send('No valid session data provided');
    }
});
app.get('/viewmilkRecords', checkAuth, (req, res) => {
    const name = req.query.name;
    const date = req.query.date;
    const user_id = req.session.user.id;

    let query = 'SELECT * FROM milkRecords WHERE user_id = ?'; // Start with a true condition
    const params = [user_id];

    if (name) {
        query += ' AND name = ?';
        params.push(name);
    }
    if (date) {
        query += ' AND date = ?';
        params.push(date);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

app.post('/breeding',checkAuth, (req,res) =>{
    const {cowname, bull_id, breeding_date, expectancy_date} = req.body;
    const user_id = req.session.user.id;

    db.query('INSERT INTO breeding SET ?', {cowname, bull_id, breeding_date, expectancy_date, user_id}, (err) => {
        if (err) {
            console.log('error inserting into breeding table', err.message)
            res.status(500).send('Server error')
        } else {
            res.send('Submitted successfully')
        }
    })
})

app.get('/viewbreeding', (req, res) => {
    const user_id = req.session.user.id;
    db.query('SELECT * FROM breeding where user_id = ?',[user_id], (err, results) => {
        if (err) {
            console.log('error fetching breeding info', err.message);
            res.status(500).send('Server error');
        } else {
            res.json(results);
            console.log(results)
        }
    });
});

app.post('/add-record', (req, res) => {
    const {  name, breed, age, date, notes } = req.body;
    const user_id = req.session.user.id;
    db.query('INSERT INTO health SET ?',{name,breed,age,date,notes,user_id}, (err) =>{
        if (err) {
            console.log('error inserting into health table', err.message)
            res.status(500).send('Server error') 
        } else {
            res.send('submitted successfuly')
            // healthRecords.push({  name, breed, age, date, notes });
            // res.json({ success: true, records: healthRecords });
        }
    })
   
});
// Route to handle search requests
app.get('/search-records', (req, res) => {
    const { name } = req.query;
    const user_id = req.session.user.id; 

    let query = 'SELECT * FROM health WHERE user_id = ? AND name = ?';
    db.query(query, [user_id, name], (err, results) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
});


app.listen(3000, () => {
    console.log('app is running on port 3000')

})