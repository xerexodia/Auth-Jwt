const query = {
  findUser: `
        select * from [auth].[dbo].[User] where Mail = @Mail;
    `,
  findLogin:`
    select * from [auth].[dbo].[Login] where User_Id = @User_Id;
  `
};

module.exports = query;
