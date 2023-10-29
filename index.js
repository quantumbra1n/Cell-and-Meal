// Перезагружай сервер, когда изменяешь его код

const PORT = 3000;

// Подлючение модулей
let express = require('express');
let bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); // Подключим папку для доступа HTML-страницы к файлам js и css

// req - получает данные от клиента, res - отправляет данные клиенту
app.post("/arraysum", (req, res) => {
  
    // Retrieve array form post body
    let array = req.body.array;  
    console.log(array);
  
    // Calculate sum
    let sum = 0;
    for (var i = 0; i < array.length; i++) {
        if (isNaN(array[i])) {
            continue;
        }
        sum += array[i];
    }
    console.log(sum);
  
    // Return json response
    res.json({ result: sum });
});

// Подключение клиента и создание клетки на игровом поле
app.post("/enter", (req, res) => {
    // Получим данные от клиента
    let client_data = req.body;
    console.log(client_data);
    // Отправим свои данные клиенту
    res.json({ server: "You are entered" });
});

// Главная страница сайта
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/templates/index.html");
});

// Server listening to PORT 3000
// http://localhost:3000/
app.listen(PORT, () => {
    console.log(`Server is started: http://localhost:${PORT}`);
});
