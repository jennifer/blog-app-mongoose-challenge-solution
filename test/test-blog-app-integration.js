'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function seedBlogPosts() {
  console.info('seeding blog posts');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogPosts());
  }
  // this will return a promise
  return BlogPost.insertMany(seedData);
}

function generateBlogPosts() {
  return {
    author: {
    	firstName: faker.name.firstName(),
    	lastName: faker.name.lastName()
    },
    content: faker.lorem.sentence(),
    title: faker.lorem.words(),
    created: faker.date.past()
  };
}


function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog Post API resource', function() {
	before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPosts();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });


describe('GET endpoint', function() {

    it('should return all existing blog posts', function() {
    	let res;
      	return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.posts).to.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body.posts).to.have.length.of(count);
        });
    });

    it('should return blog posts with right fields', function() {
      let resBlogPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.posts).to.be.a('array');
          expect(res.body.posts).to.have.length.of.at.least(1);

          res.body.posts.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'id', 'author', 'content', 'title', 'created');
          });
          resBlogPost = res.body.posts[0];
          return BlogPost.findById(resBlogPost.id);
        })
        .then(function(post) {
          expect(resBlogPost.id).to.equal(post.id);
          expect(resBlogPost.author).to.equal(post.author);
          expect(redBlogPost.author).to.contain(post.author.firstName);
          expect(resBlogPost.content).to.equal(post.content);
          expect(resBlogPost.title).to.equal(post.title);
          expect(resBlogPost.created).to.equal(post.created)
        });
    });
  });


describe('POST endpoint', function() {
    it('should add a new blog post', function() {

      const newPost = generateBlogPosts();

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'author', 'content', 'title', 'created');
          expect(res.body.author).to.equal(newPost.author);
          expect(res.body.id).to.not.be.null;
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.created).to.equal(newPost.created);
          return BlogPost.findById(res.body.id);
        })
        .then(function(restaurant) {
          expect(post.id).to.equal(newPost.id);
          expect(post.author.firstName).to.equal(newPost.author.firstName);
          expect(post.author.lastName).to.equal(newPost.author.lastName);
          expect(post.content).to.equal(newPost.content);
          expect(post.title).to.equal(newPost.title);
          expect(post.created).to.equal(newPost.created)
        });
    });
  });


describe('PUT endpoint', function () {
    it('should update fields you send over', function () {
      const updateData = {
        title: 'cats cats cats',
        content: 'dogs dogs dogs',
        author: {
          firstName: 'foo',
          lastName: 'bar'
        }
      };

      return BlogPost
        .findOne()
        .then(post => {
          updateData.id = post.id;

          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return BlogPost.findById(updateData.id);
        })
        .then(post => {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
          post.author.firstName.should.equal(updateData.author.firstName);
          post.author.lastName.should.equal(updateData.author.lastName);
        });
    });
  });

  describe('DELETE endpoint', function () {
    it('should delete a post by id', function () {

      let post;

      return BlogPost
        .findOne()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(_post => {
          should.not.exist(_post);
        });
    });
  });
});