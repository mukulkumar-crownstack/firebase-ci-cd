const express = require("express");
const cors = require("cors");
const leadsRoutes = require("../routes/leads.routes");
const migrationRoutes = require("../routes/migration.routes");

require("dotenv").config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ type: "*/*" }));

app.use("/truora", leadsRoutes);
app.use("/migrations", migrationRoutes);

exports.cloudAPI_f = app;