import express from 'express';
import { connectDb } from "./helper/conectDb.js";
import cors from 'cors';
import userRouter from './routes/user.js';
import familyRouter from './routes/family.js';
import taskRouter from './routes/task.js';
import  sendNoti  from './fcm_helper.js';

const app = express();
const port = 3000;

const corsOptions = {
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json())
//router
app.use('/user', userRouter)
app.use('/family', familyRouter)
app.use('/task', taskRouter)

app.get('', (req, res) => {
  res.send('Hello, World!');
});
app.post('', (req, res) => {
  sendNoti('dSmphpyHRDyAfBbQUGRZ-h:APA91bFVtKj8otbOHt_e_wdHTkZNVxcXKp-udX6Bwx-Forvnr2svgyeTeSsMUJRvsUf_hD6VBnVM3lYjFtHcJ2KpE8d05dU2yI3akWEWAqOcemsbXGRGirMyz0ddNy2lvf83TIlaWe9a',"Thông báo","Bạn nhận được....")
});
app.listen(port, () => {
  connectDb();
  console.log(`App listening at http://localhost:${port}`);
});


