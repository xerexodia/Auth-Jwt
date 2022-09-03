const query = {
    findUser:`
        select * from [auth].[dbo].[Login] where RefreshToken = @refreshToken; 
    `
}

module.exports = query;