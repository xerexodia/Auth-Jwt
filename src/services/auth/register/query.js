const query = {
  findUser: `SELECT Mail FROM [auth].[dbo].[User] where Mail = @Mail`,
  addUser: `INSERT INTO [auth].[dbo].[User] (Mail,Password) VALUES (@Mail,@Password);
            SELECT * FROM [auth].[dbo].[User] WHERE id = SCOPE_IDENTITY();`,
  addLogin: `INSERT INTO [auth].[dbo].[Login] (User_Id,RefreshToken) VALUES (@User_Id,@RefreshToken);
             SELECT * FROM [auth].[dbo].[Login] WHERE id = SCOPE_IDENTITY();`,
};

module.exports = query;
