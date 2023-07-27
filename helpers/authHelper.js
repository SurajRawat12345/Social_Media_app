const bcrypt = require('bcrypt');

const hashPassword = async(password) => {
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password , saltRounds);
        return hashedPassword;
    }
    catch(error){
        console.log("Something went Wrong")
    }
}
module.exports = hashPassword ;