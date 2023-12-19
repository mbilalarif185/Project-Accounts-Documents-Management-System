const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const session = require("express-session");
const app = express();
const PORT = 3000;
const pgp = require("pg-promise")();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Project",
  password: "8292",
  port: 5432,
});

app.set("view engine", "pug");
app.use(express.static("public"));
app.use("/static", express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  user = req.session.user;
  //console.log(user);
  if (user) {
    res.redirect('/')
    // req.session.userId = user.id;
    console.log(user.role);
    if (user.role.toLowerCase().trim() === "pi") {
      req.session.user = user;
      let userId = user.id;
      //console.log(userId)

      res.render("Pi_dashboard", { user: user });
    } else if (user.role.toLowerCase().trim() === "accountant") {
      req.session.user = user;
      res.render("account_dashboard", { user: user });
    } else if (user.role.toLowerCase().trim() === "audit") {
      req.session.user = user;
      res.render("audit_dashboard", { user: user });
    } else {
      res.redirect("signup");
    }
  } else {
    res.render("login");
  }
});


app.post("/loginAction", async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM login WHERE email = $1 AND password = $2";
  const values = [email, password];

  try {
    const result = await pool.query(query, values);
    const user = result.rows[0];

    if (user) {
      req.session.userId = user.id;
      if (user.role.toLowerCase().trim() === "pi") {
        req.session.user = user;
        let userId = user.id;

        res.render("Pi_dashboard", { user: user });
      } else if (user.role.toLowerCase().trim() === "accountant") {
        req.session.user = user;
        res.render("account_dashboard", { user: user });
      } else if (user.role.toLowerCase().trim() === "audit") {
        req.session.user = user;
        res.render("audit_dashboard", { user: user });
      } else {
        res.redirect("signup");
      }
    } else {
      res.render("login", {
      error: "Login Credentials are wrong.",
    });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/project", async (req, res) => {
  user = req.session.user;
  if (user) {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    res.render("projectdetails", { result: result });
  } else {
    res.redirect("/");
  }
});
app.get("/view_order", async (req, res) => {
  user = req.session.user;
  if (user) {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    res.render("acc_supplier_order", { projects: result.rows });
  } else {
    res.redirect("/");
  }
});
// view Payment Document
app.get("/view_payment", async (req, res) => {
  user = req.session.user;
  if (user) {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    res.render("audit_payment_document", { projects: result.rows });
  } else {
    res.redirect("/");
  }
});

app.get("/main", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  const selectQuery = `SELECT * FROM projects WHERE login_id = $1`;
  const result = await pool.query(selectQuery, [login_id]);

  res.render("main", { user, projects: result.rows });
});

app.get("/supply_order", async (req, res) => {
 
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  let pid = req.query.pid;
  try {
    const selectQuery = `SELECT * FROM supplier WHERE pid = $1`;
    const result = await pool.query(selectQuery, [pid]);
    const selectQuery1 = `SELECT * FROM projects WHERE pid = $1`;
    const result1 = await pool.query(selectQuery1, [pid]);

    res.render("supply_order", {
      user,
      projects: result.rows[0],
      project: result1.rows[0],
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
///grant-org
app.get("/grant_org", async (req, res) => {
  user = req.session.user;
  if (user) {
    res.render("g_organization");
  } else {
    res.redirect("/");
  }
});

/// View Projects
app.get("/view_projects", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  const selectQuery = "SELECT * FROM projects WHERE login_id = $1";
  const result = await pool.query(selectQuery,[login_id]);
  res.render("display_projects", { user, projects: result.rows });
});
///Add Quotation
app.get("/add_quotation", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  const selectQuery = "SELECT * FROM projects WHERE login_id = $1";
  const result = await pool.query(selectQuery,[login_id]);
  res.render("quotation_projects", { user, projects: result.rows });
});
/// Account View Projects
app.get("/account_view_projects", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  const selectQuery = "SELECT * FROM projects";
  const result = await pool.query(selectQuery);
  res.render("account_display_projects", { user, projects: result.rows });
});
///Payment Main
app.get("/payment_main", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  const selectQuery = `SELECT * FROM projects WHERE login_id = $1`;
  const result = await pool.query(selectQuery, [login_id]);
  res.render("payment_main", { user, projects: result.rows });
});
////Payment Document
app.get("/payment_document", async (req, res) => {
  
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  let pid = req.query.pid;
  try {
    const selectQuery1 = `SELECT * FROM projects WHERE pid = $1`;
    const result1 = await pool.query(selectQuery1, [pid]);
    const selectQuery2 = `SELECT * FROM travel WHERE pid = $1`;
    const result2 = await pool.query(selectQuery2, [pid]);
    const selectQuery3 = `SELECT * FROM services WHERE pid = $1`;
    const result3 = await pool.query(selectQuery3, [pid]);
    const selectQuery4 = `SELECT * FROM person WHERE pid = $1`;
    const result4 = await pool.query(selectQuery4, [pid]);
    const selectQuery5 = `SELECT * FROM equipments WHERE pid = $1`;
    const result5 = await pool.query(selectQuery5, [pid]);

    res.render("payment_document", {
      user,
      project: result1.rows[0],
      travel: result2.rows,
      services: result3.rows,
      Person: result4.rows,
      equipments: result5.rows,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
////Audit_Payment Document
app.get("/audit_payment_document", async (req, res) => {
  //console.log("IN Payment Document");
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  let pid = req.query.pid;
  try {
    const selectQuery1 = `SELECT * FROM projects WHERE pid = $1`;
    const result1 = await pool.query(selectQuery1, [pid]);
    const selectQuery2 = `SELECT * FROM travel WHERE pid = $1`;
    const result2 = await pool.query(selectQuery2, [pid]);
    const selectQuery3 = `SELECT * FROM services WHERE pid = $1`;
    const result3 = await pool.query(selectQuery3, [pid]);
    const selectQuery4 = `SELECT * FROM person WHERE pid = $1`;
    const result4 = await pool.query(selectQuery4, [pid]);
    const selectQuery5 = `SELECT * FROM equipments WHERE pid = $1`;
    const result5 = await pool.query(selectQuery5, [pid]);
    let id =result1.rows[0].login_id
   
    const selectQuery6 = `SELECT * FROM login WHERE id = $1`;
    const result6 = await pool.query(selectQuery6, [id]);
   
    res.render("payment_document", {
      user:result6.rows[0],
      project: result1.rows[0],
      travel: result2.rows,
      services: result3.rows,
      Person: result4.rows,
      equipments: result5.rows,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
////Show Projects
app.get("/account_showprojects", async (req, res) => {
  
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  
  let pid = req.query.pid;
  try {
    const selectQuery1 = `SELECT * FROM projects WHERE pid = $1`;
    const result1 = await pool.query(selectQuery1, [pid]);
    const selectQuery2 = `SELECT * FROM travel WHERE pid = $1`;
    const result2 = await pool.query(selectQuery2, [pid]);
    const selectQuery3 = `SELECT * FROM services WHERE pid = $1`;
    const result3 = await pool.query(selectQuery3, [pid]);
    const selectQuery4 = `SELECT * FROM person WHERE pid = $1`;
    const result4 = await pool.query(selectQuery4, [pid]);
    const selectQuery5 = `SELECT * FROM equipments WHERE pid = $1`;
    const result5 = await pool.query(selectQuery5, [pid]);
    let id =result1.rows[0].login_id
    const selectQuery6 = `SELECT * FROM login WHERE id = $1`;
    const result6 = await pool.query(selectQuery6, [id]);
    res.render("view_project", {
      user:result6.rows[0],
      project: result1.rows[0],
      travel: result2.rows,
      services: result3.rows,
      Person: result4.rows,
      equipments: result5.rows,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/showprojects", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  let pid = req.query.pid;
  try {
    const selectQuery1 = `SELECT * FROM projects WHERE pid = $1`;
    const result1 = await pool.query(selectQuery1, [pid]);
    const selectQuery2 = `SELECT * FROM travel WHERE pid = $1`;
    const result2 = await pool.query(selectQuery2, [pid]);
    const selectQuery3 = `SELECT * FROM services WHERE pid = $1`;
    const result3 = await pool.query(selectQuery3, [pid]);
    const selectQuery4 = `SELECT * FROM person WHERE pid = $1`;
    const result4 = await pool.query(selectQuery4, [pid]);
    const selectQuery5 = `SELECT * FROM equipments WHERE pid = $1`;
    const result5 = await pool.query(selectQuery5, [pid]);
    console.log(result1.rows[0].login_id);
    res.render("view_project", {
      user,
      project: result1.rows[0],
      travel: result2.rows,
      services: result3.rows,
      Person: result4.rows,
      equipments: result5.rows,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/signup", (req, res) => {
  user = req.session.user;
  if (user) {
    res.redirect("/");
  } else res.render("signup");
});

app.post("/signupAction", async (req, res) => {
  const { name, email, password, role } = req.body;
  const checkQuery = "SELECT * FROM login WHERE email = $1";
  const checkValues = [email];

  try {
    const result = await pool.query(checkQuery, checkValues);

    if (result.rows.length > 0) {
      res.render("signup", {
        error: "Account already exists.",
      });
    } else {
      // Email doesn't exist, proceed with the signup
      const insertQuery =
        "INSERT INTO login (name,email, password, role) VALUES ($1, $2, $3,$4)";
      const insertValues = [name, email, password, role];

      await pool.query(insertQuery, insertValues);
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/grant_org", async (req, res) => {
  
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  //console.log(login_id)
  const { name, address, contact_person, contact_email } = req.body;
  //console.log(req.body);
  try {
    const insertQuery =
      "INSERT INTO grantorganization(name,address,contact_person,contact_email,login_id) VALUES ($1, $2, $3, $4,$5)";
    const insertValues = [
      name,
      address,
      contact_person,
      contact_email,
      login_id,
    ];

    await pool.query(insertQuery, insertValues);
    res.render("dashboard");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/submitproject", async (req, res) => {
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  //console.log(login_id)
  const { title, description, startdate, enddate, totalbudget } = req.body;

  try {
    const selectQuery = "SELECT * FROM grantorganization";
    const result = await pool.query(selectQuery);
    let lastEnteredId = 0;
    if (result.rows.length > 0) {
      let lastid = result.rows[0].gid;
      for (let i = 1; i < result.rows.length; i++) {
        if (result.rows[i].gid > lastid) {
          lastid = result.rows[i].gid;
        }
      }
      lastEnteredId = lastid;
    }

    console.log(lastEnteredId);
    const insertQuery =
      "INSERT INTO projects (title, description, startdate,enddate,totalbudget,gid,login_id) VALUES ($1, $2, $3, $4,$5,$6,$7)";
    const insertValues = [
      title,
      description,
      startdate,
      enddate,
      totalbudget,
      lastEnteredId,
      login_id,
    ];

    await pool.query(insertQuery, insertValues);
    res.render("travel");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/travel", async (req, res) => {
  console.log("in tRAVEL/person");
  // console.log("body: ", req.body);
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  //console.log(login_id)
  try {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    let lastEnteredId = 0;
    if (result.rows.length > 0) {
      let lastid = result.rows[0].pid;
      for (let i = 1; i < result.rows.length; i++) {
        if (result.rows[i].gid > lastid) {
          lastid = result.rows[i].pid;
        }
      }
      lastEnteredId = lastid;
    }

    //console.log("lastEnteredId",lastEnteredId);

    const persons = Array.isArray(req.body.startfrom)
      ? req.body.startfrom.map((_, i) => ({
          startfrom: req.body.startfrom[i],
          startdate: req.body.startdate[i],
          starttime: req.body.starttime[i],
          endto: req.body.endto[i],
          enddate: req.body.enddate[i],
          endtime: req.body.endtime[i],
          cost: req.body.cost[i],
          taxtype: req.body.taxtype[i],
        }))
      : [req.body];
    //console.log(persons);

    for (const person of persons) {
      const {
        startfrom,
        startdate,
        starttime,
        endto,
        enddate,
        endtime,
        cost,
        taxtype,
      } = person;

      // console.log(
      //   `Person ${1}: Name - ${startfrom}, Contact - ${startdate}, Designation - ${starttime}, Experience - ${starttime}, Monthly Payment - ${endto}, Tax Type - ${enddate},Tax Type - ${endtime},Tax Type - ${cost},Tax Type - ${taxtype}`
      // );
      const insertQuery =
        "INSERT INTO travel (startfrom,startdate,starttime,endto,enddate,endtime,cost,taxtype,pid,login_id) VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10)";
      const insertValues = [
        startfrom,
        startdate,
        starttime,
        endto,
        enddate,
        endtime,
        cost,
        taxtype,
        lastEnteredId,
        login_id,
      ];
      await pool.query(insertQuery, insertValues);
    }
    res.render("equipment");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/equipment", async (req, res) => {
  //const { title,purchase_date,specification,quantity,cost,taxtype} = req.body;
  console.log("in Equipment");
  //console.log('body: ',req.body)
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  console.log(login_id);
  try {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    let lastEnteredId = 0;
    if (result.rows.length > 0) {
      let lastid = result.rows[0].pid;
      for (let i = 1; i < result.rows.length; i++) {
        if (result.rows[i].gid > lastid) {
          lastid = result.rows[i].pid;
        }
      }
      lastEnteredId = lastid;
    }

    console.log(lastEnteredId);

    const persons = Array.isArray(req.body.title)
      ? req.body.title.map((_, i) => ({
          title: req.body.title[i],
          purchase_date: req.body.purchase_date[i],
          specification: req.body.specification[i],
          quantity: req.body.quantity[i],
          cost: req.body.cost[i],
          taxtype: req.body.taxtype[i],
        }))
      : [req.body];
    //console.log(persons);

    for (const person of persons) {
      const { title, purchase_date, specification, quantity, cost, taxtype } =
        person;
      var i = 1;
      // console.log(
      //   `Person ${
      //     i + 1
      //   }: Name - ${title}, Contact - ${purchase_date}, Designation - ${specification}, Experience - ${quantity}, Monthly Payment - ${cost}, Tax Type - ${taxtype}`
      // );
      const insertQuery =
        "INSERT INTO equipments (title,purchase_date,specification,quantity,cost,taxtype,pid,login_id) VALUES ($1, $2, $3, $4,$5,$6,$7,$8)";
      const insertValues = [
        title,
        purchase_date,
        specification,
        quantity,
        cost,
        taxtype,
        lastEnteredId,
        login_id,
      ];
      await pool.query(insertQuery, insertValues);
    }

    res.render("services");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/services", async (req, res) => {
  //const { title,description,cost,taxtype} = req.body;
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  //console.log(login_id)

  try {
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    let lastEnteredId = 0;
    if (result.rows.length > 0) {
      let lastid = result.rows[0].pid;
      for (let i = 1; i < result.rows.length; i++) {
        if (result.rows[i].gid > lastid) {
          lastid = result.rows[i].pid;
        }
      }
      lastEnteredId = lastid;
    }
    const persons = Array.isArray(req.body.title)
      ? req.body.title.map((_, i) => ({
          title: req.body.title[i],
          description: req.body.description[i],
          cost: req.body.cost[i],
          taxtype: req.body.taxtype[i],
        }))
      : [req.body];
    //console.log(persons);

    for (const person of persons) {
      const { title, description, cost, taxtype } = person;
      // var i = 1;
      // console.log(
      //   `Person ${
      //     i + 1
      //   }: Name - ${title}, Contact - ${description}, Designation - ${cost}, Experience - ${taxtype}`
      // );
      const insertQuery =
        "INSERT INTO services (title,description,cost,taxtype,pid,login_id) VALUES ($1, $2, $3, $4,$5,$6)";
      const insertValues = [
        title,
        description,
        cost,
        taxtype,
        lastEnteredId,
        login_id,
      ];

      await pool.query(insertQuery, insertValues);
    }

    // console.log(lastEnteredId)

    res.render("person");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/person", async (req, res) => {
  console.log("in check/person");
  //console.log("body: ", req.body);
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  //onsole.log(login_id)
  try {
    let lastTid = 0;
    let Eid = 0;
    const selectQuery = "SELECT * FROM projects";
    const result = await pool.query(selectQuery);
    let lastEnteredId = 0;
    if (result.rows.length > 0) {
      let lastid = result.rows[0].pid;
      for (let i = 1; i < result.rows.length; i++) {
        if (result.rows[i].gid > lastid) {
          lastid = result.rows[i].pid;
        }
      }
      lastEnteredId = lastid;
    }
    const selecttQuery = "SELECT * FROM travel";
    const tresult = await pool.query(selecttQuery);

    if (tresult.rows.length > 0) {
      let lasttid = tresult.rows[0].tid;
      for (let i = 1; i < tresult.rows.length; i++) {
        if (tresult.rows[i].tid > lasttid) {
          lasttid = tresult.rows[i].tid;
        }
      }
      lastTId = lasttid;
    }

    const selecteQuery = "SELECT * FROM equipments";
    const eresult = await pool.query(selecteQuery);

    if (eresult.rows.length > 0) {
      let lasteid = eresult.rows[0].eid;
      for (let i = 1; i < eresult.rows.length; i++) {
        if (eresult.rows[i].eid > lasteid) {
          lasteid = eresult.rows[i].eid;
        }
      }
      Eid = lasteid;
    }
    
    const persons = Array.isArray(req.body.name)
      ? req.body.name.map((_, i) => ({
          name: req.body.name[i],
          contact: req.body.contact[i],
          designation: req.body.designation[i],
          experience: req.body.experience[i],
          monthly_payment: req.body.monthly_payment[i],
          taxtype: req.body.taxtype[i],
        }))
      : [req.body];

    for (const person of persons) {
      const {
        name,
        contact,
        designation,
        experience,
        monthly_payment,
        taxtype,
      } = person;
      var i = 1;
      
      const insertQuery =
        "INSERT INTO person (name,contact,designation,experience,monthly_payment,taxtype,pid,tid,eid,login_id) VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10)";
      const insertValues = [
        name,
        contact,
        designation,
        experience,
        monthly_payment,
        taxtype,
        lastEnteredId,
        lastTId,
        Eid,
        login_id,
      ];
      await pool.query(insertQuery, insertValues);
    }
    res.render("Pi_dashboard");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/quotation',async (req,res)=>{
  user = req.session.user;
  let pid=req.query.pid;
  
  if (user) {
    res.render("quotation",{pid:pid});
  } else {
    res.redirect("/");
  }

});
app.post("/quotation", async (req, res) => {
  
  user = req.session.user;
  let login_id = 0;
  login_id = user.id;
  let pid = req.query.pid;
  console.log("PID:",pid)
  try {
    
    const persons = Array.isArray(req.body.title)
      ? req.body.title.map((_, i) => ({
          title: req.body.title[i],
          description: req.body.description[i],
          cost: parseFloat(req.body.cost[i]),
          supply_date: req.body.supply_date[i],
          supply_type: req.body.supply_type[i],
          taxtype: req.body.taxtype[i],
        }))
      : [req.body];
    let minCostPerson = null;
    let minCost = Infinity;
    for (const person of persons) {
      const { cost } = person;
      if (cost < minCost) {
        minCost = cost;
        minCostPerson = person;
      }
    }
    const { title, description, cost, supply_date, supply_type, taxtype } =
      minCostPerson;
    
    const insertQuery =
      "INSERT INTO supplier (title,description,cost,supply_date,supply_type,taxtype,pid,login_id) VALUES ($1, $2, $3, $4,$5,$6,$7,$8)";
    const insertValues = [
      title,
      description,
      cost,
      supply_date,
      supply_type,
      taxtype,
      pid,
      login_id,
    ];
    await pool.query(insertQuery, insertValues);
    res.render("Pi_dashboard");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
