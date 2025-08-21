import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import pg from 'pg'
import multer from 'multer';
import fs from 'fs'
import bcrypt from "bcrypt";


const app = express()
const port = 3000;


const upload = multer({ dest: 'uploads/' })
const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "complaints")));
app.use(express.static(path.join(__dirname, "public")));

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'College_Site',
    password: 'ss22',
    port: 5432,
});

db.connect();





app.get("/", (req, res)=>{
    res.sendFile(__dirname +'/index.html')
})

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/complaints/index.html");
// });

//Login and resister logic



app.post("/register", async (req, res) => {
  const { Name, Email, password, role, college_id } = req.body;
  console.log(Email, Name, role,password)

  try {
    if (!password) {
      return res.status(400).send("Enter a valid password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password, user_type, college_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [Name, Email, hashedPassword, role, college_id]
    );

    res.redirect("/");
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).send("Email already exists");
    } else {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
});



app.post("/login", async (req, res) => {
  const { Email, userPassword } = req.body;
  console.log(Email, userPassword)

  try {
    const result = await db.query("SELECT password FROM users WHERE email = $1", [Email]);

    if (result.rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const hashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(userPassword, hashedPassword);

    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    
    res.json({ email: Email });


  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});




app.get("/api/complaints", async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM complaints');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading complaints");
    }
});



app.post("/raise", upload.single("image"), async (req, res) => {
    // Create dictionary (JS object) from form

    const title = req.body.title
    const desc = req.body.desc
    const name = req.body.name
    const roll = req.body.roll
    const email = req.body.email
    const hostel = req.body.hostel
    const type = req.body.type
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into complaints (title , description , name ,roll_no ,email ,hostel ,complaint_type , image_name , image) values ($1, $2,$3,$4,$5,$6,$7,$8, $9) ;',
        [title, desc,name , roll , email , hostel , type , image_name , image_data]
    );
    res.send(`
        <script>
            alert('complaint registerd successfully!');
            window.location.href = '/'; 
        </script>
    `);
});

app.listen(port, () => {
    console.log("lidtning on port number ", port);
})
