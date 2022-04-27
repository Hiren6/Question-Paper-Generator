const express = require('express');
const router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const bcrypt = require('bcrypt');

router.get('/chapter/:c_name', async (req, res) => {

    const {c_name} = req.params;

    const q_list = `select q_stmt from Question
    join Chapter on Question.chapter_id
    Chapter.chapter_id
    where chapter_name = $1`;

    try {
        const questions = await client.query(q_list,[c_name]);

        res.render('get_questions', {
            chapter_name : c_name,
            questions : questions.rows
        }); 
    }

    catch (e) { console.error(e.message); }

});