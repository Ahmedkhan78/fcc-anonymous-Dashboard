const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId;
let testThreadId2;
let testReplyId;

suite("Functional Tests", function () {
  this.timeout(8000);

  suite("Threads", function () {
    test("Creating 2 new threads", function (done) {
      chai
        .request(server)
        .post("/api/threads/test")
        .send({ text: "Thread one", delete_password: "pass" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          chai
            .request(server)
            .post("/api/threads/test")
            .send({ text: "Thread two", delete_password: "pass" })
            .end(function (err2, res2) {
              assert.equal(res2.status, 200);
              done();
            });
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each", function (done) {
      chai
        .request(server)
        .get("/api/threads/test")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.property(res.body[0], "_id");
          testThreadId = res.body[0]._id;
          testThreadId2 = res.body[1]._id;
          done();
        });
    });

    test("Deleting a thread with the incorrect password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: testThreadId, delete_password: "wrong" })
        .end(function (err, res) {
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("Deleting a thread with the correct password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: testThreadId2, delete_password: "pass" })
        .end(function (err, res) {
          assert.equal(res.text, "success");
          done();
        });
    });

    test("Reporting a thread", function (done) {
      chai
        .request(server)
        .put("/api/threads/test")
        .send({ thread_id: testThreadId })
        .end(function (err, res) {
          assert.equal(res.text, "reported");
          done();
        });
    });
  });

  suite("Replies", function () {
    test("Creating a new reply", function (done) {
      chai
        .request(server)
        .post("/api/replies/test")
        .send({
          thread_id: testThreadId,
          text: "This is a reply",
          delete_password: "pass",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Viewing a single thread with all replies", function (done) {
      chai
        .request(server)
        .get("/api/replies/test")
        .query({ thread_id: testThreadId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          testReplyId = res.body.replies[0]._id;
          done();
        });
    });

    test("Reporting a reply", function (done) {
      chai
        .request(server)
        .put("/api/replies/test")
        .send({ thread_id: testThreadId, reply_id: testReplyId })
        .end(function (err, res) {
          assert.equal(res.text, "reported");
          done();
        });
    });

    test("Deleting a reply with the incorrect password", function (done) {
      chai
        .request(server)
        .delete("/api/replies/test")
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: "wrong",
        })
        .end(function (err, res) {
          assert.equal(res.text, "incorrect password");
          done();
        });
    });

    test("Deleting a reply with the correct password", function (done) {
      chai
        .request(server)
        .delete("/api/replies/test")
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: "pass",
        })
        .end(function (err, res) {
          assert.equal(res.text, "success");
          done();
        });
    });
  });
});
