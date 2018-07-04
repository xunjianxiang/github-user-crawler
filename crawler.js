'use strict';

const axios = require('axios');
const { User } = require('./model');

class Crawler {
  async start(language) {
    console.log('start', language);
    await this.getRepositories(`https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc`);
  }

  async getRepositories(url) {
    if (!url) return;
    console.time(`getRepositories: ${url}`);
    const { data, link } = await this.request(url);
    console.timeEnd(`getRepositories: ${url}`);
    const len = data.items.length;
    for (let index = 0; index < len; index++) {
      const repo = data.items[index];
      await this.getContributors(repo.contributors_url);
    }
    await this.getRepositories(link.next);
  }

  async getContributors(url) {
    if (!url) return;
    console.time(`getContributors: ${url}`);
    const { data, link } = await this.request(url);
    console.timeEnd(`getContributors: ${url}`);
    for (let index = 0; index < 1; index++) {
      const contributor = data[index];
      await this.getUserInfo(contributor.url);
    }
    await this.getContributors(link.next);
  }

  async getUserInfo(url) {
    console.time(`getUserInfo: ${url}`);
    const { data } = await this.request(url);
    console.timeEnd(`getUserInfo: ${url}`);
    const user = new User(data);
    await user.save().catch(console.error);
  }

  request(url) {
    return axios.get(url).catch(console.error);
  }
}

module.exports = async function(languages) {
  const crawler = new Crawler();
  const len = languages.length;
  for (let index = 0; index < len; index++) {
    const language = languages[index];
    await crawler.start(language);
  }
};
