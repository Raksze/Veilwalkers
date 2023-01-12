const express = require('express');
const app = express();
const mysql = require('mysql2');
const hbs = require('hbs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

//configuración del puerto
const PORT = process.env.PORT || 9000;

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, '/public')));

//HBS motor de plantillas
app.set('view engine', 'hbs');

//Partials motor de plantillas
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

//Conexion a la DB
const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DBPORT
})

conexion.connect((error) =>{
    if(error) throw error;
    console.log('Conectado a la base de datos: ' + process.env.DATABASE);
})

//Rutas de la aplicación
//landing page
app.get('/', (req, res) =>{
    res.render('index',{
        titulo: 'index'
    })
})

//Pagina de subscripción a la beta
app.get('/beta', (req,res) => {
    res.render('beta',{
        titulo: 'Beta'
    })
})

//Pagina de agradecimiento por newsletter
app.get('/email', (req,res) => {
    res.render('thankyou',{
        titulo: 'Suscrito al newsletter'
    })
})

//Pagina de agradecimiento por beta
app.get('/betasub', (req,res) => {
    res.render('betasub',{
        titulo: 'Suscrito a la beta'
    })
})

app.post('/email', (req, res) =>{
const nombre = req.body.nombre;
const email = req.body.email;
console.log("los datos son: " + nombre + ", " + email);

//función de mail
async function envioMail(){
    //configurar cuenta de envío
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.email,
            pass: process.env.emailpassword
        },
        tls: {rejectUnauthorized: false}
    });
    //envío del mail
    let info = await transporter.sendMail({
        from: process.env.email,
        to: `${email}`,
        subject: "Gracias por suscribirte a nuestro proyecto",
        html: `Muchas gracias por suscribirte a Veilwalkers <br>
        Recibiras noticias relacionadas al desarrollo del proyecto en esta dirección de email <br>
        Para cancelar tu suscripción responde a esta dirección con un mail con el asunto "BAJA"`
    })
}

let datos = {
    nombre: nombre,
    email: email
}

let sql = "insert into email set ?"

conexion.query(sql, datos,  function(error){
    if (error) throw error;
    console.log('1 registro insertado');
    envioMail().catch(console.error);
})

res.render('thankyou');
})

app.post('/betasub', (req, res) =>{
    const nombre = req.body.nombre;
    const email = req.body.email;
    console.log("los datos son: " + nombre + ", " + email);
    
    //función de mail
    async function envioMail(){
        //configurar cuenta de envío
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.email,
                pass: process.env.emailpassword
            },
            tls: {rejectUnauthorized: false}
        });
        //envío del mail
        let info = await transporter.sendMail({
            from: process.env.email,
            to: `${email}`,
            subject: "Gracias por suscribirte a nuestra beta",
            html: `Muchas gracias por suscribirte a la beta de Veilwalkers <br>
            Proximamente recibirás un mail con las instrucciones de acceso a nuestra beta <br>
            Para cancelar tu suscripción responde a esta dirección con un mail con el asunto "BAJA"`
        })
    }
    
    let datos = {
        nombre: nombre,
        email: email
    }
    
    let sql = "insert into beta set ?"
    
    conexion.query(sql, datos,  function(error){
        if (error) throw error;
        console.log('1 registro insertado');
        envioMail().catch(console.error);
    })
    
    res.render('betasub');
    })

//Servidor a la escucha de peticiones
app.listen(PORT, () => {
    console.log('Servidor trabajando en el puerto: ' + PORT)
})
