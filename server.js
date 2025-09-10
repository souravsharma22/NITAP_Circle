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
import pgSession from "connect-pg-simple";

const PgSession = pgSession(session);


//Variables for use
// let user_id;

const app = express()
const port = 3000;


const upload = multer({ dest: 'uploads/' })
const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "academic")));
app.use(express.static(path.join(__dirname, "admin")));
app.use(express.static(path.join(__dirname, "buy_sell")));
app.use(express.static(path.join(__dirname, "LossFound")));
app.use(express.static(path.join(__dirname, "renting")));

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" 
       ? { rejectUnauthorized: false } 
       : false,
});

db.connect();
//using session storage to save the email of current user
app.use(
  session({
    store: new PgSession({
      pool: db,            // connection pool
      tableName: "user_sessions" // optional, defaults to "session"
    }),
    secret: "mynameisBATMAN",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24*7, // 7 day
      secure: false                // true if HTTPS
    }
  })
);

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


// auto deleting the old lost and found requests posted
async function cleanOldRequest() {
  try{
    await db.query("delete from  lost_items where lost_date< Now() - INTERVAL '30 days'")
    await db.query("delete from  found_items where found_date< Now() - INTERVAL '30 days'")

  }catch(err){
    console.error("Err deleting",err);
  }
  
}
cleanOldRequest();
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
        const result = await db.query('SELECT u.name,product_id,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where approved= true');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});

app.get("/api/myProducts", async (req, res) => {
  const userEmail = req.session.userEmail;
    try {
        const result = await db.query('SELECT u.name,p.product_id ,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where p.email = $1 AND approved= true;',[userEmail]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});

//deleting product from the selling options my product
app.post("/api/delete", async (req, res) => {
  const userEmail = req.session.userEmail;

  try {
    const { product_id } = req.body;

    const result = await db.query(
      "DELETE FROM products WHERE product_id = $1 and email = $2 RETURNING *",
      [product_id,userEmail]
    );

    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});


app.post("/sellProduct", upload.single("image"), async (req, res) => {
    const userEmail = req.session.userEmail;

    const itemName = req.body.itemName
    const desc = req.body.desc
    const hostel = req.body.hostel
    const contact = req.body.contact
    const category = req.body.category
    const price = req.body.price
    
    
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into products (product_name , description , contact ,hostel ,category, email, image, price) values ($1, $2,$3,$4,$5,$6,$7,$8) ;',
        [itemName, desc, contact ,hostel , category,userEmail , image_data,price]
    );
    res.send(`
        <script>
            alert('item will be added to store');
            window.location.href = 'buysell.html'; 
        </script>
    `);
});


// varifying the items listed for selling by any admin

app.get('/api/Products/varifyList', async (req, res)=>{
  try {
        const result = await db.query('SELECT u.name,p.product_id,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM products p join users u on p.email = u.email  where approved= false');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
})

//removing if not appropriate
app.post('/api/delete/admin/store', async (req, res)=>{
  try {
    const { product_id,email } = req.body;

    const result = await db.query(
      "DELETE FROM products WHERE product_id = $1 and email = $2 RETURNING *",
      [product_id,email]
    );
    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
})
//approving valid sale products
app.post('/api/approve/admin/store', async (req, res)=>{
    try {
    const { product_id,email } = req.body;

    const result = await db.query(
      "update products set approved = $1 where product_id = $2 and email = $3 ",
      [true,product_id,email]
    );
    res.status(200).send("Product Approved for sale successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving product");
  }
})

// // deleting the products that are listed for sale from the admin side
app.post("/api/admin/products/delete", async (req, res) => {
  try {
    const { product_id } = req.body;
    console.log(product_id)
    const result = await db.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [product_id]
    );
    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});


//lost and found server----

//listing found items request
app.post("/FoundListing", upload.single("image"), async (req, res) => {
    const userEmail = req.session.userEmail;

    const itemName = req.body.itemName
    const desc = req.body.desc
    const foundLocation = req.body.foundLocation
    const contact = req.body.contact
    const category = req.body.category
    
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into found_items (name , description , contact ,location ,category, email, image) values ($1, $2,$3,$4,$5,$6,$7) ;',
        [itemName, desc, contact ,foundLocation , category,userEmail , image_data]
    );
    res.send(`
        <script>
            alert('item will be added to found items list');
            window.location.href = 'loss.html'; 
        </script>
    `);
});

//listing lost request
app.post("/LostListing", upload.single("image"), async (req, res) => {
    const userEmail = req.session.userEmail;


    const itemName = req.body.itemName
    const desc = req.body.desc
    const lossLocation = req.body.lossLocation
    const contact = req.body.contact
    const category = req.body.category
    
    
    
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into lost_items (name , description , contact ,location ,category, email, image) values ($1, $2,$3,$4,$5,$6,$7) ;',
        [itemName, desc, contact ,lossLocation , category,userEmail , image_data]
    );
    res.send(`
        <script>
            alert('Request will be added to loss items request list');
            window.location.href = 'loss.html'; 
        </script>
    `);
});

//////////// for the user to get his lost requests and deleting them
app.get("/api/myRequest/lostitems", async (req, res) => {
  const userEmail = req.session.userEmail;
    try {
        const result = await db.query('SELECT id,name ,description,lost_date ,image  FROM lost_items where email = $1 AND approved= true;',[userEmail]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});

//deleting product from the selling options my product
app.post("/api/mylostRequest/delete", async (req, res) => {
  const userEmail = req.session.userEmail;

  try {
    const { req_id } = req.body;

    const result = await db.query(
      "DELETE FROM lost_items WHERE id = $1 and email = $2 RETURNING *",
      [req_id,userEmail]
    );
    //fo findin the error this helps 
    if (result.rowCount === 0) {
      return res.status(404).send("Id not matched, try logging again");
    }

    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

//////////// for the user to get his Found requests and deleting them
app.get("/api/myRequest/founditems", async (req, res) => {
  const userEmail = req.session.userEmail;
    try {
        const result = await db.query('SELECT id,name ,description,found_date ,image  FROM found_items where email = $1 AND approved= true;',[userEmail]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});

//deleting product from the selling options my product
app.post("/api/myfoundRequest/delete", async (req, res) => {
  const userEmail = req.session.userEmail;

  try {
    const { req_id } = req.body;

    const result = await db.query(
      "DELETE FROM found_items WHERE id = $1 and email = $2 RETURNING *",
      [req_id,userEmail]
    );
    //fo findin the error this helps 
    if (result.rowCount === 0) {
      return res.status(404).send("Id not matched, try logging again");
    }

    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});


//loading found items 
app.get("/api/found_Items", async (req, res) => {
    try {
        const result = await db.query('SELECT u.name as username,p.name, p.description, p.contact, p.location, p.category, p.email, p.image, p.found_date  FROM found_items p join users u on p.email = u.email  where approved= true');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error:"Error loading Products"});
    }
});

//loading lost items request
app.get("/api/lost_Items", async (req, res) => {
    try {
        const result = await db.query('SELECT u.name as username,p.name, p.description, p.contact, p.location, p.category, p.email, p.image, p.lost_date, p.lost_time  FROM lost_items p join users u on p.email = u.email  where approved= true');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error:"Error loading Products"});
    }
});
/////////   Admin Server for lost and found ////////

//loading loss requests for the admin
app.get('/api/lostitems/varifyList', async (req, res)=>{
  try {
        const result = await db.query('SELECT u.name as username,p.id,p.name, p.description, p.contact, p.location, p.category, p.email, p.image, p.lost_date, p.lost_time  FROM lost_items p join users u on p.email = u.email  where approved= false order by p.lost_date desc');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
})
//deleting the lost request by admin
app.post('/api/delete/admin/lostRequest', async (req, res)=>{
  try {
    const { id ,email } = req.body;

    const result = await db.query(
      "DELETE FROM lost_items WHERE id = $1 and email = $2 RETURNING *",
      [id,email]
    );
    res.status(200).send("Request deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
})
//approving the request by admin 
app.post('/api/approve/admin/lostRequest', async (req, res)=>{
    try {
    const { id ,email } = req.body;

    const result = await db.query(
      "update lost_items set approved = $1 where id = $2 and email = $3 ",
      [true,id,email]
    );
    res.status(200).send("Request Approved, will be added to list of lost items");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving product");
  }
})

///found requests---------------
//loading found requests for the admin
app.get('/api/founditems/varifyList', async (req, res)=>{
  try {
        const result = await db.query('SELECT u.name as username, p.id ,p.name, p.description, p.contact, p.location, p.category, p.email, p.image, p.found_date FROM found_items p join users u on p.email = u.email  where approved= false order by p.found_date desc');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
})

// approving the found item request
app.post('/api/approve/admin/foundRequest', async (req, res)=>{
    try {
    const { id,email } = req.body;

    const result = await db.query(
      "update found_items set approved = $1 where id = $2 and email = $3 ",
      [true,id,email]
    );
    res.status(200).send("Request Approved, will be added to list of lost items");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving product");
  }
})

//deleting the found request by admin
app.post('/api/delete/admin/foundRequest', async (req, res)=>{
  try {
    const { id ,email } = req.body;

    const result = await db.query(
      "DELETE FROM found_items WHERE id = $1 and email = $2 RETURNING *",
      [id,email]
    );
    res.status(200).send("Request deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
})



//////////// RENTAL SERVICES ////////////////////--------------------

app.post('/lendProduct',upload.single("image"), async (req,res)=>{
    const userEmail = req.session.userEmail;
    const itemName = req.body.itemName;
    const description = req.body.desc;
    const location = req.body.hostel;
    const contact = req.body.contact;
    const price = req.body.price;
    const category = req.body.category;

    const image = req.file?fs.readFileSync(req.file.path):null;

   try{
     const result = await db.query(' insert into rental_items (product_name , description, contact , hostel,category , email,image,price) values ($1,$2,$3,$4,$5,$6,$7,$8)',
      [itemName,description,contact,location , category,userEmail,image,price]
    );

    res.send(`
        <script>
            alert('Your product will be added to the rental store');
            window.location.href = 'rent.html'; 
        </script>
    `);

   }catch(err){
    console.log("error adding values", err);
   }

})

app.get('/api/AllRentalProducts', async (req, res)=>{

  try{
    const result = await db.query(' select u.name as username, r.product_id ,r.product_name, r.description, r.contact, r.hostel, r.category, r.email, r.image, r.price from rental_items r join users u on r.email = u.email where approved= true');
    res.json(result.rows);
  }
  catch(err){
    console.log("some error occured loading rental items", err);
  }
})

//users rental items
app.get("/api/rental/myProducts", async (req, res) => {
  const userEmail = req.session.userEmail;
    try {
        const result = await db.query('SELECT product_id ,product_name, description, contact, category,image, price  FROM rental_items  where email = $1 AND approved= $2;',[userEmail,true]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
});
//enabling delete option for perdonal rental items
app.post("/api/myrental/delete", async (req, res) => {
  const userEmail = req.session.userEmail;

  try {
    const { product_id } = req.body;

    const result = await db.query(
      "DELETE FROM rental_items WHERE product_id = $1 and email = $2 RETURNING *",
      [product_id,userEmail]
    );

    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

///AdMIN SIDE FOR RENTAL SERVICES //////////////////////////

//getting all the new requests for renting
app.get('/api/Products/rental/varifyList', async (req, res)=>{
  try {
        const result = await db.query('SELECT u.name,p.product_id,p.product_name, p.description, p.contact, p.hostel, p.category, p.email, p.image, p.price  FROM rental_items p join users u on p.email = u.email  where approved= false');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading Products");
    }
})
//deleting renting requests
app.post('/api/delete/admin/rental', async (req, res)=>{
  try {
    const { product_id,email } = req.body;

    const result = await db.query(
      "DELETE FROM rental_items WHERE product_id = $1 and email = $2 RETURNING *",
      [product_id,email]
    );
    res.status(200).send("Product deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
})

//approving the product by admin
app.post('/api/approve/admin/rental', async (req, res)=>{
    try {
    const { product_id,email } = req.body;

    const result = await db.query(
      "update rental_items set approved = $1 where product_id = $2 and email = $3 ",
      [true,product_id,email]
    );
    res.status(200).send("Product Approved for sale successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving product");
  }
})
///deleting the rental list from the admin side
app.post('/api/admin/rental/products/delete', async(req, res)=>{
  const { product_id}  = req.body;
  try{
    const result = await db.query("delete from rental_items where product_id = $1",[product_id])
    res.status(200).send("Product deleted successfully")
  }catch(err){
    console.log(err)
    res.status(500).send("Error deleting product");
  }
})

app.listen(port, () => {
    console.log("lidtning on port number ", port);
})
