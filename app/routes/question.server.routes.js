const questions = require("../controllers/question.server.controllers");

module.exports = function(app){
    app.route("/questions")
        .get(questions.getAllQuestions)
        .post(questions.createQuestion);

    app.route("/questions/:id")
        .get(questions.getQuestionById)
        .put(questions.updateQuestion)
        .delete(questions.deleteQuestion);
}
