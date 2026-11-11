import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

//middileware
app.use(express.json());
app.use(cors());

const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nejkceh.mongodb.net/`,
);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
}
const connectedClient = await connectToMongoDB();
const database = connectedClient.db("Hire-Loop");
const users = database.collection("user");
const jobs = database.collection("jobs");

//Normal Api for testing
app.get("/", (req, res) => {
  res.send("hire loop is runing");
});

app.get("/users", async (req, res) => {
  const cursor = users.find({});
  const result = await cursor.toArray();
  res.send(result);
});

//Jobs
app.post("/jobs", async (req, res) => {
  try {
    const job = req.body;

    const result = await jobs.insertOne({
      ...job,
      createdAt: new Date(),
      status: "active",
    });

    res.status(201).send({
      success: true,
      message: "Job created successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to create job",
    });
  }
});
// Get All Jobs
app.get("/jobs", async (req, res) => {
  try {
    const result = await jobs.find({}).sort({ createdAt: -1 }).toArray();

    res.status(200).send({
      success: true,
      jobs: result,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
});
// Update Job
app.put("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid job ID",
      });
    }

    const jobData = { ...req.body };
    delete jobData._id;

    const result = await jobs.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...jobData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Job updated successfully!",
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to update job",
    });
  }
});
// Delete Job
app.delete("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid job ID",
      });
    }

    const result = await jobs.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete job",
    });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`hire loop is running on port ${port}`);
});
