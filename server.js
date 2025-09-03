import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
// import pg from 'pg' //using pool instead of client for multi-access at a time
import multer from 'multer';
import fs from 'fs'
import bcrypt from "bcrypt";
import dotenv from 'dotenv'
dotenv.config();


import  session  from 'express-session';
import nodemailer from 'nodemailer'



//Variables for use
// let user_id;

const app = express()
const port = 3000;

app.use(session({
  secret: "mynameisBATMAN",  
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // set to true if using HTTPS
}));

const upload = multer({ dest: 'uploads/' })
const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "academic")));
app.use(express.static(path.join(__dirname, "admin")));
app.use(express.static(path.join(__dirname, "buy_sell")));
app.use(express.static(path.join(__dirname, "LossFound")));

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" 
       ? { rejectUnauthorized: false } 
       : false,
});

db.connect();

// Setup transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout:10000
});

app.get("/", (req, res)=>{
    res.sendFile(__dirname +'/index.html')
})

//helping function to check valid email
function validateNitapEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@nitap\.ac\.in$/.test(email);
}

app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    if (!validateNitapEmail(to)) {
    return res.status(400).json({ error: "Invalid email. Use your nitap.ac.in email." });
    }

    await transporter.sendMail({
      from: `"NITAP CIRCLE" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    res.json({ message: "✅ Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to send email. check email" });
  }
});



app.post("/register", async (req, res) => {
  const { Name,Email, password, college_id } = req.body;
  // console.log(Email, Name,password)

  try {
    if (!password) {
      return res.status(400).send("Enter a valid password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password,college_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [Name, Email, hashedPassword, college_id]
    );

    res.redirect("/");
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Email already exists" });

    } else {
      console.error(err);
      res.status(500).json({ error: "Server Error" });

    }
  }
});



app.post("/login", async (req, res) => {
  const { Email, userPassword } = req.body;

  try {
    const result = await db.query("SELECT password FROM users WHERE email = $1", [Email]);

    if (result.rows.length === 0) {
      return res.status(400).json({error:"User not found"});
    }

    const hashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(userPassword, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({error2:"Invalid credentials"});
    }
    //storing useremail for the use
    req.session.userEmail = Email;
      // const email = req.session.userEmail; // how to get this data for later use

    res.json({ email: Email });


  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


//admin login form 
app.post("/adminLogin", async (req, res) => {
  const { Email, userPassword } = req.body;
  try {
    const result = await db.query(
      "SELECT password FROM adminstration WHERE email = $1",
      [Email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const storedPassword = result.rows[0].password;

    if (userPassword !== storedPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ email: Email });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});




app.get("/api/Products", async (req, res) => {
    try {
        const result = await db.query('SELECT u.name,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where approved= true');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});

app.get("/api/myProducts", async (req, res) => {
  const userEmail = req.session.userEmail;
    try {
        const result = await db.query('SELECT u.name,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where p.email = $1 AND approved= true;',[userEmail]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});



app.post("/sellProduct", upload.single("image"), async (req, res) => {
    // Create dictionary (JS object) from form
    const userEmail = req.session.userEmail;

    const itemName = req.body.itemName
    const desc = req.body.desc
    const email = req.body.email
    const hostel = req.body.hostel
    const contact = req.body.contact
    const category = req.body.category
    const price = req.body.price
    if(email!=userEmail) {
      res.send(`
        <script>
            alert('email not matched with current user');
            window.location.href = 'buysell.html'; 
        </script>
    `);
    }
    
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into products (product_name , description , contact ,hostel ,category, email, image, price) values ($1, $2,$3,$4,$5,$6,$7,$8) ;',
        [itemName, desc, contact ,hostel , category,email , image_data,price]
    );
    res.send(`
        <script>
            alert('item will be added to store');
            window.location.href = 'buysell.html'; 
        </script>
    `);
});

//deleting product from the selling options my product
app.post("/api/delete", async (req, res) => {
  const userEmail = req.session.userEmail;

  try {
    const { product_name } = req.body;

    if (!product_name) {
      return res.status(400).send("Product name is required");
    }

    const result = await db.query(
      "DELETE FROM products WHERE product_name = $1 and email = $2 RETURNING *",
      [product_name,userEmail]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Id not matched, try logging again");
    }

    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

// varifying the items listed for selling by any admin

app.get('/api/Products/varifyList', async (req, res)=>{
  try {
        const result = await db.query('SELECT u.name,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where approved= false');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
})

//removing if not appropriate
app.post('/api/delete/admin', async (req, res)=>{
  try {
    const { product_name,email } = req.body;

    if (!product_name) {
      return res.status(400).send("Product name is required");
    }

    const result = await db.query(
      "DELETE FROM products WHERE product_name = $1 and email = $2 RETURNING *",
      [product_name,email]
    );
    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
})
//approving valid sale products
app.post('/api/approve/admin', async (req, res)=>{
    try {
    const { product_name,email } = req.body;

    if (!product_name) {
      return res.status(400).send("Product name is required");
    }

    const result = await db.query(
      "update products set approved = $1 where product_name = $2 and email = $3 ",
      [true,product_name,email]
    );
    res.status(200).send("Product Approved for sale successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving product");
  }
})



app.listen(port, () => {
    console.log("lidtning on port number ", port);
})
