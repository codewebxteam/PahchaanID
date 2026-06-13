import express from "express";
import { config } from "dotenv";
import ownerRoutes from "@/routes/owner.routes";
import managerRoutes from "@/routes/manager.routes";
import adminRoutes from "@/routes/admin.routes";
import superadminRoutes from "@/routes/superadmin.routes";
import districtRoutes from "@/routes/district.routes";
import cors from "cors";

const app = express();
config({ quiet: true });
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Server healthy!" });
});

app.use("/api/v1/owner", ownerRoutes);
app.use("/api/v1/manager", managerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/superadmin", superadminRoutes);
app.use("/api/v1/districts", districtRoutes);

app.listen(port, () => {
  console.log(`Server is running at Port ${port}`);
});
