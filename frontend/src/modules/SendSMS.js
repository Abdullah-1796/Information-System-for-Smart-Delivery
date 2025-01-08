import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import twilio from "twilio";

const port = 4003;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));