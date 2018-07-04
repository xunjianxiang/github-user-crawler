'use strict';

const axios = require('axios');
const mongoose = require('mongoose');

// axios 配置
axios.defaults.headers.common.Authorization = 'token eb19c4c48321f1e5ffb6230c62270715e5536c4c';
axios.interceptors.response.use(function(response) {
  // Do something with response data
  const link = response.headers.link;
  if (link) {
    const array = link.split(',');
    const data = {};
    array.forEach(item => {
      const regex = /<(\S+)>;\s*rel="(\w+)"/;
      const result = item.match(regex);
      if (!result) return;
      data[result[2]] = result[1];
    });
    response.link = data;
  } else {
    response.link = {};
  }
  return response;
}, function(error) {
  return Promise.reject(error);
});

// mongoose 连接
const Crawler = require('./crawler');
mongoose.connect('mongodb://localhost:27017/github', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => {
  console.error('connection error:', error);
  process.exit();
});

// 爬取指定语言
Crawler([
  'Objective-C',
  'Swift',
]);
