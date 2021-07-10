"use strict";

const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 9956;
const app = express();


app.use(express.static('public'));
app.get('/', serveHome);

function serveHome(request, response, next){
  console.log("serving home: /public/html/home.html");
  response.redirect('/html/home.html');
}

function fileNotFound(request, response, next){
  response.type('text/plain');
  response.status('404');
  response.send("Cannot find: " + request.url);
}

app.use(express.static('public'));
app.get('/', serveHome);
app.use(fileNotFound);

app.listen(port, function () { console.log ("Started listening on port " + port);});
