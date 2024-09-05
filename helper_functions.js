
function generateToken() {

    const template = 'qwertyuiopasdfghjklzxcvbnm1234567890';
    let token = "";
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
            let rand = Math.floor(template.length * Math.random());
            token += template[rand];
        }

        if (i != 3) {

            token += "-";
        }

    }

    return token;
}

module.exports = { generateToken };
