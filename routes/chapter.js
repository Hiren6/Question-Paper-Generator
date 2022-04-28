import { Router } from 'express';
const router = Router();
import User from "../models/user";
import passport from 'passport';
import bcrypt from 'bcrypt';

router.get('/chapter/:c_id', async (req, res) => {

    const {c_id} = req.params;

    const q_list = `select q_stmt from Question
    where chapter_id = $1`;

    try {
        const questions = await client.query(q_list,[c_id]);

        res.render('get_questions', {
            chapter_id : c_id,
            questions : questions.rows
        }); 
    }

    catch (e) { console.error(e.message); }

});

router.post('/chapter/:c_id/add', (req, res) => {
    const {question_id,q_stmt,q_type,difficulty,chapter_id} = req.body;
    let errors = [];
    if(!question_id || !q_stmt || !q_type || !difficulty){
        errors.push({ msg: "Please fill in all the fields" })
    }
    if(errors.length>0){
        res.render('err', {
            errors: errors,
            question_id : question_id,
            q_stmt : q_stmt,
            q_type : q_type,
            difficulty : difficulty,
            chapter_id : chapter_id
        });
    }
    q_add = `insert into Question
    Values($1,$2,$3,$4,$5)`;

    const insert_ques = await client.query(q_add,[question_id,q_stmt,q_type,difficulty,chapter_id]);

    res.redirect('/chapter/:c_id');

}); 


