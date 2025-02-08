// const cors = require("cors");
// const express = require("express");
// const bodyParser = require("body-parser");
// const authRoute = require("./api/auth");
// const healthCheck = require("./api/healthCheck");
// const clientRoute = require("./api/clients");
// const shareRoute = require("./api/share");
// const loginactRoute = require("./api/loginact");
// const errorMiddleware = require("./middlewares/errorMiddleware");
// const empRoute = require("./api/emp");
// const successStoriesRoute = require("./api/scs");
// const matchpair = require("./api/match");
// const emailHistoryList = require('./api/emailhistorylist');
// const app = express();
// const successStoryRoutes = require('./api/successtory')
// const clientRoutes = require('./api/successstoryseparatelist');
// const profilecompletion= require('./api/profilecompletioncalculation');
// const calculatesuccessstory= require('./api/calculate');

// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Custom-Header']
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
// app.use(bodyParser.json());

// const PORT = process.env.PORT || 8000;

// app.use("/", healthCheck);
// // app.use('/success-story', successStoryRoutes);

// app.use("/auth", authRoute);
// app.use("/calculate",profilecompletion);
// /* client info we can fetch with this route */
// app.use("/clients", clientRoute); 
// app.use("/api",matchpair);
// app.use("/emailhistorylist",emailHistoryList);
// app.use("/success-story",calculatesuccessstory);

// app.use("/api",clientRoutes);

// app.use("/emp", empRoute);

// /* employee will perform any CRUD Operation on successStories*/
// app.use("/scs", successStoriesRoute);

// /* shering */
// app.use("/share", shareRoute);

// app.use("/log-activity", loginactRoute);
// /* Error handling middleware */
// app.use(errorMiddleware);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const authRoute = require("./api/auth");
const healthCheck = require("./api/healthCheck");
const clientRoute = require("./api/clients");
const shareRoute = require("./api/share");
const loginactRoute = require("./api/loginact");
const errorMiddleware = require("./middlewares/errorMiddleware");
const empRoute = require("./api/emp");
const successStoriesRoute = require("./api/scs");
const matchpair = require("./api/match");
const emailHistoryList = require('./api/emailhistorylist');
const successStoryRoutes = require('./api/successtory');
const clientRoutes = require('./api/successstoryseparatelist');
const profilecompletion = require('./api/profilecompletioncalculation');
const calculatesuccessstory = require('./api/calculate');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Custom-Header']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

app.use("/", healthCheck);
app.use("/auth", authRoute);
app.use("/calculate", profilecompletion);
app.use("/clients", clientRoute);
app.use("/api", matchpair);
app.use("/emailhistorylist", emailHistoryList);
app.use("/success-story", calculatesuccessstory);
app.use("/api", clientRoutes);
app.use("/emp", empRoute);
app.use("/scs", successStoriesRoute);
app.use("/share", shareRoute);
app.use("/log-activity", loginactRoute);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
// Export the app as a handler for Vercel
module.exports = app;
